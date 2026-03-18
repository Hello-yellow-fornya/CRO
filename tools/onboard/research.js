/**
 * CRO OS — Phase 1: Client Research
 *
 * Reads the client's website before any scaffolding begins.
 * Produces clients/[client]/research.md — the machine's working
 * understanding of the business that everything else builds on.
 *
 * What it does:
 *   1. Fetches the homepage — extracts nav structure, revenue lines, CMS signals
 *   2. Crawls up to 6 key pages from the nav (conversion-relevant pages only)
 *   3. Detects tech stack from HTML/headers/script tags
 *   4. Calls Claude API to synthesise everything into research.md
 *
 * research.md contains:
 *   - Business model summary
 *   - Revenue lines identified (each becomes a funnel)
 *   - Vertical classification (may be composite)
 *   - Funnel map per revenue line
 *   - Primary KPI per revenue line
 *   - Tech stack (CMS, framework, analytics signals)
 *   - Subdomain/domain structure (critical for GA4 cross-domain)
 *   - First-order CRO questions before any data is seen
 *   - Off-limits signals (regulatory copy, partner logos, legal text)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const CLIENT      = process.env.CLIENT;
const CLIENT_NAME = process.env.CLIENT_NAME;
const BASE_URL    = process.env.URL;
const VERT_HINT   = process.env.VERTICAL_HINT || 'auto';
const API_KEY     = process.env.ANTHROPIC_API_KEY;

if (!CLIENT || !BASE_URL || !API_KEY) {
  console.error('Missing required env: CLIENT, URL, ANTHROPIC_API_KEY');
  process.exit(1);
}

// ── Fetch helper ─────────────────────────────────────────────────────────────

function fetchUrl(targetUrl, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('Too many redirects'));
    let parsed;
    try { parsed = new url.URL(targetUrl); } catch(e) { return reject(e); }
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CRO-OS-Research/1.0)',
        'Accept': 'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    }, (res) => {
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new url.URL(res.headers.location, targetUrl).href;
        return resolve(fetchUrl(next, redirects + 1));
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ body: data, status: res.statusCode, headers: res.headers, finalUrl: targetUrl }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout: ' + targetUrl)); });
    req.end();
  });
}

// ── HTML analysis helpers ─────────────────────────────────────────────────────

function extractText(html) {
  // Strip scripts, styles, comments, then tags
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{3,}/g, '\n')
    .replace(/[^\x20-\x7E\n]/g, '')   // ASCII only — removes zero-width chars
    .substring(0, 4000)
    .trim();
}

function extractLinks(html, baseUrl) {
  const parsed = new url.URL(baseUrl);
  const base = parsed.protocol + '//' + parsed.hostname;
  const links = new Set();
  const matches = html.matchAll(/href=["']([^"'#?]+)["']/gi);
  for (const m of matches) {
    const href = m[1];
    if (href.startsWith('http')) {
      links.add(href);
    } else if (href.startsWith('/') && !href.startsWith('//')) {
      links.add(base + href);
    }
  }
  return [...links];
}

function detectTechStack(html, headers) {
  const signals = [];
  const h = html.toLowerCase();
  const hdr = JSON.stringify(headers || {}).toLowerCase();

  // CMS / Framework
  if (h.includes('wp-content') || h.includes('wp-json'))        signals.push('WordPress');
  if (h.includes('sanity.io') || h.includes('cdn.sanity'))       signals.push('Sanity CMS (headless)');
  if (h.includes('contentful'))                                   signals.push('Contentful (headless)');
  if (h.includes('storyblok'))                                    signals.push('Storyblok (headless)');
  if (h.includes('shopify'))                                      signals.push('Shopify');
  if (h.includes('next/'))                                        signals.push('Next.js');
  if (h.includes('__nuxt') || h.includes('_nuxt'))               signals.push('Nuxt.js');
  if (h.includes('gatsby'))                                       signals.push('Gatsby');
  if (h.includes('webflow'))                                      signals.push('Webflow');
  if (h.includes('squarespace'))                                  signals.push('Squarespace');
  if (h.includes('wix.com'))                                      signals.push('Wix');

  // Analytics / Tag management
  if (h.includes('gtag') || h.includes('google-analytics'))      signals.push('GA4 (likely)');
  if (h.includes('googletagmanager'))                             signals.push('GTM');
  if (h.includes('vwo') || h.includes('visualwebsiteoptimizer')) signals.push('VWO (detected)');
  if (h.includes('segment.com') || h.includes('analytics.js'))   signals.push('Segment');
  if (h.includes('hotjar'))                                       signals.push('Hotjar');
  if (h.includes('clarity.ms'))                                   signals.push('Microsoft Clarity');

  // Rendering model
  const hasSubstantiveText = extractText(html).length > 500;
  if (!hasSubstantiveText) signals.push('JS-rendered (content not in HTML — likely SPA)');

  return [...new Set(signals)];
}

function extractSubdomains(links, baseUrl) {
  const parsed = new url.URL(baseUrl);
  const rootDomain = parsed.hostname.replace(/^www\./, '');
  const subs = new Set();
  for (const l of links) {
    try {
      const lp = new url.URL(l);
      const lh = lp.hostname;
      if (lh.endsWith(rootDomain) && lh !== parsed.hostname && lh !== 'www.' + rootDomain) {
        subs.add(lh);
      }
    } catch(e) {}
  }
  return [...subs];
}

// Score a link for conversion-page relevance — higher = more worth fetching
function linkScore(href) {
  const h = href.toLowerCase();
  const HIGH = ['membership','join','sign-up','signup','register','booking','book','buy',
                'purchase','checkout','pricing','plans','quote','enquir','contact','event',
                'camp','class','program','trial','demo','apply','get-started'];
  const MED  = ['about','product','service','sport','fitness','wellness','gym','activity',
                'shop','store','packages'];
  const LOW  = ['blog','news','press','career','job','partner','legal','privacy','faq',
                'help','support','accessibility'];
  if (LOW.some(w => h.includes(w))) return 0;
  if (HIGH.some(w => h.includes(w))) return 2;
  if (MED.some(w => h.includes(w))) return 1;
  return 0.5;
}

// ── Claude API call ───────────────────────────────────────────────────────────

async function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 60000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          const text = (parsed.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
          resolve(text);
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Claude API timeout')); });
    req.write(body);
    req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function research() {
  console.log('\n CRO OS — Phase 1: Client Research');
  console.log(` Client:  ${CLIENT_NAME} (${CLIENT})`);
  console.log(` URL:     ${BASE_URL}`);
  console.log(` Vertical hint: ${VERT_HINT}\n`);

  // ── Step 1: Fetch homepage ─────────────────────────────────────────────────
  console.log('Step 1/4 — Fetching homepage...');
  let homepageHtml = '';
  let homepageHeaders = {};
  try {
    const res = await fetchUrl(BASE_URL);
    homepageHtml = res.body;
    homepageHeaders = res.headers;
    console.log(`  Fetched — ${homepageHtml.length} chars`);
  } catch(e) {
    console.error('  Failed to fetch homepage:', e.message);
    process.exit(1);
  }

  const techStack    = detectTechStack(homepageHtml, homepageHeaders);
  const allLinks     = extractLinks(homepageHtml, BASE_URL);
  const subdomains   = extractSubdomains(allLinks, BASE_URL);
  const homepageText = extractText(homepageHtml);

  console.log(`  Tech signals: ${techStack.join(', ') || 'none detected'}`);
  console.log(`  Links found: ${allLinks.length}`);
  console.log(`  Subdomains: ${subdomains.join(', ') || 'none'}`);

  // ── Step 2: Score and select pages to crawl ───────────────────────────────
  console.log('\nStep 2/4 — Selecting key pages to crawl...');

  // Deduplicate, filter same domain + subdomains, score
  const parsed = new url.URL(BASE_URL);
  const rootDomain = parsed.hostname.replace(/^www\./, '');

  const candidates = allLinks
    .filter(l => {
      try {
        const lp = new url.URL(l);
        return lp.hostname.endsWith(rootDomain);
      } catch(e) { return false; }
    })
    .filter((l, i, arr) => arr.indexOf(l) === i)  // deduplicate
    .map(l => ({ url: l, score: linkScore(l) }))
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  console.log(`  Selected ${candidates.length} pages to crawl:`);
  candidates.forEach(c => console.log(`    [${c.score}] ${c.url}`));

  // ── Step 3: Fetch key pages ────────────────────────────────────────────────
  console.log('\nStep 3/4 — Fetching key pages...');
  const pageContents = [];

  for (const candidate of candidates) {
    try {
      const res = await fetchUrl(candidate.url);
      const text = extractText(res.body);
      if (text.length > 100) {
        pageContents.push({ url: candidate.url, text: text.substring(0, 1500) });
        console.log(`  OK  ${candidate.url}`);
      } else {
        console.log(`  JS  ${candidate.url} (JS-rendered — minimal text in HTML)`);
        pageContents.push({ url: candidate.url, text: '[JS-rendered page — content not available in HTML]' });
      }
    } catch(e) {
      console.log(`  ERR ${candidate.url}: ${e.message}`);
    }
    // Polite delay
    await new Promise(r => setTimeout(r, 500));
  }

  // ── Step 4: Synthesise with Claude ────────────────────────────────────────
  console.log('\nStep 4/4 — Synthesising with Claude...');

  const pagesSection = pageContents.map(p =>
    `### ${p.url}\n\`\`\`\n${p.text}\n\`\`\``
  ).join('\n\n');

  const prompt = `You are a senior CRO strategist onboarding a new client. Your job is to read the website content below and produce a structured research document that becomes the foundation for all CRO work on this client.

CLIENT: ${CLIENT_NAME}
HOMEPAGE URL: ${BASE_URL}
VERTICAL HINT: ${VERT_HINT} (may be "auto" — determine from content)
TECH SIGNALS DETECTED: ${techStack.join(', ') || 'none detected'}
SUBDOMAINS FOUND: ${subdomains.join(', ') || 'none'}

---

HOMEPAGE TEXT:
\`\`\`
${homepageText}
\`\`\`

KEY PAGES CRAWLED:
${pagesSection}

---

Produce research.md using EXACTLY this structure. Be specific and evidence-based — only state things you can infer from the content above. If you cannot determine something, write "[UNCONFIRMED] — requires client input" rather than guessing. Use this exact token so downstream tools can find and flag it.

---

# ${CLIENT_NAME} — Research
**Phase 1 research. Auto-generated by CRO OS.**
**Date:** ${new Date().toISOString().split('T')[0]}
**Source:** ${BASE_URL}
**Tech stack:** ${techStack.join(' · ') || 'Unknown'}

---

## 1. Business model

[2–4 sentences. What does this company do? How does it make money? Who is the customer?]

---

## 2. Revenue lines

[Table: one row per distinct revenue stream identified. Be specific — "kids gymnastics classes" not just "sports".]

| Revenue line | Description | Likely funnel type | Estimated value tier |
|---|---|---|---|
| ... | ... | transactional / lead / membership / enquiry | high / medium / low |

---

## 3. Vertical classification

[Single vertical or composite? If composite, list all verticals. Reference brain/funnel-kpis.md vertical definitions.]

**Classification:** [single: X | composite: X + Y + Z]
**Reason:** [one sentence]

---

## 4. Funnel map per revenue line

[One sub-section per revenue line. Map the likely funnel steps based on what you can see. Mark steps you cannot confirm as [UNCONFIRMED].]

### [Revenue line name]
**Primary KPI:** [GA4 event name — purchase / generate_lead / sign_up / begin_checkout]
**Funnel:**
[Step 1 page/action] → [Step 2] → [Step 3] → [Conversion]

---

## 5. Tech stack

[Specific findings. Note anything that affects CRO tooling — headless CMS means JS-rendered pages, subdomains may need cross-domain GA4 tracking, etc.]

| Layer | Technology | Confidence | CRO implication |
|---|---|---|---|
| ... | ... | detected / inferred / unknown | ... |

---

## 6. Domain and subdomain structure

[List all subdomains found. Flag any that likely represent separate conversion funnels — these almost certainly need separate GA4 properties or cross-domain tracking configured.]

| Subdomain | Purpose | GA4 risk |
|---|---|---|
| ... | ... | likely separate property / needs cross-domain / unknown |

---

## 7. First-order CRO questions

[5–8 specific questions this client needs to answer before meaningful CRO work begins. Based on what you observed — not generic questions. Each question should reference a specific observation from the site.]

1. ...
2. ...

---

## 8. Pre-data hypotheses

[3 hypotheses you would generate right now, before seeing any analytics data, based purely on what you observed. Use the standard hypothesis format from brain/brief-template.md.]

### Hypothesis 1
If we [change X] on [page],
then [metric] will [increase/decrease],
because [reason from observation].
Evidence: [what you saw on the site]
Test size: BIG / MEDIUM / SMALL

---

## 9. Off-limits signals

[Anything observed on the site that is likely legally required, partner-controlled, or brand-sensitive. These go into off-limits.md.]

| Element | Observed | Risk if modified |
|---|---|---|
| ... | ... | legal / brand / partner |

---

## 10. Week 1 priority actions

[Before any tests run, what must be confirmed or fixed? Ordered by urgency.]

1. ...
2. ...

---

Return ONLY the markdown document above. No preamble, no explanation outside the document.`;

  let researchMd = '';
  try {
    researchMd = await callClaude(prompt);
    console.log(`  Claude returned ${researchMd.length} chars`);
  } catch(e) {
    console.error('  Claude API error:', e.message);
    // Write a fallback stub so the workflow continues
    researchMd = `# ${CLIENT_NAME} — Research\n\n**Phase 1 research failed — Claude API error.**\n**Error:** ${e.message}\n**Date:** ${new Date().toISOString().split('T')[0]}\n\nManual research required. See context.md template.\n`;
  }

  // ── Write research.md ──────────────────────────────────────────────────────
  const dir = `clients/${CLIENT}`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const outPath = `${dir}/research.md`;
  fs.writeFileSync(outPath, researchMd);

  // Also write a machine-readable summary for scaffold.js to consume
  const meta = {
    client: CLIENT,
    client_name: CLIENT_NAME,
    url: BASE_URL,
    tech_stack: techStack,
    subdomains,
    phase1_complete: true,
    date: new Date().toISOString().split('T')[0]
  };
  fs.writeFileSync(`${dir}/research-meta.json`, JSON.stringify(meta, null, 2));

  console.log(`\n Phase 1 complete.`);
  console.log(` research.md written to ${outPath}`);
  console.log(` Tech: ${techStack.join(', ') || 'unknown'}`);
  console.log(` Subdomains: ${subdomains.join(', ') || 'none'}\n`);
}

research().catch(err => {
  console.error('Phase 1 failed:', err.message);
  process.exit(1);
});
