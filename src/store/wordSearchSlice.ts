import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface WordSearchState {
  grid: string[][]
  words: string[]
  foundWords: string[]
  selectedCells: Array<{ row: number; col: number }>
  gameWon: boolean
  isSelecting: boolean
  gameSize: number
  difficulty: 'easy' | 'medium' | 'hard'
}

const WORD_LISTS = {
  easy: ['CAT', 'DOG', 'SUN', 'TREE', 'BOOK', 'FISH'],
  medium: ['HOUSE', 'WATER', 'NIGHT', 'LIGHT', 'PLANT', 'MOUSE', 'BIRDS'],
  hard: ['COMPUTER', 'ELEPHANT', 'JOURNEY', 'RAINBOW', 'CRYSTAL', 'MOUNTAIN', 'FREEDOM']
}

const initialState: WordSearchState = {
  grid: [],
  words: [],
  foundWords: [],
  selectedCells: [],
  gameWon: false,
  isSelecting: false,
  gameSize: 10,
  difficulty: 'easy'
}

// Helper function to generate a random letter
const getRandomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26))

// Helper function to place a word in the grid
const placeWordInGrid = (grid: string[][], word: string, row: number, col: number, direction: { dr: number; dc: number }) => {
  for (let i = 0; i < word.length; i++) {
    const newRow = row + i * direction.dr
    const newCol = col + i * direction.dc
    grid[newRow][newCol] = word[i]
  }
}

// Helper function to check if a word can be placed at a position
const canPlaceWord = (grid: string[][], word: string, row: number, col: number, direction: { dr: number; dc: number }) => {
  for (let i = 0; i < word.length; i++) {
    const newRow = row + i * direction.dr
    const newCol = col + i * direction.dc
    
    if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) {
      return false
    }
    
    if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
      return false
    }
  }
  return true
}

// Helper function to generate a new grid with words
const generateGrid = (size: number, words: string[]) => {
  const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''))
  
  // Possible directions: horizontal, vertical, diagonal
  const directions = [
    { dr: 0, dc: 1 },   // horizontal
    { dr: 1, dc: 0 },   // vertical  
    { dr: 1, dc: 1 },   // diagonal down-right
    { dr: -1, dc: 1 },  // diagonal up-right
    { dr: 0, dc: -1 },  // horizontal backwards
    { dr: -1, dc: 0 },  // vertical backwards
    { dr: -1, dc: -1 }, // diagonal up-left
    { dr: 1, dc: -1 }   // diagonal down-left
  ]
  
  // Place each word in the grid
  for (const word of words) {
    let placed = false
    let attempts = 0
    
    while (!placed && attempts < 100) {
      const direction = directions[Math.floor(Math.random() * directions.length)]
      const row = Math.floor(Math.random() * size)
      const col = Math.floor(Math.random() * size)
      
      if (canPlaceWord(grid, word, row, col, direction)) {
        placeWordInGrid(grid, word, row, col, direction)
        placed = true
      }
      
      attempts++
    }
  }
  
  // Fill empty cells with random letters
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === '') {
        grid[i][j] = getRandomLetter()
      }
    }
  }
  
  return grid
}

export const wordSearchSlice = createSlice({
  name: 'wordSearch',
  initialState,
  reducers: {
    newGame: (state: WordSearchState, action: PayloadAction<{ difficulty: 'easy' | 'medium' | 'hard' }>) => {
      state.difficulty = action.payload.difficulty
      state.gameSize = action.payload.difficulty === 'easy' ? 8 : action.payload.difficulty === 'medium' ? 10 : 12
      state.words = [...WORD_LISTS[action.payload.difficulty]]
      state.grid = generateGrid(state.gameSize, state.words)
      state.foundWords = []
      state.selectedCells = []
      state.gameWon = false
      state.isSelecting = false
    },
    startSelection: (state: WordSearchState, action: PayloadAction<{ row: number; col: number }>) => {
      state.selectedCells = [action.payload]
      state.isSelecting = true
    },
    updateSelection: (state: WordSearchState, action: PayloadAction<{ row: number; col: number }>) => {
      if (state.isSelecting && state.selectedCells.length > 0) {
        const start = state.selectedCells[0]
        const end = action.payload
        
        // Calculate the path between start and end
        const path: Array<{ row: number; col: number }> = []
        const deltaRow = end.row - start.row
        const deltaCol = end.col - start.col
        
        // Only allow straight lines (horizontal, vertical, diagonal)
        if (deltaRow === 0 || deltaCol === 0 || Math.abs(deltaRow) === Math.abs(deltaCol)) {
          const steps = Math.max(Math.abs(deltaRow), Math.abs(deltaCol))
          const stepRow = steps === 0 ? 0 : deltaRow / steps
          const stepCol = steps === 0 ? 0 : deltaCol / steps
          
          for (let i = 0; i <= steps; i++) {
            path.push({
              row: start.row + i * stepRow,
              col: start.col + i * stepCol
            })
          }
        }
        
        state.selectedCells = path
      }
    },
    endSelection: (state: WordSearchState) => {
      if (state.selectedCells.length > 0) {
        // Check if selected cells form a word
        const selectedWord = state.selectedCells
          .map((cell: { row: number; col: number }) => state.grid[cell.row][cell.col])
          .join('')
        
        const reversedWord = selectedWord.split('').reverse().join('')
        
        if (state.words.includes(selectedWord) && !state.foundWords.includes(selectedWord)) {
          state.foundWords.push(selectedWord)
        } else if (state.words.includes(reversedWord) && !state.foundWords.includes(reversedWord)) {
          state.foundWords.push(reversedWord)
        }
        
        // Check if all words are found
        if (state.foundWords.length === state.words.length) {
          state.gameWon = true
        }
      }
      
      state.selectedCells = []
      state.isSelecting = false
    },
    clearSelection: (state: WordSearchState) => {
      state.selectedCells = []
      state.isSelecting = false
    }
  },
})

export const { newGame, startSelection, updateSelection, endSelection, clearSelection } = wordSearchSlice.actions

export default wordSearchSlice.reducer