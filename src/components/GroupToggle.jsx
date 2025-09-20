// src/components/GroupToggle.jsx
import { availableGroups } from '../data/competitionData'

function GroupToggle({ selectedGroup, onGroupChange }) {
  // Filter out FPL for now as requested
  const visibleGroups = availableGroups.filter(group => group.id !== 'FPL');

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {visibleGroups.map(group => (
          <button
            key={group.id}
            onClick={() => onGroupChange(group.id)}
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
      
      {/* Group description */}
      <div className="mt-2 text-left text-sm text-gray-600">
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
  );
}

export default GroupToggle;