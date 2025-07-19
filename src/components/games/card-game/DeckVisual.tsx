import React from 'react'
import { Box, Typography, Badge } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Card, CardData } from './Card'

interface DeckVisualProps {
  cards: CardData[]
  label?: string
  size?: 'small' | 'medium' | 'large'
  maxVisibleCards?: number
  showCount?: boolean
  showLabel?: boolean
  orientation?: 'vertical' | 'horizontal'
  stackOffset?: number
  onClick?: () => void
  disabled?: boolean
  style?: React.CSSProperties
}

const DeckContainer = styled(Box)<{
  size: 'small' | 'medium' | 'large'
  isEmpty: boolean
  clickable: boolean
  orientation: 'vertical' | 'horizontal'
}>(({ theme, size, isEmpty, clickable, orientation }) => {
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
    opacity: isEmpty ? 0.4 : 1,
    transition: 'all 0.3s ease-in-out',
    cursor: clickable && !isEmpty ? 'pointer' : 'default',
    '& .deck-stack': {
      position: 'relative',
      width: orientation === 'horizontal' ? config.width + 20 : config.width,
      height: orientation === 'vertical' ? config.height + 20 : config.height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '&:hover': clickable && !isEmpty ? {
        '& .deck-card': {
          transform: orientation === 'vertical' 
            ? 'translateY(-3px)' 
            : 'translateX(-3px)',
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
    small: { width: 50, height: 70, fontSize: '0.6rem' },
    medium: { width: 70, height: 98, fontSize: '0.7rem' },
    large: { width: 90, height: 126, fontSize: '0.8rem' }
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
    fontSize: config.fontSize,
    textAlign: 'center',
    fontWeight: 500,
  }
})

const createDummyCard = (index: number): CardData => ({
  id: `deck-visual-${index}`,
  suit: 'spades',
  rank: 'A',
  color: 'black',
  faceUp: false
})

export const DeckVisual: React.FC<DeckVisualProps> = ({
  cards,
  label = 'Deck',
  size = 'medium',
  maxVisibleCards = 4,
  showCount = true,
  showLabel = true,
  orientation = 'vertical',
  stackOffset = 3,
  onClick,
  disabled = false,
  style
}) => {
  const isEmpty = cards.length === 0
  const canClick = !isEmpty && !disabled && onClick

  const handleClick = () => {
    if (canClick) {
      onClick()
    }
  }

  const renderDeckStack = () => {
    if (isEmpty) {
      return (
        <EmptyDeckPlaceholder size={size}>
          Empty<br />Deck
        </EmptyDeckPlaceholder>
      )
    }

    const visibleCards = Math.min(cards.length, maxVisibleCards)
    const dummyCards = Array.from({ length: visibleCards }, (_, i) => createDummyCard(i))

    return (
      <div className="deck-stack" onClick={handleClick}>
        {dummyCards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            size={size}
            disabled={disabled}
            style={{
              zIndex: visibleCards - index,
              transform: orientation === 'vertical'
                ? `translate(${index * stackOffset}px, ${index * -stackOffset}px)`
                : `translate(${index * -stackOffset}px, ${index * stackOffset}px)`,
            }}
            className="deck-card"
          />
        ))}
      </div>
    )
  }

  const deckContent = (
    <DeckContainer
      size={size}
      isEmpty={isEmpty}
      clickable={canClick}
      orientation={orientation}
      style={style}
    >
      {renderDeckStack()}
      
      {showLabel && (
        <Typography 
          variant="caption" 
          sx={{ 
            textAlign: 'center',
            fontWeight: 500,
            color: isEmpty ? 'text.disabled' : 'text.secondary'
          }}
        >
          {label}
        </Typography>
      )}
    </DeckContainer>
  )

  if (showCount && !isEmpty) {
    return (
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
            fontWeight: 'bold',
          }
        }}
      >
        {deckContent}
      </Badge>
    )
  }

  return deckContent
}