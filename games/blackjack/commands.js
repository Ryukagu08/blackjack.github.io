/**
 * Blackjack Game Module - Command Handling
 */

// Create blackjack commands namespace
const blackjackCommands = window.blackjackCommands = {};

/**
 * Setup command handling
 */
blackjackCommands.setupCommandHandling = function() {
    const inputElement = document.getElementById('blackjack-command-input');
    if (!inputElement) return;
    
    // Command history
    const commandHistory = [];
    let historyIndex = -1;
    
    // Add event listener for input
    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && inputElement.value.trim()) {
            const command = inputElement.value.trim();
            blackjackCommands.processCommand(command);
            
            // Add to history if not duplicate of last command
            if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== command) {
                commandHistory.push(command);
            }
            
            historyIndex = commandHistory.length;
            inputElement.value = '';
            
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            // Navigate history up
            if (historyIndex > 0) {
                historyIndex--;
                inputElement.value = commandHistory[historyIndex];
                // Move cursor to end
                setTimeout(() => {
                    inputElement.selectionStart = inputElement.selectionEnd = inputElement.value.length;
                }, 0);
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            // Navigate history down
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                inputElement.value = commandHistory[historyIndex];
                // Move cursor to end
                setTimeout(() => {
                    inputElement.selectionStart = inputElement.selectionEnd = inputElement.value.length;
                }, 0);
            } else if (historyIndex === commandHistory.length - 1) {
                // Clear input at end of history
                historyIndex = commandHistory.length;
                inputElement.value = '';
            }
            e.preventDefault();
        }
    });
    
    // Focus input when terminal is clicked
    const terminal = document.getElementById('blackjack-output');
    if (terminal) {
        terminal.addEventListener('click', () => {
            inputElement.focus();
        });
    }
    
    // Ensure input is focused
    inputElement.focus();
};

/**
 * Process a command
 * @param {string} command - The command to process
 */
blackjackCommands.processCommand = function(command) {
    const state = blackjackGame.state;
    
    // Echo command
    blackjackUI.output(`> ${command}`);
    
    // Check if we're waiting for a username for high score
    if (state.waitingForUsername) {
        // Validate username (non-empty, max 15 chars)
        const username = command.trim().substring(0, 15);
        if (username) {
            // Add to leaderboard
            blackjackLeaderboard.addHighScore(username, state.highScore);
            blackjackUI.output(blackjackUI.getText('highScoreAdded'));
            state.waitingForUsername = false;
            
            // Show the leaderboard after adding
            setTimeout(() => {
                blackjackCommands.showLeaderboard();
            }, 500);
        } else {
            // Invalid username, prompt again
            blackjackLeaderboard.promptForUsername(state.highScore);
        }
        return;
    }
    
    // Parse command
    const parts = command.trim().toLowerCase().split(' ');
    const cmd = parts[0];
    const arg = parts[1];
    
    // Process command
    switch (cmd) {
        case 'help':
            blackjackCommands.showHelp();
            break;
        case 'rules':
            blackjackCommands.showRules();
            break;
        case 'bet':
            blackjackCommands.placeBet(arg);
            break;
        case 'deal':
            if (blackjackGame.isValidBet()) {
                blackjackGame.startGame();
            }
            break;
        case 'hit':
            blackjackGame.hit();
            break;
        case 'stand':
            blackjackGame.stand();
            break;
        case 'double':
            blackjackGame.doubleDown();
            break;
        case 'split':
            blackjackGame.splitHand();
            break;
        case 'insurance':
            blackjackGame.takeInsurance();
            break;
        case 'surrender':
            blackjackGame.surrender();
            break;
        case 'money':
            blackjackCommands.checkMoney();
            break;
        case 'clear':
            blackjackUI.displayWelcomeMessage();
            break;
        case 'language':
            blackjackCommands.changeLanguage(arg);
            break;
        case 'color':
            blackjackCommands.changeColor(arg);
            break;
        case 'leaderboard':
            blackjackCommands.showLeaderboard();
            break;
        case 'exit':
            if (state.exitCallback) {
                state.exitCallback();
            }
            break;
        default:
            blackjackUI.output(blackjackUI.getText('unknownCommand'));
    }
};

/**
 * Show help text
 */
blackjackCommands.showHelp = function() {
    const helpText = blackjackUI.getText('helpText');
    for (const line of helpText) {
        blackjackUI.output(line);
    }
};

/**
 * Show game rules
 */
blackjackCommands.showRules = function() {
    const rulesText = blackjackUI.getText('rulesText');
    for (const line of rulesText) {
        blackjackUI.output(line);
    }
};

/**
 * Place a bet
 * @param {string} amountStr - Bet amount as string
 */
blackjackCommands.placeBet = function(amountStr) {
    const state = blackjackGame.state;
    
    if (state.gameInProgress) {
        blackjackUI.output(blackjackUI.getText('gameInProgress'));
        return;
    }
    
    if (state.money <= 0) {
        blackjackUI.output(blackjackUI.getText('outOfMoney'));
        return;
    }
    
    // Validate bet amount
    const bet = parseInt(amountStr);
    if (isNaN(bet) || bet <= 0) {
        blackjackUI.output(blackjackUI.getText('invalidBet'));
        // Reset current bet if invalid to ensure it can't be used
        state.currentBet = 0;
        return;
    }
    
    if (bet > state.money) {
        blackjackUI.output(blackjackUI.getText('betTooHigh'));
        // Reset current bet
        state.currentBet = 0;
        return;
    }
    
    // Set valid bet
    state.currentBet = bet;
    blackjackUI.output(blackjackUI.getText('betPlaced', bet));
    
    // Auto-start unless first game
    if (!state.firstGame) {
        blackjackGame.startGame();
    } else {
        state.firstGame = false;
        blackjackUI.output(blackjackUI.getText('dealPrompt'));
    }
};

/**
 * Check money/balance
 */
blackjackCommands.checkMoney = function() {
    blackjackUI.output(blackjackUI.getText('moneyStatus', blackjackGame.state.money));
};

/**
 * Change language
 * @param {string} lang - Language code (en/es)
 */
blackjackCommands.changeLanguage = function(lang) {
    if (lang && (lang === 'en' || lang === 'es')) {
        blackjackGame.state.language = lang;
        blackjackUI.output(blackjackUI.getText('languageChanged'));
        blackjackGame.saveState();
    } else {
        blackjackUI.output(blackjackUI.getText('languageOptions'));
    }
};

/**
 * Change color theme
 * @param {string} theme - Color theme name
 */
blackjackCommands.changeColor = function(theme) {
    const validThemes = ['green', 'blue', 'amber', 'white', 'matrix'];
    
    if (theme && validThemes.includes(theme)) {
        blackjackGame.state.colorTheme = theme;
        blackjackUI.applyColorTheme(theme);
        blackjackUI.output(blackjackUI.getText('colorChanged', theme));
        blackjackGame.saveState();
    } else {
        blackjackUI.output(blackjackUI.getText('colorOptions'));
    }
};

/**
 * Show leaderboard
 */
blackjackCommands.showLeaderboard = function() {
    // Display a loading message
    blackjackUI.output('Loading leaderboard...');
    
    // Give Firebase a moment to fetch data (if needed)
    setTimeout(() => {
        blackjackLeaderboard.displayLeaderboard();
    }, 300);
};