import React, { useState, useCallback } from 'react'
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ArrowBack, Shuffle, RestartAlt } from '@mui/icons-material'
import {
  CardData,
  Deck,
  Hand,
  DiscardPile,
  createStandardDeck,
  shuffleCards,
  drawCard
} from '../components/games/card-game'

interface GameState {
  deck: CardData[]
  hand: CardData[]
  discardPile: CardData[]
  selectedCards: string[]
  gameStarted: boolean
  autoSort: boolean
  handLayout: 'fan' | 'straight' | 'compact'
  cardSize: 'small' | 'medium' | 'large'
}

const initialState: GameState = {
  deck: [],
  hand: [],
  discardPile: [],
  selectedCards: [],
  gameStarted: false,
  autoSort: true,
  handLayout: 'fan',
  cardSize: 'medium'
}

export const CardGameDemoPage: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialState)
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleStartGame = useCallback(() => {
    const newDeck = shuffleCards(createStandardDeck())
    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      hand: [],
      discardPile: [],
      selectedCards: [],
      gameStarted: true
    }))
  }, [])

  const handleDrawCard = useCallback(() => {
    setGameState(prev => {
      const { card, remainingDeck } = drawCard(prev.deck)
      if (!card) return prev

      const newCard = { ...card, faceUp: true }
      return {
        ...prev,
        deck: remainingDeck,
        hand: [...prev.hand, newCard],
        selectedCards: []
      }
    })
  }, [])

  const handleCardClick = useCallback((card: CardData, _index: number) => {
    setGameState(prev => {
      const isSelected = prev.selectedCards.includes(card.id)
      const newSelectedCards = isSelected
        ? prev.selectedCards.filter(id => id !== card.id)
        : [...prev.selectedCards, card.id]

      return {
        ...prev,
        selectedCards: newSelectedCards
      }
    })
  }, [])

  const handleDiscardSelected = useCallback(() => {
    setGameState(prev => {
      const cardsToDiscard = prev.hand.filter(card => prev.selectedCards.includes(card.id))
      const remainingHand = prev.hand.filter(card => !prev.selectedCards.includes(card.id))
      
      return {
        ...prev,
        hand: remainingHand,
        discardPile: [...prev.discardPile, ...cardsToDiscard],
        selectedCards: []
      }
    })
  }, [])

  const handleDiscardPileClick = useCallback((_card: CardData) => {
    // Example: Take the top card from discard pile back to hand
    setGameState(prev => {
      if (prev.discardPile.length === 0) return prev
      
      const topCard = prev.discardPile[prev.discardPile.length - 1]
      const remainingDiscardPile = prev.discardPile.slice(0, -1)
      
      return {
        ...prev,
        hand: [...prev.hand, topCard],
        discardPile: remainingDiscardPile,
        selectedCards: []
      }
    })
  }, [])

  const handleShuffleDeck = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      deck: shuffleCards(prev.deck)
    }))
  }, [])

  const handleShuffleDiscardIntoDeck = useCallback(() => {
    setGameState(prev => {
      const shuffledCards = shuffleCards(prev.discardPile)
      const flippedCards = shuffledCards.map(card => ({ ...card, faceUp: false }))
      
      return {
        ...prev,
        deck: [...prev.deck, ...flippedCards],
        discardPile: []
      }
    })
  }, [])

  const handleResetGame = useCallback(() => {
    setGameState(initialState)
  }, [])

  const handleSettingChange = useCallback((setting: keyof GameState, value: any) => {
    setGameState(prev => ({
      ...prev,
      [setting]: value
    }))
  }, [])

  const getGameStats = () => {
    const totalCards = gameState.deck.length + gameState.hand.length + gameState.discardPile.length
    return {
      totalCards,
      deckCards: gameState.deck.length,
      handCards: gameState.hand.length,
      discardedCards: gameState.discardPile.length
    }
  }

  const stats = getGameStats()

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: isMobile ? 0 : 4,
        px: isMobile ? 0 : undefined,
        height: isMobile ? '100vh' : 'auto',
        overflow: isMobile ? 'hidden' : 'auto'
      }}
    >
      {/* Header */}
      <Box sx={{ mb: isMobile ? 1 : 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1 : 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/card-games')}
            sx={{ mr: 2 }}
          >
            Back to Card Games
          </Button>
          <Typography variant="h4" component="h1">
            Card Game Demo
          </Typography>
        </Box>
        {!isMobile && (
          <Typography variant="h6" color="text.secondary">
            Interactive demonstration of reusable card game components
          </Typography>
        )}
      </Box>

      {/* Game Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Game Controls
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleStartGame}
            startIcon={<Shuffle />}
            disabled={gameState.gameStarted}
          >
            {gameState.gameStarted ? 'Game Started' : 'Start New Game'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleDrawCard}
            disabled={!gameState.gameStarted || gameState.deck.length === 0}
          >
            Draw Card ({gameState.deck.length})
          </Button>
          <Button
            variant="outlined"
            onClick={handleDiscardSelected}
            disabled={gameState.selectedCards.length === 0}
          >
            Discard Selected ({gameState.selectedCards.length})
          </Button>
          <Button
            variant="outlined"
            onClick={handleShuffleDeck}
            disabled={gameState.deck.length === 0}
            startIcon={<Shuffle />}
          >
            Shuffle Deck
          </Button>
          <Button
            variant="outlined"
            onClick={handleShuffleDiscardIntoDeck}
            disabled={gameState.discardPile.length === 0}
          >
            Shuffle Discard into Deck
          </Button>
          <Button
            variant="outlined"
            onClick={handleResetGame}
            startIcon={<RestartAlt />}
            color="error"
          >
            Reset Game
          </Button>
        </Box>

        {/* Game Stats */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip label={`Total Cards: ${stats.totalCards}`} />
          <Chip label={`Deck: ${stats.deckCards}`} color="primary" />
          <Chip label={`Hand: ${stats.handCards}`} color="secondary" />
          <Chip label={`Discarded: ${stats.discardedCards}`} color="warning" />
        </Box>

        {/* Settings */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={gameState.autoSort}
                onChange={(e) => handleSettingChange('autoSort', e.target.checked)}
              />
            }
            label="Auto Sort Hand"
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Hand Layout</InputLabel>
            <Select
              value={gameState.handLayout}
              onChange={(e) => handleSettingChange('handLayout', e.target.value)}
              label="Hand Layout"
            >
              <MenuItem value="fan">Fan</MenuItem>
              <MenuItem value="straight">Straight</MenuItem>
              <MenuItem value="compact">Compact</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Card Size</InputLabel>
            <Select
              value={gameState.cardSize}
              onChange={(e) => handleSettingChange('cardSize', e.target.value)}
              label="Card Size"
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Game Area */}
      <Grid container spacing={4}>
        {/* Deck and Discard Pile */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom>
              Deck & Discard
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
              <Deck
                cards={gameState.deck}
                onDrawCard={handleDrawCard}
                onShuffle={handleShuffleDeck}
                size={gameState.cardSize}
              />
              <DiscardPile
                cards={gameState.discardPile}
                onCardClick={handleDiscardPileClick}
                onClear={() => handleSettingChange('discardPile', [])}
                size={gameState.cardSize}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Hand */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, minHeight: 300 }}>
            <Typography variant="h6" gutterBottom>
              Your Hand
            </Typography>
            {gameState.gameStarted ? (
              <Hand
                cards={gameState.hand}
                onCardClick={handleCardClick}
                selectedCards={gameState.selectedCards}
                layout={gameState.handLayout}
                size={gameState.cardSize}
                sortCards={gameState.autoSort}
              />
            ) : (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: 200,
                color: 'text.secondary'
              }}>
                <Typography variant="h6">
                  Click "Start New Game" to begin
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Instructions */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          How to Use This Demo
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Basic Actions:
            </Typography>
            <ul>
              <li>Click "Start New Game" to create and shuffle a new deck</li>
              <li>Click "Draw Card" to draw cards from the deck to your hand</li>
              <li>Click on cards in your hand to select them (they'll be highlighted)</li>
              <li>Click "Discard Selected" to move selected cards to the discard pile</li>
              <li>Click on the discard pile to take the top card back to your hand</li>
            </ul>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Advanced Features:
            </Typography>
            <ul>
              <li>Toggle "Auto Sort Hand" to automatically organize your cards</li>
              <li>Change "Hand Layout" to see different card arrangements</li>
              <li>Adjust "Card Size" for different screen sizes</li>
              <li>Shuffle the deck or move discard pile back to deck</li>
              <li>Drag cards between components (where supported)</li>
            </ul>
          </Grid>
        </Grid>
      </Paper>

      {/* Component Features */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Reusable Component Features
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Card Component
            </Typography>
            <ul>
              <li>Customizable sizes (small, medium, large)</li>
              <li>Face up/down states with smooth transitions</li>
              <li>Click and double-click handlers</li>
              <li>Drag and drop support</li>
              <li>Selection and disabled states</li>
            </ul>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Deck Component
            </Typography>
            <ul>
              <li>Visual card stack with depth effect</li>
              <li>Card count badge</li>
              <li>Draw and shuffle actions</li>
              <li>Empty state handling</li>
              <li>Customizable appearance</li>
            </ul>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Hand Component
            </Typography>
            <ul>
              <li>Multiple layout options (fan, straight, compact)</li>
              <li>Smooth hover animations</li>
              <li>Automatic card sorting</li>
              <li>Multi-selection support</li>
              <li>Responsive design</li>
            </ul>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Discard Pile Component
            </Typography>
            <ul>
              <li>Top card always visible</li>
              <li>Drag and drop support</li>
              <li>Stack depth visualization</li>
              <li>Clear functionality</li>
              <li>Empty state with drop zone</li>
            </ul>
          </Grid>
        </Grid>
      </Paper>

      {gameState.gameStarted && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            This demo shows how the reusable card game components work together. 
            These components can be easily adapted for various card games like Poker, Blackjack, 
            Solitaire, and more!
          </Typography>
        </Alert>
      )}
    </Container>
  )
} 