import { useCallback } from 'react'
import { Box } from '@mui/material'

interface Cell {
  row: number
  col: number
}

interface SelectionLineRendererOptions {
  grid: string[][]
  isDragging: boolean
  startCell: Cell | null
  currentCell: Cell | null
  isMobile?: boolean
  allowDiagonal?: boolean
  strokeColor?: string
  strokeWidth?: number
  opacity?: number
}

export const useSelectionLineRenderer = (options: SelectionLineRendererOptions) => {
  const {
    grid,
    isDragging,
    startCell,
    currentCell,
    isMobile = false,
    allowDiagonal = true,
    strokeColor = 'rgba(255, 87, 34, 0.8)',
    strokeWidth = 3,
    opacity = 0.9
  } = options

  const renderSelectionLine = useCallback(() => {
    if (!isDragging || !startCell || !currentCell) return null

    const cellSize = isMobile ? window.innerWidth * 0.08 : 40
    const gap = isMobile ? 1 : 2
    const cellWithGap = cellSize + gap
    const gridPadding = isMobile ? 16 : 16
    
    // Calculate coordinates for line drawing
    const horizontalOffset = gap * 1.4
    const verticalOffset = gap * 1.4
    const startX = startCell.col * cellWithGap + cellSize / 2 + gridPadding - horizontalOffset
    const startY = startCell.row * cellWithGap + cellSize / 2 + gridPadding - verticalOffset
    const endX = currentCell.col * cellWithGap + cellSize / 2 + gridPadding - horizontalOffset
    const endY = currentCell.row * cellWithGap + cellSize / 2 + gridPadding - verticalOffset
    
    // Check if direction is valid
    const deltaRow = currentCell.row - startCell.row
    const deltaCol = currentCell.col - startCell.col
    const isValidDirection = deltaRow === 0 || deltaCol === 0 || (allowDiagonal && Math.abs(deltaRow) === Math.abs(deltaCol))
    
    const gridWidth = grid[0].length * cellWithGap + gridPadding * 2
    const gridHeight = grid.length * cellWithGap + gridPadding * 2
    const pathWidth = cellSize * 1.15
    
    const currentStrokeColor = isValidDirection ? strokeColor : 'rgba(255, 152, 0, 0.6)'
    
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 7
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
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={currentStrokeColor}
            strokeWidth={pathWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={opacity}
          />
        </svg>
      </Box>
    )
  }, [
    isDragging,
    startCell,
    currentCell,
    grid,
    isMobile,
    allowDiagonal,
    strokeColor,
    strokeWidth,
    opacity
  ])

  return {
    renderSelectionLine
  }
} 