// src/components/ModeToggle.jsx
import { Button } from './ui/button'

function ModeToggle({ currentMode, onModeChange }) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
        <Button
          onClick={() => onModeChange('prediction')}
          variant={currentMode === 'prediction' ? 'toggleActive' : 'toggleInactive'}
          size="default"
        >
          Make Predictions
        </Button>
        <Button
          onClick={() => onModeChange('dashboard')}
          variant={currentMode === 'dashboard' ? 'toggleActive' : 'toggleInactive'}
          size="default"
        >
          View Dashboard
        </Button>
      </div>
    </div>
  )
}

export default ModeToggle