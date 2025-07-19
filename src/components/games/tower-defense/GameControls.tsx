import { ButtonGroup, Chip, Box } from '@mui/material'
import { PlayArrow, Pause, Refresh, FastForward } from '@mui/icons-material'
import { GameButton } from '../../shared'

interface GameControlsProps {
  isRunning: boolean
  isPaused: boolean
  gameSpeed: number
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSpeedChange: (speed: number) => void
}

export const GameControls = ({ 
  isRunning, 
  isPaused, 
  gameSpeed, 
  onStart, 
  onPause, 
  onReset, 
  onSpeedChange 
}: GameControlsProps) => {
  const speedOptions = [1, 2, 4]
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FastForward sx={{ color: 'text.secondary' }} />
        <Chip 
          label={`${gameSpeed}x`} 
          size="small" 
          color={gameSpeed > 1 ? 'primary' : 'default'}
          sx={{ minWidth: 40 }}
        />
        <ButtonGroup variant="outlined" size="small">
          {speedOptions.map((speed) => (
            <GameButton
              key={speed}
              variant={gameSpeed === speed ? 'primary' : 'secondary'}
              onClick={() => onSpeedChange(speed)}
              disabled={!isRunning || isPaused}
            >
              {speed}x
            </GameButton>
          ))}
        </ButtonGroup>
      </Box>
    </Box>
  )
} 