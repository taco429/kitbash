import React, { useEffect, useState, useCallback, useRef } from 'react'
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
  Star as StarIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

interface WordPosition {
  word: string
  cells: Array<{ row: number; col: number }>
}

export const OneWordRushPage = () => {
  const navigate = useNavigate()
  const isMobile = useMediaQuery(useTheme().breakpoints.down('md'))
  
  // Game state
  const [grid, setGrid] = useState<string[][]>([])
  const [currentWord, setCurrentWord] = useState<string>('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [wordsFound, setWordsFound] = useState(0)
  const [selectedCells, setSelectedCells] = useState<Array<{ row: number; col: number }>>([])
  const [foundWordPositions, setFoundWordPositions] = useState<WordPosition[]>([])
  const [wordQueue, setWordQueue] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [combo, setCombo] = useState(0)
  
  // Selection state
  const [isDragging, setIsDragging] = useState(false)
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null)
  const [currentCell, setCurrentCell] = useState<{ row: number; col: number } | null>(null)
  
  const gridRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)
  
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

  const getRandomWords = useCallback(() => {
    const allWords = [...easyWords, ...mediumWords, ...hardWords]
    // Use Fisher-Yates shuffle for better randomization
    const shuffled = [...allWords]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, 10) // Get 10 random words for the game
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
      
      // Check if word can fit in this direction
      const endRow = startRow + direction.row * (word.length - 1)
      const endCol = startCol + direction.col * (word.length - 1)
      
      if (endRow >= 0 && endRow < newGrid.length && endCol >= 0 && endCol < newGrid[0].length) {
        // Place the word
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

  const generateNewPuzzle = useCallback((nextWordIndex?: number) => {
    const wordIndex = nextWordIndex !== undefined ? nextWordIndex : currentWordIndex
    
    if (wordIndex >= wordQueue.length) {
      setGameOver(true)
      return
    }
    
    const word = wordQueue[wordIndex]
    setCurrentWord(word)
    
    let newGrid = generateRandomGrid(10)
    const result = placeWordInGrid(newGrid, word)
    
    if (result.position) {
      setGrid(result.grid)
      setTimeLeft(30) // Reset timer for new word
      setFoundWordPositions([]) // Clear highlighting from previous word
    } else {
      // Fallback if word placement fails
      generateNewPuzzle(wordIndex)
    }
  }, [currentWordIndex, wordQueue, generateRandomGrid, placeWordInGrid])

  const startGame = useCallback(() => {
    const words = getRandomWords()
    setWordQueue(words)
    setCurrentWordIndex(0)
    setScore(0)
    setWordsFound(0)
    setCombo(0)
    setGameStarted(true)
    setGameOver(false)
    setFoundWordPositions([])
    
    // Generate first puzzle
    const word = words[0]
    setCurrentWord(word)
    
    let newGrid = generateRandomGrid(10)
    const result = placeWordInGrid(newGrid, word)
    
    if (result.position) {
      setGrid(result.grid)
      setTimeLeft(30)
    }
  }, [getRandomWords, generateRandomGrid, placeWordInGrid])

  // Timer logic
  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev: number) => prev - 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      if (gameStarted && timeLeft === 0) {
        setGameOver(true)
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [gameStarted, gameOver, timeLeft])

  const checkWordFound = useCallback(() => {
    if (selectedCells.length === 0) return false
    
    // Get the selected word
    const selectedWord = selectedCells
      .map(cell => grid[cell.row][cell.col])
      .join('')
    
    const reversedWord = selectedWord.split('').reverse().join('')
    
    if (selectedWord === currentWord || reversedWord === currentWord) {
      // Word found!
      const timeBonus = Math.max(0, timeLeft) * 10
      const comboBonus = combo * 50
      const speedBonus = timeLeft > 20 ? 200 : timeLeft > 10 ? 100 : 50
      const totalPoints = 100 + timeBonus + comboBonus + speedBonus
      
             setScore((prev: number) => prev + totalPoints)
       setWordsFound((prev: number) => prev + 1)
       setCombo((prev: number) => prev + 1)
      
      // Add to found words
      const newFoundWord: WordPosition = {
        word: currentWord,
        cells: [...selectedCells]
      }
      setFoundWordPositions(prev => [...prev, newFoundWord])
      
      // Clear selection
      setSelectedCells([])
      setIsDragging(false)
      setStartCell(null)
      setCurrentCell(null)
      
      // Move to next word
      const nextWordIndex = currentWordIndex + 1
      setCurrentWordIndex(nextWordIndex)
      
      // Generate new puzzle after a short delay
      setTimeout(() => {
        generateNewPuzzle(nextWordIndex)
      }, 500)
      
      return true
    }
    
    return false
  }, [selectedCells, grid, currentWord, timeLeft, combo, generateNewPuzzle])

  // Handle selection
  const getCellFromCoordinates = useCallback((clientX: number, clientY: number): { row: number; col: number } | null => {
    if (!gridRef.current) return null
    
    const element = document.elementFromPoint(clientX, clientY)
    
    if (element && element.hasAttribute('data-cell')) {
      const cellData = element.getAttribute('data-cell')
      if (cellData) {
        const [row, col] = cellData.split('-').map(Number)
        if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
          return { row, col }
        }
      }
    }
    
    return null
  }, [grid])

  const handleSelectionStart = (row: number, col: number) => {
    setIsDragging(true)
    setStartCell({ row, col })
    setCurrentCell({ row, col })
    setSelectedCells([{ row, col }])
  }

  const handleSelectionMove = (clientX: number, clientY: number) => {
    if (!isDragging || !startCell) return

    const cell = getCellFromCoordinates(clientX, clientY)
    if (cell && (!currentCell || cell.row !== currentCell.row || cell.col !== currentCell.col)) {
      setCurrentCell(cell)
      
      // Only update selectedCells if we're in a valid direction
      const deltaRow = cell.row - startCell.row
      const deltaCol = cell.col - startCell.col
      
      if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
        // Calculate cells in line from start to current
        const newSelectedCells = getLineCells(startCell, cell)
        setSelectedCells(newSelectedCells)
      }
    }
  }

  const handleSelectionEnd = () => {
    if (isDragging) {
      // Check if word is found
      const wordFound = checkWordFound()
      
      if (!wordFound) {
        // Reset combo if word not found
        setCombo(0)
        setSelectedCells([])
      }
      
      setIsDragging(false)
      setStartCell(null)
      setCurrentCell(null)
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
    handleSelectionMove(event.clientX, event.clientY)
  }

  const handleMouseUp = () => {
    handleSelectionEnd()
  }

  // Touch handlers
  const handleTouchStart = (event: React.TouchEvent, row: number, col: number) => {
    event.preventDefault()
    handleSelectionStart(row, col)
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    event.preventDefault()
    if (event.touches.length > 0) {
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
    if (isMobile && gameStarted) {
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
      document.body.style.touchAction = 'none'
      
      return () => {
        document.body.style.overflow = ''
        document.body.style.height = ''
        document.body.style.touchAction = ''
      }
    }
  }, [isMobile, gameStarted])

  // Global event handlers
  useEffect(() => {
    const handleGlobalEnd = () => {
      if (isDragging) {
        handleSelectionEnd()
      }
    }

    document.addEventListener('mouseup', handleGlobalEnd)
    document.addEventListener('touchend', handleGlobalEnd)
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalEnd)
      document.removeEventListener('touchend', handleGlobalEnd)
    }
  }, [isDragging])

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col)
  }

  const isCellInFoundWord = (row: number, col: number) => {
    return foundWordPositions.some((wordPosition: WordPosition) =>
      wordPosition.cells.some((cell: { row: number; col: number }) => cell.row === row && cell.col === col)
    )
  }

  const isCellInCurrentPath = (row: number, col: number): boolean => {
    if (!currentCell || !startCell || !isDragging) return false
    
    const deltaRow = currentCell.row - startCell.row
    const deltaCol = currentCell.col - startCell.col
    
    // Only show path for valid directions (horizontal, vertical, diagonal)
    if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
      const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol))
      if (steps === 0) return row === startCell.row && col === startCell.col
      
      const stepRow = deltaRow / steps
      const stepCol = deltaCol / steps
      
      for (let i = 0; i <= steps; i++) {
        const checkRow = startCell.row + i * stepRow
        const checkCol = startCell.col + i * stepCol
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
    const isStartCell = startCell && startCell.row === row && startCell.col === col
    const isCurrentCell = currentCell && currentCell.row === row && currentCell.col === col
    const isDraggingStart = isDragging && isStartCell
    const isDraggingCurrent = isDragging && isCurrentCell && !isStartCell
    
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
      margin: '1px',
      boxSizing: 'border-box' as const,
      position: 'relative' as const,
      zIndex: 1
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
    startGame()
  }

  const getProgressPercentage = () => {
    return (timeLeft / 30) * 100
  }

  const getProgressColor = () => {
    if (timeLeft > 20) return 'success'
    if (timeLeft > 10) return 'warning'
    return 'error'
  }

  // Visual line rendering during selection (like Classic Word Search)
  const renderSelectionLine = () => {
    if (!isDragging || !startCell || !currentCell || !gridRef.current) return null
    
    const cellSize = isMobile ? window.innerWidth * 0.08 : 40
    const cellMargin = isMobile ? 2 : 2
    const cellWithMargin = cellSize + cellMargin
    const gridPadding = isMobile ? 8 : 16
    const borderWidth = 2
    
    // Calculate coordinates for line drawing
    const startX = startCell.col * cellWithMargin + cellSize / 2 + gridPadding + borderWidth
    const startY = startCell.row * cellWithMargin + cellSize / 2 + gridPadding + borderWidth
    const endX = currentCell.col * cellWithMargin + cellSize / 2 + gridPadding + borderWidth
    const endY = currentCell.row * cellWithMargin + cellSize / 2 + gridPadding + borderWidth
    
    // Check if direction is valid
    const deltaRow = currentCell.row - startCell.row
    const deltaCol = currentCell.col - startCell.col
    const isValidDirection = deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)
    
    const gridWidth = grid[0].length * cellWithMargin + (gridPadding + borderWidth) * 2
    const gridHeight = grid.length * cellWithMargin + (gridPadding + borderWidth) * 2
    const pathWidth = cellSize * 0.8
    
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
    if (!gameStarted) {
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
                  Score: {score.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  Words: {wordsFound}/10
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2">
                  Combo: {combo}x
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" gutterBottom>
                    Time: {timeLeft}s
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage()}
                    color={getProgressColor()}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Current Word */}
          <Card elevation={3} sx={{ mx: 1, mb: 1, textAlign: 'center', p: 1 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722' }}>
              Find: {currentWord}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Word {currentWordIndex + 1} of {wordQueue.length}
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
                  gridTemplateColumns: `repeat(${grid[0]?.length || 10}, 1fr)`,
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
                {grid.map((row: string[], rowIndex: number) =>
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

        {/* Game Over Dialog */}
        <Dialog open={gameOver} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box textAlign="center">
              <EmojiEvents sx={{ fontSize: 48, color: '#ff5722', mb: 1 }} />
              <Typography variant="h4" component="div">
                Game Over!
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box textAlign="center">
              <Typography variant="h5" gutterBottom>
                Final Score: {score.toLocaleString()}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Words Found: {wordsFound}/10
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {wordsFound >= 8 ? 'Excellent work!' : 
                 wordsFound >= 5 ? 'Good job!' : 
                 'Keep practicing!'}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              variant="contained"
              onClick={handleRestart}
              startIcon={<Refresh />}
              sx={{ bgcolor: '#ff5722', '&:hover': { bgcolor: '#d84315' } }}
            >
              Play Again
            </Button>
            <Button variant="outlined" onClick={handleBack}>
              Back to Hub
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }

  // Desktop layout (unchanged)
  if (!gameStarted) {
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

            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
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
            </Button>
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
              <Button
                variant="contained"
                onClick={handleRestart}
                startIcon={<Refresh />}
                sx={{ bgcolor: '#ff5722', '&:hover': { bgcolor: '#d84315' } }}
              >
                Restart
              </Button>
            </Box>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <Typography variant="h6" color="primary">
                  Score: {score.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="h6">
                  Words: {wordsFound}/10
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="h6">
                  Combo: {combo}x
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Time Left: {timeLeft}s
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressPercentage()}
                    color={getProgressColor()}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Current Word */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ textAlign: 'center', p: 3, mb: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#ff5722' }}>
              Find: {currentWord}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Word {currentWordIndex + 1} of {wordQueue.length}
            </Typography>
          </Card>
        </Grid>

        {/* Game Grid */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              ref={gridRef}
              sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${grid[0]?.length || 10}, 1fr)`,
                gap: '2px',
                userSelect: 'none',
                touchAction: 'none',
                position: 'relative'
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {grid.map((row: string[], rowIndex: number) =>
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
        </Grid>
      </Grid>

      {/* Game Over Dialog */}
      <Dialog open={gameOver} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box textAlign="center">
            <EmojiEvents sx={{ fontSize: 48, color: '#ff5722', mb: 1 }} />
            <Typography variant="h4" component="div">
              Game Over!
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center">
            <Typography variant="h5" gutterBottom>
              Final Score: {score.toLocaleString()}
            </Typography>
            <Typography variant="h6" gutterBottom>
              Words Found: {wordsFound}/10
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {wordsFound >= 8 ? 'Excellent work!' : 
               wordsFound >= 5 ? 'Good job!' : 
               'Keep practicing!'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={handleRestart}
            startIcon={<Refresh />}
            sx={{ bgcolor: '#ff5722', '&:hover': { bgcolor: '#d84315' } }}
          >
            Play Again
          </Button>
          <Button variant="outlined" onClick={handleBack}>
            Back to Hub
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}