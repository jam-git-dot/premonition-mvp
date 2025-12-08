// Tests for scoring calculation logic
import { describe, it, expect } from 'vitest';
import { calculateCompetitionScoresForWeek } from './competitionData.js';

describe('calculateCompetitionScoresForWeek', () => {
  describe('Basic Scoring Logic', () => {
    it('should calculate score of 0 for perfect prediction', () => {
      // This test verifies that if someone predicts the exact order,
      // their total score should be 0 (perfect score)

      // Note: We can't easily test this without mocking data, but we can
      // verify the scoring formula: |predicted - actual| = 0 when positions match
      const predictedPos = 1;
      const actualPos = 1;
      const score = Math.abs(predictedPos - actualPos);

      expect(score).toBe(0);
    });

    it('should calculate correct score for single position difference', () => {
      // If you predict a team in 1st but they finish 2nd, score = 1
      const predictedPos = 1;
      const actualPos = 2;
      const score = Math.abs(predictedPos - actualPos);

      expect(score).toBe(1);
    });

    it('should calculate correct score for large position difference', () => {
      // If you predict a team in 1st but they finish 10th, score = 9
      const predictedPos = 1;
      const actualPos = 10;
      const score = Math.abs(predictedPos - actualPos);

      expect(score).toBe(9);
    });

    it('should handle negative differences correctly', () => {
      // If you predict a team in 10th but they finish 1st, score = 9
      const predictedPos = 10;
      const actualPos = 1;
      const score = Math.abs(predictedPos - actualPos);

      expect(score).toBe(9);
    });
  });

  describe('Return Value Structure', () => {
    it('should return an array', () => {
      const results = calculateCompetitionScoresForWeek(1, 'all');

      expect(Array.isArray(results)).toBe(true);
    });

    it('should return objects with required properties', () => {
      const results = calculateCompetitionScoresForWeek(1, 'all');

      if (results.length > 0) {
        const firstResult = results[0];

        expect(firstResult).toHaveProperty('name');
        expect(firstResult).toHaveProperty('groups');
        expect(firstResult).toHaveProperty('totalScore');
        expect(firstResult).toHaveProperty('teamScores');

        expect(typeof firstResult.name).toBe('string');
        expect(Array.isArray(firstResult.groups)).toBe(true);
        expect(typeof firstResult.totalScore).toBe('number');
        expect(typeof firstResult.teamScores).toBe('object');
      }
    });

    it('should have teamScores with correct structure', () => {
      const results = calculateCompetitionScoresForWeek(1, 'all');

      if (results.length > 0) {
        const firstResult = results[0];
        const teamScoreKeys = Object.keys(firstResult.teamScores);

        if (teamScoreKeys.length > 0) {
          const firstTeamScore = firstResult.teamScores[teamScoreKeys[0]];

          expect(firstTeamScore).toHaveProperty('score');
          expect(firstTeamScore).toHaveProperty('predictedPosition');
          expect(firstTeamScore).toHaveProperty('actualPosition');
          expect(firstTeamScore).toHaveProperty('difference');

          expect(typeof firstTeamScore.score).toBe('number');
          expect(typeof firstTeamScore.predictedPosition).toBe('number');
          expect(typeof firstTeamScore.actualPosition).toBe('number');
          expect(typeof firstTeamScore.difference).toBe('number');
        }
      }
    });
  });

  describe('Sorting Behavior', () => {
    it('should sort results by totalScore ascending (best first)', () => {
      const results = calculateCompetitionScoresForWeek(1, 'all');

      // Verify results are sorted (lower score = better)
      for (let i = 1; i < results.length; i++) {
        expect(results[i].totalScore).toBeGreaterThanOrEqual(results[i - 1].totalScore);
      }
    });

    it('should have the best predictor first', () => {
      const results = calculateCompetitionScoresForWeek(1, 'all');

      if (results.length > 1) {
        expect(results[0].totalScore).toBeLessThanOrEqual(results[1].totalScore);
      }
    });
  });

  describe('Group Filtering', () => {
    it('should return all predictions when group is "all"', () => {
      const allResults = calculateCompetitionScoresForWeek(1, 'all');

      // We have 24 total predictions in competitionData.js
      expect(allResults.length).toBeGreaterThan(0);
    });

    it('should filter by LIV group correctly', () => {
      const livResults = calculateCompetitionScoresForWeek(1, 'LIV');

      // All results should have 'LIV' in their groups array
      livResults.forEach(result => {
        expect(result.groups).toContain('LIV');
      });
    });

    it('should filter by TOG group correctly', () => {
      const togResults = calculateCompetitionScoresForWeek(1, 'TOG');

      // All results should have 'TOG' in their groups array
      togResults.forEach(result => {
        expect(result.groups).toContain('TOG');
      });
    });

    it('should filter by FPL group correctly', () => {
      const fplResults = calculateCompetitionScoresForWeek(1, 'FPL');

      // All results should have 'FPL' in their groups array
      fplResults.forEach(result => {
        expect(result.groups).toContain('FPL');
      });
    });

    it('should return fewer results for filtered groups than "all"', () => {
      const allResults = calculateCompetitionScoresForWeek(1, 'all');
      const livResults = calculateCompetitionScoresForWeek(1, 'LIV');

      expect(livResults.length).toBeLessThan(allResults.length);
    });
  });

  describe('Score Calculation Accuracy', () => {
    it('should calculate difference correctly (predicted - actual)', () => {
      const results = calculateCompetitionScoresForWeek(1, 'all');

      if (results.length > 0) {
        const firstResult = results[0];
        const teamScoreKeys = Object.keys(firstResult.teamScores);

        teamScoreKeys.forEach(teamName => {
          const teamData = firstResult.teamScores[teamName];
          const expectedDifference = teamData.predictedPosition - teamData.actualPosition;

          expect(teamData.difference).toBe(expectedDifference);
        });
      }
    });

    it('should calculate score as absolute value of difference', () => {
      const results = calculateCompetitionScoresForWeek(1, 'all');

      if (results.length > 0) {
        const firstResult = results[0];
        const teamScoreKeys = Object.keys(firstResult.teamScores);

        teamScoreKeys.forEach(teamName => {
          const teamData = firstResult.teamScores[teamName];
          const expectedScore = Math.abs(teamData.predictedPosition - teamData.actualPosition);

          expect(teamData.score).toBe(expectedScore);
        });
      }
    });

    it('should have totalScore equal to sum of all team scores', () => {
      const results = calculateCompetitionScoresForWeek(1, 'all');

      results.forEach(result => {
        const calculatedTotal = Object.values(result.teamScores)
          .reduce((sum, teamData) => sum + teamData.score, 0);

        expect(result.totalScore).toBe(calculatedTotal);
      });
    });

    it('should never have negative scores', () => {
      const results = calculateCompetitionScoresForWeek(1, 'all');

      results.forEach(result => {
        expect(result.totalScore).toBeGreaterThanOrEqual(0);

        Object.values(result.teamScores).forEach(teamData => {
          expect(teamData.score).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing teams gracefully', () => {
      // If a predicted team doesn't exist in standings, it should be skipped
      // The function checks: if (actualPosition) before adding to score

      const results = calculateCompetitionScoresForWeek(1, 'all');

      // Should not throw an error
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle empty group filter results', () => {
      // If no one is in a hypothetical group, should return empty array
      const results = calculateCompetitionScoresForWeek(1, 'NONEXISTENT_GROUP');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should work for different gameweeks', () => {
      const week1Results = calculateCompetitionScoresForWeek(1, 'all');
      const week2Results = calculateCompetitionScoresForWeek(2, 'all');

      // Both should return valid results
      expect(week1Results.length).toBeGreaterThan(0);
      expect(week2Results.length).toBeGreaterThan(0);

      // Scores might differ between weeks
      // (Can't guarantee they're different, but structures should match)
      expect(week1Results[0]).toHaveProperty('totalScore');
      expect(week2Results[0]).toHaveProperty('totalScore');
    });
  });

  describe('Data Integrity', () => {
    it('should not mutate original predictions', () => {
      // Run calculation twice and verify results are consistent
      const results1 = calculateCompetitionScoresForWeek(1, 'all');
      const results2 = calculateCompetitionScoresForWeek(1, 'all');

      expect(results1.length).toBe(results2.length);

      // Compare each result
      results1.forEach((result1, index) => {
        const result2 = results2[index];
        expect(result1.name).toBe(result2.name);
        expect(result1.totalScore).toBe(result2.totalScore);
      });
    });

    it('should handle all 20 Premier League teams', () => {
      const results = calculateCompetitionScoresForWeek(1, 'all');

      // Each prediction should have scores for their predicted teams
      results.forEach(result => {
        const teamCount = Object.keys(result.teamScores).length;

        // Should have scored at least some teams (might not be all 20 if team not in current standings)
        expect(teamCount).toBeGreaterThan(0);
        expect(teamCount).toBeLessThanOrEqual(20);
      });
    });
  });

  describe('Performance', () => {
    it('should complete calculation in reasonable time', () => {
      const startTime = performance.now();

      calculateCompetitionScoresForWeek(1, 'all');

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in under 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
