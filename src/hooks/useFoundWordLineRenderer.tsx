import { useCallback } from 'react'
import { Box } from '@mui/material'

interface Cell {
  row: number
  col: number
}

interface WordPosition {
  word: string
  cells: Cell[]
}

interface FoundWordLineRendererOptions {
  grid: string[][]
  foundWordPositions: WordPosition[]
  isMobile?: boolean
  strokeColor?: string
  strokeWidth?: number
  opacity?: number
}

export const useFoundWordLineRenderer = (options: FoundWordLineRendererOptions) => {
  const {
    grid,
    foundWordPositions,
    isMobile = false,
    strokeColor = '#4caf50',
    strokeWidth = 3,
    opacity = 0.8
  } = options

  const renderFoundWordLines = useCallback(() => {
    if (!foundWordPositions.length || !grid.length) return null
    
    const cellSize = isMobile ? window.innerWidth * 0.08 : 40
    const cellMargin = isMobile ? 2 : 4
    const cellWithMargin = cellSize + cellMargin
    const gridPadding = isMobile ? 8 : 16
    const borderWidth = 2
    const gridWidth = grid[0].length * cellWithMargin + (gridPadding + borderWidth) * 2
    const gridHeight = grid.length * cellWithMargin + (gridPadding + borderWidth) * 2
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 3 // Below active selection (5) but above found word cells (2)
        }}
      >
        <svg
          width={gridWidth}
          height={gridHeight}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }}
        >
          {foundWordPositions.map((wordPosition, index) => {
            if (wordPosition.cells.length < 2) return null
            
            const firstCell = wordPosition.cells[0]
            const lastCell = wordPosition.cells[wordPosition.cells.length - 1]
            
            // Calculate coordinates for line drawing
            const startX = firstCell.col * cellWithMargin + cellSize / 2 + gridPadding + borderWidth
            const startY = firstCell.row * cellWithMargin + cellSize / 2 + gridPadding + borderWidth
            const endX = lastCell.col * cellWithMargin + cellSize / 2 + gridPadding + borderWidth
            const endY = lastCell.row * cellWithMargin + cellSize / 2 + gridPadding + borderWidth
            
            return (
              <line
                key={`found-word-line-${index}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={opacity}
              />
            )
          })}
        </svg>
      </Box>
    )
  }, [
    foundWordPositions,
    grid,
    isMobile,
    strokeColor,
    strokeWidth,
    opacity
  ])

  return {
    renderFoundWordLines
  }
} 