import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Container, useTheme, useMediaQuery } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { 
  Casino, 
  Style, 
  LocalFireDepartment
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
  },
  {
    id: 'battler',
    name: 'Battler',
    description: 'Race to 100 points in this strategic card game! Choose your cards wisely and outplay the AI.',
    icon: <LocalFireDepartment />,
    path: '/card-games/battler',
    isComingSoon: false
  }
]

export const CardGamesPage = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

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
                {!isMobile && (
                  <Typography variant="body2" color="text.secondary">
                    {game.description}
                  </Typography>
                )}
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
          Enjoy these fully playable card games! Each features intuitive gameplay,
          strategic depth, and modern UI design.
        </Typography>
      </Box>
    </Container>
  )
} 