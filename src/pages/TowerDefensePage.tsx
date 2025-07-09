import React, { useEffect, useRef, useCallback } from 'react'
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  ButtonGroup,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  PlayArrow,
  Pause,
  Refresh,
  Security,
  Speed,
  Whatshot
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import {
  startGame,
  pauseGame,
  resetGame,
  selectTowerType,
  placeTower,
  spawnEnemy,
  updateEnemies,
  updateTowers,
  updateProjectiles,
  gameOver
} from '../store/towerDefenseSlice'
import { 
  GAME_CONFIG, 
  GAME_PATH, 
  TOWER_TYPES, 
  Position,
  Tower,
  Enemy,
  Projectile 
} from '../types/towerDefense'

export const TowerDefensePage = () => {
  const dispatch = useAppDispatch()
  const gameState = useAppSelector((state) => state.towerDefense)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()

  const gameLoop = useCallback(() => {
    if (!gameState.isRunning || gameState.isPaused) return

    dispatch(spawnEnemy())
    dispatch(updateEnemies())
    dispatch(updateTowers())
    dispatch(updateProjectiles())

    if (gameState.lives <= 0) {
      dispatch(gameOver())
    }
  }, [dispatch, gameState.isRunning, gameState.isPaused, gameState.lives])

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 1
    for (let x = 0; x <= canvas.width; x += GAME_CONFIG.GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= canvas.height; y += GAME_CONFIG.GRID_SIZE) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw path
    ctx.strokeStyle = '#8BC34A'
    ctx.lineWidth = 20
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(GAME_PATH[0].x, GAME_PATH[0].y)
    for (let i = 1; i < GAME_PATH.length; i++) {
      ctx.lineTo(GAME_PATH[i].x, GAME_PATH[i].y)
    }
    ctx.stroke()

    // Draw towers
    gameState.towers.forEach((tower: Tower) => {
      const towerType = TOWER_TYPES[tower.type]
      
      // Draw range circle if tower is selected
      if (gameState.selectedTowerType === tower.type) {
        ctx.strokeStyle = towerType.color + '40'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(tower.position.x, tower.position.y, tower.range, 0, 2 * Math.PI)
        ctx.stroke()
      }

      // Draw tower
      ctx.fillStyle = towerType.color
      ctx.beginPath()
      ctx.arc(tower.position.x, tower.position.y, 15, 0, 2 * Math.PI)
      ctx.fill()

      // Draw tower border
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw enemies
    gameState.enemies.forEach((enemy: Enemy) => {
      // Draw health bar
      const healthBarWidth = 30
      const healthBarHeight = 4
      const healthPercentage = enemy.health / enemy.maxHealth

      ctx.fillStyle = '#f44336'
      ctx.fillRect(
        enemy.position.x - healthBarWidth / 2,
        enemy.position.y - 20,
        healthBarWidth,
        healthBarHeight
      )

      ctx.fillStyle = '#4CAF50'
      ctx.fillRect(
        enemy.position.x - healthBarWidth / 2,
        enemy.position.y - 20,
        healthBarWidth * healthPercentage,
        healthBarHeight
      )

      // Draw enemy
      ctx.fillStyle = '#FF5722'
      ctx.beginPath()
      ctx.arc(enemy.position.x, enemy.position.y, 12, 0, 2 * Math.PI)
      ctx.fill()

      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw projectiles
    gameState.projectiles.forEach((projectile: Projectile) => {
      ctx.fillStyle = '#FFC107'
      ctx.beginPath()
      ctx.arc(projectile.position.x, projectile.position.y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw placement preview
    if (gameState.selectedTowerType) {
      const rect = canvas.getBoundingClientRect()
      // This would need mouse position tracking to work properly
      // For now, we'll just show the selected tower type
    }
  }, [gameState])

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState.selectedTowerType) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    dispatch(placeTower({ x, y }))
  }, [dispatch, gameState.selectedTowerType])

  const handleTowerSelect = (towerType: Tower['type']) => {
    dispatch(selectTowerType(towerType))
  }

  const handleStartGame = () => {
    dispatch(startGame())
  }

  const handlePauseGame = () => {
    dispatch(pauseGame())
  }

  const handleResetGame = () => {
    dispatch(resetGame())
  }

  useEffect(() => {
    if (gameState.isRunning && !gameState.isPaused) {
      gameLoopRef.current = window.setInterval(gameLoop, 50)
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameLoop, gameState.isRunning, gameState.isPaused])

  useEffect(() => {
    drawGame()
  }, [drawGame, gameState])

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Tower Defense Demo
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        A simple tower defense game built with React, Canvas, and Redux
      </Typography>

      <Grid container spacing={3}>
        {/* Game Canvas */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Game Board</Typography>
              <ButtonGroup variant="contained" size="small">
                <Button
                  onClick={handleStartGame}
                  disabled={gameState.isRunning && !gameState.isPaused}
                  startIcon={<PlayArrow />}
                >
                  Start
                </Button>
                <Button
                  onClick={handlePauseGame}
                  disabled={!gameState.isRunning}
                  startIcon={<Pause />}
                >
                  {gameState.isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  onClick={handleResetGame}
                  startIcon={<Refresh />}
                >
                  Reset
                </Button>
              </ButtonGroup>
            </Box>

            <canvas
              ref={canvasRef}
              width={GAME_CONFIG.CANVAS_WIDTH}
              height={GAME_CONFIG.CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              style={{
                border: '2px solid #ccc',
                borderRadius: '8px',
                cursor: gameState.selectedTowerType ? 'crosshair' : 'default',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </Paper>
        </Grid>

        {/* Game UI */}
        <Grid item xs={12} md={4}>
          {/* Game Stats */}
          <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Game Stats
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Score:</Typography>
                <Typography variant="body2" fontWeight="bold">{gameState.score}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Money:</Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  ${gameState.money}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Lives:</Typography>
                <Typography variant="body2" fontWeight="bold" color="error.main">
                  {gameState.lives}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Level:</Typography>
                <Typography variant="body2" fontWeight="bold">{gameState.level}</Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Health
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(gameState.lives / GAME_CONFIG.INITIAL_LIVES) * 100}
                color={gameState.lives > 10 ? 'success' : gameState.lives > 5 ? 'warning' : 'error'}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`Enemies: ${gameState.enemies.length}`}
                size="small"
                color="error"
                variant="outlined"
              />
              <Chip
                label={`Towers: ${gameState.towers.length}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Projectiles: ${gameState.projectiles.length}`}
                size="small"
                color="warning"
                variant="outlined"
              />
            </Box>
          </Paper>

          {/* Tower Selection */}
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Towers
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select a tower type and click on the game board to place it
            </Typography>

            <Grid container spacing={1}>
              {Object.values(TOWER_TYPES).map((towerType) => (
                <Grid item xs={12} key={towerType.type}>
                  <Card
                    variant={gameState.selectedTowerType === towerType.type ? "elevation" : "outlined"}
                    sx={{
                      cursor: gameState.money >= towerType.cost ? 'pointer' : 'not-allowed',
                      opacity: gameState.money >= towerType.cost ? 1 : 0.5,
                      border: gameState.selectedTowerType === towerType.type ? 2 : 1,
                      borderColor: gameState.selectedTowerType === towerType.type ? towerType.color : 'divider'
                    }}
                    onClick={() => gameState.money >= towerType.cost && handleTowerSelect(towerType.type)}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          sx={{ 
                            bgcolor: towerType.color,
                            color: 'white',
                            '&:hover': { bgcolor: towerType.color }
                          }}
                        >
                          {towerType.type === 'basic' && <Security />}
                          {towerType.type === 'fast' && <Speed />}
                          {towerType.type === 'heavy' && <Whatshot />}
                        </IconButton>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2">
                            {towerType.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ${towerType.cost} • DMG: {towerType.damage} • RNG: {towerType.range}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {gameState.selectedTowerType && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => dispatch(selectTowerType(null))}
                  fullWidth
                >
                  Cancel Selection
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
} 