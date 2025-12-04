/**
 * Manual Override Script
 *
 * Allows developers to manually set standings for a specific gameweek.
 * Useful for backfilling missed gameweeks or correcting errors.
 *
 * Usage:
 *   node scripts/manual-override.js <gameweek> <team1> <team2> ... <team20>
 *   node scripts/manual-override.js --interactive <gameweek>
 *
 * Example:
 *   node scripts/manual-override.js 14 "Liverpool" "Arsenal" "Chelsea" ...
 *   npm run manual-override 14 "Liverpool" "Arsenal" ...
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readlineSync from 'readline-sync';
import { validateStandingsData, validateGameweek, logPreview } from './validators.js';
import { getExpectedTeamNames } from './team-name-mapper.js';
import { markAsManuallyFilled } from './gap-tracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STANDINGS_FILE_PATH = path.join(__dirname, '../src/data/standingsByGameweek.json');
const BACKUP_DIR = path.join(__dirname, '../backups');

/**
 * Reads the current standings file
 * @returns {Object} Current standings data
 */
function readStandingsFile() {
  const fileContent = fs.readFileSync(STANDINGS_FILE_PATH, 'utf8');
  return JSON.parse(fileContent);
}

/**
 * Writes updated standings to file
 * @param {Object} data - Complete standings data to write
 */
function writeStandingsFile(data) {
  const fileContent = JSON.stringify(data, null, 2);
  fs.writeFileSync(STANDINGS_FILE_PATH, fileContent, 'utf8');
}

/**
 * Creates a backup of the current standings file
 * @returns {string} Path to backup file
 */
function createBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `standingsByGameweek-manual-${timestamp}.json`);

  fs.copyFileSync(STANDINGS_FILE_PATH, backupPath);
  console.log(`Backup created: ${backupPath}`);

  return backupPath;
}

/**
 * Converts array of team names to standings object
 * @param {Array<string>} teamArray - Array of 20 team names in order
 * @returns {Object} Standings object {position: teamName}
 */
function arrayToStandings(teamArray) {
  const standings = {};
  teamArray.forEach((teamName, index) => {
    standings[index + 1] = teamName.trim();
  });
  return standings;
}

/**
 * Interactive mode - prompts user for team names
 * @param {number} gameweek - Gameweek number
 * @returns {Object} Standings object
 */
function interactiveMode(gameweek) {
  console.log('\n' + '='.repeat(60));
  console.log(`INTERACTIVE MODE: Manual Override for GW${gameweek}`);
  console.log('='.repeat(60));
  console.log('Enter team names in order (position 1 through 20)');
  console.log('Press Ctrl+C to cancel at any time\n');

  const expectedTeams = getExpectedTeamNames();
  const teamArray = [];

  for (let position = 1; position <= 20; position++) {
    let teamName = '';
    let valid = false;

    while (!valid) {
      teamName = readlineSync.question(`Position ${String(position).padStart(2, ' ')}: `);
      teamName = teamName.trim();

      if (expectedTeams.includes(teamName)) {
        if (teamArray.includes(teamName)) {
          console.log(`  ERROR: "${teamName}" already entered at position ${teamArray.indexOf(teamName) + 1}`);
        } else {
          valid = true;
        }
      } else {
        console.log(`  ERROR: Unknown team name. Must be one of:`);
        console.log(`  ${expectedTeams.filter(t => !teamArray.includes(t)).join(', ')}`);
      }
    }

    teamArray.push(teamName);
  }

  return arrayToStandings(teamArray);
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Manual Gameweek Override');
  console.log('='.repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log();

  const args = process.argv.slice(2);

  // Parse arguments
  let gameweek;
  let standings;
  let isInteractive = false;

  if (args.length === 0 || args[0] === '--help') {
    console.log('Usage:');
    console.log('  node scripts/manual-override.js <gameweek> <team1> <team2> ... <team20>');
    console.log('  node scripts/manual-override.js --interactive <gameweek>');
    console.log();
    console.log('Example:');
    console.log('  node scripts/manual-override.js 14 "Liverpool" "Arsenal" "Chelsea" ...');
    console.log();
    console.log('Expected team names (case-sensitive):');
    const expectedTeams = getExpectedTeamNames();
    expectedTeams.forEach((team, index) => {
      console.log(`  ${String(index + 1).padStart(2, ' ')}. ${team}`);
    });
    process.exit(0);
  }

  if (args[0] === '--interactive') {
    isInteractive = true;
    gameweek = parseInt(args[1]);
    if (isNaN(gameweek)) {
      console.error('ERROR: Please provide a gameweek number');
      console.error('Usage: node scripts/manual-override.js --interactive <gameweek>');
      process.exit(1);
    }
  } else {
    gameweek = parseInt(args[0]);
    if (isNaN(gameweek)) {
      console.error('ERROR: First argument must be a gameweek number');
      process.exit(1);
    }

    if (args.length !== 21) {
      console.error(`ERROR: Expected 21 arguments (gameweek + 20 teams), got ${args.length}`);
      console.error('Use --interactive mode for easier input');
      process.exit(1);
    }

    const teamArray = args.slice(1);
    standings = arrayToStandings(teamArray);
  }

  // Validate gameweek number
  const gwValidation = validateGameweek(gameweek);
  if (!gwValidation.isValid) {
    console.error(`ERROR: ${gwValidation.errors.join(', ')}`);
    process.exit(1);
  }

  // Interactive mode: get team names from user
  if (isInteractive) {
    standings = interactiveMode(gameweek);
  }

  console.log();
  console.log('Step 1: Validating input data...');

  // Validate standings data
  const dataValidation = validateStandingsData(standings);
  if (!dataValidation.isValid) {
    console.error('ERROR: Data validation failed:');
    dataValidation.errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  console.log('Data validation: PASSED');
  console.log();

  // Preview what will be saved
  logPreview(gameweek, standings);

  // Read current data
  console.log('Step 2: Reading current standings file...');
  const currentData = readStandingsFile();

  // Check if gameweek already exists
  if (currentData[gameweek]) {
    console.log(`\nWARNING: GW${gameweek} already exists in the file.`);
    console.log('Current data:');
    logPreview(gameweek, currentData[gameweek]);

    const overwrite = readlineSync.keyInYN('\nDo you want to OVERWRITE this data?');
    if (!overwrite) {
      console.log('\nOperation cancelled. No changes made.');
      process.exit(0);
    }
  } else {
    console.log(`GW${gameweek} does not exist. Will create new entry.`);
  }

  // Confirm before saving
  console.log();
  const confirm = readlineSync.keyInYN('Save this data to the standings file?');
  if (!confirm) {
    console.log('\nOperation cancelled. No changes made.');
    process.exit(0);
  }

  // Create backup
  console.log('\nStep 3: Creating backup...');
  createBackup();

  // Save data
  console.log('Step 4: Saving data...');
  currentData[gameweek] = standings;
  currentData.lastUpdated = new Date().toISOString();
  writeStandingsFile(currentData);
  console.log('Standings file updated successfully');

  // Mark as manually filled in gap tracker
  markAsManuallyFilled(gameweek);

  // Summary
  console.log();
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Gameweek: GW${gameweek}`);
  console.log(`Status: SAVED`);
  console.log(`Method: Manual Override`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

// Run the script
main().catch(error => {
  console.error('\nFATAL ERROR:');
  console.error(error.message);
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  process.exit(1);
});
