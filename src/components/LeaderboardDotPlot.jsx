// src/components/LeaderboardDotPlot.jsx
import { useState, useMemo } from 'react';
import { THEME, LEADERBOARD_CONTAINER_HEIGHT } from '../lib/theme';

// Layout constants - single source of truth
const LAYOUT = {
  PADDING: 16,              // Padding inside dark background
  LINE_X: 60,               // X position of vertical line
  DOT_AREA_WIDTH: 60,       // Width for dots (left of line)
  LABEL_AREA_WIDTH: 40,     // Width for +N labels (right of line)
  NAME_AREA_WIDTH: 140,     // Width for player names (reduced - only show 1st and last)
  VERTICAL_PADDING: 20,     // Top and bottom padding for dots
};

function LeaderboardDotPlot({
  enhancedResults,
  prevScoreMap,
  prevPosMap,
  onNameClick
}) {
  const [hoveredCluster, setHoveredCluster] = useState(null);

  // Use theme constant for container height
  const CONTAINER_HEIGHT = LEADERBOARD_CONTAINER_HEIGHT;
  const PLOT_HEIGHT = CONTAINER_HEIGHT - (LAYOUT.PADDING * 2);

  // Calculate total width
  const TOTAL_WIDTH = LAYOUT.DOT_AREA_WIDTH + LAYOUT.LABEL_AREA_WIDTH + LAYOUT.NAME_AREA_WIDTH;

  // Group players by score to detect clusters
  const scoreClusters = useMemo(() => {
    const clusters = {};
    enhancedResults.forEach((player, index) => {
      const score = player.totalScore;
      if (!clusters[score]) {
        clusters[score] = [];
      }
      // Store the actual position from the array (1-indexed)
      clusters[score].push({ ...player, position: index + 1 });
    });
    return clusters;
  }, [enhancedResults]);

  // Get sorted unique scores
  const sortedScores = useMemo(() =>
    Object.keys(scoreClusters).map(Number).sort((a, b) => a - b),
    [scoreClusters]
  );

  const minScore = sortedScores[0];
  const maxScore = sortedScores[sortedScores.length - 1];
  const scoreRange = maxScore - minScore;

  // Find the minimum score (best score) to identify all leaders
  const leaderScore = minScore;

  // Calculate Y position for each score in pixels
  const getYPosition = (score) => {
    if (scoreRange === 0) return PLOT_HEIGHT / 2;
    const proportion = (score - minScore) / scoreRange;
    // Add vertical padding top and bottom
    return LAYOUT.VERTICAL_PADDING + (proportion * (PLOT_HEIGHT - (LAYOUT.VERTICAL_PADDING * 2)));
  };

  const handleDotClick = (player) => {
    if (!player.isConsensus && onNameClick) {
      onNameClick(player.name);
    }
  };

  return (
    <div className="flex gap-0 relative">
      {/* Dark background plot area - contains dots, labels, and names */}
      <div
        className={`${THEME.colors.darkBlue} rounded-lg shadow-lg relative z-0`}
        style={{
          padding: `${LAYOUT.PADDING}px`,
          height: `${CONTAINER_HEIGHT}px`,
          width: `${TOTAL_WIDTH + (LAYOUT.PADDING * 2)}px`
        }}
      >
        <div className="relative z-0" style={{ height: `${PLOT_HEIGHT}px`, width: `${TOTAL_WIDTH}px` }}>
          {/* Vertical scale line */}
          <div
            className="absolute w-px bg-gray-600"
            style={{
              left: `${LAYOUT.LINE_X}px`,
              top: `${LAYOUT.VERTICAL_PADDING}px`,
              height: `${PLOT_HEIGHT - (LAYOUT.VERTICAL_PADDING * 2)}px`
            }}
          />

          {/* Score clusters */}
          {sortedScores.map((score, scoreIndex) => {
            const players = scoreClusters[score];
            const yPos = getYPosition(score);
            const deltaFromFirst = score - minScore;
            const hasConsensus = players.some(p => p.isConsensus);
            const nonConsensusPlayers = players.filter(p => !p.isConsensus);
            const clusterSize = players.length;

            return (
              <div
                key={score}
                onMouseEnter={() => setHoveredCluster(score)}
                onMouseLeave={() => setHoveredCluster(null)}
                className="relative"
                style={{ zIndex: hoveredCluster === score ? 10000 : 'auto' }}
              >
                {/* Delta label on RIGHT of line - show for ALL scores */}
                <div
                  className="absolute text-xs text-gray-400 font-mono"
                  style={{
                    left: `${LAYOUT.LINE_X + 8}px`,
                    top: `${yPos}px`,
                    transform: 'translateY(-50%)'
                  }}
                >
                  +{deltaFromFirst}
                </div>

                {/* Group Consensus - horizontal line */}
                {hasConsensus && nonConsensusPlayers.length === 0 ? (
                  <div
                    className="absolute"
                    style={{
                      left: `${LAYOUT.LINE_X - 6}px`,
                      top: `${yPos}px`,
                      transform: 'translateY(-50%)'
                    }}
                  >
                    <div className="w-3 h-px bg-gray-500" title="🤖 Group Consensus" />
                  </div>
                ) : (
                  /* Regular player dots - RIGHTMOST DOT IS ON THE LINE at LINE_X */
                  <div
                    className="absolute flex items-center gap-1"
                    style={{
                      left: `${LAYOUT.LINE_X - (nonConsensusPlayers.length * 12) + 2}px`, // 10px dot + 2px gap, rightmost at LINE_X
                      top: `${yPos}px`,
                      transform: 'translateY(-50%)'
                    }}
                  >
                    {nonConsensusPlayers.map((player, idx) => {
                      // Check if this player has the LEADER SCORE (not just position 1)
                      const isLeader = player.totalScore === leaderScore;

                      return (
                        <div
                          key={`${player.name}-${idx}`}
                          onClick={() => handleDotClick(player)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            isLeader
                              ? 'bg-yellow-500 cursor-pointer hover:scale-125'
                              : 'bg-blue-500 cursor-pointer hover:scale-125'
                          } ${hoveredCluster === score ? 'scale-125 ring-1 ring-white' : ''}`}
                          title={player.name}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Hover tooltip */}
                {hoveredCluster === score && (
                  <div
                    className="fixed bg-gray-800 border border-gray-600 rounded px-3 py-2 text-xs whitespace-nowrap shadow-2xl"
                    style={{
                      left: '400px',
                      top: `${yPos + LAYOUT.PADDING + 100}px`,
                      zIndex: 10000
                    }}
                  >
                    <div className="text-white font-bold mb-2">
                      Score: {score} (+{deltaFromFirst}) • {clusterSize} {clusterSize === 1 ? 'player' : 'players'}
                    </div>
                    {players.map((player) => {
                      const prevScore = prevScoreMap[player.name];
                      const prevPos = prevPosMap[player.name];
                      const posChange = prevPos ? prevPos - player.position : null;

                      return (
                        <div key={player.name} className="mb-2 pb-2 border-b border-gray-700 last:border-0">
                          <div className="text-white font-medium">
                            {player.isConsensus && '🤖 '}
                            {player.position === 1 && !player.isConsensus && '👑 '}
                            {player.name}
                          </div>
                          {!player.isConsensus && prevPos && (
                            <>
                              <div className="text-gray-400 text-xs">
                                Prev: {prevScore} pts (#{prevPos})
                              </div>
                              {posChange !== null && (
                                <div className={`font-bold text-xs ${posChange > 0 ? 'text-green-400' : posChange < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                  {posChange > 0 ? `↑${posChange}` : posChange < 0 ? `↓${Math.abs(posChange)}` : '–'}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Connecting lines - short tick marks from Y-axis */}
          {sortedScores.map((score) => {
            const players = scoreClusters[score];
            const yPos = getYPosition(score);
            const nonConsensusPlayers = players.filter(p => !p.isConsensus);
            const hasConsensus = players.some(p => p.isConsensus);

            // Skip if only consensus
            if (hasConsensus && nonConsensusPlayers.length === 0) {
              return null;
            }

            return (
              <div
                key={`line-${score}`}
                className="absolute h-px bg-gray-500"
                style={{
                  left: `${LAYOUT.LINE_X}px`,
                  top: `${yPos}px`,
                  width: `${LAYOUT.LABEL_AREA_WIDTH - 10}px`
                }}
              />
            );
          })}

          {/* Names area - only show first and last place */}
          {sortedScores.map((score, scoreIndex) => {
            const players = scoreClusters[score];
            const yPos = getYPosition(score);
            const nonConsensusPlayers = players.filter(p => !p.isConsensus);
            const hasConsensus = players.some(p => p.isConsensus);

            // Skip if only consensus
            if (hasConsensus && nonConsensusPlayers.length === 0) {
              return null;
            }

            // Only show names for first score (leader) and last score
            const isFirstScore = scoreIndex === 0;
            const isLastScore = scoreIndex === sortedScores.length - 1;

            if (!isFirstScore && !isLastScore) {
              return null; // Names shown on hover instead
            }

            const namesList = nonConsensusPlayers.map(p => {
              if (p.position === 1) return `👑 ${p.name}`;
              return p.name;
            }).join(', ');

            return (
              <div
                key={`name-${score}`}
                className="absolute"
                style={{
                  left: `${LAYOUT.LINE_X + LAYOUT.LABEL_AREA_WIDTH}px`,
                  top: `${yPos}px`,
                  transform: 'translateY(-50%)',
                  lineHeight: '1'
                }}
              >
                <div className="text-xs text-gray-300 whitespace-nowrap pl-2" style={{ lineHeight: '1' }}>
                  {namesList}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LeaderboardDotPlot;
