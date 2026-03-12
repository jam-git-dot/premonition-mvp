/**
 * Bulk Backfill Script
 *
 * Allows bulk import of historical gameweek standings from a JSON file.
 * Much faster than interactive mode for backfilling multiple gameweeks.
 *
 * Usage:
 *   node scripts/bulk-backfill.js <input-file.json>
 *
 * Input file format:
 * {
 *   "22": ["Liverpool", "Arsenal", "Chelsea", ...20 teams in order],
 *   "23": ["Liverpool", "Arsenal", "Chelsea", ...20 teams in order],
 *   ...
 * }
 *
 * Or object format:
 * {
 *   "22": {"1": "Liverpool", "2": "Arsenal", ...},
 *   ...
 * }
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateStandingsData, validateGameweek, logPreview } from './validators.js';
import { getExpectedTeamNames } from './team-name-mapper.js';
import { markAsManuallyFilled } from './gap-tracker.js';
import { notifyManualOverride, notifyError } from './discord-notifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STANDINGS_FILE_PATH = path.join(__dirname, '../src/data/standingsByGameweek.json');
const BACKUP_DIR = path.join(__dirname, '../backups');

/**
 * Reads the current standings file
 */
function readStandingsFile() {
  const fileContent = fs.readFileSync(STANDINGS_FILE_PATH, 'utf8');
  return JSON.parse(fileContent);
}

/**
 * Writes updated standings to file
 */
function writeStandingsFile(data) {
  const fileContent = JSON.stringify(data, null, 2);
  fs.writeFileSync(STANDINGS_FILE_PATH, fileContent, 'utf8');
}

/**
 * Creates a backup of the current standings file
 */
function createBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `standingsByGameweek-bulk-${timestamp}.json`);

  fs.copyFileSync(STANDINGS_FILE_PATH, backupPath);
  console.log(`Backup created: ${backupPath}`);

  return backupPath;
}

/**
 * Converts array of team names to standings object
 */
function arrayToStandings(teamArray) {
  const standings = {};
  teamArray.forEach((teamName, index) => {
    standings[index + 1] = teamName.trim();
  });
  return standings;
}

/**
 * Validates a single gameweek's data
 */
function validateGameweekData(gameweek, data, expectedTeams) {
  const errors = [];

  // Check if it's array format or object format
  let standings;
  if (Array.isArray(data)) {
    if (data.length !== 20) {
      errors.push(`GW${gameweek}: Expected 20 teams, got ${data.length}`);
      return { isValid: false, errors };
    }
    standings = arrayToStandings(data);
  } else if (typeof data === 'object') {
    standings = data;
  } else {
    errors.push(`GW${gameweek}: Invalid data format`);
    return { isValid: false, errors };
  }

  // Check all positions exist
  for (let i = 1; i <= 20; i++) {
    if (!standings[i]) {
      errors.push(`GW${gameweek}: Missing position ${i}`);
    }
  }

  // Check team names
  const usedTeams = new Set();
  for (let i = 1; i <= 20; i++) {
    const team = standings[i];
    if (team) {
      if (!expectedTeams.includes(team)) {
        errors.push(`GW${gameweek}: Unknown team "${team}" at position ${i}`);
      }
      if (usedTeams.has(team)) {
        errors.push(`GW${gameweek}: Duplicate team "${team}"`);
      }
      usedTeams.add(team);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    standings
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('Bulk Gameweek Backfill');
  console.log('='.repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log();

  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log('Usage:');
    console.log('  node scripts/bulk-backfill.js <input-file.json>');
    console.log();
    console.log('Input file format (array style):');
    console.log('{');
    console.log('  "22": ["Liverpool", "Arsenal", "Chelsea", ...20 teams in order],');
    console.log('  "23": ["Liverpool", "Arsenal", "Chelsea", ...20 teams in order]');
    console.log('}');
    console.log();
    console.log('Expected team names:');
    const expectedTeams = getExpectedTeamNames();
    expectedTeams.forEach((team, index) => {
      console.log(`  ${String(index + 1).padStart(2, ' ')}. ${team}`);
    });
    process.exit(0);
  }

  const inputFile = args[0];

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`ERROR: Input file not found: ${inputFile}`);
    process.exit(1);
  }

  // Read input file
  console.log('Step 1: Reading input file...');
  let inputData;
  try {
    const fileContent = fs.readFileSync(inputFile, 'utf8');
    inputData = JSON.parse(fileContent);
  } catch (error) {
    console.error(`ERROR: Failed to parse input file: ${error.message}`);
    process.exit(1);
  }

  const gameweeks = Object.keys(inputData).map(Number).sort((a, b) => a - b);
  console.log(`Found ${gameweeks.length} gameweeks to import: ${gameweeks.join(', ')}`);
  console.log();

  // Validate all gameweeks
  console.log('Step 2: Validating all gameweek data...');
  const expectedTeams = getExpectedTeamNames();
  const validatedData = {};
  let allValid = true;

  for (const gw of gameweeks) {
    const gwValidation = validateGameweek(gw);
    if (!gwValidation.isValid) {
      console.error(`GW${gw}: Invalid gameweek number`);
      allValid = false;
      continue;
    }

    const validation = validateGameweekData(gw, inputData[gw], expectedTeams);
    if (!validation.isValid) {
      validation.errors.forEach(err => console.error(err));
      allValid = false;
    } else {
      validatedData[gw] = validation.standings;
      console.log(`GW${gw}: VALID`);
    }
  }

  if (!allValid) {
    console.error();
    console.error('Validation failed. Please fix the errors and try again.');
    process.exit(1);
  }

  console.log();
  console.log('All gameweeks validated successfully!');
  console.log();

  // Read current standings
  console.log('Step 3: Reading current standings file...');
  const currentData = readStandingsFile();

  // Check for existing gameweeks
  const existingGameweeks = gameweeks.filter(gw => currentData[gw]);
  if (existingGameweeks.length > 0) {
    console.log(`WARNING: The following gameweeks already exist: ${existingGameweeks.join(', ')}`);
    console.log('These will be OVERWRITTEN.');
    console.log();
  }

  // Preview
  console.log('Step 4: Preview...');
  for (const gw of gameweeks) {
    logPreview(gw, validatedData[gw]);
  }

  // Create backup
  console.log('Step 5: Creating backup...');
  createBackup();

  // Save data
  console.log('Step 6: Saving data...');
  for (const gw of gameweeks) {
    currentData[gw] = validatedData[gw];
    markAsManuallyFilled(gw);
  }
  currentData.lastUpdated = new Date().toISOString();
  writeStandingsFile(currentData);
  console.log('Standings file updated successfully!');

  // Notify Discord
  for (const gw of gameweeks) {
    await notifyManualOverride(gw, {
      interactive: false,
      backupCreated: true,
      validationPassed: true,
      method: 'bulk-backfill'
    });
  }

  // Summary
  console.log();
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Gameweeks imported: ${gameweeks.join(', ')}`);
  console.log(`Status: SAVED`);
  console.log(`Method: Bulk Backfill`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log();
  console.log('Next step: Run "node scripts/update-standings.js" to continue automatic updates.');
}

// Run the script
main().catch(async (error) => {
  console.error('\nFATAL ERROR:');
  console.error(error.message);
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }

  await notifyError(error, { context: 'Bulk Backfill' });

  process.exit(1);
});
