import { Component } from 'react'
import { withTranslation } from 'react-i18next'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('CivicConnect UI error:', error, errorInfo)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    const { t } = this.props

    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
          <div className="max-w-md rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="animate-float inline-block text-5xl">⚠️</div>
            <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{t('error.title')}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{t('error.body')}</p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {t('error.reload')}
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default withTranslation()(ErrorBoundary)
