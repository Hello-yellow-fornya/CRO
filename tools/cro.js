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
else if (cmd.startsWith('work '))      cmdWork(args[1]);
else if (cmd === '' || cmd === 'help')  cmdHelp();
else {
  console.log(`\n${C.dim}Unknown command: ${cmd}${C.reset}`);
  cmdHelp();
}

// ── cro work <slug> ───────────────────────────────────────────────────────────
// Prints a context-loading prompt to paste into Claude Code

function cmdWork(slug) {
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

  console.log(`\n${C.cyan}${C.bold}Working on: ${name}${C.reset}`);
  console.log(`${C.dim}Paste this into Claude Code to load full client context:\n${C.reset}`);

  const prompt = `You are working on ${name} as part of CRO OS.

Read the following files now before responding to anything:
- clients/${slug}/config.json
- clients/${slug}/research.md
- clients/${slug}/context.md
- clients/${slug}/scoring.md
- clients/${slug}/off-limits.md
- clients/${slug}/onboarding-report.md
- clients/${slug}/ga4-snapshot.json
- brain/funnel-kpis.md
- brain/personalisation-strategy.md
- brain/scoring-model.md
- knowledge-base/${vert.split(' + ').map(v => ({
    leisure: 'leisure-sports',
    lead_gen: 'lead-gen',
    financial_services: 'financial-services',
    ecommerce: 'ecommerce',
    saas: 'saas',
    travel: 'travel'
  }[v] || v)).join(', knowledge-base/')}
- test-database/index.md

Once you have read them, confirm with a one-line summary:
"[Client name] — [vertical] — [weekly sessions]/week — [CVR]% CVR — [active test or 'no active test']"

Then wait for instructions.`;

  console.log(prompt);
  console.log();
}
