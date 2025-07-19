import React, { useState } from 'react'
import { Box, Typography, Button, Grid, Paper } from '@mui/material'
import { DeckVisual } from './DeckVisual'
import { createStandardDeck, shuffleCards } from './utils/deckUtils'
import { CardData } from './Card'

export const DeckVisualDemo: React.FC = () => {
  const [fullDeck, setFullDeck] = useState<CardData[]>(() => 
    shuffleCards(createStandardDeck(false))
  )
  const [smallDeck, setSmallDeck] = useState<CardData[]>(() => 
    shuffleCards(createStandardDeck(false)).slice(0, 10)
  )
  const [emptyDeck] = useState<CardData[]>([])

  const shuffleDecks = () => {
    setFullDeck(shuffleCards(createStandardDeck(false)))
    setSmallDeck(shuffleCards(createStandardDeck(false)).slice(0, 10))
  }

  const drawFromFull = () => {
    if (fullDeck.length > 0) {
      setFullDeck(prev => prev.slice(1))
    }
  }

  const drawFromSmall = () => {
    if (smallDeck.length > 0) {
      setSmallDeck(prev => prev.slice(1))
    }
  }

  const resetDecks = () => {
    setFullDeck(shuffleCards(createStandardDeck(false)))
    setSmallDeck(shuffleCards(createStandardDeck(false)).slice(0, 10))
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        DeckVisual Component Demo
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" mb={4}>
        A reusable component for visualizing card decks in any card game
      </Typography>

      <Box display="flex" gap={2} justifyContent="center" mb={4}>
        <Button variant="outlined" onClick={shuffleDecks}>
          Shuffle Decks
        </Button>
        <Button variant="outlined" onClick={resetDecks}>
          Reset Decks
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Size Variations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Size Variations
            </Typography>
            <Box display="flex" gap={4} justifyContent="center" alignItems="end">
              <DeckVisual
                cards={fullDeck}
                label="Small Size"
                size="small"
                maxVisibleCards={3}
              />
              <DeckVisual
                cards={fullDeck}
                label="Medium Size"
                size="medium"
                maxVisibleCards={4}
              />
              <DeckVisual
                cards={fullDeck}
                label="Large Size"
                size="large"
                maxVisibleCards={5}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Interactive Decks */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Interactive Decks
            </Typography>
            <Box display="flex" gap={3} justifyContent="center" alignItems="end">
              <DeckVisual
                cards={fullDeck}
                label="Full Deck"
                size="medium"
                onClick={drawFromFull}
                showCount={true}
                maxVisibleCards={6}
              />
              <DeckVisual
                cards={smallDeck}
                label="Small Deck"
                size="medium"
                onClick={drawFromSmall}
                showCount={true}
                maxVisibleCards={4}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" align="center" mt={2}>
              Click on the decks to draw cards
            </Typography>
          </Paper>
        </Grid>

        {/* Orientation & Styling */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Orientations & Empty State
            </Typography>
            <Box display="flex" gap={3} justifyContent="center" alignItems="center">
              <DeckVisual
                cards={smallDeck}
                label="Vertical Stack"
                size="medium"
                orientation="vertical"
                stackOffset={4}
              />
              <DeckVisual
                cards={smallDeck}
                label="Horizontal Stack"
                size="medium"
                orientation="horizontal"
                stackOffset={4}
              />
              <DeckVisual
                cards={emptyDeck}
                label="Empty Deck"
                size="medium"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Game Scenarios */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Game Scenarios
            </Typography>
            <Box display="flex" gap={4} justifyContent="center" alignItems="end" flexWrap="wrap">
              <Box textAlign="center">
                <Typography variant="subtitle2" gutterBottom>
                  Player Hand (Poker)
                </Typography>
                <DeckVisual
                  cards={fullDeck.slice(0, 5)}
                  label="Hand"
                  size="small"
                  showCount={false}
                  orientation="horizontal"
                  stackOffset={2}
                />
              </Box>
              
              <Box textAlign="center">
                <Typography variant="subtitle2" gutterBottom>
                  Draw Pile (Solitaire)
                </Typography>
                <DeckVisual
                  cards={fullDeck.slice(0, 24)}
                  label="Draw Pile"
                  size="medium"
                  maxVisibleCards={3}
                  stackOffset={2}
                />
              </Box>
              
              <Box textAlign="center">
                <Typography variant="subtitle2" gutterBottom>
                  Discard Pile
                </Typography>
                <DeckVisual
                  cards={fullDeck.slice(0, 8)}
                  label="Discard"
                  size="medium"
                  maxVisibleCards={2}
                  stackOffset={1}
                  showCount={false}
                />
              </Box>

              <Box textAlign="center">
                <Typography variant="subtitle2" gutterBottom>
                  War Pile (Stacked)
                </Typography>
                <DeckVisual
                  cards={fullDeck.slice(0, 12)}
                  label="War Cards"
                  size="small"
                  maxVisibleCards={6}
                  stackOffset={1}
                  style={{ opacity: 0.9 }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}