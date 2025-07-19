import { Container, Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ArrowBack } from '@mui/icons-material'
import { WarGame } from '../components/games/card-game/WarGame'
import { GameCard } from '../components/shared/GameCard'

export const WarGamePage = () => {
  const navigate = useNavigate()

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/card-games')}
          sx={{ mb: 2 }}
        >
          Back to Card Games
        </Button>
        
        <Typography variant="h3" component="h1" gutterBottom>
          War Card Game
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Battle it out in the classic card game War! Each player draws a card, and the higher card wins both cards.
          When cards are equal, it's time for WAR - draw 3 cards face down and 1 face up to determine the winner!
        </Typography>
      </Box>

      <GameCard>
        <WarGame />
      </GameCard>
    </Container>
  )
}