import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Card, CardData } from './Card'

interface HandProps {
  cards: CardData[]
  onCardClick?: (card: CardData, index: number) => void
  onCardDoubleClick?: (card: CardData, index: number) => void
  selectedCards?: string[]
  label?: string
  maxCards?: number
  size?: 'small' | 'medium' | 'large'
  layout?: 'fan' | 'straight' | 'compact'
  interactive?: boolean
  sortCards?: boolean
  style?: React.CSSProperties
}

const HandContainer = styled(Box)<{
  layout: 'fan' | 'straight' | 'compact'
}>(({ theme, layout }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  position: 'relative',
  '& .hand-cards': {
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',
    alignItems: layout === 'fan' ? 'flex-end' : 'center',
    minHeight: layout === 'fan' ? 140 : 'auto',
    flexWrap: layout === 'compact' ? 'wrap' : 'nowrap',
    gap: layout === 'compact' ? theme.spacing(1) : 0,
  }
}))

const CardWrapper = styled(Box)<{
  layout: 'fan' | 'straight' | 'compact'
  index: number
  totalCards: number
  isHovered: boolean
}>(({ layout, index, totalCards, isHovered }) => {
  if (layout === 'compact') {
    return {
      position: 'relative',
      transition: 'transform 0.2s ease-in-out',
      transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      zIndex: isHovered ? 10 : 1,
    }
  }

  if (layout === 'straight') {
    return {
      position: 'relative',
      marginLeft: index > 0 ? '-20px' : '0',
      transition: 'transform 0.2s ease-in-out',
      transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      zIndex: isHovered ? 10 : index,
    }
  }

  // Fan layout calculations
  const maxAngle = Math.min(60, totalCards * 8) // Maximum spread angle
  const angleStep = totalCards > 1 ? maxAngle / (totalCards - 1) : 0
  const startAngle = -maxAngle / 2
  const angle = startAngle + angleStep * index
  
  const radius = 100 // Distance from center
  const baseX = Math.sin((angle * Math.PI) / 180) * radius
  const baseY = Math.cos((angle * Math.PI) / 180) * radius - radius
  
  const overlap = Math.max(20, 60 - totalCards * 3) // Adjust overlap based on card count
  const straightX = index * overlap - (totalCards - 1) * overlap / 2

  return {
    position: 'absolute',
    left: '50%',
    bottom: 0,
    transform: `translate(${isHovered ? straightX : baseX}px, ${isHovered ? -20 : baseY}px) rotate(${isHovered ? 0 : angle}deg)`,
    transformOrigin: 'center bottom',
    transition: 'transform 0.3s ease-in-out',
    zIndex: isHovered ? 10 : index,
    cursor: 'pointer',
  }
})

const sortCardsByValue = (cards: CardData[]): CardData[] => {
  const suitOrder = { clubs: 0, diamonds: 1, hearts: 2, spades: 3 }
  const rankOrder = { A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13 }
  
  return [...cards].sort((a, b) => {
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit]
    if (suitDiff !== 0) return suitDiff
    return rankOrder[a.rank] - rankOrder[b.rank]
  })
}

export const Hand: React.FC<HandProps> = ({
  cards,
  onCardClick,
  onCardDoubleClick,
  selectedCards = [],
  label = 'Hand',
  maxCards = 10,
  size = 'medium',
  layout = 'fan',
  interactive = true,
  sortCards = true,
  style
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  const displayCards = sortCards ? sortCardsByValue(cards) : cards
  const visibleCards = displayCards.slice(0, maxCards)

  const handleCardClick = (card: CardData, index: number) => {
    if (interactive && onCardClick) {
      onCardClick(card, index)
    }
  }

  const handleCardDoubleClick = (card: CardData, index: number) => {
    if (interactive && onCardDoubleClick) {
      onCardDoubleClick(card, index)
    }
  }

  const handleCardMouseEnter = (cardId: string) => {
    if (layout === 'fan') {
      setHoveredCard(cardId)
    }
  }

  const handleCardMouseLeave = () => {
    setHoveredCard(null)
  }

  return (
    <HandContainer layout={layout} style={style}>
      <Typography variant="h6" color="text.secondary">
        {label} ({cards.length})
      </Typography>
      
      <div className="hand-cards">
        {visibleCards.map((card, index) => (
          <CardWrapper
            key={card.id}
            layout={layout}
            index={index}
            totalCards={visibleCards.length}
            isHovered={hoveredCard === card.id}
            onMouseEnter={() => handleCardMouseEnter(card.id)}
            onMouseLeave={handleCardMouseLeave}
          >
            <Card
              card={card}
              size={size}
              selected={selectedCards.includes(card.id)}
              onClick={(clickedCard) => handleCardClick(clickedCard, index)}
              onDoubleClick={(clickedCard) => handleCardDoubleClick(clickedCard, index)}
              draggable={interactive}
            />
          </CardWrapper>
        ))}
      </div>
      
      {cards.length > maxCards && (
        <Typography variant="caption" color="text.secondary">
          +{cards.length - maxCards} more cards
        </Typography>
      )}
      
      {cards.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No cards in hand
        </Typography>
      )}
    </HandContainer>
  )
} 