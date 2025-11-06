// src/components/LeaderboardDotPlot.jsx
import { useState, useMemo } from 'react';
import { THEME, LEADERBOARD_CONTAINER_HEIGHT } from '../lib/theme';

function LeaderboardDotPlot({
  enhancedResults,
  prevScoreMap,
  prevPosMap,
  onNameClick
}) {
  const [hoveredCluster, setHoveredCluster] = useState(null);

  const PADDING = 16; // Padding inside dark background
  const CONTAINER_HEIGHT = 312; // Match the leaderboard's minHeight
  // Calculate plot height: total container height minus padding (16*2)
  const PLOT_HEIGHT = CONTAINER_HEIGHT - (PADDING * 2);
  const LINE_X = 60; // X position of vertical line
  const PLOT_WIDTH = 120; // Width of plot area

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
    // Add 20px padding top and bottom
    return 20 + (proportion * (PLOT_HEIGHT - 40));
  };

  const handleDotClick = (player) => {
    if (!player.isConsensus && onNameClick) {
      onNameClick(player.name);
    }
  };

  return (
    <div className="flex gap-0 relative">
      {/* Dark background plot area */}
      <div className={`${THEME.colors.darkBlue} rounded-lg shadow-lg relative z-0`} style={{ padding: `${PADDING}px`, height: `${CONTAINER_HEIGHT}px` }}>
        <div className="relative z-0" style={{ height: `${PLOT_HEIGHT}px`, width: `${PLOT_WIDTH}px` }}>
          {/* Vertical scale line */}
          <div
            className="absolute w-px bg-gray-600"
            style={{
              left: `${LINE_X}px`,
              top: '20px',
              height: `${PLOT_HEIGHT - 40}px`
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
              >
                {/* Delta label on RIGHT of line - show for ALL scores */}
                <div
                  className="absolute text-xs text-gray-400 font-mono"
                  style={{
                    left: `${LINE_X + 8}px`,
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
                      left: `${LINE_X - 6}px`,
                      top: `${yPos}px`,
                      transform: 'translateY(-50%)'
                    }}
                  >
                    <div className="w-3 h-px bg-gray-500" title="🤖 Group Consensus" />
                  </div>
                ) : (
                  /* Regular player dots - RIGHTMOST DOT MUST BE ON LINE, dots extend LEFT */
                  <div
                    className="absolute flex items-center gap-1"
                    style={{
                      right: `${PLOT_WIDTH - LINE_X}px`,
                      top: `${yPos}px`,
                      transform: 'translateY(-50%)',
                      flexDirection: 'row-reverse'
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
                    className="absolute bg-gray-800 border border-gray-600 rounded px-3 py-2 text-xs whitespace-nowrap z-50"
                    style={{
                      left: '8px',
                      top: `${yPos + 12}px`
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
        </div>
      </div>

      {/* Connecting lines layer - ABOVE dark background with high z-index */}
      <div className="absolute z-20" style={{
        left: `${PLOT_WIDTH + PADDING * 2}px`,
        top: `${PADDING}px`,
        height: `${PLOT_HEIGHT}px`,
        width: '20px'
      }}>
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
              className="absolute left-0 w-full h-px bg-gray-600"
              style={{
                top: `${yPos}px`
              }}
            />
          );
        })}
      </div>

      {/* Names area (outside dark background) - ALIGNED WITH LINES */}
      <div className="relative z-10" style={{ height: `${CONTAINER_HEIGHT}px`, width: '220px', paddingTop: `${PADDING}px`, paddingBottom: `${PADDING}px`, paddingLeft: '20px' }}>
        {sortedScores.map((score) => {
          const players = scoreClusters[score];
          const yPos = getYPosition(score);
          const nonConsensusPlayers = players.filter(p => !p.isConsensus);
          const hasConsensus = players.some(p => p.isConsensus);

          // Skip if only consensus
          if (hasConsensus && nonConsensusPlayers.length === 0) {
            return null;
          }

          const namesList = nonConsensusPlayers.map(p => {
            if (p.position === 1) return `👑 ${p.name}`;
            return p.name;
          }).join(', ');

          return (
            <div
              key={score}
              className="absolute flex items-center"
              style={{
                left: '20px',
                top: `${yPos}px`,
                height: '1px',
                lineHeight: '1px'
              }}
            >
              {/* Player names - VERTICALLY CENTERED ON THE LINE */}
              <div className="text-xs text-gray-300 whitespace-nowrap pl-1" style={{
                transform: 'translateY(-50%)'
              }}>
                {namesList}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LeaderboardDotPlot;
