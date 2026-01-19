// src/components/CompetitionDashboard.jsx
import { useState, useEffect } from 'react'
import { availableGroups, latestMatchweek, availableMatchweeks, realPredictions } from '../data/competitionData'
import { getCellStyle, getOrdinalSuffix } from '../lib/theme';
import { useCompetitionData } from '../hooks/useCompetitionData';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import CellPopup from './CellPopup';
import Leaderboard from './Leaderboard';
import ResultsTable from './ResultsTable';
import LiveTableSection from './LiveTableSection';
import WeekComparisonModal from './WeekComparisonModal';
import LeaderboardDotPlot from './LeaderboardDotPlot';

function CompetitionDashboard() {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedMatchweek, setSelectedMatchweek] = useState(latestMatchweek);
  const [cellPopupInfo, setCellPopupInfo] = useState(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showGlobalStandings, setShowGlobalStandings] = useState(false);
  const [showConsensusTable, setShowConsensusTable] = useState(false);
  const [showBeeswarm, setShowBeeswarm] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const currentMatchweek = selectedMatchweek;

  // Fetch last updated date from version.json
  useEffect(() => {
    fetch('/version.json')
      .then(res => res.json())
      .then(data => {
        if (data.date) {
          const date = new Date(data.date + 'T12:00:00');
          const formatted = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'numeric',
            day: 'numeric',
            year: '2-digit'
          });
          setLastUpdated(formatted);
        }
      })
      .catch(() => {
        setLastUpdated(null);
      });
  }, []);

  // Use our custom hook for all competition data
  const {
    groupData,
    competitionResults,
    teamsInOrder,
    enhancedResults,
    prevScoreMap,
    prevPosMap
  } = useCompetitionData(selectedGroup, selectedMatchweek);

  // Filter out consensus from results for leaderboard display
  const leaderboardResults = enhancedResults.filter(r => !r.isConsensus);

  // Filter out FPL for now as requested
  const visibleGroups = availableGroups.filter(group => group.id !== 'FPL');

  // Event handlers
  const handleNameClick = (name) => {
    setActiveUser(name);
    setShowUserModal(true);
  };

  const handleCellClick = (userName, teamName, event) => {
    event.stopPropagation();

    const rect = event.target.getBoundingClientRect();
    const x = rect.left;
    const y = rect.top;

    const userResult = competitionResults.find(r => r.name === userName);
    if (!userResult) return;
    const teamData = userResult.teamScores[teamName];
    if (!teamData) return;
    const stats = groupData.statistics[teamName] || {};

    const allPredictions = realPredictions.map(p => {
      const teamIndex = p.rankings.indexOf(teamName);
      return teamIndex !== -1 ? teamIndex + 1 : null;
    }).filter(pos => pos !== null);

    const enhancedStats = {
      ...stats,
      allPredictions
    };

    setCellPopupInfo({
      x,
      y,
      userName,
      teamName,
      score: teamData.score,
      predictedPosition: teamData.predictedPosition,
      currentPosition: teamData.actualPosition,
      stats: enhancedStats
    });
  };

  return (
    <div className="min-h-screen bg-gray-800 py-4 px-4 sm:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="relative mb-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              PREMONITION
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Premier League Prediction Leaderboard
            </p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Last Updated: {lastUpdated} | MW{currentMatchweek}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowScoringModal(true)}
            className="absolute top-0 right-0 text-gray-300 hover:text-white"
          >
            ?
          </Button>
        </div>

        {/* Filter Item */}
        <div className="flex justify-center mb-4">
          <Item className="w-full max-w-[95vw] sm:max-w-[450px]">
            <ItemContent>
              <ItemTitle>Filter</ItemTitle>
              <ItemDescription>Filter display for a specific group</ItemDescription>
            </ItemContent>
            <ItemActions>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  {visibleGroups.find(g => g.id === selectedGroup)?.name || 'All'}
                  <Badge variant="muted" className="ml-2">
                    {visibleGroups.find(g => g.id === selectedGroup)?.count || 0}
                  </Badge>
                  <span className="ml-1 text-gray-400">▼</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {visibleGroups.map(group => (
                    <DropdownMenuItem
                      key={group.id}
                      onClick={() => setSelectedGroup(group.id)}
                      className={selectedGroup === group.id ? 'bg-gray-800 text-white' : ''}
                    >
                      {group.name}
                      <Badge variant="muted" className="ml-auto">
                        {group.count}
                      </Badge>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </ItemActions>
          </Item>
        </div>

        {/* Group Performance Item */}
        <div className="flex justify-center mb-4">
          <Item className="w-full max-w-[95vw] sm:max-w-[450px]">
            <ItemContent>
              <ItemTitle>Group Performance</ItemTitle>
              <ItemDescription>Learn more about how this group predicted, and what is impacting their scores</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                variant="item"
                onClick={() => {
                  setShowConsensusTable(!showConsensusTable);
                  if (!showConsensusTable) setShowGlobalStandings(false);
                }}
              >
                {showConsensusTable ? 'Hide' : 'Show'}
              </Button>
            </ItemActions>
          </Item>
        </div>

        {/* Group Performance / Consensus Table */}
        {showConsensusTable && (
          <div className="mb-6">
            <LiveTableSection
              groupData={groupData}
              teamsInOrder={teamsInOrder}
            />
          </div>
        )}

        {/* Leaderboard Section - with integrated controls */}
        {!showGlobalStandings && (
          <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-4 mb-4">
            <Leaderboard
              enhancedResults={leaderboardResults}
              selectedGroup={selectedGroup}
              currentMatchweek={currentMatchweek}
              onShowFullTable={() => {
                setShowGlobalStandings(true);
                setShowConsensusTable(false);
              }}
              onShowBeeswarm={() => setShowBeeswarm(!showBeeswarm)}
              showBeeswarm={showBeeswarm}
              onShowComparison={() => setShowComparisonModal(true)}
              canShowComparison={selectedMatchweek > 1}
              prevMatchweek={selectedMatchweek - 1}
            />
            {showBeeswarm && (
              <LeaderboardDotPlot
                enhancedResults={leaderboardResults}
                prevScoreMap={prevScoreMap}
                prevPosMap={prevPosMap}
                onNameClick={handleNameClick}
              />
            )}
          </div>
        )}

        {/* View Other Gameweeks Item */}
        <div className="flex justify-center mb-4">
          <Item className="w-full max-w-[95vw] sm:max-w-[450px]">
            <ItemContent>
              <ItemTitle>View Other Gameweeks</ItemTitle>
              <ItemDescription>Navigate to see scores from previous matchweeks</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                variant="item"
                size="icon"
                onClick={() => setSelectedMatchweek(prev => Math.max(1, prev - 1))}
                disabled={selectedMatchweek <= 1}
              >
                ←
              </Button>
              <span className="text-white font-medium min-w-[60px] text-center">
                MW{selectedMatchweek}
              </span>
              <Button
                variant="item"
                size="icon"
                onClick={() => setSelectedMatchweek(prev => Math.min(latestMatchweek, prev + 1))}
                disabled={selectedMatchweek >= latestMatchweek}
              >
                →
              </Button>
            </ItemActions>
          </Item>
        </div>

        {/* Full Table / Results Table */}
        {showGlobalStandings && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Full Standings Table</h2>
              <Button
                variant="secondary"
                onClick={() => setShowGlobalStandings(false)}
                className="text-sm"
              >
                Back to Leaderboard
              </Button>
            </div>
            <div className="border-2 border-blue-500/30 rounded-lg p-4 bg-gray-900/50 overflow-x-auto">
              <ResultsTable
                enhancedResults={leaderboardResults}
                teamsInOrder={teamsInOrder}
                onCellClick={handleCellClick}
                onNameClick={handleNameClick}
              />
            </div>
          </div>
        )}

        {/* Scoring Modal */}
        <Dialog open={showScoringModal} onOpenChange={setShowScoringModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How Scoring Works</DialogTitle>
            </DialogHeader>
            <DialogDescription className="mb-4">
              Score = abs [Prediction - Actual] • Lower Score = More Correct • The (+) and (-) are shown for directionality only.
            </DialogDescription>
            <DialogDescription className="mb-6">
              For example: If you predicted Arsenal to finish 2nd but they're currently 4th, your score for Arsenal would be |2-4| = 2 points. The lower your total score across all teams, the better your predictions!
            </DialogDescription>
            <DialogFooter>
              <DialogClose onClick={() => setShowScoringModal(false)}>
                Got it!
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* User Predictions Modal */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>{activeUser}'s Predictions • GW{currentMatchweek}</span>
                <span className="text-xl">
                  {competitionResults.find(r => r.name === activeUser)?.totalScore}
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="table-auto mx-auto text-sm text-white w-full">
                <thead>
                  <tr>
                    <th className="p-2 text-left font-bold">#</th>
                    <th className="p-2 text-left font-bold">Team</th>
                    <th className="p-2 text-center font-bold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const userPrediction = realPredictions.find(p => p.name === activeUser);
                    if (!userPrediction) {
                      return (
                        <tr>
                          <td colSpan="3" className="p-4 text-center text-gray-400">
                            No prediction data found for {activeUser}
                          </td>
                        </tr>
                      );
                    }

                    const userResult = competitionResults.find(r => r.name === activeUser);
                    if (!userResult) {
                      return (
                        <tr>
                          <td colSpan="3" className="p-4 text-center text-gray-400">
                            No results found for {activeUser}
                          </td>
                        </tr>
                      );
                    }

                    return userPrediction.rankings.map((teamName, i) => {
                      const data = userResult.teamScores[teamName] || {};
                      const score = data.score ?? 0;
                      const delta = data.difference ?? 0;
                      const displayDelta = delta > 0 ? `+${delta}` : `${delta}`;
                      const actualPos = data.actualPosition;
                      return (
                        <tr key={teamName} className={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                          <td className="p-2 font-bold text-base">{i + 1}</td>
                          <td className="p-2 font-bold text-base">
                            {teamName} <span className="italic text-sm">({actualPos}{getOrdinalSuffix(actualPos)})</span>
                          </td>
                          <td className="p-2 text-center">
                            <div className={`w-[35px] mx-auto rounded text-base font-bold ${getCellStyle(score)}`}>{displayDelta}</div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <DialogFooter>
              <DialogClose onClick={() => setShowUserModal(false)}>
                Close
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Render cell popup if any */}
      {cellPopupInfo && <CellPopup info={cellPopupInfo} onClose={() => setCellPopupInfo(null)} />}

      {/* Week Comparison Modal */}
      {showComparisonModal && (
        <WeekComparisonModal
          weekA={selectedMatchweek - 1}
          weekB={selectedMatchweek}
          selectedGroup={selectedGroup}
          onClose={() => setShowComparisonModal(false)}
        />
      )}
    </div>
  )
}

export default CompetitionDashboard
