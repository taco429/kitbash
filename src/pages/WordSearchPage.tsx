import { useEffect, useState } from 'react'
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
  const { grid, words, foundWords, selectedCells, gameWon, difficulty } = useAppSelector((state: any) => state.wordSearch)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    // Start a new game when component mounts
    dispatch(newGame({ difficulty: 'easy' }))
  }, [dispatch])

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    const newDifficulty = event.target.value as 'easy' | 'medium' | 'hard'
    dispatch(newGame({ difficulty: newDifficulty }))
  }

  const handleNewGame = () => {
    dispatch(newGame({ difficulty }))
  }

  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true)
    dispatch(startSelection({ row, col }))
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging) {
      dispatch(updateSelection({ row, col }))
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
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

  const getCellStyle = (row: number, col: number) => {
    const isSelected = isCellSelected(row, col)
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
      transition: 'all 0.2s ease'
    }

    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: '#2196f3',
        color: 'white'
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
        Find all the hidden words in the grid by clicking and dragging over them
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
                sx={{ 
                  display: 'inline-block', 
                  p: 2, 
                  border: '2px solid #ccc',
                  borderRadius: 1,
                  backgroundColor: '#f9f9f9'
                }}
                onMouseLeave={() => {
                  if (isDragging) {
                    setIsDragging(false)
                    dispatch(clearSelection())
                  }
                }}
              >
                                 {grid.map((row: string[], rowIndex: number) => (
                   <Box key={rowIndex} sx={{ display: 'flex' }}>
                     {row.map((cell: string, colIndex: number) => (
                      <Box
                        key={`${rowIndex}-${colIndex}`}
                        sx={getCellStyle(rowIndex, colIndex)}
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                        onMouseUp={handleMouseUp}
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
                  Instructions: Click and drag across letters to select words. Words can be horizontal, vertical, or diagonal.
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