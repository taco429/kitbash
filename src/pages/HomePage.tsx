import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { 
  CheckCircle 
} from '@mui/icons-material'

export const HomePage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to Kitbash
      </Typography>
      
      <Typography variant="h6" color="text.secondary" paragraph>
        A simple web project where I experiment with different ideas and build interactive demos. 
        Feel free to explore and play around!
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                🎉 What's This All About?
              </Typography>
              <Typography variant="body1" paragraph>
                This is my personal playground for web development experiments! I use this space to 
                try out new ideas, build fun interactive demos, and just have a good time coding.
              </Typography>
              
              <Typography variant="body1" paragraph>
                Think of it as a digital workbench where I "kitbash" different concepts together - 
                borrowing ideas from here and there to create something new and interesting.
              </Typography>

              <Typography variant="body1">
                Each demo page showcases different types of interactions and functionality. 
                Some are practical (like the todo list), others are just for fun (like the games). 
                Take a look around and see what catches your interest!
              </Typography>
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
                    secondary="Simple counter with increment/decrement"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Todo List Demo"
                    secondary="Manage your tasks with full CRUD operations"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tower Defense Game"
                    secondary="Strategic tower placement game"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Word Search Game"
                    secondary="Find hidden words in the puzzle grid"
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