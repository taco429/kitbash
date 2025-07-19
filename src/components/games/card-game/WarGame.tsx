import React, { useState, useCallback } from 'react'
import { Box, Typography, LinearProgress, Alert, Chip } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Card, CardData } from './Card'
import { DeckVisual } from './DeckVisual'
import { createStandardDeck, shuffleCards, getCardValue } from './utils/deckUtils'
import { GameButton } from '../../shared/GameButton'
import { GameDialog } from '../../shared/GameDialog'

interface GameState {
  playerDeck: CardData[]
  computerDeck: CardData[]
  playerCard: CardData | null
  computerCard: CardData | null
  warPile: CardData[]
  gameStatus: 'playing' | 'player-wins' | 'computer-wins' | 'war'
  message: string
  round: number
  isProcessing: boolean
}

const GameArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
  minHeight: '600px',
  '@keyframes pulse': {
    '0%': {
      opacity: 1,
      transform: 'scale(1)',
    },
    '50%': {
      opacity: 0.8,
      transform: 'scale(1.05)',
    },
    '100%': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
}))

const PlayerArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  minWidth: '300px',
}))

const BattleArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(4),
  padding: theme.spacing(3),
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(2),
  backgroundColor: 'white',
  minHeight: '150px',
}))

const getCardRankValue = (rank: CardData['rank']): number => {
  switch (rank) {
    case 'A': return 14 // Ace high in War
    case 'K': return 13
    case 'Q': return 12
    case 'J': return 11
    default: return getCardValue(rank, 14)
  }
}

export const WarGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const deck = shuffleCards(createStandardDeck(false))
    const playerDeck = deck.slice(0, 26)
    const computerDeck = deck.slice(26, 52)
    
    return {
      playerDeck,
      computerDeck,
      playerCard: null,
      computerCard: null,
      warPile: [],
      gameStatus: 'playing',
      message: 'Click "Draw Cards" to start the battle!',
      round: 0,
      isProcessing: false,
    }
  })

  const [showGameOverDialog, setShowGameOverDialog] = useState(false)

  const resetGame = useCallback(() => {
    const deck = shuffleCards(createStandardDeck(false))
    const playerDeck = deck.slice(0, 26)
    const computerDeck = deck.slice(26, 52)
    
    setGameState({
      playerDeck,
      computerDeck,
      playerCard: null,
      computerCard: null,
      warPile: [],
      gameStatus: 'playing',
      message: 'Click "Draw Cards" to start the battle!',
      round: 0,
      isProcessing: false,
    })
    setShowGameOverDialog(false)
  }, [])

  const drawCards = useCallback(() => {
    if (gameState.isProcessing || gameState.gameStatus !== 'playing') return

    setGameState(prev => {
      if (prev.playerDeck.length === 0 || prev.computerDeck.length === 0) {
        return prev
      }

      const newState = { ...prev, isProcessing: true }
      
      // Draw cards
      const playerCard = { ...prev.playerDeck[0], faceUp: true }
      const computerCard = { ...prev.computerDeck[0], faceUp: true }
      
      newState.playerCard = playerCard
      newState.computerCard = computerCard
      newState.playerDeck = prev.playerDeck.slice(1)
      newState.computerDeck = prev.computerDeck.slice(1)
      newState.round = prev.round + 1

      // Compare cards
      const playerValue = getCardRankValue(playerCard.rank)
      const computerValue = getCardRankValue(computerCard.rank)

      const cardsInPlay = [playerCard, computerCard, ...prev.warPile]

      if (playerValue > computerValue) {
        // Player wins
        newState.playerDeck = [...newState.playerDeck, ...cardsInPlay]
        newState.message = `Player wins! ${playerCard.rank} beats ${computerCard.rank}`
        newState.warPile = []
      } else if (computerValue > playerValue) {
        // Computer wins
        newState.computerDeck = [...newState.computerDeck, ...cardsInPlay]
        newState.message = `Computer wins! ${computerCard.rank} beats ${playerCard.rank}`
        newState.warPile = []
      } else {
        // War!
        newState.warPile = [...prev.warPile, playerCard, computerCard]
        newState.gameStatus = 'war' as GameState['gameStatus']
        newState.message = `WAR! Both played ${playerCard.rank}. Draw 3 cards face down and 1 face up!`
      }

      return newState
    })

    // Process the result after a delay
    setTimeout(() => {
      setGameState(prev => {
        const newState = { ...prev, isProcessing: false }

        // Check for game over conditions
        if (newState.playerDeck.length === 0) {
          newState.gameStatus = 'computer-wins'
          newState.message = 'Computer wins the game! You ran out of cards.'
          setShowGameOverDialog(true)
        } else if (newState.computerDeck.length === 0) {
          newState.gameStatus = 'player-wins'
          newState.message = 'You win the game! Computer ran out of cards.'
          setShowGameOverDialog(true)
        } else if (newState.gameStatus === 'war') {
          // Continue with war logic
          newState.gameStatus = 'playing'
        }

        return newState
      })
    }, 1500)
  }, [gameState.isProcessing, gameState.gameStatus])

  const handleWar = useCallback(() => {
    if (gameState.isProcessing || gameState.gameStatus !== 'war') return

    setGameState(prev => {
      // Check if both players have enough cards for war (need at least 4 cards)
      if (prev.playerDeck.length < 4 || prev.computerDeck.length < 4) {
        const winner = prev.playerDeck.length >= prev.computerDeck.length ? 'player-wins' : 'computer-wins'
        return {
          ...prev,
          gameStatus: winner,
          message: winner === 'player-wins' 
            ? 'You win! Computer doesn\'t have enough cards for war.' 
            : 'Computer wins! You don\'t have enough cards for war.',
          isProcessing: false,
        }
      }

      // Draw 3 cards face down and 1 face up for war
      const playerWarCards = prev.playerDeck.slice(0, 4)
      const computerWarCards = prev.computerDeck.slice(0, 4)
      
      // The 4th card (index 3) is face up for comparison
      const playerBattleCard = { ...playerWarCards[3], faceUp: true }
      const computerBattleCard = { ...computerWarCards[3], faceUp: true }

      const newState = {
        ...prev,
        playerCard: playerBattleCard,
        computerCard: computerBattleCard,
        playerDeck: prev.playerDeck.slice(4),
        computerDeck: prev.computerDeck.slice(4),
        warPile: [...prev.warPile, ...playerWarCards.slice(0, 3), ...computerWarCards.slice(0, 3)],
        gameStatus: 'playing' as GameState['gameStatus'],
        isProcessing: true,
      }

      // Compare the battle cards
      const playerValue = getCardRankValue(playerBattleCard.rank)
      const computerValue = getCardRankValue(computerBattleCard.rank)

      const allCardsInPlay = [
        playerBattleCard, 
        computerBattleCard, 
        ...newState.warPile
      ]

      if (playerValue > computerValue) {
        newState.playerDeck = [...newState.playerDeck, ...allCardsInPlay]
        newState.message = `Player wins the war! ${playerBattleCard.rank} beats ${computerBattleCard.rank}`
        newState.warPile = []
      } else if (computerValue > playerValue) {
        newState.computerDeck = [...newState.computerDeck, ...allCardsInPlay]
        newState.message = `Computer wins the war! ${computerBattleCard.rank} beats ${playerBattleCard.rank}`
        newState.warPile = []
      } else {
        // Another war!
        newState.warPile = allCardsInPlay
        newState.gameStatus = 'war' as GameState['gameStatus']
        newState.message = `Another WAR! Both played ${playerBattleCard.rank} again!`
      }

      return newState
    })

    // Process result after delay
    setTimeout(() => {
      setGameState(prev => {
        const newState = { ...prev, isProcessing: false }

        if (newState.playerDeck.length === 0) {
          newState.gameStatus = 'computer-wins'
          newState.message = 'Computer wins the game!'
          setShowGameOverDialog(true)
        } else if (newState.computerDeck.length === 0) {
          newState.gameStatus = 'player-wins'
          newState.message = 'You win the game!'
          setShowGameOverDialog(true)
        }

        return newState
      })
    }, 1500)
  }, [gameState.isProcessing, gameState.gameStatus])

  const getButtonText = () => {
    if (gameState.isProcessing) return 'Processing...'
    if (gameState.gameStatus === 'war') return 'Continue War'
    return 'Draw Cards'
  }

  const getButtonAction = () => {
    if (gameState.gameStatus === 'war') return handleWar
    return drawCards
  }

  return (
    <GameArea>
      {/* Game Header */}
      <Box textAlign="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          War Card Game
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Higher card wins! Aces are high. When cards tie, it's WAR!
        </Typography>
      </Box>

      {/* Game Stats */}
      <Box display="flex" gap={3} alignItems="center" mb={2}>
        <Chip 
          label={`Round: ${gameState.round}`} 
          color="primary" 
          variant="outlined" 
        />
        {gameState.gameStatus === 'war' && (
          <Chip 
            label="WAR MODE" 
            color="warning" 
            variant="filled"
            sx={{ fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}
          />
        )}
      </Box>

      {/* Player Deck Areas */}
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" maxWidth="800px" mb={3}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography variant="h6" color="primary">Your Deck</Typography>
          <DeckVisual
            cards={gameState.playerDeck}
            label="Your Cards"
            size="medium"
            showCount={true}
            showLabel={false}
            maxVisibleCards={5}
            onClick={() => {}} // Placeholder for potential future functionality
            disabled={gameState.isProcessing}
          />
        </Box>
        
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary" fontWeight="bold">
            WAR PILE
          </Typography>
          {gameState.warPile.length > 0 ? (
            <DeckVisual
              cards={gameState.warPile}
              label="War Cards"
              size="small"
              showCount={true}
              showLabel={false}
              maxVisibleCards={3}
              stackOffset={2}
              style={{ opacity: 0.8 }}
            />
          ) : (
            <Box 
              width={50} 
              height={70} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              border="1px dashed #ccc"
              borderRadius={1}
              color="text.disabled"
              fontSize="0.7rem"
            >
              Empty
            </Box>
          )}
        </Box>
        
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Typography variant="h6" color="error">Computer Deck</Typography>
          <DeckVisual
            cards={gameState.computerDeck}
            label="Computer Cards"
            size="medium"
            showCount={true}
            showLabel={false}
            maxVisibleCards={5}
            onClick={() => {}} // Placeholder for potential future functionality
            disabled={gameState.isProcessing}
          />
        </Box>
      </Box>

      {/* Battle Area */}
      <BattleArea>
        <Box textAlign="center">
          <Typography variant="subtitle2" gutterBottom>Your Card</Typography>
          {gameState.playerCard ? (
            <Card 
              card={gameState.playerCard} 
              size="large"
            />
          ) : (
            <Box 
              width={90} 
              height={126} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              border="2px dashed #ccc"
              borderRadius={2}
            >
              <Typography variant="body2" color="text.secondary">
                No Card
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="h5" color="primary" fontWeight="bold">
          VS
        </Typography>

        <Box textAlign="center">
          <Typography variant="subtitle2" gutterBottom>Computer Card</Typography>
          {gameState.computerCard ? (
            <Card 
              card={gameState.computerCard} 
              size="large"
            />
          ) : (
            <Box 
              width={90} 
              height={126} 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              border="2px dashed #ccc"
              borderRadius={2}
            >
              <Typography variant="body2" color="text.secondary">
                No Card
              </Typography>
            </Box>
          )}
        </Box>
      </BattleArea>

      {/* Game Message */}
      <Alert 
        severity={
          gameState.gameStatus === 'war' ? 'warning' : 
          gameState.message.includes('Player wins') ? 'success' : 
          gameState.message.includes('Computer wins') ? 'error' : 'info'
        }
        sx={{ maxWidth: 600, textAlign: 'center' }}
      >
        {gameState.message}
      </Alert>

      {/* Progress Bar */}
      {gameState.isProcessing && (
        <Box width="100%" maxWidth={400}>
          <LinearProgress />
        </Box>
      )}

      {/* Game Controls */}
      <Box display="flex" gap={2} mt={2}>
        <GameButton
          onClick={getButtonAction()}
          disabled={gameState.isProcessing || gameState.gameStatus === 'player-wins' || gameState.gameStatus === 'computer-wins'}
          variant="primary"
        >
          {getButtonText()}
        </GameButton>
        
        <GameButton
          onClick={resetGame}
          variant="secondary"
        >
          New Game
        </GameButton>
      </Box>

      {/* Game Over Dialog */}
      <GameDialog
        open={showGameOverDialog}
        title="Game Over!"
        subtitle={
          gameState.gameStatus === 'player-wins' 
            ? 'Congratulations! You won!' 
            : 'Better luck next time!'
        }
        onClose={() => setShowGameOverDialog(false)}
        actions={
          <Box display="flex" gap={2}>
            <GameButton onClick={resetGame} variant="primary">
              Play Again
            </GameButton>
            <GameButton 
              onClick={() => setShowGameOverDialog(false)} 
              variant="secondary"
            >
              Close
            </GameButton>
          </Box>
        }
      >
        <Typography variant="body1" textAlign="center">
          {gameState.gameStatus === 'player-wins' 
            ? `You won after ${gameState.round} rounds! The computer ran out of cards.`
            : `Game over after ${gameState.round} rounds. You ran out of cards.`
          }
        </Typography>
        
        <Box mt={2} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            Final Score:
          </Typography>
          <Typography variant="body2">
            Your cards: {gameState.playerDeck.length} | Computer cards: {gameState.computerDeck.length}
          </Typography>
        </Box>
      </GameDialog>
    </GameArea>
  )
}