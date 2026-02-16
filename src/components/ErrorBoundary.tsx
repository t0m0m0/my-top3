import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          <div className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-8 text-center">
            <Typography
              variant="h6"
              sx={{ color: 'error.main', fontWeight: 700, mb: 1 }}
            >
              予期しないエラーが発生しました
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {this.state.error?.message || '不明なエラー'}
            </Typography>
            <div className="flex justify-center gap-3">
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={this.handleReset}
              >
                再試行
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  window.location.href = '/'
                }}
              >
                トップページに戻る
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
