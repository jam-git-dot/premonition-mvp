/**
 * Test script to verify API-Football connectivity and inspect response format
 * Run with: node scripts/test-api.js
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.FOOTBALL_API_KEY;
const API_HOST = 'v3.football.api-sports.io';
const BASE_URL = `https://${API_HOST}`;

// Premier League ID
const LEAGUE_ID = 39;
const SEASON = 2023; // Testing with 2023 season (free plan limitation)

if (!API_KEY) {
  console.error('❌ ERROR: FOOTBALL_API_KEY not found in .env.local');
  console.error('Please add: FOOTBALL_API_KEY=your_key_here');
  process.exit(1);
}

async function testAPI() {
  console.log('🔍 Testing API-Football connection...\n');

  try {
    // Test 1: Get current standings
    console.log('📊 Fetching Premier League standings...');
    const response = await fetch(`${BASE_URL}/standings?league=${LEAGUE_ID}&season=${SEASON}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API request failed:');
      console.error(errorText);
      return;
    }

    const data = await response.json();

    console.log('\n✅ API connection successful!\n');

    // Display API quota info
    if (data.parameters) {
      console.log('📋 Request Parameters:');
      console.log(JSON.stringify(data.parameters, null, 2));
      console.log();
    }

    if (data.errors && Object.keys(data.errors).length > 0) {
      console.log('⚠️  API Errors:');
      console.log(JSON.stringify(data.errors, null, 2));
      console.log();
    }

    // Check if we have standings data
    if (!data.response || data.response.length === 0) {
      console.log('❌ No standings data returned');
      console.log('Full response:', JSON.stringify(data, null, 2));
      return;
    }

    const standings = data.response[0].league.standings[0];

    console.log('📈 Standings Data Structure Check:');
    console.log(`Total teams: ${standings.length}`);
    console.log();

    // Display first 3 teams to verify data structure
    console.log('🔍 Sample Data (Top 3 teams):\n');
    standings.slice(0, 3).forEach((team, index) => {
      console.log(`Position ${team.rank}: ${team.team.name}`);
      console.log(`  Games Played: ${team.all.played}`);
      console.log(`  Points: ${team.points}`);
      console.log(`  Form: ${team.form}`);
      console.log();
    });

    // Check for "games played" field
    console.log('✅ Key Fields Verified:');
    console.log(`  - "rank" field exists: ${standings[0].rank !== undefined}`);
    console.log(`  - "team.name" field exists: ${standings[0].team?.name !== undefined}`);
    console.log(`  - "all.played" field exists: ${standings[0].all?.played !== undefined}`);
    console.log();

    // Find minimum games played (this determines the current complete gameweek)
    const gamesPlayed = standings.map(team => team.all.played);
    const minGames = Math.min(...gamesPlayed);
    const maxGames = Math.max(...gamesPlayed);

    console.log('🎮 Gameweek Status:');
    console.log(`  Minimum games played: ${minGames}`);
    console.log(`  Maximum games played: ${maxGames}`);
    console.log(`  Current complete gameweek: GW${minGames}`);
    console.log();

    if (minGames !== maxGames) {
      console.log('⚠️  Not all teams have played the same number of games');
      console.log(`  Teams with ${minGames} games played:`);
      standings
        .filter(team => team.all.played === minGames)
        .forEach(team => console.log(`    - ${team.team.name}`));
      console.log();
    }

    // Display all team names for mapping reference
    console.log('📝 All Team Names (for mapping):');
    standings.forEach(team => {
      console.log(`  ${team.rank}. ${team.team.name}`);
    });

    console.log('\n✅ API test complete!');
    console.log('\nNext steps:');
    console.log('  1. Review team names above and create mapping');
    console.log('  2. Verify the "all.played" field is working correctly');
    console.log(`  3. Current complete gameweek appears to be: GW${minGames}`);

  } catch (error) {
    console.error('❌ Error during API test:');
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run the test
testAPI();
