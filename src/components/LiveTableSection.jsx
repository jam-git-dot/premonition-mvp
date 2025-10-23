// src/components/LiveTableSection.jsx
import React from 'react';
import { THEME, getOrdinalSuffix } from '../lib/theme';
import { getTeamAbbreviation } from '../data/teamInfo';

const LiveTableSection = React.memo(function LiveTableSection({
  groupData,
  teamsInOrder
}) {
  return (
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

          {/* Paired Over/Under achiever rows */}
          {(() => {
            const overachievers = groupData.overachievers || [];
            const underachievers = groupData.underachievers || [];
            const maxRows = Math.max(overachievers.length, underachievers.length);
            // Map directly without IIFE wrapper
            return [...Array(maxRows).keys()].map(index => {
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
                    ) : <div className="min-h-[75px]"></div>}
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
                    ) : <div className="min-h-[75px]"></div>}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Detailed Group Statistics Table - Now with improved styling and color coding */}
      <div className="p-4 bg-gray-800">
        <div className="max-w-2xl mx-auto">
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

                // Format range display
                const rangeDisplay = (stats.rangeHigh !== null && stats.rangeLow !== null)
                  ? `${stats.rangeHigh}-${stats.rangeLow}`
                  : 'N/A';

                return (
                  <tr key={team.name} className={index % 2 === 0 ? `${THEME.colors.lightBlue}` : `${THEME.colors.darkBlue}`}>
                    <td className={`px-3 py-2 ${THEME.fontSizes.dataTable} ${THEME.fontStyles.titleWeight} ${THEME.colors.white}`}>{team.position}</td>
                    <td className={`px-3 py-2 ${THEME.fontSizes.dataTable} ${THEME.fontStyles.buttonWeight} ${THEME.colors.white}`}>
                      {getTeamAbbreviation(team.name)}
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
                            {`${groupPredictionRank}${getOrdinalSuffix(groupPredictionRank)}`}
                        </div>
                        <div className={`${THEME.fontSizes.dataTable} text-gray-500 italic`}>
                          (In {`${currentPos}${getOrdinalSuffix(currentPos)}`}, <strong>Δ{delta}</strong>)
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
    </div>
  );
});

export default LiveTableSection;