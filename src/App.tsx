import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, Container, Box } from '@mui/material'
import { Header } from './components/Header'
import { Counter } from './components/Counter'
import { TodoList } from './components/TodoList'

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
      <Header />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Counter />
          <Box sx={{ mt: 4 }}>
            <TodoList />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App 