/**
 * Test Discord Webhook
 *
 * Simple script to test Discord notifications are working
 */

import { notifySuccess } from './discord-notifier.js';

async function test() {
  console.log('Testing Discord webhook...');
  console.log('Sending test notification...\n');

  const testStandings = [
    { team: 'Liverpool', position: 1 },
    { team: 'Arsenal', position: 2 },
    { team: 'Chelsea', position: 3 },
  ];

  await notifySuccess(14, testStandings);

  console.log('✅ Test notification sent!');
  console.log('Check your Discord channel to see if the message appeared.');
}

test().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
