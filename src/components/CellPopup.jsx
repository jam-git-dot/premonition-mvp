// src/components/CellPopup.jsx
import React, { useEffect } from 'react';
import { getTeamColorClasses, getTeamAbbreviation } from '../data/teamInfo';
import { getOrdinalSuffix } from '../lib/theme';

export default function CellPopup({ info, onClose }) {
  const { x, y, userName, teamName, score, predictedPosition, currentPosition, stats } = info;

  // Calculate cell-pinned positioning
  const getCellPinnedPosition = () => {
    const popupWidth = Math.min(450, window.innerWidth - 40); // Mobile-friendly max width
    const popupHeight = 220;
    const margin = 20;
    const cellSize = 35;

    let left = x + cellSize + 10;
    let top = y - popupHeight / 2;

    if (left + popupWidth > window.innerWidth - margin) {
      left = x - popupWidth - 10;
    }

    if (top + popupHeight > window.innerHeight - margin) {
      top = y - popupHeight + cellSize;
    }

    if (top < margin) {
      top = y + cellSize + 10;
    }

    left = Math.max(margin, Math.min(left, window.innerWidth - popupWidth - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - popupHeight - margin));

    return { left, top, width: popupWidth };
  };

  const { left, top, width } = getCellPinnedPosition();

  // Close handlers
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e) => {
      if (!e.target.closest('.cell-popup')) onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const difference = predictedPosition - currentPosition;
  const isGoodPrediction = Math.abs(difference) <= 2;

  // Create beeswarm data
  const createBeeswarmData = () => {
    if (!stats?.allPredictions) return { densityPoints: [], userX: 0, actualX: 0, groupX: 0 };

    const allPreds = stats.allPredictions;
    const plotWidth = width - 60; // Plot width (responsive)
    const plotLeft = 30; // Left margin

    // Count predictions at each position
    const positionCounts = {};
    for (let i = 1; i <= 20; i++) {
      positionCounts[i] = allPreds.filter(p => p === i).length;
    }

    // Create density curve points
    const densityPoints = [];
    const maxCount = Math.max(...Object.values(positionCounts));

    for (let i = 1; i <= 20; i++) {
      const count = positionCounts[i] || 0;
      const x = plotLeft + ((i - 1) / 19) * plotWidth;
      const height = maxCount > 0 ? (count / maxCount) * 40 : 0; // Max height of 40px (doubled)
      densityPoints.push({ position: i, x, height, count });
    }

    // Calculate positions
    const userX = plotLeft + ((predictedPosition - 1) / 19) * plotWidth;
    const actualX = plotLeft + ((currentPosition - 1) / 19) * plotWidth;
    const groupMean = stats?.mean || null;
    const groupX = groupMean ? plotLeft + ((groupMean - 1) / 19) * plotWidth : null;

    return { densityPoints, userX, actualX, groupX };
  };

  const { densityPoints, userX, actualX, groupX } = createBeeswarmData();

  // Create smooth path for beeswarm
  const createSmoothPath = () => {
    if (densityPoints.length === 0) return '';

    const baseY = 100; // Base line Y position (moved down for taller plot)
    let path = `M ${densityPoints[0].x} ${baseY}`;

    densityPoints.forEach((point, i) => {
      const y = baseY - point.height;
      if (i === 0) {
        path += ` L ${point.x} ${y}`;
      } else {
        // Smooth curve to this point
        const prevPoint = densityPoints[i - 1];
        const cpX1 = prevPoint.x + (point.x - prevPoint.x) * 0.3;
        const cpY1 = baseY - prevPoint.height;
        const cpX2 = point.x - (point.x - prevPoint.x) * 0.3;
        const cpY2 = y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${y}`;
      }
    });

    // Close the path along the baseline
    path += ` L ${densityPoints[densityPoints.length - 1].x} ${baseY}`;
    path += ` L ${densityPoints[0].x} ${baseY} Z`;

    return path;
  };

  const smoothPath = createSmoothPath();

  // Calculate prediction counts
  const getPredictionCounts = () => {
    if (!stats?.allPredictions) return null;
    const userPred = predictedPosition;
    const higher = stats.allPredictions.filter(p => p < userPred).length;
    const same = stats.allPredictions.filter(p => p === userPred).length;
    const lower = stats.allPredictions.filter(p => p > userPred).length;
    return { higher, same, lower };
  };

  const counts = getPredictionCounts();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={onClose} />

      {/* Popup */}
      <div
        className="cell-popup fixed z-50 bg-gray-900 border-2 border-gray-600 rounded-lg shadow-xl"
        style={{
          left: left,
          top: top,
          width: `${width}px`
        }}
      >
        {/* Header */}
        <div className="p-2 rounded-t-lg bg-gray-700" style={{ backgroundColor: 'rgb(55, 65, 81)' }}>
          <div className="flex justify-between items-center text-white">
            <div className="font-bold text-sm truncate flex-1">{userName}</div>
            <div className="font-bold text-lg mx-2">{getTeamAbbreviation(teamName)}</div>
            <div className={`text-lg font-bold ${isGoodPrediction ? 'text-green-200' : 'text-red-200'}`}>
              {difference > 0 ? `+${difference}` : difference}
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-300 text-lg font-bold ml-2">
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 bg-gray-900 text-white rounded-b-lg">
          {/* Beeswarm Plot */}
          <div className="mb-3">
            <div className="relative h-32 bg-gray-800 rounded"> {/* 3x taller: h-20 -> h-32 */}
              {/* SVG for smooth beeswarm */}
              <svg className="absolute inset-0 w-full h-full">
                {/* Group average line (behind beeswarm) */}
                {groupX && (
                  <line
                    x1={groupX}
                    y1="20"
                    x2={groupX}
                    y2="110"
                    stroke="rgba(156, 163, 175, 0.4)"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                )}

                {/* Smooth density curve */}
                <path
                  d={smoothPath}
                  fill="rgba(156, 163, 175, 0.3)"
                  stroke="rgba(156, 163, 175, 0.6)"
                  strokeWidth="1"
                />

                {/* User prediction vertical line */}
                <line
                  x1={userX}
                  y1="20"
                  x2={userX}
                  y2="110"
                  stroke="rgb(255, 255, 255)"
                  strokeWidth="2"
                />

                {/* User rank - rotated vertically along the line */}
                <text
                  x={userX - 8}
                  y="65"
                  textAnchor="middle"
                  fill="rgb(255, 255, 255)"
                  fontSize="10"
                  fontWeight="bold"
                  transform={`rotate(-90, ${userX - 8}, 65)`}
                >
                  {predictedPosition}{getOrdinalSuffix(predictedPosition)}
                </text>

                {/* Actual position vertical line */}
                <line
                  x1={actualX}
                  y1="20"
                  x2={actualX}
                  y2="110"
                  stroke="rgb(249, 115, 22)"
                  strokeWidth="2"
                />

                {/* Team abbreviation - in middle of actual line */}
                <rect
                  x={actualX - 15}
                  y="58"
                  width="30"
                  height="14"
                  fill="rgb(55, 65, 81)"
                  stroke="rgb(249, 115, 22)"
                  strokeWidth="1"
                  rx="2"
                />
                <text
                  x={actualX}
                  y="68"
                  textAnchor="middle"
                  fill="rgb(249, 115, 22)"
                  fontSize="10"
                  fontWeight="bold"
                >
                  {getTeamAbbreviation(teamName)}
                </text>

                {/* Group average label - rotated on other side */}
                {groupX && (
                  <text
                    x={groupX + 8}
                    y="65"
                    textAnchor="middle"
                    fill="rgba(156, 163, 175, 0.8)"
                    fontSize="9"
                    fontWeight="normal"
                    transform={`rotate(90, ${groupX + 8}, 65)`}
                  >
                    Avg
                  </text>
                )}
              </svg>

              {/* Scale labels at bottom */}
              <div className="absolute bottom-1 left-0 right-0 flex justify-between text-xs text-gray-500 px-8">
                <span>1st</span>
                <span>10th</span>
                <span>20th</span>
              </div>
            </div>
          </div>

          {/* Prediction counts */}
          {counts && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-800 rounded p-2">
              <div>
                <div className="font-bold text-green-400">{counts.higher}</div>
                <div className="text-gray-400">Higher</div>
              </div>
              <div>
                <div className="font-bold text-blue-400">{counts.same}</div>
                <div className="text-gray-400">Same</div>
              </div>
              <div>
                <div className="font-bold text-red-400">{counts.lower}</div>
                <div className="text-gray-400">Lower</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}