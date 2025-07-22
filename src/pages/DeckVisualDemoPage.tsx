import { Container, useTheme, useMediaQuery } from '@mui/material'
import { DeckVisualDemo } from '../components/games/card-game/DeckVisualDemo'

export const DeckVisualDemoPage = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: isMobile ? 0 : 4,
        px: isMobile ? 0 : undefined,
        height: isMobile ? '100vh' : 'auto',
        overflow: isMobile ? 'hidden' : 'auto'
      }}
    >
      <DeckVisualDemo />
    </Container>
  )
}