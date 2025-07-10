import { useNavigate } from 'react-router-dom'
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Container,
  Grid,
  Button,
  Avatar,
  Chip
} from '@mui/material'
import { 
  Search, 
  Timer,
  Star,
  TrendingUp,
  Psychology,
  PlayArrow,
  EmojiEvents
} from '@mui/icons-material'

interface GameTypeCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  difficulty: 'Easy' | 'Medium' | 'Hard'
  estimatedTime: string
  features: string[]
  route: string
  color: string
  available: boolean
}

export const WordSearchHubPage = () => {
  const navigate = useNavigate()

  const gameTypes: GameTypeCard[] = [
    {
      id: 'classic',
      title: 'Classic Word Search',
      description: 'Traditional word search with hidden words in all directions. Perfect for beginners and casual players.',
      icon: <Search sx={{ fontSize: 40 }} />,
      difficulty: 'Easy',
      estimatedTime: '5-15 min',
      features: ['Hidden words in grid', 'Multiple difficulty levels', 'Timer tracking', 'Mobile friendly'],
      route: '/word-search/classic',
      color: '#4caf50',
      available: true
    },
    {
      id: 'speed',
      title: 'Speed Challenge',
      description: 'Race against time to find words as quickly as possible. For competitive players who love a challenge.',
      icon: <Timer sx={{ fontSize: 40 }} />,
      difficulty: 'Medium',
      estimatedTime: '3-5 min',
      features: ['Time pressure', 'Bonus scoring', 'Leaderboards', 'Quick rounds'],
      route: '/word-search/speed',
      color: '#ff9800',
      available: false
    },
    {
      id: 'themed',
      title: 'Themed Puzzles',
      description: 'Word searches based on specific topics like animals, countries, or science. Educational and fun!',
      icon: <Star sx={{ fontSize: 40 }} />,
      difficulty: 'Medium',
      estimatedTime: '10-20 min',
      features: ['Topic-based words', 'Educational content', 'Multiple themes', 'Learning focused'],
      route: '/word-search/themed',
      color: '#2196f3',
      available: false
    },
    {
      id: 'adaptive',
      title: 'Adaptive Challenge',
      description: 'AI-powered difficulty that adapts to your skill level. Gets harder as you improve!',
      icon: <Psychology sx={{ fontSize: 40 }} />,
      difficulty: 'Hard',
      estimatedTime: '15-30 min',
      features: ['AI difficulty scaling', 'Personalized challenges', 'Skill tracking', 'Advanced algorithms'],
      route: '/word-search/adaptive',
      color: '#9c27b0',
      available: false
    }
  ]

  const handleGameSelect = (gameType: GameTypeCard) => {
    if (gameType.available) {
      navigate(gameType.route)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#4caf50'
      case 'Medium': return '#ff9800'
      case 'Hard': return '#f44336'
      default: return '#2196f3'
    }
  }

  const getDifficultyStars = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 1
      case 'Medium': return 2
      case 'Hard': return 3
      default: return 1
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Word Search Games
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Choose your word search adventure! Different game modes for every type of player.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {gameTypes.map((gameType) => (
          <Grid item xs={12} md={6} key={gameType.id}>
            <Card 
              elevation={gameType.available ? 4 : 2}
              sx={{ 
                height: '100%',
                cursor: gameType.available ? 'pointer' : 'default',
                opacity: gameType.available ? 1 : 0.6,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'visible',
                '&:hover': gameType.available ? {
                  elevation: 8,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${gameType.color}40`
                } : {}
              }}
              onClick={() => handleGameSelect(gameType)}
            >
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      bgcolor: gameType.color,
                      mr: 2,
                      mt: 0.5
                    }}
                  >
                    {gameType.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {gameType.title}
                      {!gameType.available && (
                        <Chip 
                          label="Coming Soon" 
                          size="small" 
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                          color="warning"
                        />
                      )}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        label={gameType.difficulty}
                        size="small"
                        sx={{ 
                          bgcolor: getDifficultyColor(gameType.difficulty),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {[...Array(getDifficultyStars(gameType.difficulty))].map((_, i) => (
                          <Star key={i} sx={{ color: '#ffd700', fontSize: 16 }} />
                        ))}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {gameType.estimatedTime}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Description */}
                <Typography variant="body1" color="text.secondary" paragraph sx={{ flex: 1 }}>
                  {gameType.description}
                </Typography>

                {/* Features */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Features:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {gameType.features.map((feature, index) => (
                      <Chip 
                        key={index}
                        label={feature}
                        variant="outlined"
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Action Button */}
                <Button
                  variant={gameType.available ? "contained" : "outlined"}
                  fullWidth
                  size="large"
                  startIcon={gameType.available ? <PlayArrow /> : <EmojiEvents />}
                  sx={{
                    bgcolor: gameType.available ? gameType.color : 'transparent',
                    borderColor: gameType.color,
                    color: gameType.available ? 'white' : gameType.color,
                    '&:hover': {
                      bgcolor: gameType.available ? gameType.color : `${gameType.color}10`,
                      borderColor: gameType.color
                    }
                  }}
                  disabled={!gameType.available}
                >
                  {gameType.available ? 'Play Now' : 'Coming Soon'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Statistics Section */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Why Play Word Search?
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Box>
              <Psychology sx={{ fontSize: 48, color: '#2196f3', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Brain Training
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Improve concentration, pattern recognition, and vocabulary skills
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <Timer sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Quick & Fun
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Perfect for short breaks or longer relaxation sessions
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box>
              <TrendingUp sx={{ fontSize: 48, color: '#ff9800', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Progressive Challenge
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Multiple difficulty levels to match your skill and grow with you
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}