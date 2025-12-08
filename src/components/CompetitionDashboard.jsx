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
import ProminentButton from './ProminentButton';

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

        {/* Prediction Standings - Main Competition Table */}
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setShowGlobalStandings(!showGlobalStandings)}
              className="w-full max-w-[600px] bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold py-6 px-8 rounded-xl shadow-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-4 border-2 border-emerald-400/50"
            >
              <span className="text-4xl">{showGlobalStandings ? "📊" : "🎯"}</span>
              <div className="flex flex-col items-start">
                <span className="text-xl">
                  {showGlobalStandings ? "Hide Prediction Standings" : "Show Prediction Standings"}
                </span>
                <span className="text-sm font-normal opacity-90">
                  {showGlobalStandings ? "Click to collapse" : "See who's winning the competition"}
                </span>
              </div>
              <span className="text-3xl">{showGlobalStandings ? "▲" : "▼"}</span>
            </button>
          </div>

          {/* Collapsible Global Standings */}
          {showGlobalStandings && (
            <div className="border-4 border-emerald-500/30 rounded-lg p-4 bg-gray-900/50">
              <ResultsTable
                enhancedResults={enhancedResults}
                teamsInOrder={teamsInOrder}
                onCellClick={handleCellClick}
                onNameClick={handleNameClick}
              />
            </div>
          )}
        </div>

        {/* Group Average Predictions */}
        <div className="mb-6">
          <ProminentButton
            onClick={() => setShowConsensusTable(!showConsensusTable)}
            mainText={showConsensusTable ? "Hide Group Average" : "Show Group Average"}
            subtitleText={showConsensusTable ? "Click to collapse" : `View the ${selectedGroup === 'all' ? 'collective' : selectedGroup} average prediction vs reality`}
            endIcon={showConsensusTable ? "▲" : "▼"}
          />

          {/* Collapsible Consensus Table */}
          {showConsensusTable && (
            <div className="mt-4">
              <LiveTableSection
                groupData={groupData}
                teamsInOrder={teamsInOrder}
              />
            </div>
          )}
        </div>

        {/* Week-Over-Week Comparison Button */}
        {selectedMatchweek > 1 && (
          <ProminentButton
            onClick={() => setShowComparisonModal(true)}
            icon="📊"
            mainText="Week-Over-Week Comparison"
            subtitleText={`See how rankings changed from GW${selectedMatchweek - 1} → GW${selectedMatchweek}`}
            endIcon="→"
          />
        )}

        {/* Leaderboard and Dot Plot Side by Side */}
        <div className="flex justify-center gap-4 mb-4 flex-wrap lg:flex-nowrap">
          {/* Leaderboard Component */}
          <div className="flex-shrink-0">
            <Leaderboard
              enhancedResults={enhancedResults}
              selectedGroup={selectedGroup}
              currentMatchweek={currentMatchweek}
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

      {/* Gameweek Selector - Footer */}
      <div className="mt-8">
        <ProminentButton
          onClick={() => {}} // Empty onClick since we'll use the select directly
          mainText="View Standings During Other Gameweeks"
          subtitleText={
            <select
              value={selectedMatchweek}
              onChange={e => setSelectedMatchweek(Number(e.target.value))}
              className="bg-transparent text-white font-semibold cursor-pointer outline-none border-2 border-white/30 hover:border-white/60 rounded px-2 py-1 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {availableMatchweeks.map(wk => (
                <option key={wk} value={wk} className="bg-gray-800">
                  Gameweek {wk}
                </option>
              ))}
            </select>
          }
        />
      </div>

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