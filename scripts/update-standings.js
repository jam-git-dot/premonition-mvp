/**
 * Automated Gameweek Standings Updater
 *
 * Checks for completed gameweeks and updates standingsByGameweek.json accordingly.
 *
 * Core Logic:
 * - A gameweek is complete when ALL 20 teams have played exactly that many games
 * - Only saves new gameweeks that weren't previously saved
 * - Validates all data before saving to prevent corruption
 * - Creates backups before modifying the file
 *
 * Usage:
 *   node scripts/update-standings.js           (normal run)
 *   node scripts/update-standings.js --dry-run (preview only, don't save)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCurrentStandings, validateApiKey, getApiCallCount, API_LIMITS } from './api-client.js';
import { mapTeamName, validateTeamMapping } from './team-name-mapper.js';
import {
  validateStandingsData,
  validateGameweek,
  validateGamesPlayed,
  logPreview
} from './validators.js';
import { recordGap, checkForGaps } from './gap-tracker.js';
import { notifySuccess, notifyGap, notifyError, notifyNoAction } from './discord-notifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STANDINGS_FILE_PATH = path.join(__dirname, '../src/data/standingsByGameweek.json');
const BACKUP_DIR = path.join(__dirname, '../backups');

// Parse command line arguments
const isDryRun = process.argv.includes('--dry-run');

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
  const backupPath = path.join(BACKUP_DIR, `standingsByGameweek-${timestamp}.json`);

  fs.copyFileSync(STANDINGS_FILE_PATH, backupPath);
  console.log(`Backup created: ${backupPath}`);

  return backupPath;
}

/**
 * Determines the last saved gameweek from the standings file
 * @param {Object} standingsData - Current standings data
 * @returns {number} Last saved gameweek number
 */
function getLastSavedGameweek(standingsData) {
  const gameweeks = Object.keys(standingsData)
    .filter(key => key !== 'lastUpdated')
    .map(Number)
    .filter(num => !isNaN(num));

  return gameweeks.length > 0 ? Math.max(...gameweeks) : 0;
}

/**
 * Determines the highest complete gameweek based on games played
 * @param {Array} standings - API standings data
 * @returns {number} Highest complete gameweek
 */
function getHighestCompleteGameweek(standings) {
  const gamesPlayed = standings.map(team => team.playedGames);
  const minGames = Math.min(...gamesPlayed);
  const maxGames = Math.max(...gamesPlayed);

  console.log(`Games played - Min: ${minGames}, Max: ${maxGames}`);

  if (minGames !== maxGames) {
    console.log('Not all teams have played the same number of games');
    const teamsWithMinGames = standings.filter(team => team.playedGames === minGames);
    console.log(`Teams with ${minGames} games:`, teamsWithMinGames.map(t => t.team.name).join(', '));
  }

  return minGames;
}

/**
 * Converts API standings data to our format
 * @param {Array} standings - API standings array
 * @returns {Object} Standings in our format {position: teamName}
 */
function convertStandingsToOurFormat(standings) {
  const converted = {};

  standings.forEach(team => {
    const position = team.position;
    const teamName = mapTeamName(team.team.name);
    converted[position] = teamName;
  });

  return converted;
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Automated Gameweek Standings Update');
  console.log('='.repeat(60));
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes will be saved)' : 'LIVE'}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`API Rate Limit: ${API_LIMITS.callsPerMinute} calls/minute`);
  console.log('='.repeat(60));
  console.log();

  try {
    // Step 1: Validate API key
    validateApiKey();

    // Step 2: Read current standings file
    console.log('Step 1: Reading current standings file...');
    const currentData = readStandingsFile();
    const lastSavedGameweek = getLastSavedGameweek(currentData);
    console.log(`Last saved gameweek: GW${lastSavedGameweek}`);
    console.log();

    // Step 3: Fetch current standings from API
    console.log('Step 2: Fetching current standings from API...');
    const { season, standings } = await getCurrentStandings();
    console.log(`Season: ${season.startDate} to ${season.endDate}`);
    console.log(`Current matchday: ${season.currentMatchday}`);
    console.log();

    // Step 4: Validate team mapping
    console.log('Step 3: Validating team name mapping...');
    const mappingValidation = validateTeamMapping(standings);
    if (!mappingValidation.isValid) {
      throw new Error(
        `Team mapping failed. Unmapped teams: ${mappingValidation.unmappedTeams.join(', ')}`
      );
    }
    console.log('Team mapping validation: PASSED');
    console.log();

    // Step 5: Determine highest complete gameweek
    console.log('Step 4: Determining complete gameweeks...');
    const highestComplete = getHighestCompleteGameweek(standings);
    console.log(`Highest complete gameweek: GW${highestComplete}`);
    console.log();

    // Step 6: Determine what gameweek to save
    // CRITICAL: We can only save the current complete gameweek because the API
    // only returns current standings. We cannot reconstruct historical gameweeks.
    const nextGameweekToSave = lastSavedGameweek + 1;

    if (highestComplete < nextGameweekToSave) {
      console.log('No new complete gameweeks to save.');
      console.log(`Next gameweek to save: GW${nextGameweekToSave}`);
      console.log(`Highest complete gameweek: GW${highestComplete}`);
      console.log();

      // Notify Discord
      await notifyNoAction('Gameweek in progress - not all teams have completed matches', {
        currentGameweek: highestComplete,
        gamesPlayed: `Teams have varying games played (${highestComplete}-${nextGameweekToSave})`
      });

      console.log('='.repeat(60));
      console.log(`API calls made: ${getApiCallCount()}`);
      console.log('='.repeat(60));
      return;
    }

    if (highestComplete === lastSavedGameweek) {
      console.log('No new complete gameweeks to save.');
      console.log(`Current status: GW${highestComplete} is the latest complete gameweek (already saved)`);
      console.log();

      // Notify Discord
      await notifyNoAction('Latest gameweek already saved', {
        currentGameweek: highestComplete
      });

      console.log('='.repeat(60));
      console.log(`API calls made: ${getApiCallCount()}`);
      console.log('='.repeat(60));
      return;
    }

    // CRITICAL: Check if we've missed ANY gameweeks - this is FATAL
    if (highestComplete > nextGameweekToSave) {
      const error = new Error(
        `FATAL: Missed gameweek(s) detected! Last saved: GW${lastSavedGameweek}, Current complete: GW${highestComplete}. ` +
        `This script MUST run after EVERY single gameweek completes. Missed gameweeks: ${nextGameweekToSave} through ${highestComplete - 1}. ` +
        `You must manually add the missing gameweek data before this script can continue.`
      );

      console.error('='.repeat(60));
      console.error('CRITICAL ERROR: MISSED GAMEWEEK(S)');
      console.error('='.repeat(60));
      console.error(`Last saved: GW${lastSavedGameweek}`);
      console.error(`Current complete: GW${highestComplete}`);
      console.error(`Missed gameweeks: ${nextGameweekToSave} through ${highestComplete - 1}`);
      console.error();
      console.error('ACTION REQUIRED:');
      console.error('1. Manually add the missing gameweek data to standingsByGameweek.json');
      console.error('2. Use historical data sources or recreate from match results');
      console.error('3. Then run this script again');
      console.error('='.repeat(60));

      // Record the gap and notify Discord
      const missedGameweeks = [];
      for (let gw = nextGameweekToSave; gw < highestComplete; gw++) {
        missedGameweeks.push(gw);
      }
      recordGap(lastSavedGameweek, highestComplete);
      await notifyGap(missedGameweeks);

      throw error;
    }

    // We can only save the highest complete gameweek with confidence
    const gameweekToSave = highestComplete;
    console.log(`Gameweek to save: GW${gameweekToSave}`);
    console.log();

    // Step 7: Process the gameweek
    console.log('Step 5: Processing gameweek...');
    let saveSuccessful = false;
    let error = null;

    console.log(`\nProcessing GW${gameweekToSave}...`);

    // Check if this gameweek already exists (shouldn't happen, but safety check)
    if (currentData[gameweekToSave]) {
      console.log(`WARNING: GW${gameweekToSave} already exists in the file.`);
      console.log('This gameweek will NOT be overwritten.');
      console.log('If you need to update it, manually delete the entry first.');
      console.log();
      console.log('='.repeat(60));
      console.log(`API calls made: ${getApiCallCount()}`);
      console.log('='.repeat(60));
      return;
    }

    // Validate gameweek number
    const gwValidation = validateGameweek(gameweekToSave);
    if (!gwValidation.isValid) {
      error = `Gameweek validation failed: ${gwValidation.errors.join(', ')}`;
      console.error(error);
    } else {
      // Validate all teams have played the expected number of games
      const gamesValidation = validateGamesPlayed(standings, gameweekToSave);
      if (!gamesValidation.isValid) {
        error = `Games played validation failed: ${gamesValidation.errors.join(', ')}`;
        console.error(error);
      } else {
        // Convert to our format
        const convertedStandings = convertStandingsToOurFormat(standings);

        // Validate converted data
        const dataValidation = validateStandingsData(convertedStandings);
        if (!dataValidation.isValid) {
          error = `Data validation failed: ${dataValidation.errors.join(', ')}`;
          console.error(error);
        } else {
          // Log preview
          logPreview(gameweekToSave, convertedStandings);

          // Add to current data
          currentData[gameweekToSave] = convertedStandings;
          saveSuccessful = true;
          console.log(`GW${gameweekToSave} ready to save`);
        }
      }
    }

    // Step 8: Save to file (if not dry run)
    if (saveSuccessful) {
      currentData.lastUpdated = new Date().toISOString();

      if (isDryRun) {
        console.log('\n--- DRY RUN MODE ---');
        console.log('Changes would be saved, but not actually writing to file');
      } else {
        console.log('\nStep 6: Saving changes...');
        createBackup();
        writeStandingsFile(currentData);
        console.log('Standings file updated successfully');

        // Step 7: Calculate and save competition scores
        console.log('\nStep 7: Calculating competition scores...');
        let playerComparisons = null;
        try {
          const { calculateCompetitionScoresForWeek } = await import('../src/data/competitionData.js');
          const { compareWeeks } = await import('../compare-weeks.cjs');

          // Read existing scores
          const scoresPath = path.join(__dirname, '../src/data/scoresByGameweek.json');
          let scoresData = {};
          if (fs.existsSync(scoresPath)) {
            scoresData = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
          }

          // Calculate and save scores for the new gameweek
          const weekScores = calculateCompetitionScoresForWeek(gameweekToSave);
          scoresData[gameweekToSave] = weekScores;
          scoresData.lastUpdated = new Date().toISOString();
          fs.writeFileSync(scoresPath, JSON.stringify(scoresData, null, 2));
          console.log(`Scores calculated and saved for GW${gameweekToSave}`);

          // Get player comparisons if previous week exists
          if (gameweekToSave > 1 && scoresData[gameweekToSave - 1]) {
            playerComparisons = compareWeeks(gameweekToSave - 1, gameweekToSave, 'all');
            console.log('Player position changes calculated');
          }
        } catch (error) {
          console.error('Warning: Could not calculate scores:', error.message);
          // Continue anyway - scores are nice-to-have, not critical
        }

        // Notify Discord of success with player comparisons and team changes
        const standingsArray = Object.entries(currentData[gameweekToSave])
          .map(([position, team]) => ({ position: parseInt(position), team }))
          .sort((a, b) => a.position - b.position);

        // Get previous gameweek standings for team comparison
        const previousStandings = gameweekToSave > 1 ? currentData[gameweekToSave - 1] : null;

        await notifySuccess(gameweekToSave, standingsArray, playerComparisons, previousStandings);
      }
    }

    // Step 9: Log summary
    console.log();
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Gameweek processed: GW${gameweekToSave}`);
    console.log(`Save successful: ${saveSuccessful ? 'YES' : 'NO'}`);
    console.log(`Current complete gameweek: GW${highestComplete}`);
    if (error) {
      console.log('\nError:');
      console.log(`  ${error}`);
    }
    console.log(`API calls made: ${getApiCallCount()}`);
    console.log(`Status: ${saveSuccessful ? 'SUCCESS' : 'FAILED'}`);
    console.log('='.repeat(60));

    // If there was an error during processing, notify Discord
    if (error && !isDryRun) {
      await notifyError(new Error(error), { gameweek: gameweekToSave });
    }

    // Check for any recorded gaps and alert
    checkForGaps();

  } catch (error) {
    console.error('\nFATAL ERROR:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    // Notify Discord of error
    await notifyError(error, { gameweek: lastSavedGameweek + 1 });

    process.exit(1);
  }
}

// Run the script
main();
