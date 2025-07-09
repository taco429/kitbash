import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { 
  GameState, 
  Enemy, 
  Tower, 
  Projectile, 
  Position, 
  GAME_CONFIG, 
  GAME_PATH,
  TOWER_TYPES 
} from '../types/towerDefense'

const initialState: GameState = {
  isRunning: false,
  isPaused: false,
  level: 1,
  score: 0,
  money: GAME_CONFIG.INITIAL_MONEY,
  lives: GAME_CONFIG.INITIAL_LIVES,
  enemies: [],
  towers: [],
  projectiles: [],
  selectedTowerType: null,
  gameSpeed: 1,
  lastEnemySpawn: 0,
  enemySpawnDelay: GAME_CONFIG.ENEMY_SPAWN_DELAY
}

// Utility functions
const distance = (pos1: Position, pos2: Position): number => {
  return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
}

const generateEnemyId = (): string => {
  return `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateTowerId = (): string => {
  return `tower_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const generateProjectileId = (): string => {
  return `projectile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const towerDefenseSlice = createSlice({
  name: 'towerDefense',
  initialState,
  reducers: {
    startGame: (state) => {
      state.isRunning = true
      state.isPaused = false
    },
    
    pauseGame: (state) => {
      state.isPaused = !state.isPaused
    },
    
    resetGame: (state) => {
      return { ...initialState }
    },
    
    selectTowerType: (state, action: PayloadAction<Tower['type'] | null>) => {
      state.selectedTowerType = action.payload
    },
    
    placeTower: (state, action: PayloadAction<Position>) => {
      const { x, y } = action.payload
      const towerType = state.selectedTowerType
      
      if (!towerType) return
      
      const towerConfig = TOWER_TYPES[towerType]
      
      if (state.money < towerConfig.cost) return
      
      // Check if position is valid (not on path, not occupied)
      const gridX = Math.floor(x / GAME_CONFIG.GRID_SIZE)
      const gridY = Math.floor(y / GAME_CONFIG.GRID_SIZE)
      const position = { x: gridX * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2, y: gridY * GAME_CONFIG.GRID_SIZE + GAME_CONFIG.GRID_SIZE / 2 }
      
      // Check if position is too close to existing towers
      const tooClose = state.towers.some(tower => 
        distance(tower.position, position) < GAME_CONFIG.GRID_SIZE
      )
      
      if (tooClose) return
      
      const newTower: Tower = {
        id: generateTowerId(),
        position,
        damage: towerConfig.damage,
        range: towerConfig.range,
        fireRate: towerConfig.fireRate,
        lastFired: 0,
        cost: towerConfig.cost,
        type: towerType
      }
      
      state.towers.push(newTower)
      state.money -= towerConfig.cost
      state.selectedTowerType = null
    },
    
    spawnEnemy: (state) => {
      const currentTime = Date.now()
      
      if (currentTime - state.lastEnemySpawn >= state.enemySpawnDelay) {
        const newEnemy: Enemy = {
          id: generateEnemyId(),
          position: { ...GAME_PATH[0] },
          health: 50 + (state.level * 10),
          maxHealth: 50 + (state.level * 10),
          speed: GAME_CONFIG.ENEMY_SPEED,
          pathIndex: 0,
          reward: 10 + (state.level * 2)
        }
        
        state.enemies.push(newEnemy)
        state.lastEnemySpawn = currentTime
      }
    },
    
    updateEnemies: (state) => {
      const updatedEnemies: Enemy[] = []
      
      state.enemies.forEach(enemy => {
        // Move enemy along path
        const targetPoint = GAME_PATH[enemy.pathIndex + 1]
        
        if (!targetPoint) {
          // Enemy reached the end
          state.lives -= 1
          return
        }
        
        const dx = targetPoint.x - enemy.position.x
        const dy = targetPoint.y - enemy.position.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < enemy.speed) {
          enemy.pathIndex += 1
          if (enemy.pathIndex >= GAME_PATH.length - 1) {
            state.lives -= 1
            return
          }
          const nextPoint = GAME_PATH[enemy.pathIndex]
          if (nextPoint) {
            enemy.position = { ...nextPoint }
          }
        } else {
          enemy.position.x += (dx / dist) * enemy.speed
          enemy.position.y += (dy / dist) * enemy.speed
        }
        
        if (enemy.health > 0) {
          updatedEnemies.push(enemy)
        }
      })
      
      state.enemies = updatedEnemies
    },
    
    updateTowers: (state) => {
      const currentTime = Date.now()
      
      state.towers.forEach(tower => {
        if (currentTime - tower.lastFired >= tower.fireRate) {
          // Find closest enemy in range
          let closestEnemy: Enemy | null = null
          let closestDistance = Infinity
          
          state.enemies.forEach(enemy => {
            const dist = distance(tower.position, enemy.position)
            if (dist <= tower.range && dist < closestDistance) {
              closestEnemy = enemy
              closestDistance = dist
            }
          })
          
          if (closestEnemy) {
            // Create projectile
            const projectile: Projectile = {
              id: generateProjectileId(),
              position: { ...tower.position },
              target: { ...closestEnemy.position },
              damage: tower.damage,
              speed: GAME_CONFIG.PROJECTILE_SPEED
            }
            
            state.projectiles.push(projectile)
            tower.lastFired = currentTime
          }
        }
      })
    },
    
    updateProjectiles: (state) => {
      state.projectiles = state.projectiles.filter(projectile => {
        const dx = projectile.target.x - projectile.position.x
        const dy = projectile.target.y - projectile.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < projectile.speed) {
          // Hit target - find and damage enemy
          const targetEnemyIndex = state.enemies.findIndex(enemy => 
            Math.abs(enemy.position.x - projectile.target.x) < 20 &&
            Math.abs(enemy.position.y - projectile.target.y) < 20
          )
          
          if (targetEnemyIndex !== -1) {
            const targetEnemy = state.enemies[targetEnemyIndex]
            targetEnemy.health -= projectile.damage
            if (targetEnemy.health <= 0) {
              state.money += targetEnemy.reward
              state.score += targetEnemy.reward
            }
          }
          
          return false
        } else {
          projectile.position.x += (dx / distance) * projectile.speed
          projectile.position.y += (dy / distance) * projectile.speed
          return true
        }
      })
    },
    
    gameOver: (state) => {
      state.isRunning = false
      state.isPaused = false
    }
  }
})

export const {
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
} = towerDefenseSlice.actions

export default towerDefenseSlice.reducer 