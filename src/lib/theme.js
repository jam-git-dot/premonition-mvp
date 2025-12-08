// src/lib/theme.js
// Shared theme constants for the competition dashboard

// Shared layout constants
export const LEADERBOARD_CONTAINER_HEIGHT = 380; // Total height of leaderboard container in pixels (enough for all content)

export const THEME = {
  colors: {
    green: 'text-green-400',        // Overachievers color
    red: 'text-red-400',           // Underachievers color
    darkBlue: 'bg-gray-900',       // Section backgrounds
    lightBlue: 'bg-gray-800',      // Site background
    white: 'text-white',
    grayText: 'text-gray-400'
  },
  fontSizes: {
    title: 'text-4xl',             // Main page title
    subtitle: 'text-lg',           // Section subtitles
    button: 'text-sm',             // Button text
    dataTable: 'text-xs',          // Data table text
    leaderboard: 'text-base'       // Leaderboard text
  },
  fontStyles: {
    titleWeight: 'font-bold',
    subtitleWeight: 'font-semibold',
    buttonWeight: 'font-medium',
    dataWeight: 'font-bold'
  },
  controls: {
    padding: 'px-4 py-2',          // uniform button padding
    marginX: 'mx-2'                // horizontal spacing between controls
  },
  rowTinting: {
    opacity: '0.3',
    firstPlace: 'bg-green-600',
    topFour: 'bg-green-400',
    bottomThree: 'bg-red-500'
  },
  prominentButton: {
    base: 'w-full max-w-[450px] bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all transform flex items-center justify-center gap-3',
    hover: 'hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02]',
    text: {
      main: 'text-lg',
      subtitle: 'text-sm font-normal opacity-90'
    }
  }
};

// Helper function to get row tinting based on position
export const getRowTint = (position, totalRows, isEvenRow) => {
  const baseGray = isEvenRow ? '#111827' : '#000000'; // gray-900 or black

  if (position === 1) {
    // Dark green tint for 1st place
    return isEvenRow ? '#0f2b1a' : '#0a1f12'; // darker green tints
  } else if (position >= 2 && position <= 4) {
    // Lighter green tint for 2nd-4th place
    return isEvenRow ? '#1a2b1f' : '#12201a'; // lighter green tints
  } else if (position > totalRows - 3) {
    // Red tint: blend red with base color
    return isEvenRow ? '#2b1017' : '#1f0a0f'; // darker red tints
  }
  return baseGray;
};

// Helper function to get cell styling based on score - matching screenshot exactly
export const getCellStyle = (score) => {
  if (score === 0) return 'bg-green-600 text-white font-bold'; // Perfect prediction - darker green with white text
  if (score <= 1) return 'bg-green-800 text-green-300 font-bold'; // ±1 - dark green with light green text
  if (score <= 3) return 'bg-yellow-800 text-yellow-300 font-bold'; // ±2-3 - dark yellow with light yellow text
  if (score === 4) return 'bg-yellow-800 text-yellow-300 font-bold'; // 4 - same dark yellow
  if (score <= 6) return 'bg-orange-800 text-orange-300 font-bold'; // 5-6 - dark orange with light orange text
  return 'bg-red-900 text-red-300 font-bold'; // 7+ - dark red with light red text
};

// Helper function to get ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
export const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};