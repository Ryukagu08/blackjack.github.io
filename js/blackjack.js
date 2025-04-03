/**
 * Blackjack.js - Optimized Blackjack game implementation
 */

// Popup animation state
let activePopup = null;
let popupTimeout = null;

// Blackjack game state
const blackjack = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    playerScore: 0,
    dealerScore: 0,
    currentBet: 0,
    balance: 1000,
    isGameActive: false,
    isPlayerTurn: false,
    isRoundOver: false,
    canDouble: false,
    
    // Game constants
    SUITS: ['♥', '♦', '♣', '♠'],
    VALUES: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
    CARD_VALUES: {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'J': 10, 'Q': 10, 'K': 10, 'A': 11
    },
    
    /**
     * Initialize a new shuffled deck of cards
     */
    createDeck() {
        this.deck = [];
        // Create a standard 52-card deck
        for (const suit of this.SUITS) {
            for (const value of this.VALUES) {
                this.deck.push({ suit, value });
            }
        }
        // Shuffle the deck
        this.shuffleDeck();
    },
    
    /**
     * Shuffle the deck using Fisher-Yates algorithm
     */
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    },
    
    /**
     * Deal a card from the deck
     * @returns {Object} Card object with suit and value
     */
    dealCard() {
        // Reshuffle if deck is running low
        if (this.deck.length < 10) {
            this.createDeck();
        }
        return this.deck.pop();
    },
    
    /**
     * Calculate the score of a hand
     * @param {Array} hand - Array of card objects
     * @returns {number} Hand score
     */
    calculateScore(hand) {
        let score = 0;
        let aces = 0;
        
        // First pass: calculate non-ace cards
        for (const card of hand) {
            if (card.value === 'A') {
                aces++;
            } else {
                score += this.CARD_VALUES[card.value];
            }
        }
        
        // Second pass: calculate aces optimally
        for (let i = 0; i < aces; i++) {
            score += (score + 11 <= 21) ? 11 : 1;
        }
        
        return score;
    },
    
    /**
     * Check if a hand has blackjack (21 with 2 cards)
     * @param {Array} hand - Hand to check
     * @returns {boolean} True if hand has blackjack
     */
    hasBlackjack(hand) {
        return hand.length === 2 && this.calculateScore(hand) === 21;
    },
    
    /**
     * Start a new game round
     */
    startRound() {
        if (this.currentBet <= 0) {
            blackjackTerminal.print("You must place a bet first.", "error");
            return;
        }
        
        if (this.isGameActive) {
            blackjackTerminal.print("Game already in progress.", "error");
            return;
        }
        
        // Reset game state
        this.playerHand = [];
        this.dealerHand = [];
        this.isGameActive = true;
        this.isPlayerTurn = true;
        this.isRoundOver = false;
        
        // Ensure we have a fresh deck
        if (this.deck.length < 10) {
            this.createDeck();
        }
        
        // Deal initial cards
        this.playerHand.push(this.dealCard());
        this.dealerHand.push(this.dealCard());
        this.playerHand.push(this.dealCard());
        this.dealerHand.push(this.dealCard());
        
        // Calculate initial scores
        this.playerScore = this.calculateScore(this.playerHand);
        this.dealerScore = this.calculateScore(this.dealerHand);
        
        // Check if player can double down
        this.canDouble = this.balance >= this.currentBet;
        
        // Hide the deal button during gameplay
        document.getElementById('deal-btn').style.display = 'none';
        
        // Update UI
        this.updateUI();
        
        // Check for blackjack
        this.checkForBlackjack();
    },
    
    /**
     * Check for blackjack after initial deal
     */
    checkForBlackjack() {
        const playerHasBlackjack = this.hasBlackjack(this.playerHand);
        const dealerHasBlackjack = this.hasBlackjack(this.dealerHand);
        
        if (playerHasBlackjack && dealerHasBlackjack) {
            // Both have blackjack - push
            blackjackTerminal.print("Both you and the dealer have Blackjack! It's a push.", "info");
            this.endRound("push");
        } else if (playerHasBlackjack) {
            // Player has blackjack
            blackjackTerminal.print("Blackjack! You win 3:2 on your bet!", "success");
            const winAmount = this.currentBet * 1.5; // Blackjack pays 3:2
            const totalReturn = this.currentBet + winAmount; // Original bet + winnings
            this.balance += totalReturn;
            this.updateBalanceDisplay(true, totalReturn); // Show the total amount added
            this.endRound("player");
        } else if (dealerHasBlackjack) {
            // Dealer has blackjack
            blackjackTerminal.print("Dealer has Blackjack! You lose your bet.", "error");
            // Bet already subtracted when placed
            this.updateBalanceDisplay(true, 0); // No change, but show zero
            this.endRound("dealer");
        } else {
            // No blackjack, continue the game
            blackjackTerminal.print("Your move: hit, stand" + (this.canDouble ? ", double" : ""), "info");
            document.getElementById('action-buttons').classList.remove('hidden');
        }
    },
    
    /**
     * Player takes another card (hit)
     */
    hit() {
        if (!this.isGameActive || !this.isPlayerTurn) {
            blackjackTerminal.print("You can't hit now.", "error");
            return;
        }
        
        // Deal a card to the player
        this.playerHand.push(this.dealCard());
        this.playerScore = this.calculateScore(this.playerHand);
        
        // Update UI
        this.updateUI();
        
        // Check if player busts
        if (this.playerScore > 21) {
            blackjackTerminal.print("Bust! Your score: " + this.playerScore, "error");
            // Bet already subtracted when placed
            this.updateBalanceDisplay(true, 0); // Show zero, already lost
            this.endRound("dealer");
        } else if (this.playerScore === 21) {
            blackjackTerminal.print("You have 21! Standing automatically.", "success");
            this.stand();
        }
        
        // Can't double after hitting
        this.canDouble = false;
        document.getElementById('double-btn').disabled = true;
    },
    
    /**
     * Player stands (ends their turn)
     */
    stand() {
        if (!this.isGameActive || !this.isPlayerTurn) {
            blackjackTerminal.print("You can't stand now.", "error");
            return;
        }
        
        this.isPlayerTurn = false;
        blackjackTerminal.print("You stand with " + this.playerScore + ".", "info");
        
        // Hide action buttons
        document.getElementById('action-buttons').classList.add('hidden');
        
        // Dealer's turn
        this.dealerPlay();
    },
    
    /**
     * Player doubles down
     */
    doubleDown() {
        if (!this.isGameActive || !this.isPlayerTurn || !this.canDouble) {
            blackjackTerminal.print("You can't double down now.", "error");
            return;
        }
        
        // Subtract additional bet from balance
        this.balance -= this.currentBet;
        const originalBet = this.currentBet; // Store original bet
        
        // Double the bet
        this.currentBet *= 2;
        
        // Update balance display with animation
        this.updateBalanceDisplay(true, -originalBet);
        
        blackjackTerminal.print("Doubling down! Bet increased to $" + this.currentBet, "info");
        
        // Deal one more card and stand
        this.playerHand.push(this.dealCard());
        this.playerScore = this.calculateScore(this.playerHand);
        
        // Update UI
        this.updateUI();
        
        // Check if player busts
        if (this.playerScore > 21) {
            blackjackTerminal.print("Bust! Your score: " + this.playerScore, "error");
            // Bet already subtracted
            this.updateBalanceDisplay(true, 0); // Show zero, already lost
            this.endRound("dealer");
        } else {
            blackjackTerminal.print("You stand with " + this.playerScore + " after doubling down.", "info");
            this.isPlayerTurn = false;
            
            // Hide action buttons
            document.getElementById('action-buttons').classList.add('hidden');
            
            // Dealer's turn
            this.dealerPlay();
        }
    },
    
    /**
     * Dealer plays their turn
     */
    dealerPlay() {
        // Delay dealer actions for dramatic effect
        let delay = 1000;
        
        const dealerTurn = () => {
            // Reveal dealer's hidden card
            this.updateUI(true);
            
            // Dealer draws until reaching 17 or higher
            if (this.dealerScore < 17) {
                setTimeout(() => {
                    blackjackTerminal.print("Dealer draws a card.", "info");
                    this.dealerHand.push(this.dealCard());
                    this.dealerScore = this.calculateScore(this.dealerHand);
                    this.updateUI(true);
                    
                    // Continue dealer's turn
                    dealerTurn();
                }, delay);
            } else {
                // Dealer is done drawing
                this.resolveRound();
            }
        };
        
        // Start dealer's turn
        setTimeout(dealerTurn, delay);
    },
    
    /**
     * Resolve the round after dealer's turn
     */
    resolveRound() {
        // Determine the outcome
        if (this.dealerScore > 21) {
            // Dealer busts
            blackjackTerminal.print("Dealer busts with " + this.dealerScore + "! You win!", "success");
            const winAmount = this.currentBet; // This is just the profit amount
            const totalReturn = this.currentBet * 2; // This is the total added to balance
            this.balance += totalReturn; // Return bet + winnings
            this.updateBalanceDisplay(true, totalReturn); // Show the total amount added
            this.endRound("player");
        } else if (this.dealerScore > this.playerScore) {
            // Dealer wins
            blackjackTerminal.print("Dealer wins with " + this.dealerScore + " vs your " + this.playerScore + ".", "error");
            // Bet already subtracted when placed
            this.updateBalanceDisplay(true, 0); // Show zero, already lost
            this.endRound("dealer");
        } else if (this.dealerScore < this.playerScore) {
            // Player wins
            blackjackTerminal.print("You win with " + this.playerScore + " vs dealer's " + this.dealerScore + "!", "success");
            const winAmount = this.currentBet; // This is just the profit amount
            const totalReturn = this.currentBet * 2; // This is the total added to balance
            this.balance += totalReturn; // Return bet + winnings
            this.updateBalanceDisplay(true, totalReturn); // Show the total amount added
            this.endRound("player");
        } else {
            // Push (tie)
            blackjackTerminal.print("Push! Both you and the dealer have " + this.playerScore + ".", "info");
            this.endRound("push");
        }
    },
    
    /**
     * End the current round
     * @param {string} winner - Who won the round ('player', 'dealer', or 'push')
     */
    endRound(winner) {
        this.isGameActive = false;
        this.isRoundOver = true;
        
        // Always show dealer's cards at end of round
        this.updateUI(true);
        
        // Handle push - return the bet
        if (winner === 'push') {
            this.balance += this.currentBet;
            this.updateBalanceDisplay(true, this.currentBet);
        }
        
        // Reset bet for next round
        document.getElementById('bet-amount').textContent = '0';
        this.currentBet = 0;
        
        // Reset and show deal button
        document.getElementById('deal-btn').disabled = true;
        document.getElementById('deal-btn').style.display = 'block';
        
        // Show bet controls, hide action buttons
        document.getElementById('bet-controls').classList.remove('hidden');
        document.getElementById('action-buttons').classList.add('hidden');
        
        // Check if player is broke
        if (this.balance <= 0) {
            blackjackTerminal.print("You're out of money! Game over.", "error");
            blackjackTerminal.print("Refresh the page to start a new game.", "info");
        } else {
            blackjackTerminal.print("Your balance: $" + this.balance, "info");
            blackjackTerminal.print("Place your bet for the next round.", "info");
        }
    },
    
    /**
     * Place a bet
     * @param {number} amount - Bet amount
     */
    placeBet(amount) {
        if (this.isGameActive) {
            blackjackTerminal.print("You can't place a bet during a round.", "error");
            return;
        }
        
        if (amount <= 0) {
            blackjackTerminal.print("Bet amount must be positive.", "error");
            return;
        }
        
        if (amount > this.balance) {
            blackjackTerminal.print("You don't have enough money for that bet.", "error");
            return;
        }
        
        // Subtract amount from balance immediately
        this.balance -= amount;
        
        // Add to current bet
        this.currentBet += amount;
        
        // Update displays with animation
        this.updateBalanceDisplay(true, -amount);
        document.getElementById('bet-amount').textContent = this.currentBet;
        
        // Enable the deal button once a bet is placed
        document.getElementById('deal-btn').disabled = false;
        
        blackjackTerminal.print("Bet placed: $" + amount + ". Total bet: $" + this.currentBet, "info");
    },
    
    /**
     * Clear the current bet
     */
    clearBet() {
        if (this.isGameActive) {
            blackjackTerminal.print("You can't clear your bet during a round.", "error");
            return;
        }
        
        // Return bet to balance
        this.balance += this.currentBet;
        this.updateBalanceDisplay(true, this.currentBet);
        
        // Reset bet and button state
        this.currentBet = 0;
        document.getElementById('bet-amount').textContent = '0';
        document.getElementById('deal-btn').disabled = true;
        
        blackjackTerminal.print("Bet cleared.", "info");
    },
    
    /**
     * Update the balance display with accumulative popup animation
     * @param {boolean} animate - Whether to animate the balance change
     * @param {number} amountChanged - Amount by which the balance changed (can be negative)
     */
    updateBalanceDisplay(animate = false, amountChanged = 0) {
        const balanceElement = document.getElementById('player-balance');
        balanceElement.textContent = this.balance;
        
        if (animate && amountChanged !== 0) {
            const isPositive = amountChanged > 0;
            const balanceContainer = document.querySelector('.balance');
            
            // If there's an active popup of the same type (positive/negative)
            if (activePopup && 
                ((isPositive && activePopup.classList.contains('positive')) || 
                (!isPositive && activePopup.classList.contains('negative')))) {
                
                // Get the current value and calculate the new accumulated value
                const currentValue = parseInt(activePopup.textContent.replace(/[^0-9-]/g, ''));
                const newValue = currentValue + amountChanged;
                
                // Remove the existing popup
                activePopup.remove();
                clearTimeout(popupTimeout);
                
                // Create a new popup with the accumulated value
                const popup = document.createElement('div');
                popup.textContent = isPositive ? `+${newValue}` : `-${Math.abs(newValue)}`;
                popup.className = `balance-popup ${isPositive ? 'positive' : 'negative'}`;
                
                // Add to the balance container
                balanceContainer.appendChild(popup);
                
                // Set as active popup
                activePopup = popup;
                
                // Remove popup after animation completes
                popupTimeout = setTimeout(() => {
                    popup.remove();
                    activePopup = null;
                }, 1500);
                
            } else {
                // Remove any existing popup of different type
                if (activePopup) {
                    activePopup.remove();
                    clearTimeout(popupTimeout);
                }
                
                // Create new popup element
                const popup = document.createElement('div');
                
                // Set text with appropriate sign
                popup.textContent = isPositive ? `+$${amountChanged}` : `-$${Math.abs(amountChanged)}`;
                
                // Add appropriate classes
                popup.className = `balance-popup ${isPositive ? 'positive' : 'negative'}`;
                
                // Position the popup near the balance display
                balanceContainer.style.position = 'relative';
                balanceContainer.appendChild(popup);
                
                // Set as active popup
                activePopup = popup;
                
                // Remove popup after animation completes
                popupTimeout = setTimeout(() => {
                    popup.remove();
                    activePopup = null;
                }, 1500);
            }
        }
    },
    
    /**
     * Update the game UI
     * @param {boolean} showDealerHand - Whether to show dealer's hidden card
     */
    updateUI(showDealerHand = false) {
        const playerCardsContainer = document.getElementById('player-cards');
        const dealerCardsContainer = document.getElementById('dealer-cards');
        
        // Clear existing cards with a more efficient method
        playerCardsContainer.innerHTML = '';
        dealerCardsContainer.innerHTML = '';
        
        // Create a document fragment for better performance when adding multiple elements
        const playerFragment = document.createDocumentFragment();
        const dealerFragment = document.createDocumentFragment();
        
        // Add player cards to fragment
        this.playerHand.forEach(card => {
            playerFragment.appendChild(this.createCardElement(card));
        });
        
        // Add dealer cards to fragment
        this.dealerHand.forEach((card, index) => {
            // Hide dealer's second card if not showing dealer hand
            const hideCard = !showDealerHand && index === 1 && this.dealerHand.length > 1;
            dealerFragment.appendChild(this.createCardElement(card, hideCard));
        });
        
        // Append fragments to containers (single DOM operation)
        playerCardsContainer.appendChild(playerFragment);
        dealerCardsContainer.appendChild(dealerFragment);
        
        // Update scores
        document.getElementById('player-score').textContent = this.playerScore;
        
        // Only show dealer's true score if showing dealer's hand
        if (showDealerHand) {
            document.getElementById('dealer-score').textContent = this.dealerScore;
        } else if (this.dealerHand.length > 0) {
            // Show score based on visible cards only
            const visibleCard = this.dealerHand[0];
            const visibleValue = this.CARD_VALUES[visibleCard.value];
            document.getElementById('dealer-score').textContent = visibleValue === 11 ? 'A' : visibleValue;
        } else {
            document.getElementById('dealer-score').textContent = '0';
        }
        
        // Update double button state
        document.getElementById('double-btn').disabled = !this.canDouble;
    },
    
    /**
     * Create a card element
     * @param {Object} card - Card to create element for
     * @param {boolean} hidden - Whether the card is hidden (face down)
     * @returns {HTMLElement} Card element
     */
    createCardElement(card, hidden = false) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card' + (hidden ? ' hidden' : '');
        
        if (hidden) {
            return cardElement;
        }
        
        // Card is red if it's hearts or diamonds
        const isRed = card.suit === '♥' || card.suit === '♦';
        const colorClass = isRed ? 'red' : 'black';
        
        // Use template strings for cleaner HTML construction
        cardElement.innerHTML = `
            <div class="card-top-left ${colorClass}">
                <span class="card-value">${card.value}</span>
                <span class="card-suit">${card.suit}</span>
            </div>
            <div class="card-center ${colorClass}">${card.suit}</div>
            <div class="card-bottom-right ${colorClass}">
                <span class="card-value">${card.value}</span>
                <span class="card-suit">${card.suit}</span>
            </div>
        `;
        
        return cardElement;
    }
};

let blackjackTerminal;
let blackjackInitialized = false;

/**
 * Initialize the blackjack game
 */
function initBlackjack() {
    // Prevent multiple initializations
    if (blackjackInitialized) {
        return;
    }
    
    blackjackInitialized = true;
    
    // Initialize the terminal if not already done
    if (!blackjackTerminal) {
        blackjackTerminal = terminalSystem.init('blackjack', 'blackjack-input', 'blackjack-output');
        
        // Register blackjack commands
        blackjackTerminal.registerCommands({
            'help': () => {
                blackjackTerminal.print('Available commands:', 'info');
                blackjackTerminal.print('  bet [amount] - Place a bet', 'info');
                blackjackTerminal.print('  deal - Start a new round after placing a bet', 'info');
                blackjackTerminal.print('  hit - Take another card', 'info');
                blackjackTerminal.print('  stand - End your turn', 'info');
                blackjackTerminal.print('  double - Double your bet and take one more card', 'info');
                blackjackTerminal.print('  clear - Clear your current bet', 'info');
                blackjackTerminal.print('  rules - Show the rules of Blackjack', 'info');
                blackjackTerminal.print('  balance - Show your current balance', 'info');
                blackjackTerminal.print('  exit - Return to the main menu', 'info');
            },
            
            'bet': (args) => {
                if (args.length === 0) {
                    blackjackTerminal.print('Please specify a bet amount. Example: bet 25', 'error');
                    return;
                }
                
                const amount = parseInt(args[0]);
                if (isNaN(amount)) {
                    blackjackTerminal.print('Please enter a valid number for your bet.', 'error');
                    return;
                }
                
                blackjack.placeBet(amount);
            },
            
            'deal': () => {
                if (blackjack.currentBet <= 0) {
                    blackjackTerminal.print('You need to place a bet first. Use the "bet" command.', 'error');
                    return;
                }
                
                if (blackjack.isGameActive) {
                    blackjackTerminal.print('A game is already in progress. Finish the current round first.', 'error');
                    return;
                }
                
                blackjack.startRound();
            },
            
            'hit': () => {
                blackjack.hit();
            },
            
            'stand': () => {
                blackjack.stand();
            },
            
            'double': () => {
                blackjack.doubleDown();
            },
            
            'clear': () => {
                blackjack.clearBet();
            },
            
            'rules': () => {
                blackjackTerminal.print('BLACKJACK RULES:', 'info');
                blackjackTerminal.print('- The goal is to get a hand value closer to 21 than the dealer without going over.', 'info');
                blackjackTerminal.print('- Number cards (2-10) are worth their face value.', 'info');
                blackjackTerminal.print('- Face cards (J, Q, K) are worth 10 points.', 'info');
                blackjackTerminal.print('- Aces are worth 11 points unless that would cause you to bust, then they\'re worth 1.', 'info');
                blackjackTerminal.print('- Blackjack (an Ace and a 10-value card) pays 3:2.', 'info');
                blackjackTerminal.print('- The dealer must hit until they have at least 17.', 'info');
                blackjackTerminal.print('- You can double down (double your bet and get exactly one more card).', 'info');
            },
            
            'balance': () => {
                blackjackTerminal.print(`Your current balance: $${blackjack.balance}`, 'info');
            },
            
            'exit': () => {
                document.getElementById('blackjack-screen').classList.remove('active');
                document.getElementById('welcome-screen').classList.add('active');
                blackjackInitialized = false; // Reset flag when exiting
            }
        });
    }
    
    // Initialize game state
    blackjack.createDeck();
    blackjack.balance = 1000;
    document.getElementById('player-balance').textContent = blackjack.balance;
    
    // Clear any existing terminal output to avoid duplicate welcome messages
    blackjackTerminal.clear();
    blackjackTerminal.print('Welcome to Blackjack!', 'info');
    blackjackTerminal.print('Place your bet to begin.', 'info');
    blackjackTerminal.print('Type "help" for a list of commands.', 'info');
    
    // Initialize the deal button (disabled until a bet is placed)
    document.getElementById('deal-btn').disabled = true;
    
    // Set up UI event listeners - use efficient event delegation where possible
    setupBlackjackUI();
    
    // Focus the terminal input
    setTimeout(() => {
        blackjackTerminal.focus();
    }, 100);
    
    // Add the CSS for the popup reset animation if it doesn't already exist
    if (!document.querySelector('#popup-animation-style')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'popup-animation-style';
        styleElement.textContent = `
            @keyframes popup-animation {
                0% {
                    opacity: 0;
                    transform: translateY(0);
                }
                20% {
                    opacity: 1;
                    transform: translateY(-10px);
                }
                80% {
                    opacity: 1;
                    transform: translateY(-20px);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-30px);
                }
            }
            
            .balance-popup {
                position: absolute;
                font-weight: bold;
                font-size: 1rem;
                opacity: 0;
                z-index: 10;
                padding: 5px 10px;
                border-radius: 5px;
                animation: popup-animation 1.5s ease-out forwards;
                white-space: nowrap;
                pointer-events: none;
                top: 10px;
                left: 55%;
                transform: translateX(-50%);
            }
            
            .balance-popup.positive {
                color: #23d160;
            }
            
            .balance-popup.negative {
                color: #ff3860;
            }
        `;
        document.head.appendChild(styleElement);
    }
}

/**
 * Set up blackjack UI event listeners using more efficient event delegation
 */
function setupBlackjackUI() {
    // Use proper event listener management instead of cloning and replacing elements
    const gameControls = document.querySelector('.game-controls');
    
    // Remove existing listeners by using a single handler at the container level
    const controlsClone = gameControls.cloneNode(true);
    gameControls.parentNode.replaceChild(controlsClone, gameControls);
    
    // Set up event delegation on the game controls
    controlsClone.addEventListener('click', (e) => {
        // Handle chip clicks for betting
        if (e.target.classList.contains('chip')) {
            const value = parseInt(e.target.getAttribute('data-value'));
            if (!isNaN(value)) {
                blackjack.placeBet(value);
            }
            return;
        }
        
        // Handle button clicks
        if (e.target.id === 'deal-btn') {
            blackjack.startRound();
        } else if (e.target.id === 'hit-btn') {
            blackjack.hit();
        } else if (e.target.id === 'stand-btn') {
            blackjack.stand();
        } else if (e.target.id === 'double-btn') {
            blackjack.doubleDown();
        }
    });
    
    // Back button
    const backBtn = document.querySelector('.back-btn');
    // Clone to remove old listeners
    const newBackBtn = backBtn.cloneNode(true);
    backBtn.parentNode.replaceChild(newBackBtn, backBtn);
    
    newBackBtn.addEventListener('click', () => {
        document.getElementById('blackjack-screen').classList.remove('active');
        document.getElementById('welcome-screen').classList.add('active');
        blackjackInitialized = false; // Allow re-initialization when returning
    });
}