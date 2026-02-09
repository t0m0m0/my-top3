import { Routes, Route } from 'react-router-dom'
import { SelectionProvider } from './contexts/SelectionContext'
import SearchPage from './pages/SearchPage'
import Top3Page from './pages/Top3Page'

function App() {
  return (
    <SelectionProvider>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/my-top3" element={<Top3Page />} />
      </Routes>
    </SelectionProvider>
  )
}

export default App
