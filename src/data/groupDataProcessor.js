// src/data/groupDataProcessor.js
// Processes raw predictions into group statistics and consensus data

import { realPredictions } from './competitionData.js';

// All Premier League teams in alphabetical order
const ALL_TEAMS = [
  "AFC Bournemouth", "Arsenal", "Aston Villa", "Brentford", "Brighton & Hove Albion",
  "Burnley", "Chelsea", "Crystal Palace", "Everton", "Fulham", "Leeds United",
  "Liverpool", "Manchester City", "Manchester United", "Newcastle United",
  "Nottingham Forest", "Sunderland", "Tottenham Hotspur", "West Ham United",
  "Wolverhampton Wanderers"
];

/**
 * Calculate group statistics for all teams based on predictions
 * @param {string} groupFilter - 'all', 'LIV', 'TOG', etc.
 * @returns {Object} Team statistics keyed by team name
 */
export function calculateGroupStatistics(groupFilter = 'all') {
  // Filter predictions by group
  const filteredPredictions = groupFilter === 'all' 
    ? realPredictions 
    : realPredictions.filter(prediction => prediction.groups.includes(groupFilter));

  const teamStats = {};
  
  // Initialize arrays for each team
  ALL_TEAMS.forEach(team => {
    teamStats[team] = [];
  });
  
  // Collect all predicted positions for each team
  filteredPredictions.forEach(prediction => {
    prediction.rankings.forEach((teamName, index) => {
      const predictedPosition = index + 1;
      if (teamStats[teamName]) {
        teamStats[teamName].push(predictedPosition);
      }
    });
  });
  
  // Calculate statistics for each team
  const processedStats = {};
  ALL_TEAMS.forEach(team => {
    const positions = teamStats[team];
    
    if (positions.length > 0) {
      // Sort for median calculation
      const sorted = [...positions].sort((a, b) => a - b);
      
      // Calculate mean
      const mean = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
      
      // Calculate median
      const median = sorted.length % 2 === 0 
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];
      
      // Calculate standard deviation
      const variance = positions.reduce((sum, pos) => sum + Math.pow(pos - mean, 2), 0) / positions.length;
      const stdDev = Math.sqrt(variance);
      
      // Calculate range (μ ± 1σ)
      const rangeLow = Math.round((mean + stdDev) * 10) / 10;
      const rangeHigh = Math.round((mean - stdDev) * 10) / 10;
      
      processedStats[team] = {
        mean: Math.round(mean * 10) / 10,
        median: median,
        stdDev: Math.round(stdDev * 10) / 10,
        rangeLow: rangeLow,
        rangeHigh: rangeHigh,
        count: positions.length,
        positions: positions // Keep raw data for debugging
      };
    } else {
      // Handle case where team has no predictions
      processedStats[team] = {
        mean: null,
        median: null,
        stdDev: null,
        rangeLow: null,
        rangeHigh: null,
        count: 0,
        positions: []
      };
    }
  });
  
  return processedStats;
}

/**
 * Create group consensus ranking by sorting teams by mean predicted position
 * @param {string} groupFilter - 'all', 'LIV', 'TOG', etc.
 * @returns {Array} Array of team names in consensus ranking order (1st to 20th)
 */
export function createGroupConsensus(groupFilter = 'all') {
  const stats = calculateGroupStatistics(groupFilter);
  
  // Create array of teams with their mean positions
  const teamsWithMeans = ALL_TEAMS
    .filter(team => stats[team].mean !== null) // Only include teams with predictions
    .map(team => ({
      team: team,
      meanPosition: stats[team].mean
    }));
  
  // Sort by mean position (ascending = best to worst)
  teamsWithMeans.sort((a, b) => a.meanPosition - b.meanPosition);
  
  // Return just the team names in consensus order
  return teamsWithMeans.map(item => item.team);
}

/**
 * Calculate group consensus score against current standings
 * @param {string} groupFilter - 'all', 'LIV', 'TOG', etc.
 * @param {Object} currentStandings - Current PL table {position: teamName}
 * @returns {Object} Consensus scoring data
 */
export function calculateGroupConsensusScore(groupFilter = 'all', currentStandings) {
  const consensus = createGroupConsensus(groupFilter);
  
  // Create team position lookup from current standings
  const teamCurrentPosition = {};
  Object.entries(currentStandings).forEach(([pos, team]) => {
    teamCurrentPosition[team] = parseInt(pos);
  });

  let totalScore = 0;
  const teamScores = {};

  consensus.forEach((teamName, index) => {
    const predictedPosition = index + 1;
    const actualPosition = teamCurrentPosition[teamName];
    
    if (actualPosition) {
      const score = Math.abs(predictedPosition - actualPosition);
      totalScore += score;
      teamScores[teamName] = {
        score: score,
        predictedPosition: predictedPosition,
        actualPosition: actualPosition,
        difference: predictedPosition - actualPosition
      };
    }
  });

  return {
    name: "Group Consensus",
    groups: [groupFilter],
    totalScore: totalScore,
    teamScores: teamScores,
    isConsensus: true,
    consensusRanking: consensus
  };
}

/**
 * Create group prediction rankings (1-20) based on group averages
 * @param {string} groupFilter - 'all', 'LIV', 'TOG', etc.
 * @returns {Object} Team names keyed to their group prediction rank (1-20)
 */
export function createGroupPredictionRanks(groupFilter = 'all') {
  const stats = calculateGroupStatistics(groupFilter);
  
  // Create array of teams with their mean positions
  const teamsWithMeans = ALL_TEAMS
    .filter(team => stats[team].mean !== null) // Only include teams with predictions
    .map(team => ({
      team: team,
      meanPosition: stats[team].mean
    }));
  
  // Sort by mean position (ascending = best to worst)
  teamsWithMeans.sort((a, b) => a.meanPosition - b.meanPosition);
  
  // Create rank mapping
  const groupPredictionRanks = {};
  teamsWithMeans.forEach((item, index) => {
    groupPredictionRanks[item.team] = index + 1;
  });
  
  return groupPredictionRanks;
}

/**
 * Calculate overachievers and underachievers
 * @param {string} groupFilter - 'all', 'LIV', 'TOG', etc.
 * @param {Object} currentStandings - Current PL table {position: teamName}
 * @returns {Object} Lists of overachievers and underachievers
 */
export function calculateOverUnderAchievers(groupFilter = 'all', currentStandings) {
  const groupPredictionRanks = createGroupPredictionRanks(groupFilter);
  
  // Create team position lookup from current standings
  const teamCurrentPosition = {};
  Object.entries(currentStandings).forEach(([pos, team]) => {
    teamCurrentPosition[team] = parseInt(pos);
  });

  const teamPerformance = [];
  
  // Calculate delta for each team (predicted - actual)
  Object.keys(groupPredictionRanks).forEach(team => {
    const currentPos = teamCurrentPosition[team];
    const groupPredicted = groupPredictionRanks[team];
    
    if (currentPos && groupPredicted) {
      const delta = groupPredicted - currentPos; // Positive = overachieving
      teamPerformance.push({
        team: team,
        currentPosition: currentPos,
        groupPredicted: groupPredicted,
        delta: delta
      });
    }
  });

  // Sort by delta and get top 5 overachievers (highest positive delta)
  const overachievers = teamPerformance
    .filter(t => t.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 5);

  // Sort by delta and get top 5 underachievers (most negative delta)  
  const underachievers = teamPerformance
    .filter(t => t.delta < 0)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 5);

  return { overachievers, underachievers };
}

/**
 * Get team abbreviation
 * @param {string} teamName - Full team name
 * @returns {string} Three-letter abbreviation
 */
export function getTeamAbbreviation(teamName) {
  const abbreviations = {
    'Liverpool': 'LIV',
    'Arsenal': 'ARS', 
    'Tottenham Hotspur': 'TOT',
    'AFC Bournemouth': 'BOU',
    'Chelsea': 'CHE',
    'Everton': 'EVE',
    'Sunderland': 'SUN',
    'Manchester City': 'MCI',
    'Crystal Palace': 'CRY',
    'Newcastle United': 'NEW',
    'Fulham': 'FUL',
    'Brentford': 'BRE',
    'Brighton & Hove Albion': 'BRI',
    'Manchester United': 'MUN',
    'Nottingham Forest': 'NFO',
    'Leeds United': 'LEE',
    'Burnley': 'BUR',
    'West Ham United': 'WHU',
    'Aston Villa': 'AVL',
    'Wolverhampton Wanderers': 'WOL'
  };
  return abbreviations[teamName] || teamName.substring(0, 3).toUpperCase();
}

/**
 * Get all processed data for a group (convenience function)
 * @param {string} groupFilter - 'all', 'LIV', 'TOG', etc.
 * @param {Object} currentStandings - Current PL table
 * @returns {Object} All processed group data
 */
export function getGroupData(groupFilter = 'all', currentStandings) {
  const statistics = calculateGroupStatistics(groupFilter);
  const consensus = createGroupConsensus(groupFilter);
  const consensusScore = calculateGroupConsensusScore(groupFilter, currentStandings);
  const groupPredictionRanks = createGroupPredictionRanks(groupFilter);
  const { overachievers, underachievers } = calculateOverUnderAchievers(groupFilter, currentStandings);
  
  return {
    statistics,
    consensus,
    consensusScore,
    groupPredictionRanks,
    overachievers,
    underachievers,
    groupFilter,
    teamCount: ALL_TEAMS.length,
    predictionCount: groupFilter === 'all' 
      ? realPredictions.length 
      : realPredictions.filter(p => p.groups.includes(groupFilter)).length
  };
}

// Export for debugging
export { ALL_TEAMS, realPredictions };