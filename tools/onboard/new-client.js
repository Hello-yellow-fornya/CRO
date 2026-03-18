#!/usr/bin/env node

/**
 * CRO OS — New Client Setup
 * Run: node tools/onboard/new-client.js
 */

const readline = require('readline');
const { spawnSync } = require('child_process');
const fs = require('fs');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m'
};

function run(cmd, env = {}) {
  console.log(`\n${C.dim}Running: ${cmd}${C.reset}`);
  const result = spawnSync(cmd, {
    shell: true, stdio: 'inherit',
    env: { ...process.env, ...env }
  });
  return result.status === 0;
}

async function main() {
  console.log(`\n${C.cyan}${C.bold}═══════════════════════════════════════`);
  console.log(`  CRO OS — New Client`);
  console.log(`═══════════════════════════════════════${C.reset}\n`);

  const name   = (await ask('Client name:         ')).trim();
  const url    = (await ask('Website URL:         ')).trim();
  const ga4Id  = (await ask('GA4 Property ID:     ')).trim();

  rl.close();

  if (!name || !url) {
    console.error('\nClient name and URL are required.\n');
    process.exit(1);
  }

  // Derive slug from name
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  console.log(`\n${C.bold}Starting onboarding for ${name} (${slug})...${C.reset}\n`);

  // Write GA4 property ID into config if provided
  // scaffold.js will create the config, then we patch it
  const patchGA4 = () => {
    if (!ga4Id) return;
    const configPath = `clients/${slug}/config.json`;
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      cfg.ga4_property_id = ga4Id;
      fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + '\n');
      console.log(`\x1b[32m  ✓ GA4 property ID saved\x1b[0m`);
    } catch(e) {
      console.log(`\x1b[33m  ⚠ Could not patch GA4 ID: ${e.message}\x1b[0m`);
    }
  };

  const env = {
    CLIENT: slug,
    CLIENT_NAME: name,
    URL: url,
    VERTICAL_HINT: 'auto'
  };

  // Phase 1: Research
  console.log(`\n${C.cyan}Phase 1 — Reading the site...${C.reset}`);
  run('node tools/onboard/research.js', env);

  // Phase 2: Scaffold
  console.log(`\n${C.cyan}Phase 2 — Creating client folder...${C.reset}`);
  run('node tools/onboard/scaffold.js', env);
  patchGA4();

  // Phase 1.5: GA4 (after scaffold so config exists)
  if (ga4Id && process.env.GCP_SERVICE_ACCOUNT_KEY) {
    console.log(`\n${C.cyan}Phase 1.5 — Pulling GA4 data...${C.reset}`);
    spawnSync(`node tools/ga4-query.js --client ${slug} --days 90`, {
      shell: true, stdio: 'inherit', env: process.env
    });
  } else if (ga4Id) {
    console.log(`\n${C.yellow}  ⚠ GA4 property ID saved but GCP_SERVICE_ACCOUNT_KEY not set — skipping data pull${C.reset}`);
  }

  // Phase 3: Tokens
  console.log(`\n${C.cyan}Phase 3 — Extracting design tokens...${C.reset}`);
  spawnSync(`node tools/extract-tokens.js "${url}" "${slug}"`, {
    shell: true, stdio: 'inherit', env: process.env
  });

  // Phase 4: Tag audit
  console.log(`\n${C.cyan}Phase 4 — Tag audit...${C.reset}`);
  spawnSync(`node tools/audit/stage3-qa.js --client "${slug}" --url "${url}"`, {
    shell: true, stdio: 'inherit', env: process.env
  });

  // Phase 5: Report
  console.log(`\n${C.cyan}Phase 5 — Generating onboarding report...${C.reset}`);
  run('node tools/onboard/generate-report.js', {
    ...env,
    CLIENT: slug,
    CLIENT_NAME: name
  });

  // Done
  console.log(`\n${C.green}${C.bold}═══════════════════════════════════════`);
  console.log(`  Done — ${name} onboarded`);
  console.log(`═══════════════════════════════════════${C.reset}`);
  console.log(`\n  Review: clients/${slug}/onboarding-report.md`);
  console.log(`  Then commit: git add clients/${slug}/ && git commit -m "onboard: ${name}"\n`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
