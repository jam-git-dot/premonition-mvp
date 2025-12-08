// src/utils/weekComparison.js
// Utility functions for comparing player standings between gameweeks

import scoresByGameweekData from '../data/scoresByGameweek.json';

// Cache the imported data
const scoresCache = scoresByGameweekData;

async function loadScoresData() {
  return scoresCache;
}

/**
 * Compare player standings between two gameweeks
 * @param {number} weekA - Earlier gameweek
 * @param {number} weekB - Later gameweek (current week)
 * @param {string} groupFilter - Optional group filter ('all', 'LIV', 'TOG', 'FPL')
 * @returns {Array|Promise<Array>} Array of comparison objects with position and score changes
 */
export async function compareWeeks(weekA, weekB, groupFilter = 'all') {
  const scoresData = await loadScoresData();

  console.log('Comparing weeks:', weekA, 'to', weekB);
  console.log('Available data:', Object.keys(scoresData || {}).filter(k => !isNaN(k)));
  console.log('Has weekA data:', !!scoresData?.[weekA]);
  console.log('Has weekB data:', !!scoresData?.[weekB]);

  if (!scoresData || !scoresData[weekA] || !scoresData[weekB]) {
    console.error('Missing data for comparison', { weekA, weekB, hasWeekA: !!scoresData?.[weekA], hasWeekB: !!scoresData?.[weekB] });
    return null;
  }

  // Filter by group if needed
  let playersWeekA = scoresData[weekA];
  let playersWeekB = scoresData[weekB];

  if (groupFilter !== 'all') {
    playersWeekA = playersWeekA.filter(p => p.groups.includes(groupFilter));
    playersWeekB = playersWeekB.filter(p => p.groups.includes(groupFilter));
  }

  // Create lookup maps
  const weekALookup = new Map();
  playersWeekA.forEach((player, index) => {
    weekALookup.set(player.name, {
      position: index + 1,
      totalScore: player.totalScore
    });
  });

  // Build comparison data
  const comparisons = playersWeekB.map((player, index) => {
    const currentPosition = index + 1;
    const currentScore = player.totalScore;
    const previousData = weekALookup.get(player.name);

    if (!previousData) {
      return {
        name: player.name,
        currentPosition,
        currentScore,
        previousPosition: null,
        previousScore: null,
        positionChange: null,
        scoreChange: null
      };
    }

    return {
      name: player.name,
      currentPosition,
      currentScore,
      previousPosition: previousData.position,
      previousScore: previousData.totalScore,
      positionChange: previousData.position - currentPosition, // Positive = moved up
      scoreChange: currentScore - previousData.totalScore // Negative = improved (lower score is better)
    };
  });

  return comparisons;
}

/**
 * Get the biggest movers (by position change)
 * @param {Array} comparisons - Array of comparison objects
 * @param {number} limit - Number of results to return
 * @returns {Array} Top movers sorted by absolute position change
 */
export function getBiggestMovers(comparisons, limit = 3) {
  return comparisons
    .filter(p => p.positionChange !== null)
    .sort((a, b) => Math.abs(b.positionChange) - Math.abs(a.positionChange))
    .slice(0, limit);
}

/**
 * Get the biggest improvers (most negative score change)
 * @param {Array} comparisons - Array of comparison objects
 * @param {number} limit - Number of results to return
 * @returns {Array} Top improvers sorted by score improvement
 */
export function getBiggestImprovers(comparisons, limit = 3) {
  return comparisons
    .filter(p => p.scoreChange !== null && p.scoreChange < 0)
    .sort((a, b) => a.scoreChange - b.scoreChange)
    .slice(0, limit);
}

/**
 * Get the biggest decliners (most positive score change)
 * @param {Array} comparisons - Array of comparison objects
 * @param {number} limit - Number of results to return
 * @returns {Array} Top decliners sorted by score decline
 */
export function getBiggestDecliners(comparisons, limit = 3) {
  return comparisons
    .filter(p => p.scoreChange !== null && p.scoreChange > 0)
    .sort((a, b) => b.scoreChange - a.scoreChange)
    .slice(0, limit);
}
