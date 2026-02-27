import { Routes, Route } from 'react-router-dom'
import { SelectionProvider } from './contexts/SelectionContext'
import ErrorBoundary from './components/ErrorBoundary'
import SearchPage from './pages/SearchPage'
import Top3Page from './pages/Top3Page'
import ShortUrlPage from './pages/ShortUrlPage'
import GalleryPage from './pages/GalleryPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <ErrorBoundary>
      <SelectionProvider>
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/my-no1s" element={<Top3Page />} />
          <Route path="/s/:id" element={<ShortUrlPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SelectionProvider>
    </ErrorBoundary>
  )
}

export default App
