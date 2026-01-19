// src/components/ErrorBoundary.jsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <Card className="p-6 max-w-md text-center bg-white">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong.</h2>
            <p className="text-gray-700 mb-4">{this.state.error?.toString()}</p>
            <Button
              variant="destructive"
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          </Card>
        </div>
      )
    }
    return this.props.children
  }
}
