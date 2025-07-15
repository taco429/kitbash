import React from 'react'
import { Box, Typography, Button, Badge } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Card, CardData } from './Card'

interface DeckProps {
  cards: CardData[]
  onDrawCard?: () => void
  onShuffle?: () => void
  label?: string
  disabled?: boolean
  maxVisibleCards?: number
  size?: 'small' | 'medium' | 'large'
  showCount?: boolean
  interactive?: boolean
  style?: React.CSSProperties
}

const DeckContainer = styled(Box)<{
  size: 'small' | 'medium' | 'large'
  interactive: boolean
  isEmpty: boolean
}>(({ theme, size, interactive, isEmpty }) => {
  const sizeConfig = {
    small: { width: 50, height: 70 },
    medium: { width: 70, height: 98 },
    large: { width: 90, height: 126 }
  }

  const config = sizeConfig[size]

  return {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    opacity: isEmpty ? 0.3 : 1,
    transition: 'opacity 0.3s ease-in-out',
    '& .deck-stack': {
      position: 'relative',
      width: config.width,
      height: config.height,
      cursor: interactive && !isEmpty ? 'pointer' : 'default',
      '&:hover': interactive && !isEmpty ? {
        '& .deck-card': {
          transform: 'translateY(-2px)',
        }
      } : {},
    },
    '& .deck-card': {
      position: 'absolute',
      transition: 'transform 0.2s ease-in-out',
    }
  }
})

const EmptyDeckPlaceholder = styled(Box)<{
  size: 'small' | 'medium' | 'large'
}>(({ theme, size }) => {
  const sizeConfig = {
    small: { width: 50, height: 70 },
    medium: { width: 70, height: 98 },
    large: { width: 90, height: 126 }
  }

  const config = sizeConfig[size]

  return {
    width: config.width,
    height: config.height,
    border: `2px dashed ${theme.palette.grey[400]}`,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.grey[500],
    fontSize: '0.7em',
    textAlign: 'center',
  }
})

const createDummyCard = (index: number): CardData => ({
  id: `dummy-${index}`,
  suit: 'spades',
  rank: 'A',
  color: 'black',
  faceUp: false
})

export const Deck: React.FC<DeckProps> = ({
  cards,
  onDrawCard,
  onShuffle,
  label = 'Deck',
  disabled = false,
  maxVisibleCards = 3,
  size = 'medium',
  showCount = true,
  interactive = true,
  style
}) => {
  const isEmpty = cards.length === 0
  const canDraw = !isEmpty && !disabled && interactive && onDrawCard
  const canShuffle = !isEmpty && !disabled && interactive && onShuffle

  const handleDeckClick = () => {
    if (canDraw) {
      onDrawCard()
    }
  }

  const handleShuffleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (canShuffle) {
      onShuffle()
    }
  }

  const renderDeckStack = () => {
    if (isEmpty) {
      return (
        <EmptyDeckPlaceholder size={size}>
          Empty
        </EmptyDeckPlaceholder>
      )
    }

    const visibleCards = Math.min(cards.length, maxVisibleCards)
    const dummyCards = Array.from({ length: visibleCards }, (_, i) => createDummyCard(i))

    return (
      <div className="deck-stack" onClick={handleDeckClick}>
        {dummyCards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            size={size}
            style={{
              zIndex: index,
              transform: `translate(${index * 2}px, ${index * -2}px)`,
            }}
            className="deck-card"
          />
        ))}
      </div>
    )
  }

  return (
    <DeckContainer
      size={size}
      interactive={interactive}
      isEmpty={isEmpty}
      style={style}
    >
      {showCount && (
        <Badge
          badgeContent={cards.length}
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              right: -8,
              top: -8,
              fontSize: '0.75rem',
              minWidth: 20,
              height: 20,
            }
          }}
        >
          <Typography variant="caption" sx={{ minHeight: 20 }}>
            {label}
          </Typography>
        </Badge>
      )}
      
      {renderDeckStack()}

      {interactive && !isEmpty && (
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {onDrawCard && (
            <Button
              size="small"
              variant="outlined"
              onClick={handleDeckClick}
              disabled={disabled || isEmpty}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Draw
            </Button>
          )}
          {onShuffle && (
            <Button
              size="small"
              variant="text"
              onClick={handleShuffleClick}
              disabled={disabled || isEmpty}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Shuffle
            </Button>
          )}
        </Box>
      )}
    </DeckContainer>
  )
} 