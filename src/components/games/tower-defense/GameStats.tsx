import { Box, Typography, LinearProgress, Chip } from '@mui/material'
import { GameCard } from '../../shared'

interface GameStatsProps {
  score: number
  money: number
  lives: number
  level: number
  maxLives: number
  enemies: number
  towers: number
  projectiles: number
}

export const GameStats = ({
  score,
  money,
  lives,
  level,
  maxLives,
  enemies,
  towers,
  projectiles
}: GameStatsProps) => {
  const getHealthColor = () => {
    const percentage = (lives / maxLives) * 100
    if (percentage > 50) return 'success'
    if (percentage > 25) return 'warning'
    return 'error'
  }

  return (
    <GameCard title="Game Stats">
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Score:</Typography>
          <Typography variant="body2" fontWeight="bold">{score}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Money:</Typography>
          <Typography variant="body2" fontWeight="bold" color="success.main">
            ${money}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Lives:</Typography>
          <Typography variant="body2" fontWeight="bold" color="error.main">
            {lives}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Level:</Typography>
          <Typography variant="body2" fontWeight="bold">{level}</Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Health
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(lives / maxLives) * 100}
          color={getHealthColor()}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={`Enemies: ${enemies}`}
          size="small"
          color="error"
          variant="outlined"
        />
        <Chip
          label={`Towers: ${towers}`}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`Projectiles: ${projectiles}`}
          size="small"
          color="warning"
          variant="outlined"
        />
      </Box>
    </GameCard>
  )
} 