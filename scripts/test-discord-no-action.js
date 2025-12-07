/**
 * Test Discord Webhook - No Action Scenario
 *
 * Simulates when the automated script runs but no gameweek is complete yet
 */

import { notifyNoAction } from './discord-notifier.js';

async function test() {
  console.log('Testing Discord webhook - No Action scenario...');
  console.log('Simulating: Gameweek in progress, not all teams have completed matches\n');

  await notifyNoAction('Gameweek in progress - not all teams have completed matches', {
    currentGameweek: 14,
    gamesPlayed: 'Teams have varying games played (4 teams with 14 games, 16 teams with 15 games)'
  });

  console.log('✅ Notification sent!');
  console.log('This is what you\'ll see when the automation runs daily but the gameweek isn\'t complete yet.');
}

test().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
