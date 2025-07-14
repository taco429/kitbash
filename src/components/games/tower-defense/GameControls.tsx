import { ButtonGroup } from '@mui/material'
import { PlayArrow, Pause, Refresh } from '@mui/icons-material'
import { GameButton } from '../../shared'

interface GameControlsProps {
  isRunning: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
}

export const GameControls = ({ isRunning, isPaused, onStart, onPause, onReset }: GameControlsProps) => {
  return (
    <ButtonGroup variant="contained" size="small">
      <GameButton
        variant="success"
        icon={<PlayArrow />}
        onClick={onStart}
        disabled={isRunning && !isPaused}
      >
        Start
      </GameButton>
      <GameButton
        variant="warning"
        icon={<Pause />}
        onClick={onPause}
        disabled={!isRunning}
      >
        {isPaused ? 'Resume' : 'Pause'}
      </GameButton>
      <GameButton
        variant="secondary"
        icon={<Refresh />}
        onClick={onReset}
      >
        Reset
      </GameButton>
    </ButtonGroup>
  )
} 