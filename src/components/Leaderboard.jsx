// src/components/Leaderboard.jsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item';
import { availableGroups } from '../data/competitionData';
import { useLeaderboardSections } from '../hooks/useLeaderboardSections';

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
  const groupLabel = availableGroups.find(g => g.id === selectedGroup)?.name || selectedGroup;
  const { topGroups, lastGroup } = useLeaderboardSections(enhancedResults);

  // Helper to get styling for a position group
  const getGroupStyling = (group) => {
    if (group.isFirst) {
      return { borderColor: 'border-green-300 border-opacity-50', scoreBgColor: 'bg-green-300', emoji: '🥇', positionText: '1st' };
    } else if (group.isSecond) {
      return { borderColor: 'border-gray-400 border-opacity-50', scoreBgColor: 'bg-gray-400', emoji: '🥈', positionText: '2nd' };
    } else if (group.isThird) {
      return { borderColor: 'border-amber-400 border-opacity-50', scoreBgColor: 'bg-amber-400', emoji: '🥉', positionText: '3rd' };
    }
    return { borderColor: '', scoreBgColor: '', emoji: '', positionText: '' };
  };

  // Helper to render a person row
  const renderPersonRow = (person, personIndex, peopleCount, positionText, emoji, scoreBgColor, score) => {
    const displayIndex = peopleCount % 2 === 0 ? 0 : Math.floor(peopleCount / 2);
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
          {showPositionAndScore ? score : ''}
        </div>
      </div>
    );
  };

  return (
    <div className="flex justify-center w-full">
      <Card className="p-3 w-full max-w-[95vw] sm:max-w-[450px] border border-gray-700">
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
                variant="item"
                size="sm"
                onClick={onShowComparison}
                title={`See changes from MW${prevMatchweek}`}
              >
                <span className="text-sm">Δ</span>
                <span className="text-xs ml-1 hidden sm:inline">MW{prevMatchweek}</span>
              </Button>
            )}

            {/* Beeswarm toggle button */}
            <Button
              variant="item"
              size="sm"
              onClick={onShowBeeswarm}
              className={showBeeswarm ? 'bg-blue-600 border-blue-500' : ''}
              title="Toggle score distribution"
            >
              <span className="text-xs">···</span>
            </Button>
          </div>
        </div>

        {/* Leaderboard content */}
        <div className="space-y-2">
          {/* Winners section */}
          {topGroups.length > 0 && (
            <>
              <div className="text-center mb-1">
                <div className="text-green-400 font-semibold text-sm">WINNERS</div>
              </div>
              {topGroups.map((group, groupIndex) => {
                const { borderColor, scoreBgColor, emoji, positionText } = getGroupStyling(group);
                return (
                  <div key={`winners-${groupIndex}`} className={`border-2 ${borderColor} rounded-lg p-2 space-y-1 bg-gray-800`}>
                    {group.people.map((person, personIndex) =>
                      renderPersonRow(person, personIndex, group.people.length, positionText, emoji, scoreBgColor, group.score)
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Wankers section */}
          {lastGroup && (
            <>
              <div className="text-center mb-1 mt-3">
                <div className="text-red-400 font-semibold text-sm">WANKERS</div>
              </div>
              <div className="border-2 border-red-400 border-opacity-50 rounded-lg p-2 space-y-1 bg-gray-800">
                {lastGroup.people.map((person, personIndex) =>
                  renderPersonRow(person, personIndex, lastGroup.people.length, 'Last', '💩', 'bg-red-400', lastGroup.score)
                )}
              </div>
            </>
          )}
        </div>

        {/* Full Table Item */}
        <Item variant="muted" className="mt-4">
          <ItemContent>
            <ItemTitle>Full Table</ItemTitle>
            <ItemDescription>View detailed standings with all team scores</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="item" onClick={onShowFullTable}>
              View
            </Button>
          </ItemActions>
        </Item>
      </Card>
    </div>
  );
});

export default Leaderboard;
