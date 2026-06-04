// Score-integrity golden-record test.
//
// PURPOSE: lock in the EXACT player totals that the live leaderboard currently
// shows (from the shipped scoresByGameweek.json), so that any later revamp change
// which accidentally alters a score — refactors, data-loading changes, the
// Supabase migration — fails loudly instead of silently corrupting the season's
// results.
//
// If a score legitimately changes (e.g. backfilling GW30–38), regenerate the
// snapshot intentionally with:  npm run test:run -- -u
import { describe, it, expect } from 'vitest';
import scoresByGameweek from './scoresByGameweek.json';
import standingsByGameweek from './standingsByGameweek.json';
import { calculateCompetitionScoresForWeek } from './competitionData.js';

const gameweeks = Object.keys(scoresByGameweek)
  .filter((k) => /^\d+$/.test(k))
  .map(Number)
  .sort((a, b) => a - b);

// A stable, human-readable shape: per gameweek, every player's name -> total.
const goldenRecord = Object.fromEntries(
  gameweeks.map((gw) => [
    `GW${gw}`,
    Object.fromEntries(
      [...scoresByGameweek[gw]]
        .map((p) => [p.name, p.totalScore])
        .sort(([a], [b]) => a.localeCompare(b))
    ),
  ])
);

describe('score integrity (golden record)', () => {
  it('shipped player totals are unchanged for every gameweek', () => {
    expect(goldenRecord).toMatchSnapshot();
  });

  it('shipped scores match an independent recalculation from standings + predictions', () => {
    // The frontend reads pre-computed scores; this independently recomputes them
    // from the raw inputs and confirms they agree — catches drift in either source.
    for (const gw of gameweeks) {
      if (!standingsByGameweek[gw]) continue;
      const recomputed = calculateCompetitionScoresForWeek(gw, 'all');
      const recomputedTotals = Object.fromEntries(
        recomputed.map((p) => [p.name, p.totalScore])
      );
      for (const player of scoresByGameweek[gw]) {
        expect(
          recomputedTotals[player.name],
          `GW${gw} • ${player.name}`
        ).toBe(player.totalScore);
      }
    }
  });
});
