import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { InfoPage } from './pages/InfoPage'
import { CounterPage } from './pages/CounterPage'
import { TodoPage } from './pages/TodoPage'
import { TowerDefensePage } from './pages/TowerDefensePage'
import { WordSearchHubPage } from './pages/WordSearchHubPage'
import { ClassicWordSearchPage } from './pages/ClassicWordSearchPage'
import { OneWordRushPage } from './pages/OneWordRushPage'
import { CardGamesPage } from './pages/CardGamesPage'
import { CardGameDemoPage } from './pages/CardGameDemoPage'
import { WarGamePage } from './pages/WarGamePage'
import { DeckVisualDemoPage } from './pages/DeckVisualDemoPage'
import { BattlerPage } from './pages/BattlerPage'

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
            <Route path="/word-search" element={<WordSearchHubPage />} />
            <Route path="/word-search/classic" element={<ClassicWordSearchPage />} />
            <Route path="/word-search/one-word-rush" element={<OneWordRushPage />} />
            <Route path="/card-games" element={<CardGamesPage />} />
            <Route path="/card-games/demo" element={<CardGameDemoPage />} />
            <Route path="/card-games/war" element={<WarGamePage />} />
            <Route path="/card-games/deck-demo" element={<DeckVisualDemoPage />} />
            <Route path="/card-games/battler" element={<BattlerPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App 