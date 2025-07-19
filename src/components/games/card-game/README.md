# Card Game Components

This directory contains reusable components for building card games.

## DeckVisual Component

The `DeckVisual` component provides a visual representation of card decks that can be used across different card games. It displays a stack of cards with customizable appearance and behavior.

### Features

- **Multiple Sizes**: Small, medium, and large deck representations
- **Interactive**: Optional click handlers for deck interactions
- **Customizable Stacking**: Configurable number of visible cards and stack offset
- **Orientations**: Vertical or horizontal card stacking
- **Card Count Badge**: Optional display of total cards in deck
- **Empty State**: Graceful handling of empty decks
- **Responsive**: Adapts to different screen sizes

### Basic Usage

```tsx
import { DeckVisual } from './DeckVisual'

// Basic deck display
<DeckVisual
  cards={myCardArray}
  label="Player Deck"
  size="medium"
/>

// Interactive deck with click handler
<DeckVisual
  cards={drawPile}
  label="Draw Pile"
  size="large"
  onClick={handleDrawCard}
  showCount={true}
/>

// Horizontal stack for hands
<DeckVisual
  cards={playerHand}
  label="Hand"
  size="small"
  orientation="horizontal"
  showCount={false}
  maxVisibleCards={5}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cards` | `CardData[]` | required | Array of cards to display |
| `label` | `string` | `"Deck"` | Label text displayed below the deck |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the card representation |
| `maxVisibleCards` | `number` | `4` | Maximum number of cards to show in stack |
| `showCount` | `boolean` | `true` | Whether to show card count badge |
| `showLabel` | `boolean` | `true` | Whether to show the label text |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Stack orientation |
| `stackOffset` | `number` | `3` | Pixel offset between stacked cards |
| `onClick` | `() => void` | `undefined` | Click handler for deck interaction |
| `disabled` | `boolean` | `false` | Whether the deck is disabled |
| `style` | `React.CSSProperties` | `undefined` | Additional CSS styles |

### Game Examples

#### War Game
```tsx
// Player decks
<DeckVisual
  cards={playerDeck}
  label="Your Cards"
  size="medium"
  showCount={true}
  maxVisibleCards={5}
/>

// War pile
<DeckVisual
  cards={warPile}
  label="War Cards"
  size="small"
  maxVisibleCards={3}
  stackOffset={2}
/>
```

#### Poker
```tsx
// Player hand (horizontal)
<DeckVisual
  cards={playerHand}
  label="Hand"
  size="small"
  orientation="horizontal"
  showCount={false}
  stackOffset={2}
/>

// Community deck
<DeckVisual
  cards={communityDeck}
  label="Community"
  size="medium"
  onClick={handleCommunityDraw}
/>
```

#### Solitaire
```tsx
// Draw pile
<DeckVisual
  cards={drawPile}
  label="Draw"
  size="medium"
  onClick={handleDrawCard}
  maxVisibleCards={3}
/>

// Waste pile
<DeckVisual
  cards={wastePile}
  label="Waste"
  size="medium"
  maxVisibleCards={1}
  showCount={false}
/>
```

### Styling

The component uses Material-UI's styled system and can be customized using the `style` prop or by wrapping in a styled component:

```tsx
<DeckVisual
  cards={cards}
  style={{
    opacity: 0.8,
    transform: 'rotate(5deg)'
  }}
/>
```

### Integration with Existing Components

The `DeckVisual` component works seamlessly with other card game components:

- Uses the same `CardData` interface as the `Card` component
- Compatible with `createStandardDeck()` and other deck utilities
- Can be combined with `Hand`, `DiscardPile`, and other components

### Demo

See the `DeckVisualDemo` component for interactive examples of all features and use cases.