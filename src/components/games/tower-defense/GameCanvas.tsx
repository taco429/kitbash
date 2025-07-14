import { Box, Paper, Typography } from '@mui/material'
import { forwardRef, ReactNode } from 'react'

interface GameCanvasProps {
  width: number
  height: number
  onClick: (event: React.MouseEvent<HTMLCanvasElement>) => void
  selectedTowerType: string | null
  title?: string
  headerActions?: ReactNode
}

export const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ width, height, onClick, selectedTowerType, title = "Game Board", headerActions }, ref) => {
    return (
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          {headerActions}
        </Box>

        <canvas
          ref={ref}
          width={width}
          height={height}
          onClick={onClick}
          style={{
            border: '2px solid #ccc',
            borderRadius: '8px',
            cursor: selectedTowerType ? 'crosshair' : 'default',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </Paper>
    )
  }
) 