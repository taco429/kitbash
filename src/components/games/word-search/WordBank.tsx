import { List, ListItem, ListItemText, Box, Chip, Typography, Drawer, useTheme, useMediaQuery } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { GameButton } from '../../shared'

interface WordBankProps {
  words: string[]
  foundWords: string[]
  isOpen: boolean
  onClose: () => void
  isMobile?: boolean
}

export const WordBank = ({ words, foundWords, isOpen, onClose, isMobile = false }: WordBankProps) => {
  const theme = useTheme()
  const isMobileSize = useMediaQuery(theme.breakpoints.down('md'))

  const getWordItemStyle = (word: string) => ({
    textDecoration: foundWords.includes(word) ? 'line-through' : 'none',
    color: foundWords.includes(word) ? 'text.secondary' : 'text.primary',
    fontWeight: foundWords.includes(word) ? 'normal' : 'bold'
  })

  const content = (
    <Box sx={{ width: 300, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Words to Find</Typography>
        <GameButton
          variant="secondary"
          size="small"
          onClick={onClose}
          sx={{ minWidth: 'auto', width: 40, height: 40 }}
        >
          <CloseIcon />
        </GameButton>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Chip
          label={`${foundWords.length}/${words.length} found`}
          color={foundWords.length === words.length ? 'success' : 'primary'}
          sx={{ mb: 1 }}
        />
      </Box>

      <List dense>
        {words.map((word, index) => (
          <ListItem key={index} disablePadding>
            <ListItemText
              primary={word}
              sx={getWordItemStyle(word)}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )

  if (isMobile || isMobileSize) {
    return (
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            backgroundColor: 'background.paper',
          }
        }}
      >
        {content}
      </Drawer>
    )
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 88,
        right: isOpen ? 16 : -300,
        height: 'calc(100vh - 120px)',
        width: 300,
        backgroundColor: 'background.paper',
        boxShadow: 3,
        borderRadius: 2,
        transition: 'right 0.3s ease-in-out',
        zIndex: 1000,
        overflowY: 'auto'
      }}
    >
      {content}
    </Box>
  )
} 