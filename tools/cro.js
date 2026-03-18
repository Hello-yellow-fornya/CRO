#!/usr/bin/env node

/**
 * CRO OS — CLI
 *
 * Usage:
 *   cro new client          — onboard a new client
 *   cro clients             — list all clients with status
 *   cro client <slug>       — show detail for one client
 *   cro sync <slug>         — refresh GA4 data for a client
 *   cro sync all            — refresh GA4 data for all clients
 */

const { spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
  cyan: '\x1b[36m', gray: '\x1b[90m'
};

const args = process.argv.slice(2);
const cmd  = args.join(' ').trim().toLowerCase();

// ── Helpers ───────────────────────────────────────────────────────────────────

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch(e) { return null; }
}

function getClients() {
  const clientsDir = path.join(__dirname, '../clients');
  if (!fs.existsSync(clientsDir)) return [];
  return fs.readdirSync(clientsDir)
    .filter(d => fs.statSync(path.join(clientsDir, d)).isDirectory())
    .map(slug => {
      const dir    = path.join(clientsDir, slug);
      const config = readJSON(path.join(dir, 'config.json'));
      const status = readJSON(path.join(dir, 'onboarding-status.json'));
      const snap   = readJSON(path.join(dir, 'ga4-snapshot.json'));
      const hasReport  = fs.existsSync(path.join(dir, 'onboarding-report.md'));
      const hasResearch = fs.existsSync(path.join(dir, 'research.md'));
      const auditFiles = fs.readdirSync(dir).filter(f => f.startsWith('audit-stage3') && f.endsWith('.csv'));
      return { slug, dir, config, status, snap, hasReport, hasResearch, auditFiles };
    });
}

function run(cmd, env = {}) {
  return spawnSync(cmd, {
    shell: true, stdio: 'inherit',
    env: { ...process.env, ...env }
  });
}

// ── Commands ──────────────────────────────────────────────────────────────────

function cmdNewClient() {
  require('./onboard/new-client.js');
}

function cmdClients() {
  const clients = getClients();
  if (clients.length === 0) {
    console.log(`\n${C.dim}No clients yet. Run: cro new client${C.reset}\n`);
    return;
  }

  console.log(`\n${C.bold}Clients${C.reset}  ${C.dim}(${clients.length} total)${C.reset}\n`);

  clients.forEach(c => {
    const name    = c.config?.client_name || c.slug;
    const url     = c.config?.url || '';
    const vert    = c.config?.vertical || '—';
    const vertDisplay = c.config?.verticals
      ? c.config.verticals.join(' + ')
      : vert;

    // Status flags
    const flags = [];
    if (!c.hasResearch) flags.push(`${C.yellow}no research${C.reset}`);
    if (!c.hasReport)   flags.push(`${C.yellow}no report${C.reset}`);
    if (c.config?.ga4_property_id && !c.config.ga4_property_id.startsWith('REPLACE')) {
      if (c.snap) {
        const pulled = c.snap.pulled_at ? c.snap.pulled_at.split('T')[0] : '?';
        flags.push(`${C.green}GA4 ${pulled}${C.reset}`);
      } else {
        flags.push(`${C.yellow}GA4 not synced${C.reset}`);
      }
    } else {
      flags.push(`${C.dim}no GA4 ID${C.reset}`);
    }
    if (c.auditFiles.length) flags.push(`${C.green}audited${C.reset}`);

    console.log(`  ${C.bold}${c.slug}${C.reset}`);
    console.log(`  ${C.dim}${name} · ${url}${C.reset}`);
    console.log(`  ${C.dim}${vertDisplay}${C.reset}  ${flags.join('  ')}`);
    console.log();
  });

  console.log(`${C.dim}cro client <slug>   — full detail`);
  console.log(`cro sync <slug>     — refresh GA4 data${C.reset}\n`);
}

function cmdClient(slug) {
  if (!slug) { console.log('\nUsage: cro client <slug>\n'); return; }

  const clients = getClients();
  const c = clients.find(x => x.slug === slug);
  if (!c) {
    console.log(`\n${C.red}Client "${slug}" not found.${C.reset}`);
    console.log(`${C.dim}Run: cro clients${C.reset}\n`);
    return;
  }

  const name = c.config?.client_name || slug;
  console.log(`\n${C.bold}${name}${C.reset}  ${C.dim}${c.config?.url || ''}${C.reset}\n`);

  // Config
  if (c.config) {
    const vert = c.config.verticals
      ? c.config.verticals.join(' + ')
      : c.config.vertical || '—';
    console.log(`${C.dim}Vertical:${C.reset}   ${vert}`);
    const ga4 = c.config.ga4_property_id;
    console.log(`${C.dim}GA4 ID:${C.reset}     ${ga4 && !ga4.startsWith('REPLACE') ? ga4 : C.yellow + 'not set' + C.reset}`);
    console.log(`${C.dim}Onboarded:${C.reset}  ${c.config.onboarded || '—'}`);
    console.log(`${C.dim}VWO:${C.reset}        ${c.config.vwoImplemented ? C.green + 'yes' + C.reset : '—'}`);
  }

  // GA4 snapshot
  if (c.snap?.summary) {
    const s = c.snap.summary;
    console.log(`\n${C.bold}GA4 data${C.reset}  ${C.dim}${c.snap.days}d to ${c.snap.date_range?.endDate}${C.reset}`);
    console.log(`  Sessions/week: ${C.bold}${(s.weekly_avg_sessions || 0).toLocaleString()}${C.reset}`);
    console.log(`  Blended CVR:   ${C.bold}${s.blended_cvr_pct || 0}%${C.reset}`);
    console.log(`  New CVR:       ${s.new_user_cvr_pct || 0}%`);
    console.log(`  Returning CVR: ${s.returning_user_cvr_pct || 0}%  ${C.dim}(${s.returning_vs_new_cvr_multiplier || '?'}x new)${C.reset}`);
    console.log(`  ${C.dim}${s.mde_note || ''}${C.reset}`);
  } else {
    console.log(`\n${C.yellow}  No GA4 data — run: cro sync ${slug}${C.reset}`);
  }

  // Files
  console.log(`\n${C.bold}Files${C.reset}`);
  const checks = [
    ['research.md',          c.hasResearch],
    ['onboarding-report.md', c.hasReport],
    ['design-tokens.md',     fs.existsSync(path.join(c.dir, 'design-tokens.md'))],
    ['ga4-snapshot.json',    !!c.snap],
    ['audit',                c.auditFiles.length > 0],
  ];
  checks.forEach(([label, present]) => {
    const icon = present ? `${C.green}✓${C.reset}` : `${C.dim}—${C.reset}`;
    console.log(`  ${icon}  ${label}`);
  });

  console.log();
}

function cmdSync(slug) {
  if (!slug) { console.log('\nUsage: cro sync <slug> | cro sync all\n'); return; }

  const clients = slug === 'all' ? getClients() : getClients().filter(c => c.slug === slug);

  if (clients.length === 0) {
    console.log(`\n${C.red}Client "${slug}" not found.${C.reset}\n`); return;
  }

  clients.forEach(c => {
    const ga4Id = c.config?.ga4_property_id;
    if (!ga4Id || ga4Id.startsWith('REPLACE')) {
      console.log(`\n${C.yellow}⚠ ${c.slug}: no ga4_property_id in config.json — skipping${C.reset}`);
      return;
    }
    if (!process.env.GCP_SERVICE_ACCOUNT_KEY) {
      console.log(`\n${C.yellow}⚠ GCP_SERVICE_ACCOUNT_KEY not set${C.reset}`);
      console.log(`${C.dim}Set it in your environment and re-run${C.reset}\n`);
      return;
    }
    console.log(`\n${C.cyan}Syncing GA4 data for ${c.slug}...${C.reset}`);
    run(`node ${path.join(__dirname, 'ga4-query.js')} --client ${c.slug} --days 90`);
  });
}

function cmdHelp() {
  console.log(`
${C.bold}CRO OS${C.reset}

  ${C.cyan}cro new client${C.reset}        Onboard a new client
  ${C.cyan}cro clients${C.reset}           List all clients with status
  ${C.cyan}cro client <slug>${C.reset}     Show detail for one client
  ${C.cyan}cro sync <slug>${C.reset}       Refresh GA4 data for a client
  ${C.cyan}cro sync all${C.reset}          Refresh GA4 data for all clients
  ${C.cyan}cro work <slug>${C.reset}       Load client context into Claude Code
`);
}

// ── Route ─────────────────────────────────────────────────────────────────────

if      (cmd === 'new client')          cmdNewClient();
else if (cmd === 'clients')             cmdClients();
else if (cmd.startsWith('client '))     cmdClient(args[1]);
else if (cmd.startsWith('sync '))       cmdSync(args[1]);
else if (cmd === 'sync')                cmdSync(args[1]);
else if (cmd.startsWith('work '))      cmdWork(args[1]).catch(e => console.error(e.message));
else if (cmd === '' || cmd === 'help')  cmdHelp();
else {
  console.log(`\n${C.dim}Unknown command: ${cmd}${C.reset}`);
  cmdHelp();
}

// ── cro work <slug> ───────────────────────────────────────────────────────────
// Prompts for GA4 data source, then prints context prompt for Claude Code

async function cmdWork(slug) {
  if (!slug) { console.log('\nUsage: cro work <slug>\n'); return; }

  const clients = getClients();
  const c = clients.find(x => x.slug === slug);
  if (!c) {
    console.log(`\n${C.red}Client "${slug}" not found.${C.reset}\n`);
    return;
  }

  const name = c.config?.client_name || slug;
  const vert = c.config?.verticals
    ? c.config.verticals.join(' + ')
    : c.config?.vertical || '—';

  const kbFiles = (c.config?.verticals || [c.config?.vertical || 'leisure'])
    .map(v => ({ leisure:'leisure-sports', lead_gen:'lead-gen',
      financial_services:'financial-services', ecommerce:'ecommerce',
      saas:'saas', travel:'travel' }[v] || v))
    .map(f => `- knowledge-base/${f}.md`)
    .join('\n');

  console.log(`\n${C.cyan}${C.bold}${name}${C.reset}  ${C.dim}${vert}${C.reset}\n`);

  // ── GA4 data source picker ─────────────────────────────────────────────────

  const hasBQ      = !!(c.config?.bigquery_project && c.config?.bigquery_dataset);
  const hasSnap    = !!c.snap;
  const snapDate   = c.snap?.pulled_at?.split('T')[0] || '';
  const ga4PropId  = c.config?.ga4_property_id;
  const hasGa4Api  = ga4PropId && !ga4PropId.startsWith('REPLACE') && process.env.GCP_SERVICE_ACCOUNT_KEY;

  const options = [];
  if (hasBQ)     options.push({ key:'1', label:`Query BigQuery live`, tag:'bq' });
  if (hasGa4Api) options.push({ key: String(options.length+1), label:`Query GA4 Data API live`, tag:'api' });
                 options.push({ key: String(options.length+1), label:`Upload a GA4 export file (CSV)`, tag:'upload' });
  if (hasSnap)   options.push({ key: String(options.length+1), label:`Use last snapshot  ${C.dim}(${snapDate})${C.reset}`, tag:'snap' });
                 options.push({ key: String(options.length+1), label:`Skip GA4 data`, tag:'skip' });

  console.log(`GA4 data source:`);
  options.forEach(o => console.log(`  ${o.key}.  ${o.label}`));

  const readline = require('readline');
  const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise(r => rl2.question(`\n> `, r));
  rl2.close();

  const chosen = options.find(o => o.key === answer.trim()) || options[options.length - 1];
  console.log(`\n${C.dim}Using: ${chosen.label.replace(/\x1b\[[0-9;]*m/g,'')}${C.reset}`);

  let ga4Block = '';

  if (chosen.tag === 'bq') {
    console.log(`${C.dim}Querying BigQuery...${C.reset}`);
    const { spawnSync } = require('child_process');
    spawnSync(`node tools/bigquery-query.js --client ${slug}`, { shell:true, stdio:'inherit', env:process.env });
    ga4Block = `- clients/${slug}/ga4-snapshot.json  (just refreshed from BigQuery)`;

  } else if (chosen.tag === 'api') {
    console.log(`${C.dim}Querying GA4 Data API...${C.reset}`);
    const { spawnSync } = require('child_process');
    spawnSync(`node tools/ga4-query.js --client ${slug} --days 90`, { shell:true, stdio:'inherit', env:process.env });
    ga4Block = `- clients/${slug}/ga4-snapshot.json  (just refreshed from GA4 API)`;

  } else if (chosen.tag === 'upload') {
    console.log(`\n${C.yellow}Upload instructions:${C.reset}`);
    console.log(`  1. In GA4 → Explore → create a Funnel Exploration`);
    console.log(`  2. Segment by: device, source/medium, new vs returning`);
    console.log(`  3. Export as CSV`);
    console.log(`  4. Attach the CSV directly in Claude Code alongside this prompt\n`);
    ga4Block = `- [ATTACHED CSV] — GA4 funnel export. Read this file and extract:\n  sessions, CVR, and stage drop-off rates by source/medium, device, and new vs returning.`;

  } else if (chosen.tag === 'snap') {
    ga4Block = `- clients/${slug}/ga4-snapshot.json  (snapshot from ${snapDate} — may be stale)`;

  } else {
    ga4Block = `(no GA4 data — analysis will be qualitative only)`;
  }

  // ── Build and print context prompt ────────────────────────────────────────

  const prompt = `You are working on ${name} as part of CRO OS.

Read these files from the repo before responding to anything:

CLIENT FILES:
- clients/${slug}/config.json
- clients/${slug}/research.md
- clients/${slug}/context.md
- clients/${slug}/scoring.md
- clients/${slug}/off-limits.md
- clients/${slug}/onboarding-report.md

GA4 DATA:
${ga4Block}

BRAIN + KNOWLEDGE BASE:
- brain/funnel-kpis.md
- brain/scoring-model.md
- brain/personalisation-strategy.md
${kbFiles}
- test-database/index.md

Once you have read everything, confirm with one line:
"${name} — ${vert} — [X sessions/week] — [X% CVR] — [active test or no active test]"

Then wait for instructions.`;

  console.log(`\n${C.dim}─────────────────────────────────────────${C.reset}`);
  console.log(prompt);
  console.log(`${C.dim}─────────────────────────────────────────${C.reset}\n`);
}

