import React, { useEffect, useCallback, useRef, useReducer } from 'react'
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Container,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { 
  ArrowBack,
  PlayArrow,
  Refresh,
  EmojiEvents,
  FlashOn,
  Timer as TimerIcon,
  Star as StarIcon,
  Home as HomeIcon,
  Speed as SpeedIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { GameGrid, GameStats, CurrentWordDisplay, GameOverDialog } from '../components/games/word-search'
import { GameButton } from '../components/shared'
import { useDragSelection, useCellStyles, useSelectionLineRenderer, useFoundWordLineRenderer } from '../hooks'

interface WordPosition {
  word: string
  cells: Array<{ row: number; col: number }>
}

// Game state types
interface GameState {
  // Game status
  phase: 'idle' | 'playing' | 'transitioning' | 'gameOver' | 'showingWordLocation'
  gameWon: boolean
  
  // Game data
  grid: string[][]
  currentWord: string
  wordQueue: string[]
  currentWordIndex: number
  
  // Score and stats
  score: number
  wordsFound: number
  combo: number
  maxCombo: number
  timeLeft: number
  
  // UI state
  foundWordPositions: WordPosition[]
  
  // Word location flash effect
  wordLocationCells: Array<{ row: number; col: number }>
  flashPhase: number
}

type GameAction =
  | { type: 'START_GAME'; payload: { words: string[]; grid: string[][], currentWord: string } }
  | { type: 'WORD_FOUND'; payload: { points: number; wordPosition: WordPosition } }
  | { type: 'NEXT_WORD'; payload: { grid: string[][], word: string } }
  | { type: 'GAME_COMPLETE' }
  | { type: 'TIME_OUT' }
  | { type: 'START_WORD_LOCATION_FLASH'; payload: { cells: Array<{ row: number; col: number }> } }
  | { type: 'FLASH_STEP' }
  | { type: 'FLASH_COMPLETE' }
  | { type: 'TICK_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'START_SELECTION'; payload: { row: number; col: number } }
  | { type: 'UPDATE_SELECTION'; payload: { cells: Array<{ row: number; col: number }>, currentCell: { row: number; col: number } } }
  | { type: 'END_SELECTION' }
  | { type: 'RESET_GAME' }

const initialState: GameState = {
  phase: 'idle',
  gameWon: false,
  grid: [],
  currentWord: '',
  wordQueue: [],
  currentWordIndex: 0,
  score: 0,
  wordsFound: 0,
  combo: 0,
  maxCombo: 0,
  timeLeft: 30,
  foundWordPositions: [],
  wordLocationCells: [],
  flashPhase: 0
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        phase: 'playing',
        wordQueue: action.payload.words,
        currentWord: action.payload.currentWord,
        grid: action.payload.grid,
        currentWordIndex: 0,
        timeLeft: 30
      }
    
    case 'WORD_FOUND':
      const newCombo = state.combo + 1
      return {
        ...state,
        phase: 'transitioning',
        score: state.score + action.payload.points,
        wordsFound: state.wordsFound + 1,
        combo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        foundWordPositions: [...state.foundWordPositions, action.payload.wordPosition],
        wordLocationCells: [], // Clear selection immediately
        flashPhase: 0
      }
    
    case 'NEXT_WORD':
      const nextIndex = state.currentWordIndex + 1
      if (nextIndex >= state.wordQueue.length) {
        return {
          ...state,
          phase: 'gameOver',
          gameWon: true
        }
      }
      return {
        ...state,
        phase: 'playing',
        currentWordIndex: nextIndex,
        currentWord: action.payload.word,
        grid: action.payload.grid,
        timeLeft: 30,
        foundWordPositions: [], // Clear previous word highlighting
        wordLocationCells: [],
        flashPhase: 0
      }
    
    case 'GAME_COMPLETE':
      return {
        ...state,
        phase: 'gameOver',
        gameWon: true
      }
    
    case 'TIME_OUT':
      return {
        ...state,
        phase: 'showingWordLocation',
        flashPhase: 0
      }
    
    case 'START_WORD_LOCATION_FLASH':
      return {
        ...state,
        phase: 'showingWordLocation',
        wordLocationCells: action.payload.cells,
        flashPhase: 0
      }
    
    case 'FLASH_STEP':
      return {
        ...state,
        flashPhase: state.flashPhase + 1
      }
    
    case 'FLASH_COMPLETE':
      return {
        ...state,
        phase: 'gameOver',
        gameWon: false,
        wordLocationCells: [],
        flashPhase: 0
      }
    
    case 'TICK_TIMER':
      const newTimeLeft = Math.max(0, state.timeLeft - 1)
      return {
        ...state,
        timeLeft: newTimeLeft
      }
    
    case 'RESET_TIMER':
      return {
        ...state,
        timeLeft: 30
      }
    
    case 'START_SELECTION':
      if (state.phase !== 'playing') return state
      return state // Selection is handled by useDragSelection
    
    case 'UPDATE_SELECTION':
      if (state.phase !== 'playing') return state
      return state // Selection is handled by useDragSelection
    
    case 'END_SELECTION':
      if (state.phase !== 'playing') return state
      return state // Selection is handled by useDragSelection
    
    case 'RESET_GAME':
      return initialState
    
    default:
      return state
  }
}

export const OneWordRushPage = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState)
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Drag selection hook
  const {
    dragState,
    gridRef,
    handleMouseDown: onDragMouseDown,
    handleMouseMove: onDragMouseMove,
    handleMouseUp: onDragMouseUp,
    handleTouchStart: onDragTouchStart,
    handleTouchMove: onDragTouchMove,
    handleTouchEnd: onDragTouchEnd
  } = useDragSelection({
    grid: gameState.grid,
    onSelectionEnd: (cells: Array<{ row: number; col: number }>) => {
      const wordFound = checkWordFoundWithCells(cells)
      if (!wordFound) {
        // Reset combo if word not found
        dispatch({ type: 'END_SELECTION' })
      }
    },
    onSelectionUpdate: () => {
      // Optional: Handle selection changes if needed
    }
  })

  // Extract drag state properties for easier access
  const { isDragging, startCell, currentCell, selectedCells } = dragState
  
  // Cell styles hook
  const { getCellStyle } = useCellStyles({
    isMobile,
    selectedCells,
    foundWordCells: gameState.foundWordPositions.flatMap(wordPos => wordPos.cells),
    isDragging,
    startCell,
    currentCell,
    flashingCells: gameState.wordLocationCells,
    isFlashing: gameState.phase === 'showingWordLocation' && gameState.flashPhase % 2 === 1
  })

  // Line rendering hooks
  const { renderSelectionLine } = useSelectionLineRenderer({
    grid: gameState.grid,
    isDragging,
    startCell,
    currentCell,
    isMobile,
    strokeColor: "rgba(255, 87, 34, 0.8)",
    strokeWidth: isMobile ? 28 : 46
  })

  const { renderFoundWordLines } = useFoundWordLineRenderer({
    grid: gameState.grid,
    foundWordPositions: gameState.foundWordPositions,
    isMobile,
    strokeColor: "rgba(76, 175, 80, 0.6)",
    strokeWidth: isMobile ? 24 : 36
  })
  
  // Use reducer for atomic state management
  const timerRef = useRef<number | null>(null)
  const flashRef = useRef<number | null>(null)
  const transitionRef = useRef<number | null>(null)
  
  // Word lists for different difficulties
  const easyWords = [
    'CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BOOK', 'BALL', 'FISH', 'BIRD',
    'HOUSE', 'WATER', 'LIGHT', 'MUSIC', 'HAPPY', 'DANCE', 'SMILE', 'HEART', 'CLOUD', 'RIVER'
  ]
  
  const mediumWords = [
    'COMPUTER', 'RAINBOW', 'BUTTERFLY', 'MOUNTAIN', 'ELEPHANT', 'CHOCOLATE', 'ADVENTURE', 'FRIENDSHIP',
    'TELEPHONE', 'BASKETBALL', 'DISCOVERY', 'FANTASTIC', 'WONDERFUL', 'BEAUTIFUL', 'MYSTERIOUS', 'CELEBRATE'
  ]
  
  const hardWords = [
    'EXTRAORDINARY', 'PHENOMENAL', 'SPECTACULAR', 'MAGNIFICENT', 'REVOLUTIONARY', 'SOPHISTICATED',
    'ENTERTAINMENT', 'ORGANIZATION', 'RESPONSIBILITY', 'COMMUNICATION', 'INTERNATIONAL', 'ACHIEVEMENT'
  ]

  // Utility functions
  const getRandomWords = useCallback(() => {
    const allWords = [...easyWords, ...mediumWords, ...hardWords]
    // Filter out words longer than 10 characters to prevent display issues on mobile
    const filteredWords = allWords.filter(word => word.length <= 10)
    const shuffled = [...filteredWords]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, 10)
  }, [])

  const generateRandomGrid = useCallback((size: number = 10) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const newGrid: string[][] = []
    
    for (let row = 0; row < size; row++) {
      newGrid[row] = []
      for (let col = 0; col < size; col++) {
        newGrid[row][col] = letters[Math.floor(Math.random() * letters.length)]
      }
    }
    
    return newGrid
  }, [])

  const placeWordInGrid = useCallback((grid: string[][], word: string): { grid: string[][], position: WordPosition | null } => {
    const directions = [
      { row: 0, col: 1 },   // horizontal
      { row: 1, col: 0 },   // vertical
      { row: 1, col: 1 },   // diagonal down-right
      { row: 1, col: -1 },  // diagonal down-left
      { row: 0, col: -1 },  // horizontal backwards
      { row: -1, col: 0 },  // vertical backwards
      { row: -1, col: -1 }, // diagonal up-left
      { row: -1, col: 1 }   // diagonal up-right
    ]
    
    const newGrid = grid.map(row => [...row])
    const maxAttempts = 100
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const direction = directions[Math.floor(Math.random() * directions.length)]
      const startRow = Math.floor(Math.random() * newGrid.length)
      const startCol = Math.floor(Math.random() * newGrid[0].length)
      
      const endRow = startRow + direction.row * (word.length - 1)
      const endCol = startCol + direction.col * (word.length - 1)
      
      if (endRow >= 0 && endRow < newGrid.length && endCol >= 0 && endCol < newGrid[0].length) {
        const wordCells: Array<{ row: number; col: number }> = []
        for (let i = 0; i < word.length; i++) {
          const row = startRow + direction.row * i
          const col = startCol + direction.col * i
          newGrid[row][col] = word[i]
          wordCells.push({ row, col })
        }
        
        return {
          grid: newGrid,
          position: { word, cells: wordCells }
        }
      }
    }
    
    return { grid: newGrid, position: null }
  }, [])

  const findWordInGrid = useCallback((word: string, grid: string[][]): Array<{ row: number; col: number }> => {
    const directions = [
      { row: 0, col: 1 },   // horizontal
      { row: 1, col: 0 },   // vertical
      { row: 1, col: 1 },   // diagonal down-right
      { row: 1, col: -1 },  // diagonal down-left
      { row: 0, col: -1 },  // horizontal backwards
      { row: -1, col: 0 },  // vertical backwards
      { row: -1, col: -1 }, // diagonal up-left
      { row: -1, col: 1 }   // diagonal up-right
    ]
    
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[0].length; col++) {
        for (const direction of directions) {
          const cells: Array<{ row: number; col: number }> = []
          let matches = true
          
          for (let i = 0; i < word.length; i++) {
            const checkRow = row + direction.row * i
            const checkCol = col + direction.col * i
            
            if (checkRow < 0 || checkRow >= grid.length || 
                checkCol < 0 || checkCol >= grid[0].length ||
                grid[checkRow][checkCol] !== word[i]) {
              matches = false
              break
            }
            
            cells.push({ row: checkRow, col: checkCol })
          }
          
          if (matches) {
            return cells
          }
        }
      }
    }
    
    return []
  }, [])

  // Game control functions
  const startGame = useCallback(() => {
    // Clean up any existing timers
    if (timerRef.current) clearInterval(timerRef.current)
    if (flashRef.current) clearInterval(flashRef.current)
    if (transitionRef.current) clearTimeout(transitionRef.current)
    
    const words = getRandomWords()
    const firstWord = words[0]
    
    let attempts = 0
    let grid: string[][]
    let success = false
    
    // Ensure grid generation succeeds
    while (!success && attempts < 10) {
      grid = generateRandomGrid(10)
      const result = placeWordInGrid(grid, firstWord)
      
      if (result.position) {
        dispatch({
          type: 'START_GAME',
          payload: {
            words,
            grid: result.grid,
            currentWord: firstWord
          }
        })
        success = true
      }
      attempts++
    }
    
    // Fallback if grid generation fails
    if (!success) {
      console.error('Failed to generate initial grid')
      // Create a simple grid with the word placed horizontally
      grid = generateRandomGrid(10)
      for (let i = 0; i < firstWord.length; i++) {
        grid[0][i] = firstWord[i]
      }
      dispatch({
        type: 'START_GAME',
        payload: {
          words,
          grid,
          currentWord: firstWord
        }
      })
    }
  }, [getRandomWords, generateRandomGrid, placeWordInGrid])

  // Word found check function that takes selectedCells as parameter
  const checkWordFoundWithCells = useCallback((selectedCells: Array<{ row: number; col: number }>) => {
    if (selectedCells.length === 0 || gameState.phase !== 'playing') return false
    
    const selectedWord = selectedCells
      .map(cell => gameState.grid[cell.row][cell.col])
      .join('')
    
    if (selectedWord === gameState.currentWord) {
      // Award more points for longer words and combo multiplier
      const basePoints = gameState.currentWord.length * 10
      const comboMultiplier = Math.max(1, gameState.combo * 0.5)
      const timeBonus = Math.floor(gameState.timeLeft * 2)
      const totalPoints = Math.floor(basePoints * comboMultiplier) + timeBonus
      
      const newFoundWord: WordPosition = {
        word: gameState.currentWord,
        cells: [...selectedCells]
      }
      
      dispatch({ type: 'WORD_FOUND', payload: { points: totalPoints, wordPosition: newFoundWord } })
      return true
    }
    
    return false
  }, [gameState.grid, gameState.currentWord, gameState.timeLeft, gameState.combo, gameState.phase])

  const generateNextPuzzle = useCallback(() => {
    const nextIndex = gameState.currentWordIndex + 1
    
    if (nextIndex >= gameState.wordQueue.length) {
      dispatch({ type: 'GAME_COMPLETE' })
      return
    }
    
    const nextWord = gameState.wordQueue[nextIndex]
    let attempts = 0
    let success = false
    
    while (!success && attempts < 10) {
      const newGrid = generateRandomGrid(10)
      const result = placeWordInGrid(newGrid, nextWord)
      
      if (result.position) {
        dispatch({
          type: 'NEXT_WORD',
          payload: {
            grid: result.grid,
            word: nextWord
          }
        })
        success = true
      }
      attempts++
    }
    
    // Fallback if grid generation fails
    if (!success) {
      const newGrid = generateRandomGrid(10)
      for (let i = 0; i < nextWord.length; i++) {
        newGrid[0][i] = nextWord[i]
      }
      dispatch({
        type: 'NEXT_WORD',
        payload: {
          grid: newGrid,
          word: nextWord
        }
      })
    }
  }, [gameState.currentWordIndex, gameState.wordQueue, generateRandomGrid, placeWordInGrid])

  // Timer management
  useEffect(() => {
    if (gameState.phase === 'playing' && gameState.timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        dispatch({ type: 'TICK_TIMER' })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      if (gameState.phase === 'playing' && gameState.timeLeft === 0) {
        const wordCells = findWordInGrid(gameState.currentWord, gameState.grid)
        dispatch({
          type: 'START_WORD_LOCATION_FLASH',
          payload: { cells: wordCells }
        })
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [gameState.phase, gameState.timeLeft, gameState.currentWord, gameState.grid, findWordInGrid])

  // Flash effect management
  useEffect(() => {
    if (gameState.phase === 'showingWordLocation') {
      flashRef.current = window.setInterval(() => {
        if (gameState.flashPhase >= 5) {
          dispatch({ type: 'FLASH_COMPLETE' })
        } else {
          dispatch({ type: 'FLASH_STEP' })
        }
      }, 300)
      
      return () => {
        if (flashRef.current) {
          clearInterval(flashRef.current)
          flashRef.current = null
        }
      }
    }
  }, [gameState.phase, gameState.flashPhase])

  // Transition management
  useEffect(() => {
    if (gameState.phase === 'transitioning') {
      transitionRef.current = window.setTimeout(() => {
        generateNextPuzzle()
      }, 500)
      
      return () => {
        if (transitionRef.current) {
          clearTimeout(transitionRef.current)
          transitionRef.current = null
        }
      }
    }
  }, [gameState.phase, generateNextPuzzle])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (flashRef.current) clearInterval(flashRef.current)
      if (transitionRef.current) clearTimeout(transitionRef.current)
    }
  }, [])

  // Enhanced getCellFromCoordinates for smooth tracking (like Classic Word Search)
  // Cell selection and coordinate handling is now managed by the drag selection hook

  // Mouse handlers
  const handleMouseDown = (row: number, col: number) => {
    onDragMouseDown(row, col)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    onDragMouseMove(event)
  }

  const handleMouseUp = () => {
    onDragMouseUp()
  }

  // Touch handlers - improved like Classic Word Search
  const handleTouchStart = (event: React.TouchEvent, row: number, col: number) => {
    onDragTouchStart(event, row, col)
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    onDragTouchMove(event)
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    onDragTouchEnd(event)
  }

  // Prevent body scrolling on mobile word search (only during game)
  useEffect(() => {
    if (isMobile && gameState.phase === 'playing') {
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
      document.body.style.touchAction = 'none'
      
      return () => {
        document.body.style.overflow = ''
        document.body.style.height = ''
        document.body.style.touchAction = ''
      }
    }
  }, [isMobile, gameState.phase])

  // Global event handlers are now managed by the drag selection hook

  // Cell styling is now handled by the useCellStyles hook

  const handleBack = () => {
    navigate('/word-search')
  }

  const handleRestart = () => {
    dispatch({ type: 'RESET_GAME' })
    startGame()
  }



  // Line rendering is now handled by the rendering hooks

  // Mobile full-screen layout
  if (isMobile) {
    if (gameState.phase === 'idle') {
      return (
        <Box sx={{ 
          height: '100vh', 
          width: '100vw', 
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#f5f5f5'
        }}>
          {/* Mobile Header */}
          <AppBar position="fixed" sx={{ zIndex: 1100 }}>
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleBack}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
                One Word Rush
              </Typography>
            </Toolbar>
          </AppBar>

          {/* Start Screen Content */}
          <Box sx={{ 
            pt: '56px', // Account for header height
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
            overflow: 'auto'
          }}>
            <Card elevation={4} sx={{ 
              textAlign: 'center', 
              p: 3, 
              maxWidth: '100%',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <CardContent>
                <Box sx={{ mb: 3 }}>
                  <FlashOn sx={{ fontSize: 50, color: '#ff5722', mb: 2 }} />
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    One Word Rush
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Find words as fast as you can! You have 30 seconds per word.
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <Box>
                      <TimerIcon sx={{ fontSize: 32, color: '#ff5722', mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Time Attack
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        30 seconds per word - speed is everything!
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <StarIcon sx={{ fontSize: 32, color: '#ff5722', mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Combo System
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chain correct answers for bonus points!
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <EmojiEvents sx={{ fontSize: 32, color: '#ff5722', mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        Speed Bonus
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Find words faster for extra points!
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={startGame}
                  sx={{
                    fontSize: '1.1rem',
                    py: 2,
                    px: 4,
                    bgcolor: '#ff5722',
                    '&:hover': { bgcolor: '#d84315' }
                  }}
                >
                  Start Rush
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )
    }

    // Mobile gameplay screen
    return (
      <Box sx={{ 
        height: '100vh', 
        width: '100vw', 
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f5f5f5'
      }}>
        {/* Mobile Header */}
        <AppBar position="fixed" sx={{ zIndex: 1100 }}>
          <Toolbar variant="dense">
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleBack}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
              One Word Rush
            </Typography>
            <Button color="inherit" onClick={handleRestart} startIcon={<Refresh />}>
              Restart
            </Button>
          </Toolbar>
        </AppBar>

        {/* Game Content */}
        <Box sx={{ 
          pt: '48px', // Account for header height
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Game Stats */}
          <Paper elevation={3} sx={{ m: 1, p: 1 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="primary">
                  Score: {gameState.score.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  Words: {gameState.wordsFound}/10
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  Combo: {gameState.combo}x
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" gutterBottom>
                    Time: {gameState.timeLeft}s
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(gameState.timeLeft / 30) * 100}
                    color={
                      gameState.timeLeft > 20 ? 'success' :
                      gameState.timeLeft > 10 ? 'warning' : 'error'
                    }
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Current Word */}
          <Card elevation={3} sx={{ mx: 1, mb: 1, textAlign: 'center', p: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722' }}>
              Find: {gameState.currentWord}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Word {gameState.currentWordIndex + 1} of {gameState.wordQueue.length}
            </Typography>
          </Card>

          {/* Game Grid */}
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 1
          }}>
            <Paper
              elevation={3}
              sx={{
                p: 1,
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                maxWidth: '100vw'
              }}
            >
              <Box
                ref={gridRef}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gameState.grid[0]?.length || 10}, 1fr)`,
                  gap: '1px',
                  userSelect: 'none',
                  touchAction: 'none',
                  position: 'relative'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {gameState.grid.map((row: string[], rowIndex: number) =>
                  row.map((letter: string, colIndex: number) => (
                    <Box
                      key={`${rowIndex}-${colIndex}`}
                      data-cell={`${rowIndex}-${colIndex}`}
                      sx={getCellStyle(rowIndex, colIndex)}
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onTouchStart={(e: React.TouchEvent) => handleTouchStart(e, rowIndex, colIndex)}
                    >
                      {letter}
                    </Box>
                  ))
                )}
                {renderSelectionLine()}
              </Box>
            </Paper>
          </Box>
        </Box>

              {/* Victory Dialog - When player completes all words */}
      <Dialog
        open={gameState.phase === 'gameOver' && gameState.gameWon}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <EmojiEvents sx={{ fontSize: 60, color: '#ffd700' }} />
            <Typography variant="h4" component="h2" fontWeight="bold">
              Perfect Rush!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              You found all 10 words!
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
            {/* Score Display */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 2
            }}>
              <EmojiEvents sx={{ fontSize: 32, color: '#ffd700' }} />
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Final Score
                </Typography>
                <Typography variant="h5" fontFamily="monospace" fontWeight="bold">
                  {gameState.score.toLocaleString()}
                </Typography>
              </Box>
            </Box>

            {/* Words Found Display */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Words Found:
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ color: '#4caf50' }}
                >
                  10/10
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} sx={{ color: '#ffd700', fontSize: 16 }} />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Max Combo Display */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 2
            }}>
              <SpeedIcon sx={{ fontSize: 24, color: '#ff5722' }} />
              <Typography variant="h6">
                Max Combo: {gameState.maxCombo}x
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
          <Button
            variant="contained"
            onClick={handleRestart}
            startIcon={<Refresh />}
            sx={{
              backgroundColor: '#4caf50',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#45a049'
              }
            }}
          >
            Play Again
          </Button>
          <Button
            variant="outlined"
            onClick={handleBack}
            startIcon={<HomeIcon />}
            sx={{
              borderColor: 'white',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Back to Hub
          </Button>
        </DialogActions>
      </Dialog>

      {/* Defeat Dialog - When time runs out */}
      <Dialog
        open={gameState.phase === 'gameOver' && !gameState.gameWon}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            color: 'white',
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <TimerIcon sx={{ fontSize: 60, color: '#ffeb3b' }} />
            <Typography variant="h4" component="h2" fontWeight="bold">
              Time's Up!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {gameState.wordsFound >= 5 ? 'Good effort! Keep practicing.' : 'Keep trying - you\'ll get faster!'}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
            {/* Score Display */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 2
            }}>
              <EmojiEvents sx={{ fontSize: 32, color: '#ffeb3b' }} />
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Final Score
                </Typography>
                <Typography variant="h5" fontFamily="monospace" fontWeight="bold">
                  {gameState.score.toLocaleString()}
                </Typography>
              </Box>
            </Box>

            {/* Words Found Display */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Words Found:
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold"
                  sx={{ 
                    color: gameState.wordsFound >= 5 ? '#ffeb3b' : '#ffcdd2'
                  }}
                >
                  {gameState.wordsFound}/10
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[...Array(Math.min(gameState.wordsFound, 5))].map((_, i) => (
                    <StarIcon key={i} sx={{ color: '#ffeb3b', fontSize: 16 }} />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Max Combo Display */}
            {gameState.maxCombo > 0 && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 2
              }}>
                <SpeedIcon sx={{ fontSize: 24, color: '#ffeb3b' }} />
                <Typography variant="h6">
                  Best Combo: {gameState.maxCombo}x
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
          <Button
            variant="contained"
            onClick={handleRestart}
            startIcon={<Refresh />}
            sx={{
              backgroundColor: '#ff5722',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#d84315'
              }
            }}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            onClick={handleBack}
            startIcon={<HomeIcon />}
            sx={{
              borderColor: 'white',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Back to Hub
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    )
  }

  // Desktop layout (unchanged)
  if (gameState.phase === 'idle') {
    return (
      <Container 
        maxWidth="md" 
        sx={{
          py: isMobile ? 2 : 4,
          px: isMobile ? 2 : undefined,
          minHeight: isMobile ? 'auto' : '100vh',
          height: isMobile ? 'auto' : undefined,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        <AppBar position="static" sx={{ mb: 4, borderRadius: 2 }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleBack}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              One Word Rush
            </Typography>
          </Toolbar>
        </AppBar>

        <Card elevation={4} sx={{ textAlign: 'center', p: 4, flex: 1 }}>
          <CardContent>
            <Box sx={{ mb: 4 }}>
              <FlashOn sx={{ fontSize: 60, color: '#ff5722', mb: 2 }} />
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                One Word Rush
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                Find words as fast as you can! You have 30 seconds per word.
              </Typography>
            </Box>

            <GameButton
              variant="primary"
              icon={<PlayArrow />}
              onClick={startGame}
              sx={{
                fontSize: '1.2rem',
                py: 2,
                px: 4,
                bgcolor: '#ff5722',
                '&:hover': { bgcolor: '#d84315' }
              }}
            >
              Start Rush
            </GameButton>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h3" component="h1">
          One Word Rush
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Game Stats */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Game In Progress
              </Typography>
              <GameButton
                variant="primary"
                icon={<Refresh />}
                onClick={handleRestart}
                sx={{ bgcolor: '#ff5722', '&:hover': { bgcolor: '#d84315' } }}
              >
                Restart
              </GameButton>
            </Box>
            <GameStats
              score={gameState.score}
              wordsFound={gameState.wordsFound}
              totalWords={gameState.wordQueue.length}
              combo={gameState.combo}
              timeLeft={gameState.timeLeft}
              maxTime={30}
            />
          </Paper>
        </Grid>

        {/* Current Word */}
        <Grid item xs={12}>
          <CurrentWordDisplay
            currentWord={gameState.currentWord}
            currentIndex={gameState.currentWordIndex}
            totalWords={gameState.wordQueue.length}
          />
        </Grid>

        {/* Game Grid */}
        <Grid item xs={12}>
          <GameGrid
            grid={gameState.grid}
            getCellStyle={getCellStyle}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            selectionLineRenderer={renderSelectionLine}
            foundWordLineRenderer={renderFoundWordLines}
            gridRef={gridRef}
          />
        </Grid>
      </Grid>

      {/* Game Over Dialog */}
      <GameOverDialog
        open={gameState.phase === 'gameOver'}
        score={gameState.score}
        wordsFound={gameState.wordsFound}
        totalWords={gameState.wordQueue.length}
        onRestart={handleRestart}
        onBack={handleBack}
      />
    </Container>
  )
}