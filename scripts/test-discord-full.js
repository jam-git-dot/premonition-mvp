/**
 * Test Discord Webhook - Full Notification
 *
 * Simulates a complete notification with team changes and player comparisons
 */

import { notifySuccess } from './discord-notifier.js';

async function test() {
  console.log('Testing full Discord notification with team and player changes...\n');

  // Simulate current gameweek standings (GW14)
  const currentStandings = [
    { team: 'Liverpool', position: 1 },
    { team: 'Arsenal', position: 2 },
    { team: 'Chelsea', position: 3 },
    { team: 'Manchester City', position: 4 },
    { team: 'Nottingham Forest', position: 5 },  // Was 8th - moved up 3
    { team: 'Brighton & Hove Albion', position: 6 },
    { team: 'Newcastle United', position: 7 },
    { team: 'Aston Villa', position: 8 },
    { team: 'Tottenham Hotspur', position: 9 },
    { team: 'Fulham', position: 10 },
    { team: 'Brentford', position: 11 },
    { team: 'AFC Bournemouth', position: 12 },
    { team: 'Manchester United', position: 13 }, // Was 10th - dropped 3
    { team: 'West Ham United', position: 14 },
    { team: 'Crystal Palace', position: 15 },
    { team: 'Everton', position: 16 },
    { team: 'Wolverhampton Wanderers', position: 17 },
    { team: 'Leeds United', position: 18 },
    { team: 'Sunderland', position: 19 },
    { team: 'Burnley', position: 20 },
  ];

  // Simulate previous gameweek standings (GW13)
  const previousStandings = {
    1: 'Liverpool',
    2: 'Arsenal',
    3: 'Chelsea',
    4: 'Manchester City',
    5: 'Brighton & Hove Albion',
    6: 'Newcastle United',
    7: 'Aston Villa',
    8: 'Nottingham Forest',      // Now 5th - moved up 3
    9: 'Tottenham Hotspur',
    10: 'Manchester United',      // Now 13th - dropped 3
    11: 'Fulham',
    12: 'Brentford',
    13: 'AFC Bournemouth',
    14: 'West Ham United',
    15: 'Crystal Palace',
    16: 'Everton',
    17: 'Wolverhampton Wanderers',
    18: 'Leeds United',
    19: 'Sunderland',
    20: 'Burnley',
  };

  // Simulate player comparison data
  const playerComparisons = [
    { name: 'Johnny Mancini', currentPosition: 1, currentScore: 45, previousPosition: 3, positionChange: 2 },
    { name: 'Nick C', currentPosition: 2, currentScore: 52, previousPosition: 1, positionChange: -1 },
    { name: 'Kurt R', currentPosition: 3, currentScore: 58, previousPosition: 2, positionChange: -1 },
    { name: 'Arzan', currentPosition: 4, currentScore: 62, previousPosition: 4, positionChange: 0 },
    { name: 'Emmett', currentPosition: 5, currentScore: 65, previousPosition: 8, positionChange: 3 },
  ];

  await notifySuccess(14, currentStandings, playerComparisons, previousStandings);

  console.log('✅ Test notification sent!');
  console.log('Check your Discord channel to see:');
  console.log('  ⚽ Biggest Premier League table movers (Forest up 3, Man Utd down 3)');
  console.log('  🎯 Biggest player position changes (Johnny up 2, Emmett up 3)');
  console.log('  🏆 Current top 3 players with scores');
}

test().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
