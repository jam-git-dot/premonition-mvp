// src/components/CellPopup.jsx
import React from 'react';
import { getTeamColorClasses, getTeamAbbreviation } from '../data/teamInfo';

function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export default function CellPopup({ info, onClose }) {
  const { x, y, userName, teamName, score, predictedPosition, currentPosition, stats, higherCount, worseCount, rangeRadius } = info;
  const style = {
    position: 'absolute',
    top: y + 5,
    left: x + 5,
    zIndex: 999,
  };
  return (
    <div style={style} className={`rounded-lg shadow-lg p-4 w-64 ${getTeamColorClasses(teamName)} bg-opacity-75`}>  
      {/* Header row */}
      <div className="flex justify-between items-center mb-1">
        <div className="font-bold text-lg text-white truncate">{userName}</div>
        <div className="font-bold text-lg text-white">{getTeamAbbreviation(teamName)}</div>
        <div className="font-bold text-lg text-white">{score >= 0 ? `+${score}` : score}</div>
      </div>
      {/* Predicted / Group / Now section */}
      <div className="text-sm text-white font-medium mb-1">PRDCT</div>
      <div className="flex justify-between items-center text-white mb-1">
        <div className="font-bold">{predictedPosition}{getOrdinalSuffix(predictedPosition)}</div>
        <div className="font-bold mx-auto">GROUP</div>
        <div className="font-bold text-right">NOW</div>
      </div>
      <div className="flex justify-between items-center text-white mb-2">
        <div>{predictedPosition}{getOrdinalSuffix(predictedPosition)}</div>
        <div className="mx-auto">{stats.consensusRank}{rangeRadius ? ` (+/- ${rangeRadius})` : ''}</div>
        <div className="text-right">{currentPosition}{getOrdinalSuffix(currentPosition)}</div>
      </div>
      {/* Higher/lower text commented out until next iteration */}
      { /* <div className="text-sm text-white">
        <p>{higherCount} people ranked {teamName} higher than {userName}</p>
        <p>{worseCount} people ranked {teamName} lower than {userName}</p>
      </div> */ }
     </div>
   );
}
