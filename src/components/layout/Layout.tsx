import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { AppHeader } from './AppHeader'
import { NavigationDrawer } from './NavigationDrawer'

const drawerWidth = 240

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Check if we're on a word search game page (not the hub) and on mobile for full-screen mode
  const isWordSearchGamePage = location.pathname.startsWith('/word-search/') && location.pathname !== '/word-search'
  const showFullScreen = isWordSearchGamePage && isMobile

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  // If word search on mobile, render full-screen without layout chrome
  if (showFullScreen) {
    return (
      <Box sx={{ height: '100vh', overflow: 'hidden' }}>
        {children}
      </Box>
    )
  }

  const drawer = <NavigationDrawer onNavigate={handleNavigation} />

  return (
    <Box sx={{ display: 'flex' }}>
      <AppHeader drawerWidth={drawerWidth} onMenuToggle={handleDrawerToggle} />

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
} 