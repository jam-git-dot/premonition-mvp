// src/components/Leaderboard.jsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Leaderboard = React.memo(function Leaderboard({
  enhancedResults,
  selectedGroup,
  currentMatchweek,
  onShowFullTable,
  onShowBeeswarm,
  showBeeswarm,
  onShowComparison,
  canShowComparison,
  prevMatchweek
}) {
  const groupLabel = selectedGroup === 'all'
    ? 'All Entries'
    : selectedGroup === 'LIV'
      ? 'Klopptoberfest'
      : 'Fantrax FPL';

  return (
    <div className="flex justify-center w-full">
      <Card className="p-3 w-full max-w-[95vw] sm:max-w-[450px]">
        {/* Header with title left, buttons right */}
        <div className="flex justify-between items-start mb-3">
          {/* Left side - Title and subtitle */}
          <div>
            <h3 className="text-lg font-bold text-white">
              LEADERBOARD
            </h3>
            <div className="text-xs text-gray-400">
              {groupLabel} • MW{currentMatchweek}
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex gap-1">
            {/* Delta button - See What Changed */}
            {canShowComparison && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onShowComparison}
                className="text-gray-400 hover:text-white hover:bg-gray-700 h-7 px-2"
                title={`See changes from MW${prevMatchweek}`}
              >
                <span className="text-sm">Δ</span>
                <span className="text-xs ml-1 hidden sm:inline">MW{prevMatchweek}</span>
              </Button>
            )}

            {/* Beeswarm toggle button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowBeeswarm}
              className={`h-7 px-2 ${showBeeswarm ? 'text-blue-400 bg-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              title="Toggle score distribution"
            >
              <span className="text-xs">···</span>
            </Button>

            {/* Full Table button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowFullTable}
              className="text-gray-400 hover:text-white hover:bg-gray-700 h-7 px-2"
              title="View full standings table"
            >
              <span className="text-xs">FULL</span>
            </Button>
          </div>
        </div>

        {/* Leaderboard content */}
        <div className="space-y-2">
          {(() => {
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
                  positionText = '1st';
                } else if (group.isSecond) {
                  borderColor = 'border-gray-400 border-opacity-50';
                  scoreBgColor = 'bg-gray-400';
                  emoji = '🥈';
                  positionText = '2nd';
                } else if (group.isThird) {
                  borderColor = 'border-amber-400 border-opacity-50';
                  scoreBgColor = 'bg-amber-400';
                  emoji = '🥉';
                  positionText = '3rd';
                }

                allSections.push(
                  <div key={`winners-${groupIndex}`} className={`border-2 ${borderColor} rounded-lg p-2 space-y-1 bg-gray-800`}>
                    {group.people.map((person, personIndex) => {
                      const displayIndex = group.people.length % 2 === 0 ? 0 : Math.floor(group.people.length / 2);
                      const showPositionAndScore = personIndex === displayIndex;
                      return (
                        <div key={personIndex} className="flex items-center h-8">
                          <div className="px-2 py-1 rounded font-medium text-white text-sm w-[80px] flex items-center justify-center">
                            {showPositionAndScore ? `${positionText} ${emoji}` : ''}
                          </div>
                          <div className="px-2 py-1 rounded font-medium text-white text-sm flex-1 mx-1 flex items-center justify-center truncate">
                            {person.name}
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
            const positionText = 'Last';

            allSections.push(
              <div key="wankers" className={`border-2 ${borderColor} rounded-lg p-2 space-y-1 bg-gray-800`}>
                {lastGroup.people.map((person, personIndex) => {
                  const displayIndex = lastGroup.people.length % 2 === 0 ? 0 : Math.floor(lastGroup.people.length / 2);
                  const showPositionAndScore = personIndex === displayIndex;

                  return (
                    <div key={personIndex} className="flex items-center h-8">
                      <div className="px-2 py-1 rounded font-medium text-white text-sm w-[80px] flex items-center justify-center">
                        {showPositionAndScore ? `${positionText} ${emoji}` : ''}
                      </div>
                      <div className="px-2 py-1 rounded font-medium text-white text-sm flex-1 mx-1 flex items-center justify-center truncate">
                        {person.name}
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
      </Card>
    </div>
  );
});

export default Leaderboard;
