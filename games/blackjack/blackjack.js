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

// Default settings
blackjackGame.DEFAULT_SETTINGS = {
    money: 100,
    language: 'en',
    colorTheme: 'green',
    backgroundTheme: 'black',
    maxMoney: 100
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
    money: blackjackGame.DEFAULT_SETTINGS.money,
    currentBet: 0,
    insuranceBet: 0,
    gameInProgress: false,
    playerTurn: true,
    canSplit: false,
    canDouble: false,
    canInsurance: false,
    canSurrender: false,
    handSplit: false,
    language: blackjackGame.DEFAULT_SETTINGS.language,
    colorTheme: blackjackGame.DEFAULT_SETTINGS.colorTheme,
    backgroundTheme: blackjackGame.DEFAULT_SETTINGS.backgroundTheme,
    firstGame: true,
    waitingForUsername: false,
    highScore: 0,
    maxMoney: blackjackGame.DEFAULT_SETTINGS.maxMoney,
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
            // Restore settings but NOT money (always start with default money)
            state.money = blackjackGame.DEFAULT_SETTINGS.money;
            state.language = parsed.language || blackjackGame.DEFAULT_SETTINGS.language;
            state.colorTheme = parsed.colorTheme || blackjackGame.DEFAULT_SETTINGS.colorTheme;
            state.backgroundTheme = parsed.backgroundTheme || blackjackGame.DEFAULT_SETTINGS.backgroundTheme;
            
            // Reset maxMoney to default for each new session
            state.maxMoney = blackjackGame.DEFAULT_SETTINGS.maxMoney;
            
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
        blackjackUI.output('Previous game was interrupted. Start a new game when ready.', false, 'info');
    }
    
    // Register event listeners for window focus/blur
    window.addEventListener('focus', blackjackGame.handleWindowFocus);
    window.addEventListener('blur', blackjackGame.handleWindowBlur);
    
    // Mark as initialized
    state.initialized = true;
    
    return blackjackGame;
};

/**
 * Handle window focus event
 */
blackjackGame.handleWindowFocus = function() {
    // No auto-focus behavior to allow user control
    // This is intentionally empty
};

/**
 * Handle window blur event
 */
blackjackGame.handleWindowBlur = function() {
    // Save game state when window loses focus
    blackjackGame.saveState();
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
                blackjackUI.output('Game was interrupted. Start a new game when ready.', false, 'info');
                blackjackUI.output(`Your current balance: $${blackjackGame.state.money}`, false, 'info');
                return;
            }
        } catch (e) {
            console.error('Error processing saved game state:', e);
        }
    }
    
    // Only display game state if there's an active game, otherwise show welcome message
    if (blackjackGame.state.gameInProgress) {
        blackjackUI.displayGameState();
    } else {
        blackjackUI.displayWelcomeMessage();
        blackjackUI.output(`Your current balance: $${blackjackGame.state.money}`, false, 'info');
    }
    
    // Refocus input if already had focus before refresh
    const inputElement = document.getElementById('blackjack-command-input');
    if (inputElement && document.activeElement === document.body) {
        inputElement.focus();
    }
};

/**
 * Save the current game state without money
 */
blackjackGame.saveState = function() {
    const state = blackjackGame.state;
    const stateToSave = {
        // Do NOT save money - we want it to reset each session
        language: state.language,
        colorTheme: state.colorTheme,
        backgroundTheme: state.backgroundTheme || 'black',
        // Save minimal game state
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
 * Validate if a bet is valid
 * @returns {boolean} Whether the current bet is valid
 */
blackjackGame.isValidBet = function() {
    const state = blackjackGame.state;
    
    // Check if a bet has been placed
    if (!state.currentBet || state.currentBet <= 0) {
        blackjackUI.output(blackjackUI.getText('needBet'), false, 'error');
        return false;
    }
    
    // Check if player has enough money for the bet
    if (state.currentBet > state.money) {
        blackjackUI.output(blackjackUI.getText('betTooHigh'), false, 'error');
        return false;
    }
    
    return true;
};

/**
 * Start a new game
 */
blackjackGame.startGame = function() {
    const state = blackjackGame.state;
    
    if (state.gameInProgress) {
        blackjackUI.output(blackjackUI.getText('gameInProgress'), false, 'error');
        return;
    }
    
    // Validate the bet is valid before proceeding
    if (!blackjackGame.isValidBet()) {
        return;
    }
    
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
    
    state.deck = blackjackGame.createDeck();
    state.playerHand = [];
    state.playerHands = [];
    state.activeHandIndex = 0;
    state.dealerHand = [];
    state.playerTurn = true;
    state.gameInProgress = true;
    state.handSplit = false;
    state.insuranceBet = 0;
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
    
    // Set available actions
    state.canDouble = state.money >= state.currentBet * 2;  // Must have enough to double the bet
    state.canSplit = (blackjackGame.getCardValue(state.playerHand[0]) === blackjackGame.getCardValue(state.playerHand[1])) && 
                    state.money >= state.currentBet * 2;  // Must have enough for two equal bets
    state.canInsurance = state.dealerHand[0].value === 'A' && state.money >= Math.ceil(state.currentBet / 2);
    state.canSurrender = true;
}

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
            blackjackUI.output(blackjackUI.getText('blackjackTie'), false, 'warning');
            blackjackGame.endGame(true);
        } else {
            // Player has blackjack
            blackjackUI.output(blackjackUI.getText('blackjackWin'), false, 'success');
            state.money += Math.floor(state.currentBet * 1.5);
            blackjackGame.endGame();
        }
    } else if (state.dealerScore === 21) {
        // Dealer has blackjack
        if (state.insuranceBet > 0) {
            blackjackUI.output(blackjackUI.getText('insurancePays'), false, 'success');
            state.money += state.insuranceBet * 2;
            state.money -= state.currentBet; // Still lose the main bet
        } else {
            blackjackUI.output(blackjackUI.getText('dealerBlackjack'), false, 'error');
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
        blackjackUI.output(blackjackUI.getText('cantHit'), false, 'error');
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
        blackjackUI.output(blackjackUI.getText('bust'), false, 'error');
        state.money -= state.currentBet;
        blackjackGame.endGame();
    } else if (state.playerScore === 21) {
        blackjackUI.output(blackjackUI.getText('have21'), false, 'success');
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
        blackjackUI.output(blackjackUI.getText('handBust', state.activeHandIndex + 1), false, 'error');
        state.money -= currentHand.bet;
        blackjackGame.moveToNextHandOrDealer();
    } else if (currentHand.score === 21) {
        blackjackUI.output(blackjackUI.getText('hand21', state.activeHandIndex + 1), false, 'success');
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
        blackjackUI.output(blackjackUI.getText('playingHand', state.activeHandIndex + 1), false, 'info');
        state.canDouble = true;
        blackjackUI.displayGameState();
        blackjackUI.showOptions();
    } else {
        state.playerTurn = false;
        blackjackUI.output(blackjackUI.getText('allHandsComplete'), false, 'info');
        blackjackGame.dealerPlay();
    }
};

/**
 * Player stands
 */
blackjackGame.stand = function() {
    const state = blackjackGame.state;
    
    if (!state.gameInProgress || !state.playerTurn) {
        blackjackUI.output(blackjackUI.getText('cantStand'), false, 'error');
        return;
    }
    
    if (state.handSplit) {
        blackjackUI.output(blackjackUI.getText('standingOnHand', state.activeHandIndex + 1), false, 'info');
        blackjackGame.moveToNextHandOrDealer();
    } else {
        state.playerTurn = false;
        blackjackUI.output(blackjackUI.getText('youStand'), false, 'info');
        blackjackUI.displayGameState();
        blackjackGame.dealerPlay();
    }
};

/**
 * Double down bet
 */
blackjackGame.doubleDown = function() {
    const state = blackjackGame.state;
    
    if (!state.gameInProgress || !state.playerTurn || !state.canDouble) {
        blackjackUI.output(blackjackUI.getText('cantDouble'), false, 'error');
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
    
    if (state.money < currentHand.bet * 2) {
        blackjackUI.output(blackjackUI.getText('notEnoughMoney'), false, 'error');
        return;
    }
    
    blackjackUI.output(blackjackUI.getText('doublingDown', state.activeHandIndex + 1), false, 'info');
    currentHand.bet *= 2;
    
    // Take exactly one more card
    currentHand.cards.push(blackjackGame.dealCard());
    currentHand.score = blackjackGame.calculateHandValue(currentHand.cards);
    blackjackUI.displayGameState();
    
    if (currentHand.score > 21) {
        blackjackUI.output(blackjackUI.getText('handBust', state.activeHandIndex + 1), false, 'error');
        state.money -= currentHand.bet;
    }
    
    blackjackGame.moveToNextHandOrDealer();
};

/**
 * Double down on single hand
 */
blackjackGame.doubleDownSingleHand = function() {
    const state = blackjackGame.state;
    
    if (state.money < state.currentBet * 2) {
        blackjackUI.output(blackjackUI.getText('notEnoughMoney'), false, 'error');
        return;
    }
    
    blackjackUI.output(blackjackUI.getText('doubleDownBet', state.currentBet * 2), false, 'info');
    state.currentBet *= 2;
    
    // Take one more card and stand
    state.playerHand.push(blackjackGame.dealCard());
    state.playerScore = blackjackGame.calculateHandValue(state.playerHand);
    blackjackUI.displayGameState();
    
    if (state.playerScore > 21) {
        blackjackUI.output(blackjackUI.getText('bust'), false, 'error');
        state.money -= state.currentBet;
        blackjackGame.endGame();
    } else {
        state.playerTurn = false;
        blackjackUI.output(blackjackUI.getText('standingAfterDouble'), false, 'info');
        blackjackGame.dealerPlay();
    }
};

/**
 * Split hand
 */
blackjackGame.splitHand = function() {
    const state = blackjackGame.state;
    
    if (!state.gameInProgress || !state.playerTurn || !state.canSplit || 
        state.playerHand.length !== 2 || blackjackGame.getCardValue(state.playerHand[0]) !== blackjackGame.getCardValue(state.playerHand[1])) {
        blackjackUI.output(blackjackUI.getText(state.canSplit ? 'splitOnlyTwoCards' : 'cantSplit'), false, 'error');
        return;
    }
    
    if (state.money < state.currentBet * 2) {
        blackjackUI.output(blackjackUI.getText('notEnoughMoney'), false, 'error');
        return;
    }
    
    blackjackUI.output(blackjackUI.getText('splittingHand'), false, 'info');
    
    // Set up split hands
    state.handSplit = true;
    state.playerHands = [
        { cards: [state.playerHand[0]], bet: state.currentBet, score: 0 },
        { cards: [state.playerHand[1]], bet: state.currentBet, score: 0 }
    ];
    
    // Deal one more card to each hand
    state.playerHands[0].cards.push(blackjackGame.dealCard());
    state.playerHands[1].cards.push(blackjackGame.dealCard());
    
    // Calculate scores
    state.playerHands[0].score = blackjackGame.calculateHandValue(state.playerHands[0].cards);
    state.playerHands[1].score = blackjackGame.calculateHandValue(state.playerHands[1].cards);
    
    // Reset game state
    state.activeHandIndex = 0;
    state.canSplit = false;
    state.canSurrender = false;
    state.canInsurance = false;
    state.canDouble = true;
    
    blackjackUI.output(blackjackUI.getText('playingHand', 1), false, 'info');
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
        blackjackUI.output(blackjackUI.getText(state.canInsurance ? 'aceNeededForInsurance' : 'cantInsurance'), false, 'error');
        return;
    }
    
    const insuranceCost = Math.ceil(state.currentBet / 2);
    
    if (state.money < insuranceCost) {
        blackjackUI.output(blackjackUI.getText('notEnoughMoney'), false, 'error');
        return;
    }
    
    state.insuranceBet = insuranceCost;
    blackjackUI.output(blackjackUI.getText('takingInsurance', insuranceCost), false, 'info');
    
    // If dealer has blackjack, insurance pays 2:1
    if (state.dealerScore === 21) {
        blackjackUI.output(blackjackUI.getText('insurancePays'), false, 'success');
        state.money += state.insuranceBet * 2;
        state.money -= state.currentBet; // Still lose the main bet
        blackjackGame.endGame();
    } else {
        blackjackUI.output(blackjackUI.getText('noBlackjackLoseInsurance'), false, 'error');
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
        blackjackUI.output(blackjackUI.getText('cantSurrender'), false, 'error');
        return;
    }
    
    blackjackUI.output(blackjackUI.getText('surrendering'), false, 'warning');
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
        blackjackUI.output(blackjackUI.getText('dealerHits'), false, 'info');
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
        
        // Skip busted hands
        if (hand.score > 21) {
            blackjackUI.output(blackjackUI.getText('handBusted', i + 1), false, 'error');
            continue;
        }
        
        if (dealerBusted) {
            blackjackUI.output(blackjackUI.getText('dealerBustsHand', i + 1, hand.bet), false, 'success');
            totalWinnings += hand.bet;
        } else if (hand.score > state.dealerScore) {
            blackjackUI.output(blackjackUI.getText('handWins', i + 1, hand.score, state.dealerScore, hand.bet), false, 'success');
            totalWinnings += hand.bet;
        } else if (hand.score < state.dealerScore) {
            blackjackUI.output(blackjackUI.getText('handLoses', i + 1, hand.score, state.dealerScore, hand.bet), false, 'error');
            totalWinnings -= hand.bet;
        } else {
            blackjackUI.output(blackjackUI.getText('handTies', i + 1, hand.score), false, 'info');
        }
    }
    
    state.money += totalWinnings;
    blackjackGame.endGame();
};

/**
 * Resolve single hand
 */
blackjackGame.resolveSingleHand = function() {
    const state = blackjackGame.state;
    
    if (state.dealerScore > 21) {
        blackjackUI.output(blackjackUI.getText('dealerBusts'), false, 'success');
        state.money += state.currentBet;
    } else if (state.dealerScore > state.playerScore) {
        blackjackUI.output(blackjackUI.getText('dealerWins', state.dealerScore), false, 'error');
        state.money -= state.currentBet;
    } else if (state.dealerScore < state.playerScore) {
        blackjackUI.output(blackjackUI.getText('playerWins', state.playerScore), false, 'success');
        state.money += state.currentBet;
    } else {
        blackjackUI.output(blackjackUI.getText('tie'), false, 'info');
        blackjackGame.endGame(true); // Push
        return;
    }
    
    blackjackGame.endGame();
};

/**
 * End the game
 * @param {boolean} push - Whether the game ended in a push (tie)
 */
blackjackGame.endGame = function(push = false) {
    const state = blackjackGame.state;
    state.gameInProgress = false;
    
    if (!push) {
        blackjackUI.output(blackjackUI.getText('moneyLeft', state.money), false, 'info');
    }
    
    // Track highest money amount
    if (state.money > state.maxMoney) {
        state.maxMoney = state.money;
    }
    
    if (state.money <= 0) {
        blackjackUI.output(blackjackUI.getText('outOfMoney'), false, 'error');
        state.currentBet = 0; // Reset bet when out of money to prevent further play
        
        // Check if the max money amount qualifies for the leaderboard
        if (blackjackLeaderboard.checkHighScore(state.maxMoney)) {
            blackjackLeaderboard.promptForUsername(state.maxMoney);
        }
        
        // Reset max money for next game
        state.maxMoney = 100;
        
    } else {
        blackjackUI.output(blackjackUI.getText('playAgain'), false, 'info');
    }
    
    // Save game state
    blackjackGame.saveState();
};