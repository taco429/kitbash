import React, { useEffect, useRef, useCallback } from 'react'
import {
  Container,
  Typography,
  Grid,
} from '@mui/material'
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
  gameOver,
  setGameSpeed
} from '../store/towerDefenseSlice'
import { 
  GAME_CONFIG, 
  GAME_PATH, 
  TOWER_TYPES, 
  Tower,
  Enemy,
  Projectile 
} from '../types/towerDefense'
import { GameCanvas, GameControls, GameStats, TowerSelector } from '../components/games/tower-defense'

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

    // Draw speed indicator
    if (gameState.gameSpeed > 1) {
      ctx.fillStyle = 'rgba(25, 118, 210, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = '#1976d2'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(`${gameState.gameSpeed}x SPEED`, canvas.width - 10, 25)
    }

    // Draw placement preview
    if (gameState.selectedTowerType) {
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

  const handleSpeedChange = (speed: number) => {
    dispatch(setGameSpeed(speed))
  }

  // Keyboard shortcuts for speed control
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameState.isRunning || gameState.isPaused) return
      
      switch (event.key) {
        case '1':
          handleSpeedChange(1)
          break
        case '2':
          handleSpeedChange(2)
          break
        case '4':
          handleSpeedChange(4)
          break
        case ' ':
          event.preventDefault()
          handlePauseGame()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState.isRunning, gameState.isPaused])

  useEffect(() => {
    if (gameState.isRunning && !gameState.isPaused) {
      // Base interval is 50ms, but we don't need to adjust it for speed since
      // the speed multiplier is handled in the game logic itself
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
  }, [gameLoop, gameState.isRunning, gameState.isPaused, gameState.gameSpeed])

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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <strong>Controls:</strong> Click to place towers • Keys 1/2/4 for speed • Spacebar to pause
      </Typography>

      <Grid container spacing={3}>
        {/* Game Canvas */}
        <Grid item xs={12} md={8}>
          <GameCanvas
            ref={canvasRef}
            width={GAME_CONFIG.CANVAS_WIDTH}
            height={GAME_CONFIG.CANVAS_HEIGHT}
            onClick={handleCanvasClick}
            selectedTowerType={gameState.selectedTowerType}
            title="Game Board"
            headerActions={
              <GameControls
                isRunning={gameState.isRunning}
                isPaused={gameState.isPaused}
                gameSpeed={gameState.gameSpeed}
                onStart={handleStartGame}
                onPause={handlePauseGame}
                onReset={handleResetGame}
                onSpeedChange={handleSpeedChange}
              />
            }
          />
        </Grid>

        {/* Game UI */}
        <Grid item xs={12} md={4}>
          {/* Game Stats */}
          <GameStats
            score={gameState.score}
            money={gameState.money}
            lives={gameState.lives}
            level={gameState.level}
            maxLives={GAME_CONFIG.INITIAL_LIVES}
            enemies={gameState.enemies.length}
            towers={gameState.towers.length}
            projectiles={gameState.projectiles.length}
            gameSpeed={gameState.gameSpeed}
          />

          {/* Tower Selection */}
          <TowerSelector
            towerTypes={Object.values(TOWER_TYPES)}
            selectedTowerType={gameState.selectedTowerType}
            money={gameState.money}
            onTowerSelect={handleTowerSelect}
            onCancelSelection={() => dispatch(selectTowerType(null))}
          />
        </Grid>
      </Grid>
    </Container>
  )
} 