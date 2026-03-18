#!/usr/bin/env node

/**
 * CRO OS — CSS Token Extractor v2
 * Uses fetch + CSS parsing — no headless browser needed
 * Usage: node extract-tokens.js <url> <client-name>
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const targetUrl = process.argv[2];
const clientName = process.argv[3];

if (!targetUrl || !clientName) {
  console.error('Usage: node extract-tokens.js <url> <client-name>');
  process.exit(1);
}

// ── FETCH HELPER ──────────────────────────────────────────────────────────────

function fetchUrl(targetUrl, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('Too many redirects'));
    const parsed = new url.URL(targetUrl);
    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000
    };
    const req = lib.request(options, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : parsed.protocol + '//' + parsed.hostname + res.headers.location;
        return resolve(fetchUrl(next, redirects + 1));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ body: data, status: res.statusCode, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.end();
  });
}

// ── CSS PARSERS ───────────────────────────────────────────────────────────────

function extractCSSVars(css) {
  const vars = {};
  const matches = css.matchAll(/:root\s*\{([^}]+)\}/g);
  for (const m of matches) {
    const props = m[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g);
    for (const p of props) vars[`--${p[1]}`] = p[2].trim();
  }
  return vars;
}

function extractTypography(css) {
  const typography = {};
  const elements = ['h1', 'h2', 'h3', 'h4', 'p', 'body', 'button', '.btn', 'a', 'nav'];
  for (const el of elements) {
    const escaped = el.replace('.', '\\.');
    const pattern = new RegExp(`(?:^|[,\\s})})${escaped}(?:[^{,]*)?\\s*\\{([^}]+)\\}`, 'gm');
    const matches = [...css.matchAll(pattern)];
    if (matches.length === 0) continue;
    const rules = {};
    for (const m of matches) {
      const block = m[1];
      const props = ['font-family','font-size','font-weight','font-style','line-height','letter-spacing','text-transform','color','text-decoration'];
      for (const prop of props) {
        const re = new RegExp(prop + '\\s*:\\s*([^;!]+)', 'i');
        const match = block.match(re);
        if (match) rules[prop] = match[1].trim();
      }
    }
    if (Object.keys(rules).length > 0) typography[el] = rules;
  }
  return typography;
}

function extractColours(css) {
  const colours = new Set();
  const hexMatches = css.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g);
  for (const m of hexMatches) {
    const hex = m[0].toLowerCase();
    if (!['#ffffff','#fff','#000000','#000'].includes(hex)) colours.add(hex);
  }
  const rgbMatches = css.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g);
  for (const m of rgbMatches) {
    const [r, g, b] = [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
    if (r === 0 && g === 0 && b === 0) continue;
    if (r === 255 && g === 255 && b === 255) continue;
    const hex = '#' + [r,g,b].map(n => n.toString(16).padStart(2,'0')).join('');
    colours.add(hex);
  }
  return [...colours].slice(0, 20);
}

function extractBorderRadius(css) {
  const radii = new Set();
  const matches = css.matchAll(/border-radius\s*:\s*([^;]+);/g);
  for (const m of matches) radii.add(m[1].trim());
  return [...radii].slice(0, 10);
}

function extractSpacing(css) {
  const spacing = new Set();
  const matches = css.matchAll(/padding\s*:\s*([^;]+);/g);
  for (const m of matches) spacing.add(m[1].trim());
  return [...spacing].slice(0, 10);
}

function extractFontFaces(css) {
  const fonts = [];
  const matches = css.matchAll(/@font-face\s*\{([^}]+)\}/g);
  for (const m of matches) {
    const familyMatch = m[1].match(/font-family\s*:\s*['"]?([^'";]+)/i);
    const weightMatch = m[1].match(/font-weight\s*:\s*([^;]+)/i);
    const srcMatch = m[1].match(/src\s*:\s*([^;]+)/i);
    if (familyMatch) {
      fonts.push({
        family: familyMatch[1].trim(),
        weight: weightMatch ? weightMatch[1].trim() : 'normal',
        src: srcMatch ? srcMatch[1].trim().substring(0, 100) : ''
      });
    }
  }
  return fonts;
}

function extractGoogleFonts(html) {
  const fonts = [];
  const matches = html.matchAll(/fonts\.googleapis\.com\/css[^"']+/g);
  for (const m of matches) fonts.push(decodeURIComponent(m[0]));
  return [...new Set(fonts)];
}

function extractImageUrls(html, baseUrl) {
  const images = [];
  const parsed = new url.URL(baseUrl);
  const base = parsed.protocol + '//' + parsed.hostname;

  // Hero/banner images
  const srcMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
  for (const m of srcMatches) {
    const src = m[0].toLowerCase();
    if (src.includes('hero') || src.includes('banner') || src.includes('party') || src.includes('kids')) {
      const imgUrl = m[1].startsWith('http') ? m[1] : base + m[1];
      images.push(imgUrl);
    }
  }

  // Background images from inline styles
  const bgMatches = html.matchAll(/background-image\s*:\s*url\(['"]?([^'")]+)/gi);
  for (const m of bgMatches) {
    const imgUrl = m[1].startsWith('http') ? m[1] : base + m[1];
    images.push(imgUrl);
  }

  return [...new Set(images)].slice(0, 10);
}

function extractKeyColours(css, html) {
  const named = {};

  // Try to identify brand colours by context
  const ctaMatch = css.match(/\.btn[^{]*\{[^}]*background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/i);
  if (ctaMatch) named['CTA button background'] = ctaMatch[1];

  const navMatch = css.match(/(?:nav|header|\.nav)[^{]*\{[^}]*background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6})/i);
  if (navMatch) named['Nav background'] = navMatch[1];

  const heroMatch = css.match(/(?:\.hero|\.banner)[^{]*\{[^}]*background(?:-color)?\s*:\s*(#[0-9a-fA-F]{3,6})/i);
  if (heroMatch) named['Hero background'] = heroMatch[1];

  return named;
}

function extractCSSLinks(html, baseUrl) {
  const parsed = new url.URL(baseUrl);
  const base = parsed.protocol + '//' + parsed.hostname;
  const links = [];
  const matches = html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi);
  for (const m of matches) {
    const href = m[1];
    if (href.startsWith('http')) links.push(href);
    else if (href.startsWith('//')) links.push('https:' + href);
    else if (href.startsWith('/')) links.push(base + href);
    else links.push(base + '/' + href);
  }
  return links;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────

async function extractTokens() {
  console.log('\n CRO OS — CSS Token Extractor v2 (fetch-based)');
  console.log(' URL: ' + targetUrl);
  console.log(' Client: ' + clientName);
  console.log(' Fetching page...\n');

  // Fetch HTML
  let html = '';
  try {
    const res = await fetchUrl(targetUrl);
    html = res.body;
    console.log(' Page fetched — ' + html.length + ' chars');
  } catch (e) {
    console.error(' Failed to fetch page: ' + e.message);
    process.exit(1);
  }

  // Find and fetch CSS files
  const cssLinks = extractCSSLinks(html, targetUrl);
  console.log(' Found ' + cssLinks.length + ' CSS files');

  let allCSS = '';
  let fetchedCount = 0;

  for (const link of cssLinks.slice(0, 8)) {
    try {
      const res = await fetchUrl(link);
      if (res.status === 200) {
        allCSS += '\n\n/* SOURCE: ' + link + ' */\n' + res.body;
        fetchedCount++;
        process.stdout.write(' Fetched: ' + link.split('/').pop().substring(0, 50) + '\n');
      }
    } catch (e) {
      console.log(' Skipped: ' + link.split('/').pop().substring(0, 50));
    }
  }

  // Also extract inline styles
  const inlineMatches = html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  for (const m of inlineMatches) allCSS += '\n\n/* INLINE */\n' + m[1];

  console.log('\n Fetched ' + fetchedCount + ' CSS files + inline styles');
  console.log(' Total CSS: ' + allCSS.length + ' chars\n');

  // Extract tokens
  const cssVars = extractCSSVars(allCSS);
  const typography = extractTypography(allCSS);
  const colours = extractColours(allCSS);
  const borderRadius = extractBorderRadius(allCSS);
  const spacing = extractSpacing(allCSS);
  const fontFaces = extractFontFaces(allCSS);
  const googleFonts = extractGoogleFonts(html);
  const images = extractImageUrls(html, targetUrl);
  const namedColours = extractKeyColours(allCSS, html);

  // Build markdown output
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  let md = '# Design Tokens — ' + clientName.charAt(0).toUpperCase() + clientName.slice(1) + '\n\n';
  md += '**Extracted from:** ' + targetUrl + '\n';
  md += '**Date:** ' + date + '\n';
  md += '**Method:** Fetch-based CSS parsing (no headless browser)\n\n';
  md += '> Auto-extracted by CRO OS. Review values before using in mockups.\n\n---\n\n';

  md += '## 1. CSS Custom Properties (:root variables)\n\n';
  if (Object.keys(cssVars).length > 0) {
    md += '| Variable | Value |\n|---|---|\n';
    for (const [k, v] of Object.entries(cssVars)) md += '| `' + k + '` | `' + v + '` |\n';
  } else {
    md += '_No :root CSS variables found — site likely uses hardcoded values or CSS-in-JS._\n';
  }

  md += '\n---\n\n## 2. Named Brand Colours\n\n';
  if (Object.keys(namedColours).length > 0) {
    md += '| Element | Colour |\n|---|---|\n';
    for (const [k, v] of Object.entries(namedColours)) md += '| ' + k + ' | `' + v + '` |\n';
  } else {
    md += '_No named colours extracted — check manually._\n';
  }

  md += '\n---\n\n## 3. All Colours Found in CSS\n\n';
  if (colours.length > 0) {
    md += colours.map(c => '`' + c + '`').join(' · ') + '\n';
  } else {
    md += '_No colours extracted._\n';
  }

  md += '\n---\n\n## 4. Typography\n\n';
  if (Object.keys(typography).length > 0) {
    for (const [el, rules] of Object.entries(typography)) {
      md += '### ' + el + '\n';
      md += '| Property | Value |\n|---|---|\n';
      for (const [k, v] of Object.entries(rules)) md += '| ' + k + ' | `' + v + '` |\n';
      md += '\n';
    }
  } else {
    md += '_No typography values extracted._\n';
  }

  md += '\n---\n\n## 5. Font Faces\n\n';
  if (fontFaces.length > 0) {
    md += '| Family | Weight |\n|---|---|\n';
    fontFaces.forEach(f => { md += '| `' + f.family + '` | `' + f.weight + '` |\n'; });
  } else {
    md += '_No @font-face declarations found._\n';
  }

  md += '\n---\n\n## 6. Google Fonts\n\n';
  if (googleFonts.length > 0) {
    googleFonts.forEach(f => { md += '- `' + f + '`\n'; });
  } else {
    md += '_No Google Fonts imports found._\n';
  }

  md += '\n---\n\n## 7. Border Radius Values\n\n';
  md += borderRadius.length > 0 ? borderRadius.map(r => '`' + r + '`').join(' · ') + '\n' : '_None found._\n';

  md += '\n---\n\n## 8. Spacing / Padding Values\n\n';
  md += spacing.length > 0 ? spacing.map(s => '`' + s + '`').join(' · ') + '\n' : '_None found._\n';

  md += '\n---\n\n## 9. Image URLs (hero/party/kids)\n\n';
  if (images.length > 0) {
    images.forEach(i => { md += '- ' + i + '\n'; });
  } else {
    md += '_No relevant images found._\n';
  }

  md += '\n---\n\n## 10. CSS Files Parsed\n\n';
  cssLinks.slice(0, 8).forEach(l => { md += '- `' + l + '`\n'; });

  md += '\n---\n\n## 11. Manual Checks\n\n';
  md += '- [ ] Confirm primary brand colour\n';
  md += '- [ ] Confirm heading font name and weight\n';
  md += '- [ ] Check button border-radius on live site\n';
  md += '- [ ] Confirm VWO implementation type\n';
  md += '- [ ] Note any Tailwind or CSS-in-JS the parser may have missed\n';

  // Save output
  const outputDir = path.join('clients', clientName);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'design-tokens.md');
  fs.writeFileSync(outputPath, md);

  // Console summary
  console.log('═══════════════════════════════════════════');
  console.log('  EXTRACTION COMPLETE');
  console.log('═══════════════════════════════════════════');
  console.log('  CSS variables:    ' + Object.keys(cssVars).length);
  console.log('  Typography:       ' + Object.keys(typography).length + ' elements');
  console.log('  Colours:          ' + colours.length);
  console.log('  Font faces:       ' + fontFaces.length);
  console.log('  Google Fonts:     ' + googleFonts.length);
  console.log('  Images found:     ' + images.length);
  console.log('  CSS files parsed: ' + fetchedCount);
  console.log('───────────────────────────────────────────');
  console.log('  Saved to: ' + outputPath);
  console.log('═══════════════════════════════════════════\n');
}

extractTokens().catch(err => {
  console.error('Extraction failed:', err.message);
  process.exit(1);
});
