/**
 * Roulette Game Module - Core Game Logic
 * Completely redesigned with deterministic animation that always leads to the correct outcome
 */

// Create roulette game namespace
const rouletteGame = window.rouletteGame = {};

// Game constants
rouletteGame.WHEEL_NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 
    11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 
    22, 18, 29, 7, 28, 12, 35, 3, 26
]; // European roulette wheel sequence

rouletteGame.NUMBER_COLORS = {
    0: 'green',
    1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black',
    7: 'red', 8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red',
    13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red',
    19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black',
    25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red',
    31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red'
};

rouletteGame.BET_TYPES = {
    STRAIGHT: { name: 'Straight', payout: 35 },
    SPLIT: { name: 'Split', payout: 17 },
    STREET: { name: 'Street', payout: 11 },
    CORNER: { name: 'Corner', payout: 8 },
    LINE: { name: 'Line', payout: 5 },
    COLUMN: { name: 'Column', payout: 2 },
    DOZEN: { name: 'Dozen', payout: 2 },
    RED: { name: 'Red', payout: 1 },
    BLACK: { name: 'Black', payout: 1 },
    ODD: { name: 'Odd', payout: 1 },
    EVEN: { name: 'Even', payout: 1 },
    HIGH: { name: 'High (19-36)', payout: 1 },
    LOW: { name: 'Low (1-18)', payout: 1 }
};

// Default settings
rouletteGame.DEFAULT_SETTINGS = {
    money: 1000,
    language: 'en',
    colorTheme: 'green',
    backgroundTheme: 'black',
    maxMoney: 1000,
    animationSpeed: 'normal' // Options: 'fast', 'normal', 'slow'
};

// Animation constants
rouletteGame.ANIMATION = {
    // Duration in milliseconds for different speeds
    DURATION: {
        fast: 3000,
        normal: 5000,
        slow: 7000
    },
    // Cell width in pixels
    CELL_WIDTH: 70,
    // Number of cells in view
    VISIBLE_CELLS: 11
};

// Game state
rouletteGame.state = {
    money: rouletteGame.DEFAULT_SETTINGS.money,
    bets: [],
    lastBets: [], // Added property to store previous bets
    spinInProgress: false,
    lastNumber: null,
    lastWinnings: 0,
    spinHistory: [],
    language: rouletteGame.DEFAULT_SETTINGS.language,
    colorTheme: rouletteGame.DEFAULT_SETTINGS.colorTheme,
    backgroundTheme: rouletteGame.DEFAULT_SETTINGS.backgroundTheme,
    animationSpeed: rouletteGame.DEFAULT_SETTINGS.animationSpeed,
    firstGame: true,
    waitingForUsername: false,
    highScore: 0,
    maxMoney: rouletteGame.DEFAULT_SETTINGS.maxMoney,
    leaderboardPosition: 0,
    initialized: false,
    containerElement: null,
    
    // Animation state
    wheelPosition: 0,
    spinStartTime: 0,
    spinDuration: rouletteGame.ANIMATION.DURATION.normal,
    targetNumber: null,
    targetPosition: 0,
    animationFrameId: null,
    uiElements: null,
    skipAnimation: false
};

// Include translations placeholder
rouletteGame.translations = {};

/**
 * Initialize the game with state restoration
 * @param {HTMLElement} container - The container element for the game
 * @param {Function} exitCallback - Callback to exit the game
 */
rouletteGame.init = function(container, exitCallback) {
    // Store references
    const state = rouletteGame.state;
    state.containerElement = container;
    state.exitCallback = exitCallback;
    
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
            // Restore settings but NOT money (always start with default money)
            state.money = rouletteGame.DEFAULT_SETTINGS.money;
            state.language = parsed.language || rouletteGame.DEFAULT_SETTINGS.language;
            state.colorTheme = parsed.colorTheme || rouletteGame.DEFAULT_SETTINGS.colorTheme;
            state.backgroundTheme = parsed.backgroundTheme || rouletteGame.DEFAULT_SETTINGS.backgroundTheme;
            state.animationSpeed = parsed.animationSpeed || rouletteGame.DEFAULT_SETTINGS.animationSpeed;
            
            // Reset maxMoney to default for each new session
            state.maxMoney = rouletteGame.DEFAULT_SETTINGS.maxMoney;
            
            // Restore spin history if available
            if (parsed.spinHistory && Array.isArray(parsed.spinHistory)) {
                state.spinHistory = parsed.spinHistory.slice(0, 10);
            }
        } catch (e) {
            console.error('Error loading saved game state:', e);
        }
    }
    
    // Apply color theme and background
    rouletteUI.applyColorTheme(state.colorTheme);
    rouletteUI.applyBackgroundTheme(state.backgroundTheme);
    
    // Show welcome message
    rouletteUI.displayWelcomeMessage();
    
    // Register event listeners for window focus/blur
    window.addEventListener('focus', rouletteGame.handleWindowFocus);
    window.addEventListener('blur', rouletteGame.handleWindowBlur);
    
    // Also listen for visibility change for more reliable detection of tab switching
    document.addEventListener('visibilitychange', rouletteGame.handleVisibilityChange);
    
    // Mark as initialized
    state.initialized = true;
    
    return rouletteGame;
};

/**
 * Handle window focus event
 */
rouletteGame.handleWindowFocus = function() {
    // Resume animation if it was in progress
    if (rouletteGame.state.spinInProgress && !rouletteGame.state.animationFrameId) {
        rouletteGame.resumeAnimation();
    }
};

/**
 * Handle window blur event
 */
rouletteGame.handleWindowBlur = function() {
    // Pause animation and save state
    if (rouletteGame.state.spinInProgress) {
        rouletteGame.pauseAnimation();
    }
    
    // Save game state when window loses focus
    rouletteGame.saveState();
};

/**
 * Handle visibility change event
 */
rouletteGame.handleVisibilityChange = function() {
    if (document.hidden) {
        // Page is hidden, pause animation and save state
        if (rouletteGame.state.spinInProgress) {
            rouletteGame.pauseAnimation();
        }
        rouletteGame.saveState();
    } else {
        // Page is visible again, resume animation if needed
        if (rouletteGame.state.spinInProgress && !rouletteGame.state.animationFrameId) {
            rouletteGame.resumeAnimation();
        }
    }
};

/**
 * Pause the spin animation
 */
rouletteGame.pauseAnimation = function() {
    if (rouletteGame.state.animationFrameId) {
        cancelAnimationFrame(rouletteGame.state.animationFrameId);
        rouletteGame.state.animationFrameId = null;
        
        // Store the elapsed time for resuming later
        rouletteGame.state.pauseTime = performance.now();
    }
};

/**
 * Resume the spin animation
 */
rouletteGame.resumeAnimation = function() {
    if (rouletteGame.state.spinInProgress && !rouletteGame.state.animationFrameId) {
        // Adjust start time to account for paused duration
        if (rouletteGame.state.pauseTime) {
            const pauseDuration = performance.now() - rouletteGame.state.pauseTime;
            rouletteGame.state.spinStartTime += pauseDuration;
            rouletteGame.state.pauseTime = null;
        }
        
        // Restart animation loop
        rouletteGame.animateFrame();
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
        rouletteGame.state.spinDuration = rouletteGame.ANIMATION.DURATION[speed];
        
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
    
    // Check if this is coming back from a refresh
    const savedState = localStorage.getItem('rouletteGameState');
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            
            // Don't try to restore spin in progress
            if (parsedState.spinInProgress) {
                rouletteUI.displayWelcomeMessage();
                rouletteUI.output('Game was interrupted during spin. Start a new game.', false, 'info');
                rouletteUI.output(`Your current balance: $${rouletteGame.state.money}`, false, 'info');
                return;
            }
        } catch (e) {
            console.error('Error processing saved game state:', e);
        }
    }
    
    // Just display the current state
    rouletteUI.displayGameState();
    rouletteUI.output(`Your current balance: $${rouletteGame.state.money}`, false, 'info');
    
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
        spinInProgress: state.spinInProgress,
        spinHistory: state.spinHistory.slice(0, 10) // Save only last 10 spins
    };
    
    localStorage.setItem('rouletteGameState', JSON.stringify(stateToSave));
};

/**
 * Place a bet
 * @param {string} betType - Type of bet
 * @param {Array|number} numbers - Number(s) covered by the bet
 * @param {number} amount - Bet amount
 * @returns {boolean} Whether the bet was successfully placed
 */
rouletteGame.placeBet = function(betType, numbers, amount) {
    const state = rouletteGame.state;
    
    // Check if spin in progress
    if (state.spinInProgress) {
        rouletteUI.output(rouletteUI.getText('spinInProgress'), false, 'error');
        return false;
    }
    
    // Validate bet amount
    amount = parseInt(amount);
    if (isNaN(amount) || amount <= 0) {
        rouletteUI.output(rouletteUI.getText('invalidBet'), false, 'error');
        return false;
    }
    
    // Check if player has enough money
    if (amount > state.money) {
        rouletteUI.output(rouletteUI.getText('betTooHigh'), false, 'error');
        return false;
    }
    
    // Validate bet type
    if (!rouletteGame.BET_TYPES[betType]) {
        rouletteUI.output(rouletteUI.getText('invalidBetType'), false, 'error');
        return false;
    }
    
    // Add bet to state
    state.bets.push({
        type: betType,
        numbers: Array.isArray(numbers) ? numbers : [numbers],
        amount: amount
    });
    
    // Deduct money immediately
    state.money -= amount;
    
    // Update UI
    rouletteUI.displayGameState();
    rouletteUI.output(
        rouletteUI.getText('betPlaced', rouletteGame.BET_TYPES[betType].name, amount),
        false, 
        'success'
    );
    
    if (state.firstGame) {
        state.firstGame = false;
        rouletteUI.output(rouletteUI.getText('spinPrompt'), false, 'info');
    }
    
    return true;
};

/**
 * Determine the winning number before starting animation
 * @returns {number} The predetermined winning number
 */
rouletteGame.determineWinningNumber = function() {
    // Generate a random number from the wheel
    return rouletteGame.WHEEL_NUMBERS[
        Math.floor(Math.random() * rouletteGame.WHEEL_NUMBERS.length)
    ];
};

/**
 * Calculate the target position for the winning number to be centered
 * @param {number} targetNumber - The number that should end up at the center
 * @returns {number} The wheel position in pixels
 */
rouletteGame.calculateTargetPosition = function(targetNumber) {
    const wheelNumbers = rouletteGame.WHEEL_NUMBERS;
    const cellWidth = rouletteGame.ANIMATION.CELL_WIDTH;
    
    // Find the index of the target number in the wheel
    const targetIndex = wheelNumbers.indexOf(targetNumber);
    if (targetIndex === -1) {
        console.error("Target number not found in wheel sequence:", targetNumber);
        return 0;
    }
    
    // Calculate how many copies of the wheel sequence we have in the strip
    // The wheel strip has multiple copies of the wheel numbers (5x in the HTML)
    const sequenceMultiple = 5;
    
    // We want to end with the target number at the center of the visible area
    // Calculate the center position of the visible area
    const visibleCenterPosition = (rouletteGame.ANIMATION.VISIBLE_CELLS * cellWidth) / 2;
    
    // We need to calculate how many full rotations to add for realistic spinning
    // Plus the position that places our target number at the center
    const fullWheelLength = wheelNumbers.length * cellWidth;
    const fullRotations = 2 + Math.floor(Math.random() * 2); // 2-3 full rotations (reduced for smoother animation)
    
    // Calculate the target position:
    // - Use the middle sequence (sequence 3 of 5)
    // - Add the target number position within that sequence
    // - Calculate position such that the target number will be centered
    // - Add full rotations for realistic spin effect
    const middleSequenceIndex = Math.floor(sequenceMultiple/2);
    const targetNumberOffset = (targetIndex * cellWidth);
    const targetPosition = visibleCenterPosition - (middleSequenceIndex * fullWheelLength) - targetNumberOffset - (fullRotations * fullWheelLength);
    
    return targetPosition;
};

/**
 * Spin the wheel with predetermined outcome
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
    
    // Determine winner BEFORE animation starts
    state.targetNumber = rouletteGame.determineWinningNumber();
    
    // Calculate the target wheel position that will have this number in the center
    state.targetPosition = rouletteGame.calculateTargetPosition(state.targetNumber);
    
    // Set animation duration based on speed preference
    state.spinDuration = rouletteGame.ANIMATION.DURATION[state.animationSpeed];
    
    // Reset animation state
    state.spinInProgress = true;
    state.spinStartTime = performance.now();
    state.wheelPosition = 0; // Start position (centered)
    state.lastWinnings = 0;
    
    // Output message
    rouletteUI.output(rouletteUI.getText('spinningWheel'), false, 'info');
    
    // Create the initial wheel display
    rouletteUI.displaySpinAnimation(state);
    
    // Start animation
    rouletteGame.animateFrame();
};

/**
 * Animate a single frame of the wheel spin
 */
rouletteGame.animateFrame = function() {
    const state = rouletteGame.state;
    
    // Skip animation if requested (for testing)
    if (state.skipAnimation) {
        state.wheelPosition = state.targetPosition;
        rouletteUI.updateWheelPosition(state, true);
        setTimeout(() => rouletteGame.completeSpin(), 800);
        return;
    }
    
    // Save animation ID for pause/resume
    state.animationFrameId = requestAnimationFrame(rouletteGame.animateFrame);
    
    // Calculate progress (0 to 1)
    const currentTime = performance.now();
    const elapsedTime = currentTime - state.spinStartTime;
    let progress = Math.min(elapsedTime / state.spinDuration, 1);
    
    // Custom easing function for more realistic wheel physics
    // We want a fast start, longer middle section, and controlled ending
    let easedProgress;
    
    if (progress < 0.2) {
        // Fast start (accelerating)
        easedProgress = progress * 5 * 0.2; // 0 to 0.2
    } else if (progress < 0.7) {
        // Middle constant speed (max velocity)
        easedProgress = 0.2 + (progress - 0.2) * (0.7 / 0.5); // 0.2 to 0.7
    } else {
        // Gradual slowdown (deceleration)
        const slowingFactor = 1 - Math.pow(1 - ((progress - 0.7) / 0.3), 2);
        easedProgress = 0.7 + (slowingFactor * 0.3); // 0.7 to 1.0
    }
    
    // Calculate current position based on progress
    state.wheelPosition = state.targetPosition * easedProgress;
    
    // Update UI with new position
    rouletteUI.updateWheelPosition(state);
    
    // When animation completes
    if (progress >= 1) {
        // Cancel animation
        cancelAnimationFrame(state.animationFrameId);
        state.animationFrameId = null;
        
        // Force exact final position to ensure the target number is centered
        state.wheelPosition = state.targetPosition;
        rouletteUI.updateWheelPosition(state, true);
        
        // Small delay before showing result for dramatic effect
        setTimeout(() => rouletteGame.completeSpin(), 800);
    }
};

/**
 * Complete the spin and process results
 */
rouletteGame.completeSpin = function() {
    const state = rouletteGame.state;
    
    // Set last number to the predetermined target
    state.lastNumber = state.targetNumber;
    
    // Add to history
    state.spinHistory.unshift({
        number: state.lastNumber,
        color: rouletteGame.NUMBER_COLORS[state.lastNumber]
    });
    
    // Keep only last 10 spins
    if (state.spinHistory.length > 10) {
        state.spinHistory = state.spinHistory.slice(0, 10);
    }
    
    // Display result
    rouletteUI.displaySpinResult(state.lastNumber);
    
    // Process bets
    rouletteGame.processBets();
    
    // Store current bets for repeat functionality before clearing them
    state.lastBets = JSON.parse(JSON.stringify(state.bets)); // Deep copy
    
    // Clear bets
    state.bets = [];
    
    // End spin
    state.spinInProgress = false;
    
    // Update the high score
    if (state.money > state.maxMoney) {
        state.maxMoney = state.money;
    }
    
    // Check for bankruptcy
    if (state.money <= 0) {
        rouletteUI.output(rouletteUI.getText('outOfMoney'), false, 'error');
        
        // Check for high score
        if (rouletteLeaderboard.checkHighScore(state.maxMoney)) {
            rouletteLeaderboard.promptForUsername(state.maxMoney);
        }
        
        // Reset max money for next game
        state.maxMoney = rouletteGame.DEFAULT_SETTINGS.money;
    } else {
        // Prompt for new bets
        rouletteUI.output(rouletteUI.getText('placeMoreBets'), false, 'info');
    }
    
    // Save game state
    rouletteGame.saveState();
};

/**
 * Process all bets against the result
 */
rouletteGame.processBets = function() {
    const state = rouletteGame.state;
    const winningNumber = state.lastNumber;
    let totalWinnings = 0;
    
    // Process each bet
    state.bets.forEach(bet => {
        const betType = bet.type;
        const betNumbers = bet.numbers;
        const betAmount = bet.amount;
        let win = false;
        
        // Check if bet is a winner based on bet type
        if (betType === 'STRAIGHT' || betType === 'SPLIT' || 
            betType === 'STREET' || betType === 'CORNER' || 
            betType === 'LINE') {
            // These bet types win if the winning number is in the covered numbers
            win = betNumbers.includes(winningNumber);
        } else if (betType === 'COLUMN') {
            // Column bets: 1st (1,4,7,...,34), 2nd (2,5,8,...,35), 3rd (3,6,9,...,36)
            if (winningNumber > 0) { // 0 is not in any column
                const column = (winningNumber % 3 === 0) ? 3 : winningNumber % 3;
                win = betNumbers[0] === column;
            }
        } else if (betType === 'DOZEN') {
            // Dozen bets: 1st (1-12), 2nd (13-24), 3rd (25-36)
            if (winningNumber >= 1 && winningNumber <= 36) {
                const dozen = Math.ceil(winningNumber / 12);
                win = betNumbers[0] === dozen;
            }
        } else if (betType === 'RED') {
            win = rouletteGame.NUMBER_COLORS[winningNumber] === 'red';
        } else if (betType === 'BLACK') {
            win = rouletteGame.NUMBER_COLORS[winningNumber] === 'black';
        } else if (betType === 'ODD') {
            win = winningNumber !== 0 && winningNumber % 2 === 1;
        } else if (betType === 'EVEN') {
            win = winningNumber !== 0 && winningNumber % 2 === 0;
        } else if (betType === 'HIGH') {
            win = winningNumber >= 19 && winningNumber <= 36;
        } else if (betType === 'LOW') {
            win = winningNumber >= 1 && winningNumber <= 18;
        }
        
        // Calculate winnings if bet won
        if (win) {
            const payout = rouletteGame.BET_TYPES[betType].payout;
            const winnings = betAmount * (payout + 1); // Original bet + winnings
            totalWinnings += winnings;
            
            rouletteUI.output(
                rouletteUI.getText(
                    'betWon', 
                    rouletteGame.BET_TYPES[betType].name,
                    betNumbers.join(', '), 
                    winnings
                ),
                false, 
                'success'
            );
        }
    });
    
    // Update money and display
    if (totalWinnings > 0) {
        state.money += totalWinnings;
        state.lastWinnings = totalWinnings;
        rouletteUI.output(rouletteUI.getText('totalWinnings', totalWinnings), false, 'success');
    } else {
        rouletteUI.output(rouletteUI.getText('noBetsWon'), false, 'error');
    }
    
    // Clear bets
    state.bets = [];
    
    // Update game state display
    rouletteUI.displayGameState();
};

/**
 * Clear all current bets
 */
rouletteGame.clearBets = function() {
    const state = rouletteGame.state;
    
    if (state.spinInProgress) {
        rouletteUI.output(rouletteUI.getText('cantClearBetsDuringSpin'), false, 'error');
        return;
    }
    
    if (state.bets.length === 0) {
        rouletteUI.output(rouletteUI.getText('noBetsToClear'), false, 'info');
        return;
    }
    
    // Refund all bet amounts
    let totalRefund = 0;
    state.bets.forEach(bet => {
        totalRefund += bet.amount;
    });
    
    state.money += totalRefund;
    state.bets = [];
    
    rouletteUI.output(rouletteUI.getText('betsCleared', totalRefund), false, 'info');
    rouletteUI.displayGameState();
};

/**
 * Reset the game state for a new session
 */
rouletteGame.resetGame = function() {
    const state = rouletteGame.state;
    
    // Don't reset during a spin
    if (state.spinInProgress) {
        rouletteUI.output(rouletteUI.getText('cantResetDuringSpin'), false, 'error');
        return;
    }
    
    // Cancel any pending animation
    if (state.animationFrameId) {
        cancelAnimationFrame(state.animationFrameId);
        state.animationFrameId = null;
    }
    
    // Reset money to default
    state.money = rouletteGame.DEFAULT_SETTINGS.money;
    state.bets = [];
    state.lastBets = []; // Also clear last bets
    state.spinHistory = [];
    state.lastNumber = null;
    state.lastWinnings = 0;
    state.maxMoney = rouletteGame.DEFAULT_SETTINGS.maxMoney;
    state.firstGame = true;
    
    rouletteUI.output(rouletteUI.getText('gameReset'), false, 'info');
    rouletteUI.displayGameState();
    rouletteGame.saveState();
};