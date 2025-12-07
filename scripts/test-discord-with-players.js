/**
 * Test Discord Webhook with Player Comparisons
 *
 * Simulates what the notification looks like when standings update with player position changes
 */

import { notifySuccess } from './discord-notifier.js';

async function test() {
  console.log('Testing Discord webhook with player comparison data...\n');

  const testStandings = [
    { team: 'Liverpool', position: 1 },
    { team: 'Arsenal', position: 2 },
    { team: 'Chelsea', position: 3 },
  ];

  const testPlayerComparisons = [
    { name: 'Johnny Mancini', currentPosition: 1, currentScore: 45, previousPosition: 3, positionChange: 2 },
    { name: 'Nick C', currentPosition: 2, currentScore: 52, previousPosition: 1, positionChange: -1 },
    { name: 'Kurt R', currentPosition: 3, currentScore: 58, previousPosition: 2, positionChange: -1 },
    { name: 'Arzan', currentPosition: 4, currentScore: 62, previousPosition: 4, positionChange: 0 },
    { name: 'Emmett', currentPosition: 5, currentScore: 65, previousPosition: 8, positionChange: 3 },
    { name: 'John Nickodemus', currentPosition: 6, currentScore: 68, previousPosition: 5, positionChange: -1 },
  ];

  await notifySuccess(14, testStandings, testPlayerComparisons);

  console.log('✅ Test notification sent!');
  console.log('Check your Discord channel to see:');
  console.log('  - Top 3 Premier League teams');
  console.log('  - Biggest player position changes (Johnny up 2, Emmett up 3)');
  console.log('  - Current top 3 players with scores');
}

test().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
