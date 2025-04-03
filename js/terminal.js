/**
 * Terminal.js - Handles terminal input/output functionality
 */

class Terminal {
    constructor(inputId, outputId) {
        this.inputElement = document.getElementById(inputId);
        this.outputElement = outputId ? document.getElementById(outputId) : null;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.commands = {};
        
        // Fixed: Only check for inputElement existence, outputElement is optional
        if (!this.inputElement) {
            console.error(`Terminal input element not found: input=${inputId}`);
            return;
        }
        
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners for the terminal input
     */
    setupEventListeners() {
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autocomplete();
            }
        });
    }
    
    /**
     * Register available commands
     * @param {Object} commandsObj - Object with command names as keys and handler functions as values
     */
    registerCommands(commandsObj) {
        this.commands = { ...this.commands, ...commandsObj };
    }
    
    /**
     * Handle command input
     */
    handleCommand() {
        const commandText = this.inputElement.value.trim();
        
        if (!commandText) return;
        
        // Add to command history
        this.commandHistory.push(commandText);
        this.historyIndex = this.commandHistory.length;
        
        // Echo the command if output element exists
        if (this.outputElement) {
            this.print(`> ${commandText}`, 'command');
        }
        
        // Process command
        this.processCommand(commandText);
        
        // Clear input
        this.inputElement.value = '';
    }
    
    /**
     * Process a command
     * @param {string} commandText - The command to process
     */
    processCommand(commandText) {
        const args = commandText.split(' ');
        const cmd = args[0].toLowerCase();
        
        if (this.commands[cmd]) {
            this.commands[cmd](args.slice(1));
        } else if (this.outputElement) {
            this.print(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
        }
    }
    
    /**
     * Print text to the terminal output
     * @param {string} text - Text to display
     * @param {string} type - Type of message (default, command, error, success, info)
     */
    print(text, type = 'default') {
        // Skip if no output element exists
        if (!this.outputElement) return;
        
        const message = document.createElement('p');
        message.textContent = text;
        message.classList.add(`message-${type}`);
        
        // Apply styling based on message type
        switch (type) {
            case 'command':
                message.style.color = '#a0a0bf';
                break;
            case 'error':
                message.style.color = '#ff3860';
                break;
            case 'success':
                message.style.color = '#23d160';
                break;
            case 'info':
                message.style.color = '#5bc0de';
                break;
        }
        
        this.outputElement.appendChild(message);
        this.scrollToBottom();
    }
    
    /**
     * Scroll the output to the bottom
     */
    scrollToBottom() {
        if (this.outputElement) {
            this.outputElement.scrollTop = this.outputElement.scrollHeight;
        }
    }
    
    /**
     * Navigate through command history
     * @param {number} direction - Direction to navigate (-1 for up, 1 for down)
     */
    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;
        
        this.historyIndex += direction;
        
        // Clamp history index
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex > this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
        }
        
        // Set input value
        if (this.historyIndex === this.commandHistory.length) {
            this.inputElement.value = '';
        } else {
            this.inputElement.value = this.commandHistory[this.historyIndex];
        }
        
        // Move cursor to end
        setTimeout(() => {
            this.inputElement.selectionStart = this.inputElement.selectionEnd = this.inputElement.value.length;
        }, 0);
    }
    
    /**
     * Provide command autocompletion
     */
    autocomplete() {
        const input = this.inputElement.value.trim().toLowerCase();
        
        if (!input) return;
        
        const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(input));
        
        if (matches.length === 1) {
            // Single match, autocomplete
            this.inputElement.value = matches[0] + ' ';
        } else if (matches.length > 1 && this.outputElement) {
            // Multiple matches, show options
            this.print('Available commands:', 'info');
            matches.forEach(match => {
                this.print(`  ${match}`, 'info');
            });
        }
    }
    
    /**
     * Clear the terminal output
     */
    clear() {
        if (this.outputElement) {
            this.outputElement.innerHTML = '';
        }
    }
    
    /**
     * Focus the input element
     */
    focus() {
        this.inputElement.focus();
    }
}

// Main terminal system
const terminalSystem = {
    terminals: {},
    
    /**
     * Initialize a terminal
     * @param {string} id - Terminal identifier
     * @param {string} inputId - Terminal input element ID
     * @param {string} outputId - Terminal output element ID (optional)
     * @returns {Terminal} Terminal instance
     */
    init(id, inputId, outputId) {
        const terminal = new Terminal(inputId, outputId);
        this.terminals[id] = terminal;
        return terminal;
    },
    
    /**
     * Get a terminal instance by ID
     * @param {string} id - Terminal identifier
     * @returns {Terminal} Terminal instance
     */
    getTerminal(id) {
        return this.terminals[id];
    }
};

// Initialize welcome screen terminal
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with the proper output element
    const welcomeTerminal = terminalSystem.init('welcome', 'welcome-input', 'welcome-output');
    
    welcomeTerminal.registerCommands({
        'play': (args) => {
            if (args.length === 0) {
                welcomeTerminal.print('Please specify a game to play. Example: play blackjack', 'error');
                return;
            }
            
            const game = args[0].toLowerCase();
            
            if (game === 'blackjack') {
                // Switch to blackjack screen
                document.getElementById('welcome-screen').classList.remove('active');
                document.getElementById('blackjack-screen').classList.add('active');
                
                // Initialize blackjack if needed
                if (typeof initBlackjack === 'function') {
                    setTimeout(() => {
                        initBlackjack();
                    }, 300);
                }
            } else {
                welcomeTerminal.print(`Game "${game}" is coming soon or not available.`, 'error');
            }
        },
        
        'help': () => {
            welcomeTerminal.print('Available commands:', 'info');
            welcomeTerminal.print('  play [game] - Start a game (e.g., play blackjack)', 'info');
            welcomeTerminal.print('  help - Show this help message', 'info');
            welcomeTerminal.print('  about - About Neon Casino', 'info');
            welcomeTerminal.print('  clear - Clear the terminal', 'info');
        },
        
        'about': () => {
            welcomeTerminal.print('Neon Casino - A stylish terminal-based casino experience', 'info');
            welcomeTerminal.print('Version 1.0.0', 'info');
            welcomeTerminal.print('Created with love by a passionate developer', 'info');
        },
        
        'clear': () => {
            welcomeTerminal.clear();
        }
    });
    
    // Handle clicking on game options
    document.querySelectorAll('.game-option').forEach(option => {
        option.addEventListener('click', () => {
            if (option.classList.contains('disabled')) {
                welcomeTerminal.print(`This game is coming soon.`, 'error');
                return;
            }
            
            const game = option.getAttribute('data-game');
            if (game === 'blackjack') {
                // Direct navigation without going through terminal
                document.getElementById('welcome-screen').classList.remove('active');
                document.getElementById('blackjack-screen').classList.add('active');
                
                // Initialize blackjack game
                if (typeof initBlackjack === 'function') {
                    setTimeout(() => {
                        initBlackjack();
                    }, 300);
                }
            } else {
                welcomeTerminal.print(`Game "${game}" is coming soon.`, 'error');
            }
        });
    });
});