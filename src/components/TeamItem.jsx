// src/components/TeamItem.jsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function TeamItem({ team, position }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Different styling based on position
  const getPositionStyle = (pos) => {
    if (pos <= 4) {
      // Champions League spots
      return 'bg-blue-50 border-l-4 border-l-blue-500'
    } else if (pos <= 6) {
      // Europa League spots
      return 'bg-orange-50 border-l-4 border-l-orange-500'
    } else if (pos <= 7) {
      // Conference League spot
      return 'bg-green-50 border-l-4 border-l-green-500'
    } else if (pos >= 18) {
      // Relegation zone
      return 'bg-red-50 border-l-4 border-l-red-500'
    }
    // Mid-table
    return 'bg-white border-l-4 border-l-gray-200'
  }

  const getPositionBadge = (pos) => {
    if (pos <= 4) return '🏆' // Champions League
    if (pos <= 6) return '🥉' // Europa League
    if (pos <= 7) return '🏅' // Conference League
    if (pos >= 18) return '⬇️' // Relegation
    return '⚽' // Mid-table
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        ${getPositionStyle(position)}
        ${isDragging ? 'opacity-50 shadow-lg z-10' : 'opacity-100'}
        transition-all duration-200 cursor-grab active:cursor-grabbing
        hover:bg-opacity-80
      `}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Position and Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-gray-700 w-6 text-center">
              {position}
            </span>
            <span className="text-lg">
              {getPositionBadge(position)}
            </span>
          </div>
          
          {/* Team Name */}
          <span className="font-medium text-gray-800">
            {team.name}
          </span>
        </div>

        {/* Drag Handle */}
        <div className="text-gray-400 hover:text-gray-600">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default TeamItem