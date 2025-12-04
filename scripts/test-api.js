/**
 * Test script to verify Football-Data.org API connectivity and inspect response format
 * Run with: node scripts/test-api.js
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';

// API Configuration
const API_LIMITS = {
  callsPerMinute: 10,  // Free tier limit
  expectedUsage: 'few calls per week' // Our expected usage pattern
};

// Premier League competition code
const COMPETITION_ID = 'PL'; // or 2021 for numeric ID

if (!API_KEY) {
  console.error('❌ ERROR: FOOTBALL_API_KEY not found in .env.local');
  console.error('Please add: FOOTBALL_API_KEY=your_key_here');
  process.exit(1);
}

async function testAPI() {
  console.log('🔍 Testing Football-Data.org API connection...\n');
  console.log('📊 API Configuration:');
  console.log(`   Rate Limit: ${API_LIMITS.callsPerMinute} calls/minute`);
  console.log(`   Expected Usage: ${API_LIMITS.expectedUsage}\n`);

  try {
    // Test: Get current standings
    console.log('📊 Fetching Premier League standings...');
    const response = await fetch(`${BASE_URL}/competitions/${COMPETITION_ID}/standings`, {
      method: 'GET',
      headers: {
        'X-Auth-Token': API_KEY
      }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    // Check rate limit headers
    const rateLimitRemaining = response.headers.get('X-Requests-Available-Minute');
    if (rateLimitRemaining) {
      console.log(`Rate Limit Remaining: ${rateLimitRemaining}/${API_LIMITS.callsPerMinute} calls this minute`);
    }
    console.log();

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API request failed:');
      console.error(errorText);
      return;
    }

    const data = await response.json();

    console.log('✅ API connection successful!\n');

    // IMPORTANT: Check what season we're actually getting
    console.log('🗓️  SEASON INFORMATION:');
    if (data.season) {
      console.log(`   Start Date: ${data.season.startDate}`);
      console.log(`   End Date: ${data.season.endDate}`);
      console.log(`   Current Matchday: ${data.season.currentMatchday}`);
      console.log(`   Winner (if ended): ${data.season.winner || 'N/A - Season in progress'}`);
    }
    console.log();

    // Check if we have standings data
    if (!data.standings || data.standings.length === 0) {
      console.log('❌ No standings data returned');
      console.log('Full response:', JSON.stringify(data, null, 2));
      return;
    }

    // Football-data.org returns standings in an array, first element is the main table
    const standings = data.standings[0].table;

    console.log('📈 Standings Data Structure Check:');
    console.log(`   Total teams: ${standings.length}`);
    console.log();

    // Display first 3 teams to verify data structure
    console.log('🔍 Sample Data (Top 3 teams):\n');
    standings.slice(0, 3).forEach((team) => {
      console.log(`Position ${team.position}: ${team.team.name}`);
      console.log(`   Games Played: ${team.playedGames}`);
      console.log(`   Points: ${team.points}`);
      console.log(`   W-D-L: ${team.won}-${team.draw}-${team.lost}`);
      console.log();
    });

    // Check for required fields
    console.log('✅ Key Fields Verified:');
    console.log(`   - "position" field exists: ${standings[0].position !== undefined}`);
    console.log(`   - "team.name" field exists: ${standings[0].team?.name !== undefined}`);
    console.log(`   - "playedGames" field exists: ${standings[0].playedGames !== undefined}`);
    console.log();

    // Find minimum games played (this determines the current complete gameweek)
    const gamesPlayed = standings.map(team => team.playedGames);
    const minGames = Math.min(...gamesPlayed);
    const maxGames = Math.max(...gamesPlayed);

    console.log('🎮 Gameweek Status:');
    console.log(`   Minimum games played: ${minGames}`);
    console.log(`   Maximum games played: ${maxGames}`);
    console.log(`   Current complete gameweek: GW${minGames}`);
    console.log();

    if (minGames !== maxGames) {
      console.log('⚠️  Not all teams have played the same number of games');
      const teamsWithMinGames = standings.filter(team => team.playedGames === minGames);
      console.log(`   Teams with ${minGames} games played:`);
      teamsWithMinGames.forEach(team => console.log(`      - ${team.team.name}`));
      console.log();
    } else {
      console.log('✅ All teams have played the same number of games');
      console.log(`   Gameweek ${minGames} is COMPLETE and ready to save!`);
      console.log();
    }

    // Display all team names for mapping reference
    console.log('📝 All Team Names (for mapping):');
    standings.forEach(team => {
      console.log(`   ${team.position}. ${team.team.name}`);
    });

    console.log('\n✅ API test complete!');
    console.log('\n📋 Summary:');
    console.log(`   - API working: YES`);
    console.log(`   - Season: ${data.season?.startDate} to ${data.season?.endDate}`);
    console.log(`   - "playedGames" field available: YES`);
    console.log(`   - Current complete gameweek: GW${minGames}`);
    console.log(`   - Rate limit comfortable: YES (${API_LIMITS.callsPerMinute}/min >> ${API_LIMITS.expectedUsage})`);

  } catch (error) {
    console.error('❌ Error during API test:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run the test
testAPI();
