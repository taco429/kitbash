import { Box, Typography, Paper } from '@mui/material'
import { Timer } from '@mui/icons-material'

interface GameTimerProps {
  minutes: number
  seconds: number
  milliseconds: number
  isGameStarted: boolean
  isGameWon: boolean
}

export const GameTimer = ({ minutes, seconds, milliseconds, isGameStarted, isGameWon }: GameTimerProps) => {
  const formatTimer = () => {
    const min = minutes.toString().padStart(2, '0')
    const sec = seconds.toString().padStart(2, '0')
    const ms = Math.floor(milliseconds / 10).toString().padStart(2, '0')
    return `${min}:${sec}:${ms}`
  }

  const getTimerColor = () => {
    if (isGameWon) return 'success.main'
    if (!isGameStarted) return 'text.secondary'
    return 'primary.main'
  }

  return (
    <Paper
      elevation={2}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        p: 2,
        backgroundColor: isGameWon ? 'success.light' : 'background.paper',
        borderRadius: 2,
      }}
    >
      <Timer sx={{ color: getTimerColor() }} />
      <Typography
        variant="h6"
        sx={{
          fontFamily: 'monospace',
          fontWeight: 'bold',
          color: getTimerColor(),
          letterSpacing: '0.1em',
        }}
      >
        {formatTimer()}
      </Typography>
    </Paper>
  )
} 