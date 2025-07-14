import { useState, useEffect, useCallback, useRef } from 'react'

interface Cell {
  row: number
  col: number
}

interface DragSelectionState {
  isDragging: boolean
  startCell: Cell | null
  currentCell: Cell | null
  selectedCells: Cell[]
}

interface DragSelectionOptions {
  grid: string[][]
  onSelectionStart?: (cell: Cell) => void
  onSelectionUpdate?: (cells: Cell[], currentCell: Cell) => void
  onSelectionEnd?: (cells: Cell[]) => void
  allowDiagonal?: boolean
}

export const useDragSelection = (options: DragSelectionOptions) => {
  const { grid, onSelectionStart, onSelectionUpdate, onSelectionEnd, allowDiagonal = true } = options
  
  const [dragState, setDragState] = useState<DragSelectionState>({
    isDragging: false,
    startCell: null,
    currentCell: null,
    selectedCells: []
  })
  
  const gridRef = useRef<HTMLDivElement>(null)

  // Get cell from screen coordinates
  const getCellFromCoordinates = useCallback((clientX: number, clientY: number): Cell | null => {
    if (!gridRef.current) return null
    
    const element = document.elementFromPoint(clientX, clientY)
    
    if (element && element.hasAttribute('data-cell')) {
      const cellData = element.getAttribute('data-cell')
      if (cellData) {
        const [row, col] = cellData.split('-').map(Number)
        if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
          return { row, col }
        }
      }
    }
    
    return null
  }, [grid])

  // Calculate cells in a line from start to end
  const getLineCells = useCallback((start: Cell, end: Cell): Cell[] => {
    const cells: Cell[] = []
    
    const deltaRow = end.row - start.row
    const deltaCol = end.col - start.col
    
    // Check if direction is valid
    const isValidDirection = deltaRow === 0 || deltaCol === 0 || (allowDiagonal && Math.abs(deltaRow) === Math.abs(deltaCol))
    
    if (!isValidDirection) {
      return [start] // Return only start cell if direction is invalid
    }
    
    const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol))
    if (steps === 0) {
      cells.push(start)
    } else {
      const stepRow = deltaRow / steps
      const stepCol = deltaCol / steps
      
      for (let i = 0; i <= steps; i++) {
        cells.push({
          row: start.row + i * stepRow,
          col: start.col + i * stepCol
        })
      }
    }
    
    return cells
  }, [allowDiagonal])

  // Check if direction is valid
  const isValidDirection = useCallback((start: Cell, end: Cell): boolean => {
    const deltaRow = end.row - start.row
    const deltaCol = end.col - start.col
    return deltaRow === 0 || deltaCol === 0 || (allowDiagonal && Math.abs(deltaRow) === Math.abs(deltaCol))
  }, [allowDiagonal])

  // Unified start handler for both mouse and touch
  const handleSelectionStart = useCallback((row: number, col: number) => {
    const cell = { row, col }
    setDragState({
      isDragging: true,
      startCell: cell,
      currentCell: cell,
      selectedCells: [cell]
    })
    onSelectionStart?.(cell)
  }, [onSelectionStart])

  // Unified move handler for both mouse and touch
  const handleSelectionMove = useCallback((clientX: number, clientY: number) => {
    if (!dragState.isDragging || !dragState.startCell) return

    const cell = getCellFromCoordinates(clientX, clientY)
    if (cell && (!dragState.currentCell || cell.row !== dragState.currentCell.row || cell.col !== dragState.currentCell.col)) {
      const newSelectedCells = getLineCells(dragState.startCell, cell)
      
      setDragState(prev => ({
        ...prev,
        currentCell: cell,
        selectedCells: newSelectedCells
      }))
      
      onSelectionUpdate?.(newSelectedCells, cell)
    }
  }, [dragState.isDragging, dragState.startCell, dragState.currentCell, getCellFromCoordinates, getLineCells, onSelectionUpdate])

  // Unified end handler for both mouse and touch
  const handleSelectionEnd = useCallback(() => {
    if (dragState.isDragging) {
      onSelectionEnd?.(dragState.selectedCells)
      setDragState({
        isDragging: false,
        startCell: null,
        currentCell: null,
        selectedCells: []
      })
    }
  }, [dragState.isDragging, dragState.selectedCells, onSelectionEnd])

  // Mouse event handlers
  const handleMouseDown = useCallback((row: number, col: number) => {
    handleSelectionStart(row, col)
  }, [handleSelectionStart])

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    handleSelectionMove(event.clientX, event.clientY)
  }, [handleSelectionMove])

  const handleMouseUp = useCallback(() => {
    handleSelectionEnd()
  }, [handleSelectionEnd])

  // Touch event handlers
  const handleTouchStart = useCallback((event: React.TouchEvent, row: number, col: number) => {
    event.preventDefault()
    handleSelectionStart(row, col)
  }, [handleSelectionStart])

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    event.preventDefault()
    if (dragState.isDragging && event.touches.length > 0) {
      const touch = event.touches[0]
      handleSelectionMove(touch.clientX, touch.clientY)
    }
  }, [dragState.isDragging, handleSelectionMove])

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    event.preventDefault()
    handleSelectionEnd()
  }, [handleSelectionEnd])

  // Global event handlers to end selection when drag ends outside grid
  useEffect(() => {
    const handleGlobalEnd = () => {
      if (dragState.isDragging) {
        handleSelectionEnd()
      }
    }

    document.addEventListener('mouseup', handleGlobalEnd)
    document.addEventListener('touchend', handleGlobalEnd)
    document.addEventListener('mouseleave', handleGlobalEnd)
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalEnd)
      document.removeEventListener('touchend', handleGlobalEnd)
      document.removeEventListener('mouseleave', handleGlobalEnd)
    }
  }, [dragState.isDragging, handleSelectionEnd])

  return {
    dragState,
    gridRef,
    isValidDirection,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetSelection: () => setDragState({
      isDragging: false,
      startCell: null,
      currentCell: null,
      selectedCells: []
    })
  }
} 