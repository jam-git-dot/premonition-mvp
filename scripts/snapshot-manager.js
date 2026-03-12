/**
 * Snapshot Manager
 *
 * Manages team snapshots and calculates standings at any games-played level.
 * This allows us to store data even when teams have different games played,
 * then derive parity standings for any "gameweek" (games-played count).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mapTeamName } from './team-name-mapper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SNAPSHOTS_FILE = path.join(__dirname, '../src/data/teamSnapshots.json');
const STANDINGS_FILE = path.join(__dirname, '../src/data/standingsByGameweek.json');

/**
 * Reads the snapshots file
 */
export function readSnapshots() {
  if (!fs.existsSync(SNAPSHOTS_FILE)) {
    return { snapshots: [], lastFetched: null };
  }
  return JSON.parse(fs.readFileSync(SNAPSHOTS_FILE, 'utf8'));
}

/**
 * Writes to the snapshots file
 */
export function writeSnapshots(data) {
  fs.writeFileSync(SNAPSHOTS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Reads the standings file
 */
export function readStandings() {
  return JSON.parse(fs.readFileSync(STANDINGS_FILE, 'utf8'));
}

/**
 * Writes to the standings file
 */
export function writeStandings(data) {
  fs.writeFileSync(STANDINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Saves a snapshot from API standings data
 * @param {Array} apiStandings - Raw standings array from API
 * @returns {Object} The saved snapshot
 */
export function saveSnapshot(apiStandings) {
  const data = readSnapshots();
  const today = new Date().toISOString().split('T')[0];

  // Convert API data to our snapshot format
  const teams = {};
  apiStandings.forEach(team => {
    const mappedName = mapTeamName(team.team.name);
    teams[mappedName] = {
      played: team.playedGames,
      points: team.points,
      goalDifference: team.goalDifference,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      won: team.won,
      drawn: team.draw,
      lost: team.lost,
      position: team.position
    };
  });

  const snapshot = {
    date: today,
    timestamp: new Date().toISOString(),
    teams
  };

  // Check if we already have a snapshot for today - replace it
  const existingIndex = data.snapshots.findIndex(s => s.date === today);
  if (existingIndex >= 0) {
    data.snapshots[existingIndex] = snapshot;
  } else {
    data.snapshots.push(snapshot);
  }

  data.lastFetched = new Date().toISOString();
  writeSnapshots(data);

  return snapshot;
}

/**
 * Gets the current state: min/max games played across all teams
 * @param {Object} snapshot - A snapshot object
 * @returns {Object} {minGames, maxGames, teamsByGames}
 */
export function getGamesPlayedState(snapshot) {
  const gamesPlayed = Object.values(snapshot.teams).map(t => t.played);
  const minGames = Math.min(...gamesPlayed);
  const maxGames = Math.max(...gamesPlayed);

  // Group teams by games played
  const teamsByGames = {};
  for (const [teamName, teamData] of Object.entries(snapshot.teams)) {
    const games = teamData.played;
    if (!teamsByGames[games]) {
      teamsByGames[games] = [];
    }
    teamsByGames[games].push({ name: teamName, ...teamData });
  }

  return { minGames, maxGames, teamsByGames };
}

/**
 * Calculates standings for a specific games-played count.
 * Finds each team's state when they had exactly N games played.
 *
 * @param {number} gamesTarget - The target games played count
 * @returns {Object|null} Standings object {1: "Team", 2: "Team", ...} or null if not possible
 */
export function calculateStandingsAtGames(gamesTarget) {
  const data = readSnapshots();
  if (data.snapshots.length === 0) return null;

  // For each team, find their state when they had exactly gamesTarget games
  const teamStates = {};
  const allTeams = Object.keys(data.snapshots[data.snapshots.length - 1].teams);

  for (const teamName of allTeams) {
    // Search snapshots from oldest to newest to find when team first reached gamesTarget
    for (const snapshot of data.snapshots) {
      const teamData = snapshot.teams[teamName];
      if (teamData && teamData.played === gamesTarget) {
        // Found the team at exactly gamesTarget games
        teamStates[teamName] = {
          points: teamData.points,
          goalDifference: teamData.goalDifference,
          goalsFor: teamData.goalsFor,
          snapshotDate: snapshot.date
        };
        break; // Use the first (earliest) snapshot at this games count
      }
    }
  }

  // Check if we found data for all 20 teams
  if (Object.keys(teamStates).length !== 20) {
    const missing = allTeams.filter(t => !teamStates[t]);
    console.log(`  Cannot calculate GW${gamesTarget}: Missing data for ${missing.length} teams`);
    return null;
  }

  // Sort teams by points, then GD, then GF (standard tiebreakers)
  const sortedTeams = Object.entries(teamStates)
    .sort((a, b) => {
      // Sort by points (desc)
      if (b[1].points !== a[1].points) return b[1].points - a[1].points;
      // Then by goal difference (desc)
      if (b[1].goalDifference !== a[1].goalDifference) return b[1].goalDifference - a[1].goalDifference;
      // Then by goals for (desc)
      return b[1].goalsFor - a[1].goalsFor;
    });

  // Convert to standings format
  const standings = {};
  sortedTeams.forEach(([teamName], index) => {
    standings[index + 1] = teamName;
  });

  return standings;
}

/**
 * Updates standingsByGameweek.json with any new complete gameweeks.
 * A gameweek is "complete" when we have snapshot data for all 20 teams at that games-played count.
 *
 * @returns {Object} {updated: boolean, newGameweeks: number[], lastGameweek: number}
 */
export function updateStandingsFromSnapshots() {
  const snapshotData = readSnapshots();
  const standingsData = readStandings();

  if (snapshotData.snapshots.length === 0) {
    return { updated: false, newGameweeks: [], lastGameweek: 0 };
  }

  // Find the last saved gameweek
  const existingGameweeks = Object.keys(standingsData)
    .filter(k => /^\d+$/.test(k))
    .map(Number)
    .sort((a, b) => a - b);

  const lastSaved = existingGameweeks.length > 0 ? Math.max(...existingGameweeks) : 0;

  // Get current state from latest snapshot
  const latestSnapshot = snapshotData.snapshots[snapshotData.snapshots.length - 1];
  const { minGames, maxGames } = getGamesPlayedState(latestSnapshot);

  console.log(`  Last saved: GW${lastSaved}, Current range: ${minGames}-${maxGames} games`);

  // Try to calculate standings for any gameweeks we're missing
  const newGameweeks = [];
  for (let gw = lastSaved + 1; gw <= minGames; gw++) {
    const standings = calculateStandingsAtGames(gw);
    if (standings) {
      standingsData[gw] = standings;
      newGameweeks.push(gw);
      console.log(`  Calculated standings for GW${gw}`);
    }
  }

  if (newGameweeks.length > 0) {
    standingsData.lastUpdated = new Date().toISOString();
    writeStandings(standingsData);
  }

  return {
    updated: newGameweeks.length > 0,
    newGameweeks,
    lastGameweek: newGameweeks.length > 0 ? Math.max(...newGameweeks) : lastSaved
  };
}

/**
 * Gets a summary of the current snapshot state
 */
export function getSnapshotSummary() {
  const data = readSnapshots();

  if (data.snapshots.length === 0) {
    return { hasData: false };
  }

  const latest = data.snapshots[data.snapshots.length - 1];
  const { minGames, maxGames, teamsByGames } = getGamesPlayedState(latest);

  return {
    hasData: true,
    snapshotCount: data.snapshots.length,
    latestDate: latest.date,
    minGames,
    maxGames,
    teamCounts: Object.fromEntries(
      Object.entries(teamsByGames).map(([games, teams]) => [games, teams.length])
    )
  };
}
