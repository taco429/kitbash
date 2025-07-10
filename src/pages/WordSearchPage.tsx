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
} from '@mui/material'
import { 
  Refresh, 
  EmojiEvents, 
  Search, 
  ArrowBack,
  List as ListIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { newGame, startSelection, updateSelection, endSelection } from '../store/wordSearchSlice'
import { useNavigate } from 'react-router-dom'

export const WordSearchPage = () => {
  const dispatch = useAppDispatch()
  const { grid, words, foundWords, foundWordPositions, selectedCells, gameWon, difficulty } = useAppSelector((state: any) => state.wordSearch)
  const [isDragging, setIsDragging] = useState(false)
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null)
  const [currentCell, setCurrentCell] = useState<{ row: number; col: number } | null>(null)
  const [wordBankOpen, setWordBankOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  
  // Mobile detection
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // Navigation
  const navigate = useNavigate()
  const handleBack = () => {
    navigate('/')
  }

  useEffect(() => {
    // Start a new game when component mounts
    dispatch(newGame({ difficulty: 'easy' }))
  }, [dispatch])

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
    
    const baseStyle = {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #ccc',
      borderRadius: '8px',
      cursor: 'pointer',
      userSelect: 'none' as const,
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'all 0.1s ease',
      touchAction: 'none',
      position: 'relative' as const,
      zIndex: 1,
      margin: '2px',
      boxSizing: 'border-box' as const
    }

    // Special styling for start cell during dragging
    if (isDraggingStart) {
      return {
        ...baseStyle,
        backgroundColor: '#1565c0',
        color: 'white',
        border: '3px solid #0d47a1',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(21, 101, 192, 0.5)',
        transform: 'scale(1.1)',
        zIndex: 10
      }
    }

    // Special styling for current cell during dragging
    if (isDraggingCurrent) {
      return {
        ...baseStyle,
        backgroundColor: '#1976d2',
        color: 'white',
        border: '3px solid #1565c0',
        borderRadius: '10px',
        boxShadow: '0 0 8px rgba(25, 118, 210, 0.4)',
        transform: 'scale(1.05)',
        zIndex: 9
      }
    }

    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: '#2196f3',
        color: 'white',
        border: '2px solid #1976d2',
        borderRadius: '9px',
        zIndex: 6
      }
    }

    if (isInCurrentPath) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(33, 150, 243, 0.4)',
        color: '#1976d2',
        border: '2px solid #2196f3',
        borderRadius: '9px',
        boxShadow: '0 0 5px rgba(33, 150, 243, 0.4)',
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
    
    const cellSize = 40
    const cellMargin = 4
    const cellWithMargin = cellSize + cellMargin
    const gridPadding = 16
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
    
    const cellSize = 40
    const cellMargin = 4
    const cellWithMargin = cellSize + cellMargin
    const gridPadding = 16
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
          zIndex: 5
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

  const getWordItemStyle = (word: string) => {
    const isFound = foundWords.includes(word)
    return {
      textDecoration: isFound ? 'line-through' : 'none',
      color: isFound ? '#4caf50' : 'inherit',
      fontWeight: isFound ? 'bold' : 'normal'
    }
  }

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
              Word Search
            </Typography>
            <Chip 
              label={`${foundWords.length}/${words.length}`}
              size="small"
              sx={{ 
                mr: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '0.75rem'
              }}
            />
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
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
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
              overflow: 'visible'
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
        <Drawer
          anchor="right"
          open={wordBankOpen}
          onClose={() => setWordBankOpen(false)}
          sx={{
            zIndex: 1200,
            '& .MuiDrawer-paper': {
              width: '280px',
              maxWidth: '80vw'
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Find These Words
              </Typography>
              <IconButton onClick={() => setWordBankOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Progress: {foundWords.length} / {words.length} words found
            </Typography>

            {gameWon && (
              <Chip 
                icon={<EmojiEvents />} 
                label="All words found!" 
                color="success" 
                size="medium"
                sx={{ mb: 2, width: '100%' }}
              />
            )}

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
                      primaryTypographyProps={{ style: getWordItemStyle(word) }}
                    />
                  </Paper>
                </ListItem>
              ))}
            </List>

            {gameWon && (
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={() => {
                  handleNewGame()
                  setWordBankOpen(false)
                }}
                startIcon={<Refresh />}
                sx={{ mt: 2 }}
              >
                Play Again
              </Button>
            )}
          </Box>
        </Drawer>
      </Box>
    )
  }

  // Desktop layout
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Word Search Game
      </Typography>
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
                  <Chip 
                    label={`${foundWords.length}/${words.length} words`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
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
                  <Button
                    variant="contained"
                    onClick={handleNewGame}
                    startIcon={<Refresh />}
                  >
                    New Game
                  </Button>
                </Box>
              </Box>

              {gameWon && (
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    icon={<EmojiEvents />} 
                    label="Congratulations! You found all words!" 
                    color="success" 
                    size="medium"
                  />
                </Box>
              )}

              <Box 
                ref={gridRef}
                sx={{ 
                  display: 'inline-block', 
                  p: 2, 
                  border: '2px solid #ccc',
                  borderRadius: 1,
                  backgroundColor: '#f9f9f9',
                  touchAction: 'none',
                  position: 'relative',
                  overflow: 'visible'
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
                        primaryTypographyProps={{ style: getWordItemStyle(word) }}
                      />
                    </Paper>
                  </ListItem>
                ))}
              </List>

              {gameWon && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={handleNewGame}
                    startIcon={<Refresh />}
                  >
                    Play Again
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}