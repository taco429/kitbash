import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material'
import { Menu as MenuIcon, Code } from '@mui/icons-material'
import { getVersion } from '../../utils/version'

interface AppHeaderProps {
  drawerWidth: number
  onMenuToggle: () => void
}

export const AppHeader = ({ drawerWidth, onMenuToggle }: AppHeaderProps) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Code sx={{ mr: 2 }} />
        <Typography variant="h6" noWrap component="div">
          Kitbash
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="body2">
          v{getVersion()}
        </Typography>
      </Toolbar>
    </AppBar>
  )
} 