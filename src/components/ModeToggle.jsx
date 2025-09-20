// src/components/ModeToggle.jsx
import { useState } from 'react'

function ModeToggle({ currentMode, onModeChange }) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-gray-100 rounded-lg p-1 flex">
        <button
          onClick={() => onModeChange('prediction')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            currentMode === 'prediction'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📝 Make Predictions
        </button>
        <button
          onClick={() => onModeChange('dashboard')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            currentMode === 'dashboard'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📊 View Dashboard
        </button>
      </div>
    </div>
  )
}

export default ModeToggle