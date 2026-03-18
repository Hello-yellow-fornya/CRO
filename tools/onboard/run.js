#!/usr/bin/env node

/**
 * CRO OS — Onboarding Orchestrator
 *
 * Run this in Claude Code to onboard a new client interactively.
 * Each phase runs, Claude reviews the output, surfaces what needs
 * human attention, and waits for your confirmation before proceeding.
 *
 * Usage:
 *   node tools/onboard/run.js --client chelseapiers --url https://www.chelseapiers.com --name "Chelsea Piers"
 *   node tools/onboard/run.js --client koalify      (if config.json already exists)
 *
 * Environment variables required:
 *   ANTHROPIC_API_KEY        — for research.js, generate-report.js, and gate reviews
 *   GCP_SERVICE_ACCOUNT_KEY  — for ga4-query.js (optional — skip if not set)
 *
 * All scripts are called as child processes so their output streams live.
 */

const { execSync, spawnSync } = require('child_process');
const readline = require('readline');
const https    = require('https');
const fs       = require('fs');
const path     = require('path');

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const get  = flag => { const i = args.indexOf(flag); return i !== -1 ? args[i+1] : null; };

const CLIENT      = get('--client') || process.env.CLIENT;
const URL         = get('--url')    || process.env.URL;
const CLIENT_NAME = get('--name')   || process.env.CLIENT_NAME;
const SKIP_TO     = get('--from')   || null; // --from ga4 | scaffold | audit | report

if (!CLIENT) {
  console.error('\nUsage: node tools/onboard/run.js --client <slug> [--url <url>] [--name "Display Name"]');
  console.error('       node tools/onboard/run.js --client koalify  (if config already exists)\n');
  process.exit(1);
}

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('\nANTHROPIC_API_KEY environment variable not set.');
  process.exit(1);
}

// ── Readline ──────────────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

// ── Display helpers ───────────────────────────────────────────────────────────

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
  cyan: '\x1b[36m', white: '\x1b[37m', blue: '\x1b[34m'
};

function banner(text, colour = C.cyan) {
  const line = '═'.repeat(56);
  console.log(`\n${colour}${C.bold}${line}`);
  console.log(`  ${text}`);
  console.log(`${line}${C.reset}\n`);
}

function step(n, total, text) {
  console.log(`\n${C.blue}${C.bold}[${n}/${total}]${C.reset} ${C.bold}${text}${C.reset}`);
}

function ok(text)   { console.log(`${C.green}  ✓ ${text}${C.reset}`); }
function warn(text) { console.log(`${C.yellow}  ⚠ ${text}${C.reset}`); }
function err(text)  { console.log(`${C.red}  ✗ ${text}${C.reset}`); }
function info(text) { console.log(`${C.dim}  ${text}${C.reset}`); }

// ── Run a child process, streaming output ─────────────────────────────────────

function run(cmd, opts = {}) {
  console.log(`\n${C.dim}$ ${cmd}${C.reset}`);
  const result = spawnSync(cmd, {
    shell: true,
    stdio: opts.silent ? 'pipe' : 'inherit',
    env: { ...process.env, ...opts.env }
  });
  if (result.status !== 0 && !opts.allowFail) {
    if (opts.silent && result.stderr) {
      console.error(result.stderr.toString());
    }
    return false;
  }
  return opts.silent ? (result.stdout || '').toString() : true;
}

// ── Claude API call ───────────────────────────────────────────────────────────

function callClaude(prompt, maxTokens = 1500) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
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

function readFile(p, fallback = '') {
  try { return fs.readFileSync(p, 'utf8'); } catch(e) { return fallback; }
}

// ── Gate: Claude reviews output and asks for confirmation ─────────────────────

async function gate(gateName, reviewPrompt, continueMessage) {
  banner(`GATE — ${gateName}`, C.yellow);
  console.log(`${C.dim}Claude is reviewing the outputs...${C.reset}\n`);

  let review;
  try {
    review = await callClaude(reviewPrompt);
  } catch(e) {
    warn(`Could not get Claude review: ${e.message}`);
    review = '(Claude review unavailable — please review outputs manually)';
  }

  console.log(review);
  console.log();

  while (true) {
    const answer = await ask(
      `\n${C.bold}${continueMessage}\n` +
      `${C.dim}(yes to proceed / no to abort / edit to open research.md in editor)${C.reset}\n` +
      `> `
    );
    const a = answer.trim().toLowerCase();
    if (a === 'yes' || a === 'y') {
      ok('Gate passed — proceeding');
      return true;
    } else if (a === 'no' || a === 'n') {
      console.log('\nOnboarding paused. Review the files in clients/' + CLIENT + '/ and re-run with --from <phase> to resume.\n');
      rl.close();
      process.exit(0);
    } else if (a === 'edit') {
      const editor = process.env.EDITOR || 'nano';
      run(`${editor} clients/${CLIENT}/research.md`, { allowFail: true });
    } else {
      // Treat as a correction/question — send to Claude for a response
      console.log(`\n${C.dim}Asking Claude...${C.reset}\n`);
      try {
        const followUp = await callClaude(
          `Context: reviewing CRO OS onboarding output for client "${CLIENT}".\n\n` +
          `Previous review:\n${review}\n\n` +
          `Human says: ${answer}\n\n` +
          `Respond helpfully and concisely. If they're asking you to correct something, ` +
          `tell them exactly what to change in which file.`
        );
        console.log(followUp);
      } catch(e) {
        warn('Could not reach Claude: ' + e.message);
      }
    }
  }
}

// ── Phase detection (for --from resume) ──────────────────────────────────────

const PHASES = ['research', 'ga4', 'scaffold', 'tokens', 'audit', 'gate1', 'report', 'gate2', 'done'];
const skipBefore = SKIP_TO ? PHASES.indexOf(SKIP_TO) : -1;
const shouldRun  = phase => PHASES.indexOf(phase) >= skipBefore;

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  banner(`CRO OS — Onboarding: ${CLIENT}`, C.green);

  const config = readFile(`clients/${CLIENT}/config.json`);
  const existingConfig = config ? JSON.parse(config) : null;

  const clientName = CLIENT_NAME || (existingConfig && existingConfig.client_name) || CLIENT;
  const url        = URL         || (existingConfig && existingConfig.url)         || '';

  if (!url && !existingConfig) {
    err('No URL provided and no existing config found.');
    console.error('Usage: node tools/onboard/run.js --client <slug> --url <url> --name "Name"\n');
    rl.close(); process.exit(1);
  }

  console.log(`${C.bold}Client:${C.reset}  ${clientName}`);
  console.log(`${C.bold}URL:${C.reset}     ${url || '(from config)'}`);
  console.log(`${C.bold}Date:${C.reset}    ${new Date().toISOString().split('T')[0]}`);
  if (SKIP_TO) console.log(`${C.yellow}Resuming from: ${SKIP_TO}${C.reset}`);
  console.log();

  // ── Phase 1: Research ──────────────────────────────────────────────────────

  if (shouldRun('research')) {
    step(1, 7, 'Phase 1 — Machine reads the client site');
    const ok1 = run('node tools/onboard/research.js', {
      env: { CLIENT, CLIENT_NAME: clientName, URL: url, VERTICAL_HINT: 'auto' }
    });
    if (!ok1) { err('Research failed'); rl.close(); process.exit(1); }
    ok('research.md written');
  } else {
    info('Phase 1 skipped (--from)');
  }

  // ── Phase 1.5: GA4 data ────────────────────────────────────────────────────

  if (shouldRun('ga4')) {
    step(2, 7, 'Phase 1.5 — Pull GA4 data');
    const cfg = JSON.parse(readFile(`clients/${CLIENT}/config.json`, '{}'));
    const propId = cfg.ga4_property_id;

    if (!propId || propId.startsWith('REPLACE')) {
      warn('ga4_property_id not set in config.json — skipping GA4 pull');
      warn('Report will use vertical benchmark estimates for traffic and CVR');
      info('To add it: edit clients/' + CLIENT + '/config.json and set ga4_property_id');
    } else if (!process.env.GCP_SERVICE_ACCOUNT_KEY) {
      warn('GCP_SERVICE_ACCOUNT_KEY not set — skipping GA4 pull');
    } else {
      const ok2 = run(`node tools/ga4-query.js --client ${CLIENT} --days 90`, { allowFail: true });
      if (ok2) ok('ga4-snapshot.json written');
      else warn('GA4 pull failed — report will use estimates');
    }
  } else {
    info('Phase 1.5 skipped (--from)');
  }

  // ── Gate 1: Review research + GA4 ─────────────────────────────────────────

  if (shouldRun('gate1')) {
    const researchMd  = readFile(`clients/${CLIENT}/research.md`);
    const ga4Raw      = readFile(`clients/${CLIENT}/ga4-snapshot.json`);
    const ga4Summary  = ga4Raw ? (() => {
      try {
        const s = JSON.parse(ga4Raw).summary || {};
        return `Weekly avg sessions: ${s.weekly_avg_sessions}, Blended CVR: ${s.blended_cvr_pct}%, New CVR: ${s.new_user_cvr_pct}%, Returning CVR: ${s.returning_user_cvr_pct}%, Assessment: ${s.mde_note}`;
      } catch(e) { return 'Could not parse'; }
    })() : 'Not available';

    await gate(
      'Review Phase 1 outputs before scaffolding',
      `You are reviewing CRO OS Phase 1 onboarding outputs for client "${clientName}" (${url}).
Your job is to identify anything the human needs to correct before proceeding.

RESEARCH.MD (first 4000 chars):
${researchMd.substring(0, 4000)}

GA4 SUMMARY: ${ga4Summary}

Review and report:

1. VERTICAL CLASSIFICATION — is it correct? If composite, are both verticals right?
2. REVENUE LINES — are all the business's products/funnels identified?
3. FUNNEL MAP — does each funnel map look accurate for this type of business?
4. [UNCONFIRMED] ITEMS — list each one and ask a specific question to resolve it
5. GA4 DATA — any obvious quality issues? Is the CVR plausible for this vertical?
6. TECH STACK — any implications for CRO tooling (headless, JS-rendered, subdomains)?
7. VERDICT — safe to proceed? Or what must be corrected first?

Be specific. Reference actual content from the research.md. Keep it scannable.`,
      'Does this look right? Proceed to scaffold + audit? (yes / no / or ask a question)'
    );
  }

  // ── Phase 2: Scaffold ──────────────────────────────────────────────────────

  if (shouldRun('scaffold')) {
    step(3, 7, 'Phase 2 — Scaffold client folder');
    run('node tools/onboard/scaffold.js', {
      env: { CLIENT, CLIENT_NAME: clientName, URL: url }
    });
    ok('Client folder structure created');
  } else {
    info('Phase 2 skipped (--from)');
  }

  // ── Phase 3: Design tokens ─────────────────────────────────────────────────

  if (shouldRun('tokens')) {
    step(4, 7, 'Phase 3 — Extract design tokens');
    run(`node tools/extract-tokens.js "${url}" "${CLIENT}"`, { allowFail: true });
    const hasTokens = fs.existsSync(`clients/${CLIENT}/design-tokens.md`);
    if (hasTokens) ok('design-tokens.md written');
    else warn('Token extraction failed or returned empty — check manually');
  } else {
    info('Phase 3 skipped (--from)');
  }

  // ── Phase 4: Tag audit ─────────────────────────────────────────────────────

  if (shouldRun('audit')) {
    step(5, 7, 'Phase 4 — Tag audit');
    run(`node tools/audit/stage3-qa.js --client "${CLIENT}" --url "${url}"`, { allowFail: true });
    const auditFiles = fs.existsSync(`clients/${CLIENT}`)
      ? fs.readdirSync(`clients/${CLIENT}`).filter(f => f.startsWith('audit-stage3'))
      : [];
    if (auditFiles.length) ok(`Audit complete: ${auditFiles.join(', ')}`);
    else warn('Audit did not produce output — check Playwright installation');
  } else {
    info('Phase 4 skipped (--from)');
  }

  // ── Gate 2: Review all Phase A outputs before report ──────────────────────

  if (shouldRun('gate1')) { // Gate between phases not phases themselves
    const date = new Date().toISOString().split('T')[0];
    const dir  = `clients/${CLIENT}`;
    const auditFiles = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.startsWith('audit-stage3') && f.endsWith('.csv')) : [];
    const auditCsv   = auditFiles.length ? readFile(`${dir}/${auditFiles.sort().reverse()[0]}`) : '';
    const tokens     = readFile(`${dir}/design-tokens.md`);

    await gate(
      'Review audit + tokens before generating report',
      `You are doing a pre-report quality check for CRO OS onboarding of "${clientName}".

TAG AUDIT (first 3000 chars):
${auditCsv.substring(0, 3000) || 'Not available'}

DESIGN TOKENS (first 1500 chars):
${tokens.substring(0, 1500) || 'Not available'}

Report on:
1. CRITICAL tag failures — list each event that is broken and what it blocks
2. WARNINGS — tag issues that need monitoring but don't block tests
3. TOKENS — did the extraction work? Are there obvious gaps (no fonts, no colours)?
4. DATA CONFIDENCE — given the audit, rate the GA4 data confidence: High / Medium / Low
5. BLOCKERS — is there anything that should be fixed BEFORE the report is generated?

Be specific and scannable. Flag the most urgent issue first.`,
      'Ready to generate the onboarding report? (yes / no / or ask a question)'
    );
  }

  // ── Phase 5: Generate report ───────────────────────────────────────────────

  if (shouldRun('report')) {
    step(6, 7, 'Phase 5 — Generate onboarding report');
    const cfg2 = JSON.parse(readFile(`clients/${CLIENT}/config.json`, '{}'));
    const ok5 = run('node tools/onboard/generate-report.js', {
      env: {
        CLIENT,
        CLIENT_NAME: cfg2.client_name || clientName,
        URL: cfg2.url || url
      }
    });
    if (ok5) ok('onboarding-report.md written');
    else { err('Report generation failed'); rl.close(); process.exit(1); }
  } else {
    info('Phase 5 skipped (--from)');
  }

  // ── Gate 3: Review onboarding report ──────────────────────────────────────

  if (shouldRun('gate2')) {
    const report = readFile(`clients/${CLIENT}/onboarding-report.md`);

    await gate(
      'Review onboarding report — final gate before client is active',
      `You are doing the final Gate 2 review of the CRO OS onboarding report for "${clientName}".

ONBOARDING REPORT (first 6000 chars):
${report.substring(0, 6000)}

Walk through each area and flag what the human needs to act on:

1. [UNCONFIRMED] ITEMS — list every one still in the report with a specific question
2. TAG FIXES — which section 2 items are CRITICAL (block tests) vs advisory?
3. GA4 SETUP — what exact steps does the human need to take in GA4 this week?
4. OFF-LIMITS — what from section 9 should be added to off-limits.md?
5. FIRST HYPOTHESIS — which of the 3 pre-data hypotheses in section 6 is highest priority and why?
6. 30-DAY PLAN — is week 4 "first test live" realistic? Any blockers in the critical path?
7. VERDICT — what are the top 3 things to do this week before anything else?

Be specific and actionable. This is the handoff to human execution.`,
      'Does the report look good? Mark this client as active? (yes / no / or ask a question)'
    );
  }

  // ── Done ───────────────────────────────────────────────────────────────────

  step(7, 7, 'Onboarding complete');
  banner(`${clientName} is now active`, C.green);

  console.log(`${C.bold}Files created:${C.reset}`);
  const dir = `clients/${CLIENT}`;
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(f => {
      const size = fs.statSync(`${dir}/${f}`).size;
      console.log(`  ${C.dim}${dir}/${f}${C.reset} ${C.dim}(${Math.round(size/1024)}kb)${C.reset}`);
    });
  }

  console.log(`\n${C.bold}Next steps:${C.reset}`);
  console.log('  1. Fix any CRITICAL tag failures identified in Gate 2');
  console.log('  2. Complete GA4 funnel setup (see section 4 of the report)');
  console.log('  3. Run the first funnel analysis once GA4 data is flowing');
  console.log('  4. Use PROMPTS.md → "Brief a new test" when ready for the first hypothesis');

  console.log(`\n${C.dim}To re-run from a specific phase:${C.reset}`);
  console.log(`  node tools/onboard/run.js --client ${CLIENT} --from report`);
  console.log(`  node tools/onboard/run.js --client ${CLIENT} --from ga4\n`);

  rl.close();
}

main().catch(err => {
  console.error('\n' + C.red + 'Fatal error: ' + err.message + C.reset);
  rl.close();
  process.exit(1);
});
