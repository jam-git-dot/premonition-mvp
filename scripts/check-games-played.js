/**
 * Check Games Played - Diagnostic Script
 *
 * Fetches current standings from the API and shows how many games each team has played.
 * Useful for debugging why the automation might not be updating.
 */

import { getCurrentStandings, validateApiKey } from './api-client.js';

async function checkGamesPlayed() {
  console.log('='.repeat(60));
  console.log('Games Played Diagnostic');
  console.log('='.repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log();

  try {
    // Validate API key
    validateApiKey();

    // Fetch current standings
    console.log('Fetching current standings from API...');
    const { season, standings } = await getCurrentStandings();

    console.log(`Season: ${season.startDate} to ${season.endDate}`);
    console.log(`Current matchday: ${season.currentMatchday}`);
    console.log();

    // Extract games played
    const gamesPlayed = standings.map(team => team.playedGames);
    const minGames = Math.min(...gamesPlayed);
    const maxGames = Math.max(...gamesPlayed);

    console.log('='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`Minimum games played: ${minGames}`);
    console.log(`Maximum games played: ${maxGames}`);
    console.log(`All teams on same gameweek: ${minGames === maxGames ? 'YES ✅' : 'NO ❌'}`);
    console.log();

    if (minGames !== maxGames) {
      console.log('⚠️  Not all teams have played the same number of games');
      console.log(`   This means gameweek ${maxGames} is still in progress`);
      console.log();
    } else {
      console.log(`✅ All teams have completed gameweek ${minGames}`);
      console.log();
    }

    // Show detailed breakdown
    console.log('='.repeat(60));
    console.log('DETAILED BREAKDOWN');
    console.log('='.repeat(60));
    console.log('Pos | Team                        | Games | Points');
    console.log('-'.repeat(60));

    standings.forEach(team => {
      const pos = String(team.position).padStart(3);
      const name = team.team.name.padEnd(28);
      const games = String(team.playedGames).padStart(5);
      const points = String(team.points).padStart(6);
      console.log(`${pos} | ${name} | ${games} | ${points}`);
    });

    // Show teams grouped by games played
    if (minGames !== maxGames) {
      console.log();
      console.log('='.repeat(60));
      console.log('TEAMS GROUPED BY GAMES PLAYED');
      console.log('='.repeat(60));

      for (let games = minGames; games <= maxGames; games++) {
        const teamsWithGames = standings.filter(t => t.playedGames === games);
        console.log(`\n${games} games (${teamsWithGames.length} teams):`);
        teamsWithGames.forEach(t => {
          console.log(`  - ${t.team.name}`);
        });
      }
    }

    console.log();
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\nERROR:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

checkGamesPlayed();
