import { Box, Paper, Typography, LinearProgress, Grid } from '@mui/material'

interface GameStatsProps {
  score: number
  wordsFound: number
  totalWords: number
  combo: number
  timeLeft: number
  maxTime?: number
  showProgress?: boolean
}

export const GameStats = ({
  score,
  wordsFound,
  totalWords,
  combo,
  timeLeft,
  maxTime = 30,
  showProgress = true,
}: GameStatsProps) => {
  const getProgressPercentage = () => {
    return (timeLeft / maxTime) * 100
  }

  const getProgressColor = () => {
    const percentage = getProgressPercentage()
    if (percentage > 60) return 'success'
    if (percentage > 30) return 'warning'
    return 'error'
  }

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <Typography variant="h6" color="primary">
            Score: {score.toLocaleString()}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant="h6">
            Words: {wordsFound}/{totalWords}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Typography variant="h6">
            Combo: {combo}x
          </Typography>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Box>
            <Typography variant="body2" gutterBottom>
              Time Left: {timeLeft}s
            </Typography>
            {showProgress && (
              <LinearProgress
                variant="determinate"
                value={getProgressPercentage()}
                color={getProgressColor()}
                sx={{ height: 8, borderRadius: 4 }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
} 