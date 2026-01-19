// src/hooks/useCompetitionData.js
import { useMemo } from 'react';
import {
  getTeamsInTableOrder,
  currentStandings,
  latestMatchweek,
  availableMatchweeks,
  realPredictions
} from '../data/competitionData';
import { getGroupData } from '../data/groupDataProcessor';
import standingsByGameweek from '../data/standingsByGameweek.json';
import scoresByGameweek from '../data/scoresByGameweek.json';

export function useCompetitionData(selectedGroup, selectedMatchweek) {
  // Get standings for the selected matchweek
  const selectedWeekStandings = useMemo(() => {
    const standings = standingsByGameweek[selectedMatchweek] || currentStandings;
    // Ensure we have valid standings data
    if (!standings || typeof standings !== 'object') {
      return {};
    }
    return standings;
  }, [selectedMatchweek]);

  // Memoize expensive calculations
  const groupData = useMemo(() =>
    getGroupData(selectedGroup, selectedWeekStandings),
    [selectedGroup, selectedWeekStandings]
  );

  // Load scores from pre-calculated scoresByGameweek.json
  // SINGLE SOURCE OF TRUTH: Scores are calculated during automation, not on-the-fly
  const competitionResults = useMemo(() => {
    const weekScores = scoresByGameweek[selectedMatchweek];
    if (!weekScores || !Array.isArray(weekScores)) {
      return [];
    }

    // Filter by group if needed
    if (selectedGroup === 'all') {
      return weekScores;
    }
    return weekScores.filter(player =>
      player.groups && player.groups.includes(selectedGroup)
    );
  }, [selectedMatchweek, selectedGroup]);

  const prevCompetitionResults = useMemo(() => {
    if (selectedMatchweek <= 1) return [];

    const prevWeek = selectedMatchweek - 1;
    const prevWeekScores = scoresByGameweek[prevWeek];

    if (!prevWeekScores || !Array.isArray(prevWeekScores)) {
      return [];
    }

    // Filter by group if needed
    if (selectedGroup === 'all') {
      return prevWeekScores;
    }
    return prevWeekScores.filter(player =>
      player.groups && player.groups.includes(selectedGroup)
    );
  }, [selectedMatchweek, selectedGroup]);

  const teamsInOrder = useMemo(() =>
    Object.entries(selectedWeekStandings)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([pos, team]) => ({ position: parseInt(pos), name: team })),
    [selectedWeekStandings]
  );

  // Enhanced competition results with group consensus
  const enhancedResults = useMemo(() =>
    [...competitionResults, groupData.consensusScore]
      .sort((a, b) => a.totalScore - b.totalScore),
    [competitionResults, groupData.consensusScore]
  );

  // Build lookup maps for previous scores and positions
  const prevScoreMap = useMemo(() =>
    Object.fromEntries(prevCompetitionResults.map((r) => [r.name, r.totalScore])),
    [prevCompetitionResults]
  );

  const prevPosMap = useMemo(() =>
    Object.fromEntries(prevCompetitionResults.map((r, i) => [r.name, i + 1])),
    [prevCompetitionResults]
  );

  const currPosMap = useMemo(() =>
    Object.fromEntries(competitionResults.map((r, i) => [r.name, i + 1])),
    [competitionResults]
  );

  return {
    groupData,
    competitionResults,
    prevCompetitionResults,
    teamsInOrder,
    enhancedResults,
    prevScoreMap,
    prevPosMap,
    currPosMap,
    // Export constants for convenience
    latestMatchweek,
    availableMatchweeks,
    realPredictions
  };
}