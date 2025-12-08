// src/components/Leaderboard.jsx
import React from 'react';
import { THEME, LEADERBOARD_CONTAINER_HEIGHT } from '../lib/theme';

const Leaderboard = React.memo(function Leaderboard({
  enhancedResults,
  selectedGroup,
  currentMatchweek
}) {
  return (
    <div className="flex justify-center mb-4">
      <div
        className="bg-gray-900 rounded-lg shadow-lg p-3 w-full max-w-[95vw] sm:max-w-[450px]"
        style={{ height: `${LEADERBOARD_CONTAINER_HEIGHT}px` }}
      >
        {/* Compact Title */}
        <div className="text-center mb-2">
          <h3 className="text-base font-bold text-white mb-0.5">
            🏆 LEADERBOARD
          </h3>
          <div className="text-xs text-gray-400">
            {selectedGroup === 'all' ? 'All Entries' : selectedGroup === 'LIV' ? 'Klopptoberfest' : 'Fantrax FPL'} • MW{currentMatchweek}
          </div>
        </div>

        {/* Compact Table with grouped styling */}
        <div className="space-y-2">
          {(() => {
            // Group results by score to handle ties
            const scoreGroups = {};
            enhancedResults.forEach((result, index) => {
              if (index < 8) { // Only consider top 8 for potential top 4 spots
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

            const allSections = [];

            // Add Winners section
            if (topGroups.length > 0) {
              allSections.push(
                <div key="winners-header" className="text-center mb-1">
                  <div className="text-green-400 font-semibold text-sm">WINNERS</div>
                </div>
              );

              topGroups.forEach((group, groupIndex) => {
                let borderColor = '';
                let scoreBgColor = '';
                let emoji = '';
                let positionText = '';

                if (group.isFirst) {
                  borderColor = 'border-green-300 border-opacity-50';
                  scoreBgColor = 'bg-green-300';
                  emoji = '🥇';
                  positionText = group.isTied ? '1st' : '1st';
                } else if (group.isSecond) {
                  borderColor = 'border-gray-400 border-opacity-50';
                  scoreBgColor = 'bg-gray-400';
                  emoji = '🥈';
                  positionText = group.isTied ? '2nd' : '2nd';
                } else if (group.isThird) {
                  borderColor = 'border-amber-400 border-opacity-50';
                  scoreBgColor = 'bg-amber-400';
                  emoji = '🥉';
                  positionText = group.isTied ? '3rd' : '3rd';
                }

                allSections.push(
                  <div key={`winners-${groupIndex}`} className={`border-2 ${borderColor} rounded-lg p-2 space-y-1 bg-gray-800`}>
                    {group.people.map((person, personIndex) => {
                      // Determine when to show score cell
                      const displayIndex = group.people.length % 2 === 0 ? 0 : Math.floor(group.people.length / 2);
                      const showPositionAndScore = personIndex === displayIndex;
                      return (
                        <div key={personIndex} className="flex items-center h-8">
                          <div className="px-2 py-1 rounded font-medium text-white text-sm w-[80px] flex items-center justify-center">
                            {showPositionAndScore ? `${positionText} ${emoji}` : ''}
                          </div>
                          <div className="px-2 py-1 rounded font-medium text-white text-sm flex-1 mx-1 flex items-center justify-center truncate">
                            {person.isConsensus ? `${person.name} 🤖` : person.name}
                          </div>
                          <div className={`px-2 py-1 rounded font-medium ${showPositionAndScore ? `text-black ${scoreBgColor}` : 'text-transparent'} text-sm w-[60px] flex items-center justify-center`}>
                            {showPositionAndScore ? group.score : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              });
            }

            // Add Wankers section
            allSections.push(
              <div key="wankers-header" className="text-center mb-1 mt-3">
                <div className="text-red-400 font-semibold text-sm">WANKERS</div>
              </div>
            );

            const borderColor = 'border-red-400 border-opacity-50';
            const scoreBgColor = 'bg-red-400';
            const emoji = '💩';
            const positionText = lastGroup.isTied ? 'Last' : 'Last';

            allSections.push(
              <div key="wankers" className={`border-2 ${borderColor} rounded-lg p-2 space-y-1 bg-gray-800`}>
                {lastGroup.people.map((person, personIndex) => {
                  // Determine which row should show position and score
                  const displayIndex = lastGroup.people.length % 2 === 0 ? 0 : Math.floor(lastGroup.people.length / 2);
                  const showPositionAndScore = personIndex === displayIndex;

                  return (
                    <div key={personIndex} className="flex items-center h-8">
                      <div className="px-2 py-1 rounded font-medium text-white text-sm w-[80px] flex items-center justify-center">
                        {showPositionAndScore ? `${positionText} ${emoji}` : ''}
                      </div>
                      <div className="px-2 py-1 rounded font-medium text-white text-sm flex-1 mx-1 flex items-center justify-center truncate">
                        {person.isConsensus ? `${person.name} 🤖` : person.name}
                      </div>
                      <div className={`px-2 py-1 rounded font-medium ${showPositionAndScore ? `text-black ${scoreBgColor}` : 'text-transparent'} text-sm w-[60px] flex items-center justify-center`}>
                        {showPositionAndScore ? lastGroup.score : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            );

            return allSections;
          })()}
        </div>
      </div>
    </div>
  );
});

export default Leaderboard;