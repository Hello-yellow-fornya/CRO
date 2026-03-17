#!/bin/bash
# CRO OS — Full Pipeline Trigger
# Usage: bash tools/trigger-full-pipeline.sh <client>
# Example: bash tools/trigger-full-pipeline.sh powerleague
#
# This script triggers the full pipeline manually:
# 1. Touches the client config.json to trigger token extraction
# 2. Token extraction commits design-tokens.md
# 3. Mockup generation triggers automatically from that commit
CLIENT=$1
if [ -z "$CLIENT" ]; then
  echo "Usage: bash tools/trigger-full-pipeline.sh <client>"
  exit 1
fi
CONFIG="clients/$CLIENT/config.json"
if [ ! -f "$CONFIG" ]; then
  echo "No config.json found for $CLIENT at $CONFIG"
  exit 1
fi
echo "Triggering full pipeline for $CLIENT..."
# Touch config to trigger extraction workflow
node -e "
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('$CONFIG', 'utf8'));
config.lastTriggered = new Date().toISOString();
fs.writeFileSync('$CONFIG', JSON.stringify(config, null, 2));
console.log('Config updated — pipeline will trigger on push');
"
git add "$CONFIG"
git commit -m "trigger: run full pipeline for $CLIENT"
git push
echo "Pipeline triggered. Check GitHub Actions for progress."
echo "Mockup will appear at: mockups/$CLIENT/variation-a.html"
