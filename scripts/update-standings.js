/**
 * Automated Gameweek Standings Updater
 *
 * Uses a snapshot-based approach to never miss gameweeks:
 * 1. ALWAYS saves the current API data as a snapshot
 * 2. Calculates standings for any games-played levels we can derive
 * 3. Writes parity standings to standingsByGameweek.json
 *
 * This approach handles teams with different games played gracefully.
 * No more "missed gameweeks" - we store all data and derive what we need.
 *
 * Usage:
 *   node scripts/update-standings.js           (normal run)
 *   node scripts/update-standings.js --dry-run (preview only, don't save)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCurrentStandings, validateApiKey, getApiCallCount, API_LIMITS } from './api-client.js';
import { validateTeamMapping } from './team-name-mapper.js';
import { logPreview } from './validators.js';
import {
  saveSnapshot,
  getGamesPlayedState,
  updateStandingsFromSnapshots,
  getSnapshotSummary,
  readStandings
} from './snapshot-manager.js';
import { notifySuccess, notifyError, notifyNoAction } from './discord-notifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(__dirname, '../backups');
const STANDINGS_FILE_PATH = path.join(__dirname, '../src/data/standingsByGameweek.json');

// Parse command line arguments
const isDryRun = process.argv.includes('--dry-run');

/**
 * Creates a backup of the current standings file
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

  let lastSavedGameweek = null;

  try {
    // Step 1: Validate API key
    validateApiKey();

    // Step 2: Check current state
    console.log('Step 1: Checking current state...');
    const standingsData = readStandings();
    const existingGameweeks = Object.keys(standingsData)
      .filter(k => /^\d+$/.test(k))
      .map(Number)
      .sort((a, b) => a - b);
    lastSavedGameweek = existingGameweeks.length > 0 ? Math.max(...existingGameweeks) : 0;
    console.log(`Last saved gameweek: GW${lastSavedGameweek}`);

    const snapshotSummary = getSnapshotSummary();
    if (snapshotSummary.hasData) {
      console.log(`Existing snapshots: ${snapshotSummary.snapshotCount} (latest: ${snapshotSummary.latestDate})`);
    } else {
      console.log('No existing snapshots');
    }
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

    // Step 5: ALWAYS save snapshot (this is the key change!)
    console.log('Step 4: Saving snapshot...');
    if (isDryRun) {
      console.log('  [DRY RUN] Would save snapshot');
    } else {
      const snapshot = saveSnapshot(standings);
      const state = getGamesPlayedState(snapshot);
      console.log(`  Snapshot saved for ${snapshot.date}`);
      console.log(`  Games played range: ${state.minGames}-${state.maxGames}`);
      console.log(`  Team distribution: ${Object.entries(state.teamsByGames).map(([g, t]) => `${t.length} teams at ${g} games`).join(', ')}`);
    }
    console.log();

    // Step 6: Calculate any new gameweeks from snapshots
    console.log('Step 5: Calculating standings from snapshots...');
    if (isDryRun) {
      console.log('  [DRY RUN] Would calculate standings');
      const gamesPlayed = standings.map(team => team.playedGames);
      const minGames = Math.min(...gamesPlayed);
      console.log(`  Would try to calculate up to GW${minGames}`);
    } else {
      createBackup();
      const result = updateStandingsFromSnapshots();

      if (result.updated) {
        console.log(`  New gameweeks added: ${result.newGameweeks.join(', ')}`);

        // Calculate and save competition scores for new gameweeks
        console.log('\nStep 6: Calculating competition scores...');
        const { calculateCompetitionScoresForWeek } = await import('../src/data/competitionData.js');
        const { compareWeeks } = await import('../compare-weeks.cjs');

        const scoresPath = path.join(__dirname, '../src/data/scoresByGameweek.json');
        let scoresData = {};
        if (fs.existsSync(scoresPath)) {
          scoresData = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
        }

        let playerComparisons = null;
        let latestGameweek = null;

        for (const gw of result.newGameweeks) {
          console.log(`  Calculating scores for GW${gw}...`);
          const weekScores = calculateCompetitionScoresForWeek(gw);
          if (weekScores && weekScores.length > 0) {
            scoresData[gw] = weekScores;
            console.log(`  ✅ GW${gw}: ${weekScores.length} players scored`);
            latestGameweek = gw;
          } else {
            console.log(`  ⚠️ GW${gw}: No scores calculated`);
          }
        }

        scoresData.lastUpdated = new Date().toISOString();
        fs.writeFileSync(scoresPath, JSON.stringify(scoresData, null, 2));

        // Get player comparisons for the latest new gameweek
        if (latestGameweek && latestGameweek > 1 && scoresData[latestGameweek - 1]) {
          playerComparisons = compareWeeks(latestGameweek - 1, latestGameweek, 'all');
        }

        // Notify Discord of success
        const updatedStandings = readStandings();
        const standingsArray = Object.entries(updatedStandings[result.lastGameweek] || {})
          .filter(([k]) => /^\d+$/.test(k))
          .map(([position, team]) => ({ position: parseInt(position), team }))
          .sort((a, b) => a.position - b.position);

        const previousStandings = result.lastGameweek > 1 ? updatedStandings[result.lastGameweek - 1] : null;
        await notifySuccess(result.lastGameweek, standingsArray, playerComparisons, previousStandings);
      } else {
        console.log(`  No new gameweeks to add (last saved: GW${result.lastGameweek})`);

        // Check if we're waiting for teams to catch up
        const gamesPlayed = standings.map(team => team.playedGames);
        const minGames = Math.min(...gamesPlayed);
        const maxGames = Math.max(...gamesPlayed);

        if (minGames <= result.lastGameweek) {
          console.log(`  Waiting for all teams to complete GW${result.lastGameweek + 1}`);
          console.log(`  Current: ${minGames}-${maxGames} games played`);

          await notifyNoAction('Waiting for teams to sync', {
            currentGameweek: result.lastGameweek,
            gamesPlayed: `Min: ${minGames}, Max: ${maxGames}`,
            nextGameweek: result.lastGameweek + 1
          });
        } else {
          // This means we already have up to minGames saved
          await notifyNoAction('Already up to date', {
            currentGameweek: result.lastGameweek
          });
        }
      }
    }

    // Step 7: Log summary
    console.log();
    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));

    const finalSummary = getSnapshotSummary();
    const gamesPlayed = standings.map(team => team.playedGames);

    console.log(`Snapshot count: ${finalSummary.snapshotCount || 'N/A'}`);
    console.log(`Games played range: ${Math.min(...gamesPlayed)}-${Math.max(...gamesPlayed)}`);
    console.log(`API calls made: ${getApiCallCount()}`);
    console.log(`Status: SUCCESS`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\nFATAL ERROR:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    await notifyError(error, { gameweek: lastSavedGameweek !== null ? lastSavedGameweek + 1 : 'unknown' });

    process.exit(1);
  }
}

// Run the script
main();
