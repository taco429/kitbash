import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper
} from '@mui/material'
import { LocalFireDepartment, Person, Computer } from '@mui/icons-material'

interface GameCard {
  id: number
  value: number
}

interface Player {
  name: string
  hand: GameCard[]
  score: number
  isHuman: boolean
}

const createDeck = (): GameCard[] => {
  const deck: GameCard[] = []
  let id = 0
  // Create 4 copies of each card value (1-13)
  for (let copy = 0; copy < 4; copy++) {
    for (let value = 1; value <= 13; value++) {
      deck.push({ id: id++, value })
    }
  }
  return shuffleDeck(deck)
}

const shuffleDeck = (deck: GameCard[]): GameCard[] => {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const WINNING_SCORE = 100
const INITIAL_HAND_SIZE = 10

export const BattlerPage = () => {
  const [deck, setDeck] = useState<GameCard[]>([])
  const [humanPlayer, setHumanPlayer] = useState<Player>({
    name: 'You',
    hand: [],
    score: 0,
    isHuman: true
  })
  const [computerPlayer, setComputerPlayer] = useState<Player>({
    name: 'Computer',
    hand: [],
    score: 0,
    isHuman: false
  })
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'gameOver'>('setup')
  const [winner, setWinner] = useState<string | null>(null)
  const [turn, setTurn] = useState<'human' | 'computer'>('human')
  const [lastMove, setLastMove] = useState<string>('')
  const [gameStarted, setGameStarted] = useState(false)

  const initializeGame = () => {
    const newDeck = createDeck()
    const humanHand: GameCard[] = []
    const computerHand: GameCard[] = []
    
    // Deal initial hands
    for (let i = 0; i < INITIAL_HAND_SIZE; i++) {
      humanHand.push(newDeck.pop()!)
      computerHand.push(newDeck.pop()!)
    }

    setHumanPlayer({
      name: 'You',
      hand: humanHand,
      score: 0,
      isHuman: true
    })
    
    setComputerPlayer({
      name: 'Computer',
      hand: computerHand,
      score: 0,
      isHuman: false
    })
    
    setDeck(newDeck)
    setGamePhase('playing')
    setWinner(null)
    setTurn('human')
    setLastMove('Game started! Choose a card to play.')
    setGameStarted(true)
  }

  const drawCard = (_player: Player): GameCard | null => {
    if (deck.length === 0) return null
    const newDeck = [...deck]
    const drawnCard = newDeck.pop()!
    setDeck(newDeck)
    return drawnCard
  }

  const playCard = (player: Player, cardIndex: number, isHuman: boolean = true) => {
    const newPlayer = { ...player }
    const playedCard = newPlayer.hand.splice(cardIndex, 1)[0]
    newPlayer.score += playedCard.value
    
    // Draw a new card if deck has cards
    const newCard = drawCard(player)
    if (newCard) {
      newPlayer.hand.push(newCard)
    }

    if (isHuman) {
      setHumanPlayer(newPlayer)
      setLastMove(`You played ${playedCard.value} and gained ${playedCard.value} points!`)
    } else {
      setComputerPlayer(newPlayer)
      setLastMove(`Computer played ${playedCard.value} and gained ${playedCard.value} points!`)
    }

    // Check for winner
    if (newPlayer.score >= WINNING_SCORE) {
      setWinner(newPlayer.name)
      setGamePhase('gameOver')
      return
    }

    // Switch turns
    setTurn(isHuman ? 'computer' : 'human')
  }

  const computerMove = () => {
    if (turn !== 'computer' || gamePhase !== 'playing') return

    setTimeout(() => {
      const hand = computerPlayer.hand
      if (hand.length === 0) return

      // Simple AI: Play highest card if close to winning, otherwise play random
      let cardIndex = 0
      if (computerPlayer.score >= 80) {
        // Play highest card when close to winning
        cardIndex = hand.reduce((maxIndex, card, index) => 
          card.value > hand[maxIndex].value ? index : maxIndex, 0)
      } else if (humanPlayer.score >= 80) {
        // Play highest card if human is close to winning
        cardIndex = hand.reduce((maxIndex, card, index) => 
          card.value > hand[maxIndex].value ? index : maxIndex, 0)
      } else {
        // Play a random card
        cardIndex = Math.floor(Math.random() * hand.length)
      }

      playCard(computerPlayer, cardIndex, false)
    }, 1000)
  }

  useEffect(() => {
    if (turn === 'computer' && gamePhase === 'playing') {
      computerMove()
    }
  }, [turn, gamePhase])

  const resetGame = () => {
    setGamePhase('setup')
    setGameStarted(false)
    setWinner(null)
    setLastMove('')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'error'
    if (score >= 60) return 'warning'
    return 'primary'
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <LocalFireDepartment sx={{ fontSize: 'inherit', color: 'primary.main' }} />
          Battler
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Race to 100 points! Choose your cards wisely and outplay the AI.
        </Typography>
      </Box>

      {!gameStarted ? (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Each player starts with 10 cards. Each turn, choose a card to play and add its value to your score.
            The first player to reach 100 points wins!
          </Typography>
          <Button variant="contained" size="large" onClick={initializeGame}>
            Start Game
          </Button>
        </Box>
      ) : (
        <>
          {/* Score Display */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ mr: 1 }} />
                  <Typography variant="h6">Your Score: {humanPlayer.score}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(humanPlayer.score / WINNING_SCORE) * 100}
                  color={getScoreColor(humanPlayer.score)}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Computer sx={{ mr: 1 }} />
                  <Typography variant="h6">Computer Score: {computerPlayer.score}</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(computerPlayer.score / WINNING_SCORE) * 100}
                  color={getScoreColor(computerPlayer.score)}
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Paper>
            </Grid>
          </Grid>

          {/* Game Status */}
          {lastMove && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {lastMove}
            </Alert>
          )}

          {/* Current Turn Indicator */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Chip 
              label={turn === 'human' ? 'Your Turn' : 'Computer\'s Turn'} 
              color={turn === 'human' ? 'primary' : 'secondary'}
              variant="filled"
              size="medium"
            />
          </Box>

          {/* Player's Hand */}
          {gamePhase === 'playing' && turn === 'human' && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Your Hand:</Typography>
              <Grid container spacing={2}>
                {humanPlayer.hand.map((card, index) => (
                  <Grid item key={card.id}>
                    <Card 
                      sx={{ 
                        minWidth: 80,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        }
                      }}
                      onClick={() => playCard(humanPlayer, index, true)}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="h5" component="div">
                          {card.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Click on a card to play it. Cards remaining in deck: {deck.length}
              </Typography>
            </Box>
          )}

          {/* Computer's Hand (hidden) */}
          {gamePhase === 'playing' && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Computer's Hand:</Typography>
              <Grid container spacing={2}>
                {computerPlayer.hand.map((_, index) => (
                  <Grid item key={index}>
                    <Card sx={{ minWidth: 80, bgcolor: 'grey.300' }}>
                      <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="h5" component="div" color="text.secondary">
                          ?
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </>
      )}

      {/* Game Over Dialog */}
      <Dialog open={gamePhase === 'gameOver'} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          {winner === 'You' ? '🎉 Congratulations!' : '😔 Game Over'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
            {winner === 'You' 
              ? `You won with ${humanPlayer.score} points!` 
              : `Computer won with ${computerPlayer.score} points!`
            }
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Final Scores: You: {humanPlayer.score}, Computer: {computerPlayer.score}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <Button onClick={resetGame} variant="contained">
            Play Again
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}