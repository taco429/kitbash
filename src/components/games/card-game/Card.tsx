import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { styled } from '@mui/material/styles'

export interface CardData {
  id: string
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
  color: 'red' | 'black'
  faceUp: boolean
}

interface CardProps {
  card: CardData
  onClick?: (card: CardData) => void
  onDoubleClick?: (card: CardData) => void
  draggable?: boolean
  selected?: boolean
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  style?: React.CSSProperties
  className?: string
}

const CardContainer = styled(Paper)<{
  size: 'small' | 'medium' | 'large'
  selected: boolean
  disabled: boolean
  clickable: boolean
}>(({ theme, size, selected, disabled, clickable }) => {
  const sizeConfig = {
    small: { width: 50, height: 70, fontSize: '0.7rem' },
    medium: { width: 70, height: 98, fontSize: '0.9rem' },
    large: { width: 90, height: 126, fontSize: '1.1rem' }
  }

  const config = sizeConfig[size]

  return {
    width: config.width,
    height: config.height,
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0.5),
    backgroundColor: 'white',
    border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid #ddd',
    cursor: clickable ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    boxShadow: selected 
      ? `0 4px 12px ${theme.palette.primary.main}40`
      : '0 2px 8px rgba(0,0,0,0.1)',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
    position: 'relative',
    '&:hover': clickable && !disabled ? {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
    } : {},
    '&:active': clickable && !disabled ? {
      transform: 'translateY(0)',
    } : {},
    fontSize: config.fontSize,
  }
})

const CardBack = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1.2em',
  fontWeight: 'bold',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: 4,
  }
}))

const SuitSymbol = styled(Typography)<{ color: 'red' | 'black' }>(({ color }) => ({
  color: color === 'red' ? '#d32f2f' : '#333',
  fontWeight: 'bold',
  fontSize: '1.2em',
  lineHeight: 1,
}))

const RankText = styled(Typography)<{ color: 'red' | 'black' }>(({ color }) => ({
  color: color === 'red' ? '#d32f2f' : '#333',
  fontWeight: 'bold',
  fontSize: '0.9em',
  lineHeight: 1,
}))

const getSuitSymbol = (suit: CardData['suit']): string => {
  switch (suit) {
    case 'hearts': return '♥'
    case 'diamonds': return '♦'
    case 'clubs': return '♣'
    case 'spades': return '♠'
    default: return ''
  }
}

export const Card: React.FC<CardProps> = ({
  card,
  onClick,
  onDoubleClick,
  draggable = false,
  selected = false,
  disabled = false,
  size = 'medium',
  style,
  className
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled && onClick) {
      onClick(card)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled && onDoubleClick) {
      onDoubleClick(card)
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(card))
  }

  return (
    <CardContainer
      size={size}
      selected={selected}
      disabled={disabled}
      clickable={!!onClick || !!onDoubleClick}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      style={style}
      className={className}
      elevation={selected ? 4 : 1}
    >
      {card.faceUp ? (
        <>
          <Box sx={{ alignSelf: 'flex-start' }}>
            <RankText color={card.color}>{card.rank}</RankText>
          </Box>
          <SuitSymbol color={card.color}>
            {getSuitSymbol(card.suit)}
          </SuitSymbol>
          <Box sx={{ alignSelf: 'flex-end', transform: 'rotate(180deg)' }}>
            <RankText color={card.color}>{card.rank}</RankText>
          </Box>
        </>
      ) : (
        <CardBack>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            CARD
          </Typography>
        </CardBack>
      )}
    </CardContainer>
  )
} 