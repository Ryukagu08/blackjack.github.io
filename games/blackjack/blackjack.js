/**
 * Blackjack Game Module - Core Game Logic
 */

// Create blackjack game namespace
const blackjackGame = window.blackjackGame = {};

// Game constants
blackjackGame.SUITS = ['♥', '♦', '♣', '♠'];
blackjackGame.VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
blackjackGame.CARD_VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 10, 'Q': 10, 'K': 10, 'A': 11
};

// Game state
blackjackGame.state = {
    deck: [],
    playerHand: [],
    playerHands: [],
    activeHandIndex: 0,
    dealerHand: [],
    playerScore: 0,
    dealerScore: 0,
    money: 100,
    currentBet: 0,
    insuranceBet: 0,
    gameInProgress: false,
    playerTurn: true,
    canSplit: false,
    canDouble: false,
    canInsurance: false,
    canSurrender: false,
    handSplit: false,
    language: 'en',
    colorTheme: 'green',
    backgroundTheme: 'black',
    firstGame: true,
    waitingForUsername: false,
    highScore: 0,
    maxMoney: 100,
    leaderboardPosition: 0,
    initialized: false,
    containerElement: null
};

// Include translations from separate module
blackjackGame.translations = {};

/**
 * Initialize the game with better state restoration
 * @param {HTMLElement} container - The container element for the game
 * @param {Function} exitCallback - Callback to exit the game
 */
blackjackGame.init = function(container, exitCallback) {
    // Store references
    const state = blackjackGame.state;
    state.containerElement = container;
    state.exitCallback = exitCallback;
    
<<<<<<< HEAD
    // IMPORTANT: Always reset money to default on game initialization
    state.money = 100;
    state.maxMoney = 100;
    
=======
>>>>>>> 5b04e5d (Site Refactor)
    // Create game UI
    blackjackUI.createGameUI(container);
    
    // Set up command handling
    blackjackCommands.setupCommandHandling();
    
    // Initialize leaderboard
    blackjackLeaderboard.init();
    
    // Load saved state if exists
    const savedState = localStorage.getItem('blackjackGameState');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
<<<<<<< HEAD
            // Only restore settings, NOT money or game progress
            state.language = parsed.language || 'en';
            state.colorTheme = parsed.colorTheme || 'green';
            state.backgroundTheme = parsed.backgroundTheme || 'black';
=======
            // Restore settings and money
            state.money = parsed.money || 100;
            state.language = parsed.language || 'en';
            state.colorTheme = parsed.colorTheme || 'green';
            state.backgroundTheme = parsed.backgroundTheme || 'black';
            state.maxMoney = parsed.maxMoney || 100;
>>>>>>> 5b04e5d (Site Refactor)
            
            // Don't restore full game state, but note if we had a game in progress
            if (parsed.hadGameInProgress) {
                state.firstGame = false;
            }
        } catch (e) {
            console.error('Error loading saved game state:', e);
        }
    }
    
    // Apply color theme and background
    blackjackUI.applyColorTheme(state.colorTheme);
    blackjackUI.applyBackgroundTheme(state.backgroundTheme);
    
    // Show welcome message
    blackjackUI.displayWelcomeMessage();
    
    // If we had a game in progress before refresh, show a message
    if (state.firstGame === false && !state.gameInProgress) {
        blackjackUI.output('Previous game was interrupted. Start a new game when ready.');
    }
    
    // Mark as initialized
    state.initialized = true;
    
    return blackjackGame;
};

/**
 * Update the game's color theme
 * @param {string} theme - The color theme
 */
blackjackGame.updateTheme = function(theme) {
    blackjackGame.state.colorTheme = theme;
    blackjackUI.applyColorTheme(theme);
};

/**
 * Resume the game when returning to it after refresh
 */
blackjackGame.resume = function() {
    if (!blackjackGame.state.initialized) {
        blackjackGame.init(document.getElementById('blackjack-game'));
        return;
    }
    
<<<<<<< HEAD
    // Reset money to default on resume as well
    blackjackGame.state.money = 100;
    
=======
>>>>>>> 5b04e5d (Site Refactor)
    // Check if this is coming back from a refresh with a game in progress
    const savedState = localStorage.getItem('blackjackGameState');
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            
            // If we refreshed with a game in progress, welcome message should reflect that
            if (parsedState.hadGameInProgress) {
                // Don't try to restore the full game state as that would be complex
                // Just show a message notifying the player
                blackjackUI.displayWelcomeMessage();
                blackjackUI.output('Game was interrupted. Start a new game when ready.');
<<<<<<< HEAD
                blackjackUI.output(`Your current balance: ${blackjackGame.state.money}`);
=======
                blackjackUI.output(`Your current balance: $${blackjackGame.state.money}`);
>>>>>>> 5b04e5d (Site Refactor)
                return;
            }
        } catch (e) {
            console.error('Error processing saved game state:', e);
        }
    }
    
    // Just update UI normally
    blackjackUI.displayGameState();
};

/**
 * Save the current game state with background theme
 */
blackjackGame.saveState = function() {
    const state = blackjackGame.state;
    const stateToSave = {
<<<<<<< HEAD
        // REMOVED money storage - each session starts fresh
        language: state.language,
        colorTheme: state.colorTheme,
        backgroundTheme: state.backgroundTheme || 'black',
        // REMOVED maxMoney storage - not needed between sessions
        // Only save game in progress flag
=======
        money: state.money,
        language: state.language,
        colorTheme: state.colorTheme,
        backgroundTheme: state.backgroundTheme || 'black',
        maxMoney: state.maxMoney,
        // Save additional state if a game is in progress
        gameInProgress: state.gameInProgress,
        currentBet: state.currentBet,
        // Only save the minimal game state - not the entire deck or hands
        // Just enough to know a game was in progress if we refresh
>>>>>>> 5b04e5d (Site Refactor)
        hadGameInProgress: state.gameInProgress
    };
    
    localStorage.setItem('blackjackGameState', JSON.stringify(stateToSave));
};

/**
 * Create a new shuffled deck of 5 French decks (260 cards)
 * @returns {Array} Shuffled deck of cards
 */
blackjackGame.createDeck = function() {
    // Create all cards for 5 decks
    const deck = [];
    const numDecks = 5; // Use 5 French decks (5 × 52 = 260 cards)
    
    for (let d = 0; d < numDecks; d++) {
        for (const suit of blackjackGame.SUITS) {
            for (const value of blackjackGame.VALUES) {
                deck.push({ suit, value });
            }
        }
    }
    
    // Verify deck size
    if (deck.length !== numDecks * 52) {
        console.warn(`Expected ${numDecks * 52} cards, but created ${deck.length}`);
    }
    
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
};

/**
 * Deal a card from the deck
 * @returns {Object} Card object
 */
blackjackGame.dealCard = function() {
    return blackjackGame.state.deck.pop();
};

/**
 * Calculate the value of a hand
 * @param {Array} hand - Array of card objects
 * @returns {number} Hand value
 */
blackjackGame.calculateHandValue = function(hand) {
    let value = 0;
    let aceCount = 0;
    
    for (const card of hand) {
        if (card.value === 'A') {
            aceCount++;
            value += 11;
        } else {
            value += blackjackGame.CARD_VALUES[card.value];
        }
    }
    
    // Adjust for aces if needed
    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }
    
    return value;
};

/**
 * Start a new game
 */
blackjackGame.startGame = function() {
    const state = blackjackGame.state;
    
    if (state.gameInProgress) {
        blackjackUI.output(blackjackUI.getText('gameInProgress'));
        return;
    }
    
    if (state.currentBet <= 0) {
        blackjackUI.output(blackjackUI.getText('needBet'));
        return;
    }
    
<<<<<<< HEAD
    // Ensure bet doesn't exceed available money
    if (state.currentBet > state.money) {
        blackjackUI.output(blackjackUI.getText('betTooHigh'));
        state.currentBet = state.money;
        blackjackUI.output(blackjackUI.getText('betAdjustedDown', state.money));
    }
    
=======
>>>>>>> 5b04e5d (Site Refactor)
    // Reset game state
    blackjackGame.resetGameState();
    
    // Deal initial cards
    blackjackGame.dealInitialCards();
    
    // Display game and check for blackjack
    blackjackUI.displayGameState();
    blackjackUI.showOptions();
    blackjackGame.checkForBlackjack();
};

/**
 * Reset game state for a new game
 */
blackjackGame.resetGameState = function() {
    const state = blackjackGame.state;
    
<<<<<<< HEAD
    // If player is out of money, give them the starting amount
    if (state.money <= 0) {
        state.money = 100;
        blackjackUI.output(blackjackUI.getText('moneyReset', 100));
    }
    
=======
>>>>>>> 5b04e5d (Site Refactor)
    state.deck = blackjackGame.createDeck();
    state.playerHand = [];
    state.playerHands = [];
    state.activeHandIndex = 0;
    state.dealerHand = [];
    state.playerTurn = true;
    state.gameInProgress = true;
    state.handSplit = false;
    state.insuranceBet = 0;
<<<<<<< HEAD
    
    // Ensure canDouble is reset properly
    state.canDouble = false;
    state.canSplit = false;
    state.canInsurance = false;
    state.canSurrender = false;
=======
>>>>>>> 5b04e5d (Site Refactor)
};

/**
 * Deal initial cards
 */
blackjackGame.dealInitialCards = function() {
    const state = blackjackGame.state;
    
    state.playerHand.push(blackjackGame.dealCard());
    state.dealerHand.push(blackjackGame.dealCard());
    state.playerHand.push(blackjackGame.dealCard());
    state.dealerHand.push(blackjackGame.dealCard());
    
    // Calculate scores
    state.playerScore = blackjackGame.calculateHandValue(state.playerHand);
    state.dealerScore = blackjackGame.calculateHandValue(state.dealerHand);
    
<<<<<<< HEAD
    // CRITICAL FIX: Must have at least TWICE the bet amount to double down
    // This ensures they can cover the original bet PLUS the doubled portion
    state.canDouble = state.money >= state.currentBet * 2;
    
    // FIXED: Need twice the bet amount to split as well (since it creates two bets)
    state.canSplit = (blackjackGame.getCardValue(state.playerHand[0]) === blackjackGame.getCardValue(state.playerHand[1])) && 
                    state.money >= state.currentBet * 2;
                    
    state.canInsurance = state.dealerHand[0].value === 'A' && state.money >= Math.ceil(state.currentBet / 2);
    state.canSurrender = true;
    
    // Debug info to console
    console.log(`Can double: ${state.canDouble} (Money: ${state.money}, Bet: ${state.currentBet}, Required: ${state.currentBet * 2})`);
    console.log(`Can split: ${state.canSplit} (Money: ${state.money}, Bet: ${state.currentBet}, Required: ${state.currentBet * 2})`);
};
=======
    // Set available actions
    state.canDouble = state.money >= state.currentBet;
    state.canSplit = (blackjackGame.getCardValue(state.playerHand[0]) === blackjackGame.getCardValue(state.playerHand[1])) && 
                    state.money >= state.currentBet;
    state.canInsurance = state.dealerHand[0].value === 'A' && state.money >= Math.ceil(state.currentBet / 2);
    state.canSurrender = true;
}
>>>>>>> 5b04e5d (Site Refactor)

/**
 * Get card value (for comparing face value)
 * @param {Object} card - Card object
 * @returns {number} Card value
 */
blackjackGame.getCardValue = function(card) {
    return blackjackGame.CARD_VALUES[card.value];
};

/**
 * Check for blackjack after initial deal
 */
blackjackGame.checkForBlackjack = function() {
    const state = blackjackGame.state;
    
    if (state.playerScore === 21) {
        if (state.dealerScore === 21) {
            // Push - both have blackjack
<<<<<<< HEAD
            state.playerTurn = false; // Set to false to reveal dealer cards
            blackjackUI.displayGameState(); // Show dealer cards
=======
>>>>>>> 5b04e5d (Site Refactor)
            blackjackUI.output(blackjackUI.getText('blackjackTie'));
            blackjackGame.endGame(true);
        } else {
            // Player has blackjack
<<<<<<< HEAD
            state.playerTurn = false; // Set to false to reveal dealer cards
            blackjackUI.displayGameState(); // Show dealer cards
=======
>>>>>>> 5b04e5d (Site Refactor)
            blackjackUI.output(blackjackUI.getText('blackjackWin'));
            state.money += Math.floor(state.currentBet * 1.5);
            blackjackGame.endGame();
        }
    } else if (state.dealerScore === 21) {
        // Dealer has blackjack
<<<<<<< HEAD
        state.playerTurn = false; // Set to false to reveal dealer cards
        blackjackUI.displayGameState(); // Show dealer cards
        
=======
>>>>>>> 5b04e5d (Site Refactor)
        if (state.insuranceBet > 0) {
            blackjackUI.output(blackjackUI.getText('insurancePays'));
            state.money += state.insuranceBet * 2;
            state.money -= state.currentBet; // Still lose the main bet
        } else {
            blackjackUI.output(blackjackUI.getText('dealerBlackjack'));
            state.money -= state.currentBet;
        }
        blackjackGame.endGame();
    }
};

/**
 * Player takes another card (hit)
 */
blackjackGame.hit = function() {
    const state = blackjackGame.state;
    
    if (!state.gameInProgress || !state.playerTurn) {
        blackjackUI.output(blackjackUI.getText('cantHit'));
        return;
    }
    
    // Disable special moves after first hit
    state.canDouble = false;
    state.canSurrender = false;
    state.canInsurance = false;
    
    // Execute appropriate hit logic
    if (state.handSplit) {
        blackjackGame.hitSplitHand();
    } else {
        blackjackGame.hitSingleHand();
    }
};

/**
 * Hit on a single hand
 */
blackjackGame.hitSingleHand = function() {
    const state = blackjackGame.state;
    
    state.playerHand.push(blackjackGame.dealCard());
    state.playerScore = blackjackGame.calculateHandValue(state.playerHand);
    blackjackUI.displayGameState();
    
    if (state.playerScore > 21) {
        blackjackUI.output(blackjackUI.getText('bust'));
        state.money -= state.currentBet;
        blackjackGame.endGame();
    } else if (state.playerScore === 21) {
        blackjackUI.output(blackjackUI.getText('have21'));
        blackjackGame.stand();
    } else {
        blackjackUI.showOptions();
    }
};

/**
 * Hit on a split hand
 */
blackjackGame.hitSplitHand = function() {
    const state = blackjackGame.state;
    const currentHand = state.playerHands[state.activeHandIndex];
    
    currentHand.cards.push(blackjackGame.dealCard());
    currentHand.score = blackjackGame.calculateHandValue(currentHand.cards);
    blackjackUI.displayGameState();
    
    if (currentHand.score > 21) {
        blackjackUI.output(blackjackUI.getText('handBust', state.activeHandIndex + 1));
        state.money -= currentHand.bet;
        blackjackGame.moveToNextHandOrDealer();
    } else if (currentHand.score === 21) {
        blackjackUI.output(blackjackUI.getText('hand21', state.activeHandIndex + 1));
        blackjackGame.moveToNextHandOrDealer();
    } else {
        blackjackUI.showOptions();
    }
};

/**
 * Move to next split hand or dealer play
 */
blackjackGame.moveToNextHandOrDealer = function() {
    const state = blackjackGame.state;
    
    if (state.activeHandIndex < state.playerHands.length - 1) {
        state.activeHandIndex++;
        blackjackUI.output(blackjackUI.getText('playingHand', state.activeHandIndex + 1));
<<<<<<< HEAD
        
        // Only allow double if they have enough money for this hand's bet
        const nextHand = state.playerHands[state.activeHandIndex];
        state.canDouble = state.money >= nextHand.bet;
        
=======
        state.canDouble = true;
>>>>>>> 5b04e5d (Site Refactor)
        blackjackUI.displayGameState();
        blackjackUI.showOptions();
    } else {
        state.playerTurn = false;
        blackjackUI.output(blackjackUI.getText('allHandsComplete'));
        blackjackGame.dealerPlay();
    }
};

/**
 * Player stands
 */
blackjackGame.stand = function() {
    const state = blackjackGame.state;
    
    if (!state.gameInProgress || !state.playerTurn) {
        blackjackUI.output(blackjackUI.getText('cantStand'));
        return;
    }
    
    if (state.handSplit) {
        blackjackUI.output(blackjackUI.getText('standingOnHand', state.activeHandIndex + 1));
        blackjackGame.moveToNextHandOrDealer();
    } else {
        state.playerTurn = false;
        blackjackUI.output(blackjackUI.getText('youStand'));
        blackjackUI.displayGameState();
        blackjackGame.dealerPlay();
    }
};

/**
 * Double down bet
 */
blackjackGame.doubleDown = function() {
    const state = blackjackGame.state;
    
<<<<<<< HEAD
    if (!state.gameInProgress || !state.playerTurn) {
        blackjackUI.output(blackjackUI.getText('cantDouble'));
        return;
    }
    
    // ABSOLUTE FINAL VALIDATION: Player must have at least TWICE the bet amount available
    let canActuallyDouble = false;
    
    if (state.handSplit) {
        const currentHand = state.playerHands[state.activeHandIndex];
        canActuallyDouble = state.money >= currentHand.bet * 2; // Need at least TWICE the bet amount
        
        if (!canActuallyDouble) {
            state.canDouble = false;
            blackjackUI.output(blackjackUI.getText('notEnoughMoneyForDouble'));
            return;
        }
    } else {
        canActuallyDouble = state.money >= state.currentBet * 2; // Need at least TWICE the bet amount
        
        if (!canActuallyDouble) {
            state.canDouble = false;
            blackjackUI.output(blackjackUI.getText('notEnoughMoneyForDouble'));
            return;
        }
    }
    
    if (!state.canDouble) {
=======
    if (!state.gameInProgress || !state.playerTurn || !state.canDouble) {
>>>>>>> 5b04e5d (Site Refactor)
        blackjackUI.output(blackjackUI.getText('cantDouble'));
        return;
    }
    
    if (state.handSplit) {
        blackjackGame.doubleDownSplitHand();
    } else {
        blackjackGame.doubleDownSingleHand();
    }
};

/**
 * Double down on split hand
 */
blackjackGame.doubleDownSplitHand = function() {
    const state = blackjackGame.state;
    const currentHand = state.playerHands[state.activeHandIndex];
    
    if (state.money < currentHand.bet) {
        blackjackUI.output(blackjackUI.getText('notEnoughMoney'));
        return;
    }
    
<<<<<<< HEAD
    // IMPORTANT: Immediately deduct the additional bet amount from player's money
    state.money -= currentHand.bet; // Take money for doubled portion right away
    
=======
>>>>>>> 5b04e5d (Site Refactor)
    blackjackUI.output(blackjackUI.getText('doublingDown', state.activeHandIndex + 1));
    currentHand.bet *= 2;
    
    // Take exactly one more card
    currentHand.cards.push(blackjackGame.dealCard());
    currentHand.score = blackjackGame.calculateHandValue(currentHand.cards);
    blackjackUI.displayGameState();
    
    if (currentHand.score > 21) {
        blackjackUI.output(blackjackUI.getText('handBust', state.activeHandIndex + 1));
<<<<<<< HEAD
        // Don't need to deduct the full bet as we already deducted the doubled portion
        // Only deduct the original bet amount that wasn't deducted yet
        state.money -= currentHand.bet / 2;
=======
        state.money -= currentHand.bet;
>>>>>>> 5b04e5d (Site Refactor)
    }
    
    blackjackGame.moveToNextHandOrDealer();
};

/**
 * Double down on single hand
 */
blackjackGame.doubleDownSingleHand = function() {
    const state = blackjackGame.state;
    
    if (state.money < state.currentBet) {
        blackjackUI.output(blackjackUI.getText('notEnoughMoney'));
        return;
    }
    
<<<<<<< HEAD
    // IMPORTANT: Immediately deduct the additional bet amount from player's money
    state.money -= state.currentBet; // Take money for the doubled portion right away
    
=======
>>>>>>> 5b04e5d (Site Refactor)
    blackjackUI.output(blackjackUI.getText('doubleDownBet', state.currentBet * 2));
    state.currentBet *= 2;
    
    // Take one more card and stand
    state.playerHand.push(blackjackGame.dealCard());
    state.playerScore = blackjackGame.calculateHandValue(state.playerHand);
    blackjackUI.displayGameState();
    
    if (state.playerScore > 21) {
        blackjackUI.output(blackjackUI.getText('bust'));
<<<<<<< HEAD
        // Don't need to deduct the full bet as we already deducted the doubled portion
        // Only deduct the original bet amount that wasn't deducted yet
        state.money -= state.currentBet / 2;
=======
        state.money -= state.currentBet;
>>>>>>> 5b04e5d (Site Refactor)
        blackjackGame.endGame();
    } else {
        state.playerTurn = false;
        blackjackUI.output(blackjackUI.getText('standingAfterDouble'));
        blackjackGame.dealerPlay();
    }
};

/**
 * Split hand
 */
blackjackGame.splitHand = function() {
    const state = blackjackGame.state;
    
<<<<<<< HEAD
    if (!state.gameInProgress || !state.playerTurn || 
=======
    if (!state.gameInProgress || !state.playerTurn || !state.canSplit || 
>>>>>>> 5b04e5d (Site Refactor)
        state.playerHand.length !== 2 || blackjackGame.getCardValue(state.playerHand[0]) !== blackjackGame.getCardValue(state.playerHand[1])) {
        blackjackUI.output(blackjackUI.getText(state.canSplit ? 'splitOnlyTwoCards' : 'cantSplit'));
        return;
    }
    
<<<<<<< HEAD
    // FIXED: Check if player has DOUBLE the bet amount for splitting (need to cover two full bets)
    if (state.money < state.currentBet * 2) {
        state.canSplit = false;
        // Use getText properly to get the translated message
        blackjackUI.output(blackjackUI.getText('notEnoughMoneyForSplit'));
=======
    if (state.money < state.currentBet) {
        blackjackUI.output(blackjackUI.getText('notEnoughMoney'));
>>>>>>> 5b04e5d (Site Refactor)
        return;
    }
    
    blackjackUI.output(blackjackUI.getText('splittingHand'));
    
    // Set up split hands
    state.handSplit = true;
    state.playerHands = [
        { cards: [state.playerHand[0]], bet: state.currentBet, score: 0 },
        { cards: [state.playerHand[1]], bet: state.currentBet, score: 0 }
    ];
    
<<<<<<< HEAD
    // Deduct the additional bet for the second hand immediately
    state.money -= state.currentBet;
    
=======
>>>>>>> 5b04e5d (Site Refactor)
    // Deal one more card to each hand
    state.playerHands[0].cards.push(blackjackGame.dealCard());
    state.playerHands[1].cards.push(blackjackGame.dealCard());
    
    // Calculate scores
    state.playerHands[0].score = blackjackGame.calculateHandValue(state.playerHands[0].cards);
    state.playerHands[1].score = blackjackGame.calculateHandValue(state.playerHands[1].cards);
    
    // Reset game state
    state.activeHandIndex = 0;
<<<<<<< HEAD
    state.canSplit = false; // Can't split again after splitting
    state.canSurrender = false;
    state.canInsurance = false;
    
    // Only allow double if they have enough money for EACH hand's double
    state.canDouble = state.money >= state.currentBet * 2;
=======
    state.canSplit = false;
    state.canSurrender = false;
    state.canInsurance = false;
    state.canDouble = true;
>>>>>>> 5b04e5d (Site Refactor)
    
    blackjackUI.output(blackjackUI.getText('playingHand', 1));
    blackjackUI.displayGameState();
    blackjackUI.showOptions();
};

/**
 * Take insurance
 */
blackjackGame.takeInsurance = function() {
    const state = blackjackGame.state;
    
    if (!state.gameInProgress || !state.playerTurn || !state.canInsurance || 
        state.dealerHand[0].value !== 'A') {
        blackjackUI.output(blackjackUI.getText(state.canInsurance ? 'aceNeededForInsurance' : 'cantInsurance'));
        return;
    }
    
    const insuranceCost = Math.ceil(state.currentBet / 2);
    
<<<<<<< HEAD
    // Double check money availability
    if (state.money < insuranceCost) {
        state.canInsurance = false;
=======
    if (state.money < insuranceCost) {
>>>>>>> 5b04e5d (Site Refactor)
        blackjackUI.output(blackjackUI.getText('notEnoughMoney'));
        return;
    }
    
    state.insuranceBet = insuranceCost;
    blackjackUI.output(blackjackUI.getText('takingInsurance', insuranceCost));
    
    // If dealer has blackjack, insurance pays 2:1
    if (state.dealerScore === 21) {
        blackjackUI.output(blackjackUI.getText('insurancePays'));
        state.money += state.insuranceBet * 2;
        state.money -= state.currentBet; // Still lose the main bet
        blackjackGame.endGame();
    } else {
        blackjackUI.output(blackjackUI.getText('noBlackjackLoseInsurance'));
        state.money -= state.insuranceBet;
        state.canInsurance = false;
        blackjackUI.showOptions();
    }
};

/**
 * Surrender hand
 */
blackjackGame.surrender = function() {
    const state = blackjackGame.state;
    
    if (!state.gameInProgress || !state.playerTurn || !state.canSurrender) {
        blackjackUI.output(blackjackUI.getText('cantSurrender'));
        return;
    }
    
    blackjackUI.output(blackjackUI.getText('surrendering'));
    state.money -= Math.floor(state.currentBet / 2);
    blackjackGame.endGame();
};

/**
 * Dealer's turn
 */
blackjackGame.dealerPlay = function() {
    const state = blackjackGame.state;
    
    // Dealer hits until reaching 17 or higher
    while (state.dealerScore < 17) {
        blackjackUI.output(blackjackUI.getText('dealerHits'));
        state.dealerHand.push(blackjackGame.dealCard());
        state.dealerScore = blackjackGame.calculateHandValue(state.dealerHand);
        blackjackUI.displayGameState();
    }
    
    // Resolve game based on hands
    state.handSplit ? blackjackGame.resolveSplitHands() : blackjackGame.resolveSingleHand();
};

/**
 * Resolve split hands
 */
blackjackGame.resolveSplitHands = function() {
    const state = blackjackGame.state;
    let totalWinnings = 0;
    const dealerBusted = state.dealerScore > 21;
    
    for (let i = 0; i < state.playerHands.length; i++) {
        const hand = state.playerHands[i];
<<<<<<< HEAD
        const originalBet = hand.bet / 2; // Original bet before doubling
        const isDoubled = hand.bet > originalBet; // Check if hand was doubled
        
        // Skip busted hands - they already lost their bets or had money deducted
        if (hand.score > 21) {
            blackjackUI.output(blackjackUI.getText('handBusted', i + 1));
            // For doubled busted hands, we already deducted the money during hit/double
=======
        
        // Skip busted hands
        if (hand.score > 21) {
            blackjackUI.output(blackjackUI.getText('handBusted', i + 1));
>>>>>>> 5b04e5d (Site Refactor)
            continue;
        }
        
        if (dealerBusted) {
            blackjackUI.output(blackjackUI.getText('dealerBustsHand', i + 1, hand.bet));
<<<<<<< HEAD
            // Win the current bet amount
            totalWinnings += hand.bet;
        } else if (hand.score > state.dealerScore) {
            blackjackUI.output(blackjackUI.getText('handWins', i + 1, hand.score, state.dealerScore, hand.bet));
            // Win the current bet amount
            totalWinnings += hand.bet;
        } else if (hand.score < state.dealerScore) {
            blackjackUI.output(blackjackUI.getText('handLoses', i + 1, hand.score, state.dealerScore, hand.bet));
            // Lose the current bet amount, but if doubled, we already took half
            if (isDoubled) {
                totalWinnings -= originalBet; // Only deduct the original bet part
            } else {
                totalWinnings -= hand.bet; // Deduct the full bet
            }
        } else {
            blackjackUI.output(blackjackUI.getText('handTies', i + 1, hand.score));
            // On tie, return any doubled amount already deducted
            if (isDoubled) {
                totalWinnings += originalBet; // Return the doubled portion already taken
            }
            // No other money change on tie - original bet is returned
        }
    }
    
    // Properly update money balance
    state.money += totalWinnings;
    
    // Ensure money doesn't go negative due to any calculation errors
    if (state.money < 0) {
        console.error("Negative money detected, resetting to 0");
        state.money = 0;
    }
    
=======
            totalWinnings += hand.bet;
        } else if (hand.score > state.dealerScore) {
            blackjackUI.output(blackjackUI.getText('handWins', i + 1, hand.score, state.dealerScore, hand.bet));
            totalWinnings += hand.bet;
        } else if (hand.score < state.dealerScore) {
            blackjackUI.output(blackjackUI.getText('handLoses', i + 1, hand.score, state.dealerScore, hand.bet));
            totalWinnings -= hand.bet;
        } else {
            blackjackUI.output(blackjackUI.getText('handTies', i + 1, hand.score));
        }
    }
    
    state.money += totalWinnings;
>>>>>>> 5b04e5d (Site Refactor)
    blackjackGame.endGame();
};

/**
 * Resolve single hand
 */
blackjackGame.resolveSingleHand = function() {
    const state = blackjackGame.state;
<<<<<<< HEAD
    const isDoubled = state.currentBet > 0 && !state.canDouble; // We doubled if we have a bet and canDouble is false
=======
>>>>>>> 5b04e5d (Site Refactor)
    
    if (state.dealerScore > 21) {
        blackjackUI.output(blackjackUI.getText('dealerBusts'));
        state.money += state.currentBet;
    } else if (state.dealerScore > state.playerScore) {
        blackjackUI.output(blackjackUI.getText('dealerWins', state.dealerScore));
<<<<<<< HEAD
        if (!isDoubled) {
            // If we didn't double, deduct the bet now
            state.money -= state.currentBet;
        } else {
            // If we doubled, we already took the doubled portion when doubling
            // Just deduct the original portion
            state.money -= state.currentBet / 2;
        }
=======
        state.money -= state.currentBet;
>>>>>>> 5b04e5d (Site Refactor)
    } else if (state.dealerScore < state.playerScore) {
        blackjackUI.output(blackjackUI.getText('playerWins', state.playerScore));
        state.money += state.currentBet;
    } else {
        blackjackUI.output(blackjackUI.getText('tie'));
<<<<<<< HEAD
        // For a tie after doubling, return the doubled amount that was already taken
        if (isDoubled) {
            state.money += state.currentBet / 2;
        }
=======
>>>>>>> 5b04e5d (Site Refactor)
        blackjackGame.endGame(true); // Push
        return;
    }
    
<<<<<<< HEAD
    // Safety check to prevent negative money
    if (state.money < 0) {
        console.error("Negative money detected, resetting to 0");
        state.money = 0;
    }
    
=======
>>>>>>> 5b04e5d (Site Refactor)
    blackjackGame.endGame();
};

/**
 * End the game
 * @param {boolean} push - Whether the game ended in a push (tie)
 */
blackjackGame.endGame = function(push = false) {
    const state = blackjackGame.state;
    state.gameInProgress = false;
<<<<<<< HEAD
    state.playerTurn = false; // Ensure dealer cards are visible
    
    // Always redisplay the game state to show all cards
    blackjackUI.displayGameState();
=======
>>>>>>> 5b04e5d (Site Refactor)
    
    if (!push) {
        blackjackUI.output(blackjackUI.getText('moneyLeft', state.money));
    }
    
    // Track highest money amount
    if (state.money > state.maxMoney) {
        state.maxMoney = state.money;
    }
    
    if (state.money <= 0) {
        blackjackUI.output(blackjackUI.getText('outOfMoney'));
        state.currentBet = 0; // Reset bet when out of money to prevent further play
        
        // Check if the max money amount qualifies for the leaderboard
        if (blackjackLeaderboard.checkHighScore(state.maxMoney)) {
            blackjackLeaderboard.promptForUsername(state.maxMoney);
        }
        
        // Reset max money for next game
        state.maxMoney = 100;
        
    } else {
        blackjackUI.output(blackjackUI.getText('playAgain'));
    }
    
    // Save game state
    blackjackGame.saveState();
};