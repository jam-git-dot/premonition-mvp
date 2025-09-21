// src/components/ErrorBoundary.jsx
import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // You can log the error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong.</h2>
            <p className="text-gray-700 mb-4">{this.state.error?.toString()}</p>
            <button
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => window.location.reload()}
            >Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
