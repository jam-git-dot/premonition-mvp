/**
 * Recalculate scores for specific gameweeks
 * Use this after manually updating standings data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function recalculateScores(gameweek) {
  console.log(`Recalculating scores for GW${gameweek}...`);

  try {
    const { calculateCompetitionScoresForWeek } = await import('../src/data/competitionData.js');

    // Read existing scores
    const scoresPath = path.join(__dirname, '../src/data/scoresByGameweek.json');
    let scoresData = {};
    if (fs.existsSync(scoresPath)) {
      scoresData = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
    }

    // Calculate and save scores for the gameweek
    const weekScores = calculateCompetitionScoresForWeek(gameweek);
    scoresData[gameweek] = weekScores;
    scoresData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(scoresPath, JSON.stringify(scoresData, null, 2));

    console.log(`✅ Scores recalculated and saved for GW${gameweek}`);
    console.log(`   Total players: ${weekScores.length}`);
    console.log(`   Top 3:`);
    weekScores.slice(0, 3).forEach((player, i) => {
      console.log(`     ${i + 1}. ${player.name}: ${player.totalScore} points`);
    });

  } catch (error) {
    console.error('ERROR:', error.message);
    process.exit(1);
  }
}

// Get gameweek from command line argument
const gameweek = parseInt(process.argv[2]);
if (isNaN(gameweek)) {
  console.error('Usage: node scripts/recalculate-scores.js <gameweek>');
  console.error('Example: node scripts/recalculate-scores.js 14');
  process.exit(1);
}

recalculateScores(gameweek);
