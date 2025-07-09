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
  Palette, 
  CheckCircle 
} from '@mui/icons-material'

export const HomePage = () => {
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
        Welcome to Kitbash
      </Typography>
      
      <Typography variant="h6" color="text.secondary" paragraph>
        A modern React application showcasing the latest technologies and best practices
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                🚀 Modern Tech Stack
              </Typography>
              <Typography variant="body1" paragraph>
                This application demonstrates how to build modern React applications using
                the latest technologies and development practices.
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Chip label="React 18" color="primary" sx={{ mr: 1, mb: 1 }} />
                <Chip label="TypeScript" color="primary" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Vite" color="secondary" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Material-UI" color="secondary" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Redux Toolkit" color="success" sx={{ mr: 1, mb: 1 }} />
                <Chip label="React Router" color="success" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Canvas API" color="warning" sx={{ mr: 1, mb: 1 }} />
                <Chip label="Game Loop" color="warning" sx={{ mr: 1, mb: 1 }} />
              </Box>

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
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                🎯 Demo Pages
              </Typography>
              <Typography variant="body2" paragraph>
                Explore the different demo pages using the navigation menu:
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Counter Demo"
                    secondary="Redux state management"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Todo List Demo"
                    secondary="CRUD operations with Redux"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tower Defense Game"
                    secondary="Interactive game with Canvas rendering"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Word Search Game"
                    secondary="Interactive word search puzzle game"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
} 