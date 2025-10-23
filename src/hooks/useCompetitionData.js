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

export function useCompetitionData(selectedGroup, selectedMatchweek) {
  // Memoize expensive calculations
  const groupData = useMemo(() =>
    getGroupData(selectedGroup, currentStandings),
    [selectedGroup]
  );

  const competitionResults = useMemo(() =>
    calculateCompetitionScoresForWeek(selectedMatchweek, selectedGroup),
    [selectedMatchweek, selectedGroup]
  );

  const prevCompetitionResults = useMemo(() =>
    selectedMatchweek > 1
      ? calculateCompetitionScoresForWeek(selectedMatchweek - 1, selectedGroup)
      : [],
    [selectedMatchweek, selectedGroup]
  );

  const teamsInOrder = useMemo(() => getTeamsInTableOrder(), []);

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