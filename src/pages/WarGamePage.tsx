import { Container, Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ArrowBack } from '@mui/icons-material'
import { WarGame } from '../components/games/card-game/WarGame'
import { GameCard } from '../components/shared/GameCard'

export const WarGamePage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 0 : 4, 
        px: isMobile ? 0 : undefined,
        height: isMobile ? '100vh' : 'auto',
        overflow: isMobile ? 'hidden' : 'auto'
      }}
    >
      <Box mb={isMobile ? 1 : 3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/card-games')}
          sx={{ mb: isMobile ? 1 : 2 }}
        >
          Back to Card Games
        </Button>
        
        <Typography variant="h3" component="h1" gutterBottom>
          War Card Game
        </Typography>
        {!isMobile && (
          <Typography variant="body1" color="text.secondary" paragraph>
            Battle it out in the classic card game War! Each player draws a card, and the higher card wins both cards.
            When cards are equal, it's time for WAR - draw 3 cards face down and 1 face up to determine the winner!
          </Typography>
        )}
      </Box>

      <GameCard>
        <WarGame />
      </GameCard>
    </Container>
  )
}