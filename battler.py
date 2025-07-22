import random

class Card:
    def __init__(self, value):
        self.value = value
    
    def __str__(self):
        return str(self.value)
    
    def __repr__(self):
        return f"Card({self.value})"

class Deck:
    def __init__(self):
        # Create a deck with cards numbered 1-13, with multiple copies for variety
        self.cards = []
        for _ in range(4):  # 4 copies of each card value
            for value in range(1, 14):
                self.cards.append(Card(value))
        self.shuffle()
    
    def shuffle(self):
        random.shuffle(self.cards)
    
    def draw_card(self):
        if self.cards:
            return self.cards.pop()
        return None
    
    def cards_remaining(self):
        return len(self.cards)

class Player:
    def __init__(self, name, is_human=True):
        self.name = name
        self.hand = []
        self.score = 0
        self.is_human = is_human
    
    def add_card_to_hand(self, card):
        self.hand.append(card)
    
    def play_card(self, card_index):
        if 0 <= card_index < len(self.hand):
            card = self.hand.pop(card_index)
            self.score += card.value
            return card
        return None
    
    def get_hand_str(self):
        return ", ".join([f"{i+1}: {card}" for i, card in enumerate(self.hand)])
    
    def choose_card_to_play(self):
        if self.is_human:
            return self.human_choose_card()
        else:
            return self.computer_choose_card()
    
    def human_choose_card(self):
        while True:
            try:
                print(f"\n{self.name}'s hand: {self.get_hand_str()}")
                choice = int(input("Choose a card to play (enter the number): ")) - 1
                if 0 <= choice < len(self.hand):
                    return choice
                else:
                    print("Invalid choice. Please choose a valid card number.")
            except ValueError:
                print("Please enter a valid number.")
    
    def computer_choose_card(self):
        # Simple AI: play the highest card if close to winning, otherwise play randomly
        if self.score >= 85:  # If close to winning, play highest card
            best_card_index = 0
            for i, card in enumerate(self.hand):
                if card.value > self.hand[best_card_index].value:
                    best_card_index = i
            return best_card_index
        else:
            # Play a random card
            return random.randint(0, len(self.hand) - 1)

class BattlerGame:
    def __init__(self):
        self.deck = Deck()
        self.human_player = Player("Player", is_human=True)
        self.computer_player = Player("Computer", is_human=False)
        self.current_turn = 0  # 0 for human, 1 for computer
        self.winner = None
        
    def setup_game(self):
        print("=" * 50)
        print("Welcome to BATTLER!")
        print("=" * 50)
        print("Rules:")
        print("- Each player starts with 10 cards")
        print("- Draw 1 card at the start of each turn")
        print("- Play 1 card each turn")
        print("- First player to reach 100 points wins!")
        print("=" * 50)
        
        # Deal initial hands
        for _ in range(10):
            self.human_player.add_card_to_hand(self.deck.draw_card())
            self.computer_player.add_card_to_hand(self.deck.draw_card())
    
    def display_game_state(self):
        print(f"\n{'='*30}")
        print(f"SCORES: {self.human_player.name}: {self.human_player.score} | "
              f"{self.computer_player.name}: {self.computer_player.score}")
        print(f"Cards remaining in deck: {self.deck.cards_remaining()}")
        print(f"{'='*30}")
    
    def player_turn(self, player):
        print(f"\n{player.name}'s turn!")
        
        # Draw a card if deck has cards
        if self.deck.cards_remaining() > 0:
            drawn_card = self.deck.draw_card()
            player.add_card_to_hand(drawn_card)
            if player.is_human:
                print(f"You drew: {drawn_card}")
            else:
                print(f"{player.name} drew a card")
        
        # Choose and play a card
        card_index = player.choose_card_to_play()
        played_card = player.play_card(card_index)
        
        if played_card:
            print(f"{player.name} played: {played_card} (worth {played_card.value} points)")
            print(f"{player.name}'s new score: {player.score}")
            
            # Check for winner
            if player.score >= 100:
                self.winner = player
                return True
        
        return False
    
    def play_game(self):
        self.setup_game()
        
        while not self.winner and (self.human_player.hand or self.computer_player.hand):
            self.display_game_state()
            
            # Determine whose turn it is
            current_player = self.human_player if self.current_turn == 0 else self.computer_player
            
            # Play the turn
            game_over = self.player_turn(current_player)
            if game_over:
                break
            
            # Switch turns
            self.current_turn = 1 - self.current_turn
            
            # Add a small pause for computer turns
            if not current_player.is_human:
                input("Press Enter to continue...")
        
        # Game over
        print(f"\n{'='*50}")
        if self.winner:
            if self.winner.is_human:
                print("🎉 CONGRATULATIONS! YOU WON! 🎉")
            else:
                print("💻 Computer wins! Better luck next time!")
            print(f"Final Score - {self.human_player.name}: {self.human_player.score}, "
                  f"{self.computer_player.name}: {self.computer_player.score}")
        else:
            print("Game ended - no more cards!")
        print(f"{'='*50}")

def main():
    game = BattlerGame()
    game.play_game()
    
    # Ask if player wants to play again
    while True:
        play_again = input("\nWould you like to play again? (y/n): ").lower()
        if play_again in ['y', 'yes']:
            game = BattlerGame()
            game.play_game()
        elif play_again in ['n', 'no']:
            print("Thanks for playing Battler!")
            break
        else:
            print("Please enter 'y' or 'n'")

if __name__ == "__main__":
    main()