/**
 * CRO OS — Control Extractor
 *
 * Uses Playwright to fully render a live client page and save it as a
 * self-contained control.html. This is the accurate "before" state for
 * any test — reflecting the real rendered DOM, not raw HTML source.
 *
 * What it does:
 *   1. Renders the page in a headless browser (handles JS-rendered sites)
 *   2. Waits for network idle + JS to settle
 *   3. Inlines all external CSS so the file is standalone
 *   4. Extracts any active VWO test code from the page
 *   5. Strips analytics/tag scripts (GA4, GTM, VWO SmartCode) from the saved file
 *   6. Saves to clients/[client]/controls/[page-slug].html
 *   7. Saves VWO test snapshot to clients/[client]/controls/[page-slug]-vwo-snapshot.json
 *
 * Usage:
 *   node tools/extract-control.js --client powerleague --url https://www.powerleague.com/football-birthday-party
 *   node tools/extract-control.js --client koalify --url https://koalify.com.au
 *
 * Or via GitHub Actions workflow: extract-control.yml
 */

const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');
const https = require('https');
const http  = require('http');
const url   = require('url');

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const CLIENT   = getArg('--client') || process.env.CLIENT;
const PAGE_URL = getArg('--url')    || process.env.URL;
const VIEWPORT = getArg('--viewport') || 'desktop'; // desktop | mobile

if (!CLIENT || !PAGE_URL) {
  console.error('Usage: node extract-control.js --client <slug> --url <url> [--viewport desktop|mobile]');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .replace(/^https?:\/\/[^/]+/, '')  // remove origin
    .replace(/\/$/, '')                 // trailing slash
    .replace(/^\//, '')                 // leading slash
    .replace(/[^a-zA-Z0-9-]/g, '-')    // non-alphanumeric to dash
    .replace(/-+/g, '-')               // collapse dashes
    .replace(/^-|-$/g, '')             // trim dashes
    || 'homepage';
}

function fetchText(targetUrl) {
  return new Promise((resolve) => {
    let parsed;
    try { parsed = new url.URL(targetUrl); } catch(e) { return resolve(''); }
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.get({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': 'Mozilla/5.0 CRO-OS-Control-Extractor/1.0' },
      timeout: 10000
    }, (res) => {
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location) {
        return resolve(fetchText(res.headers.location));
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

// Fetch and inline a stylesheet URL
async function fetchCSS(cssUrl, baseUrl) {
  const text = await fetchText(cssUrl);
  if (!text) return `/* Could not fetch: ${cssUrl} */`;
  // Fix relative URLs inside the CSS to absolute
  const base = new url.URL(cssUrl);
  return text.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, src) => {
    if (src.startsWith('data:') || src.startsWith('http')) return match;
    try {
      const abs = new url.URL(src, base).href;
      return `url('${abs}')`;
    } catch(e) { return match; }
  });
}

// ── VWO snapshot extraction ───────────────────────────────────────────────────

async function extractVWOSnapshot(page) {
  try {
    const snapshot = await page.evaluate(() => {
      const result = {
        vwo_present: false,
        smart_code_version: null,
        account_id: null,
        active_tests: [],
        variation_applied: null,
        raw_window_vwo: null
      };

      // Check VWO SmartCode
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const vwoScript = scripts.find(s => s.src.includes('dev.visualwebsiteoptimizer.com') || s.src.includes('cdn.vwo.com'));
      if (vwoScript) {
        result.vwo_present = true;
        const match = vwoScript.src.match(/dev\.visualwebsiteoptimizer\.com\/j\.php\?a=(\d+)/);
        if (match) result.account_id = match[1];
      }

      // Check window._vwo_code
      if (window._vwo_code) {
        result.vwo_present = true;
        result.raw_window_vwo = {
          version: window._vwo_code.version || null,
          account_id: window._vwo_code.account_id || null,
        };
      }

      // Check VWO experiment data
      if (window.VWO) {
        result.vwo_present = true;
        try {
          const data = window.VWO.data || window.VWO._data || {};
          result.raw_window_vwo = JSON.parse(JSON.stringify(data));
        } catch(e) {}
      }

      // Check _vis_opt_experiments
      if (window._vis_opt_experiments) {
        result.active_tests = Object.entries(window._vis_opt_experiments).map(([id, exp]) => ({
          id,
          name: exp.name || null,
          status: exp.status || null,
          variation: exp.combination_chosen || null,
        }));
      }

      // Check for VWO variation classes on body/html
      const bodyClasses = document.body.className;
      const vwoClasses = bodyClasses.split(' ').filter(c => c.match(/^vwo_|^vis_opt_/));
      if (vwoClasses.length) result.variation_applied = vwoClasses;

      // Check inline VWO scripts for test IDs
      const inlineScripts = Array.from(document.querySelectorAll('script:not([src])'))
        .map(s => s.textContent)
        .filter(t => t.includes('_vis_opt') || t.includes('VWO') || t.includes('vwo'));

      if (inlineScripts.length) {
        result.vwo_inline_scripts_found = inlineScripts.length;
        // Try to extract test IDs
        const testIds = new Set();
        inlineScripts.forEach(s => {
          const matches = s.matchAll(/test_id['":\s]+(\d+)/g);
          for (const m of matches) testIds.add(m[1]);
        });
        if (testIds.size) result.test_ids_found = [...testIds];
      }

      return result;
    });

    return snapshot;
  } catch(e) {
    return { error: e.message, vwo_present: false };
  }
}

// ── CSS inlining ──────────────────────────────────────────────────────────────

async function inlineCSS(html, pageUrl) {
  const base = new url.URL(pageUrl);
  const linkPattern = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi;
  const found = [];
  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    let href = match[1];
    if (href.startsWith('//')) href = base.protocol + href;
    else if (href.startsWith('/')) href = base.protocol + '//' + base.hostname + href;
    else if (!href.startsWith('http')) href = base.protocol + '//' + base.hostname + '/' + href;
    found.push({ tag: match[0], href });
  }

  // Fetch all stylesheets (limit to 8)
  let result = html;
  for (const { tag, href } of found.slice(0, 8)) {
    console.log(`  Inlining CSS: ${href.split('/').pop().substring(0, 50)}`);
    const css = await fetchCSS(href, pageUrl);
    result = result.replace(tag, `<style data-source="${href}">\n${css}\n</style>`);
  }
  return result;
}

// ── Script stripping ──────────────────────────────────────────────────────────

function stripAnalyticsScripts(html) {
  const patterns = [
    // GA4 / GTM
    /<script[^>]*googletagmanager\.com[^>]*>[\s\S]*?<\/script>/gi,
    /<script[^>]*google-analytics\.com[^>]*>[\s\S]*?<\/script>/gi,
    /<script[^>]*gtag[^>]*>[\s\S]*?<\/script>/gi,
    // VWO SmartCode
    /<script[^>]*visualwebsiteoptimizer\.com[^>]*>[\s\S]*?<\/script>/gi,
    /<script[^>]*cdn\.vwo\.com[^>]*>[\s\S]*?<\/script>/gi,
    // Hotjar, Clarity
    /<script[^>]*hotjar[^>]*>[\s\S]*?<\/script>/gi,
    /<script[^>]*clarity\.ms[^>]*>[\s\S]*?<\/script>/gi,
    // Inline gtag/dataLayer scripts
    /<script[^>]*>[\s\S]*?(?:gtag\(|dataLayer\.push\()[\s\S]*?<\/script>/gi,
  ];

  let result = html;
  let stripped = 0;
  for (const pattern of patterns) {
    const before = result.length;
    result = result.replace(pattern, `<!-- [CRO OS: analytics script removed for clean control] -->`);
    if (result.length !== before) stripped++;
  }
  if (stripped > 0) console.log(`  Stripped ${stripped} analytics/tracking script blocks`);
  return result;
}

// ── CRO OS banner injection ───────────────────────────────────────────────────

function injectBanner(html, meta) {
  const banner = `
<!-- ═══════════════════════════════════════════════════════════
     CRO OS — CONTROL FILE
     Client:    ${meta.client}
     Page:      ${meta.url}
     Extracted: ${meta.date}
     Viewport:  ${meta.viewport}
     VWO:       ${meta.vwo_present ? 'DETECTED — see vwo-snapshot.json' : 'not detected'}
     NOTE: Analytics scripts stripped. Not for production use.
═══════════════════════════════════════════════════════════ -->
<style>
  #cro-os-banner {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 999999;
    background: #0D1B2A; color: #fff; font-family: monospace; font-size: 11px;
    padding: 6px 12px; display: flex; gap: 16px; align-items: center;
    border-top: 2px solid #00A651;
  }
  #cro-os-banner span { opacity: 0.6; }
  #cro-os-banner strong { color: #00A651; }
</style>
<div id="cro-os-banner">
  <strong>CRO OS CONTROL</strong>
  <span>${meta.client} · ${meta.slug} · ${meta.date}</span>
  ${meta.vwo_present ? '<span style="color:#f59e0b">⚠ VWO detected — check vwo-snapshot.json</span>' : ''}
</div>`;

  // Inject before </body>
  if (html.includes('</body>')) {
    return html.replace('</body>', banner + '\n</body>');
  }
  return html + banner;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function extractControl() {
  const date = new Date().toISOString().split('T')[0];
  const slug = slugify(PAGE_URL);
  const outDir = `clients/${CLIENT}/controls`;

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const controlPath     = `${outDir}/${slug}.html`;
  const vwoPath         = `${outDir}/${slug}-vwo-snapshot.json`;
  const metaPath        = `${outDir}/${slug}-meta.json`;

  console.log('\n CRO OS — Control Extractor');
  console.log(` Client:   ${CLIENT}`);
  console.log(` URL:      ${PAGE_URL}`);
  console.log(` Viewport: ${VIEWPORT}`);
  console.log(` Output:   ${controlPath}\n`);

  const viewportConfig = VIEWPORT === 'mobile'
    ? { width: 390, height: 844, isMobile: true, hasTouch: true }
    : { width: 1440, height: 900 };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: viewportConfig,
    userAgent: VIEWPORT === 'mobile'
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'en-GB',
  });

  const page = await context.newPage();

  // Block unnecessary resources to speed up load
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => route.abort());

  console.log('Step 1/5 — Loading page...');
  try {
    await page.goto(PAGE_URL, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
  } catch(e) {
    // networkidle can timeout on heavy pages — try domcontentloaded
    console.log('  networkidle timeout — falling back to domcontentloaded');
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
  }

  // Extra wait for JS frameworks to settle
  await page.waitForTimeout(2000);
  console.log('  Page loaded');

  console.log('Step 2/5 — Extracting VWO snapshot...');
  const vwoSnapshot = await extractVWOSnapshot(page);
  console.log(`  VWO present: ${vwoSnapshot.vwo_present}`);
  if (vwoSnapshot.active_tests && vwoSnapshot.active_tests.length) {
    console.log(`  Active tests found: ${vwoSnapshot.active_tests.length}`);
    vwoSnapshot.active_tests.forEach(t => console.log(`    - Test ${t.id}: ${t.name || 'unnamed'} (variation: ${t.variation || 'unknown'})`));
  }

  console.log('Step 3/5 — Capturing rendered HTML...');
  const renderedHTML = await page.content();
  console.log(`  Captured: ${renderedHTML.length} chars`);

  await browser.close();

  console.log('Step 4/5 — Inlining CSS...');
  let html = await inlineCSS(renderedHTML, PAGE_URL);

  console.log('Step 5/5 — Cleaning and saving...');
  html = stripAnalyticsScripts(html);

  const meta = {
    client: CLIENT,
    url: PAGE_URL,
    slug,
    date,
    viewport: VIEWPORT,
    vwo_present: vwoSnapshot.vwo_present,
  };

  html = injectBanner(html, meta);

  // Save files
  fs.writeFileSync(controlPath, html);
  fs.writeFileSync(vwoPath, JSON.stringify(vwoSnapshot, null, 2));
  fs.writeFileSync(metaPath, JSON.stringify({
    ...meta,
    control_file: controlPath,
    vwo_snapshot: vwoPath,
    extracted: new Date().toISOString(),
    html_size_kb: Math.round(html.length / 1024),
  }, null, 2));

  console.log('\n══════════════════════════════════════════════');
  console.log('  EXTRACTION COMPLETE');
  console.log('══════════════════════════════════════════════');
  console.log(`  Control HTML:    ${controlPath} (${Math.round(html.length / 1024)}kb)`);
  console.log(`  VWO snapshot:    ${vwoPath}`);
  console.log(`  Meta:            ${metaPath}`);
  if (vwoSnapshot.vwo_present) {
    console.log(`  ⚠  VWO detected — review vwo-snapshot.json before using as control`);
    console.log(`     If a test is live, this control reflects the VARIATION, not the original`);
  }
  console.log('══════════════════════════════════════════════\n');
}

extractControl().catch(err => {
  console.error('Extraction failed:', err.message);
  process.exit(1);
});
