import { useCallback, useRef, useMemo } from 'react'
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
    opacity = 0.8
  } = options

  const svgRef = useRef<SVGSVGElement>(null)

  // Memoize grid element and dimensions to avoid repeated DOM queries
  const gridInfo = useMemo(() => {
    const gridElement = document.querySelector('[data-grid="true"]') as HTMLElement
    const gridRect = gridElement?.getBoundingClientRect()
    return {
      element: gridElement,
      width: gridRect?.width || 400,
      height: gridRect?.height || 400
    }
  }, [foundWordPositions.length, grid.length]) // Re-calculate when words or grid size changes

  // Get actual cell center coordinates using DOM measurements
  const getCellCenterCoordinates = useCallback((row: number, col: number) => {
    const cellElement = document.querySelector(`[data-cell="${row}-${col}"]`) as HTMLElement
    if (!cellElement || !gridInfo.element) return null

    const cellRect = cellElement.getBoundingClientRect()
    const gridRect = gridInfo.element.getBoundingClientRect()

    // Calculate center position relative to the grid container
    const centerX = cellRect.left + cellRect.width / 2 - gridRect.left
    const centerY = cellRect.top + cellRect.height / 2 - gridRect.top

    return { x: centerX, y: centerY }
  }, [gridInfo.element])

  const renderFoundWordLines = useCallback(() => {
    if (foundWordPositions.length === 0) return null

    // Calculate dynamic stroke width based on actual cell size
    const firstCell = foundWordPositions[0]?.cells[0]
    const cellElement = firstCell ? document.querySelector(`[data-cell="${firstCell.row}-${firstCell.col}"]`) as HTMLElement : null
    const cellSize = cellElement ? Math.min(cellElement.offsetWidth, cellElement.offsetHeight) : (isMobile ? 32 : 40)
    const dynamicStrokeWidth = cellSize * 0.6 // 60% of cell size for found words (slightly thinner than selection)

    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 5 // Below selection lines
        }}
      >
        <svg
          ref={svgRef}
          width={gridInfo.width}
          height={gridInfo.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }}
        >
          {foundWordPositions.map((wordPosition, index) => {
            if (wordPosition.cells.length < 2) return null

            const startCell = wordPosition.cells[0]
            const endCell = wordPosition.cells[wordPosition.cells.length - 1]
            
            const startCoords = getCellCenterCoordinates(startCell.row, startCell.col)
            const endCoords = getCellCenterCoordinates(endCell.row, endCell.col)

            if (!startCoords || !endCoords) return null

            return (
              <line
                key={`found-word-${index}`}
                x1={startCoords.x}
                y1={startCoords.y}
                x2={endCoords.x}
                y2={endCoords.y}
                stroke={strokeColor}
                strokeWidth={dynamicStrokeWidth}
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
    isMobile,
    strokeColor,
    opacity,
    getCellCenterCoordinates,
    gridInfo.width,
    gridInfo.height
  ])

  return {
    renderFoundWordLines
  }
} 