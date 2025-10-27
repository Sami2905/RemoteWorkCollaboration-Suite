import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err: any) { console.error(err) }
  render() {
    if (this.state.hasError) return <div className="p-6 text-rose-600">Something went wrong.</div>
    return this.props.children
  }
}


