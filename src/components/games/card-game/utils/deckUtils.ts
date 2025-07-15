import { CardData } from '../Card'

// Create a standard 52-card deck
export const createStandardDeck = (faceUp: boolean = false): CardData[] => {
  const suits: CardData['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks: CardData['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  
  const deck: CardData[] = []
  
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black',
        faceUp
      })
    })
  })
  
  return deck
}

// Shuffle an array of cards using Fisher-Yates algorithm
export const shuffleCards = <T>(cards: T[]): T[] => {
  const shuffled = [...cards]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Deal cards from the top of a deck
export const dealCards = (deck: CardData[], count: number): { dealtCards: CardData[]; remainingDeck: CardData[] } => {
  const dealtCards = deck.slice(0, count)
  const remainingDeck = deck.slice(count)
  return { dealtCards, remainingDeck }
}

// Draw a single card from the top of a deck
export const drawCard = (deck: CardData[]): { card: CardData | null; remainingDeck: CardData[] } => {
  if (deck.length === 0) {
    return { card: null, remainingDeck: [] }
  }
  
  const card = deck[0]
  const remainingDeck = deck.slice(1)
  return { card, remainingDeck }
}

// Add a card to the top of a deck
export const addCardToTop = (deck: CardData[], card: CardData): CardData[] => {
  return [card, ...deck]
}

// Add a card to the bottom of a deck
export const addCardToBottom = (deck: CardData[], card: CardData): CardData[] => {
  return [...deck, card]
}

// Get the numeric value of a card rank (for games like Blackjack)
export const getCardValue = (rank: CardData['rank'], aceValue: number = 11): number => {
  switch (rank) {
    case 'A':
      return aceValue
    case 'J':
    case 'Q':
    case 'K':
      return 10
    default:
      return parseInt(rank)
  }
}

// Check if a card is a face card
export const isFaceCard = (card: CardData): boolean => {
  return ['J', 'Q', 'K'].includes(card.rank)
}

// Check if a card is an ace
export const isAce = (card: CardData): boolean => {
  return card.rank === 'A'
}

// Get all cards of a specific suit from a deck
export const getCardsBySuit = (deck: CardData[], suit: CardData['suit']): CardData[] => {
  return deck.filter(card => card.suit === suit)
}

// Get all cards of a specific rank from a deck
export const getCardsByRank = (deck: CardData[], rank: CardData['rank']): CardData[] => {
  return deck.filter(card => card.rank === rank)
}

// Create a deck with specific cards
export const createCustomDeck = (cards: Array<{suit: CardData['suit'], rank: CardData['rank']}>, faceUp: boolean = false): CardData[] => {
  return cards.map(({suit, rank}) => ({
    id: `${suit}-${rank}`,
    suit,
    rank,
    color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black',
    faceUp
  }))
}

// Flip all cards in a deck
export const flipCards = (cards: CardData[], faceUp?: boolean): CardData[] => {
  return cards.map(card => ({
    ...card,
    faceUp: faceUp !== undefined ? faceUp : !card.faceUp
  }))
}

// Sort cards by suit and rank
export const sortCards = (cards: CardData[]): CardData[] => {
  const suitOrder = { clubs: 0, diamonds: 1, hearts: 2, spades: 3 }
  const rankOrder = { A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13 }
  
  return [...cards].sort((a, b) => {
    const suitDiff = suitOrder[a.suit] - suitOrder[b.suit]
    if (suitDiff !== 0) return suitDiff
    return rankOrder[a.rank] - rankOrder[b.rank]
  })
} 