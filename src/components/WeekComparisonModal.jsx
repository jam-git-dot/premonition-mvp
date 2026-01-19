// src/components/WeekComparisonModal.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { compareWeeks, getBiggestMovers, getBiggestImprovers, getBiggestDecliners } from '../utils/weekComparison';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

  const groupText = selectedGroup === 'all' ? 'All Players' : selectedGroup;

  // Loading/error state
  if (loading || !comparisons) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Week Comparison</DialogTitle>
          </DialogHeader>
          {loading ? (
            <p className="text-gray-300">Loading comparison data...</p>
          ) : (
            <p className="text-gray-300">{error || 'No data available for comparison.'}</p>
          )}
          <DialogFooter>
            <DialogClose onClick={onClose}>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const biggestMovers = getBiggestMovers(comparisons, 3);
  const biggestImprovers = getBiggestImprovers(comparisons, 3);
  const biggestDecliners = getBiggestDecliners(comparisons, 3);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Week-Over-Week Comparison
          </DialogTitle>
          <p className="text-gray-400 mt-1">
            Gameweek {weekA} → Gameweek {weekB} • {groupText}
          </p>
        </DialogHeader>

        {/* Highlights Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Biggest Movers */}
          {biggestMovers.length > 0 && (
            <Card className="p-4 bg-gray-800 border-gray-700">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                Biggest Position Changes
              </h4>
              <div className="space-y-2">
                {biggestMovers.map((player) => (
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
            </Card>
          )}

          {/* Biggest Improvers */}
          {biggestImprovers.length > 0 && (
            <Card className="p-4 bg-gray-800 border-gray-700">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                Biggest Improvements
              </h4>
              <p className="text-xs text-gray-400 mb-2">(Lower Score = Better)</p>
              <div className="space-y-2">
                {biggestImprovers.map((player) => (
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
            </Card>
          )}

          {/* Biggest Decliners */}
          {biggestDecliners.length > 0 && (
            <Card className="p-4 bg-gray-800 border-gray-700">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                Biggest Declines
              </h4>
              <p className="text-xs text-gray-400 mb-2">(Higher Score = Worse)</p>
              <div className="space-y-2">
                {biggestDecliners.map((player) => (
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
            </Card>
          )}
        </div>

        {/* Full Table */}
        <Card className="bg-gray-800 border-gray-700 overflow-hidden">
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
        </Card>

        <DialogFooter className="mt-6">
          <DialogClose onClick={onClose}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

WeekComparisonModal.propTypes = {
  weekA: PropTypes.number.isRequired,
  weekB: PropTypes.number.isRequired,
  selectedGroup: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default WeekComparisonModal;
