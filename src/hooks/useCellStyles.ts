import { useCallback } from 'react'

interface Cell {
  row: number
  col: number
}

interface CellStylesOptions {
  isMobile?: boolean
  selectedCells: Cell[]
  foundWordCells: Cell[]
  isDragging: boolean
  startCell: Cell | null
  currentCell: Cell | null
  flashingCells?: Cell[]
  isFlashing?: boolean
}

export const useCellStyles = (options: CellStylesOptions) => {
  const { 
    isMobile = false, 
    selectedCells, 
    foundWordCells, 
    isDragging, 
    startCell, 
    currentCell, 
    flashingCells = [], 
    isFlashing = false 
  } = options

  const cellSize = isMobile ? '8vw' : '40px'
  const fontSize = isMobile ? '4vw' : '16px'
  const margin = isMobile ? '1px' : '2px'

  const baseStyle = {
    width: cellSize,
    height: cellSize,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #ccc',
    borderRadius: '8px',
    cursor: 'pointer',
    userSelect: 'none' as const,
    fontSize: fontSize,
    fontWeight: 'bold',
    transition: 'all 0.1s ease',
    touchAction: 'none',
    position: 'relative' as const,
    zIndex: 1,
    margin: margin,
    boxSizing: 'border-box' as const
  }

  const isCellSelected = useCallback((row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col)
  }, [selectedCells])

  const isCellInFoundWord = useCallback((row: number, col: number) => {
    return foundWordCells.some(cell => cell.row === row && cell.col === col)
  }, [foundWordCells])

  const isCellFlashing = useCallback((row: number, col: number) => {
    return flashingCells.some(cell => cell.row === row && cell.col === col)
  }, [flashingCells])

  const isCellInCurrentPath = useCallback((row: number, col: number) => {
    if (!currentCell || !startCell || !isDragging) return false
    
    const deltaRow = currentCell.row - startCell.row
    const deltaCol = currentCell.col - startCell.col
    
    // Only show path for valid directions (horizontal, vertical, diagonal)
    if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
      const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol))
      if (steps === 0) return row === startCell.row && col === startCell.col
      
      const stepRow = deltaRow / steps
      const stepCol = deltaCol / steps
      
      for (let i = 0; i <= steps; i++) {
        const checkRow = startCell.row + i * stepRow
        const checkCol = startCell.col + i * stepCol
        if (checkRow === row && checkCol === col) {
          return true
        }
      }
    }
    
    return false
  }, [currentCell, startCell, isDragging])

  const getCellStyle = useCallback((row: number, col: number) => {
    const isSelected = isCellSelected(row, col)
    const isInCurrentPath = isCellInCurrentPath(row, col)
    const isInFoundWord = isCellInFoundWord(row, col)
    const isFlashingCell = isCellFlashing(row, col)
    const isStartCell = startCell && startCell.row === row && startCell.col === col
    const isCurrentCell = currentCell && currentCell.row === row && currentCell.col === col
    const isDraggingStart = isDragging && isStartCell
    const isDraggingCurrent = isDragging && isCurrentCell && !isStartCell

    // Special styling for flashing cells (word location flash)
    if (isFlashingCell && isFlashing) {
      return {
        ...baseStyle,
        backgroundColor: '#ff5722',
        color: 'white',
        border: '3px solid #d84315',
        borderRadius: '10px',
        boxShadow: '0 0 15px rgba(255, 87, 34, 0.8)',
        transform: 'scale(1.15)',
        zIndex: 15,
        animation: 'pulse 0.3s ease-in-out'
      }
    }

    // Special styling for start cell during dragging
    if (isDraggingStart) {
      return {
        ...baseStyle,
        backgroundColor: '#ffc107',
        color: '#f57f17',
        border: '3px solid #ff8f00',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(255, 193, 7, 0.5)',
        transform: 'scale(1.1)',
        zIndex: 10
      }
    }

    // Special styling for current cell during dragging
    if (isDraggingCurrent) {
      return {
        ...baseStyle,
        backgroundColor: '#ffeb3b',
        color: '#f57f17',
        border: '3px solid #ffc107',
        borderRadius: '10px',
        boxShadow: '0 0 8px rgba(255, 235, 59, 0.4)',
        transform: 'scale(1.05)',
        zIndex: 9
      }
    }

    // Selected cell styling
    if (isSelected) {
      return {
        ...baseStyle,
        backgroundColor: '#ffeb3b',
        color: '#f57f17',
        border: '2px solid #ffc107',
        borderRadius: '9px',
        zIndex: 6
      }
    }

    // Current path styling (preview)
    if (isInCurrentPath) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(255, 235, 59, 0.4)',
        color: '#f57f17',
        border: '2px solid #ffeb3b',
        borderRadius: '9px',
        boxShadow: '0 0 5px rgba(255, 235, 59, 0.4)',
        zIndex: 8
      }
    }

    // Found word cell styling
    if (isInFoundWord) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        color: '#2e7d32',
        border: '1px solid #4caf50',
        borderRadius: '8px',
        zIndex: 2
      }
    }

    // Default cell styling
    return {
      ...baseStyle,
      backgroundColor: 'white',
      '&:hover': {
        backgroundColor: '#f5f5f5'
      }
    }
  }, [
    isCellSelected,
    isCellInCurrentPath,
    isCellInFoundWord,
    isCellFlashing,
    startCell,
    currentCell,
    isDragging,
    isFlashing,
    baseStyle
  ])

  return {
    getCellStyle,
    isCellSelected,
    isCellInFoundWord,
    isCellInCurrentPath,
    isCellFlashing
  }
} 