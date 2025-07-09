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
  SelectChangeEvent
} from '@mui/material'
import { Refresh, EmojiEvents, Search } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { newGame, startSelection, updateSelection, endSelection, clearSelection } from '../store/wordSearchSlice'

export const WordSearchPage = () => {
  const dispatch = useAppDispatch()
  const { grid, words, foundWords, selectedCells, gameWon, difficulty, isSelecting, selectionStart, selectionEnd } = useAppSelector((state: any) => state.wordSearch)
  const [isDragging, setIsDragging] = useState(false)
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null)
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Start a new game when component mounts
    dispatch(newGame({ difficulty: 'easy' }))
  }, [dispatch])

  // Add global mouse up handler to handle cases where mouse up happens outside the grid
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        dispatch(endSelection())
      }
    }

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false)
        dispatch(endSelection())
      }
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('touchend', handleGlobalTouchEnd)
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('touchend', handleGlobalTouchEnd)
    }
  }, [isDragging, dispatch])

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    const newDifficulty = event.target.value as 'easy' | 'medium' | 'hard'
    dispatch(newGame({ difficulty: newDifficulty }))
  }

  const handleNewGame = () => {
    dispatch(newGame({ difficulty }))
  }

  // Utility function to get cell coordinates from a touch or mouse event
  const getCellFromEvent = useCallback((event: React.TouchEvent | React.MouseEvent, clientX: number, clientY: number) => {
    if (!gridRef.current) return null
    
    const gridRect = gridRef.current.getBoundingClientRect()
    const relativeX = clientX - gridRect.left
    const relativeY = clientY - gridRect.top
    
    // Calculate cell size based on grid dimensions
    const cellSize = 40 // Base cell size
    const borderWidth = 2 // Grid border
    const padding = 16 // Grid padding
    
    const adjustedX = relativeX - borderWidth - padding
    const adjustedY = relativeY - borderWidth - padding
    
    const col = Math.floor(adjustedX / cellSize)
    const row = Math.floor(adjustedY / cellSize)
    
    // Validate bounds
    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      return { row, col }
    }
    
    return null
  }, [grid])

  // Debounced update selection to prevent rapid updates
  const debouncedUpdateSelection = useCallback((row: number, col: number) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      dispatch(updateSelection({ row, col }))
    }, 16) // ~60fps update rate
  }, [dispatch])

  // Mouse event handlers
  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true)
    setStartCell({ row, col })
    dispatch(startSelection({ row, col }))
  }

  const handleMouseEnter = (row: number, col: number) => {
    setHoverCell({ row, col })
    if (isDragging && startCell) {
      // Only update if we're significantly moving from the start position
      const distance = Math.abs(row - startCell.row) + Math.abs(col - startCell.col)
      if (distance > 0) {
        debouncedUpdateSelection(row, col)
      }
    }
  }

  const handleMouseLeave = () => {
    setHoverCell(null)
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      setStartCell(null)
      dispatch(endSelection())
    }
  }

  // Touch event handlers
  const handleTouchStart = (event: React.TouchEvent, row: number, col: number) => {
    event.preventDefault()
    setIsDragging(true)
    setStartCell({ row, col })
    dispatch(startSelection({ row, col }))
  }

  const handleTouchMove = (event: React.TouchEvent) => {
    event.preventDefault()
    if (!isDragging || !startCell) return
    
    const touch = event.touches[0]
    const cell = getCellFromEvent(event, touch.clientX, touch.clientY)
    
    if (cell) {
      const distance = Math.abs(cell.row - startCell.row) + Math.abs(cell.col - startCell.col)
      if (distance > 0) {
        debouncedUpdateSelection(cell.row, cell.col)
      }
    }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    event.preventDefault()
    if (isDragging) {
      setIsDragging(false)
      setStartCell(null)
      dispatch(endSelection())
    }
  }

  const handleCellClick = (row: number, col: number) => {
    if (!isDragging) {
      dispatch(startSelection({ row, col }))
      dispatch(endSelection())
    }
  }

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some((cell: { row: number; col: number }) => cell.row === row && cell.col === col)
  }

  const isCellInHoverPath = (row: number, col: number) => {
    if (!hoverCell || !startCell || !isDragging) return false
    
    const deltaRow = hoverCell.row - startCell.row
    const deltaCol = hoverCell.col - startCell.col
    
    // Only show hover path for valid directions (horizontal, vertical, diagonal)
    if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
      const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol))
      const stepRow = steps === 0 ? 0 : deltaRow / steps
      const stepCol = steps === 0 ? 0 : deltaCol / steps
      
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
    const isInHoverPath = isCellInHoverPath(row, col)
    const isStartCell = startCell && startCell.row === row && startCell.col === col
    const isEndCell = selectionEnd && selectionEnd.row === row && selectionEnd.col === col
    
    const baseStyle = {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #ccc',
      cursor: 'pointer',
      userSelect: 'none' as const,
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'all 0.1s ease',
      touchAction: 'none' // Prevent default touch behaviors
    }

    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: isStartCell ? '#1976d2' : isEndCell ? '#1565c0' : '#2196f3',
        color: 'white',
        border: '2px solid #1976d2'
      }
    }

    if (isInHoverPath) {
      return {
        ...baseStyle,
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        border: '2px solid #2196f3'
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

  const getWordItemStyle = (word: string) => {
    const isFound = foundWords.includes(word)
    return {
      textDecoration: isFound ? 'line-through' : 'none',
      color: isFound ? '#4caf50' : 'inherit',
      fontWeight: isFound ? 'bold' : 'normal'
    }
  }

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
                  touchAction: 'none' // Prevent default touch behaviors
                }}
                onMouseLeave={() => {
                  setHoverCell(null)
                  if (isDragging) {
                    setIsDragging(false)
                    setStartCell(null)
                    dispatch(clearSelection())
                  }
                }}
                onTouchMove={handleTouchMove}
              >
                {grid.map((row: string[], rowIndex: number) => (
                  <Box key={rowIndex} sx={{ display: 'flex' }}>
                    {row.map((cell: string, colIndex: number) => (
                      <Box
                        key={`${rowIndex}-${colIndex}`}
                        sx={getCellStyle(rowIndex, colIndex)}
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                        onMouseLeave={handleMouseLeave}
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