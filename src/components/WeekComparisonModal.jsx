// src/components/WeekComparisonModal.jsx
import { useState, useEffect } from 'react';
import { compareWeeks, getBiggestMovers, getBiggestImprovers, getBiggestDecliners } from '../utils/weekComparison';
import { THEME } from '../lib/theme';

function WeekComparisonModal({ weekA, weekB, selectedGroup, onClose }) {
  const [comparisons, setComparisons] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadComparison() {
      try {
        setLoading(true);
        const result = await compareWeeks(weekA, weekB, selectedGroup);
        setComparisons(result);
        setError(result ? null : 'No data available');
      } catch (err) {
        console.error('Error loading comparison:', err);
        setError('Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    }

    loadComparison();
  }, [weekA, weekB, selectedGroup]);

  if (loading || !comparisons) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Week Comparison</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          {loading ? (
            <p className="text-gray-300">Loading comparison data...</p>
          ) : (
            <p className="text-gray-300">{error || 'No data available for comparison.'}</p>
          )}
        </div>
      </div>
    );
  }

  const biggestMovers = getBiggestMovers(comparisons, 3);
  const biggestImprovers = getBiggestImprovers(comparisons, 3);
  const biggestDecliners = getBiggestDecliners(comparisons, 3);

  const groupText = selectedGroup === 'all' ? 'All Players' : selectedGroup;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 pb-4 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-3xl">📊</span>
                Week-Over-Week Comparison
              </h3>
              <p className="text-gray-400 mt-1">
                Gameweek {weekA} → Gameweek {weekB} • {groupText}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Highlights Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Biggest Movers */}
            {biggestMovers.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  🎯 Biggest Position Changes
                </h4>
                <div className="space-y-2">
                  {biggestMovers.map((player, i) => (
                    <div key={player.name} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{player.name}</span>
                        <span className={`font-bold ${player.positionChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {player.positionChange > 0 ? '↑' : '↓'}{Math.abs(player.positionChange)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Biggest Improvers */}
            {biggestImprovers.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  📉 Biggest Improvements
                </h4>
                <p className="text-xs text-gray-400 mb-2">(Lower Score = Better)</p>
                <div className="space-y-2">
                  {biggestImprovers.map((player, i) => (
                    <div key={player.name} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{player.name}</span>
                        <span className="font-bold text-green-400">
                          {player.scoreChange}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Biggest Decliners */}
            {biggestDecliners.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  📈 Biggest Declines
                </h4>
                <p className="text-xs text-gray-400 mb-2">(Higher Score = Worse)</p>
                <div className="space-y-2">
                  {biggestDecliners.map((player, i) => (
                    <div key={player.name} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{player.name}</span>
                        <span className="font-bold text-red-400">
                          +{player.scoreChange}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Full Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-white font-bold">Rank</th>
                    <th className="px-4 py-3 text-left text-white font-bold">Player</th>
                    <th className="px-4 py-3 text-center text-white font-bold">Score</th>
                    <th className="px-4 py-3 text-center text-white font-bold">Prev Rank</th>
                    <th className="px-4 py-3 text-center text-white font-bold">Prev Score</th>
                    <th className="px-4 py-3 text-center text-white font-bold">Δ Rank</th>
                    <th className="px-4 py-3 text-center text-white font-bold">Δ Score</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((player, index) => (
                    <tr
                      key={player.name}
                      className={`border-b border-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}`}
                    >
                      <td className="px-4 py-3 text-white font-bold">{player.currentPosition}</td>
                      <td className="px-4 py-3 text-gray-200">{player.name}</td>
                      <td className="px-4 py-3 text-center text-white font-bold">{player.currentScore}</td>
                      <td className="px-4 py-3 text-center text-gray-400">
                        {player.previousPosition ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-400">
                        {player.previousScore ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {player.positionChange === null ? (
                          <span className="text-gray-500">-</span>
                        ) : player.positionChange === 0 ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className={`font-bold ${player.positionChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {player.positionChange > 0 ? '↑' : '↓'}{Math.abs(player.positionChange)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {player.scoreChange === null ? (
                          <span className="text-gray-500">-</span>
                        ) : player.scoreChange === 0 ? (
                          <span className="text-gray-400">0</span>
                        ) : (
                          <span className={`font-bold ${player.scoreChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {player.scoreChange > 0 ? '+' : ''}{player.scoreChange}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeekComparisonModal;
