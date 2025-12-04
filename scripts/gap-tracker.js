/**
 * Gap Tracker
 *
 * Tracks missed gameweeks that couldn't be automatically saved due to API limitations.
 * Maintains a persistent record so developers know what needs manual backfilling.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GAP_FILE_PATH = path.join(__dirname, '../src/data/missed-gameweeks.json');

/**
 * Initializes the gap tracking file if it doesn't exist
 */
function initializeGapFile() {
  if (!fs.existsSync(GAP_FILE_PATH)) {
    const initialData = {
      missedGameweeks: [],
      lastChecked: null,
      notes: 'This file tracks gameweeks that were skipped due to automation failures or missed runs.'
    };
    fs.writeFileSync(GAP_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

/**
 * Reads the current gap tracking data
 * @returns {Object} Gap tracking data
 */
function readGapFile() {
  initializeGapFile();
  const fileContent = fs.readFileSync(GAP_FILE_PATH, 'utf8');
  return JSON.parse(fileContent);
}

/**
 * Writes updated gap tracking data
 * @param {Object} data - Gap tracking data to write
 */
function writeGapFile(data) {
  const fileContent = JSON.stringify(data, null, 2);
  fs.writeFileSync(GAP_FILE_PATH, fileContent, 'utf8');
}

/**
 * Records a gap (missed gameweeks)
 * @param {number} lastSaved - Last saved gameweek
 * @param {number} currentComplete - Current complete gameweek
 */
export function recordGap(lastSaved, currentComplete) {
  const gapData = readGapFile();
  const missedGameweeks = [];

  for (let gw = lastSaved + 1; gw < currentComplete; gw++) {
    missedGameweeks.push(gw);
  }

  if (missedGameweeks.length === 0) {
    return;
  }

  // Add new missed gameweeks (avoiding duplicates)
  missedGameweeks.forEach(gw => {
    const existingEntry = gapData.missedGameweeks.find(entry => entry.gameweek === gw);
    if (!existingEntry) {
      gapData.missedGameweeks.push({
        gameweek: gw,
        detectedAt: new Date().toISOString(),
        status: 'needs_manual_backfill',
        reason: `Skipped during update. Last saved: GW${lastSaved}, Current complete: GW${currentComplete}`
      });
    }
  });

  gapData.lastChecked = new Date().toISOString();
  writeGapFile(gapData);

  console.log(`\nGAP DETECTED: Missed gameweeks recorded in ${GAP_FILE_PATH}`);
  console.log(`Missed gameweeks: ${missedGameweeks.join(', ')}`);
  console.log('ACTION REQUIRED: Manual backfill needed for these gameweeks');
}

/**
 * Marks a gameweek as manually filled
 * @param {number} gameweek - Gameweek that was manually filled
 */
export function markAsManuallyFilled(gameweek) {
  const gapData = readGapFile();
  const entry = gapData.missedGameweeks.find(e => e.gameweek === gameweek);

  if (entry) {
    entry.status = 'manually_filled';
    entry.filledAt = new Date().toISOString();
    writeGapFile(gapData);
    console.log(`Marked GW${gameweek} as manually filled in gap tracker`);
  }
}

/**
 * Gets list of gameweeks that need manual backfill
 * @returns {Array<Object>} Array of missed gameweek entries
 */
export function getMissedGameweeks() {
  const gapData = readGapFile();
  return gapData.missedGameweeks.filter(entry => entry.status === 'needs_manual_backfill');
}

/**
 * Checks if there are any gaps and logs a warning
 * @returns {boolean} True if gaps exist
 */
export function checkForGaps() {
  const missed = getMissedGameweeks();
  if (missed.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('WARNING: MISSED GAMEWEEKS DETECTED');
    console.log('='.repeat(60));
    console.log('The following gameweeks need manual backfill:');
    missed.forEach(entry => {
      console.log(`  GW${entry.gameweek} - Detected at ${entry.detectedAt}`);
      console.log(`    Reason: ${entry.reason}`);
    });
    console.log(`\nTo manually fill, use: npm run manual-override ${missed[0].gameweek} [rankings]`);
    console.log('See scripts/README.md for details');
    console.log('='.repeat(60) + '\n');
    return true;
  }
  return false;
}

/**
 * Clears all gap records (use after manual backfill is complete)
 */
export function clearAllGaps() {
  const gapData = readGapFile();
  gapData.missedGameweeks = [];
  gapData.lastChecked = new Date().toISOString();
  writeGapFile(gapData);
  console.log('All gap records cleared');
}
