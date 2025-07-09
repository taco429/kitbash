import { AppBar, Toolbar, Typography, Box } from '@mui/material'
import { Code } from '@mui/icons-material'

export const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Code sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Kitbash - Modern React App
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2">
            React + TypeScript + MUI + Redux Toolkit
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  )
} 