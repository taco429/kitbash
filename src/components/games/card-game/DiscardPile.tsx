import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Card, CardData } from './Card'

interface DiscardPileProps {
  cards: CardData[]
  onCardClick?: (card: CardData) => void
  onClear?: () => void
  label?: string
  size?: 'small' | 'medium' | 'large'
  showTopCard?: boolean
  showCount?: boolean
  maxVisibleCards?: number
  interactive?: boolean
  allowDrop?: boolean
  style?: React.CSSProperties
}

const DiscardPileContainer = styled(Box)<{
  size: 'small' | 'medium' | 'large'
  isEmpty: boolean
  allowDrop: boolean
}>(({ theme, size, isEmpty, allowDrop }) => {
  const sizeConfig = {
    small: { width: 50, height: 70 },
    medium: { width: 70, height: 98 },
    large: { width: 90, height: 126 }
  }

  const config = sizeConfig[size]

  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1),
    position: 'relative',
    '& .discard-stack': {
      position: 'relative',
      width: config.width,
      height: config.height,
      minHeight: config.height,
      border: allowDrop && isEmpty ? `2px dashed ${theme.palette.primary.main}` : 'none',
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: allowDrop && isEmpty ? theme.palette.primary.light + '10' : 'transparent',
    },
    '& .discard-card': {
      position: 'absolute',
      transition: 'transform 0.2s ease-in-out',
    }
  }
})

const EmptyDiscardPlaceholder = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.7rem',
  textAlign: 'center',
  fontStyle: 'italic',
}))

export const DiscardPile: React.FC<DiscardPileProps> = ({
  cards,
  onCardClick,
  onClear,
  label = 'Discard Pile',
  size = 'medium',
  showTopCard = true,
  showCount = true,
  maxVisibleCards = 3,
  interactive = true,
  allowDrop = true,
  style
}) => {
  const isEmpty = cards.length === 0
  const topCard = cards[cards.length - 1]

  const handleCardClick = () => {
    if (interactive && onCardClick && topCard) {
      onCardClick(topCard)
    }
  }

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClear) {
      onClear()
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (allowDrop) {
      const cardData = e.dataTransfer.getData('text/plain')
      if (cardData) {
        try {
          const card = JSON.parse(cardData) as CardData
          if (onCardClick) {
            onCardClick(card)
          }
        } catch (error) {
          console.error('Invalid card data:', error)
        }
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (allowDrop) {
      e.preventDefault()
    }
  }

  const renderDiscardStack = () => {
    if (isEmpty) {
      return (
        <EmptyDiscardPlaceholder>
          {allowDrop ? 'Drop cards here' : 'Empty'}
        </EmptyDiscardPlaceholder>
      )
    }

    const visibleCards = Math.min(cards.length, maxVisibleCards)
    const startIndex = Math.max(0, cards.length - visibleCards)
    const visibleCardsList = cards.slice(startIndex)

    return (
      <>
        {visibleCardsList.map((card, index) => {
          const isTopCard = index === visibleCardsList.length - 1
          const displayCard = showTopCard && isTopCard ? { ...card, faceUp: true } : card
          
          return (
            <Card
              key={`${card.id}-${startIndex + index}`}
              card={displayCard}
              size={size}
              onClick={isTopCard ? handleCardClick : undefined}
              style={{
                zIndex: index,
                transform: `translate(${index * 1}px, ${index * -1}px)`,
                cursor: isTopCard && interactive ? 'pointer' : 'default',
              }}
              className="discard-card"
            />
          )
        })}
      </>
    )
  }

  return (
    <DiscardPileContainer
      size={size}
      isEmpty={isEmpty}
      allowDrop={allowDrop}
      style={style}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
        {showCount && ` (${cards.length})`}
      </Typography>
      
      <div
        className="discard-stack"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {renderDiscardStack()}
      </div>

      {interactive && !isEmpty && onClear && (
        <Button
          size="small"
          variant="text"
          onClick={handleClearClick}
          sx={{ minWidth: 'auto', px: 2, mt: 1 }}
        >
          Clear
        </Button>
      )}
    </DiscardPileContainer>
  )
} 