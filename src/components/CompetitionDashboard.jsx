// src/components/CompetitionDashboard.jsx
import { useState } from 'react'
import { availableGroups, latestMatchweek, availableMatchweeks, realPredictions } from '../data/competitionData'
import { THEME, getCellStyle, getOrdinalSuffix } from '../lib/theme';
import { useCompetitionData } from '../hooks/useCompetitionData';
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
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [selectedMatchweek, setSelectedMatchweek] = useState(latestMatchweek);
  const [cellPopupInfo, setCellPopupInfo] = useState(null);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const currentMatchweek = selectedMatchweek;

  // Use our custom hook for all competition data
  const {
    groupData,
    competitionResults,
    teamsInOrder,
    enhancedResults,
    prevScoreMap,
    prevPosMap
  } = useCompetitionData(selectedGroup, selectedMatchweek);

  // Filter out FPL for now as requested
  const visibleGroups = availableGroups.filter(group => group.id !== 'FPL');

  // Event handlers
  const handleNameClick = (name) => {
    setActiveUser(name);
    setShowUserModal(true);
  };

  const handleCellClick = (userName, teamName, event) => {
    console.log('Cell click for', userName, teamName, 'at', event.clientX, event.clientY);
    event.stopPropagation();

    // Get cell position for pinning
    const rect = event.target.getBoundingClientRect();
    const x = rect.left;
    const y = rect.top;

    const userResult = competitionResults.find(r => r.name === userName);
    if (!userResult) return;
    const teamData = userResult.teamScores[teamName];
    const stats = groupData.statistics[teamName] || {};

    // Get all predictions for this team for ranking comparison
    const allPredictions = realPredictions.map(p => {
      const teamIndex = p.rankings.indexOf(teamName);
      return teamIndex !== -1 ? teamIndex + 1 : null;
    }).filter(pos => pos !== null);

    // Enhanced stats with all predictions
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

  const handleToggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  return (
    <div className="min-h-screen bg-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header: centered title + matchweek, help button on right */}
        <div className="relative mb-3">
          <div className="text-center">
            <h1 className={`${THEME.fontSizes.title} ${THEME.fontStyles.titleWeight} ${THEME.colors.white} mb-1`}>
              🏆 PREMONITION
            </h1>
            <p className={`${THEME.colors.grayText} ${THEME.fontSizes.subtitle}`}>
              Premier League Prediction Leaderboard • After Matchweek {currentMatchweek}
            </p>
          </div>
          <button
            onClick={() => setShowScoringModal(true)}
            className={`absolute top-0 right-0 ${THEME.colors.lightBlue} hover:bg-gray-700 text-gray-300 hover:text-white ${THEME.fontStyles.buttonWeight} rounded-md transition-colors ${THEME.fontSizes.button} ${THEME.controls.padding}`}
          >
            ?
          </button>
        </div>

        {/* Compact Centered Controls */}
        <div className="flex justify-center mb-4">
          <div className={`${THEME.colors.darkBlue} rounded-lg shadow-lg p-3 inline-block max-w-[450px]`}>
            {/* Group Filter Toggle */}
            <div className="flex justify-center">
              <div className={`${THEME.colors.lightBlue} rounded-lg p-1 flex`}>
                {visibleGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`px-4 py-2 rounded-md ${THEME.fontStyles.buttonWeight} transition-colors ${THEME.fontSizes.button} ${
                      selectedGroup === group.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {group.name.toUpperCase()}
                    <span className={`ml-2 ${THEME.fontSizes.button} opacity-75`}>
                      ({group.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controls: GW selector, comparison button, hide leaderboard - MOVED ABOVE LEADERBOARD */}
        <div className="flex justify-center mb-6">
          <div className={`${THEME.colors.darkBlue} rounded-lg shadow-lg p-3 max-w-[450px] w-full`}>
            <div className="flex justify-center items-center space-x-2">
              {/* GW dropdown */}
              <select
                value={selectedMatchweek}
                onChange={e => setSelectedMatchweek(Number(e.target.value))}
                className={`${THEME.colors.lightBlue} hover:bg-gray-700 text-white ${THEME.fontStyles.buttonWeight} rounded-md transition-colors ${THEME.fontSizes.button} ${THEME.controls.padding}`}
              >
                {availableMatchweeks.map(wk => (
                  <option key={wk} value={wk}>GW{wk}</option>
                ))}
              </select>
              {/* Week comparison button */}
              {selectedMatchweek > 1 && (
                <button
                  onClick={() => setShowComparisonModal(true)}
                  className={`${THEME.colors.lightBlue} hover:bg-gray-700 text-white ${THEME.fontStyles.buttonWeight} rounded-md transition-colors ${THEME.fontSizes.button} ${THEME.controls.padding} flex items-center gap-1`}
                  title="View week-over-week changes"
                >
                  <span className="text-lg">Δ</span>
                  <span className="text-lg">📊</span>
                </button>
              )}
              {/* Hide leaderboard */}
              <button
                onClick={handleToggleLeaderboard}
                className={`${THEME.colors.lightBlue} hover:bg-gray-700 text-white ${THEME.fontStyles.buttonWeight} rounded-md transition-colors ${THEME.fontSizes.button} ${THEME.controls.padding}`}
              >{showLeaderboard ? 'HIDE 🏆' : 'SHOW 🏆'}</button>
            </div>
          </div>
        </div>

        {/* Leaderboard and Dot Plot Side by Side */}
        {showLeaderboard ? (
          <div className="flex justify-center gap-4 mb-4 flex-wrap lg:flex-nowrap">
            {/* Leaderboard Component */}
            <div className="flex-shrink-0">
              <Leaderboard
                enhancedResults={enhancedResults}
                selectedGroup={selectedGroup}
                currentMatchweek={currentMatchweek}
                showLeaderboard={showLeaderboard}
                onToggleLeaderboard={handleToggleLeaderboard}
              />
            </div>

            {/* Dot Plot Visualization */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <LeaderboardDotPlot
                enhancedResults={enhancedResults}
                prevScoreMap={prevScoreMap}
                prevPosMap={prevPosMap}
                onNameClick={handleNameClick}
              />
            </div>
          </div>
        ) : (
          <Leaderboard
            enhancedResults={enhancedResults}
            selectedGroup={selectedGroup}
            currentMatchweek={currentMatchweek}
            showLeaderboard={showLeaderboard}
            onToggleLeaderboard={handleToggleLeaderboard}
          />
        )}

        {/* Results Table Component */}
        <ResultsTable
          enhancedResults={enhancedResults}
          teamsInOrder={teamsInOrder}
          onCellClick={handleCellClick}
          onNameClick={handleNameClick}
        />
        
        {/* Live Table Section Component */}
        <LiveTableSection
          groupData={groupData}
          teamsInOrder={teamsInOrder}
        />

        {/* Scoring Modal */}
        {showScoringModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-white mb-4">How Scoring Works</h3>
              <p className="text-sm text-gray-300 mb-4">
                Score = abs [Prediction - Actual] • Lower Score = More Correct • The (+) and (-) are shown for directionality only.
              </p>
              <p className="text-sm text-gray-300 mb-6">
                For example: If you predicted Arsenal to finish 2nd but they're currently 4th, your score for Arsenal would be |2-4| = 2 points. The lower your total score across all teams, the better your predictions!
              </p>
              <button
                onClick={() => setShowScoringModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        {/* User Predictions Modal */}
        {showUserModal && activeUser && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {activeUser}'s Predictions • GW{currentMatchweek}
                </h3>
                <div className="text-xl font-bold text-white">
                  {competitionResults.find(r => r.name === activeUser)?.totalScore}
                </div>
              </div>
               <div className="overflow-y-auto max-h-[60vh]">
                <table className="table-auto mx-auto text-sm text-white">
                  <thead>
                    <tr>
                      <th className="p-2 text-left font-bold">#</th>
                      <th className="p-2 text-left font-bold">Team</th>
                      <th className="p-2 text-center font-bold">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                  {realPredictions.find(p => p.name === activeUser).rankings.map((teamName, i) => {
                    const userResult = competitionResults.find(r => r.name === activeUser);
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
                  })}
                  </tbody>
                </table>
              </div>
              <div className="text-right mt-4">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >Close</button>
              </div>
            </div>
          </div>
        )}
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

      {/* CSS Custom Property for Controls Width */}
      <style>{`
        :global(:root) {
          --controls-width: auto;
        }

        @media (min-width: 768px) {
          :global(:root) {
            --controls-width: fit-content;
          }
        }
      `}</style>
    </div>
  )
}

export default CompetitionDashboard