import { useEffect, useState, useRef } from 'react'
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
  PlayArrow,
  Home as HomeIcon,
  Timer as TimerIcon,
  Star as StarIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { newGame, startSelection, updateSelection, endSelection } from '../store/wordSearchSlice'
import { GameGrid, WordBank, GameTimer } from '../components/games/word-search'
import { GameButton } from '../components/shared'
import { useDragSelection, useCellStyles, useSelectionLineRenderer, useFoundWordLineRenderer } from '../hooks'

export const ClassicWordSearchPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { grid, words, foundWords, foundWordPositions, selectedCells, gameWon, difficulty } = useAppSelector((state: any) => state.wordSearch)
  const [wordBankOpen, setWordBankOpen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [milliseconds, setMilliseconds] = useState(0)
  const [congratulationOpen, setCongratulationOpen] = useState(false)
  const [finalTime, setFinalTime] = useState('')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Use the extracted drag selection hook
  const dragSelection = useDragSelection({
    grid,
    onSelectionStart: (cell) => {
      dispatch(startSelection({ row: cell.row, col: cell.col }))
    },
    onSelectionUpdate: (_, currentCell) => {
      dispatch(updateSelection({ row: currentCell.row, col: currentCell.col }))
    },
    onSelectionEnd: () => {
      dispatch(endSelection())
    }
  })
  
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

  // Global event handlers are now handled by the drag selection hook

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    const newDifficulty = event.target.value as 'easy' | 'medium' | 'hard'
    dispatch(newGame({ difficulty: newDifficulty }))
  }

  const handleNewGame = () => {
    setCongratulationOpen(false)
    dispatch(newGame({ difficulty }))
  }

  // Click handler for single cell selection
  const handleCellClick = (row: number, col: number) => {
    if (!dragSelection.dragState.isDragging) {
      dispatch(startSelection({ row, col }))
      dispatch(endSelection())
    }
  }

  // Extract found word cells for the cell styles hook
  const foundWordCells = foundWordPositions.flatMap((wordPosition: { word: string; cells: Array<{ row: number; col: number }> }) => 
    wordPosition.cells
  )

  // Use the extracted cell styles hook
  const cellStyles = useCellStyles({
    isMobile,
    selectedCells,
    foundWordCells,
    isDragging: dragSelection.dragState.isDragging,
    startCell: dragSelection.dragState.startCell,
    currentCell: dragSelection.dragState.currentCell
  })

  // Use the extracted line renderer hooks
  const selectionLineRenderer = useSelectionLineRenderer({
    grid,
    isDragging: dragSelection.dragState.isDragging,
    startCell: dragSelection.dragState.startCell,
    currentCell: dragSelection.dragState.currentCell,
    isMobile
  })

  const foundWordLineRenderer = useFoundWordLineRenderer({
    grid,
    foundWordPositions,
    isMobile
  })

  // Rendering functions are now handled by hooks



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
            ref={dragSelection.gridRef}
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
            onMouseMove={dragSelection.handleMouseMove}
            onTouchMove={dragSelection.handleTouchMove}
          >
            {grid.map((row: string[], rowIndex: number) => (
              <Box key={rowIndex} sx={{ display: 'flex' }}>
                {row.map((cell: string, colIndex: number) => (
                  <Box
                    key={`${rowIndex}-${colIndex}`}
                    data-cell={`${rowIndex}-${colIndex}`}
                    sx={cellStyles.getCellStyle(rowIndex, colIndex)}
                    onMouseDown={() => dragSelection.handleMouseDown(rowIndex, colIndex)}
                    onMouseUp={dragSelection.handleMouseUp}
                    onTouchStart={(e) => dragSelection.handleTouchStart(e, rowIndex, colIndex)}
                    onTouchEnd={dragSelection.handleTouchEnd}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell}
                  </Box>
                ))}
              </Box>
            ))}
            {foundWordLineRenderer.renderFoundWordLines()}
            {selectionLineRenderer.renderSelectionLine()}
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
                ref={dragSelection.gridRef}
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
                  getCellStyle={cellStyles.getCellStyle}
                  onMouseDown={dragSelection.handleMouseDown}
                  onMouseMove={dragSelection.handleMouseMove}
                  onMouseUp={dragSelection.handleMouseUp}
                  onTouchStart={dragSelection.handleTouchStart}
                  onTouchMove={dragSelection.handleTouchMove}
                  onTouchEnd={dragSelection.handleTouchEnd}
                  gridRef={dragSelection.gridRef}
                  selectionLineRenderer={() => (
                    <>
                      {foundWordLineRenderer.renderFoundWordLines()}
                      {selectionLineRenderer.renderSelectionLine()}
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