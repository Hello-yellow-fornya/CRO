#!/usr/bin/env node
/**
 * CRO OS — CSS Token Extractor
 * Usage: node extract-tokens.js <url> <client-name>
 * Example: node extract-tokens.js https://www.powerleague.com/football-birthday-party powerleague
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const url = process.argv[2];
const clientName = process.argv[3];
if (!url || !clientName) {
  console.error('Usage: node extract-tokens.js <url> <client-name>');
  process.exit(1);
}
async function extractTokens() {
  console.log('\n CRO OS — CSS Token Extractor');
  console.log('URL: ' + url);
  console.log('Client: ' + clientName);
  console.log('Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.log('Page load timeout — extracting what was loaded');
  }
  console.log('Page loaded. Extracting tokens...\n');
  const tokens = await page.evaluate(() => {
    function rgbToHex(rgb) {
      if (!rgb || !rgb.startsWith('rgb')) return rgb;
      const parts = rgb.match(/[\d.]+/g);
      if (!parts || parts.length < 3) return rgb;
      const hex = parts.slice(0, 3).map(n => {
        const h = parseInt(n).toString(16);
        return h.length === 1 ? '0' + h : h;
      }).join('');
      const alpha = parts[3] ? parseFloat(parts[3]) : 1;
      return alpha < 1 ? 'rgba(' + parts.slice(0,3).join(', ') + ', ' + alpha + ')' : '#' + hex;
    }
    // 1. CSS CUSTOM PROPERTIES
    const cssVars = {};
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === ':root' || rule.selectorText === 'html') {
              const matches = rule.cssText.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g);
              for (const m of matches) cssVars['--' + m[1]] = m[2].trim();
            }
          }
        } catch(e) {}
      }
    } catch(e) {}
    // 2. TYPOGRAPHY
    const typographySelectors = [
      { name: 'H1', selector: 'h1' },
      { name: 'H2', selector: 'h2' },
      { name: 'H3', selector: 'h3' },
      { name: 'Body', selector: 'body' },
      { name: 'Paragraph', selector: 'p' },
      { name: 'Primary button', selector: 'button, .btn, .button, [class*="btn-primary"]' },
      { name: 'Nav link', selector: 'nav a, header a' },
      { name: 'Hero headline', selector: '[class*="hero"] h1, [class*="banner"] h1' },
    ];
    const typography = [];
    const typProps = ['font-family','font-size','font-weight','line-height','letter-spacing','text-transform','color'];
    for (const { name, selector } of typographySelectors) {
      const el = document.querySelector(selector);
      if (!el) continue;
      const style = window.getComputedStyle(el);
      const entry = { name, selector };
      typProps.forEach(p => {
        let val = style.getPropertyValue(p).trim();
        if (p === 'color') val = rgbToHex(val);
        if (val && val !== 'normal' && val !== '0px') entry[p] = val;
      });
      if (Object.keys(entry).length > 2) typography.push(entry);
    }
    // 3. COLOURS
    const colourSelectors = [
      { name: 'Body background', selector: 'body', prop: 'background-color' },
      { name: 'Body text', selector: 'body', prop: 'color' },
      { name: 'Primary button bg', selector: 'button, .btn, [class*="btn-primary"]', prop: 'background-color' },
      { name: 'Primary button text', selector: 'button, .btn, [class*="btn-primary"]', prop: 'color' },
      { name: 'Nav background', selector: 'nav, header, .nav', prop: 'background-color' },
      { name: 'Nav text', selector: 'nav a, header a', prop: 'color' },
      { name: 'Link colour', selector: 'a', prop: 'color' },
      { name: 'Card background', selector: '.card, [class*="card"], [class*="package"]', prop: 'background-color' },
      { name: 'Card border', selector: '.card, [class*="card"]', prop: 'border-color' },
    ];
    const colours = [];
    for (const { name, selector, prop } of colourSelectors) {
      const el = document.querySelector(selector);
      if (!el) continue;
      const val = rgbToHex(window.getComputedStyle(el).getPropertyValue(prop).trim());
      if (val && val !== '#000000' && !val.includes('rgba(0, 0, 0, 0)')) {
        colours.push({ name, value: val });
      }
    }
    // 4. SPACING & BORDER RADIUS
    const spacingSelectors = [
      { name: 'Section padding', selector: 'section, .section' },
      { name: 'Container padding', selector: '.container, .wrapper' },
      { name: 'Button padding', selector: 'button, .btn' },
      { name: 'Card padding', selector: '.card, [class*="card"]' },
    ];
    const spacing = [];
    for (const { name, selector } of spacingSelectors) {
      const el = document.querySelector(selector);
      if (!el) continue;
      const style = window.getComputedStyle(el);
      const entry = { name };
      ['padding-top','padding-right','padding-bottom','padding-left','border-radius'].forEach(p => {
        const val = style.getPropertyValue(p).trim();
        if (val && val !== '0px') entry[p] = val;
      });
      if (Object.keys(entry).length > 1) spacing.push(entry);
    }
    // 5. FONT IMPORTS
    const fontImports = [];
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.constructor.name === 'CSSImportRule') {
              const href = rule.href || '';
              if (href.includes('fonts.google') || href.includes('typekit') || href.includes('fonts.adobe')) {
                fontImports.push(href);
              }
            }
            if (rule.cssText && rule.cssText.includes('@font-face')) {
              const m = rule.cssText.match(/font-family:\s*['"]?([^'";]+)/);
              if (m) fontImports.push('@font-face: ' + m[1].trim());
            }
          }
        } catch(e) {}
      }
    } catch(e) {}
    // 6. KEY CSS CLASSES FOR VWO SELECTORS
    const keyClasses = {};
    const classTargets = [
      { name: 'Primary CTA', selector: 'a[href*="book"], [class*="cta"], [class*="btn-primary"]' },
      { name: 'Hero section', selector: '[class*="hero"], [class*="banner"]' },
      { name: 'Navigation', selector: 'nav, .nav, header nav' },
      { name: 'Package card', selector: '[class*="package"], [class*="pricing"], [class*="card"]' },
      { name: 'Section heading', selector: 'h2, .section-title, [class*="section-title"]' },
    ];
    for (const { name, selector } of classTargets) {
      const el = document.querySelector(selector);
      if (el) {
        keyClasses[name] = {
          tagName: el.tagName.toLowerCase(),
          classes: Array.from(el.classList).join(' '),
          id: el.id || null
        };
      }
    }
    // 7. META
    const meta = {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || '',
      generator: document.querySelector('meta[name="generator"]')?.content || '',
      detectedPlatform: null
    };
    if (document.querySelector('[class*="wp-"], #wpadminbar')) meta.detectedPlatform = 'WordPress';
    else if (document.querySelector('[data-shopify], .shopify-section')) meta.detectedPlatform = 'Shopify';
    else if (window.__NEXT_DATA__) meta.detectedPlatform = 'Next.js';
    else if (document.querySelector('[data-reactroot]')) meta.detectedPlatform = 'React';
    return { cssVars, typography, colours, spacing, fontImports, keyClasses, meta };
  });
  await browser.close();
  // FORMAT MARKDOWN OUTPUT
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  let md = '# Design Tokens — ' + clientName.charAt(0).toUpperCase() + clientName.slice(1) + '\n\n';
  md += '**Extracted from:** ' + url + '\n';
  md += '**Date:** ' + date + '\n';
  md += '**Detected platform:** ' + (tokens.meta.detectedPlatform || 'Unknown') + '\n\n';
  md += '> Auto-extracted by CRO OS token extractor. Review and correct values before using in mockups.\n\n---\n\n';
  md += '## 1. CSS Custom Properties (:root variables)\n\n';
  if (Object.keys(tokens.cssVars).length > 0) {
    md += '| Variable | Value |\n|---|---|\n';
    for (const [k, v] of Object.entries(tokens.cssVars)) md += '| `' + k + '` | `' + v + '` |\n';
  } else {
    md += '_No :root CSS variables found. Site likely uses hardcoded values._\n';
  }
  md += '\n---\n\n## 2. Typography\n\n';
  for (const t of tokens.typography) {
    md += '### ' + t.name + '\n';
    md += '**Selector:** `' + t.selector + '`\n\n';
    md += '| Property | Value |\n|---|---|\n';
    for (const [k, v] of Object.entries(t)) {
      if (!['name','selector'].includes(k)) md += '| ' + k + ' | `' + v + '` |\n';
    }
    md += '\n';
  }
  md += '\n---\n\n## 3. Colours\n\n';
  if (tokens.colours.length > 0) {
    md += '| Element | Value |\n|---|---|\n';
    for (const c of tokens.colours) md += '| ' + c.name + ' | `' + c.value + '` |\n';
  } else {
    md += '_No colour values extracted._\n';
  }
  md += '\n---\n\n## 4. Spacing & Border Radius\n\n';
  for (const s of tokens.spacing) {
    md += '### ' + s.name + '\n';
    md += '| Property | Value |\n|---|---|\n';
    for (const [k, v] of Object.entries(s)) {
      if (k !== 'name') md += '| ' + k + ' | `' + v + '` |\n';
    }
    md += '\n';
  }
  md += '\n---\n\n## 5. Font Imports\n\n';
  if (tokens.fontImports.length > 0) {
    tokens.fontImports.forEach(f => { md += '- `' + f + '`\n'; });
  } else {
    md += '_No external font imports detected. Fonts may be self-hosted._\n';
  }
  md += '\n---\n\n## 6. Key CSS Classes for VWO Selectors\n\n';
  if (Object.keys(tokens.keyClasses).length > 0) {
    md += '| Element | Tag | Classes | ID |\n|---|---|---|---|\n';
    for (const [name, info] of Object.entries(tokens.keyClasses)) {
      md += '| ' + name + ' | `' + info.tagName + '` | `' + (info.classes || '—') + '` | `' + (info.id || '—') + '` |\n';
    }
  }
  md += '\n---\n\n## 7. Page Meta\n\n';
  md += '| Field | Value |\n|---|---|\n';
  md += '| Title | ' + tokens.meta.title + ' |\n';
  md += '| Description | ' + (tokens.meta.description || '—') + ' |\n';
  md += '| Generator | ' + (tokens.meta.generator || '—') + ' |\n';
  md += '| Platform | ' + (tokens.meta.detectedPlatform || '— check manually') + ' |\n';
  md += '\n---\n\n## 8. Manual Checks\n\n';
  md += '- [ ] Verify primary brand colour is correct\n';
  md += '- [ ] Confirm heading font name and weight\n';
  md += '- [ ] Check button border-radius on live site\n';
  md += '- [ ] Confirm VWO anti-flicker implementation type\n';
  md += '- [ ] Note any Tailwind or CSS-in-JS classes extractor may have missed\n';
  md += '- [ ] Check mobile breakpoints manually\n';
  // SAVE FILE
  const outputDir = path.join('clients', clientName);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, 'design-tokens.md');
  fs.writeFileSync(outputPath, md);
  // CONSOLE SUMMARY
  console.log('\n═══════════════════════════════════════════');
  console.log('  EXTRACTION COMPLETE');
  console.log('═══════════════════════════════════════════');
  console.log('  CSS variables:    ' + Object.keys(tokens.cssVars).length);
  console.log('  Typography:       ' + tokens.typography.length + ' elements');
  console.log('  Colours:          ' + tokens.colours.length);
  console.log('  Spacing:          ' + tokens.spacing.length);
  console.log('  Font imports:     ' + tokens.fontImports.length);
  console.log('  VWO selectors:    ' + Object.keys(tokens.keyClasses).length);
  console.log('  Platform:         ' + (tokens.meta.detectedPlatform || 'Unknown'));
  console.log('───────────────────────────────────────────');
  console.log('  Saved to: ' + outputPath);
  console.log('═══════════════════════════════════════════\n');
  if (tokens.colours.length > 0) {
    console.log('  Colours found:');
    tokens.colours.forEach(c => console.log('    ' + c.name.padEnd(25) + ' ' + c.value));
    console.log('');
  }
  if (tokens.typography.length > 0) {
    console.log('  Fonts found:');
    tokens.typography.forEach(t => {
      if (t['font-family']) console.log('    ' + t.name.padEnd(20) + ' ' + t['font-family']);
    });
    console.log('');
  }
  console.log('design-tokens.md saved to ' + outputPath);
  console.log('Copy contents into clients/' + clientName + '/context.md Section 3\n');
}
extractTokens().catch(err => {
  console.error('Extraction failed:', err.message);
  process.exit(1);
});
