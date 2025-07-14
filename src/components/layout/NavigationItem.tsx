import { ListItem, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material'

interface NavigationItemProps {
  text: string
  icon: React.ReactNode
  path: string
  isSelected: boolean
  onNavigate: (path: string) => void
}

export const NavigationItem = ({ text, icon, path, isSelected, onNavigate }: NavigationItemProps) => {
  const theme = useTheme()

  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={isSelected}
        onClick={() => onNavigate(path)}
        sx={{
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            '& .MuiListItemIcon-root': {
              color: theme.palette.primary.contrastText,
            },
          },
        }}
      >
        <ListItemIcon sx={{ color: 'inherit' }}>
          {icon}
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItemButton>
    </ListItem>
  )
} 