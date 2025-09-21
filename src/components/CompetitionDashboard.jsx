// src/components/CompetitionDashboard.jsx
import { useState } from 'react'
import { calculateCompetitionScores, getTeamsInTableOrder, currentStandings } from '../data/competitionData'
import { availableGroups } from '../data/competitionData'
import { getGroupData, getTeamAbbreviation } from '../data/groupDataProcessor';

function CompetitionDashboard() {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [viewMode, setViewMode] = useState('simplified'); // 'expanded' or 'simplified'
  const [showScoringModal, setShowScoringModal] = useState(false);
  
  // Get processed group data
  const groupData = getGroupData(selectedGroup, currentStandings);
  
  // Get original competition results
  const competitionResults = calculateCompetitionScores(selectedGroup);
  const teamsInOrder = getTeamsInTableOrder();

  // Filter out FPL for now as requested
  const visibleGroups = availableGroups.filter(group => group.id !== 'FPL');

  // Enhanced competition results with group consensus
  const enhancedResults = [...competitionResults, groupData.consensusScore]
    .sort((a, b) => a.totalScore - b.totalScore);

  // Helper function to get cell styling based on score
  const getCellStyle = (score) => {
    if (score === 0) return 'bg-green-500 text-white font-bold'; // Perfect prediction - medium green
    if (score <= 1) return 'bg-green-200 text-green-800 font-medium'; // ±1 - light green
    if (score <= 3) return 'bg-yellow-100 text-yellow-700'; // ±2-3 - really light yellow
    if (score === 4) return 'bg-yellow-200 text-yellow-800'; // 4 - yellow
    if (score <= 6) return 'bg-orange-200 text-orange-800'; // 5-6 - orange
    return 'bg-red-200 text-red-800'; // 7+ - red
  };

  // Helper function to format the cell content
  const formatCellContent = (teamData, teamName) => {
    const sign = teamData.difference > 0 ? '+' : '';
    const score = `${sign}${teamData.difference}`;
    const teamAbbr = getTeamAbbreviation(teamName);
    const details = `P: ${teamAbbr} ${teamData.predictedPosition}${getOrdinalSuffix(teamData.predictedPosition)}`;
    return { score, details };
  };

  // Helper function to get ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏆 Premonition Competition
          </h1>
          <p className="text-gray-600 text-lg">
            Premier League Prediction Leaderboard • After Matchweek 4
          </p>
          <button 
            onClick={() => setShowScoringModal(true)}
            className="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
          >
            How Scoring Works
          </button>
        </div>

        {/* Compact Centered Controls */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-lg p-4 inline-block">
            {/* View Mode Toggle */}
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('expanded')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                    viewMode === 'expanded'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📊 Detailed
                </button>
                <button
                  onClick={() => setViewMode('simplified')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                    viewMode === 'simplified'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📋 Simple
                </button>
              </div>
            </div>

            {/* Group Filter Toggle */}
            <div className="flex justify-center">
              <div className="flex flex-wrap gap-2">
                {visibleGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`
                      px-3 py-1 rounded-lg font-medium transition-all duration-200 text-sm
                      ${selectedGroup === group.id
                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                      }
                    `}
                  >
                    {group.name}
                    <span className="ml-2 text-sm opacity-75">
                      ({group.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Group description */}
            <div className="mt-3 text-center text-sm text-gray-600">
              {selectedGroup === 'all' && (
                <p>Showing all {availableGroups.find(g => g.id === 'all')?.count} predictions together.</p>
              )}
              {selectedGroup === 'LIV' && (
                <p>Showing only the Klopptoberfest entries.</p>
              )}
              {selectedGroup === 'TOG' && (
                <p>Showing only the Togga Boys Fantrax FPL entries.</p>
              )}
            </div>
          </div>
        </div>

        {/* Compact Top 4 + Last Place */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            {/* Left side - Group and Matchweek info */}
            <div className="text-left text-gray-600">
              <div className="mb-1 text-sm">
                {selectedGroup === 'all' ? 'All Entries' : selectedGroup === 'LIV' ? 'Klopptoberfest' : 'Fantrax FPL'}
              </div>
              <div className="text-lg font-medium">MW4</div>
            </div>
            
            {/* Center - Top performers */}
            <div className="flex items-center space-x-8 text-sm">
              {(() => {
                // Group results by score to handle ties (using enhanced results)
                const scoreGroups = {};
                enhancedResults.forEach((result, index) => {
                  if (index < 8) { // Only consider top 8 for potential top 4 spots
                    const score = result.totalScore;
                    if (!scoreGroups[score]) scoreGroups[score] = [];
                    scoreGroups[score].push(result);
                  }
                });
                
                const sortedScores = Object.keys(scoreGroups).map(Number).sort((a, b) => a - b);
                const topPositions = [];
                let currentPosition = 1;
                
                // Build top 3 positions only
                for (const score of sortedScores) {
                  if (currentPosition <= 3) {
                    topPositions.push({
                      position: currentPosition,
                      people: scoreGroups[score],
                      score: score
                    });
                    currentPosition += scoreGroups[score].length;
                  }
                }
                
                const topElements = topPositions.slice(0, 3).map((positionGroup, groupIndex) => (
                  <div key={groupIndex} className="text-center">
                    <span className="text-2xl">
                      {positionGroup.position === 1 ? '🥇' : positionGroup.position === 2 ? '🥈' : '🥉'}
                    </span>
                    <div className="font-bold text-xs mt-1">
                      {positionGroup.people.map(p => p.isConsensus ? `${p.name} 🤖` : p.name).join(', ')}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mt-1">
                      {positionGroup.score}
                    </div>
                  </div>
                ));

                // Last place
                const lastResult = enhancedResults[enhancedResults.length - 1];
                const lastPlaceElement = (
                  <div key="last" className="text-center">
                    <span className="text-2xl">💩</span>
                    <div className="font-bold text-xs mt-1">
                      {lastResult.isConsensus ? `${lastResult.name} 🤖` : lastResult.name}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mt-1">
                      {lastResult.totalScore}
                    </div>
                  </div>
                );

                return [...topElements, lastPlaceElement];
              })()}
            </div>
            
            {/* Right side spacer for balance */}
            <div className="w-16"></div>
          </div>
        </div>

        {/* Full Results Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className={`font-bold text-gray-900 sticky left-0 bg-gray-50 z-20 text-xs ${
                    viewMode === 'expanded' ? 'px-2 py-2' : 'px-1 py-1'
                  }`}>
                    #
                  </th>
                  <th className={`font-bold text-gray-900 sticky bg-gray-50 z-20 text-xs ${
                    viewMode === 'expanded' ? 'px-2 py-2 left-8' : 'px-1 py-1 left-6'
                  }`}>
                    Name
                  </th>
                  <th className={`font-bold text-gray-900 sticky bg-gray-50 z-20 text-xs ${
                    viewMode === 'expanded' ? 'px-2 py-2 left-32' : 'px-1 py-1 left-24'
                  }`}>
                    Total
                  </th>
                  {teamsInOrder.map(team => (
                    <th key={team.name} className={`font-bold text-gray-900 ${
                      viewMode === 'expanded' ? 'px-1 py-3 text-sm min-w-[70px]' : 'px-1 py-2 text-xs min-w-[35px]'
                    }`}>
                      <div className="flex flex-col items-center">
                        <div className={`font-bold text-gray-800 ${viewMode === 'simplified' ? 'text-xs' : ''}`}>
                          {getTeamAbbreviation(team.name)}
                        </div>
                        <div className={`text-gray-500 mt-1 ${viewMode === 'expanded' ? 'text-xs' : 'text-xs'}`}>
                          #{team.position}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enhancedResults.map((result, index) => (
                  <tr key={result.name} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className={`font-bold text-gray-900 sticky left-0 bg-inherit z-10 text-xs ${
                      viewMode === 'expanded' ? 'px-2 py-2' : 'px-1 py-1'
                    }`}>
                      {index + 1}
                    </td>
                    <td className={`font-semibold sticky bg-inherit z-10 text-xs ${
                      viewMode === 'expanded' ? 'px-2 py-2 left-8' : 'px-1 py-1 left-6'
                    } ${result.isConsensus ? 'text-blue-600' : 'text-gray-900'}`}>
                      {result.isConsensus ? `${result.name} 🤖` : result.name}
                    </td>
                    <td className={`text-center font-bold sticky bg-inherit z-10 text-xs ${
                      viewMode === 'expanded' ? 'px-2 py-2 left-32' : 'px-1 py-1 left-24'
                    } ${result.isConsensus ? 'text-blue-600' : 'text-gray-900'}`}>
                      {result.totalScore}
                    </td>
                    {teamsInOrder.map(team => {
                      const teamData = result.teamScores[team.name];
                      return (
                        <td key={team.name} className={viewMode === 'expanded' ? 'px-1 py-2 text-center' : 'px-0 py-1 text-center'}>
                          {teamData ? (
                            viewMode === 'expanded' ? (
                              <div className={`
                                px-1 py-2 rounded text-xs font-medium
                                ${getCellStyle(teamData.score)}
                              `}>
                                <div className="text-sm font-bold mb-1">
                                  {formatCellContent(teamData, team.name).score}
                                </div>
                                <div className="text-xs leading-tight">
                                  {formatCellContent(teamData, team.name).details}
                                </div>
                              </div>
                            ) : (
                              <div className={`
                                px-1 py-1 mx-0.5 my-0.5 rounded text-xs font-bold
                                ${getCellStyle(teamData.score)}
                              `}>
                                {formatCellContent(teamData, team.name).score}
                              </div>
                            )
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Live Table + Group Data */}
        <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Live Table + Group Data</h3>
            <p className="text-sm text-gray-600 mt-1">
              Current PL standings with group prediction statistics ({groupData.predictionCount} predictors)
            </p>
          </div>

          {/* Fun Metrics - Overachievers vs Underachievers */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* Overachievers */}
              <div className="text-center">
                <h4 className="text-sm font-bold text-green-600 mb-3">Overachievers</h4>
                <div className="space-y-2">
                  {groupData.overachievers && groupData.overachievers.map((team, index) => (
                    <div key={team.team} className="bg-white rounded px-2 py-3 text-center">
                      <div className="text-xl font-bold text-gray-800 mb-1">
                        {getTeamAbbreviation(team.team)} <span className="text-green-600">(+{Math.abs(team.delta)})</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Group Predicted: {groupData.groupPredictionRanks[team.team]}, Current: {team.currentPosition}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Underachievers */}
              <div className="text-center">
                <h4 className="text-sm font-bold text-red-600 mb-3">Underachievers</h4>
                <div className="space-y-2">
                  {groupData.underachievers && groupData.underachievers.map((team, index) => (
                    <div key={team.team} className="bg-white rounded px-2 py-3 text-center">
                      <div className="text-xl font-bold text-gray-800 mb-1">
                        {getTeamAbbreviation(team.team)} <span className="text-red-600">({team.delta})</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Group Predicted: {groupData.groupPredictionRanks[team.team]}, Current: {team.currentPosition}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900">Pos</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-900">Team</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-900">Group Prediction</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-900">Range (μ ± 1σ)</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-900">Group Average</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-900">Median</th>
                </tr>
              </thead>
              <tbody>
                {teamsInOrder.map((team, index) => {
                  const stats = groupData.statistics[team.name] || {};
                  const groupPredictionRank = groupData.groupPredictionRanks && groupData.groupPredictionRanks[team.name] || null;
                  
                  // Calculate delta and color coding
                  const currentPos = team.position;
                  const groupPos = groupPredictionRank;
                  const delta = groupPos ? Math.abs(groupPos - currentPos) : null;
                  
                  // Check if current position is within the range
                  const rangeHigh = stats.rangeHigh; // This should be the better position (lower number)
                  const rangeLow = stats.rangeLow;   // This should be the worse position (higher number)
                  const isWithinRange = (rangeHigh !== null && rangeLow !== null) ? 
                    (currentPos >= rangeHigh && currentPos <= rangeLow) : false;
                  
                  // New color coding logic
                  const getAccuracyColor = () => {
                    if (rangeHigh === null || rangeLow === null) return 'text-gray-400';
                    
                    if (isWithinRange) return 'text-black'; // In range = BLACK
                    if (currentPos < rangeHigh) return 'text-green-600'; // Below range (better) = GREEN
                    if (currentPos > rangeLow) return 'text-red-600'; // Above range (worse) = RED
                    return 'text-gray-400';
                  };
                  
                  // Check if team is in over/underachievers
                  const overachiever = groupData.overachievers && groupData.overachievers.find(t => t.team === team.name);
                  const underachiever = groupData.underachievers && groupData.underachievers.find(t => t.team === team.name);
                  
                  // Helper function for ordinal numbers
                  const getOrdinal = (num) => {
                    const j = num % 10;
                    const k = num % 100;
                    if (j === 1 && k !== 11) return num + 'st';
                    if (j === 2 && k !== 12) return num + 'nd';
                    if (j === 3 && k !== 13) return num + 'rd';
                    return num + 'th';
                  };
                  
                  // Format range display
                  const rangeDisplay = (stats.rangeHigh !== null && stats.rangeLow !== null) 
                    ? `${stats.rangeHigh}-${stats.rangeLow}`
                    : 'N/A';
                  
                  return (
                    <tr key={team.name} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-3 py-2 text-xs font-bold text-gray-900">{team.position}</td>
                      <td className="px-3 py-2 text-xs font-medium text-gray-900">
                        {team.name}
                        {overachiever && (
                          <span className="text-green-600 ml-1">({Math.abs(overachiever.delta)})</span>
                        )}
                        {underachiever && (
                          <span className="text-red-600 ml-1">({Math.abs(underachiever.delta)})</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center text-xs">
                        {groupPredictionRank ? (
                          <div>
                            <div className={`font-medium ${getAccuracyColor()}`}>
                              {getOrdinal(groupPredictionRank)}
                            </div>
                            <div className="text-xs text-gray-400 italic">
                              (In {getOrdinal(currentPos)}, <strong>Δ{delta}</strong>)
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center text-xs text-gray-700">{rangeDisplay}</td>
                      <td className="px-3 py-2 text-center text-xs text-gray-700">{stats.mean || 'N/A'}</td>
                      <td className="px-3 py-2 text-center text-xs text-gray-700">{stats.median || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-gray-50 text-xs text-gray-600">
            <p><strong>Group Prediction:</strong> Shows group consensus rank with current position and accuracy delta</p>
            <p><strong>Color coding:</strong> <span className="text-green-600">Green (better than range)</span> • <span className="text-black font-bold">Black (within range)</span> • <span className="text-red-600">Red (worse than range)</span></p>
            <p><strong>Team names:</strong> <span className="text-green-600">(+X) Overachievers</span> • <span className="text-red-600">(-X) Underachievers</span> based on group vs current position</p>
            <p><strong>Leaderboard colors:</strong> <span className="bg-green-500 text-white px-1 rounded">Perfect (0)</span> • <span className="bg-green-200 text-green-800 px-1 rounded">Excellent (±1)</span> • <span className="bg-yellow-100 text-yellow-700 px-1 rounded">Good (±2-3)</span> • <span className="bg-yellow-200 text-yellow-800 px-1 rounded">Fair (4)</span> • <span className="bg-orange-200 text-orange-800 px-1 rounded">Poor (5-6)</span> • <span className="bg-red-200 text-red-800 px-1 rounded">Terrible (7+)</span></p>
            <p><strong>Range:</strong> Mean ± 1 standard deviation of group predictions</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by Premonition • Data updated after each Premier League matchweek</p>
        </div>

        {/* Scoring Modal */}
        {showScoringModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">How Scoring Works</h3>
              <p className="text-sm text-gray-600 mb-4">
                Score = abs [Prediction - Actual] • Lower Score = More Correct • The (+) and (-) are shown for directionality only.
              </p>
              <p className="text-sm text-gray-600 mb-6">
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
      </div>
    </div>
  )
}

export default CompetitionDashboard