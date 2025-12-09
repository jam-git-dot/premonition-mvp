/**
 * Quick script to backfill GW14 standings using the API
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getStandingsForMatchday, validateApiKey } from './api-client.js';
import { mapTeamName } from './team-name-mapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STANDINGS_FILE_PATH = path.join(__dirname, '../src/data/standingsByGameweek.json');

async function backfillGW14() {
  console.log('='.repeat(60));
  console.log('Backfilling GW14 Standings');
  console.log('='.repeat(60));

  try {
    // Validate API key
    validateApiKey();

    // Fetch GW14 standings from API
    console.log('Fetching GW14 standings from API...');
    const { standings } = await getStandingsForMatchday(14);

    // Convert to our format
    const converted = {};
    standings.forEach(team => {
      const position = team.position;
      const teamName = mapTeamName(team.team.name);
      converted[position] = teamName;
    });

    // Read current data
    const currentData = JSON.parse(fs.readFileSync(STANDINGS_FILE_PATH, 'utf8'));

    // Check if GW14 already exists
    if (currentData['14']) {
      console.log('WARNING: GW14 already exists, skipping...');
      return;
    }

    // Add GW14
    currentData['14'] = converted;
    currentData.lastUpdated = new Date().toISOString();

    // Save
    fs.writeFileSync(STANDINGS_FILE_PATH, JSON.stringify(currentData, null, 2), 'utf8');

    console.log('✅ GW14 standings successfully backfilled!');
    console.log();
    console.log('Preview:');
    Object.entries(converted).slice(0, 5).forEach(([pos, team]) => {
      console.log(`  ${pos}. ${team}`);
    });
    console.log('  ...');

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

backfillGW14();
