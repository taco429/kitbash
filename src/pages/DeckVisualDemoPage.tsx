import React from 'react'
import { Container } from '@mui/material'
import { DeckVisualDemo } from '../components/games/card-game/DeckVisualDemo'

export const DeckVisualDemoPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <DeckVisualDemo />
    </Container>
  )
}