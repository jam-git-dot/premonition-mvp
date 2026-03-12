/**
 * Calculate Historical Standings
 *
 * Fetches all match results from the API and calculates standings
 * as they were at the end of each gameweek.
 *
 * Usage:
 *   node scripts/calculate-historical-standings.js <from-gameweek> <to-gameweek>
 *   node scripts/calculate-historical-standings.js 22 28
 *
 * This script outputs a JSON file that can be used with bulk-backfill.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { mapTeamName } from './team-name-mapper.js';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = 'https://api.football-data.org/v4';
const COMPETITION_ID = 'PL';

// Rate limiting - 10 calls per minute on free tier
const RATE_LIMIT_DELAY = 6500; // ms between calls to stay under limit

/**
 * Wait for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Makes an authenticated request to the Football-Data.org API
 */
async function makeApiRequest(endpoint) {
  if (!API_KEY) {
    throw new Error('FOOTBALL_API_KEY not found in .env.local');
  }

  const url = `${BASE_URL}${endpoint}`;
  console.log(`Fetching: ${endpoint}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Auth-Token': API_KEY
    }
  });

  const rateLimitRemaining = response.headers.get('X-Requests-Available-Minute');
  if (rateLimitRemaining !== null) {
    console.log(`  Rate limit remaining: ${rateLimitRemaining}/10`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Fetches all finished matches up to a specific matchday
 */
async function fetchMatchesUpToMatchday(matchday) {
  // Fetch all matches for the season
  const data = await makeApiRequest(`/competitions/${COMPETITION_ID}/matches?status=FINISHED`);

  // Filter matches up to and including the target matchday
  const matches = data.matches.filter(m => m.matchday <= matchday);

  console.log(`  Found ${matches.length} finished matches up to matchday ${matchday}`);
  return matches;
}

/**
 * Calculates standings from match results
 */
function calculateStandings(matches) {
  const teams = {};

  // Initialize all teams with zero stats
  for (const match of matches) {
    const homeTeam = match.homeTeam.name;
    const awayTeam = match.awayTeam.name;

    if (!teams[homeTeam]) {
      teams[homeTeam] = {
        name: homeTeam,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      };
    }
    if (!teams[awayTeam]) {
      teams[awayTeam] = {
        name: awayTeam,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      };
    }
  }

  // Process each match
  for (const match of matches) {
    const homeTeam = match.homeTeam.name;
    const awayTeam = match.awayTeam.name;
    const homeGoals = match.score.fullTime.home;
    const awayGoals = match.score.fullTime.away;

    if (homeGoals === null || awayGoals === null) {
      continue; // Skip matches without results
    }

    // Update home team stats
    teams[homeTeam].played++;
    teams[homeTeam].goalsFor += homeGoals;
    teams[homeTeam].goalsAgainst += awayGoals;

    // Update away team stats
    teams[awayTeam].played++;
    teams[awayTeam].goalsFor += awayGoals;
    teams[awayTeam].goalsAgainst += homeGoals;

    // Determine winner
    if (homeGoals > awayGoals) {
      teams[homeTeam].won++;
      teams[homeTeam].points += 3;
      teams[awayTeam].lost++;
    } else if (homeGoals < awayGoals) {
      teams[awayTeam].won++;
      teams[awayTeam].points += 3;
      teams[homeTeam].lost++;
    } else {
      teams[homeTeam].drawn++;
      teams[awayTeam].drawn++;
      teams[homeTeam].points += 1;
      teams[awayTeam].points += 1;
    }
  }

  // Calculate goal difference
  for (const team of Object.values(teams)) {
    team.goalDifference = team.goalsFor - team.goalsAgainst;
  }

  // Sort by points, then goal difference, then goals scored
  const sortedTeams = Object.values(teams).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return sortedTeams;
}

/**
 * Converts standings to our format
 */
function formatStandings(sortedTeams) {
  const standings = {};
  sortedTeams.forEach((team, index) => {
    try {
      const mappedName = mapTeamName(team.name);
      standings[index + 1] = mappedName;
    } catch (error) {
      console.warn(`  Warning: Could not map team "${team.name}"`);
      standings[index + 1] = team.name;
    }
  });
  return standings;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Calculate Historical Standings');
  console.log('='.repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  console.log();

  const args = process.argv.slice(2);

  if (args.length < 2 || args[0] === '--help') {
    console.log('Usage:');
    console.log('  node scripts/calculate-historical-standings.js <from-gameweek> <to-gameweek>');
    console.log();
    console.log('Example:');
    console.log('  node scripts/calculate-historical-standings.js 22 28');
    console.log();
    console.log('Output:');
    console.log('  Creates backfill-data.json in the scripts directory');
    process.exit(0);
  }

  const fromGW = parseInt(args[0]);
  const toGW = parseInt(args[1]);

  if (isNaN(fromGW) || isNaN(toGW) || fromGW < 1 || toGW > 38 || fromGW > toGW) {
    console.error('ERROR: Invalid gameweek range');
    process.exit(1);
  }

  console.log(`Calculating standings for gameweeks ${fromGW} to ${toGW}`);
  console.log();

  // Fetch all finished matches once
  console.log('Step 1: Fetching all finished matches...');
  const allMatches = await makeApiRequest(`/competitions/${COMPETITION_ID}/matches?status=FINISHED`);
  console.log(`Total finished matches: ${allMatches.matches.length}`);
  console.log();

  const results = {};

  for (let gw = fromGW; gw <= toGW; gw++) {
    console.log(`Step ${gw - fromGW + 2}: Calculating standings for GW${gw}...`);

    // Filter matches up to this gameweek
    const matchesUpToGW = allMatches.matches.filter(m => m.matchday <= gw);

    // Check if we have enough matches
    const matchesInGW = allMatches.matches.filter(m => m.matchday === gw);
    const finishedInGW = matchesInGW.filter(m => m.status === 'FINISHED');

    console.log(`  Matches in GW${gw}: ${matchesInGW.length} (${finishedInGW.length} finished)`);

    if (finishedInGW.length < 10) {
      console.log(`  WARNING: GW${gw} appears incomplete (only ${finishedInGW.length}/10 matches)`);
    }

    // Calculate standings
    const standings = calculateStandings(matchesUpToGW);
    results[gw] = formatStandings(standings);

    console.log(`  Top 5: ${results[gw][1]}, ${results[gw][2]}, ${results[gw][3]}, ${results[gw][4]}, ${results[gw][5]}`);
    console.log();
  }

  // Write output file
  const outputPath = path.join(__dirname, 'backfill-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log('='.repeat(60));
  console.log('COMPLETE');
  console.log('='.repeat(60));
  console.log(`Output written to: ${outputPath}`);
  console.log();
  console.log('Next step:');
  console.log(`  node scripts/bulk-backfill.js ${outputPath}`);
  console.log('='.repeat(60));
}

main().catch(error => {
  console.error('\nFATAL ERROR:');
  console.error(error.message);
  process.exit(1);
});
