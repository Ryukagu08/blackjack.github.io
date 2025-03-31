/**
 * Visual Roulette Game - Core Logic
 * Main game engine for the roulette game
 */

// Create roulette game namespace
const rouletteGame = window.rouletteGame = {};

// Game constants
rouletteGame.NUMBER_COLORS = {
    0: 'green'
};

// Define red numbers
rouletteGame.RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Fill in black numbers (any number not in RED_NUMBERS and not 0)
for (let i = 1; i <= 36; i++) {
    if (!rouletteGame.RED_NUMBERS.includes(i)) {
        rouletteGame.NUMBER_COLORS[i] = 'black';
    } else {
        rouletteGame.NUMBER_COLORS[i] = 'red';
    }
}

// Wheel numbers in the physical order they appear (European wheel)
rouletteGame.WHEEL_NUMBERS = [0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32];

// Bet types and their payouts
rouletteGame.BET_TYPES = {
    'inside_whole': { name: 'Straight', payout: 35 },
    'split': { name: 'Split', payout: 17 },
    'street': { name: 'Street', payout: 11 },
    'corner_bet': { name: 'Corner', payout: 8 },
    'double_street': { name: 'Line', payout: 5 },
    'outside_column': { name: 'Column', payout: 2 },
    'outside_dozen': { name: 'Dozen', payout: 2 },
    'outside_oerb': { name: 'Even/Odd/Red/Black', payout: 1 },
    'outside_high': { name: 'High', payout: 1 },
    'outside_low': { name: 'Low', payout: 1 },
    'zero': { name: 'Zero', payout: 35 }
};

// Default settings
rouletteGame.DEFAULT_SETTINGS = {
    money: 1000,
    wager: 5,
    animationSpeed: 'normal' // Options: 'fast', 'normal', 'slow'
};

// Game state object
rouletteGame.state = {
    money: rouletteGame.DEFAULT_SETTINGS.money,
    currentBet: 0,
    wager: rouletteGame.DEFAULT_SETTINGS.wager,
    lastWager: 0,
    bets: [],
    numbersBet: [],
    previousNumbers: [],
    spinInProgress: false,
    lastWin: 0,
    lastNumber: null,
    animationSpeed: rouletteGame.DEFAULT_SETTINGS.animationSpeed,
    colorTheme: 'green',
    backgroundTheme: 'black',
    language: 'en',
    
    // High score tracking
    maxMoney: rouletteGame.DEFAULT_SETTINGS.money,
    waitingForUsername: false,
    highScore: 0,
    
    // Animation state
    wheelElement: null,
    ballTrackElement: null,
    notificationTimer: null,
    
    // Container reference
    containerElement: null,
    exitCallback: null,
    initialized: false
};

/**
 * Initialize the game
 * @param {HTMLElement} container - The container element
 * @param {Function} exitCallback - Callback to exit the game
 */
rouletteGame.init = function(container, exitCallback) {
    // Store references
    const state = rouletteGame.state;
    state.containerElement = container;
    state.exitCallback = exitCallback;
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Create game UI
    rouletteUI.createGameUI(container);
    
    // Set up command handling
    rouletteCommands.setupCommandHandling();
    
    // Initialize leaderboard
    rouletteLeaderboard.init();
    
    // Load saved state if exists
    const savedState = localStorage.getItem('rouletteGameState');
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState);
            // Restore settings but not money
            state.money = rouletteGame.DEFAULT_SETTINGS.money;
            state.language = parsed.language || rouletteGame.DEFAULT_SETTINGS.language;
            state.colorTheme = parsed.colorTheme || rouletteGame.DEFAULT_SETTINGS.colorTheme;
            state.backgroundTheme = parsed.backgroundTheme || rouletteGame.DEFAULT_SETTINGS.backgroundTheme;
            state.animationSpeed = parsed.animationSpeed || rouletteGame.DEFAULT_SETTINGS.animationSpeed;
            
            // Restore previous numbers for history display
            if (parsed.previousNumbers && Array.isArray(parsed.previousNumbers)) {
                state.previousNumbers = parsed.previousNumbers.slice(0, 10);
            }
        } catch (e) {
            console.error('Error loading saved game state:', e);
        }
    }
    
    // Apply color theme and background
    rouletteUI.applyColorTheme(state.colorTheme);
    rouletteUI.applyBackgroundTheme(state.backgroundTheme);
    
    // Show welcome message and build the UI
    rouletteUI.buildWheel();
    rouletteUI.buildBettingBoard();
    
    // Store references to wheel elements
    state.wheelElement = container.querySelector('.wheel');
    state.ballTrackElement = container.querySelector('.ballTrack');
    
    // Register event listeners for window focus/blur
    window.addEventListener('focus', rouletteGame.handleWindowFocus);
    window.addEventListener('blur', rouletteGame.handleWindowBlur);
    
    // Also listen for visibility change for more reliable detection of tab switching
    document.addEventListener('visibilitychange', rouletteGame.handleVisibilityChange);
    
    // Mark as initialized
    state.initialized = true;
    
    // Output welcome message
    rouletteUI.output("Welcome to Roulette! Place your bets and spin the wheel to play.", "info");
    
    return rouletteGame;
};

/**
 * Handle window focus event
 */
rouletteGame.handleWindowFocus = function() {
    // No action needed
};

/**
 * Handle window blur event
 */
rouletteGame.handleWindowBlur = function() {
    // Save game state when window loses focus
    rouletteGame.saveState();
};

/**
 * Handle visibility change event
 */
rouletteGame.handleVisibilityChange = function() {
    if (document.hidden) {
        rouletteGame.saveState();
    }
};

/**
 * Update the game's color theme
 * @param {string} theme - The color theme
 */
rouletteGame.updateTheme = function(theme) {
    rouletteGame.state.colorTheme = theme;
    rouletteUI.applyColorTheme(theme);
};

/**
 * Set the animation speed
 * @param {string} speed - Animation speed (fast, normal, slow)
 */
rouletteGame.setAnimationSpeed = function(speed) {
    const validSpeeds = ['fast', 'normal', 'slow'];
    
    if (speed && validSpeeds.includes(speed)) {
        rouletteGame.state.animationSpeed = speed;
        rouletteUI.output(rouletteUI.getText('speedChanged', speed), false, 'success');
        rouletteGame.saveState();
    } else {
        rouletteUI.output(rouletteUI.getText('speedOptions'), false, 'info');
    }
};

/**
 * Resume the game when returning to it
 */
rouletteGame.resume = function() {
    if (!rouletteGame.state.initialized) {
        rouletteGame.init(document.getElementById('roulette-game'));
        return;
    }
    
    // Just display the current state
    rouletteUI.displayGameState();
    
    // Refocus input if already had focus before refresh
    const inputElement = document.getElementById('roulette-command-input');
    if (inputElement && document.activeElement === document.body) {
        inputElement.focus();
    }
};

/**
 * Save the current game state
 */
rouletteGame.saveState = function() {
    const state = rouletteGame.state;
    const stateToSave = {
        // Do NOT save money - we want it to reset each session
        language: state.language,
        colorTheme: state.colorTheme,
        backgroundTheme: state.backgroundTheme || 'black',
        animationSpeed: state.animationSpeed,
        previousNumbers: state.previousNumbers.slice(0, 10) // Save only last 10 spins
    };
    
    localStorage.setItem('rouletteGameState', JSON.stringify(stateToSave));
};

/**
 * Place a bet
 * @param {Element} element - The DOM element being bet on
 * @param {string} numbers - Numbers being bet on (comma-separated)
 * @param {string} betType - Type of bet
 * @param {number} odds - Payout odds
 * @returns {boolean} Whether the bet was successfully placed
 */
rouletteGame.placeBet = function(element, numbers, betType, odds) {
    const state = rouletteGame.state;
    
    // Check if spin in progress
    if (state.spinInProgress) {
        rouletteUI.output(rouletteUI.getText('spinInProgress'), false, 'error');
        return false;
    }
    
    // Save last wager for repeat functionality
    state.lastWager = state.wager;
    
    // Make sure wager doesn't exceed bank
    state.wager = (state.money < state.wager) ? state.money : state.wager;
    
    if (state.wager > 0) {
        // Update bank and current bet
        state.money = state.money - state.wager;
        state.currentBet = state.currentBet + state.wager;
        
        // Update displays
        const bankSpan = document.getElementById('bankSpan');
        const betSpan = document.getElementById('betSpan');
        if (bankSpan) bankSpan.innerText = '' + state.money.toLocaleString("en-GB") + '';
        if (betSpan) betSpan.innerText = '' + state.currentBet.toLocaleString("en-GB") + '';
        
        // Add spin button if it doesn't exist
        if (!state.containerElement.querySelector('.spinBtn')) {
            let spinBtn = document.createElement('div');
            spinBtn.setAttribute('class', 'spinBtn');
            spinBtn.innerText = 'spin';
            spinBtn.onclick = function() {
                this.remove();
                rouletteGame.spin();
            };
            state.containerElement.append(spinBtn);
        }
        
        // Check if we already have this bet
        for (let i = 0; i < state.bets.length; i++) {
            if (state.bets[i].numbers == numbers && state.bets[i].type == betType) {
                // Update existing bet
                state.bets[i].amt = state.bets[i].amt + state.wager;
                
                // Update chip visual
                let chipColor = (state.bets[i].amt < 5) ? 'red' : 
                              ((state.bets[i].amt < 10) ? 'blue' : 
                              ((state.bets[i].amt < 100) ? 'orange' : 'gold'));
                
                const chip = element.querySelector('.chip');
                if (chip) {
                    chip.style.cssText = '';
                    chip.setAttribute('class', 'chip ' + chipColor);
                    const chipSpan = chip.querySelector('.chipSpan');
                    if (chipSpan) chipSpan.innerText = state.bets[i].amt;
                }
                
                // Output to terminal
                rouletteUI.output(`Added $${state.wager} to ${betType} bet on ${numbers}. Total: $${state.bets[i].amt}`, "info");
                return true;
            }
        }
        
        // Create new bet
        var betObj = {
            amt: state.wager,
            type: betType,
            odds: odds,
            numbers: numbers
        };
        state.bets.push(betObj);
        
        // Add numbers to betNumbers array
        let numArray = numbers.split(',').map(Number);
        for (let i = 0; i < numArray.length; i++) {
            if (!state.numbersBet.includes(numArray[i])) {
                state.numbersBet.push(numArray[i]);
            }
        }
        
        // Create chip on the board
        if (!element.querySelector('.chip')) {
            let chipColor = (state.wager < 5) ? 'red' : 
                          ((state.wager < 10) ? 'blue' : 
                          ((state.wager < 100) ? 'orange' : 'gold'));
            
            let chip = document.createElement('div');
            chip.setAttribute('class', 'chip ' + chipColor);
            let chipSpan = document.createElement('span');
            chipSpan.setAttribute('class', 'chipSpan');
            chipSpan.innerText = state.wager;
            chip.append(chipSpan);
            element.append(chip);
        }
        
        // Output to terminal
        rouletteUI.output(`Placed $${state.wager} ${betType} bet on ${numbers}`, "info");
        return true;
    }
    
    return false;
};

/**
 * Remove a bet
 * @param {Element} element - The DOM element being bet on
 * @param {string} numbers - Numbers being bet on (comma-separated)
 * @param {string} betType - Type of bet
 * @param {number} odds - Payout odds
 * @returns {boolean} Whether the bet was successfully removed
 */
rouletteGame.removeBet = function(element, numbers, betType, odds) {
    const state = rouletteGame.state;
    
    // Default wager if none set
    state.wager = (state.wager == 0) ? 100 : state.wager;
    
    for (let i = 0; i < state.bets.length; i++) {
        if (state.bets[i].numbers == numbers && state.bets[i].type == betType) {
            if (state.bets[i].amt != 0) {
                // Don't remove more than current bet amount
                state.wager = (state.bets[i].amt > state.wager) ? state.wager : state.bets[i].amt;
                
                // Update bet amount
                state.bets[i].amt = state.bets[i].amt - state.wager;
                
                // Update bank and current bet
                state.money = state.money + state.wager;
                state.currentBet = state.currentBet - state.wager;
                
                // Update displays
                const bankSpan = document.getElementById('bankSpan');
                const betSpan = document.getElementById('betSpan');
                if (bankSpan) bankSpan.innerText = '' + state.money.toLocaleString("en-GB") + '';
                if (betSpan) betSpan.innerText = '' + state.currentBet.toLocaleString("en-GB") + '';
                
                // Update or remove the chip
                if (state.bets[i].amt == 0) {
                    const chip = element.querySelector('.chip');
                    if (chip) chip.style.cssText = 'display:none';
                } else {
                    let chipColor = (state.bets[i].amt < 5) ? 'red' : 
                                  ((state.bets[i].amt < 10) ? 'blue' : 
                                  ((state.bets[i].amt < 100) ? 'orange' : 'gold'));
                    
                    const chip = element.querySelector('.chip');
                    if (chip) {
                        chip.setAttribute('class', 'chip ' + chipColor);
                        const chipSpan = chip.querySelector('.chipSpan');
                        if (chipSpan) chipSpan.innerText = state.bets[i].amt;
                    }
                }
                
                // Output to terminal
                rouletteUI.output(`Removed $${state.wager} from ${betType} bet on ${numbers}`, "info");
                
                // Remove spin button if no bets are placed
                if (state.currentBet == 0 && state.containerElement.querySelector('.spinBtn')) {
                    state.containerElement.querySelector('.spinBtn').remove();
                }
                
                return true;
            }
        }
    }
    
    return false;
};

/**
 * Spin the wheel
 */
rouletteGame.spin = function() {
    const state = rouletteGame.state;
    
    // Check if any bets have been placed
    if (state.bets.length === 0) {
        rouletteUI.output(rouletteUI.getText('noBets'), false, 'error');
        return;
    }
    
    // Check if spin is already in progress
    if (state.spinInProgress) {
        rouletteUI.output(rouletteUI.getText('spinAlreadyInProgress'), false, 'error');
        return;
    }
    
    // Set spin in progress
    state.spinInProgress = true;
    
    // Generate random winning number
    const winningSpin = Math.floor(Math.random() * 37);
    
    // Notify terminal
    rouletteUI.output("Wheel spinning...", "info");
    
    // Animate the wheel
    rouletteUI.spinWheel(winningSpin);
    
    // Process the results after animation
    setTimeout(function() {
        let winValue = 0;
        let betTotal = 0;
        
        // Check if any bets won
        if (state.numbersBet.includes(winningSpin)) {
            for (let i = 0; i < state.bets.length; i++) {
                var numArray = state.bets[i].numbers.split(',').map(Number);
                if (numArray.includes(winningSpin)) {
                    // Calculate winnings
                    state.money = (state.money + (state.bets[i].odds * state.bets[i].amt) + state.bets[i].amt);
                    winValue = winValue + (state.bets[i].odds * state.bets[i].amt);
                    betTotal = betTotal + state.bets[i].amt;
                }
            }
            
            // Display win notification
            rouletteUI.showWin(winningSpin, winValue, betTotal);
            
            // Output to terminal
            rouletteUI.output(`Ball landed on ${winningSpin}. You won $${winValue} on a $${betTotal} bet!`, "success");
        } else {
            // Output to terminal
            rouletteUI.output(`Ball landed on ${winningSpin}. All bets lost.`, "error");
        }
        
        // Store last number
        state.lastNumber = winningSpin;
        
        // Add to previous numbers
        state.previousNumbers.unshift({
            number: winningSpin,
            color: rouletteGame.NUMBER_COLORS[winningSpin]
        });
        
        // Limit to 10 previous numbers
        if (state.previousNumbers.length > 10) {
            state.previousNumbers = state.previousNumbers.slice(0, 10);
        }
        
        // Reset current bet
        state.currentBet = 0;
        const bankSpan = document.getElementById('bankSpan');
        const betSpan = document.getElementById('betSpan');
        if (bankSpan) bankSpan.innerText = '' + state.money.toLocaleString("en-GB") + '';
        if (betSpan) betSpan.innerText = '' + state.currentBet.toLocaleString("en-GB") + '';
        
        // Add number to previous numbers display
        rouletteUI.updatePreviousNumbers(state.previousNumbers);
        
        // Reset bets
        state.bets = [];
        state.numbersBet = [];
        rouletteUI.removeChips();
        state.wager = state.lastWager;
        
        // Update max money for high score tracking
        if (state.money > state.maxMoney) {
            state.maxMoney = state.money;
        }
        
        // Check if player is bankrupt
        if (state.money === 0 && state.currentBet === 0) {
            rouletteUI.showGameOver();
            
            // Check for high score
            if (state.maxMoney > 1000 && rouletteLeaderboard.checkHighScore(state.maxMoney)) {
                rouletteLeaderboard.promptForUsername(state.maxMoney);
            }
        }
        
        // Spin is complete
        state.spinInProgress = false;
        
        // Save game state
        rouletteGame.saveState();
    }, 10000);
};

/**
 * Clear all bets
 */
rouletteGame.clearBets = function() {
    const state = rouletteGame.state;
    
    // Check if spin in progress
    if (state.spinInProgress) {
        rouletteUI.output(rouletteUI.getText('cantClearBetsDuringSpin'), false, 'error');
        return;
    }
    
    // Check if there are any bets to clear
    if (state.bets.length === 0) {
        rouletteUI.output(rouletteUI.getText('noBetsToClear'), false, 'info');
        return;
    }
    
    // Refund all bet amounts
    state.money = state.money + state.currentBet;
    state.currentBet = 0;
    
    // Update displays
    const bankSpan = document.getElementById('bankSpan');
    const betSpan = document.getElementById('betSpan');
    if (bankSpan) bankSpan.innerText = '' + state.money.toLocaleString("en-GB") + '';
    if (betSpan) betSpan.innerText = '' + state.currentBet.toLocaleString("en-GB") + '';
    
    // Clear bets and chips
    state.bets = [];
    state.numbersBet = [];
    rouletteUI.removeChips();
    
    // Remove spin button
    const spinBtn = state.containerElement.querySelector('.spinBtn');
    if (spinBtn) spinBtn.remove();
    
    rouletteUI.output(rouletteUI.getText('betsCleared', state.currentBet), false, 'info');
};

/**
 * Reset the game to initial state
 */
rouletteGame.resetGame = function() {
    const state = rouletteGame.state;
    
    // Don't reset during a spin
    if (state.spinInProgress) {
        rouletteUI.output(rouletteUI.getText('cantResetDuringSpin'), false, 'error');
        return;
    }
    
    // Reset money to default
    state.money = rouletteGame.DEFAULT_SETTINGS.money;
    state.currentBet = 0;
    state.wager = rouletteGame.DEFAULT_SETTINGS.wager;
    state.bets = [];
    state.numbersBet = [];
    state.previousNumbers = [];
    state.maxMoney = rouletteGame.DEFAULT_SETTINGS.money;
    
    // Clear any notifications
    if (state.notificationTimer) {
        clearTimeout(state.notificationTimer);
        state.notificationTimer = null;
    }
    
    // Rebuild UI
    state.containerElement.innerHTML = '';
    rouletteUI.createGameUI(state.containerElement);
    rouletteUI.buildWheel();
    rouletteUI.buildBettingBoard();
    
    // Store references to wheel elements
    state.wheelElement = state.containerElement.querySelector('.wheel');
    state.ballTrackElement = state.containerElement.querySelector('.ballTrack');
    
    rouletteUI.output(rouletteUI.getText('gameReset'), false, 'info');
    rouletteGame.saveState();
};