/**
 * CRO OS — Stage 3 Live QA Automation
 * 
 * Automates the "Could not test" amber events from the verification report.
 * Uses Playwright to drive a real browser through each funnel stage,
 * intercepts GA4 network calls, and verifies events fire with correct parameters.
 * 
 * Usage:
 *   node tools/audit/stage3-qa.js --client powerleague --url https://www.powerleague.com/football-birthday-party
 *   node tools/audit/stage3-qa.js --client koalify --url https://koalify.com.au
 * 
 * Outputs:
 *   clients/[client]/audit-stage3-[date].json  — full results
 *   clients/[client]/audit-stage3-[date].csv   — flat file for import
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const clientArg = args[args.indexOf('--client') + 1];
const urlArg = args[args.indexOf('--url') + 1];

if (!clientArg || !urlArg) {
  console.error('Usage: node stage3-qa.js --client [name] --url [url]');
  process.exit(1);
}

// ─── Expected events per vertical ────────────────────────────────────────────
// Loaded from client config — falls back to vertical defaults

const EVENT_SCHEMAS = {
  // Lead generation / BFSI / mortgage
  lead_gen: [
    {
      event: 'page_view',
      trigger: 'page_load',
      required_params: ['page_location', 'page_title'],
      optional_params: ['page_referrer'],
      testable: 'auto'
    },
    {
      event: 'scroll',
      trigger: '90_percent_scroll',
      required_params: ['percent_scrolled'],
      testable: 'auto'
    },
    {
      event: 'cta_click',
      trigger: 'user_clicks_cta',
      required_params: ['cta_text', 'cta_location', 'cta_destination'],
      testable: 'interaction',
      action: 'click_primary_cta'
    },
    {
      event: 'form_open',
      trigger: 'user_opens_form',
      required_params: ['form_type', 'form_location'],
      testable: 'interaction',
      action: 'open_form'
    },
    {
      event: 'form_step_complete',
      trigger: 'user_completes_form_step',
      required_params: ['form_type', 'step_number', 'step_name'],
      testable: 'interaction',
      action: 'complete_form_step'
    },
    {
      event: 'form_submit',
      trigger: 'user_submits_form',
      required_params: ['form_type', 'form_location'],
      optional_params: ['email'],
      testable: 'interaction',
      action: 'submit_form'
    },
    {
      event: 'calculator_use',
      trigger: 'user_uses_calculator',
      required_params: ['calculator_type'],
      optional_params: ['result'],
      testable: 'interaction',
      action: 'use_calculator'
    }
  ],

  // Ecommerce / activity booking
  ecommerce: [
    {
      event: 'page_view',
      trigger: 'page_load',
      required_params: ['page_location', 'page_title'],
      testable: 'auto'
    },
    {
      event: 'view_item_list',
      trigger: 'category_page_load',
      required_params: ['item_list_name', 'items'],
      item_required: ['item_id', 'item_name', 'price'],
      testable: 'auto'
    },
    {
      event: 'view_item',
      trigger: 'product_page_load',
      required_params: ['items'],
      item_required: ['item_id', 'item_name', 'item_category', 'price'],
      testable: 'auto'
    },
    {
      event: 'select_item',
      trigger: 'user_clicks_product',
      required_params: ['item_list_name', 'items'],
      testable: 'interaction',
      action: 'click_product'
    },
    {
      event: 'add_to_cart',
      trigger: 'user_adds_to_cart',
      required_params: ['currency', 'value', 'items'],
      item_required: ['item_id', 'item_name', 'price', 'quantity'],
      value_must_be_number: true,
      testable: 'interaction',
      action: 'add_to_cart'
    },
    {
      event: 'begin_checkout',
      trigger: 'user_begins_checkout',
      required_params: ['currency', 'value', 'items'],
      value_must_be_number: true,
      testable: 'interaction',
      action: 'begin_checkout'
    },
    {
      event: 'purchase',
      trigger: 'transaction_complete',
      required_params: ['transaction_id', 'currency', 'value', 'items'],
      item_required: ['item_id', 'item_name', 'price', 'quantity'],
      value_must_be_number: true,
      transaction_id_must_be_unique: true,
      testable: 'manual_only', // Cannot automate real purchase
      note: 'Verify manually using GTM Preview + a test transaction'
    }
  ],

  // Leisure / activity booking (Powerleague model)
  leisure: [
    {
      event: 'page_view',
      trigger: 'page_load',
      required_params: ['page_location', 'page_title'],
      testable: 'auto'
    },
    {
      event: 'view_item',
      trigger: 'package_page_load',
      required_params: ['items'],
      item_required: ['item_id', 'item_name', 'item_category', 'price'],
      testable: 'auto'
    },
    {
      event: 'select_item',
      trigger: 'user_selects_package',
      required_params: ['items'],
      item_required: ['item_id', 'item_name'],
      testable: 'interaction',
      action: 'select_package'
    },
    {
      event: 'date_picker_open',
      trigger: 'user_opens_date_picker',
      required_params: ['item_id'],
      testable: 'interaction',
      action: 'open_date_picker',
      custom: true
    },
    {
      event: 'location_selected',
      trigger: 'user_selects_location',
      required_params: ['location_name'],
      testable: 'interaction',
      action: 'select_location',
      custom: true
    },
    {
      event: 'begin_checkout',
      trigger: 'user_begins_checkout',
      required_params: ['currency', 'value', 'items'],
      value_must_be_number: true,
      testable: 'interaction',
      action: 'begin_checkout'
    },
    {
      event: 'purchase',
      trigger: 'booking_complete',
      required_params: ['transaction_id', 'currency', 'value', 'items'],
      value_must_be_number: true,
      testable: 'manual_only',
      note: 'Verify manually — requires a real test booking'
    }
  ]
};

// ─── Known failure patterns ───────────────────────────────────────────────────

const FAILURE_PATTERNS = [
  {
    id: 'undefined_params',
    check: (params) => Object.values(params).some(v => v === 'undefined' || v === undefined),
    severity: 'fail',
    message: 'One or more parameters have value "undefined". DLV variable names likely do not match the dataLayer push.',
    fix: 'Check DLV variable names in GTM match the exact keys in the dataLayer.push() call on the page.'
  },
  {
    id: 'null_params',
    check: (params) => Object.values(params).some(v => v === null),
    severity: 'warn',
    message: 'One or more parameters are null. May be expected for optional params but check required ones.',
    fix: 'Confirm whether null is an expected value for this parameter or whether the dataLayer push is failing.'
  },
  {
    id: 'value_is_string',
    check: (params, schema) => schema.value_must_be_number && params.value && typeof params.value === 'string',
    severity: 'fail',
    message: 'The "value" parameter is a string, not a number. GA4 requires numeric values for revenue tracking.',
    fix: 'Ensure the dataLayer push sends value as a number: value: 29.99 — not value: "29.99"'
  },
  {
    id: 'empty_items_array',
    check: (params, schema) => schema.item_required && (!params.items || params.items.length === 0),
    severity: 'fail',
    message: 'The items[] array is empty or missing. No product data is being tracked.',
    fix: 'Check the ecommerce dataLayer structure follows GA4 required format: ecommerce.items[]'
  },
  {
    id: 'items_missing_required_fields',
    check: (params, schema) => {
      if (!schema.item_required || !params.items || params.items.length === 0) return false;
      return schema.item_required.some(field => !params.items[0][field]);
    },
    severity: 'fail',
    message: 'Items array is present but missing required fields (item_id, item_name, price, or quantity).',
    fix: 'Check each item object in the dataLayer push includes all required fields.'
  },
  {
    id: 'currency_missing',
    check: (params, schema) => schema.required_params.includes('currency') && !params.currency,
    severity: 'fail',
    message: 'Currency parameter is missing. Revenue events require a valid ISO currency code.',
    fix: 'Add currency to the dataLayer push: currency: "GBP"'
  },
  {
    id: 'duplicate_firing',
    check: (params, schema, fireCount) => fireCount > 1,
    severity: 'warn',
    message: 'Event fired more than once for a single user action. May cause double-counted conversions.',
    fix: 'Check trigger conditions in GTM — add "Once per event" or "Once per page" firing limit.'
  },
  {
    id: 'transaction_id_missing',
    check: (params, schema) => schema.required_params.includes('transaction_id') && !params.transaction_id,
    severity: 'fail',
    message: 'transaction_id is missing on purchase event. Cannot deduplicate transactions in GA4.',
    fix: 'Ensure the confirmation page pushes a unique transaction ID to the dataLayer on every purchase.'
  }
];

// ─── GA4 network interceptor ──────────────────────────────────────────────────

class GA4Interceptor {
  constructor() {
    this.events = [];
    this.measurementId = null;
  }

  parseCollectCall(url) {
    try {
      const urlObj = new URL(url);
      const params = {};
      urlObj.searchParams.forEach((v, k) => { params[k] = v; });

      // Parse event parameters (ep.xxx = event param, epn.xxx = numeric event param)
      const eventParams = {};
      Object.entries(params).forEach(([k, v]) => {
        if (k.startsWith('ep.')) eventParams[k.slice(3)] = v;
        if (k.startsWith('epn.')) eventParams[k.slice(4)] = parseFloat(v);
      });

      return {
        event_name: params.en,
        measurement_id: params.tid,
        client_id: params.cid,
        params: eventParams,
        raw: params,
        timestamp: Date.now()
      };
    } catch (e) {
      return null;
    }
  }

  attach(page) {
    page.on('request', req => {
      const url = req.url();
      if (url.includes('google-analytics.com/g/collect') ||
          url.includes('analytics.google.com/g/collect')) {
        const parsed = this.parseCollectCall(url);
        if (parsed) {
          this.events.push(parsed);
          if (!this.measurementId && parsed.measurement_id) {
            this.measurementId = parsed.measurement_id;
          }
        }
      }
    });
  }

  getEventsOfType(eventName) {
    return this.events.filter(e => e.event_name === eventName);
  }

  clear() {
    this.events = [];
  }
}

// ─── Audit runner ─────────────────────────────────────────────────────────────

async function runAudit(client, url) {
  const date = new Date().toISOString().split('T')[0];
  const results = [];

  // Load client config to get vertical
  let vertical = 'ecommerce';
  try {
    const config = JSON.parse(fs.readFileSync(`clients/${client}/config.json`, 'utf8'));
    if (config.vertical === 'composite' && config.verticals && config.verticals.length > 0) {
      vertical = config.verticals[0];
      console.log(`Composite client — auditing against primary vertical: ${vertical}`);
    } else if (config.vertical && config.vertical !== 'pending_phase1') {
      vertical = config.vertical;
    } else if (config.vertical === 'pending_phase1') {
      vertical = 'ecommerce';
      console.warn('WARNING: vertical is pending_phase1 — audit running against ecommerce schema as fallback. Update config.json after Phase 1 completes.');
    } else {
      vertical = config.vertical || 'ecommerce';
    }
  } catch (e) {
    console.log('No client config found — defaulting to ecommerce vertical');
  }

  const schemas = EVENT_SCHEMAS[vertical] || EVENT_SCHEMAS.ecommerce;
  console.log(`\nCRO OS — Stage 3 Live QA Audit`);
  console.log(`Client: ${client} | URL: ${url} | Vertical: ${vertical}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();
  const interceptor = new GA4Interceptor();
  interceptor.attach(page);

  try {
    // ── Step 1: Navigate to page, wait for network idle ──
    console.log(`Loading ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // ── Step 2: Test auto-testable events (fire on page load) ──
    for (const schema of schemas.filter(s => s.testable === 'auto')) {
      const fired = interceptor.getEventsOfType(schema.event);
      await auditEvent(schema, fired, results, client, url, date, 'auto');
    }

    // ── Step 3: Scroll to 90% to trigger scroll event ──
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.92));
    await page.waitForTimeout(1500);
    const scrollEvents = interceptor.getEventsOfType('scroll');
    const scrollSchema = schemas.find(s => s.event === 'scroll');
    if (scrollSchema) await auditEvent(scrollSchema, scrollEvents, results, client, url, date, 'auto_scroll');

    // ── Step 4: Interaction events — attempt where possible ──
    interceptor.clear();

    for (const schema of schemas.filter(s => s.testable === 'interaction')) {
      await attemptInteractionTest(page, interceptor, schema, results, client, url, date);
    }

    // ── Step 5: Manual-only events — flag as requires manual QA ──
    for (const schema of schemas.filter(s => s.testable === 'manual_only')) {
      results.push({
        client,
        audit_date: date,
        url,
        vertical,
        tag_name: schema.custom ? 'Custom Event' : 'GA4 Ecommerce',
        event_name: schema.event,
        trigger: schema.trigger,
        status: 'manual_required',
        parameters_checked: schema.required_params.join(', '),
        discrepancy: 'Cannot be automated — requires real user action',
        action_required: schema.note || 'Complete manual QA using GTM Preview + GA4 DebugView',
        test_method: 'manual_only'
      });
      console.log(`  ⬜  ${schema.event} — Manual QA required`);
    }

    // ── Step 6: VWO integration check ──
    await checkVWOIntegration(page, results, client, url, date, vertical);

    // ── Step 7: Check for GTM ──
    await checkGTMPresence(page, results, client, url, date, vertical);

  } catch (error) {
    console.error('Audit error:', error.message);
    results.push({
      client, audit_date: date, url, vertical,
      tag_name: 'Audit Runner', event_name: 'audit_error',
      status: 'fail', discrepancy: error.message,
      action_required: 'Check the URL is accessible and the site is live'
    });
  } finally {
    await browser.close();
  }

  return results;
}

// ─── Event auditor ────────────────────────────────────────────────────────────

async function auditEvent(schema, fired, results, client, url, date, method) {
  const result = {
    client,
    audit_date: date,
    url,
    tag_name: schema.custom ? 'Custom Event' : 'GA4 Event',
    event_name: schema.event,
    trigger: schema.trigger,
    parameters_checked: schema.required_params.join(', '),
    test_method: method,
    status: 'pass',
    discrepancy: 'none',
    action_required: 'none'
  };

  if (fired.length === 0) {
    result.status = 'fail';
    result.discrepancy = 'Event did not fire';
    result.action_required = `Check GTM trigger for ${schema.event} — event not detected in network calls`;
    console.log(`  ❌  ${schema.event} — NOT FIRED`);
    results.push(result);
    return;
  }

  const event = fired[0];
  const issues = [];

  // Check required params
  for (const param of schema.required_params) {
    if (param === 'items') continue; // checked separately
    if (!event.params[param] && event.params[param] !== 0) {
      issues.push(`Missing required parameter: ${param}`);
    }
  }

  // Run failure pattern checks
  for (const pattern of FAILURE_PATTERNS) {
    try {
      if (pattern.id === 'duplicate_firing') {
        if (pattern.check(event.params, schema, fired.length)) {
          issues.push(`${pattern.message} (fired ${fired.length}× — ${pattern.fix})`);
        }
      } else {
        if (pattern.check(event.params, schema)) {
          issues.push(`${pattern.message} (${pattern.fix})`);
        }
      }
    } catch (e) { /* skip */ }
  }

  if (issues.length > 0) {
    result.status = issues.some(i => i.includes('fail') || i.includes('Missing')) ? 'fail' : 'warn';
    result.discrepancy = issues.join(' | ');
    result.action_required = `Fix ${issues.length} issue(s) — see discrepancy`;
    console.log(`  ⚠️   ${schema.event} — ${issues.length} issue(s) found`);
  } else {
    console.log(`  ✅  ${schema.event} — OK (params: ${Object.keys(event.params).join(', ')})`);
  }

  results.push(result);
}

// ─── Interaction test attempts ────────────────────────────────────────────────

async function attemptInteractionTest(page, interceptor, schema, results, client, url, date) {
  const result = {
    client, audit_date: date, url,
    tag_name: schema.custom ? 'Custom Event' : 'GA4 Event',
    event_name: schema.event,
    trigger: schema.trigger,
    parameters_checked: schema.required_params.join(', '),
    test_method: 'interaction_attempt',
    status: 'not_tested',
    discrepancy: 'Interaction test skipped — add selector to client config for full automation',
    action_required: 'Manual QA required for this event'
  };

  try {
    // Load client-specific selectors if available
    let selectors = {};
    try {
      const clientConfig = JSON.parse(fs.readFileSync(`clients/${client}/config.json`, 'utf8'));
      selectors = clientConfig.qa_selectors || {};
    } catch (e) { /* no selectors defined */ }

    const selector = selectors[schema.action];
    if (!selector) {
      console.log(`  🔶  ${schema.event} — No selector defined (add to client config for automation)`);
      results.push(result);
      return;
    }

    // Attempt the interaction
    interceptor.clear();
    const element = await page.$(selector);
    if (!element) {
      result.status = 'warn';
      result.discrepancy = `Selector "${selector}" not found on page`;
      result.action_required = 'Update qa_selectors in client config.json — element not found';
      console.log(`  ⚠️   ${schema.event} — Selector not found: ${selector}`);
      results.push(result);
      return;
    }

    await element.click();
    await page.waitForTimeout(1000);

    const fired = interceptor.getEventsOfType(schema.event);
    await auditEvent(schema, fired, results, client, url, date, 'interaction_automated');

  } catch (e) {
    result.status = 'warn';
    result.discrepancy = `Interaction test failed: ${e.message}`;
    result.action_required = 'Manual QA required — automated interaction failed';
    console.log(`  🔶  ${schema.event} — Interaction test failed: ${e.message}`);
    results.push(result);
  }
}

// ─── VWO integration check ────────────────────────────────────────────────────

async function checkVWOIntegration(page, results, client, url, date, vertical) {
  const vwoPresent = await page.evaluate(() => {
    return typeof window._vwo_code !== 'undefined' || typeof window.VWO !== 'undefined';
  });

  const vwoInHead = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll('script'));
    return scripts.some(s => s.src && s.src.includes('vwo.com'));
  });

  results.push({
    client, audit_date: date, url, vertical,
    tag_name: 'VWO SmartCode',
    event_name: 'vwo_presence',
    trigger: 'page_load',
    status: vwoPresent ? 'pass' : 'fail',
    parameters_checked: 'window._vwo_code, window.VWO',
    discrepancy: vwoPresent ? 'none' : 'VWO not detected on page',
    action_required: vwoPresent ? 'none' : 'Install VWO SmartCode in <head> before </head>',
    test_method: 'auto'
  });

  if (vwoPresent && !vwoInHead) {
    results.push({
      client, audit_date: date, url, vertical,
      tag_name: 'VWO SmartCode position',
      event_name: 'vwo_head_position',
      trigger: 'page_load',
      status: 'warn',
      parameters_checked: 'script position in DOM',
      discrepancy: 'VWO detected but not loaded via external script — may be inline or via GTM',
      action_required: 'Verify VWO SmartCode is synchronous in <head> — async loading causes flicker',
      test_method: 'auto'
    });
  }

  console.log(`  ${vwoPresent ? '✅' : '❌'}  VWO presence — ${vwoPresent ? 'detected' : 'NOT FOUND'}`);
}

// ─── GTM presence check ───────────────────────────────────────────────────────

async function checkGTMPresence(page, results, client, url, date, vertical) {
  const gtmPresent = await page.evaluate(() => typeof window.dataLayer !== 'undefined');
  const gtmId = await page.evaluate(() => {
    if (!window.google_tag_manager) return null;
    return Object.keys(window.google_tag_manager)[0];
  });

  results.push({
    client, audit_date: date, url, vertical,
    tag_name: 'GTM dataLayer',
    event_name: 'gtm_presence',
    trigger: 'page_load',
    status: gtmPresent ? 'pass' : 'fail',
    parameters_checked: 'window.dataLayer',
    discrepancy: gtmPresent ? 'none' : 'dataLayer not found on page',
    action_required: gtmPresent ? 'none' : 'Install GTM snippet on all pages',
    notes: gtmId ? `GTM ID: ${gtmId}` : 'GTM ID could not be detected',
    test_method: 'auto'
  });

  console.log(`  ${gtmPresent ? '✅' : '❌'}  GTM dataLayer — ${gtmPresent ? `present (${gtmId || 'ID unknown'})` : 'NOT FOUND'}`);
}

// ─── Output writer ────────────────────────────────────────────────────────────

function writeResults(results, client) {
  const date = new Date().toISOString().split('T')[0];
  const outDir = `clients/${client}`;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // JSON output
  const jsonPath = `${outDir}/audit-stage3-${date}.json`;
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  // CSV output — matches audit log schema from funnel-analysis.md
  const cols = ['client','audit_date','url','tag_name','event_name','trigger','status','parameters_checked','discrepancy','action_required','test_method'];
  const csv = [
    cols.join(','),
    ...results.map(r => cols.map(c => {
      const v = r[c] || '';
      return String(v).includes(',') ? `"${v}"` : v;
    }).join(','))
  ].join('\n');

  const csvPath = `${outDir}/audit-stage3-${date}.csv`;
  fs.writeFileSync(csvPath, csv);

  // Summary
  const pass = results.filter(r => r.status === 'pass').length;
  const warn = results.filter(r => r.status === 'warn').length;
  const fail = results.filter(r => r.status === 'fail').length;
  const manual = results.filter(r => r.status === 'manual_required').length;

  console.log(`\n─────────────────────────────────────`);
  console.log(`Audit complete — ${results.length} checks`);
  console.log(`  ✅ Pass:           ${pass}`);
  console.log(`  ⚠️  Warn:           ${warn}`);
  console.log(`  ❌ Fail:           ${fail}`);
  console.log(`  ⬜ Manual needed:  ${manual}`);
  console.log(`\nOutputs:`);
  console.log(`  ${jsonPath}`);
  console.log(`  ${csvPath}`);

  if (fail > 0) {
    console.log(`\n❌ FAILED EVENTS:`);
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  ${r.event_name}: ${r.action_required}`);
    });
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  const results = await runAudit(clientArg, urlArg);
  writeResults(results, clientArg);
})();
