// src/components/GroupToggle.jsx
import { availableGroups } from '../data/competitionData'
import { Button } from './ui/button'

function GroupToggle({ selectedGroup, onGroupChange }) {
  // Filter out FPL for now as requested
  const visibleGroups = availableGroups.filter(group => group.id !== 'FPL');

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {visibleGroups.map(group => (
          <Button
            key={group.id}
            onClick={() => onGroupChange(group.id)}
            variant={selectedGroup === group.id ? 'toggleActive' : 'toggleInactive'}
            size="sm"
            className={selectedGroup === group.id ? 'scale-105' : ''}
          >
            {group.name}
            <span className="ml-2 opacity-75">
              ({group.count})
            </span>
          </Button>
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