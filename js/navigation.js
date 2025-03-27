/**
 * Navigation system for Terminal Arcade
 * Handles transitions between screens and games
 */

// Store navigation history
const navigationHistory = [];

/**
 * Navigate to a screen
 * @param {string} screenId - ID of the screen to navigate to
 * @param {Object} params - Additional parameters for the navigation
 */
function navigateTo(screenId, params = {}) {
    const currentScreen = document.querySelector('.active-screen');
    const targetScreen = document.getElementById(`${screenId}-screen`);
    
    if (!targetScreen) {
        console.error(`Screen with ID ${screenId}-screen not found`);
        return;
    }
    
    // Store current screen in history
    if (currentScreen) {
        navigationHistory.push(currentScreen.id.replace('-screen', ''));
        currentScreen.classList.remove('active-screen');
    }
    
    // Show target screen
    targetScreen.classList.add('active-screen');
    
    // Update URL if necessary
    if (params.updateUrl) {
        history.pushState(
            { screen: screenId, ...params },
            params.title || `Terminal Arcade - ${screenId}`,
            params.url || `#${screenId}`
        );
    }
    
    // Execute any callback
    if (typeof params.callback === 'function') {
        params.callback();
    }
    
    // Trigger a custom navigation event
    window.dispatchEvent(new CustomEvent('screenChange', { 
        detail: { 
            from: currentScreen ? currentScreen.id.replace('-screen', '') : null,
            to: screenId,
            params
        }
    }));
}

/**
 * Go back to previous screen
 * @returns {boolean} True if navigation was successful, false otherwise
 */
function goBack() {
    if (navigationHistory.length === 0) {
        return false;
    }
    
    const previousScreen = navigationHistory.pop();
    navigateTo(previousScreen, { updateUrl: true });
    return true;
}

/**
 * Create a new game screen element
 * @param {string} gameId - ID of the game
 * @returns {HTMLElement} The created game screen element
 */
function createGameScreen(gameId) {
    // Check if screen already exists
    let gameScreen = document.getElementById(`${gameId}-screen`);
    if (gameScreen) {
        return gameScreen;
    }
    
    // Create new game screen
    gameScreen = document.createElement('div');
    gameScreen.id = `${gameId}-screen`;
    gameScreen.className = 'game-screen';
    
    // Create game terminal container
    const terminalContainer = document.createElement('div');
    terminalContainer.className = 'game-terminal';
    terminalContainer.id = `${gameId}-terminal`;
    
    // Create header with back button
    const header = document.createElement('div');
    header.className = 'game-header';
    
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.textContent = '< Home';
    backButton.addEventListener('click', () => {
        navigateTo('home', { updateUrl: true });
    });
    
    const gameTitle = document.createElement('div');
    gameTitle.className = 'game-title';
    gameTitle.textContent = formatGameTitle(gameId);
    
    const settingsContainer = document.createElement('div');
    settingsContainer.className = 'game-settings';
    
    const settingsButton = document.createElement('button');
    settingsButton.className = 'settings-button';
    settingsButton.textContent = 'Settings';
    settingsButton.addEventListener('click', () => {
        // This will be handled by the specific game module
        window.dispatchEvent(new CustomEvent('openGameSettings', { 
            detail: { gameId }
        }));
    });
    
    // Assemble header
    header.appendChild(backButton);
    header.appendChild(gameTitle);
    settingsContainer.appendChild(settingsButton);
    header.appendChild(settingsContainer);
    
    // Create terminal output and input areas
    const terminalOutput = document.createElement('div');
    terminalOutput.className = 'terminal-output';
    terminalOutput.id = `${gameId}-output`;
    
    const terminalInput = document.createElement('div');
    terminalInput.className = 'terminal-input';
    
    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = '>';
    
    const commandInput = document.createElement('input');
    commandInput.type = 'text';
    commandInput.className = 'command-input';
    commandInput.id = `${gameId}-command-input`;
    commandInput.autocomplete = 'off';
    
    // Assemble terminal input
    terminalInput.appendChild(prompt);
    terminalInput.appendChild(commandInput);
    
    // Assemble terminal container
    terminalContainer.appendChild(header);
    terminalContainer.appendChild(terminalOutput);
    terminalContainer.appendChild(terminalInput);
    
    // Add to game screen
    gameScreen.appendChild(terminalContainer);
    
    // Add to document
    document.getElementById('app').appendChild(gameScreen);
    
    return gameScreen;
}

/**
 * Format game ID into a proper title
 * @param {string} gameId - The game ID to format
 * @returns {string} Formatted game title
 */
function formatGameTitle(gameId) {
    return gameId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Export functions to window
window.navigation = {
    navigateTo,
    goBack,
    createGameScreen
};