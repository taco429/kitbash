import { Box, List, Typography } from '@mui/material'
import { useLocation } from 'react-router-dom'
import {
  Home,
  Info,
  Add,
  FormatListBulleted,
  Games,
  Search,
} from '@mui/icons-material'
import { NavigationItem } from './NavigationItem'

interface NavigationDrawerProps {
  onNavigate: (path: string) => void
}

interface NavigationItemData {
  text: string
  icon: React.ReactNode
  path: string
}

const navigationItems: NavigationItemData[] = [
  { text: 'Home', icon: <Home />, path: '/' },
  { text: 'Project Info', icon: <Info />, path: '/info' },
  { text: 'Counter Demo', icon: <Add />, path: '/counter' },
  { text: 'Todo List Demo', icon: <FormatListBulleted />, path: '/todos' },
  { text: 'Tower Defense', icon: <Games />, path: '/tower-defense' },
  { text: 'Word Search', icon: <Search />, path: '/word-search' },
]

export const NavigationDrawer = ({ onNavigate }: NavigationDrawerProps) => {
  const location = useLocation()

  return (
    <Box>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" noWrap component="div">
          Kitbash
        </Typography>
      </Box>
      <List>
        {navigationItems.map((item) => (
          <NavigationItem
            key={item.text}
            text={item.text}
            icon={item.icon}
            path={item.path}
            isSelected={location.pathname === item.path}
            onNavigate={onNavigate}
          />
        ))}
      </List>
    </Box>
  )
} 