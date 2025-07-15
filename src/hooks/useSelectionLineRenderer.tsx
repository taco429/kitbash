import { useCallback, useRef, useMemo } from 'react'
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
    opacity = 0.9
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
  }, [isDragging, grid.length]) // Re-calculate when dragging state changes or grid size changes

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

  const renderSelectionLine = useCallback(() => {
    if (!isDragging || !startCell || !currentCell) return null

    const startCoords = getCellCenterCoordinates(startCell.row, startCell.col)
    const endCoords = getCellCenterCoordinates(currentCell.row, currentCell.col)

    if (!startCoords || !endCoords) return null

    // Check if direction is valid
    const deltaRow = currentCell.row - startCell.row
    const deltaCol = currentCell.col - startCell.col
    const isValidDirection = deltaRow === 0 || deltaCol === 0 || (allowDiagonal && Math.abs(deltaRow) === Math.abs(deltaCol))

    // Calculate dynamic stroke width based on actual cell size
    const cellElement = document.querySelector(`[data-cell="${startCell.row}-${startCell.col}"]`) as HTMLElement
    const cellSize = cellElement ? Math.min(cellElement.offsetWidth, cellElement.offsetHeight) : (isMobile ? 32 : 40)
    const dynamicStrokeWidth = cellSize * 0.8 // 80% of cell size for good visual coverage
    
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
          <line
            x1={startCoords.x}
            y1={startCoords.y}
            x2={endCoords.x}
            y2={endCoords.y}
            stroke={currentStrokeColor}
            strokeWidth={dynamicStrokeWidth}
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
    isMobile,
    allowDiagonal,
    strokeColor,
    opacity,
    getCellCenterCoordinates,
    gridInfo.width,
    gridInfo.height
  ])

  return {
    renderSelectionLine
  }
} 