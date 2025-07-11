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
    
    const cellSize = isMobile ? '7vw' : '35px'
    const fontSize = isMobile ? '3.5vw' : '14px'
    
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

  if (!gameStarted) {
    return (
      <Container 
        maxWidth="md" 
        sx={{ 
          py: 4,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          ...(isMobile && {
            py: 2,
            px: 2,
            minHeight: 'auto',
            height: 'auto'
          })
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
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <AppBar position="static" sx={{ mb: 3, borderRadius: 2 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            One Word Rush
          </Typography>
          <Button color="inherit" onClick={handleRestart} startIcon={<Refresh />}>
            Restart
          </Button>
        </Toolbar>
      </AppBar>

      <Grid container spacing={3}>
        {/* Game Stats */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
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
                    onTouchStart={(e) => handleTouchStart(e, rowIndex, colIndex)}
                  >
                    {letter}
                  </Box>
                ))
              )}
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