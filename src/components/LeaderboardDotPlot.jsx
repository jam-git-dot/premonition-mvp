// src/components/LeaderboardDotPlot.jsx
import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';

// Responsive layout constants - values scale for better legibility
const LAYOUT = {
  PADDING: 16,
  LINE_X: 45,
  DOT_AREA_WIDTH: 60,
  LABEL_AREA_WIDTH: 35,
  NAME_AREA_WIDTH: 120,
  VERTICAL_PADDING: 20,
  MIN_HEIGHT: 220,
};

function LeaderboardDotPlot({
  enhancedResults,
  prevScoreMap,
  prevPosMap,
  onNameClick
}) {
  const [hoveredCluster, setHoveredCluster] = useState(null);

  // Calculate compact height
  const PLOT_HEIGHT = Math.max(LAYOUT.MIN_HEIGHT, enhancedResults.length * 18);
  const CONTAINER_HEIGHT = PLOT_HEIGHT + (LAYOUT.PADDING * 2);
  const TOTAL_WIDTH = LAYOUT.DOT_AREA_WIDTH + LAYOUT.LABEL_AREA_WIDTH + LAYOUT.NAME_AREA_WIDTH;

  // Group players by score
  const scoreClusters = useMemo(() => {
    const clusters = {};
    enhancedResults.forEach((player, index) => {
      const score = player.totalScore;
      if (!clusters[score]) {
        clusters[score] = [];
      }
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

  const leaderScore = minScore;

  const getYPosition = (score) => {
    if (scoreRange === 0) return PLOT_HEIGHT / 2;
    const proportion = (score - minScore) / scoreRange;
    return LAYOUT.VERTICAL_PADDING + (proportion * (PLOT_HEIGHT - (LAYOUT.VERTICAL_PADDING * 2)));
  };

  const handleDotClick = (player) => {
    if (onNameClick) {
      onNameClick(player.name);
    }
  };

  return (
    <div className="flex justify-center w-full lg:w-auto">
      <Card
        className="relative border border-gray-700"
        style={{
          padding: `${LAYOUT.PADDING}px`,
          minHeight: `${CONTAINER_HEIGHT}px`,
          width: `${TOTAL_WIDTH + (LAYOUT.PADDING * 2)}px`,
          maxWidth: '95vw'
        }}
      >
        {/* Title */}
        <div className="text-sm text-gray-400 mb-3 text-center font-medium">Score Distribution</div>

        <div className="relative" style={{ height: `${PLOT_HEIGHT}px`, width: `${TOTAL_WIDTH}px` }}>
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
            const nonConsensusPlayers = players.filter(p => !p.isConsensus);
            const clusterSize = nonConsensusPlayers.length;

            if (clusterSize === 0) return null;

            const isFirstScore = scoreIndex === 0;
            const isLastScore = scoreIndex === sortedScores.length - 1;

            return (
              <div
                key={score}
                onMouseEnter={() => setHoveredCluster(score)}
                onMouseLeave={() => setHoveredCluster(null)}
                className="relative"
                style={{ zIndex: hoveredCluster === score ? 100 : 'auto' }}
              >
                {/* Delta label - positioned to the left of the line */}
                <div
                  className="absolute text-xs text-gray-400 font-mono"
                  style={{
                    left: `${LAYOUT.LINE_X - 28}px`,
                    top: `${yPos}px`,
                    transform: 'translateY(-50%)'
                  }}
                >
                  +{deltaFromFirst}
                </div>

                {/* Player dots */}
                <div
                  className="absolute flex items-center gap-1"
                  style={{
                    left: `${LAYOUT.LINE_X + 6}px`,
                    top: `${yPos}px`,
                    transform: 'translateY(-50%)'
                  }}
                >
                  {nonConsensusPlayers.map((player, idx) => {
                    const isLeader = player.totalScore === leaderScore;

                    return (
                      <div
                        key={`${player.name}-${idx}`}
                        onClick={() => handleDotClick(player)}
                        className={`w-3 h-3 rounded-full transition-all cursor-pointer hover:scale-150 ${
                          isLeader
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        } ${hoveredCluster === score ? 'scale-125 ring-2 ring-white' : ''}`}
                        title={player.name}
                      />
                    );
                  })}
                </div>

                {/* Names - show for first and last only */}
                {(isFirstScore || isLastScore) && (
                  <div
                    className="absolute text-xs text-gray-200 whitespace-nowrap truncate font-medium"
                    style={{
                      left: `${LAYOUT.LINE_X + LAYOUT.DOT_AREA_WIDTH}px`,
                      top: `${yPos}px`,
                      transform: 'translateY(-50%)',
                      maxWidth: `${LAYOUT.NAME_AREA_WIDTH}px`
                    }}
                  >
                    {nonConsensusPlayers.map(p =>
                      p.position === 1 ? `👑 ${p.name}` : p.name
                    ).join(', ')}
                  </div>
                )}

                {/* Hover tooltip */}
                {hoveredCluster === score && (
                  <div
                    className="absolute bg-gray-900 border border-gray-500 rounded-lg px-3 py-2 text-sm whitespace-nowrap shadow-xl z-50"
                    style={{
                      left: `${LAYOUT.LINE_X + LAYOUT.DOT_AREA_WIDTH + 8}px`,
                      top: `${yPos + 18}px`,
                    }}
                  >
                    <div className="text-white font-bold mb-1.5">
                      Score: {score} (+{deltaFromFirst}) • {clusterSize} {clusterSize === 1 ? 'player' : 'players'}
                    </div>
                    {nonConsensusPlayers.slice(0, 5).map((player) => {
                      const prevScore = prevScoreMap[player.name];
                      const prevPos = prevPosMap[player.name];
                      const posChange = prevPos ? prevPos - player.position : null;

                      return (
                        <div key={player.name} className="text-gray-300 text-xs py-0.5">
                          {player.position === 1 && '👑 '}
                          {player.name}
                          {posChange !== null && posChange !== 0 && (
                            <span className={`ml-1.5 ${posChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {posChange > 0 ? `↑${posChange}` : `↓${Math.abs(posChange)}`}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {nonConsensusPlayers.length > 5 && (
                      <div className="text-gray-500 text-xs pt-1">+{nonConsensusPlayers.length - 5} more</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Tick marks from vertical line */}
          {sortedScores.map((score) => {
            const players = scoreClusters[score];
            const yPos = getYPosition(score);
            const nonConsensusPlayers = players.filter(p => !p.isConsensus);

            if (nonConsensusPlayers.length === 0) return null;

            return (
              <div
                key={`tick-${score}`}
                className="absolute h-px bg-gray-500"
                style={{
                  left: `${LAYOUT.LINE_X - 3}px`,
                  top: `${yPos}px`,
                  width: '6px'
                }}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default LeaderboardDotPlot;
