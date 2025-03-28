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
    
    // Command history with persistent storage
    let commandHistory = [];
    let historyIndex = -1;
    
    // Try to load command history from localStorage
    try {
        const savedHistory = localStorage.getItem('blackjackCommandHistory');
        if (savedHistory) {
            commandHistory = JSON.parse(savedHistory);
        }
    } catch (e) {
        console.error('Error loading command history:', e);
    }
    
    // Add event listener for input
    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && inputElement.value.trim()) {
            const command = inputElement.value.trim();
            blackjackCommands.processCommand(command);
            
            // Add to history if not duplicate of last command
            if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== command) {
                // Limit history to 50 commands
                if (commandHistory.length >= 50) {
                    commandHistory.shift(); // Remove oldest command
                }
                commandHistory.push(command);
                // Save to localStorage
                localStorage.setItem('blackjackCommandHistory', JSON.stringify(commandHistory));
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
        } else if (e.key === 'Tab') {
            // Command auto-completion
            e.preventDefault();
            const partialCommand = inputElement.value.trim().toLowerCase();
            if (partialCommand) {
                const completion = blackjackCommands.autocomplete(partialCommand);
                if (completion) {
                    inputElement.value = completion;
                    // Move cursor to end
                    setTimeout(() => {
                        inputElement.selectionStart = inputElement.selectionEnd = inputElement.value.length;
                    }, 0);
                }
            }
        } else if (e.key === 'Escape') {
            // Clear input
            inputElement.value = '';
            e.preventDefault();
        }
    });
    
    // Focus terminal when clicked, but don't force focus on input
    const terminal = document.getElementById('blackjack-output');
    if (terminal) {
        terminal.addEventListener('click', () => {
            // Only focus if user clicked directly on the terminal (not on a child element)
            if (event.target === terminal) {
                inputElement.focus();
            }
        });
    }
    
    // Let the browser handle placeholder text naturally
    
    // Only focus input initially, but don't force it afterwards
    inputElement.focus();
};

/**
 * Command autocompletion
 * @param {string} partial - Partial command to complete
 * @returns {string|null} Completed command or null if no match
 */
blackjackCommands.autocomplete = function(partial) {
    const commands = [
        'help', 'rules', 'bet', 'deal', 'hit', 'stand', 'double', 
        'split', 'insurance', 'surrender', 'money', 'clear', 
        'language', 'color', 'leaderboard', 'exit'
    ];
    
    // Find matching commands
    const matches = commands.filter(cmd => cmd.startsWith(partial));
    
    if (matches.length === 1) {
        // Single match - return the command
        return matches[0];
    } else if (matches.length > 1) {
        // Multiple matches - find longest common prefix
        let commonPrefix = matches[0];
        for (let i = 1; i < matches.length; i++) {
            let j = 0;
            while (j < commonPrefix.length && j < matches[i].length && 
                   commonPrefix[j] === matches[i][j]) {
                j++;
            }
            commonPrefix = commonPrefix.substring(0, j);
        }
        
        // If we have a longer common prefix than the partial command, return it
        if (commonPrefix.length > partial.length) {
            return commonPrefix;
        } else {
            // Otherwise, display available options
            blackjackUI.output(`Matching commands: ${matches.join(', ')}`, false, 'info');
            return null;
        }
    }
    
    return null;
};

/**
 * Process a command
 * @param {string} command - The command to process
 */
blackjackCommands.processCommand = function(command) {
    const state = blackjackGame.state;
    
    // Echo command
    blackjackUI.output(`> ${command}`, false, 'cmd');
    
    // Check if we're waiting for a username for high score
    if (state.waitingForUsername) {
        // Validate username (non-empty, max 15 chars)
        const username = command.trim().substring(0, 15);
        if (username) {
            // Add to leaderboard
            blackjackLeaderboard.addHighScore(username, state.highScore);
            blackjackUI.output(blackjackUI.getText('highScoreAdded'), false, 'success');
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
            blackjackUI.output(blackjackUI.getText('unknownCommand'), false, 'error');
    }
};

/**
 * Show help text
 */
blackjackCommands.showHelp = function() {
    const helpText = blackjackUI.getText('helpText');
    for (const line of helpText) {
        blackjackUI.output(line, false, 'info');
    }
};

/**
 * Show game rules
 */
blackjackCommands.showRules = function() {
    const rulesText = blackjackUI.getText('rulesText');
    for (const line of rulesText) {
        blackjackUI.output(line, false, 'info');
    }
};

/**
 * Place a bet
 * @param {string} amountStr - Bet amount as string
 */
blackjackCommands.placeBet = function(amountStr) {
    const state = blackjackGame.state;
    
    if (state.gameInProgress) {
        blackjackUI.output(blackjackUI.getText('gameInProgress'), false, 'error');
        return;
    }
    
    if (state.money <= 0) {
        blackjackUI.output(blackjackUI.getText('outOfMoney'), false, 'error');
        return;
    }
    
    // Validate bet amount
    const bet = parseInt(amountStr);
    if (isNaN(bet) || bet <= 0) {
        blackjackUI.output(blackjackUI.getText('invalidBet'), false, 'error');
        // Reset current bet if invalid to ensure it can't be used
        state.currentBet = 0;
        return;
    }
    
    if (bet > state.money) {
        blackjackUI.output(blackjackUI.getText('betTooHigh'), false, 'error');
        // Reset current bet
        state.currentBet = 0;
        return;
    }
    
    // Set valid bet
    state.currentBet = bet;
    blackjackUI.output(blackjackUI.getText('betPlaced', bet), false, 'success');
    
    // Auto-start unless first game
    if (!state.firstGame) {
        blackjackGame.startGame();
    } else {
        state.firstGame = false;
        blackjackUI.output(blackjackUI.getText('dealPrompt'), false, 'info');
    }
};

/**
 * Check money/balance
 */
blackjackCommands.checkMoney = function() {
    blackjackUI.output(blackjackUI.getText('moneyStatus', blackjackGame.state.money), false, 'info');
};

/**
 * Change language
 * @param {string} lang - Language code (en/es)
 */
blackjackCommands.changeLanguage = function(lang) {
    if (lang && (lang === 'en' || lang === 'es')) {
        blackjackGame.state.language = lang;
        blackjackUI.output(blackjackUI.getText('languageChanged'), false, 'success');
        blackjackGame.saveState();
    } else {
        blackjackUI.output(blackjackUI.getText('languageOptions'), false, 'info');
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
        blackjackUI.output(blackjackUI.getText('colorChanged', theme), false, 'success');
        blackjackGame.saveState();
    } else {
        blackjackUI.output(blackjackUI.getText('colorOptions'), false, 'info');
    }
};

/**
 * Show leaderboard
 */
blackjackCommands.showLeaderboard = function() {
    // Display a loading message
    blackjackUI.output('Loading leaderboard...', false, 'info');
    
    // Give Firebase a moment to fetch data (if needed)
    setTimeout(() => {
        blackjackLeaderboard.displayLeaderboard();
    }, 300);
};