// src/components/ResultsTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { THEME, getRowTint, getCellStyle } from '../lib/theme';
import { getTeamAbbreviation } from '../data/teamInfo';

const ResultsTable = React.memo(function ResultsTable({
  enhancedResults,
  teamsInOrder,
  onCellClick,
  onNameClick
}) {
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
    <div className="bg-black rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black border-b border-gray-800 sticky top-0 z-30">
            <tr>
              <th className="font-bold text-white sticky left-0 bg-black z-40 text-xs px-1 py-1">
                #
              </th>
              <th className="font-bold text-white sticky bg-black z-40 text-xs px-1 py-1 left-6">
                Name
              </th>
              <th className="font-bold text-white sticky bg-black z-40 text-xs px-1 py-1 left-24">
                Total
              </th>
              {teamsInOrder.map(team => (
                <th key={team.name} className="font-bold text-white sticky top-0 bg-black z-30 px-1 py-2 text-xs min-w-[35px]">
                  <div className="flex flex-col items-center">
                    <div className="font-bold text-white text-xs">
                      {getTeamAbbreviation(team.name)}
                    </div>
                    <div className="text-gray-500 mt-1 text-xs">
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
                  <td className={`font-bold text-white sticky left-0 z-10 text-xs ${baseRowClass} px-1 py-2`}
                      style={{ backgroundColor: tintedBgColor }}>
                    {showPosition ? actualPosition : ''}
                  </td>
                  <td
                    onClick={() => onNameClick(result.name)}
                    className={`cursor-pointer font-semibold sticky z-10 text-xs ${baseRowClass} px-1 py-2 left-6 ${
                      result.isConsensus ? 'text-blue-400' : 'text-white'
                    }`}
                      style={{ backgroundColor: tintedBgColor }}
                  >
                    {result.isConsensus ? `${result.name} 🤖` : result.name}
                  </td>
                  <td className={`text-center font-bold sticky z-10 text-xs ${baseRowClass} px-1 py-2 left-24 ${
                    result.isConsensus ? 'text-blue-400' : 'text-white'
                  }`}
                      style={{ backgroundColor: tintedBgColor }}>
                    {result.totalScore}
                  </td>
                  {teamsInOrder.map(team => {
                    const teamData = result.teamScores[team.name];
                    return (
                      <td key={team.name} className="px-0 py-2 text-center" onClick={(e) => onCellClick(result.name, team.name, e)}>
                        {teamData ? (
                          <div className={`px-1 py-1 mx-0.5 my-0.5 rounded text-xs font-bold ${getCellStyle(teamData.score)}`}>
                            {formatCellContent(teamData, team.name).score}
                          </div>
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
  );
});

ResultsTable.propTypes = {
  enhancedResults: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    totalScore: PropTypes.number.isRequired,
    teamScores: PropTypes.objectOf(PropTypes.shape({
      score: PropTypes.number.isRequired,
      predictedPosition: PropTypes.number.isRequired,
      actualPosition: PropTypes.number.isRequired,
      difference: PropTypes.number.isRequired
    })).isRequired
  })).isRequired,
  teamsInOrder: PropTypes.arrayOf(PropTypes.shape({
    position: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  onCellClick: PropTypes.func.isRequired,
  onNameClick: PropTypes.func.isRequired
};

export default ResultsTable;