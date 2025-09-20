// src/components/CompetitionDashboard.jsx
import { useState } from 'react'
import { calculateCompetitionScores, getTeamsInTableOrder } from '../data/competitionData'
import GroupToggle from './GroupToggle'

function CompetitionDashboard() {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [viewMode, setViewMode] = useState('expanded'); // 'expanded' or 'simplified'
  const competitionResults = calculateCompetitionScores(selectedGroup);
  const teamsInOrder = getTeamsInTableOrder();

  // Helper function to get cell styling based on score
  const getCellStyle = (score) => {
    if (score === 0) return 'bg-green-100 text-green-800 font-bold'; // Perfect prediction
    if (score <= 2) return 'bg-yellow-100 text-yellow-800'; // Close
    if (score <= 5) return 'bg-orange-100 text-orange-800'; // Okay
    return 'bg-red-100 text-red-800'; // Way off
  };

  // Helper function to get team abbreviation
  const getTeamAbbreviation = (teamName) => {
    const abbreviations = {
      'Liverpool': 'LIV',
      'Arsenal': 'ARS', 
      'Tottenham Hotspur': 'TOT',
      'AFC Bournemouth': 'BOU',
      'Chelsea': 'CHE',
      'Everton': 'EVE',
      'Sunderland': 'SUN',
      'Manchester City': 'MCI',
      'Crystal Palace': 'CRY',
      'Newcastle United': 'NEW',
      'Fulham': 'FUL',
      'Brentford': 'BRE',
      'Brighton & Hove Albion': 'BRI',
      'Manchester United': 'MUN',
      'Nottingham Forest': 'NFO',
      'Leeds United': 'LEE',
      'Burnley': 'BUR',
      'West Ham United': 'WHU',
      'Aston Villa': 'AVL',
      'Wolverhampton Wanderers': 'WOL'
    };
    return abbreviations[teamName] || teamName.substring(0, 3).toUpperCase();
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏆 Premonition Competition
          </h1>
          <p className="text-gray-600 text-lg">
            Premier League Prediction Leaderboard • After Matchweek 4
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Score = abs [Prediction - Actual] • Lower Score = More Correct • The (+) and (-) are shown for directionality only.
          </p>
        </div>

        {/* Group Filter Toggle */}
        <GroupToggle 
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
        />

        {/* View Mode Toggle */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex justify-center">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('expanded')}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                  viewMode === 'expanded'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📊 Expanded View
              </button>
              <button
                onClick={() => setViewMode('simplified')}
                className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                  viewMode === 'simplified'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                📋 Simplified View
              </button>
            </div>
          </div>
        </div>

        {/* Compact Top 4 + Last Place */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex justify-center items-center space-x-8 text-sm">
            {(() => {
              // Group results by score to handle ties
              const scoreGroups = {};
              competitionResults.forEach((result, index) => {
                if (index < 8) { // Only consider top 8 for potential top 4 spots
                  const score = result.totalScore;
                  if (!scoreGroups[score]) scoreGroups[score] = [];
                  scoreGroups[score].push(result);
                }
              });
              
              const sortedScores = Object.keys(scoreGroups).map(Number).sort((a, b) => a - b);
              const topPositions = [];
              let currentPosition = 1;
              
              // Build top 4 positions
              for (const score of sortedScores) {
                if (currentPosition <= 4) {
                  topPositions.push({
                    position: currentPosition,
                    people: scoreGroups[score],
                    score: score
                  });
                  currentPosition += scoreGroups[score].length;
                }
              }
              
              const topElements = topPositions.slice(0, 4).map((positionGroup, groupIndex) => (
                <div key={groupIndex} className="text-center">
                  <span className="text-lg">
                    {positionGroup.position === 1 ? '🥇' : positionGroup.position === 2 ? '🥈' : positionGroup.position === 3 ? '🥉' : '🏅'}
                  </span>
                  <div className="font-bold text-xs">
                    {positionGroup.people.map(p => p.name).join(', ')}
                  </div>
                  <div className="text-xs text-gray-500">{positionGroup.score}pts</div>
                </div>
              ));
              
              // Add last place
              const worstScore = Math.max(...competitionResults.map(r => r.totalScore));
              const lastPlacePeople = competitionResults.filter(r => r.totalScore === worstScore);
              
              const lastPlaceElement = (
                <div key="last" className="text-center">
                  <span className="text-lg">💩</span>
                  <div className="font-bold text-xs text-red-600">
                    {lastPlacePeople.map(p => p.name).join(', ')}
                  </div>
                  <div className="text-xs text-red-500">{worstScore}pts</div>
                </div>
              );
              
              return [...topElements, lastPlaceElement];
            })()}
          </div>
        </div>

        {/* Competition Matrix */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className={`text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 ${
                    viewMode === 'expanded' ? 'px-4 py-3 min-w-[60px]' : 'px-2 py-2 min-w-[40px]'
                  }`}>
                    Rank
                  </th>
                  <th className={`text-left font-semibold text-gray-700 sticky bg-gray-50 z-10 ${
                    viewMode === 'expanded' ? 'px-4 py-3 left-16 min-w-[120px]' : 'px-2 py-2 left-12 min-w-[80px]'
                  }`}>
                    Predictor
                  </th>
                  <th className={`text-center font-semibold text-gray-700 sticky bg-gray-50 z-10 ${
                    viewMode === 'expanded' ? 'px-3 py-3 left-40 min-w-[80px]' : 'px-2 py-2 left-24 min-w-[50px]'
                  }`}>
                    Total
                  </th>
                  {teamsInOrder.map(team => (
                    <th key={team.name} className={`text-center font-bold text-gray-700 ${
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
                {competitionResults.map((result, index) => (
                  <tr key={result.name} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className={`font-bold text-gray-900 sticky left-0 bg-inherit z-10 ${
                      viewMode === 'expanded' ? 'px-4 py-3' : 'px-2 py-1'
                    }`}>
                      {index + 1}
                    </td>
                    <td className={`font-semibold text-gray-900 sticky bg-inherit z-10 ${
                      viewMode === 'expanded' ? 'px-4 py-3 left-16' : 'px-2 py-1 left-12 text-sm'
                    }`}>
                      {result.name}
                    </td>
                    <td className={`text-center font-bold sticky bg-inherit z-10 ${
                      viewMode === 'expanded' ? 'px-3 py-3 text-lg left-40' : 'px-2 py-1 text-sm left-24'
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
                                px-1 py-1 rounded text-xs font-bold
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

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">How to Read the Table</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Score Colors:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Perfect prediction (0 points)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span>Close (1-2 points off)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                  <span>Okay (3-5 points off)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span>Way off (6+ points off)</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Cell Format:</h4>
              <div className="text-sm space-y-1">
                <p><strong>+3</strong> (large) = 3 positions too low</p>
                <p><strong>P: LIV 7th</strong> (small) = predicted Liverpool 7th</p>
                <p><strong>0</strong> = Perfect prediction!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Standings Reference */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Current Premier League Table (After MW4)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {teamsInOrder.map(team => (
              <div key={team.name} className="flex items-center space-x-2">
                <span className="font-bold text-gray-600 w-6">{team.position}.</span>
                <span>{team.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompetitionDashboard;