/**
 * Team Name Mapper
 *
 * Maps team names from the Football-Data.org API to the exact format
 * used in our standingsByGameweek.json file.
 *
 * API format typically includes "FC" or "AFC" suffixes (e.g., "Arsenal FC")
 * Our format uses cleaner names without suffixes (e.g., "Arsenal")
 */

const TEAM_NAME_MAP = {
  // API Name -> Our Format
  'Arsenal FC': 'Arsenal',
  'Manchester City FC': 'Manchester City',
  'Aston Villa FC': 'Aston Villa',
  'Chelsea FC': 'Chelsea',
  'Crystal Palace FC': 'Crystal Palace',
  'Sunderland AFC': 'Sunderland',
  'Brighton & Hove Albion FC': 'Brighton & Hove Albion',
  'Liverpool FC': 'Liverpool',
  'Manchester United FC': 'Manchester United',
  'Everton FC': 'Everton',
  'Tottenham Hotspur FC': 'Tottenham Hotspur',
  'Newcastle United FC': 'Newcastle United',
  'Brentford FC': 'Brentford',
  'AFC Bournemouth': 'AFC Bournemouth',
  'Fulham FC': 'Fulham',
  'Nottingham Forest FC': 'Nottingham Forest',
  'Leeds United FC': 'Leeds United',
  'West Ham United FC': 'West Ham United',
  'Burnley FC': 'Burnley',
  'Wolverhampton Wanderers FC': 'Wolverhampton Wanderers'
};

/**
 * Maps an API team name to our internal format
 * @param {string} apiTeamName - Team name as returned by the API
 * @returns {string} Team name in our format
 * @throws {Error} If team name is not found in mapping
 */
export function mapTeamName(apiTeamName) {
  const mappedName = TEAM_NAME_MAP[apiTeamName];

  if (!mappedName) {
    throw new Error(`Unknown team name from API: "${apiTeamName}". Please update team-name-mapper.js`);
  }

  return mappedName;
}

/**
 * Validates that all teams in the API response can be mapped
 * @param {Array} standings - Array of team standings from API
 * @returns {Object} Object with isValid boolean and any unmapped team names
 */
export function validateTeamMapping(standings) {
  const unmappedTeams = [];

  standings.forEach(team => {
    const apiName = team.team.name;
    if (!TEAM_NAME_MAP[apiName]) {
      unmappedTeams.push(apiName);
    }
  });

  return {
    isValid: unmappedTeams.length === 0,
    unmappedTeams
  };
}

/**
 * Gets all expected team names in our format
 * @returns {Array<string>} Array of team names
 */
export function getExpectedTeamNames() {
  return Object.values(TEAM_NAME_MAP);
}

export default TEAM_NAME_MAP;
