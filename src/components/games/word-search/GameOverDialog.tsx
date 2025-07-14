import { Box, Typography } from '@mui/material'
import { EmojiEvents, Refresh, ArrowBack } from '@mui/icons-material'
import { GameDialog } from '../../shared/GameDialog'
import { GameButton } from '../../shared/GameButton'

interface GameOverDialogProps {
  open: boolean
  score: number
  wordsFound: number
  totalWords: number
  onRestart: () => void
  onBack: () => void
  accentColor?: string
}

export const GameOverDialog = ({
  open,
  score,
  wordsFound,
  totalWords,
  onRestart,
  onBack,
  accentColor = '#ff5722',
}: GameOverDialogProps) => {
  const getPerformanceMessage = () => {
    const percentage = (wordsFound / totalWords) * 100
    if (percentage >= 80) return 'Excellent work!'
    if (percentage >= 50) return 'Good job!'
    return 'Keep practicing!'
  }

  const actions = (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
      <GameButton
        variant="primary"
        icon={<Refresh />}
        onClick={onRestart}
        sx={{ bgcolor: accentColor, '&:hover': { bgcolor: accentColor } }}
      >
        Play Again
      </GameButton>
      <GameButton
        variant="secondary"
        icon={<ArrowBack />}
        onClick={onBack}
      >
        Back to Hub
      </GameButton>
    </Box>
  )

  return (
    <GameDialog
      open={open}
      title="Game Over!"
      showCloseButton={false}
      actions={actions}
    >
      <Box textAlign="center">
        <EmojiEvents sx={{ fontSize: 48, color: accentColor, mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Final Score: {score.toLocaleString()}
        </Typography>
        <Typography variant="h6" gutterBottom>
          Words Found: {wordsFound}/{totalWords}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {getPerformanceMessage()}
        </Typography>
      </Box>
    </GameDialog>
  )
} 