import { Box, Paper } from '@mui/material'
import { useRef, ReactNode, RefObject } from 'react'

interface GameGridProps {
  grid: string[][]
  getCellStyle: (row: number, col: number) => object
  onMouseDown: (row: number, col: number) => void
  onMouseMove: (event: React.MouseEvent) => void
  onMouseUp: () => void
  onTouchStart: (event: React.TouchEvent, row: number, col: number) => void
  onTouchMove: (event: React.TouchEvent) => void
  onTouchEnd: (event: React.TouchEvent) => void
  selectionLineRenderer?: () => ReactNode
  foundWordLineRenderer?: () => ReactNode
  gridRef?: RefObject<HTMLDivElement>
}

export const GameGrid = ({
  grid,
  getCellStyle,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  selectionLineRenderer,
  foundWordLineRenderer,
  gridRef: externalGridRef,
}: GameGridProps) => {
  const internalGridRef = useRef<HTMLDivElement>(null)
  const gridRef = externalGridRef || internalGridRef

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        ref={gridRef}
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${grid[0]?.length || 10}, 1fr)`,
          gap: '2px',
          userSelect: 'none',
          touchAction: 'none',
          position: 'relative'
        }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {grid.map((row: string[], rowIndex: number) =>
          row.map((letter: string, colIndex: number) => (
            <Box
              key={`${rowIndex}-${colIndex}`}
              data-cell={`${rowIndex}-${colIndex}`}
              sx={getCellStyle(rowIndex, colIndex)}
              onMouseDown={() => onMouseDown(rowIndex, colIndex)}
              onTouchStart={(e: React.TouchEvent) => onTouchStart(e, rowIndex, colIndex)}
            >
              {letter}
            </Box>
          ))
        )}
        {selectionLineRenderer && selectionLineRenderer()}
        {foundWordLineRenderer && foundWordLineRenderer()}
      </Box>
    </Paper>
  )
} 