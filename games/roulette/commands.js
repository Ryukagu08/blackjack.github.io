/**
 * Roulette Game Module - Command Handling
 */

// Create roulette commands namespace
const rouletteCommands = window.rouletteCommands = {};

/**
 * Setup command handling
 */
rouletteCommands.setupCommandHandling = function() {
    const inputElement = document.getElementById('roulette-command-input');
    if (!inputElement) return;
    
    // Command history with persistent storage
    let commandHistory = [];
    let historyIndex = -1;
    
    // Try to load command history from localStorage
    try {
        const savedHistory = localStorage.getItem('rouletteCommandHistory');
        if (savedHistory) {
            commandHistory = JSON.parse(savedHistory);
        }
    } catch (e) {
        console.error('Error loading command history:', e);
    }
    
    // Function to ensure the input is visible
    const ensureInputVisible = () => {
        // Make sure the terminal is scrolled to show the input
        const outputElement = document.getElementById('roulette-output');
        if (outputElement) {
            outputElement.scrollTop = outputElement.scrollHeight;
        }
    };
    
    // Add event listener for input
    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && inputElement.value.trim()) {
            const command = inputElement.value.trim();
            rouletteCommands.processCommand(command);
            
            // Add to history if not duplicate of last command
            if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== command) {
                // Limit history to 50 commands
                if (commandHistory.length >= 50) {
                    commandHistory.shift(); // Remove oldest command
                }
                commandHistory.push(command);
                // Save to localStorage
                localStorage.setItem('rouletteCommandHistory', JSON.stringify(commandHistory));
            }
            
            historyIndex = commandHistory.length;
            inputElement.value = '';
            
            // Ensure the input field is visible after command execution
            setTimeout(ensureInputVisible, 50);
            
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
                const completion = rouletteCommands.autocomplete(partialCommand);
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
    const terminal = document.getElementById('roulette-output');
    if (terminal) {
        terminal.addEventListener('click', (event) => {
            // Only focus if user clicked directly on the terminal (not on a child element)
            if (event.target === terminal) {
                inputElement.focus();
                ensureInputVisible();
            }
        });
    }
    
    // Only focus input initially, but don't force it afterwards
    inputElement.focus();
    
    // Ensure input is visible on page load or game start
    setTimeout(ensureInputVisible, 100);
};

/**
 * Command autocompletion
 * @param {string} partial - Partial command to complete
 * @returns {string|null} Completed command or null if no match
 */
rouletteCommands.autocomplete = function(partial) {
    const commands = [
        'help', 'rules', 'bet', 'spin', 'clear', 'money', 'speed',
        'history', 'reset', 'language', 'color', 'leaderboard', 'exit'
    ];
    
    // For bet commands, add specific bet types
    const betCommands = [
        'bet straight', 'bet split', 'bet street', 'bet corner',
        'bet line', 'bet column', 'bet dozen', 'bet red', 'bet black',
        'bet odd', 'bet even', 'bet high', 'bet low', 'bet repeat'
    ];
    
    // Check if partial command starts with "bet"
    if (partial.startsWith('bet ')) {
        const betPartial = partial;
        const betMatches = betCommands.filter(cmd => cmd.startsWith(betPartial));
        
        if (betMatches.length === 1) {
            return betMatches[0];
        } else if (betMatches.length > 1) {
            // Display available bet options
            rouletteUI.output(`Matching bet commands: ${betMatches.join(', ')}`, false, 'info');
            return null;
        }
    }
    
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
            rouletteUI.output(`Matching commands: ${matches.join(', ')}`, false, 'info');
            return null;
        }
    }
    
    return null;
};

/**
 * Process a command
 * @param {string} command - The command to process
 */
rouletteCommands.processCommand = function(command) {
    const state = rouletteGame.state;
    
    // Echo command
    rouletteUI.output(`> ${command}`, false, 'cmd');
    
    // Check if we're waiting for a username for high score
    if (state.waitingForUsername) {
        // Validate username (non-empty, max 15 chars)
        const username = command.trim().substring(0, 15);
        if (username) {
            // Add to leaderboard
            rouletteLeaderboard.addHighScore(username, state.highScore);
            rouletteUI.output(rouletteUI.getText('highScoreAdded'), false, 'success');
            state.waitingForUsername = false;
            
            // Show the leaderboard after adding
            setTimeout(() => {
                rouletteCommands.showLeaderboard();
            }, 500);
        } else {
            // Invalid username, prompt again
            rouletteLeaderboard.promptForUsername(state.highScore);
        }
        return;
    }
    
    // Parse command
    const parts = command.trim().toLowerCase().split(' ');
    const cmd = parts[0];
    
    // Process command
    switch (cmd) {
        case 'help':
            if (parts[1] === 'bets') {
                rouletteCommands.showBetsHelp();
            } else {
                rouletteCommands.showHelp();
            }
            break;
        case 'rules':
            rouletteCommands.showRules();
            break;
        case 'bet':
            if (parts[1] === 'repeat') {
                rouletteCommands.repeatLastBets();
            } else {
                rouletteCommands.processBetCommand(parts.slice(1));
            }
            break;
        case 'spin':
            rouletteGame.spin();
            break;
        case 'clear':
            if (parts[1] === 'bets') {
                rouletteGame.clearBets();
            } else {
                rouletteUI.displayGameState();
            }
            break;
        case 'money':
            rouletteCommands.checkMoney();
            break;
        case 'speed':
            rouletteGame.setAnimationSpeed(parts[1]);
            break;
        case 'history':
            rouletteCommands.showHistory();
            break;
        case 'reset':
            rouletteGame.resetGame();
            break;
        case 'language':
            rouletteCommands.changeLanguage(parts[1]);
            break;
        case 'color':
            rouletteCommands.changeColor(parts[1]);
            break;
        case 'leaderboard':
            rouletteCommands.showLeaderboard();
            break;
        case 'exit':
            if (state.exitCallback) {
                state.exitCallback();
            }
            break;
        // Hidden debug command - useful for testing
        case 'debug':
            if (parts[1] === 'skipanimation') {
                state.skipAnimation = parts[2] === 'on';
                rouletteUI.output(`Animation skip mode: ${state.skipAnimation ? 'ON' : 'OFF'}`, false, 'info');
            }
            break;
        default:
            rouletteUI.output(rouletteUI.getText('unknownCommand'), false, 'error');
    }
};

/**
 * Repeat the last set of bets
 */
rouletteCommands.repeatLastBets = function() {
    const state = rouletteGame.state;
    
    // Check if spin is in progress
    if (state.spinInProgress) {
        rouletteUI.output(rouletteUI.getText('spinInProgress'), false, 'error');
        return;
    }
    
    // Check if there are any previous bets to repeat
    if (!state.lastBets || state.lastBets.length === 0) {
        rouletteUI.output(rouletteUI.getText('noPreviousBets'), false, 'error');
        return;
    }
    
    // Calculate total bet amount
    let totalAmount = 0;
    state.lastBets.forEach(bet => {
        totalAmount += bet.amount;
    });
    
    // Check if player has enough money
    if (totalAmount > state.money) {
        rouletteUI.output(rouletteUI.getText('notEnoughMoneyForRepeat', totalAmount), false, 'error');
        return;
    }
    
    // Place all previous bets again
    state.lastBets.forEach(lastBet => {
        rouletteGame.placeBet(lastBet.type, [...lastBet.numbers], lastBet.amount);
    });
    
    // Success message
    rouletteUI.output(rouletteUI.getText('betsRepeated', totalAmount), false, 'success');
};

/**
 * Process bet command
 * @param {Array} args - Command arguments
 */
rouletteCommands.processBetCommand = function(args) {
    if (args.length === 0) {
        rouletteUI.output(rouletteUI.getText('availableBets'), false, 'info');
        return;
    }
    
    const betType = args[0].toUpperCase();
    let numbers = [];
    let amount = 0;
    
    // Parse based on bet type
    switch (betType) {
        case 'STRAIGHT':
            // bet straight [number] [amount]
            if (args.length < 3) {
                rouletteUI.output('Usage: bet straight [number] [amount]', false, 'error');
                return;
            }
            numbers = [parseInt(args[1])];
            amount = parseInt(args[2]);
            if (isNaN(numbers[0]) || numbers[0] < 0 || numbers[0] > 36) {
                rouletteUI.output('Invalid number. Must be 0-36.', false, 'error');
                return;
            }
            break;
        
        case 'SPLIT':
            // bet split [number1] [number2] [amount]
            if (args.length < 4) {
                rouletteUI.output('Usage: bet split [number1] [number2] [amount]', false, 'error');
                return;
            }
            numbers = [parseInt(args[1]), parseInt(args[2])];
            amount = parseInt(args[3]);
            if (isNaN(numbers[0]) || isNaN(numbers[1]) || 
                numbers[0] < 0 || numbers[0] > 36 || 
                numbers[1] < 0 || numbers[1] > 36) {
                rouletteUI.output('Invalid numbers. Must be 0-36.', false, 'error');
                return;
            }
            // Check if the numbers are adjacent
            const isAdjacent = rouletteCommands.areNumbersAdjacent(numbers[0], numbers[1]);
            if (!isAdjacent) {
                rouletteUI.output('Split bet requires adjacent numbers.', false, 'error');
                return;
            }
            break;
        
        case 'STREET':
            // bet street [row] [amount]
            if (args.length < 3) {
                rouletteUI.output('Usage: bet street [row] [amount]', false, 'error');
                return;
            }
            const row = parseInt(args[1]);
            amount = parseInt(args[2]);
            if (isNaN(row) || row < 1 || row > 12) {
                rouletteUI.output('Invalid row. Must be 1-12.', false, 'error');
                return;
            }
            // Calculate the three numbers in the row
            const startNum = (row - 1) * 3 + 1;
            numbers = [startNum, startNum + 1, startNum + 2];
            break;
        
        case 'CORNER':
            // bet corner [number] [amount]
            if (args.length < 3) {
                rouletteUI.output('Usage: bet corner [number] [amount]', false, 'error');
                return;
            }
            const corner = parseInt(args[1]);
            amount = parseInt(args[2]);
            if (isNaN(corner) || corner < 1 || corner > 32 || corner % 3 === 0) {
                rouletteUI.output('Invalid corner number.', false, 'error');
                return;
            }
            // Calculate the four numbers in the corner
            if (corner % 3 === 1) { // Left edge
                numbers = [corner, corner + 1, corner + 3, corner + 4];
            } else { // Right edge (corner % 3 === 2)
                numbers = [corner, corner + 1, corner + 3, corner + 4];
            }
            break;
        
        case 'LINE':
            // bet line [row] [amount]
            if (args.length < 3) {
                rouletteUI.output('Usage: bet line [row] [amount]', false, 'error');
                return;
            }
            const lineRow = parseInt(args[1]);
            amount = parseInt(args[2]);
            if (isNaN(lineRow) || lineRow < 1 || lineRow > 11) {
                rouletteUI.output('Invalid row. Must be 1-11.', false, 'error');
                return;
            }
            // Calculate the six numbers (two rows)
            const lineStart = (lineRow - 1) * 3 + 1;
            numbers = [
                lineStart, lineStart + 1, lineStart + 2,
                lineStart + 3, lineStart + 4, lineStart + 5
            ];
            break;
        
        case 'COLUMN':
            // bet column [column] [amount]
            if (args.length < 3) {
                rouletteUI.output('Usage: bet column [column] [amount]', false, 'error');
                return;
            }
            const column = parseInt(args[1]);
            amount = parseInt(args[2]);
            if (isNaN(column) || column < 1 || column > 3) {
                rouletteUI.output('Invalid column. Must be 1-3.', false, 'error');
                return;
            }
            // Column bet is stored as a single number representing the column
            numbers = [column];
            break;
        
        case 'DOZEN':
            // bet dozen [dozen] [amount]
            if (args.length < 3) {
                rouletteUI.output('Usage: bet dozen [dozen] [amount]', false, 'error');
                return;
            }
            const dozen = parseInt(args[1]);
            amount = parseInt(args[2]);
            if (isNaN(dozen) || dozen < 1 || dozen > 3) {
                rouletteUI.output('Invalid dozen. Must be 1-3.', false, 'error');
                return;
            }
            // Dozen bet is stored as a single number representing the dozen
            numbers = [dozen];
            break;
        
        case 'RED':
        case 'BLACK':
        case 'ODD':
        case 'EVEN':
        case 'HIGH':
        case 'LOW':
            // Simple outside bets: bet [type] [amount]
            if (args.length < 2) {
                rouletteUI.output(`Usage: bet ${betType.toLowerCase()} [amount]`, false, 'error');
                return;
            }
            amount = parseInt(args[1]);
            // For these bets, the numbers array can be empty as the type defines the bet
            numbers = [];
            break;
        
        default:
            rouletteUI.output(rouletteUI.getText('invalidBetType'), false, 'error');
            return;
    }
    
    // Place the bet
    rouletteGame.placeBet(betType, numbers, amount);
};

/**
 * Check if two numbers are adjacent on the roulette table
 * @param {number} num1 - First number
 * @param {number} num2 - Second number
 * @returns {boolean} Whether the numbers are adjacent
 */
rouletteCommands.areNumbersAdjacent = function(num1, num2) {
    // Zero is only adjacent to 1, 2, and 3
    if (num1 === 0) {
        return [1, 2, 3].includes(num2);
    }
    if (num2 === 0) {
        return [1, 2, 3].includes(num1);
    }
    
    // Regular numbers are adjacent horizontally, vertically, or diagonally
    const row1 = Math.ceil(num1 / 3);
    const col1 = ((num1 - 1) % 3) + 1;
    const row2 = Math.ceil(num2 / 3);
    const col2 = ((num2 - 1) % 3) + 1;
    
    // Check if they're horizontally or vertically adjacent
    return (Math.abs(row1 - row2) <= 1 && Math.abs(col1 - col2) <= 1);
};

/**
 * Show help text
 */
rouletteCommands.showHelp = function() {
    const helpText = rouletteUI.getText('helpText');
    for (const line of helpText) {
        rouletteUI.output(line, false, 'info');
    }
};

/**
 * Show bets help text
 */
rouletteCommands.showBetsHelp = function() {
    const helpText = rouletteUI.getText('helpBetsText');
    for (const line of helpText) {
        rouletteUI.output(line, false, 'info');
    }
};

/**
 * Show game rules
 */
rouletteCommands.showRules = function() {
    const rulesText = rouletteUI.getText('rulesText');
    for (const line of rulesText) {
        rouletteUI.output(line, false, 'info');
    }
};

/**
 * Check money/balance
 */
rouletteCommands.checkMoney = function() {
    rouletteUI.output(rouletteUI.getText('moneyStatus', rouletteGame.state.money), false, 'info');
};

/**
 * Show spin history
 */
rouletteCommands.showHistory = function() {
    const state = rouletteGame.state;
    
    if (state.spinHistory.length === 0) {
        rouletteUI.output('No spin history yet.', false, 'info');
        return;
    }
    
    rouletteUI.output('Recent spins (newest first):', false, 'info');
    
    state.spinHistory.forEach((spin, index) => {
        const color = rouletteGame.NUMBER_COLORS[spin.number];
        rouletteUI.output(`${index + 1}. ${spin.number} (${color.toUpperCase()})`, false, 'info');
    });
};

/**
 * Change language
 * @param {string} lang - Language code (en/es)
 */
rouletteCommands.changeLanguage = function(lang) {
    if (lang && (lang === 'en' || lang === 'es')) {
        rouletteGame.state.language = lang;
        rouletteUI.output(rouletteUI.getText('languageChanged'), false, 'success');
        rouletteGame.saveState();
    } else {
        rouletteUI.output(rouletteUI.getText('languageOptions'), false, 'info');
    }
};

/**
 * Change color theme
 * @param {string} theme - Color theme name
 */
rouletteCommands.changeColor = function(theme) {
    const validThemes = ['green', 'blue', 'amber', 'white', 'red', 'purple', 'cyan', 'orange', 'pink'];
    
    if (theme && validThemes.includes(theme)) {
        rouletteGame.state.colorTheme = theme;
        rouletteUI.applyColorTheme(theme);
        rouletteUI.output(rouletteUI.getText('colorChanged', theme), false, 'success');
        rouletteGame.saveState();
    } else {
        rouletteUI.output(rouletteUI.getText('colorOptions'), false, 'info');
    }
};

/**
 * Show leaderboard
 */
rouletteCommands.showLeaderboard = function() {
    // Display a loading message
    rouletteUI.output('Loading leaderboard...', false, 'info');
    
    // Give Firebase a moment to fetch data (if needed)
    setTimeout(() => {
        rouletteLeaderboard.displayLeaderboard();
    }, 300);
};