// src/lib/theme.js
// Shared theme constants for the competition dashboard

export const THEME = {
  colors: {
    green: 'text-green-400',
    red: 'text-red-400',
    darkBlue: 'bg-gray-900',
    lightBlue: 'bg-gray-800',
    white: 'text-white',
    grayText: 'text-gray-400'
  },
  // UI Component colors (used by Item, Button, DropdownMenu)
  ui: {
    // Item component
    itemBackground: 'bg-gray-900',       // Dark container background
    itemBorder: 'border-gray-700',       // Subtle border for containers
    itemMutedBackground: 'bg-gray-800/50', // Muted variant background
    // Button (item variant)
    buttonBackground: 'bg-gray-800',     // Button background
    buttonBorder: 'border-gray-600',     // Button border (lighter than container)
    buttonText: 'text-white',            // Button text
    buttonHover: 'hover:bg-gray-700',    // Button hover state
    // Dropdown
    dropdownBackground: 'bg-gray-900',   // Dropdown menu background
    dropdownBorder: 'border-gray-700',   // Dropdown border
    dropdownItemHover: 'hover:bg-gray-800', // Dropdown item hover
  },
  fontSizes: {
    title: 'text-4xl',
    subtitle: 'text-lg',
    button: 'text-sm',
    dataTable: 'text-xs',
    leaderboard: 'text-base'
  },
  fontStyles: {
    titleWeight: 'font-bold',
    subtitleWeight: 'font-semibold',
    buttonWeight: 'font-medium',
    dataWeight: 'font-bold'
  },
  controls: {
    padding: 'px-4 py-2',
    marginX: 'mx-2'
  },
  rowTinting: {
    opacity: '0.3',
    firstPlace: 'bg-green-600',
    topFour: 'bg-green-400',
    bottomThree: 'bg-red-500'
  }
};

// Helper function to get row tinting based on position
export const getRowTint = (position, totalRows, isEvenRow) => {
  const baseGray = isEvenRow ? '#111827' : '#000000';

  if (position === 1) {
    return isEvenRow ? '#0f2b1a' : '#0a1f12';
  } else if (position >= 2 && position <= 4) {
    return isEvenRow ? '#1a2b1f' : '#12201a';
  } else if (position > totalRows - 3) {
    return isEvenRow ? '#2b1017' : '#1f0a0f';
  }
  return baseGray;
};

// Helper function to get cell styling based on score
export const getCellStyle = (score) => {
  if (score === 0) return 'bg-green-600 text-white font-bold';
  if (score <= 1) return 'bg-green-800 text-green-300 font-bold';
  if (score <= 3) return 'bg-yellow-800 text-yellow-300 font-bold';
  if (score === 4) return 'bg-yellow-800 text-yellow-300 font-bold';
  if (score <= 6) return 'bg-orange-800 text-orange-300 font-bold';
  return 'bg-red-900 text-red-300 font-bold';
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
