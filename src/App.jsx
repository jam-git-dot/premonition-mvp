// src/App.jsx
import { useState } from 'react'
import { premierLeagueTeams } from './data/teams'
import TeamList from './components/TeamList'

function App() {
  const [userName, setUserName] = useState('')
  const [rankings, setRankings] = useState(premierLeagueTeams)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!userName.trim()) {
      alert('Please enter your name!')
      return
    }

    const submission = {
      name: userName,
      rankings: rankings.map(team => team.name),
      group: 'dev',
      timestamp: new Date().toISOString()
    }

    console.log('Submission:', submission)
    
    // TODO: Send to backend
    // For now, just show success message
    setIsSubmitted(true)
    
    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
    }, 3000)
  }

  const handleReset = () => {
    setUserName('')
    setRankings(premierLeagueTeams)
    setIsSubmitted(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-4 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ⚽ Premonition
          </h1>
          <p className="text-gray-600 text-sm">
            Predict the 2025-26 Premier League final table
          </p>
        </div>

        {/* Success Message */}
        {isSubmitted && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
            🎉 Prediction submitted successfully!
          </div>
        )}

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong> Drag and drop the teams below to predict the final Premier League table. Position 1 = Champions, Position 20 = Relegated.
          </p>
        </div>

        {/* Team List */}
        <TeamList 
          teams={rankings} 
          setTeams={setRankings}
        />

        {/* Submit Section */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleSubmit}
            disabled={!userName.trim() || isSubmitted}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            {isSubmitted ? '✓ Submitted!' : 'Submit Prediction'}
          </button>
          
          <button
            onClick={handleReset}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          MVP by Johnny • Group: dev
        </div>
      </div>
    </div>
  )
}

export default App