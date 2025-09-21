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

  // Helper function to get cell styling based on score - matching screenshot exactly
  const getCellStyle = (score) => {
    if (score === 0) return 'bg-green-600 text-white font-bold'; // Perfect prediction - darker green with white text
    if (score <= 1) return 'bg-green-800 text-green-300 font-bold'; // ±1 - dark green with light green text
    if (score <= 3) return 'bg-yellow-800 text-yellow-300 font-bold'; // ±2-3 - dark yellow with light yellow text
    if (score === 4) return 'bg-yellow-800 text-yellow-300 font-bold'; // 4 - same dark yellow
    if (score <= 6) return 'bg-orange-800 text-orange-300 font-bold'; // 5-6 - dark orange with light orange text
    return 'bg-red-900 text-red-300 font-bold'; // 7+ - dark red with light red text
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
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏆 Premonition Competition
          </h1>
          <p className="text-gray-400 text-lg">
            Premier League Prediction Leaderboard • After Matchweek 4
          </p>
          <button 
            onClick={() => setShowScoringModal(true)}
            className="text-sm text-blue-400 hover:text-blue-300 underline mt-2"
          >
            How Scoring Works
          </button>
        </div>

        {/* Compact Centered Controls */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-900 rounded-lg shadow-lg p-3 inline-block border border-gray-700">
            {/* Group Filter Toggle */}
            <div className="flex justify-center">
              <div className="bg-gray-800 rounded-lg p-1 flex">
                {visibleGroups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group.id)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                      selectedGroup === group.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-300 hover:text-white'
                    }`}
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
            <div className="mt-3 text-center text-sm text-gray-400">
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

        {/* Minimal Vertical Leaderboard - Now matching width of controls above */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-900 rounded-lg shadow-lg p-4 border border-gray-700" style={{ width: 'var(--controls-width)' }}>
            {/* Title */}
            <h3 className="text-lg font-bold text-white text-center mb-1">LEADERS & LOSERS</h3>
            <div className="text-center text-xs text-gray-400 mb-1">
              {selectedGroup === 'all' ? 'All Entries' : selectedGroup === 'LIV' ? 'Klopptoberfest' : 'Fantrax FPL'} | MW4
            </div>
            
            {/* Compact Table - Fixed spacing */}
            <table className="w-full text-xs">
              <tbody>
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
                  const allRows = [];
                  let currentPosition = 1;
                  
                  // Build top 3 positions with individual rows for ties
                  for (const score of sortedScores) {
                    if (currentPosition <= 3) {
                      const positionGroup = scoreGroups[score];
                      const isTied = positionGroup.length > 1;
                      
                      positionGroup.forEach(person => {
                        allRows.push({
                          position: currentPosition,
                          person: person,
                          score: score,
                          isTied: isTied
                        });
                      });
                      
                      currentPosition += positionGroup.length;
                    }
                  }
                  
                  // Add last place people
                  const lastResult = enhancedResults[enhancedResults.length - 1];
                  const lastScore = lastResult.totalScore;
                  const lastPlacePeople = enhancedResults.filter(r => r.totalScore === lastScore);
                  const lastIsTied = lastPlacePeople.length > 1;
                  
                  lastPlacePeople.forEach(person => {
                    allRows.push({
                      position: 'last',
                      person: person,
                      score: lastScore,
                      isTied: lastIsTied,
                      isLast: true
                    });
                  });
                  
                  return allRows.map((row, index) => {
                    // Determine background color and emoji
                    let bgColor = '';
                    let emoji = '';
                    let positionText = '';
                    
                    if (row.isLast) {
                      bgColor = 'bg-red-900';
                      emoji = '💩';
                      positionText = row.isTied ? 'TLast' : 'Last';
                    } else if (row.position === 1) {
                      bgColor = 'bg-yellow-600';
                      emoji = '🥇';
                      positionText = row.isTied ? 'T1st' : '1st';
                    } else if (row.position === 2) {
                      bgColor = 'bg-gray-600';
                      emoji = '🥈';
                      positionText = row.isTied ? 'T2nd' : '2nd';
                    } else if (row.position === 3) {
                      bgColor = 'bg-amber-600';
                      emoji = '🥉';
                      positionText = row.isTied ? 'T3rd' : '3rd';
                    }
                    
                    return (
                      <tr key={index}>
                        <td className="px-0 py-1 text-center">
                          <div className={`px-2 py-2 mx-1 my-1 rounded font-medium text-white ${bgColor}`}>
                            {positionText} {emoji}
                          </div>
                        </td>
                        <td className="px-0 py-1 text-center">
                          <div className={`px-2 py-2 mx-1 my-1 rounded font-medium ${bgColor} ${row.isLast ? 'text-red-200' : 'text-white'}`}>
                            {row.person.isConsensus ? `${row.person.name} 🤖` : row.person.name}
                          </div>
                        </td>
                        <td className="px-0 py-1 text-center">
                          <div className={`px-2 py-2 mx-1 my-1 rounded font-medium ${bgColor} ${row.isLast ? 'text-red-200' : 'text-white'}`}>
                            {row.score}
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Mode Toggle - Separate Section */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-900 rounded-lg shadow-lg p-3 border border-gray-700 max-w-[250px]">
            <div className="flex justify-center">
              <div className="bg-gray-800 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('expanded')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                    viewMode === 'expanded'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  📊 Detailed
                </button>
                <button
                  onClick={() => setViewMode('simplified')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                    viewMode === 'simplified'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  📋 Simple
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full Results Table - Now with sticky header */}
        <div className="bg-black rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black border-b border-gray-800 sticky top-0 z-30">
                <tr>
                  <th className={`font-bold text-white sticky left-0 bg-black z-40 text-xs ${
                    viewMode === 'expanded' ? 'px-2 py-2' : 'px-1 py-1'
                  }`}>
                    #
                  </th>
                  <th className={`font-bold text-white sticky bg-black z-40 text-xs ${
                    viewMode === 'expanded' ? 'px-2 py-2 left-8' : 'px-1 py-1 left-6'
                  }`}>
                    Name
                  </th>
                  <th className={`font-bold text-white sticky bg-black z-40 text-xs ${
                    viewMode === 'expanded' ? 'px-2 py-2 left-32' : 'px-1 py-1 left-24'
                  }`}>
                    Total
                  </th>
                  {teamsInOrder.map(team => (
                    <th key={team.name} className={`font-bold text-white sticky top-0 bg-black z-30 ${
                      viewMode === 'expanded' ? 'px-1 py-3 text-sm min-w-[70px]' : 'px-1 py-2 text-xs min-w-[35px]'
                    }`}>
                      <div className="flex flex-col items-center">
                        <div className={`font-bold text-white ${viewMode === 'simplified' ? 'text-xs' : ''}`}>
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
                  <tr key={result.name} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-black'}>
                    <td className={`font-bold text-white sticky left-0 z-10 text-xs ${
                      index % 2 === 0 ? 'bg-gray-900' : 'bg-black'
                    } ${viewMode === 'expanded' ? 'px-2 py-2' : 'px-1 py-1'}`}>
                      {index + 1}
                    </td>
                    <td className={`font-semibold sticky z-10 text-xs ${
                      index % 2 === 0 ? 'bg-gray-900' : 'bg-black'
                    } ${viewMode === 'expanded' ? 'px-2 py-2 left-8' : 'px-1 py-1 left-6'} ${
                      result.isConsensus ? 'text-blue-400' : 'text-white'
                    }`}>
                      {result.isConsensus ? `${result.name} 🤖` : result.name}
                    </td>
                    <td className={`text-center font-bold sticky z-10 text-xs ${
                      index % 2 === 0 ? 'bg-gray-900' : 'bg-black'
                    } ${viewMode === 'expanded' ? 'px-2 py-2 left-32' : 'px-1 py-1 left-24'} ${
                      result.isConsensus ? 'text-blue-400' : 'text-white'
                    }`}>
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
                            <span className="text-gray-500 text-xs">-</span>
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
        <div className="mt-6 bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Live Table + Group Data</h3>
            <p className="text-sm text-gray-400 mt-1">
              Current PL standings with group prediction statistics ({groupData.predictionCount} predictors)
            </p>
          </div>

          {/* Fun Metrics - Overachievers vs Underachievers */}
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="max-w-2xl mx-auto">
              {/* Headers */}
              <div className="flex justify-center gap-4 mb-3">
                <div className="text-center max-w-[300px] flex-1">
                  <h4 className="text-sm font-bold text-green-400">Overachievers</h4>
                </div>
                <div className="text-center max-w-[300px] flex-1">
                  <h4 className="text-sm font-bold text-red-400">Underachievers</h4>
                </div>
              </div>
              
              {/* Paired rows */}
              <div className="space-y-2">
                {(() => {
                  const overachievers = groupData.overachievers || [];
                  const underachievers = groupData.underachievers || [];
                  const maxRows = Math.max(overachievers.length, underachievers.length);
                  
                  return Array.from({ length: maxRows }, (_, index) => {
                    const overachiever = overachievers[index];
                    const underachiever = underachievers[index];
                    
                    return (
                      <div key={index} className="flex justify-center gap-4 min-h-[75px]">
                        {/* Overachiever Card */}
                        <div className="max-w-[300px] flex-1">
                          {overachiever ? (
                            <div className="bg-gray-900 rounded px-2 py-3 text-center border border-gray-600 h-full flex flex-col justify-center min-h-[75px]">
                              <div className="text-xl font-bold text-white mb-1">
                                {getTeamAbbreviation(overachiever.team)} <span className="text-green-400">(+{Math.abs(overachiever.delta)})</span>
                              </div>
                              <div className="text-xs text-gray-400 leading-tight">
                                Group Predicted: {groupData.groupPredictionRanks[overachiever.team]}, Current: {overachiever.currentPosition}
                              </div>
                            </div>
                          ) : (
                            <div className="min-h-[75px]"></div>
                          )}
                        </div>
                        
                        {/* Underachiever Card */}
                        <div className="max-w-[300px] flex-1">
                          {underachiever ? (
                            <div className="bg-gray-900 rounded px-2 py-3 text-center border border-gray-600 h-full flex flex-col justify-center min-h-[75px]">
                              <div className="text-xl font-bold text-white mb-1">
                                {getTeamAbbreviation(underachiever.team)} <span className="text-red-400">({underachiever.delta})</span>
                              </div>
                              <div className="text-xs text-gray-400 leading-tight">
                                Group Predicted: {groupData.groupPredictionRanks[underachiever.team]}, Current: {underachiever.currentPosition}
                              </div>
                            </div>
                          ) : (
                            <div className="min-h-[75px]"></div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Main Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white">Pos</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-white">Team</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-white">Group Prediction</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-white">Range (μ ± 1σ)</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-white">Group Average</th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-white">Median</th>
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
                    if (rangeHigh === null || rangeLow === null) return 'text-gray-500';
                    
                    if (isWithinRange) return 'text-white'; // In range = WHITE
                    if (currentPos < rangeHigh) return 'text-green-400'; // Below range (better) = GREEN
                    if (currentPos > rangeLow) return 'text-red-400'; // Above range (worse) = RED
                    return 'text-gray-500';
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
                    <tr key={team.name} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}>
                      <td className="px-3 py-2 text-xs font-bold text-white">{team.position}</td>
                      <td className="px-3 py-2 text-xs font-medium text-white">
                        {team.name}
                        {overachiever && (
                          <span className="text-green-400 ml-1">({Math.abs(overachiever.delta)})</span>
                        )}
                        {underachiever && (
                          <span className="text-red-400 ml-1">({Math.abs(underachiever.delta)})</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center text-xs">
                        {groupPredictionRank ? (
                          <div>
                            <div className={`font-medium ${getAccuracyColor()}`}>
                              {getOrdinal(groupPredictionRank)}
                            </div>
                            <div className="text-xs text-gray-500 italic">
                              (In {getOrdinal(currentPos)}, <strong>Δ{delta}</strong>)
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center text-xs text-gray-300">{rangeDisplay}</td>
                      <td className="px-3 py-2 text-center text-xs text-gray-300">{stats.mean || 'N/A'}</td>
                      <td className="px-3 py-2 text-center text-xs text-gray-300">{stats.median || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-gray-800 text-xs text-gray-400">
            <p><strong>Group Prediction:</strong> Shows group consensus rank with current position and accuracy delta</p>
            <p><strong>Color coding:</strong> <span className="text-green-400">Green (better than range)</span> • <span className="text-white font-bold">White (within range)</span> • <span className="text-red-400">Red (worse than range)</span></p>
            <p><strong>Team names:</strong> <span className="text-green-400">(+X) Overachievers</span> • <span className="text-red-400">(-X) Underachievers</span> based on group vs current position</p>
            <p><strong>Leaderboard colors:</strong> <span className="bg-green-500 text-white px-1 rounded">Perfect (0)</span> • <span className="bg-green-200 text-green-800 px-1 rounded">Excellent (±1)</span> • <span className="bg-yellow-100 text-yellow-700 px-1 rounded">Good (±2-3)</span> • <span className="bg-yellow-200 text-yellow-800 px-1 rounded">Fair (4)</span> • <span className="bg-orange-200 text-orange-800 px-1 rounded">Poor (5-6)</span> • <span className="bg-red-200 text-red-800 px-1 rounded">Terrible (7+)</span></p>
            <p><strong>Range:</strong> Mean ± 1 standard deviation of group predictions</p>
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
      </div>
      
      {/* CSS Custom Property for Controls Width */}
      <style jsx>{`
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