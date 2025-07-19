import { useCallback, useRef, useEffect, useState } from 'react'
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

  // Update dimensions when grid changes, found words change, or on mobile updates
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
  }, [updateGridDimensions, foundWordPositions.length, grid.length, shouldUpdate, isMobile])

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

  const renderFoundWordLines = useCallback(() => {
    if (foundWordPositions.length === 0) return null

    // Calculate dynamic stroke width based on actual cell size
    const firstCell = foundWordPositions[0]?.cells[0]
    const cellElement = firstCell ? document.querySelector(`[data-cell="${firstCell.row}-${firstCell.col}"]`) as HTMLElement : null
    const cellSize = cellElement ? Math.min(cellElement.offsetWidth, cellElement.offsetHeight) : (isMobile ? 32 : 40)
    const dynamicStrokeWidth = Math.max(cellSize * 0.6, isMobile ? 16 : 20) // Ensure minimum stroke width on mobile

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
    gridDimensions.width,
    gridDimensions.height
  ])

  return {
    renderFoundWordLines
  }
} 