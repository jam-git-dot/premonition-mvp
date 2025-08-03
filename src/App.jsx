// src/App.jsx
import { useState } from 'react'
import { premierLeagueTeams } from './data/teams'
import { supabase } from './lib/supabase'
import TeamList from './components/TeamList'

function App() {
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [rankings, setRankings] = useState(premierLeagueTeams)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSubmit = async () => {
    if (!userEmail.trim() || !userName.trim()) {
      alert('Please enter both your email and name!')
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userEmail.trim())) {
      alert('Please enter a valid email address!')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const submission = {
        email: userEmail.trim().toLowerCase(),
        name: userName.trim(),
        rankings: rankings.map(team => team.name),
        group: 'dev'
      }

      console.log('Submitting to Supabase:', submission)

      // First try to update existing prediction
      const { data: existingData } = await supabase
        .from('predictions')
        .select('id')
        .eq('email', submission.email)
        .single()

      let result
      if (existingData) {
        // Update existing prediction
        setIsUpdating(true)
        result = await supabase
          .from('predictions')
          .update({
            name: submission.name,
            rankings: submission.rankings,
            updated_at: new Date().toISOString()
          })
          .eq('email', submission.email)
          .select()
      } else {
        // Insert new prediction
        result = await supabase
          .from('predictions')
          .insert([submission])
          .select()
      }

      if (result.error) {
        throw result.error
      }

      console.log(`Successfully ${existingData ? 'updated' : 'saved'}:`, result.data)
      setIsSubmitted(true)
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setIsUpdating(false)
      }, 5000)

    } catch (error) {
      console.error('Error saving prediction:', error)
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setUserEmail('')
    setUserName('')
    setRankings([...premierLeagueTeams]) // Create a new array to reset order
    setIsSubmitted(false)
    setSubmitError(null)
    setIsUpdating(false)
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
            🎉 Prediction {isUpdating ? 'updated' : 'saved'} successfully!
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            ❌ Error: {submitError}
          </div>
        )}

        {/* User Input */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use the same email to update your prediction later
            </p>
          </div>
          
          <div>
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
            disabled={!userEmail.trim() || !userName.trim() || isSubmitting || isSubmitted}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            {isSubmitting ? '💾 Saving...' : isSubmitted ? (isUpdating ? '✓ Updated!' : '✓ Saved!') : 'Submit Prediction'}
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
          In Arne We Slot • GroupType: dev
        </div>
      </div>
    </div>
  )
}

export default App