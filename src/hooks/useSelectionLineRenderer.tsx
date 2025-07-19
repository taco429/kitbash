import { useCallback, useRef, useEffect, useState } from 'react'
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
  const [gridDimensions, setGridDimensions] = useState({ width: 400, height: 400 })
  const [shouldUpdate, setShouldUpdate] = useState(0)

  // Force re-measurement on mobile when needed
  const forceUpdate = useCallback(() => {
    setShouldUpdate(prev => prev + 1)
  }, [])

  // Handle resize events and orientation changes on mobile
  useEffect(() => {
    const handleResize = () => {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        forceUpdate()
      }, 100)
    }

    const handleOrientationChange = () => {
      // Longer delay for orientation changes
      setTimeout(() => {
        forceUpdate()
      }, 300)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [forceUpdate])

  // Get grid dimensions with better mobile support
  const updateGridDimensions = useCallback(() => {
    const gridElement = document.querySelector('[data-grid="true"]') as HTMLElement
    if (gridElement) {
      // Use requestAnimationFrame to ensure measurements are accurate
      requestAnimationFrame(() => {
        const gridRect = gridElement.getBoundingClientRect()
        if (gridRect.width > 0 && gridRect.height > 0) {
          setGridDimensions({
            width: gridRect.width,
            height: gridRect.height
          })
        }
      })
    }
  }, [])

  // Update dimensions when grid changes or on mobile updates
  useEffect(() => {
    if (isMobile) {
      // Add a small delay for initial mobile rendering
      const timer = setTimeout(() => {
        updateGridDimensions()
      }, 50)
      return () => clearTimeout(timer)
    } else {
      updateGridDimensions()
    }
  }, [updateGridDimensions, grid.length, shouldUpdate, isMobile])

  // Get actual cell center coordinates with improved mobile support
  const getCellCenterCoordinates = useCallback((row: number, col: number) => {
    const cellElement = document.querySelector(`[data-cell="${row}-${col}"]`) as HTMLElement
    const gridElement = document.querySelector('[data-grid="true"]') as HTMLElement
    
    if (!cellElement || !gridElement) return null

    // Use requestAnimationFrame for better mobile compatibility
    const cellRect = cellElement.getBoundingClientRect()
    const gridRect = gridElement.getBoundingClientRect()

    // Ensure we have valid measurements
    if (cellRect.width === 0 || cellRect.height === 0 || gridRect.width === 0 || gridRect.height === 0) {
      return null
    }

    // Calculate center position relative to the grid container
    const centerX = cellRect.left + cellRect.width / 2 - gridRect.left
    const centerY = cellRect.top + cellRect.height / 2 - gridRect.top

    return { x: centerX, y: centerY }
  }, [])

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
    const dynamicStrokeWidth = Math.max(cellSize * 0.8, isMobile ? 20 : 24) // Ensure minimum stroke width on mobile
    
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
          width={gridDimensions.width}
          height={gridDimensions.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            // Force hardware acceleration on mobile
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
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
    gridDimensions.width,
    gridDimensions.height
  ])

  return {
    renderSelectionLine
  }
} 