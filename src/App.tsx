import { Routes, Route } from 'react-router-dom'
import { SelectionProvider } from './contexts/SelectionContext'
import ErrorBoundary from './components/ErrorBoundary'
import SearchPage from './pages/SearchPage'
import Top3Page from './pages/Top3Page'

function App() {
  return (
    <ErrorBoundary>
      <SelectionProvider>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/my-no1s" element={<Top3Page />} />
        </Routes>
      </SelectionProvider>
    </ErrorBoundary>
  )
}

export default App
