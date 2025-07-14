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
  selectedCells: Array<{ row: number; col: number }>
  
  // Word location flash effect
  wordLocationCells: Array<{ row: number; col: number }>
  flashPhase: number
  
  // Selection state
  isDragging: boolean
  startCell: { row: number; col: number } | null
  currentCell: { row: number; col: number } | null
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
  selectedCells: [],
  wordLocationCells: [],
  flashPhase: 0,
  isDragging: false,
  startCell: null,
  currentCell: null
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
        selectedCells: [], // Clear selection immediately
        isDragging: false,
        startCell: null,
        currentCell: null
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
        selectedCells: [],
        isDragging: false,
        startCell: null,
        currentCell: null
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
      return {
        ...state,
        isDragging: true,
        startCell: { row: action.payload.row, col: action.payload.col },
        currentCell: { row: action.payload.row, col: action.payload.col },
        selectedCells: [{ row: action.payload.row, col: action.payload.col }]
      }
    
    case 'UPDATE_SELECTION':
      if (state.phase !== 'playing' || !state.isDragging) return state
      return {
        ...state,
        currentCell: action.payload.currentCell,
        selectedCells: action.payload.cells
      }
    
    case 'END_SELECTION':
      if (state.phase !== 'playing') return state
      return {
        ...state,
        isDragging: false,
        startCell: null,
        currentCell: null,
        selectedCells: [],
        combo: 0 // Reset combo on failed selection
      }
    
    case 'RESET_GAME':
      return initialState
    
    default:
      return state
  }
}

export const OneWordRushPage = () => {
  const navigate = useNavigate()
  const isMobile = useMediaQuery(useTheme().breakpoints.down('md'))
  
  // Use reducer for atomic state management
  const [gameState, dispatch] = useReducer(gameReducer, initialState)
  
  // Refs for cleanup
  const timerRef = useRef<number | null>(null)
  const flashRef = useRef<number | null>(null)
  const transitionRef = useRef<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  
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

  const checkWordFound = useCallback(() => {
    if (gameState.selectedCells.length === 0 || gameState.phase !== 'playing') return false
    
    const selectedWord = gameState.selectedCells
      .map(cell => gameState.grid[cell.row][cell.col])
      .join('')
    
    const reversedWord = selectedWord.split('').reverse().join('')
    
    if (selectedWord === gameState.currentWord || reversedWord === gameState.currentWord) {
      const timeBonus = Math.max(0, gameState.timeLeft) * 10
      const comboBonus = gameState.combo * 50
      const speedBonus = gameState.timeLeft > 20 ? 200 : gameState.timeLeft > 10 ? 100 : 50
      const totalPoints = 100 + timeBonus + comboBonus + speedBonus
      
      const newFoundWord: WordPosition = {
        word: gameState.currentWord,
        cells: [...gameState.selectedCells]
      }
      
      dispatch({
        type: 'WORD_FOUND',
        payload: {
          points: totalPoints,
          wordPosition: newFoundWord
        }
      })
      
      return true
    }
    
    return false
  }, [gameState.selectedCells, gameState.grid, gameState.currentWord, gameState.timeLeft, gameState.combo, gameState.phase])

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
  const getCellFromCoordinates = useCallback((clientX: number, clientY: number): { row: number; col: number } | null => {
    if (!gridRef.current) return null
    
    // Use elementFromPoint to directly find which cell element is under the coordinates
    const element = document.elementFromPoint(clientX, clientY)
    
    if (element && element.hasAttribute('data-cell')) {
      const cellData = element.getAttribute('data-cell')
      if (cellData) {
        const [row, col] = cellData.split('-').map(Number)
        if (row >= 0 && row < gameState.grid.length && col >= 0 && col < gameState.grid[0].length) {
          return { row, col }
        }
      }
    }
    
    return null
  }, [gameState.grid])

  const handleSelectionStart = (row: number, col: number) => {
    dispatch({ type: 'START_SELECTION', payload: { row, col } })
  }

  const handleSelectionMove = (clientX: number, clientY: number) => {
    if (!gameState.isDragging || !gameState.startCell) return

    const cell = getCellFromCoordinates(clientX, clientY)
    if (cell && (!gameState.currentCell || cell.row !== gameState.currentCell.row || cell.col !== gameState.currentCell.col)) {
      const deltaRow = cell.row - gameState.startCell.row
      const deltaCol = cell.col - gameState.startCell.col
      
      if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
        // Valid direction - calculate cells in line from start to current
        const newSelectedCells = getLineCells(gameState.startCell, cell)
        dispatch({ type: 'UPDATE_SELECTION', payload: { cells: newSelectedCells, currentCell: cell } })
      } else {
        // Invalid direction - only keep the start cell selected
        dispatch({ type: 'UPDATE_SELECTION', payload: { cells: [gameState.startCell], currentCell: cell } })
      }
    }
  }

  const handleSelectionEnd = () => {
    if (gameState.isDragging) {
      // Check if word is found BEFORE clearing state
      const wordFound = checkWordFound()
      
      if (!wordFound) {
        // Reset combo if word not found
        dispatch({ type: 'END_SELECTION' })
      }
    }
  }

  const getLineCells = (start: { row: number; col: number }, end: { row: number; col: number }) => {
    const cells: Array<{ row: number; col: number }> = []
    
    const deltaRow = end.row - start.row
    const deltaCol = end.col - start.col
    
    // Only allow straight lines (horizontal, vertical, diagonal)
    if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
      const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol))
      if (steps === 0) {
        cells.push(start)
      } else {
        const stepRow = deltaRow / steps
        const stepCol = deltaCol / steps
        
        for (let i = 0; i <= steps; i++) {
          cells.push({
            row: start.row + i * stepRow,
            col: start.col + i * stepCol
          })
        }
      }
    }
    
    return cells
  }

  // Mouse handlers
  const handleMouseDown = (row: number, col: number) => {
    handleSelectionStart(row, col)
  }



  const handleMouseMove = (event: React.MouseEvent) => {
    if (gameState.isDragging) {
      handleSelectionMove(event.clientX, event.clientY)
    }
  }

  const handleMouseUp = () => {
    handleSelectionEnd()
  }

  // Touch handlers - improved like Classic Word Search
  const handleTouchStart = (event: React.TouchEvent, row: number, col: number) => {
    event.preventDefault()
    handleSelectionStart(row, col)
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    event.preventDefault()
    if (gameState.isDragging && event.touches.length > 0) {
      const touch = event.touches[0]
      handleSelectionMove(touch.clientX, touch.clientY)
    }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    event.preventDefault()
    handleSelectionEnd()
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

  // Global event handlers - improved cleanup like Classic Word Search
  useEffect(() => {
    const handleGlobalEnd = () => {
      if (gameState.isDragging) {
        dispatch({ type: 'END_SELECTION' })
      }
    }

    // Also listen for mouse leave events to clear selection
    const handleMouseLeave = () => {
      if (gameState.isDragging) {
        dispatch({ type: 'END_SELECTION' })
      }
    }

    document.addEventListener('mouseup', handleGlobalEnd)
    document.addEventListener('touchend', handleGlobalEnd)
    document.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalEnd)
      document.removeEventListener('touchend', handleGlobalEnd)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [gameState.isDragging])

  const isCellSelected = (row: number, col: number) => {
    return gameState.selectedCells.some((cell: { row: number; col: number }) => cell.row === row && cell.col === col)
  }

  const isCellInFoundWord = (row: number, col: number) => {
    return gameState.foundWordPositions.some((wordPosition: WordPosition) =>
      wordPosition.cells.some((cell: { row: number; col: number }) => cell.row === row && cell.col === col)
    )
  }

  const isCellInCurrentPath = (row: number, col: number): boolean => {
    if (!gameState.currentCell || !gameState.startCell || !gameState.isDragging) return false
    
    const deltaRow = gameState.currentCell.row - gameState.startCell.row
    const deltaCol = gameState.currentCell.col - gameState.startCell.col
    
    // Only show path for valid directions (horizontal, vertical, diagonal)
    if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
      const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol))
      if (steps === 0) return row === gameState.startCell.row && col === gameState.startCell.col
      
      const stepRow = deltaRow / steps
      const stepCol = deltaCol / steps
      
      for (let i = 0; i <= steps; i++) {
        const checkRow = gameState.startCell.row + i * stepRow
        const checkCol = gameState.startCell.col + i * stepCol
        if (checkRow === row && checkCol === col) {
          return true
        }
      }
    }
    
    return false
  }

  const getCellStyle = (row: number, col: number) => {
    const isSelected = isCellSelected(row, col)
    const isInCurrentPath = isCellInCurrentPath(row, col)
    const isInFoundWord = isCellInFoundWord(row, col)
    const isStartCell = gameState.startCell && gameState.startCell.row === row && gameState.startCell.col === col
    const isCurrentCell = gameState.currentCell && gameState.currentCell.row === row && gameState.currentCell.col === col
    const isDraggingStart = gameState.isDragging && isStartCell
    const isDraggingCurrent = gameState.isDragging && isCurrentCell && !isStartCell
    const isWordLocationCell = gameState.wordLocationCells.some((cell: { row: number; col: number }) => cell.row === row && cell.col === col)
    
    const cellSize = isMobile ? '8vw' : '40px'
    const fontSize = isMobile ? '4vw' : '16px'
    
    const baseStyle = {
      width: cellSize,
      height: cellSize,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #ccc',
      borderRadius: '6px',
      cursor: 'pointer',
      userSelect: 'none' as const,
      fontSize: fontSize,
      fontWeight: 'bold',
      transition: 'all 0.1s ease',
      touchAction: 'none',
      margin: isMobile ? '1px' : '2px',
      boxSizing: 'border-box' as const,
      position: 'relative' as const,
      zIndex: 1
    }

    // Flash effect for word location when time runs out (highest priority)
    if (gameState.phase === 'showingWordLocation' && isWordLocationCell) {
      const isFlashOn = gameState.flashPhase % 2 === 1 // Flash on odd phases
      return {
        ...baseStyle,
        backgroundColor: isFlashOn ? '#8b0000' : '#dc143c', // Dark red flashing
        color: 'white',
        border: '3px solid #8b0000',
        borderRadius: '8px',
        boxShadow: isFlashOn ? '0 0 15px rgba(139, 0, 0, 0.8)' : '0 0 10px rgba(220, 20, 60, 0.6)',
        transform: isFlashOn ? 'scale(1.1)' : 'scale(1.05)',
        zIndex: 15 // Highest priority
      }
    }

    // Special styling for start cell during dragging
    if (isDraggingStart) {
      return {
        ...baseStyle,
        backgroundColor: '#ff5722',
        color: 'white',
        border: '3px solid #d84315',
        borderRadius: '10px',
        boxShadow: '0 0 12px rgba(255, 87, 34, 0.6)',
        transform: 'scale(1.1)',
        zIndex: 10
      }
    }

    // Special styling for current cell during dragging
    if (isDraggingCurrent) {
      return {
        ...baseStyle,
        backgroundColor: '#ff7043',
        color: 'white',
        border: '3px solid #ff5722',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(255, 112, 67, 0.5)',
        transform: 'scale(1.05)',
        zIndex: 9
      }
    }

    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: '#ff5722',
        color: 'white',
        border: '2px solid #d84315',
        borderRadius: '8px',
        boxShadow: '0 0 8px rgba(255, 87, 34, 0.5)',
        zIndex: 6
      }
    }

    if (isInCurrentPath) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(255, 87, 34, 0.4)',
        color: '#d84315',
        border: '2px solid #ff5722',
        borderRadius: '8px',
        boxShadow: '0 0 5px rgba(255, 87, 34, 0.4)',
        zIndex: 8
      }
    }

    if (isInFoundWord) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        color: '#2e7d32',
        border: '1px solid #4caf50',
        zIndex: 2
      }
    }

    return {
      ...baseStyle,
      backgroundColor: 'white',
      '&:hover': {
        backgroundColor: '#f5f5f5'
      }
    }
  }

  const handleBack = () => {
    navigate('/word-search')
  }

  const handleRestart = () => {
    dispatch({ type: 'RESET_GAME' })
    startGame()
  }



  // Visual line rendering during selection (like Classic Word Search)
  const renderSelectionLine = () => {
    if (!gameState.isDragging || !gameState.startCell || !gameState.currentCell || !gridRef.current) return null
    
    // Match One Word Rush actual grid layout with CSS gap
    const cellSize = isMobile ? window.innerWidth * 0.08 : 40
    const gap = isMobile ? 1 : 2 // Match actual CSS grid gap
    const cellWithGap = cellSize + gap // Total space per cell including gap
    const gridPadding = isMobile ? 16 : 16 // Match Paper padding
    
    // Calculate coordinates for line drawing - perfectly centered on cells
    // Adjust offset to move anchor points more up and left for perfect centering
    const horizontalOffset = gap * 1.4 // Move even more to the left (twice the last adjustment)
    const verticalOffset = gap * 1.4   // Move even more up (twice the last adjustment)
    const startX = gameState.startCell.col * cellWithGap + cellSize / 2 + gridPadding - horizontalOffset
    const startY = gameState.startCell.row * cellWithGap + cellSize / 2 + gridPadding - verticalOffset
    const endX = gameState.currentCell.col * cellWithGap + cellSize / 2 + gridPadding - horizontalOffset
    const endY = gameState.currentCell.row * cellWithGap + cellSize / 2 + gridPadding - verticalOffset
    
    // Check if direction is valid
    const deltaRow = gameState.currentCell.row - gameState.startCell.row
    const deltaCol = gameState.currentCell.col - gameState.startCell.col
    const isValidDirection = deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)
    
    const gridWidth = gameState.grid[0].length * cellWithGap + gridPadding * 2
    const gridHeight = gameState.grid.length * cellWithGap + gridPadding * 2
    const pathWidth = cellSize * 1.15 // Wider than cell size (115% vs 60% before)
    
    const validColor = isValidDirection ? "rgba(255, 87, 34, 0.8)" : "rgba(255, 152, 0, 0.6)"
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 7 // Above path cells but below start/end cells
        }}
      >
        <svg
          width={gridWidth}
          height={gridHeight}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }}
        >
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={validColor}
            strokeWidth={pathWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </svg>
      </Box>
    )
  }

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