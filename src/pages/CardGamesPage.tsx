import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Container } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { 
  Casino, 
  Style, 
  LocalFireDepartment, 
  Bolt,
  Diamond,
  Favorite
} from '@mui/icons-material'

interface CardGame {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  path: string
  isComingSoon?: boolean
}

const cardGames: CardGame[] = [
  {
    id: 'demo',
    name: 'Card Game Demo',
    description: 'Interactive demonstration of reusable card game components',
    icon: <Style />,
    path: '/card-games/demo',
    isComingSoon: false
  },
  {
    id: 'poker',
    name: 'Texas Hold\'em Poker',
    description: 'Classic poker with community cards and betting rounds',
    icon: <Casino />,
    path: '/card-games/poker',
    isComingSoon: true
  },
  {
    id: 'blackjack',
    name: 'Blackjack',
    description: 'Beat the dealer by getting as close to 21 as possible',
    icon: <LocalFireDepartment />,
    path: '/card-games/blackjack',
    isComingSoon: true
  },
  {
    id: 'solitaire',
    name: 'Klondike Solitaire',
    description: 'Classic single-player card game',
    icon: <Diamond />,
    path: '/card-games/solitaire',
    isComingSoon: true
  },
  {
    id: 'hearts',
    name: 'Hearts',
    description: 'Trick-taking game where you avoid penalty cards',
    icon: <Favorite />,
    path: '/card-games/hearts',
    isComingSoon: true
  },
  {
    id: 'uno',
    name: 'UNO',
    description: 'Match colors and numbers to be the first to empty your hand',
    icon: <Bolt />,
    path: '/card-games/uno',
    isComingSoon: true
  },
  {
    id: 'war',
    name: 'War',
    description: 'Battle it out in the classic card game! Higher card wins, ties trigger WAR!',
    icon: <Casino />,
    path: '/card-games/war',
    isComingSoon: false
  },
  {
    id: 'deck-visual-demo',
    name: 'Deck Visual Demo',
    description: 'Interactive showcase of the reusable DeckVisual component for card games',
    icon: <Style />,
    path: '/card-games/deck-demo',
    isComingSoon: false
  }
]

export const CardGamesPage = () => {
  const navigate = useNavigate()

  const handleGameClick = (game: CardGame) => {
    if (game.isComingSoon) {
      // For now, just show an alert
      alert(`${game.name} is coming soon!`)
    } else {
      navigate(game.path)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Card Games
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Choose from a variety of classic card games
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {cardGames.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
                opacity: game.isComingSoon ? 0.7 : 1
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ mr: 2, color: 'primary.main' }}>
                    {game.icon}
                  </Box>
                  <Typography variant="h6" component="h2">
                    {game.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {game.description}
                </Typography>
                {game.isComingSoon && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="warning.main" fontWeight="bold">
                      Coming Soon
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant={game.isComingSoon ? "outlined" : "contained"}
                  onClick={() => handleGameClick(game)}
                  disabled={game.isComingSoon}
                  fullWidth
                >
                  {game.isComingSoon ? 'Coming Soon' : 'Play'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          More card games will be added soon! Each game will feature intuitive gameplay,
          multiple difficulty levels, and modern UI design.
        </Typography>
      </Box>
    </Container>
  )
} 