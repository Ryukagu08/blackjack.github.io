/**
 * Core application logic for Terminal Arcade
 */

// Application state
const appState = {
    currentScreen: 'home',
    selectedGame: null,
    currentTheme: 'green',
    availableGames: ['blackjack'], // Add more game IDs as they're implemented
    loadedGames: {}, // Will hold loaded game modules
    gameScripts: {
        // Map of game IDs to their required script files
        blackjack: [
            'games/blackjack/blackjack.js',
            'games/blackjack/ui.js',
            'games/blackjack/commands.js',
            'games/blackjack/leaderboard.js'
        ]
        // Add more games as they're implemented
    }
};

/**
 * Initialize the application
 */
function initApp() {
    // Apply saved theme if available
    const savedTheme = localStorage.getItem('terminalArcadeTheme') || 'green';
    setColorTheme(savedTheme);
    
    // Add event listeners
    addHomeScreenListeners();
    
    // Handle keyboard navigation
    document.addEventListener('keydown', handleHomeKeyboardNavigation);
    
    // Listen for navigation events
    window.addEventListener('popstate', handlePopState);
    
    // Wait for Firebase to initialize
    checkFirebaseInitialization();
    
    // Check if this is a page refresh with an active game
    const isPageRefresh = sessionStorage.getItem('sessionActive') === 'true';
    const lastActiveGame = localStorage.getItem('lastActiveGame');
    
    if (isPageRefresh && lastActiveGame) {
        // Set a short timeout to ensure all resources are loaded
        setTimeout(() => {
            selectGame(lastActiveGame);
        }, 300);
    } else {
        // First visit or manual navigation, show home screen
        navigateToHome();
    }
    
    // Set session flag to detect refreshes later
    sessionStorage.setItem('sessionActive', 'true');
    
    // Add beforeunload listener to detect actual page closes vs refreshes
    window.addEventListener('beforeunload', function() {
        // Don't clear session storage on refresh
        // This will remain for refresh but be cleared on actual close/navigate away
    });
    
    console.log('Terminal Arcade initialized!');
}

/**
 * Check if Firebase is initialized
 */
function checkFirebaseInitialization() {
    const maxAttempts = 10;
    let attempts = 0;
    
    const checkFirebase = setInterval(() => {
        attempts++;
        
        if (window.firebaseDB) {
            clearInterval(checkFirebase);
            console.log('Firebase detected and ready!');
        } else if (attempts >= maxAttempts) {
            clearInterval(checkFirebase);
            console.warn('Firebase initialization failed after multiple attempts');
        }
    }, 500);
}

/**
 * Add event listeners to home screen elements
 */
function addHomeScreenListeners() {
    // Game selection
    const gameCards = document.querySelectorAll('.game-card:not(.coming-soon)');
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameId = card.getAttribute('data-game');
            if (gameId) {
                selectGame(gameId);
            }
        });
    });
}

/**
 * Handle keyboard navigation on home screen
 */
function handleHomeKeyboardNavigation(e) {
    if (appState.currentScreen !== 'home') return;
    
    const gameCards = Array.from(document.querySelectorAll('.game-card:not(.coming-soon)'));
    if (!gameCards.length) return;
    
    // Find currently selected card
    let selectedIndex = gameCards.findIndex(card => card.classList.contains('selected'));
    
    // If none selected, select the first one by default
    if (selectedIndex === -1) {
        selectedIndex = 0;
        gameCards[selectedIndex].classList.add('selected');
        gameCards[selectedIndex].focus();
        return;
    }
    
    // Handle arrow keys
    switch(e.key) {
        case 'ArrowRight':
            selectedIndex = (selectedIndex + 1) % gameCards.length;
            break;
        case 'ArrowLeft':
            selectedIndex = (selectedIndex - 1 + gameCards.length) % gameCards.length;
            break;
        case 'Enter':
            const gameId = gameCards[selectedIndex].getAttribute('data-game');
            if (gameId) {
                selectGame(gameId);
            }
            return;
        default:
            return;
    }
    
    // Update selection
    gameCards.forEach(card => card.classList.remove('selected'));
    gameCards[selectedIndex].classList.add('selected');
    gameCards[selectedIndex].focus();
}

/**
 * Handle browser back/forward navigation with localStorage handling
 */
function handlePopState() {
    const state = history.state || {};
    if (state.screen === 'game' && state.gameId) {
        loadGame(state.gameId);
        // Update localStorage to reflect the current game
        localStorage.setItem('lastActiveGame', state.gameId);
    } else {
        navigateToHome();
        // Clear the active game in localStorage
        localStorage.removeItem('lastActiveGame');
    }
}

/**
 * Select and load a game with localStorage tracking
 */
function selectGame(gameId) {
    if (!appState.availableGames.includes(gameId)) {
        console.error(`Game ${gameId} is not available`);
        return;
    }
    
    // Update state
    appState.selectedGame = gameId;
    
    // Store active game in localStorage for refresh detection
    localStorage.setItem('lastActiveGame', gameId);
    
    // Update history for navigation
    history.pushState({ screen: 'game', gameId }, `Playing ${gameId}`, `#${gameId}`);
    
    // Load and initialize the game
    loadGame(gameId);
}

/**
 * Load game scripts and initialize
 */
async function loadGame(gameId) {
    // Change current screen
    appState.currentScreen = 'game';
    
    // Show game container
    document.getElementById('home-screen').classList.remove('active-screen');
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.add('active');
    
    try {
        // Check if game is already loaded
        if (!appState.loadedGames[gameId]) {
            // Create game-specific container
            const gameElement = document.createElement('div');
            gameElement.id = `${gameId}-game`;
            gameElement.className = 'game-terminal';
            gameContainer.appendChild(gameElement);
            
            // Dynamically load game CSS
            loadCSS(`games/${gameId}/styles.css`);
            
            // Load game scripts
            await loadGameScripts(gameId);
            
            // Initialize game
            if (window[gameId + 'Game'] && typeof window[gameId + 'Game'].init === 'function') {
                appState.loadedGames[gameId] = window[gameId + 'Game'];
                window[gameId + 'Game'].init(gameElement, navigateToHome);
            } else {
                throw new Error(`Failed to initialize ${gameId} game`);
            }
        } else {
            // Game already loaded, just show it
            document.getElementById(`${gameId}-game`).style.display = 'flex';
            if (typeof appState.loadedGames[gameId].resume === 'function') {
                appState.loadedGames[gameId].resume();
            }
        }
    } catch (error) {
        console.error(`Error loading game ${gameId}:`, error);
        showErrorMessage(`Failed to load game: ${error.message}`);
        navigateToHome();
    }
}

/**
 * Load game scripts dynamically
 */
async function loadGameScripts(gameId) {
    const scripts = appState.gameScripts[gameId] || [];
    
    // Load each script sequentially
    for (const src of scripts) {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.body.appendChild(script);
        });
    }
}

/**
 * Load CSS file dynamically
 */
function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

/**
 * Navigate back to home screen and clear the active game flag
 */
function navigateToHome() {
    // Hide all games
    document.getElementById('game-container').classList.remove('active');
    Array.from(document.getElementById('game-container').children).forEach(child => {
        child.style.display = 'none';
    });
    
    // Show home screen
    document.getElementById('home-screen').classList.add('active-screen');
    
    // Update state
    appState.currentScreen = 'home';
    
    // Clear the active game in localStorage
    localStorage.removeItem('lastActiveGame');
    
    // Update history
    if (history.state && history.state.screen === 'game') {
        history.pushState({ screen: 'home' }, 'Terminal Arcade', '/');
    }
}

/**
 * Set application color theme
 */
function setColorTheme(theme) {
    if (!theme || !['green', 'blue', 'amber', 'white', 'red', 'purple', 'cyan', 'orange', 'pink'].includes(theme)) {
        theme = 'green';
    }
    
    // Update app state
    appState.currentTheme = theme;
    
    // Remove all theme classes
    document.body.classList.remove('theme-green', 'theme-blue', 'theme-amber', 'theme-white', 'theme-red', 'theme-purple', 'theme-cyan', 'theme-orange', 'theme-pink');
    
    // Add new theme class
    document.body.classList.add(`theme-${theme}`);
    
    // Update home screen UI
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.style.borderColor = `var(--text-primary)`;
    });
    
    // Update buttons
    const buttons = document.querySelectorAll('.btn, .back-button, .settings-button');
    buttons.forEach(button => {
        button.style.borderColor = `var(--text-primary)`;
        button.style.color = `var(--text-primary)`;
    });
    
    // Update terminal headers and borders
    const terminalHeaders = document.querySelectorAll('.terminal-header, .game-header');
    terminalHeaders.forEach(header => {
        header.style.borderBottomColor = `var(--terminal-border)`;
    });
    
    const terminalInputs = document.querySelectorAll('.terminal-input');
    terminalInputs.forEach(input => {
        input.style.borderTopColor = `var(--terminal-border)`;
    });
    
    // Save preference
    localStorage.setItem('terminalArcadeTheme', theme);
    
    // Notify any active game
    if (appState.selectedGame && appState.loadedGames[appState.selectedGame]) {
        if (typeof appState.loadedGames[appState.selectedGame].updateTheme === 'function') {
            appState.loadedGames[appState.selectedGame].updateTheme(theme);
        }
    }
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    alert(message); // Simple implementation; could be enhanced with a custom modal
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);