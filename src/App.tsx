import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { InfoPage } from './pages/InfoPage'
import { CounterPage } from './pages/CounterPage'
import { TodoPage } from './pages/TodoPage'
import { TowerDefensePage } from './pages/TowerDefensePage'
import { WordSearchPage } from './pages/WordSearchPage'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/kitbash">
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/info" element={<InfoPage />} />
            <Route path="/counter" element={<CounterPage />} />
            <Route path="/todos" element={<TodoPage />} />
            <Route path="/tower-defense" element={<TowerDefensePage />} />
            <Route path="/word-search" element={<WordSearchPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App 