// src/components/CompetitionDashboard.jsx
import { useState } from 'react'
import { calculateCompetitionScores, getTeamsInTableOrder, currentStandings } from '../data/competitionData'
import { availableGroups } from '../data/competitionData'
import { getGroupData, getTeamAbbreviation } from '../data/groupDataProcessor';

function CompetitionDashboard() {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [viewMode, setViewMode] = useState('simplified'); // 'expanded' or 'simplified'
  const [showScoringModal, setShowScoringModal] = useState(false);
  
  // Matchweek variable for easy updates
  const currentMatchweek = 4;
  
  // Global formatting variables
  const THEME = {
    colors: {
      green: 'text-green-400',        // Overachievers color
      red: 'text-red-400',           // Underachievers color
      darkBlue: 'bg-gray-900',       // Section backgrounds
      lightBlue: 'bg-gray-800',      // Site background
      white: 'text-white',
      grayText: 'text-gray-400'
    },
    fontSizes: {
      title: 'text-4xl',             // Main page title
      subtitle: 'text-lg',           // Section subtitles
      button: 'text-sm',             // Button text
      dataTable: 'text-xs',          // Data table text
      leaderboard: 'text-base'       // Leaderboard text
    },
    fontStyles: {
      titleWeight: 'font-bold',
      subtitleWeight: 'font-semibold',
      buttonWeight: 'font-medium',
      dataWeight: 'font-bold'
    },
    rowTinting: {
      opacity: '0.3',               // Adjustable tint opacity (0.1 = very subtle, 0.5 = strong)
      firstPlace: 'bg-green-600',   // 1st place tint (dark green)
      topFour: 'bg-green-400',      // 2nd, 3rd, 4th place tint (lighter green)
      bottomThree: 'bg-red-500'     // Bottom 3 places tint
    }
  };
  
  // Global team abbreviations dictionary
  const TEAM_ABBREVIATIONS = {
    'Arsenal': 'ARS',
    'Aston Villa': 'AVL', 
    'AFC Bournemouth': 'BOU',
    'Brentford': 'BRE',
    'Brighton & Hove Albion': 'BRI',
    'Burnley': 'BUR',
    'Chelsea': 'CHE',
    'Crystal Palace': 'CRY',
    'Everton': 'EVE',
    'Fulham': 'FUL',
    'Leeds United': 'LEE',
    'Liverpool': 'LIV',
    'Manchester City': 'MCI',
    'Manchester United': 'MUN',
    'Newcastle United': 'NEW',
    'Nottingham Forest': 'NFO',
    'Sunderland': 'SUN',
    'Tottenham Hotspur': 'TOT',
    'West Ham United': 'WHU',
    'Wolverhampton Wanderers': 'WOL'
  };
  
  // Helper function to get team abbreviation
  const getTeamAbbr = (teamName) => {
    return TEAM_ABBREVIATIONS[teamName] || teamName.substring(0, 3).toUpperCase();
  };
  
  // Helper function to get row tinting based on position
  const getRowTint = (position, totalRows, isEvenRow) => {
    const baseGray = isEvenRow ? '#111827' : '#000000'; // gray-900 or black
    const opacity = parseFloat(THEME.rowTinting.opacity);
    
    if (position === 1) {
      // Dark green tint for 1st place
      return isEvenRow ? '#0f2b1a' : '#0a1f12'; // darker green tints
    } else if (position >= 2 && position <= 4) {
      // Lighter green tint for 2nd-4th place  
      return isEvenRow ? '#1a2b1f' : '#12201a'; // lighter green tints
    } else if (position > totalRows - 3) {
      // Red tint: blend red with base color
      return isEvenRow ? '#2b1017' : '#1f0a0f'; // darker red tints
    }
    return baseGray;
  };
  
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
    <div className="min-h-screen bg-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className={`${THEME.fontSizes.title} ${THEME.fontStyles.titleWeight} ${THEME.colors.white} mb-2`}>
            🏆 PREMONITION
          </h1>
          <p className={`${THEME.colors.grayText} ${THEME.fontSizes.subtitle}`}>
            Premier League Prediction Leaderboard • After Matchweek {currentMatchweek}
          </p>
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

        {/* Minimal Vertical Leaderboard - Now with fixed width and improved styling */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-900 rounded-lg shadow-lg p-4 max-w-[450px] w-full">
            {/* Title */}
            <h3 className={`${THEME.fontSizes.subtitle} ${THEME.fontStyles.titleWeight} ${THEME.colors.white} text-center mb-1`}>
              LEADERBOARD
            </h3>
            <div className={`text-center ${THEME.fontSizes.dataTable} ${THEME.colors.grayText} mb-4`}>
              {selectedGroup === 'all' ? 'All Entries' : selectedGroup === 'LIV' ? 'Klopptoberfest' : 'Fantrax FPL'} | MW{currentMatchweek}
            </div>
            
            {/* Compact Table with grouped styling */}
            <div className="space-y-4">
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
                    <div key="winners-header" className="text-center mb-2">
                      <div className={`${THEME.colors.green} ${THEME.fontStyles.titleWeight} ${THEME.fontSizes.leaderboard}`}>WINNERS</div>
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
                          // Determine which row should show position and score
                          const displayIndex = group.people.length % 2 === 0 ? 0 : Math.floor(group.people.length / 2);
                          const showPositionAndScore = personIndex === displayIndex;
                          
                          return (
                            <div key={personIndex} className="flex items-center h-12">
                              <div className="px-3 py-2 rounded font-medium text-white text-base w-[100px] flex items-center justify-center">
                                {showPositionAndScore ? `${positionText} ${emoji}` : ''}
                              </div>
                              <div className="px-3 py-2 rounded font-medium text-white text-base flex-1 mx-2 flex items-center justify-center">
                                {person.isConsensus ? `${person.name} 🤖` : person.name}
                              </div>
                              <div className={`px-3 py-2 rounded font-medium ${showPositionAndScore ? `text-black ${scoreBgColor}` : 'text-transparent'} text-base w-[75px] flex items-center justify-center`}>
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
                  <div key="wankers-header" className="text-center mb-2 mt-6">
                    <div className={`${THEME.colors.red} ${THEME.fontStyles.titleWeight} ${THEME.fontSizes.leaderboard}`}>WANKERS</div>
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
                        <div key={personIndex} className="flex items-center h-12">
                          <div className="px-3 py-2 rounded font-medium text-white text-base w-[100px] flex items-center justify-center">
                            {showPositionAndScore ? `${positionText} ${emoji}` : ''}
                          </div>
                          <div className="px-3 py-2 rounded font-medium text-white text-base flex-1 mx-2 flex items-center justify-center">
                            {person.isConsensus ? `${person.name} 🤖` : person.name}
                          </div>
                          <div className={`px-3 py-2 rounded font-medium ${showPositionAndScore ? `text-black ${scoreBgColor}` : 'text-transparent'} text-base w-[75px] flex items-center justify-center`}>
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

        {/* View Mode Toggle & Scoring Help - Separate Section */}
        <div className="flex justify-center mb-6">
          <div className={`${THEME.colors.darkBlue} rounded-lg shadow-lg p-3 max-w-[450px] w-full`}>
            <div className="flex justify-center gap-2">
              <div className={`${THEME.colors.lightBlue} rounded-lg p-1 flex`}>
                <button
                  onClick={() => setViewMode('expanded')}
                  className={`px-4 py-2 rounded-md ${THEME.fontStyles.buttonWeight} transition-colors ${THEME.fontSizes.button} ${
                    viewMode === 'expanded'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  📊 DETAILED
                </button>
                <button
                  onClick={() => setViewMode('simplified')}
                  className={`px-4 py-2 rounded-md ${THEME.fontStyles.buttonWeight} transition-colors ${THEME.fontSizes.button} ${
                    viewMode === 'simplified'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  📋 SIMPLE
                </button>
              </div>
              <button
                onClick={() => setShowScoringModal(true)}
                className={`${THEME.colors.lightBlue} hover:bg-gray-700 text-gray-300 hover:text-white ${THEME.fontStyles.buttonWeight} py-2 px-3 rounded-md transition-colors ${THEME.fontSizes.button}`}
              >
                ?
              </button>
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
                {enhancedResults.map((result, index) => {
                  const isEvenRow = index % 2 === 0;
                  const tintedBgColor = getRowTint(index + 1, enhancedResults.length, isEvenRow);
                  const baseRowClass = isEvenRow ? 'bg-gray-900' : 'bg-black';
                  
                  // Calculate actual position (handling ties)
                  let actualPosition = null;
                  let showPosition = false;
                  
                  if (index === 0) {
                    // First person is always position 1
                    actualPosition = 1;
                    showPosition = true;
                  } else {
                    // Check if current score is different from previous score
                    const currentScore = result.totalScore;
                    const previousScore = enhancedResults[index - 1].totalScore;
                    
                    if (currentScore !== previousScore) {
                      // Different score = new position
                      actualPosition = index + 1;
                      showPosition = true;
                    } else {
                      // Same score = tied, don't show position
                      showPosition = false;
                    }
                  }
                  
                  return (
                    <tr key={result.name} className={baseRowClass} style={{ backgroundColor: tintedBgColor }}>
                      <td className={`font-bold text-white sticky left-0 z-10 text-xs ${baseRowClass} ${viewMode === 'expanded' ? 'px-2 py-2' : 'px-1 py-2'}`}
                          style={{ backgroundColor: tintedBgColor }}>
                        {showPosition ? actualPosition : ''}
                      </td>
                      <td className={`font-semibold sticky z-10 text-xs ${baseRowClass} ${viewMode === 'expanded' ? 'px-2 py-2 left-8' : 'px-1 py-2 left-6'} ${
                        result.isConsensus ? 'text-blue-400' : 'text-white'
                      }`}
                          style={{ backgroundColor: tintedBgColor }}>
                        {result.isConsensus ? `${result.name} 🤖` : result.name}
                      </td>
                      <td className={`text-center font-bold sticky z-10 text-xs ${baseRowClass} ${viewMode === 'expanded' ? 'px-2 py-2 left-32' : 'px-1 py-2 left-24'} ${
                        result.isConsensus ? 'text-blue-400' : 'text-white'
                      }`}
                          style={{ backgroundColor: tintedBgColor }}>
                        {result.totalScore}
                      </td>
                      {teamsInOrder.map(team => {
                        const teamData = result.teamScores[team.name];
                        return (
                          <td key={team.name} className={viewMode === 'expanded' ? 'px-1 py-2 text-center' : 'px-0 py-2 text-center'}>
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
                  );
                })}
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
          <div className="overflow-x-auto max-w-[675px] mx-auto">
            <table className="w-full">
              <thead className={`${THEME.colors.lightBlue}`}>
                <tr>
                  <th className={`px-3 py-2 text-left ${THEME.fontSizes.dataTable} ${THEME.fontStyles.buttonWeight} ${THEME.colors.white}`}>Pos</th>
                  <th className={`px-3 py-2 text-left ${THEME.fontSizes.dataTable} ${THEME.fontStyles.buttonWeight} ${THEME.colors.white}`}>Team</th>
                  <th className={`px-3 py-2 text-center ${THEME.fontSizes.dataTable} ${THEME.fontStyles.buttonWeight} ${THEME.colors.white}`}>Group Prediction</th>
                  <th className={`px-3 py-2 text-center ${THEME.fontSizes.dataTable} ${THEME.fontStyles.buttonWeight} ${THEME.colors.white}`}>Range (μ ± 1σ)</th>
                  <th className={`px-3 py-2 text-center ${THEME.fontSizes.dataTable} ${THEME.fontStyles.buttonWeight} ${THEME.colors.white}`}>Group Average</th>
                  <th className={`px-3 py-2 text-center ${THEME.fontSizes.dataTable} ${THEME.fontStyles.buttonWeight} ${THEME.colors.white}`}>Median</th>
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
                    <tr key={team.name} className={index % 2 === 0 ? `${THEME.colors.lightBlue}` : `${THEME.colors.darkBlue}`}>
                      <td className={`px-3 py-2 ${THEME.fontSizes.dataTable} ${THEME.fontStyles.titleWeight} ${THEME.colors.white}`}>{team.position}</td>
                      <td className={`px-3 py-2 ${THEME.fontSizes.dataTable} ${THEME.fontStyles.buttonWeight} ${THEME.colors.white}`}>
                        {getTeamAbbr(team.name)}
                        {overachiever && (
                          <span className={`${THEME.colors.green} ml-1`}>({Math.abs(overachiever.delta)})</span>
                        )}
                        {underachiever && (
                          <span className={`${THEME.colors.red} ml-1`}>({Math.abs(underachiever.delta)})</span>
                        )}
                      </td>
                      <td className={`px-3 py-2 text-center ${THEME.fontSizes.dataTable}`}>
                        {groupPredictionRank ? (
                          <div>
                            <div className={`${THEME.fontStyles.buttonWeight} ${getAccuracyColor()}`}>
                              {getOrdinal(groupPredictionRank)}
                            </div>
                            <div className={`${THEME.fontSizes.dataTable} text-gray-500 italic`}>
                              (In {getOrdinal(currentPos)}, <strong>Δ{delta}</strong>)
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className={`px-3 py-2 text-center ${THEME.fontSizes.dataTable} text-gray-300`}>{rangeDisplay}</td>
                      <td className={`px-3 py-2 text-center ${THEME.fontSizes.dataTable} text-gray-300`}>{stats.mean || 'N/A'}</td>
                      <td className={`px-3 py-2 text-center ${THEME.fontSizes.dataTable} text-gray-300`}>{stats.median || 'N/A'}</td>
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