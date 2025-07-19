export interface Position {
  x: number
  y: number
}

export interface Enemy {
  id: string
  position: Position
  health: number
  maxHealth: number
  speed: number // Base speed - actual movement speed is calculated dynamically with game speed multiplier
  pathIndex: number
  reward: number
}

export interface Tower {
  id: string
  position: Position
  damage: number
  range: number
  fireRate: number
  lastFired: number
  cost: number
  type: 'basic' | 'fast' | 'heavy'
}

export interface Projectile {
  id: string
  position: Position
  target: Position
  damage: number
  speed: number // Base speed - actual movement speed is calculated dynamically with game speed multiplier
}

export interface GameState {
  isRunning: boolean
  isPaused: boolean
  level: number
  score: number
  money: number
  lives: number
  enemies: Enemy[]
  towers: Tower[]
  projectiles: Projectile[]
  selectedTowerType: Tower['type'] | null
  gameSpeed: number
  lastEnemySpawn: number
  enemySpawnDelay: number
}

export interface TowerType {
  type: Tower['type']
  damage: number
  range: number
  fireRate: number
  cost: number
  color: string
  name: string
}

export const TOWER_TYPES: Record<Tower['type'], TowerType> = {
  basic: {
    type: 'basic',
    damage: 20,
    range: 80,
    fireRate: 1000,
    cost: 50,
    color: '#2196F3',
    name: 'Basic Tower'
  },
  fast: {
    type: 'fast',
    damage: 15,
    range: 60,
    fireRate: 500,
    cost: 75,
    color: '#FF9800',
    name: 'Fast Tower'
  },
  heavy: {
    type: 'heavy',
    damage: 50,
    range: 100,
    fireRate: 2000,
    cost: 150,
    color: '#F44336',
    name: 'Heavy Tower'
  }
}

export const GAME_CONFIG = {
  GRID_SIZE: 40,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  ENEMY_SPAWN_DELAY: 1000,
  ENEMY_SPEED: 1,
  PROJECTILE_SPEED: 5,
  INITIAL_MONEY: 100,
  INITIAL_LIVES: 20
}

export const GAME_PATH: Position[] = [
  { x: 0, y: 300 },
  { x: 200, y: 300 },
  { x: 200, y: 100 },
  { x: 400, y: 100 },
  { x: 400, y: 400 },
  { x: 600, y: 400 },
  { x: 600, y: 200 },
  { x: 800, y: 200 }
] 