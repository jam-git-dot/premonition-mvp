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

  // Team colors and short names for logos
  const getTeamInfo = (teamId) => {
    const teamData = {
      'arsenal': { colors: 'bg-red-600', short: 'ARS', primary: '#DC143C', secondary: '#FFFFFF' },
      'aston-villa': { colors: 'bg-purple-800', short: 'AVL', primary: '#7B1342', secondary: '#94D3E0' },
      'bournemouth': { colors: 'bg-red-500', short: 'BOU', primary: '#DA020E', secondary: '#000000' },
      'brentford': { colors: 'bg-red-500', short: 'BRE', primary: '#FB0E00', secondary: '#FFF200' },
      'brighton': { colors: 'bg-blue-500', short: 'BRI', primary: '#0057B8', secondary: '#FFCD00' },
      'burnley': { colors: 'bg-purple-900', short: 'BUR', primary: '#6C1D45', secondary: '#99D6EA' },
      'chelsea': { colors: 'bg-blue-600', short: 'CHE', primary: '#034694', secondary: '#FFFFFF' },
      'crystal-palace': { colors: 'bg-blue-800', short: 'CRY', primary: '#1B458F', secondary: '#C4122E' },
      'everton': { colors: 'bg-blue-700', short: 'EVE', primary: '#003399', secondary: '#FFFFFF' },
      'fulham': { colors: 'bg-white border', short: 'FUL', primary: '#FFFFFF', secondary: '#000000' },
      'leeds': { colors: 'bg-white border', short: 'LEE', primary: '#FFFFFF', secondary: '#1D428A' },
      'liverpool': { colors: 'bg-red-700', short: 'LIV', primary: '#C8102E', secondary: '#00B2A9' },
      'man-city': { colors: 'bg-sky-500', short: 'MCI', primary: '#6CABDD', secondary: '#1C2C5B' },
      'man-united': { colors: 'bg-red-600', short: 'MUN', primary: '#DA020E', secondary: '#FBE122' },
      'newcastle': { colors: 'bg-black', short: 'NEW', primary: '#241F20', secondary: '#FFFFFF' },
      'nottingham-forest': { colors: 'bg-red-700', short: 'NFO', primary: '#DD0000', secondary: '#FFFFFF' },
      'sunderland': { colors: 'bg-red-600', short: 'SUN', primary: '#C8102E', secondary: '#FFFFFF' },
      'tottenham': { colors: 'bg-white border', short: 'TOT', primary: '#FFFFFF', secondary: '#132257' },
      'west-ham': { colors: 'bg-purple-900', short: 'WHU', primary: '#7A263A', secondary: '#1BB1E7' },
      'wolves': { colors: 'bg-orange-500', short: 'WOL', primary: '#FDB462', secondary: '#231F20' }
    }
    return teamData[teamId] || { colors: 'bg-gray-500', short: 'TBD', primary: '#6B7280', secondary: '#FFFFFF' }
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

  const getPositionLabel = (pos) => {
    if (pos <= 4) return { emoji: '🏆', text: 'CL' } // Champions League
    if (pos <= 6) return { emoji: '🥉', text: 'EL' } // Europa League
    if (pos <= 7) return { emoji: '🏅', text: 'ECL' } // Conference League
    if (pos >= 18) return { emoji: '⬇️', text: 'REL' } // Relegation
    return null // Mid-table
  }

  const teamInfo = getTeamInfo(team.id)
  const positionLabel = getPositionLabel(position)

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
        {/* Left side: Label + Position + Logo + Team Name */}
        <div className="flex items-center space-x-3">
          {/* Position Label (CL, EL, etc.) - Always reserve space */}
          <div className="flex items-center space-x-1 min-w-[52px]">
            {positionLabel ? (
              <>
                <span className="text-xs font-semibold text-gray-500">
                  {positionLabel.text}
                </span>
                <span className="text-sm">
                  {positionLabel.emoji}
                </span>
              </>
            ) : (
              // Empty space to maintain alignment
              <span className="text-xs">&nbsp;</span>
            )}
          </div>
          
          {/* Position Number */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold text-gray-700 w-6 text-center">
              {position}
            </span>
            
            {/* Team Logo/Badge */}
            <div 
              className={`
                ${teamInfo.colors} 
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${teamInfo.colors.includes('bg-white') ? 'text-gray-800' : 'text-white'}
                shadow-sm
              `}
              style={{
                backgroundColor: teamInfo.primary,
                color: teamInfo.secondary
              }}
            >
              {teamInfo.short}
            </div>
            
            {/* Team Name */}
            <span className="font-medium text-gray-800">
              {team.name}
            </span>
          </div>
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