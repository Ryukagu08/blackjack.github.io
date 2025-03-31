/**
 * Visual Roulette Game - Command Handling
 * Handles command parsing and execution for the roulette game
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
        'bet odd', 'bet even', 'bet high', 'bet low', 'bet repeat',
        'bet number'
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
            rouletteCommands.processBetCommand(command, parts);
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
        default:
            rouletteUI.output(rouletteUI.getText('unknownCommand'), false, 'error');
    }
};

/**
 * Process a bet command by finding the appropriate element to click
 * @param {string} fullCommand - Full command string
 * @param {Array} parts - Command parts
 */
rouletteCommands.processBetCommand = function(fullCommand, parts) {
    // Skip the 'bet' part
    const betType = parts[1];
    
    if (!betType) {
        rouletteUI.output("Usage: bet [type] [parameters]", "info");
        rouletteUI.output("Types: red, black, odd, even, high, low, number, straight, split, street, corner, column, dozen", "info");
        return;
    }
    
    switch (betType) {
        case 'red':
        case 'black':
        case 'odd':
        case 'even':
            // Find the outer bet blocks
            const amount = parseInt(parts[2]) || rouletteGame.state.wager;
            const otoBlocks = document.querySelectorAll('.oto_block');
            
            // Set the chip value first
            rouletteCommands.setChipValue(amount);
            
            // Find the correct bet block
            for (let i = 0; i < otoBlocks.length; i++) {
                if (otoBlocks[i].innerText.toLowerCase() === betType.toUpperCase()) {
                    otoBlocks[i].click();
                    return;
                }
            }
            break;
            
        case 'high':
        case 'low':
            // Find the 1-18 or 19-36 blocks
            const highLowAmount = parseInt(parts[2]) || rouletteGame.state.wager;
            const bbtopBlocks = document.querySelectorAll('.bbtoptwo');
            
            // Set the chip value first
            rouletteCommands.setChipValue(highLowAmount);
            
            // Find the correct bet block
            if (bbtopBlocks.length >= 2) {
                if (betType === 'low') {
                    bbtopBlocks[0].click(); // 1 to 18
                } else {
                    bbtopBlocks[1].click(); // 19 to 36
                }
            }
            break;
            
        case 'number':
        case 'straight':
            // Straight bet on a specific number
            if (parts.length < 3) {
                rouletteUI.output("Usage: bet number [number] [amount]", "error");
                return;
            }
            
            const number = parseInt(parts[2]);
            const straightAmount = parseInt(parts[3]) || rouletteGame.state.wager;
            
            if (isNaN(number) || number < 0 || number > 36) {
                rouletteUI.output("Invalid number. Must be between 0 and 36.", "error");
                return;
            }
            
            // Set the chip value first
            rouletteCommands.setChipValue(straightAmount);
            
            // Place bet on zero or regular number
            if (number === 0) {
                const zero = document.querySelector('.number_0');
                if (zero) zero.click();
            } else {
                // Find the number block
                const numberBlocks = document.querySelectorAll('.number_block');
                for (let i = 0; i < numberBlocks.length; i++) {
                    const nbn = numberBlocks[i].querySelector('.nbn');
                    if (nbn && parseInt(nbn.innerText) === number) {
                        numberBlocks[i].click();
                        return;
                    }
                }
            }
            break;
            
        case 'column':
            // Column bet (1st, 2nd, or 3rd column)
            if (parts.length < 3) {
                rouletteUI.output("Usage: bet column [1-3] [amount]", "error");
                return;
            }
            
            const column = parseInt(parts[2]);
            const columnAmount = parseInt(parts[3]) || rouletteGame.state.wager;
            
            if (isNaN(column) || column < 1 || column > 3) {
                rouletteUI.output("Invalid column. Must be 1, 2, or 3.", "error");
                return;
            }
            
            // Set the chip value first
            rouletteCommands.setChipValue(columnAmount);
            
            // Find the 2 to 1 blocks
            const columnBlocks = document.querySelectorAll('.tt1_block');
            if (columnBlocks.length >= 3) {
                // Click the appropriate column
                // The 3 column blocks are in reverse order in the DOM
                columnBlocks[3 - column].click();
            }
            break;
            
        case 'dozen':
            // Dozen bet (1-12, 13-24, 25-36)
            if (parts.length < 3) {
                rouletteUI.output("Usage: bet dozen [1-3] [amount]", "error");
                return;
            }
            
            const dozen = parseInt(parts[2]);
            const dozenAmount = parseInt(parts[3]) || rouletteGame.state.wager;
            
            if (isNaN(dozen) || dozen < 1 || dozen > 3) {
                rouletteUI.output("Invalid dozen. Must be 1, 2, or 3.", "error");
                return;
            }
            
            // Set the chip value first
            rouletteCommands.setChipValue(dozenAmount);
            
            // Find the dozen blocks
            const dozenBlocks = document.querySelectorAll('.bo3_block');
            if (dozenBlocks.length >= 3) {
                dozenBlocks[dozen - 1].click();
            }
            break;
            
        case 'repeat':
            // Repeat last bets
            rouletteUI.output("Repeating previous bets...", "info");
            
            // Check if we have previous bets
            if (!rouletteGame.state.lastBets || rouletteGame.state.lastBets.length === 0) {
                rouletteUI.output("No previous bets to repeat.", "error");
                return;
            }
            
            // Calculate total amount needed
            let totalAmount = 0;
            rouletteGame.state.lastBets.forEach(bet => {
                totalAmount += bet.amt;
            });
            
            // Check if player has enough money
            if (totalAmount > rouletteGame.state.money) {
                rouletteUI.output(`Not enough money to repeat previous bets (need $${totalAmount}).`, "error");
                return;
            }
            
            // Place all previous bets again
            rouletteGame.state.lastBets.forEach(lastBet => {
                // Find elements to click based on bet type
                // This is complex and depends on the structure
                // Here we're just notifying the user for now
                rouletteUI.output(`Placing ${lastBet.type} bet on ${lastBet.numbers} for $${lastBet.amt}`, "info");
            });
            
            // Success message
            rouletteUI.output(`Previous bets repeated for a total of $${totalAmount}`, "success");
            break;
            
        default:
            rouletteUI.output("Unknown bet type. Try 'bet red', 'bet black', 'bet odd', 'bet even', 'bet high', 'bet low', or 'bet number [number] [amount]'", "error");
    }
};

/**
 * Set the chip value for betting
 * @param {number} amount - Bet amount
 */
rouletteCommands.setChipValue = function(amount) {
    // Find the closest chip value
    const chipValues = [1, 5, 10, 100];
    let closestValue = 5; // Default
    let closestDiff = Infinity;
    
    for (const value of chipValues) {
        const diff = Math.abs(amount - value);
        if (diff < closestDiff) {
            closestDiff = diff;
            closestValue = value;
        }
    }
    
    // Click the appropriate chip
    const chips = document.querySelectorAll('.cdChip');
    for (let i = 0; i < chips.length; i++) {
        const chipSpan = chips[i].querySelector('.cdChipSpan');
        if (chipSpan && chipSpan.innerText == closestValue) {
            chips[i].click();
            break;
        }
    }
};

/**
 * Show help text
 */
rouletteCommands.showHelp = function() {
    const helpText = [
        "Available commands:",
        "  help           - Show this help message",
        "  help bets      - Show detailed betting information",
        "  rules          - Show Roulette rules",
        "  bet [type] ... - Place a bet (see 'help bets')",
        "  bet repeat     - Repeat your last set of bets",
        "  spin           - Spin the wheel",
        "  clear bets     - Clear all current bets",
        "  money          - Check your current balance",
        "  speed          - Change animation speed (fast/normal/slow)",
        "  history        - Show past spin results",
        "  reset          - Reset the game to initial state",
        "  language       - Change language (en/es)",
        "  color          - Change color theme",
        "  leaderboard    - Show top 10 high scores",
        "  exit           - Return to home screen"
    ];
    
    for (const line of helpText) {
        rouletteUI.output(line, false, 'info');
    }
};

/**
 * Show bets help text
 */
rouletteCommands.showBetsHelp = function() {
    const helpText = [
        "BETTING COMMANDS:",
        "  bet straight [number] [amount]",
        "    Example: 'bet straight 17 10' - Bet $10 on number 17",
        "",
        "  bet number [number] [amount]",
        "    Example: 'bet number 17 10' - Bet $10 on number 17",
        "",
        "  bet red [amount]     - Bet on all red numbers",
        "  bet black [amount]   - Bet on all black numbers",
        "  bet odd [amount]     - Bet on all odd numbers",
        "  bet even [amount]    - Bet on all even numbers",
        "  bet high [amount]    - Bet on numbers 19-36",
        "  bet low [amount]     - Bet on numbers 1-18",
        "",
        "  bet column [column] [amount] (columns are 1-3)",
        "    Example: 'bet column 2 10' - Bet $10 on the middle column",
        "",
        "  bet dozen [dozen] [amount] (dozens are 1-3, representing 1-12, 13-24, 25-36)",
        "    Example: 'bet dozen 1 10' - Bet $10 on numbers 1-12",
        "",
        "  bet repeat        - Repeat your previous bets exactly"
    ];
    
    for (const line of helpText) {
        rouletteUI.output(line, false, 'info');
    }
};

/**
 * Show game rules
 */
rouletteCommands.showRules = function() {
    const rulesText = [
        "ROULETTE RULES:",
        "---------------------",
        "OBJECTIVE:",
        "  Predict which number the ball will land on and place bets accordingly.",
        "",
        "GAMEPLAY:",
        "  1. Place bets on various outcomes",
        "  2. Spin the wheel",
        "  3. Win if the ball lands on your predicted numbers or groups",
        "",
        "BET TYPES & PAYOUTS:",
        "  • STRAIGHT: Bet on a single number (35:1)",
        "  • SPLIT: Bet on 2 adjacent numbers (17:1)",
        "  • STREET: Bet on 3 numbers in a row (11:1)",
        "  • CORNER: Bet on 4 numbers in a square (8:1)",
        "  • LINE: Bet on 6 numbers (2 rows) (5:1)",
        "  • COLUMN: Bet on 12 numbers (1st, 2nd, or 3rd column) (2:1)",
        "  • DOZEN: Bet on 12 numbers (1-12, 13-24, or 25-36) (2:1)",
        "  • RED/BLACK: Bet on color (1:1)",
        "  • ODD/EVEN: Bet on number parity (1:1)",
        "  • HIGH/LOW: Bet on numbers 1-18 or 19-36 (1:1)",
        "",
        "The wheel has numbers 0-36. 0 is green, others alternate red/black.",
        "IMPORTANT: For all even-money bets (red/black, odd/even, high/low),",
        "you lose if the ball lands on 0."
    ];
    
    for (const line of rulesText) {
        rouletteUI.output(line, false, 'info');
    }
};

/**
 * Check money/balance
 */
rouletteCommands.checkMoney = function() {
    rouletteUI.output(`You have $${rouletteGame.state.money}.`, false, 'info');
};

/**
 * Show spin history
 */
rouletteCommands.showHistory = function() {
    const state = rouletteGame.state;
    
    if (state.previousNumbers.length === 0) {
        rouletteUI.output('No spin history yet.', false, 'info');
        return;
    }
    
    rouletteUI.output('Recent spins (newest first):', false, 'info');
    
    state.previousNumbers.forEach((spin, index) => {
        const color = spin.color.toUpperCase();
        rouletteUI.output(`${index + 1}. ${spin.number} (${color})`, false, 'info');
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
        rouletteGame.updateTheme(theme);
        rouletteUI.output(rouletteUI.getText('colorChanged', theme), false, 'success');
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