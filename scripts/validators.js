/**
 * Data Validation Functions
 *
 * Provides validation checks for standings data before saving to ensure
 * data integrity and prevent corrupting the standingsByGameweek.json file.
 */

import { getExpectedTeamNames } from './team-name-mapper.js';

/**
 * Validates that standings data meets all requirements before saving
 * @param {Object} standingsData - Mapped standings data {position: teamName}
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export function validateStandingsData(standingsData) {
  const errors = [];

  // Check 1: Verify exactly 20 teams
  const teamCount = Object.keys(standingsData).length;
  if (teamCount !== 20) {
    errors.push(`Expected 20 teams, got ${teamCount}`);
  }

  // Check 2: Verify positions 1-20 are all present (no gaps)
  for (let position = 1; position <= 20; position++) {
    if (!standingsData[position]) {
      errors.push(`Missing position ${position}`);
    }
  }

  // Check 3: Verify no duplicate teams
  const teamNames = Object.values(standingsData);
  const uniqueTeams = new Set(teamNames);
  if (uniqueTeams.size !== teamNames.length) {
    const duplicates = teamNames.filter((name, index) =>
      teamNames.indexOf(name) !== index
    );
    errors.push(`Duplicate teams found: ${duplicates.join(', ')}`);
  }

  // Check 4: Verify no duplicate positions
  const positions = Object.keys(standingsData).map(Number);
  const uniquePositions = new Set(positions);
  if (uniquePositions.size !== positions.length) {
    errors.push('Duplicate positions found');
  }

  // Check 5: Verify all team names match our expected format
  const expectedTeams = getExpectedTeamNames();
  const unexpectedTeams = teamNames.filter(name => !expectedTeams.includes(name));
  if (unexpectedTeams.length > 0) {
    errors.push(`Unexpected team names: ${unexpectedTeams.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates that a gameweek number is valid
 * @param {number} gameweek - Gameweek number to validate
 * @returns {Object} Validation result
 */
export function validateGameweek(gameweek) {
  const errors = [];

  if (!Number.isInteger(gameweek)) {
    errors.push('Gameweek must be an integer');
  }

  if (gameweek < 1 || gameweek > 38) {
    errors.push('Gameweek must be between 1 and 38');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates that all teams have played the expected number of games
 * @param {Array} standings - API standings data
 * @param {number} expectedGames - Expected number of games played
 * @returns {Object} Validation result
 */
export function validateGamesPlayed(standings, expectedGames) {
  const errors = [];
  const teamsWithWrongGames = [];

  standings.forEach(team => {
    if (team.playedGames !== expectedGames) {
      teamsWithWrongGames.push({
        name: team.team.name,
        played: team.playedGames
      });
    }
  });

  if (teamsWithWrongGames.length > 0) {
    errors.push(
      `Not all teams have played ${expectedGames} games: ` +
      teamsWithWrongGames.map(t => `${t.name} (${t.played})`).join(', ')
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    teamsWithWrongGames
  };
}

/**
 * Logs a preview of what will be saved
 * @param {number} gameweek - Gameweek number
 * @param {Object} standingsData - Standings data to preview
 */
export function logPreview(gameweek, standingsData) {
  console.log(`\nPreview of Gameweek ${gameweek} standings:`);
  console.log('─'.repeat(50));

  for (let position = 1; position <= 20; position++) {
    const teamName = standingsData[position];
    console.log(`${String(position).padStart(2, ' ')}. ${teamName}`);
  }

  console.log('─'.repeat(50));
}
