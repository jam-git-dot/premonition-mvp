// src/hooks/useLeaderboardSections.js
import { useMemo } from 'react';

/**
 * Custom hook to process leaderboard results into display sections.
 * Handles grouping by score (for ties) and creates top 3 + last place sections.
 *
 * @param {Array} enhancedResults - Array of player results sorted by score
 * @returns {Object} { topGroups, lastGroup } for rendering
 */
export function useLeaderboardSections(enhancedResults) {
  return useMemo(() => {
    if (!enhancedResults || enhancedResults.length === 0) {
      return { topGroups: [], lastGroup: null };
    }

    // Group results by score to handle ties
    const scoreGroups = {};
    enhancedResults.forEach((result, index) => {
      if (index < 8) {
        const score = result.totalScore;
        if (!scoreGroups[score]) scoreGroups[score] = [];
        scoreGroups[score].push(result);
      }
    });

    const sortedScores = Object.keys(scoreGroups).map(Number).sort((a, b) => a - b);
    const topGroups = [];
    let currentPosition = 1;

    // Build top 3 positions with group styling
    for (const score of sortedScores) {
      if (currentPosition <= 3) {
        const positionGroup = scoreGroups[score];
        const isTied = positionGroup.length > 1;

        topGroups.push({
          position: currentPosition,
          people: positionGroup,
          score: score,
          isTied: isTied,
          isFirst: currentPosition === 1,
          isSecond: currentPosition === 2,
          isThird: currentPosition === 3
        });

        currentPosition += positionGroup.length;
      }
    }

    // Build last place group
    const lastResult = enhancedResults[enhancedResults.length - 1];
    const lastScore = lastResult.totalScore;
    const lastPlacePeople = enhancedResults.filter(r => r.totalScore === lastScore);
    const lastIsTied = lastPlacePeople.length > 1;

    const lastGroup = {
      position: 'last',
      people: lastPlacePeople,
      score: lastScore,
      isTied: lastIsTied,
      isLast: true
    };

    return { topGroups, lastGroup };
  }, [enhancedResults]);
}
