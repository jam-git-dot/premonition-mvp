// src/data/teamInfo.js
// Centralized team metadata (names, ids, abbreviations, color classes, logos)

// Data keyed by team id (for drag list)
const teamDataById = {
  'arsenal': { name: 'Arsenal', abbreviation: 'ARS', colorClasses: 'bg-red-600', primary: '#DC143C', secondary: '#FFFFFF' },
  'aston-villa': { name: 'Aston Villa', abbreviation: 'AVL', colorClasses: 'bg-purple-800', primary: '#7B1342', secondary: '#94D3E0' },
  'afc-bournemouth': { name: 'AFC Bournemouth', abbreviation: 'BOU', colorClasses: 'bg-red-500', primary: '#DA020E', secondary: '#000000' },
  'brentford': { name: 'Brentford', abbreviation: 'BRE', colorClasses: 'bg-red-500', primary: '#FB0E00', secondary: '#FFF200' },
  'brighton-&-hove-albion': { name: 'Brighton & Hove Albion', abbreviation: 'BRI', colorClasses: 'bg-blue-500', primary: '#0057B8', secondary: '#FFCD00' },
  'burnley': { name: 'Burnley', abbreviation: 'BUR', colorClasses: 'bg-purple-900', primary: '#6C1D45', secondary: '#99D6EA' },
  'chelsea': { name: 'Chelsea', abbreviation: 'CHE', colorClasses: 'bg-blue-600', primary: '#034694', secondary: '#FFFFFF' },
  'crystal-palace': { name: 'Crystal Palace', abbreviation: 'CRY', colorClasses: 'bg-blue-800', primary: '#1B458F', secondary: '#C4122E' },
  'everton': { name: 'Everton', abbreviation: 'EVE', colorClasses: 'bg-blue-700', primary: '#003399', secondary: '#FFFFFF' },
  'fulham': { name: 'Fulham', abbreviation: 'FUL', colorClasses: 'bg-white border', primary: '#FFFFFF', secondary: '#000000' },
  'leeds-united': { name: 'Leeds United', abbreviation: 'LEE', colorClasses: 'bg-white border', primary: '#FFFFFF', secondary: '#1D428A' },
  'liverpool': { name: 'Liverpool', abbreviation: 'LIV', colorClasses: 'bg-red-700', primary: '#C8102E', secondary: '#00B2A9' },
  'manchester-city': { name: 'Manchester City', abbreviation: 'MCI', colorClasses: 'bg-sky-500', primary: '#6CABDD', secondary: '#1C2C5B' },
  'manchester-united': { name: 'Manchester United', abbreviation: 'MUN', colorClasses: 'bg-red-600', primary: '#DA020E', secondary: '#FBE122' },
  'newcastle-united': { name: 'Newcastle United', abbreviation: 'NEW', colorClasses: 'bg-black', primary: '#241F20', secondary: '#FFFFFF' },
  'nottingham-forest': { name: 'Nottingham Forest', abbreviation: 'NFO', colorClasses: 'bg-red-700', primary: '#DD0000', secondary: '#FFFFFF' },
  'sunderland': { name: 'Sunderland', abbreviation: 'SUN', colorClasses: 'bg-red-600', primary: '#C8102E', secondary: '#FFFFFF' },
  'tottenham-hotspur': { name: 'Tottenham Hotspur', abbreviation: 'TOT', colorClasses: 'bg-white border', primary: '#FFFFFF', secondary: '#132257' },
  'west-ham-united': { name: 'West Ham United', abbreviation: 'WHU', colorClasses: 'bg-purple-900', primary: '#7A263A', secondary: '#1BB1E7' },
  'wolverhampton-wanderers': { name: 'Wolverhampton Wanderers', abbreviation: 'WOL', colorClasses: 'bg-orange-500', primary: '#FDB462', secondary: '#231F20' }
};

// Data keyed by full team name (for display components)
const teamDataByName = Object.values(teamDataById).reduce((acc, info) => {
  acc[info.name] = info;
  return acc;
}, {});

/**
 * Get team info by id (e.g. 'arsenal').
 */
export function getTeamInfo(id) {
  return teamDataById[id] || { name: id, abbreviation: id.substring(0,3).toUpperCase(), colorClasses: 'bg-gray-500', primary: '#6B7280', secondary: '#FFFFFF' };
}

/**
 * Get team abbreviation by full name (e.g. 'Arsenal').
 */
export function getTeamAbbreviation(name) {
  return teamDataByName[name]?.abbreviation || name.substring(0,3).toUpperCase();
}

/**
 * Get team color classes by full name.
 */
export function getTeamColorClasses(name) {
  return teamDataByName[name]?.colorClasses || 'bg-gray-500';
}
