// src/hooks/useCompetitionData.js
import { useMemo } from 'react';
import {
  calculateCompetitionScoresForWeek,
  getTeamsInTableOrder,
  currentStandings,
  latestMatchweek,
  availableMatchweeks,
  realPredictions
} from '../data/competitionData';
import { getGroupData } from '../data/groupDataProcessor';
import standingsByGameweek from '../data/standingsByGameweek.json';

export function useCompetitionData(selectedGroup, selectedMatchweek) {
  // Get standings for the selected matchweek
  const selectedWeekStandings = useMemo(() => {
    const standings = standingsByGameweek[selectedMatchweek] || currentStandings;
    // Ensure we have valid standings data
    if (!standings || typeof standings !== 'object') {
      console.error('Invalid standings data for matchweek', selectedMatchweek);
      return {};
    }
    return standings;
  }, [selectedMatchweek]);

  // Memoize expensive calculations
  const groupData = useMemo(() =>
    getGroupData(selectedGroup, selectedWeekStandings),
    [selectedGroup, selectedWeekStandings]
  );

  const competitionResults = useMemo(() =>
    calculateCompetitionScoresForWeek(selectedMatchweek, selectedGroup),
    [selectedMatchweek, selectedGroup]
  );

  const prevCompetitionResults = useMemo(() => {
    if (selectedMatchweek <= 1) return [];
    // Check if previous week data exists
    const prevWeek = selectedMatchweek - 1;
    if (!standingsByGameweek[prevWeek]) {
      console.warn(`No data available for week ${prevWeek}, skipping previous week comparison`);
      return [];
    }
    return calculateCompetitionScoresForWeek(prevWeek, selectedGroup);
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