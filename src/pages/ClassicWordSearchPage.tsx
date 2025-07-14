import { useEffect, useState, useCallback, useRef } from 'react'
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Container,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  AppBar,
  Toolbar,
  IconButton,
  Fab,
  Drawer,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { 
  Refresh, 
  EmojiEvents, 
  Search, 
  ArrowBack,
  List as ListIcon,
  Close as CloseIcon,
  PlayArrow,
  Home as HomeIcon,
  Timer as TimerIcon,
  Star as StarIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { newGame, startSelection, updateSelection, endSelection } from '../store/wordSearchSlice'
import { GameGrid, WordBank, GameTimer } from '../components/games/word-search'
import { GameButton, GameCard, GameDialog } from '../components/shared'

export const ClassicWordSearchPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { grid, words, foundWords, foundWordPositions, selectedCells, gameWon, difficulty } = useAppSelector((state: any) => state.wordSearch)
  const [isDragging, setIsDragging] = useState(false)
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null)
  const [currentCell, setCurrentCell] = useState<{ row: number; col: number } | null>(null)
  const [wordBankOpen, setWordBankOpen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [milliseconds, setMilliseconds] = useState(0)
  const [congratulationOpen, setCongratulationOpen] = useState(false)
  const [finalTime, setFinalTime] = useState('')
  const gridRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  const handleBack = () => {
    navigate('/word-search')
  }

  const handleStartGame = () => {
    setGameStarted(true)
  }



  useEffect(() => {
    // Start a new game when component mounts
    dispatch(newGame({ difficulty: 'easy' }))
  }, [dispatch])

  // Timer logic
  useEffect(() => {
    if (gameStarted && !gameWon) {
      timerRef.current = setInterval(() => {
        setMilliseconds(prev => {
          if (prev >= 990) {
            setSeconds(prevSec => {
              if (prevSec >= 59) {
                setMinutes(prevMin => prevMin + 1)
                return 0
              }
              return prevSec + 1
            })
            return 0
          }
          return prev + 10
        })
      }, 10)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [gameStarted, gameWon])

  // Reset timer when starting a new game
  useEffect(() => {
    setGameStarted(false)
    setMinutes(0)
    setSeconds(0)
    setMilliseconds(0)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [grid]) // Reset when grid changes (new game)

  // Handle game won state
  useEffect(() => {
    if (gameWon && gameStarted) {
      const min = minutes.toString().padStart(2, '0')
      const sec = seconds.toString().padStart(2, '0')
      const ms = Math.floor(milliseconds / 10).toString().padStart(2, '0')
      setFinalTime(`${min}:${sec}:${ms}`)
      setCongratulationOpen(true)
    }
  }, [gameWon, gameStarted])

  // Prevent body scrolling on mobile word search
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden'
      document.body.style.height = '100vh'
      document.body.style.touchAction = 'none'
      
      return () => {
        document.body.style.overflow = ''
        document.body.style.height = ''
        document.body.style.touchAction = ''
      }
    }
  }, [isMobile])

  // Global event handlers to end selection when drag ends outside grid
  useEffect(() => {
    const handleGlobalEnd = () => {
      if (isDragging) {
        setIsDragging(false)
        setStartCell(null)
        setCurrentCell(null)
        dispatch(endSelection())
      }
    }

    document.addEventListener('mouseup', handleGlobalEnd)
    document.addEventListener('touchend', handleGlobalEnd)
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalEnd)
      document.removeEventListener('touchend', handleGlobalEnd)
    }
  }, [isDragging, dispatch])

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    const newDifficulty = event.target.value as 'easy' | 'medium' | 'hard'
    dispatch(newGame({ difficulty: newDifficulty }))
  }

  const handleNewGame = () => {
    setCongratulationOpen(false)
    dispatch(newGame({ difficulty }))
  }

  // Simplified function to get cell from coordinates
  const getCellFromCoordinates = useCallback((clientX: number, clientY: number): { row: number; col: number } | null => {
    if (!gridRef.current) return null
    
    // Use elementFromPoint to directly find which cell element is under the coordinates
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

  // Unified start handler for both mouse and touch
  const handleSelectionStart = (row: number, col: number) => {
    setIsDragging(true)
    setStartCell({ row, col })
    setCurrentCell({ row, col })
    dispatch(startSelection({ row, col }))
  }

  // Unified move handler for both mouse and touch
  const handleSelectionMove = (clientX: number, clientY: number) => {
    if (!isDragging || !startCell) return

    const cell = getCellFromCoordinates(clientX, clientY)
    if (cell && (!currentCell || cell.row !== currentCell.row || cell.col !== currentCell.col)) {
      setCurrentCell(cell)
      dispatch(updateSelection({ row: cell.row, col: cell.col }))
    }
  }

  // Unified end handler for both mouse and touch
  const handleSelectionEnd = () => {
    if (isDragging) {
      setIsDragging(false)
      setStartCell(null)
      setCurrentCell(null)
      dispatch(endSelection())
    }
  }

  // Mouse event handlers
  const handleMouseDown = (row: number, col: number) => {
    handleSelectionStart(row, col)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    handleSelectionMove(event.clientX, event.clientY)
  }

  const handleMouseUp = () => {
    handleSelectionEnd()
  }

  // Touch event handlers
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

  // Click handler for single cell selection
  const handleCellClick = (row: number, col: number) => {
    if (!isDragging) {
      dispatch(startSelection({ row, col }))
      dispatch(endSelection())
    }
  }

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some((cell: { row: number; col: number }) => cell.row === row && cell.col === col)
  }

  const isCellInFoundWord = (row: number, col: number) => {
    return foundWordPositions.some((wordPosition: { word: string; cells: Array<{ row: number; col: number }> }) =>
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
      borderRadius: '8px',
      cursor: 'pointer',
      userSelect: 'none' as const,
      fontSize: fontSize,
      fontWeight: 'bold',
      transition: 'all 0.1s ease',
      touchAction: 'none',
      position: 'relative' as const,
      zIndex: 1,
      margin: isMobile ? '1px' : '2px',
      boxSizing: 'border-box' as const
    }

    // Special styling for start cell during dragging
    if (isDraggingStart) {
      return {
        ...baseStyle,
        backgroundColor: '#ffc107',
        color: '#f57f17',
        border: '3px solid #ff8f00',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(255, 193, 7, 0.5)',
        transform: 'scale(1.1)',
        zIndex: 10
      }
    }

    // Special styling for current cell during dragging
    if (isDraggingCurrent) {
      return {
        ...baseStyle,
        backgroundColor: '#ffeb3b',
        color: '#f57f17',
        border: '3px solid #ffc107',
        borderRadius: '10px',
        boxShadow: '0 0 8px rgba(255, 235, 59, 0.4)',
        transform: 'scale(1.05)',
        zIndex: 9
      }
    }

    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: '#ffeb3b',
        color: '#f57f17',
        border: '2px solid #ffc107',
        borderRadius: '9px',
        zIndex: 6
      }
    }

    if (isInCurrentPath) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(255, 235, 59, 0.4)',
        color: '#f57f17',
        border: '2px solid #ffeb3b',
        borderRadius: '9px',
        boxShadow: '0 0 5px rgba(255, 235, 59, 0.4)',
        zIndex: 8
      }
    }

    if (isInFoundWord) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(76, 175, 80, 0.3)', // Light green
        color: '#2e7d32',
        border: '1px solid #4caf50',
        borderRadius: '8px',
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

  // Function to render lines through found words
  const renderFoundWordLines = () => {
    if (!gridRef.current || foundWordPositions.length === 0) return null
    
    const cellSize = isMobile ? window.innerWidth * 0.08 : 40
    const cellMargin = isMobile ? 2 : 4
    const cellWithMargin = cellSize + cellMargin
    const gridPadding = isMobile ? 8 : 16
    const borderWidth = 2
    const gridWidth = grid[0].length * cellWithMargin + (gridPadding + borderWidth) * 2
    const gridHeight = grid.length * cellWithMargin + (gridPadding + borderWidth) * 2
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 3 // Below active selection (5) but above found word cells (2)
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
          {foundWordPositions.map((wordPosition: { word: string; cells: Array<{ row: number; col: number }> }, index: number) => {
            if (wordPosition.cells.length < 2) return null
            
            const firstCell = wordPosition.cells[0]
            const lastCell = wordPosition.cells[wordPosition.cells.length - 1]
            
            // Simplified coordinate calculation - cell center is at col/row * cellWithMargin + cellSize/2 + offset
            const startX = firstCell.col * cellWithMargin + cellSize / 2 + gridPadding + borderWidth
            const startY = firstCell.row * cellWithMargin + cellSize / 2 + gridPadding + borderWidth
            const endX = lastCell.col * cellWithMargin + cellSize / 2 + gridPadding + borderWidth
            const endY = lastCell.row * cellWithMargin + cellSize / 2 + gridPadding + borderWidth
            
            return (
              <line
                key={`found-word-line-${index}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#4caf50"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
            )
          })}
        </svg>
      </Box>
    )
  }

  // Simplified selection line rendering
  const renderSelectionLine = () => {
    if (!isDragging || !startCell || !currentCell || !gridRef.current) return null
    
    const cellSize = isMobile ? window.innerWidth * 0.08 : 40
    const cellMargin = isMobile ? 2 : 4
    const cellWithMargin = cellSize + cellMargin
    const gridPadding = isMobile ? 8 : 16
    const borderWidth = 2
    
    // Use the same coordinate calculation as found word lines for consistency
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
    const pathWidth = cellSize * 1.05
    
    const validColor = isValidDirection ? "rgba(230, 220, 15, 0.5)" : "rgba(220, 190, 30, 0.5)"
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 7 // Above path cells (5) and found word cells (2)
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
            opacity="0.8"
          />
        </svg>
      </Box>
    )
  }



  const handleCongratulationClose = () => {
    setCongratulationOpen(false)
  }

  const handlePlayAgainFromCongratulation = () => {
    setCongratulationOpen(false)
    handleNewGame()
  }

  const handleGoHome = () => {
    navigate('/word-search')
  }

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return '#4caf50'
      case 'medium': return '#ff9800'
      case 'hard': return '#f44336'
      default: return '#2196f3'
    }
  }

  const getDifficultyStars = (diff: string) => {
    switch (diff) {
      case 'easy': return 1
      case 'medium': return 2
      case 'hard': return 3
      default: return 1
    }
  }

  // Congratulation Dialog Component
  const CongratulationDialog = () => (
    <Dialog
      open={congratulationOpen}
      onClose={handleCongratulationClose}
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
            Congratulations!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            You found all the words!
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
          {/* Time Display */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            p: 2
          }}>
            <TimerIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Completion Time
              </Typography>
              <Typography variant="h5" fontFamily="monospace" fontWeight="bold">
                {finalTime}
              </Typography>
            </Box>
          </Box>

          {/* Difficulty Display */}
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
                Difficulty:
              </Typography>
              <Typography 
                variant="h6" 
                fontWeight="bold"
                sx={{ 
                  color: getDifficultyColor(difficulty),
                  textTransform: 'capitalize'
                }}
              >
                {difficulty}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[...Array(getDifficultyStars(difficulty))].map((_, i) => (
                  <StarIcon key={i} sx={{ color: '#ffd700', fontSize: 20 }} />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Words Found */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            p: 2
          }}>
            <EmojiEvents sx={{ fontSize: 24 }} />
            <Typography variant="h6">
              {foundWords.length} words found!
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
        <Button
          variant="contained"
          onClick={handlePlayAgainFromCongratulation}
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
          onClick={handleGoHome}
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
          Back to Games
        </Button>
      </DialogActions>
    </Dialog>
  )

  // Mobile full-screen layout
  if (isMobile) {
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
              Classic Word Search
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80, mr: 1 }}>
              <Select
                value={difficulty}
                onChange={handleDifficultyChange}
                variant="outlined"
                sx={{ 
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                  '& .MuiSvgIcon-root': { color: 'white' }
                }}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
            <IconButton color="inherit" onClick={handleNewGame}>
              <Refresh />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Game Grid Container */}
        <Box sx={{ 
          pt: '48px', // Account for header height
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {/* Timer */}
          <Box sx={{ mb: 2 }}>
            <GameTimer
              minutes={minutes}
              seconds={seconds}
              milliseconds={milliseconds}
              isGameStarted={gameStarted}
              isGameWon={gameWon}
            />
          </Box>

          <Box 
            ref={gridRef}
            sx={{ 
              display: 'inline-block', 
              p: 1, 
              border: '2px solid #ccc',
              borderRadius: 1,
              backgroundColor: '#f9f9f9',
              touchAction: 'none',
              position: 'relative',
              overflow: 'visible',
              filter: !gameStarted ? 'blur(5px)' : 'none',
              pointerEvents: !gameStarted ? 'none' : 'auto'
            }}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {grid.map((row: string[], rowIndex: number) => (
              <Box key={rowIndex} sx={{ display: 'flex' }}>
                {row.map((cell: string, colIndex: number) => (
                  <Box
                    key={`${rowIndex}-${colIndex}`}
                    data-cell={`${rowIndex}-${colIndex}`}
                    sx={getCellStyle(rowIndex, colIndex)}
                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                    onMouseUp={handleMouseUp}
                    onTouchStart={(e) => handleTouchStart(e, rowIndex, colIndex)}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell}
                  </Box>
                ))}
              </Box>
            ))}
            {renderFoundWordLines()}
            {renderSelectionLine()}
          </Box>
          
          {/* Play Button Overlay */}
          {!gameStarted && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                cursor: 'pointer'
              }}
              onClick={handleStartGame}
              onTouchStart={handleStartGame}
            >
              <IconButton
                size="large"
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  width: 60,
                  height: 60,
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }}
              >
                <PlayArrow sx={{ fontSize: 36 }} />
              </IconButton>
            </Box>
          )}
          
          {/* Word Counter */}
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`${foundWords.length}/${words.length} words found`}
              color="primary"
              variant="outlined"
              size="medium"
            />
          </Box>
        </Box>

        {/* Word Bank Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => setWordBankOpen(true)}
        >
          <ListIcon />
        </Fab>

        {/* Word Bank Drawer */}
        <WordBank
          words={words}
          foundWords={foundWords}
          isOpen={wordBankOpen}
          onClose={() => setWordBankOpen(false)}
          isMobile={true}
        />
        
        {/* Congratulation Dialog */}
        <CongratulationDialog />
      </Box>
    )
  }

  // Desktop layout
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h3" component="h1">
          Classic Word Search
        </Typography>
      </Box>
      <Typography variant="h6" color="text.secondary" paragraph>
        Find all the hidden words in the grid by clicking and dragging over them (works on mobile too!)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  Game Grid
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={difficulty}
                      label="Difficulty"
                      onChange={handleDifficultyChange}
                    >
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                  <GameButton
                    variant="primary"
                    icon={<Refresh />}
                    onClick={handleNewGame}
                  >
                    New Game
                  </GameButton>
                </Box>
              </Box>

              {/* Timer */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <GameTimer
                  minutes={minutes}
                  seconds={seconds}
                  milliseconds={milliseconds}
                  isGameStarted={gameStarted}
                  isGameWon={gameWon}
                />
              </Box>

              <Box 
                ref={gridRef}
                sx={{ 
                  display: 'inline-block', 
                  position: 'relative',
                  overflow: 'visible',
                  filter: !gameStarted ? 'blur(5px)' : 'none',
                  pointerEvents: !gameStarted ? 'none' : 'auto'
                }}
              >
                <GameGrid
                  grid={grid}
                  getCellStyle={getCellStyle}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  selectionLineRenderer={() => (
                    <>
                      {renderFoundWordLines()}
                      {renderSelectionLine()}
                    </>
                  )}
                />
              </Box>

              {/* Play Button Overlay */}
              {!gameStarted && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                    cursor: 'pointer'
                  }}
                  onClick={handleStartGame}
                >
                  <IconButton
                    size="large"
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      width: 80,
                      height: 80,
                      '&:hover': {
                        backgroundColor: 'primary.dark'
                      }
                    }}
                  >
                    <PlayArrow sx={{ fontSize: 48 }} />
                  </IconButton>
                </Box>
              )}

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Chip 
                  label={`${foundWords.length}/${words.length} words found`}
                  color="primary"
                  variant="outlined"
                  size="medium"
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Instructions: Click and drag across letters to select words. Words can be horizontal, vertical, or diagonal. Works on touch devices too!
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                <Search sx={{ mr: 1, verticalAlign: 'middle' }} />
                Find These Words
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Progress: {foundWords.length} / {words.length} words found
                </Typography>
              </Box>

              <List dense>
                {words.map((word: string, index: number) => (
                  <ListItem key={index} disablePadding>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        width: '100%', 
                        p: 1, 
                        mb: 1,
                        backgroundColor: foundWords.includes(word) ? '#e8f5e8' : 'white'
                      }}
                    >
                      <ListItemText 
                        primary={word}
                        primaryTypographyProps={{ 
                          style: {
                            textDecoration: foundWords.includes(word) ? 'line-through' : 'none',
                            color: foundWords.includes(word) ? 'text.secondary' : 'text.primary',
                            fontWeight: foundWords.includes(word) ? 'normal' : 'bold'
                          }
                        }}
                      />
                    </Paper>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Congratulation Dialog */}
      <CongratulationDialog />
    </Container>
  )
}