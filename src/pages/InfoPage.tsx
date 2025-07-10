import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { 
  Code, 
  Speed, 
  Security, 
  Palette 
} from '@mui/icons-material'

export const InfoPage = () => {
  const features = [
    {
      icon: <Code />,
      title: 'TypeScript',
      description: 'Type-safe development with modern TypeScript'
    },
    {
      icon: <Speed />,
      title: 'Vite',
      description: 'Lightning-fast build tool and dev server'
    },
    {
      icon: <Palette />,
      title: 'Material-UI',
      description: 'Beautiful React components with Material Design'
    },
    {
      icon: <Security />,
      title: 'Redux Toolkit',
      description: 'Modern state management with Redux'
    }
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Project Information
      </Typography>
      
      <Typography variant="h6" color="text.secondary" paragraph>
        Technical details and architecture of this web application
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                🚀 Modern Tech Stack
              </Typography>
              <Typography variant="body1" paragraph>
                This application demonstrates how to build modern React applications using
                the latest technologies and development practices. It showcases state management,
                routing, interactive games, and responsive design patterns.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Core Technologies
                </Typography>
                <Chip label="React 18" color="primary" sx={{ mr: 1, mb: 1 }} />
                <Chip label="TypeScript" color="primary" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Vite" color="secondary" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Material-UI" color="secondary" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Redux Toolkit" color="success" sx={{ mr: 1, mb: 1 }} />
                <Chip label="React Router" color="success" sx={{ mr: 1, mb: 1 }} />
                
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Game Features
                </Typography>
                <Chip label="Canvas API" color="warning" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Game Loop" color="warning" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Touch Events" color="warning" sx={{ mr: 1, mb: 1 }} />
                <Chip label="SVG Graphics" color="warning" sx={{ mr: 1, mb: 1 }} />
              </Box>

              <Typography variant="h6" gutterBottom>
                Key Features
              </Typography>
              <List>
                {features.map((feature, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemIcon>
                      {feature.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={feature.title}
                      secondary={feature.description}
                    />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Project Goals
                </Typography>
                <Typography variant="body2" paragraph>
                  • Demonstrate modern React development patterns
                </Typography>
                <Typography variant="body2" paragraph>
                  • Showcase responsive design and mobile compatibility
                </Typography>
                <Typography variant="body2" paragraph>
                  • Implement interactive games with smooth user experience
                </Typography>
                <Typography variant="body2" paragraph>
                  • Practice state management and component architecture
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
} 