/**
 * Visual Roulette Game - UI Handling
 * Handles all UI rendering and animations for the roulette game
 */

// Create roulette UI namespace
const rouletteUI = window.rouletteUI = {};

// UI Elements
rouletteUI.elements = {
    container: null,
    terminal: null,
    output: null,
    input: null,
    prompt: null,
    wheel: null,
    ballTrack: null,
    bettingBoard: null,
    settingsModal: null,
    gameContentWrapper: null
};

/**
 * Create the game UI
 * @param {HTMLElement} container - The container element
 */
rouletteUI.createGameUI = function(container) {
    // Store container
    rouletteUI.elements.container = container;
    
    // Create terminal elements
    const terminal = document.createElement('div');
    terminal.className = 'game-terminal';
    terminal.style.display = 'block';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'game-header';
    
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.textContent = '< Home';
    backButton.addEventListener('click', () => {
        if (rouletteGame.state.exitCallback) {
            rouletteGame.state.exitCallback();
        }
    });
    
    const gameTitle = document.createElement('div');
    gameTitle.className = 'game-title';
    gameTitle.textContent = 'Roulette';
    
    const settingsContainer = document.createElement('div');
    settingsContainer.className = 'game-settings';
    
    const settingsButton = document.createElement('button');
    settingsButton.className = 'settings-button';
    settingsButton.textContent = 'Settings';
    settingsButton.addEventListener('click', () => {
        rouletteUI.showSettingsModal();
    });
    
    // Assemble header
    header.appendChild(backButton);
    header.appendChild(gameTitle);
    settingsContainer.appendChild(settingsButton);
    header.appendChild(settingsContainer);
    
    // Create game content wrapper
    const gameContentWrapper = document.createElement('div');
    gameContentWrapper.className = 'game-content-wrapper';
    
    // Create terminal output
    const terminalOutput = document.createElement('div');
    terminalOutput.className = 'terminal-output';
    terminalOutput.id = 'roulette-output';
    
    // Create input line
    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-input';
    
    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = '>';
    
    const commandInput = document.createElement('input');
    commandInput.type = 'text';
    commandInput.className = 'command-input';
    commandInput.id = 'roulette-command-input';
    commandInput.autocomplete = 'off';
    commandInput.placeholder = 'type a command...';
    
    // Assemble terminal input
    inputLine.appendChild(prompt);
    inputLine.appendChild(commandInput);
    
    // Assemble terminal
    terminal.appendChild(header);
    terminal.appendChild(gameContentWrapper);
    terminal.appendChild(terminalOutput);
    terminal.appendChild(inputLine);
    
    // Add to container
    container.appendChild(terminal);
    
    // Store references
    rouletteUI.elements.terminal = terminal;
    rouletteUI.elements.output = terminalOutput;
    rouletteUI.elements.input = commandInput;
    rouletteUI.elements.prompt = prompt;
    rouletteUI.elements.gameContentWrapper = gameContentWrapper;
    
    // Create settings modal
    rouletteUI.createSettingsModal(container);
    
    // Ensure enough spacing below game board to avoid overlap with terminal input
    const style = document.createElement('style');
    style.textContent = `
        .game-content-wrapper {
            margin-bottom: 120px; /* Extra space to prevent overlap with terminal input */
            padding-bottom: 20px;
        }
        
        /* Fix position of terminal input */
        .terminal-input {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background-color: var(--bg-primary);
            z-index: 100;
            border-top: 1px solid var(--terminal-border);
        }
        
        /* Additional spacing for chip deck and controls */
        .chipDeck, .bankContainer {
            position: relative;
            margin-left: 0;
            margin-top: 10px;
            width: 310px;
            display: inline-block;
            vertical-align: top;
        }
        
        .bankContainer {
            margin-top: 10px;
            margin-left: 20px;
        }
        
        .wheel {
            margin-right: 20px;
            transform: scale(0.9);
            transform-origin: center;
        }
        
        .spinBtn {
            position: relative;
            margin-top: 10px;
            margin-left: 10px;
            display: inline-block;
        }
        
        /* Make sure betting board fits within the container */
        #betting_board {
            max-width: 100%;
            margin-top: 10px;
        }
        
        /* Controls container */
        .controls-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: center;
            margin-top: 10px;
            width: 100%;
        }
    `;
    document.head.appendChild(style);
    
    // Only focus input on initial creation
    if (document.activeElement === document.body) {
        commandInput.focus();
    }
};

/**
 * Create settings modal
 * @param {HTMLElement} container - The container element
 */
rouletteUI.createSettingsModal = function(container) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.id = 'roulette-settings-modal';
    
    // Create settings panel
    const panel = document.createElement('div');
    panel.className = 'settings-panel';
    
    // Header
    const header = document.createElement('div');
    header.className = 'settings-header';
    
    const title = document.createElement('div');
    title.className = 'settings-title';
    title.textContent = 'Game Settings';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'close-settings';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Close settings');
    closeButton.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);

    // Main settings container
    const settingsContent = document.createElement('div');
    settingsContent.className = 'settings-content';
    
    // Language settings
    const languageGroup = document.createElement('div');
    languageGroup.className = 'settings-group language-group';
    
    const languageTitle = document.createElement('div');
    languageTitle.className = 'settings-group-title';
    languageTitle.textContent = 'Language';
    
    const languageOptions = document.createElement('div');
    languageOptions.className = 'settings-options language-options';
    
    // Language options
    const languages = [
        { value: 'en', name: 'English' },
        { value: 'es', name: 'Español' }
    ];
    
    languages.forEach(lang => {
        const langOption = document.createElement('div');
        langOption.className = 'settings-option';
        langOption.dataset.value = lang.value;
        
        if (rouletteGame.state.language === lang.value) {
            langOption.classList.add('selected');
        }
        
        const langLabel = document.createElement('span');
        langLabel.textContent = lang.name;
        
        langOption.appendChild(langLabel);
        
        // Make the option clickable
        langOption.addEventListener('click', () => {
            // Remove selected class from all options
            languageOptions.querySelectorAll('.settings-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Add selected class to this option
            langOption.classList.add('selected');
            
            // Update the game state
            const newLanguage = lang.value;
            rouletteGame.state.language = newLanguage;
            
            // Save state
            rouletteGame.saveState();
            
            // Update UI with new language
            rouletteUI.output(rouletteUI.getText('languageChanged'), false, 'success');
        });
        
        languageOptions.appendChild(langOption);
    });
    
    languageGroup.appendChild(languageTitle);
    languageGroup.appendChild(languageOptions);
    
    // Animation speed settings
    const animationGroup = document.createElement('div');
    animationGroup.className = 'settings-group animation-group';
    
    const animationTitle = document.createElement('div');
    animationTitle.className = 'settings-group-title';
    animationTitle.textContent = 'Animation Speed';
    
    const animationOptions = document.createElement('div');
    animationOptions.className = 'settings-options animation-options';
    
    // Animation speed options
    const speeds = [
        { value: 'fast', name: 'Fast' },
        { value: 'normal', name: 'Normal' },
        { value: 'slow', name: 'Slow' }
    ];
    
    speeds.forEach(speed => {
        const speedOption = document.createElement('div');
        speedOption.className = 'settings-option';
        speedOption.dataset.value = speed.value;
        
        if (rouletteGame.state.animationSpeed === speed.value) {
            speedOption.classList.add('selected');
        }
        
        const speedLabel = document.createElement('span');
        speedLabel.textContent = speed.name;
        
        speedOption.appendChild(speedLabel);
        
        // Make the option clickable
        speedOption.addEventListener('click', () => {
            // Remove selected class from all options
            animationOptions.querySelectorAll('.settings-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Add selected class to this option
            speedOption.classList.add('selected');
            
            // Update the game state
            const newSpeed = speed.value;
            rouletteGame.setAnimationSpeed(newSpeed);
        });
        
        animationOptions.appendChild(speedOption);
    });
    
    animationGroup.appendChild(animationTitle);
    animationGroup.appendChild(animationOptions);
    
    // Settings columns for colors
    const settingsColumnsContainer = document.createElement('div');
    settingsColumnsContainer.className = 'settings-columns';
    
    // Left column - Text Color
    const leftColumn = document.createElement('div');
    leftColumn.className = 'settings-column';
    
    // Text color section
    const textColorSection = document.createElement('div');
    textColorSection.className = 'settings-group';
    
    const textColorTitle = document.createElement('div');
    textColorTitle.className = 'settings-group-title';
    textColorTitle.textContent = 'Text Color';
    
    const textColorOptions = document.createElement('div');
    textColorOptions.className = 'color-option-group';
    
    // Text color options
    const textColors = [
        { value: 'green', name: 'Green' },
        { value: 'blue', name: 'Blue' },
        { value: 'amber', name: 'Amber' },
        { value: 'white', name: 'White' },
        { value: 'red', name: 'Red' },
        { value: 'purple', name: 'Purple' },
        { value: 'cyan', name: 'Cyan' },
        { value: 'orange', name: 'Orange' },
        { value: 'pink', name: 'Pink' }
    ];
    
    textColors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = 'settings-option';
        colorOption.dataset.value = color.value;
        colorOption.dataset.type = 'text-color';
        
        if (rouletteGame.state.colorTheme === color.value) {
            colorOption.classList.add('selected');
        }
        
        // Add color preview
        const colorPreview = document.createElement('span');
        colorPreview.className = 'color-preview';
        colorPreview.style.backgroundColor = `var(--${color.value}-color)`;
        
        const colorLabel = document.createElement('span');
        colorLabel.textContent = color.name;
        
        colorOption.appendChild(colorPreview);
        colorOption.appendChild(colorLabel);
        
        // Make the option clickable
        colorOption.addEventListener('click', () => {
            // Remove selected class from all text color options
            textColorOptions.querySelectorAll('.settings-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Add selected class to this option
            colorOption.classList.add('selected');
            
            // Update the game state
            const newTheme = color.value;
            rouletteGame.state.colorTheme = newTheme;
            
            // Apply theme
            rouletteUI.applyColorTheme(newTheme);
            
            // Save state
            rouletteGame.saveState();
        });
        
        textColorOptions.appendChild(colorOption);
    });
    
    textColorSection.appendChild(textColorTitle);
    textColorSection.appendChild(textColorOptions);
    
    // Right column - Background Color
    const rightColumn = document.createElement('div');
    rightColumn.className = 'settings-column';
    
    // Background color section
    const bgColorSection = document.createElement('div');
    bgColorSection.className = 'settings-group';
    
    const bgColorTitle = document.createElement('div');
    bgColorTitle.className = 'settings-group-title';
    bgColorTitle.textContent = 'Background Color';
    
    const bgColorOptions = document.createElement('div');
    bgColorOptions.className = 'color-option-group';
    
    // Background color options
    const bgColors = [
        { value: 'black', name: 'Black' },
        { value: 'dark-gray', name: 'Dark Gray' },
        { value: 'navy', name: 'Navy' },
        { value: 'dark-green', name: 'Dark Green' },
        { value: 'dark-brown', name: 'Dark Brown' },
        { value: 'dark-purple', name: 'Dark Purple' }
    ];
    
    bgColors.forEach(color => {
        const colorOption = document.createElement('div');
        colorOption.className = 'settings-option';
        colorOption.dataset.value = color.value;
        colorOption.dataset.type = 'bg-color';
        
        if ((rouletteGame.state.backgroundTheme || 'black') === color.value) {
            colorOption.classList.add('selected');
        }
        
        // Add color preview
        const colorPreview = document.createElement('span');
        colorPreview.className = 'color-preview';
        colorPreview.style.backgroundColor = `var(--${color.value}-bg)`;
        
        const colorLabel = document.createElement('span');
        colorLabel.textContent = color.name;
        
        colorOption.appendChild(colorPreview);
        colorOption.appendChild(colorLabel);
        
        // Make the option clickable
        colorOption.addEventListener('click', () => {
            // Remove selected class from all background color options
            bgColorOptions.querySelectorAll('.settings-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Add selected class to this option
            colorOption.classList.add('selected');
            
            // Update the game state
            const newBg = color.value;
            rouletteGame.state.backgroundTheme = newBg;
            
            // Apply background
            rouletteUI.applyBackgroundTheme(newBg);
            
            // Save state
            rouletteGame.saveState();
        });
        
        bgColorOptions.appendChild(colorOption);
    });
    
    bgColorSection.appendChild(bgColorTitle);
    bgColorSection.appendChild(bgColorOptions);
    
    // Arrange the columns
    leftColumn.appendChild(textColorSection);
    rightColumn.appendChild(bgColorSection);
    
    // Add columns to container
    settingsColumnsContainer.appendChild(leftColumn);
    settingsColumnsContainer.appendChild(rightColumn);
    
    // Assemble content
    settingsContent.appendChild(languageGroup);
    settingsContent.appendChild(animationGroup);
    settingsContent.appendChild(settingsColumnsContainer);
    
    // Assemble panel
    panel.appendChild(header);
    panel.appendChild(settingsContent);
    
    // Add to modal
    modal.appendChild(panel);
    
    // Add to container
    container.appendChild(modal);
    
    // Add event listener to close when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Store reference
    rouletteUI.elements.settingsModal = modal;
};

/**
 * Show settings modal
 */
rouletteUI.showSettingsModal = function() {
    const modal = rouletteUI.elements.settingsModal;
    if (modal) {
        // First, remove selected class from all options
        const allOptions = modal.querySelectorAll('.settings-option');
        allOptions.forEach(option => {
            option.classList.remove('selected');
        });
        
        // Language - select the current language
        const languageOptions = modal.querySelectorAll('.settings-option[data-value]');
        languageOptions.forEach(option => {
            if (!option.dataset.type && option.dataset.value === rouletteGame.state.language) {
                option.classList.add('selected');
            }
        });
        
        // Animation speed - select current speed
        const speedOptions = modal.querySelectorAll('.animation-options .settings-option');
        speedOptions.forEach(option => {
            if (option.dataset.value === rouletteGame.state.animationSpeed) {
                option.classList.add('selected');
            }
        });
        
        // Text color - select the current theme
        const textColorOptions = modal.querySelectorAll('.settings-option[data-type="text-color"]');
        textColorOptions.forEach(option => {
            if (option.dataset.value === rouletteGame.state.colorTheme) {
                option.classList.add('selected');
            }
        });
        
        // Background color - select the current background
        const bgColorOptions = modal.querySelectorAll('.settings-option[data-type="bg-color"]');
        bgColorOptions.forEach(option => {
            if (option.dataset.value === (rouletteGame.state.backgroundTheme || 'black')) {
                option.classList.add('selected');
            }
        });
        
        modal.classList.add('active');
    }
};

/**
 * Apply background theme to the game
 * @param {string} background - The background theme to apply
 */
rouletteUI.applyBackgroundTheme = function(background) {
    // Remove all background classes
    document.body.classList.remove('bg-black', 'bg-dark-gray', 'bg-navy', 'bg-dark-green', 'bg-dark-brown', 'bg-dark-purple');
    
    // Add new background class
    document.body.classList.add(`bg-${background}`);
    
    // Apply to terminal elements
    const elements = rouletteUI.elements;
    
    if (elements.terminal) {
        elements.terminal.style.backgroundColor = 'var(--bg-primary)';
    }
    
    // Update all terminal panels with the new background
    const panels = document.querySelectorAll('.terminal-container, .game-terminal, .settings-panel');
    panels.forEach(panel => {
        panel.style.backgroundColor = 'var(--bg-primary)';
    });
};

/**
 * Apply color theme to the game
 * @param {string} theme - The color theme to apply
 */
rouletteUI.applyColorTheme = function(theme) {
    // Set the theme class on body for global CSS variables
    document.body.classList.remove('theme-green', 'theme-blue', 'theme-amber', 'theme-white', 'theme-red', 'theme-purple', 'theme-cyan', 'theme-orange', 'theme-pink');
    document.body.classList.add(`theme-${theme}`);
    
    // Apply to specific elements
    const elements = rouletteUI.elements;
    
    // Update terminal elements
    if (elements.terminal) {
        // Main terminal background
        elements.terminal.style.backgroundColor = 'var(--bg-primary)';
        elements.terminal.style.color = 'var(--text-primary)';
        
        // Terminal borders
        const header = elements.terminal.querySelector('.game-header');
        if (header) {
            header.style.borderBottomColor = 'var(--terminal-border)';
        }
        
        const inputArea = elements.terminal.querySelector('.terminal-input');
        if (inputArea) {
            inputArea.style.borderTopColor = 'var(--terminal-border)';
        }
        
        // Scrollbar colors
        const output = elements.terminal.querySelector('.terminal-output');
        if (output) {
            output.style.scrollbarColor = 'var(--text-primary) var(--bg-primary)';
        }
    }
    
    // Update all buttons
    const buttons = document.querySelectorAll('.btn, .back-button, .settings-button');
    buttons.forEach(button => {
        button.style.borderColor = 'var(--text-primary)';
        button.style.color = 'var(--text-primary)';
    });
    
    // Update input elements
    if (elements.input) {
        elements.input.style.color = 'var(--text-primary)';
    }
    
    if (elements.prompt) {
        elements.prompt.style.color = 'var(--text-primary)';
    }
    
    // Update the global theme in localStorage to ensure it persists to home screen
    localStorage.setItem('terminalArcadeTheme', theme);
};

/**
 * Output text to the terminal
 * @param {string} text - Text to output
 * @param {boolean} isAsciiArt - Whether the text is ASCII art
 * @param {string} messageType - Type of message (auto, cmd, error, info, success, warning)
 */
rouletteUI.output = function(text, isAsciiArt = false, messageType = 'auto') {
    const outputElement = rouletteUI.elements.output;
    const terminalElement = rouletteUI.elements.terminal;
    const inputElement = rouletteUI.elements.input && rouletteUI.elements.input.parentElement;
    
    if (!outputElement || !inputElement) return;
    
    // Remove the input element from the DOM temporarily
    if (inputElement.parentElement) {
        inputElement.parentElement.removeChild(inputElement);
    }
    
    const div = document.createElement('div');
    div.textContent = text;
    
    if (isAsciiArt) {
        div.className = 'ascii-art';
    } else {
        // Auto-detect message type if not specified
        if (messageType === 'auto') {
            if (text.startsWith('>')) {
                messageType = 'cmd';
            } else if (text.toLowerCase().includes('error') || 
                       text.includes('invalid') || 
                       text.includes('failed') ||
                       text.includes('can\'t') ||
                       text.includes('cannot')) {
                messageType = 'error';
            } else if (text.toLowerCase().includes('success') || 
                       text.toLowerCase().includes('win') || 
                       text.toLowerCase().includes('congratulations')) {
                messageType = 'success';
            } else if (text.toLowerCase().includes('warning') || 
                       text.toLowerCase().includes('caution') ||
                       text.toLowerCase().includes('note') ||
                       text.toLowerCase().includes('lose') ||
                       text.toLowerCase().includes('bust')) {
                messageType = 'warning';
            } else {
                messageType = 'info';
            }
        }
        
        div.className = `${messageType}-message`;
    }
    
    // Add the new content to the output
    outputElement.appendChild(div);
    
    // Now reattach the input element directly after the output element
    terminalElement.appendChild(inputElement);
    
    // Make sure the newly added content and input are visible
    inputElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Focus the input element
    if (rouletteUI.elements.input) {
        setTimeout(() => {
            rouletteUI.elements.input.focus();
        }, 10);
    }
};

/**
 * Display the current game state
 */
rouletteUI.displayGameState = function() {
    // Store reference to container
    const container = rouletteUI.elements.gameContentWrapper;
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Build wheel and betting board
    rouletteUI.buildWheel();
    rouletteUI.buildBettingBoard();
    
    // Update previous numbers display
    rouletteUI.updatePreviousNumbers(rouletteGame.state.previousNumbers);
};

/**
 * Update the previous numbers display
 * @param {Array} previousNumbers - Array of previous spin results
 */
rouletteUI.updatePreviousNumbers = function(previousNumbers) {
    const pnContent = document.getElementById('pnContent');
    if (!pnContent) return;
    
    // Clear the content
    pnContent.innerHTML = '';
    
    // Add each previous number
    for (let i = 0; i < previousNumbers.length; i++) {
        const num = previousNumbers[i];
        let pnClass = (num.color === 'red') ? 'pnRed' : 
                     ((num.color === 'green') ? 'pnGreen' : 'pnBlack');
        
        let pnSpan = document.createElement('span');
        pnSpan.setAttribute('class', pnClass);
        pnSpan.innerText = num.number;
        pnContent.append(pnSpan);
    }
    
    // Scroll to show latest numbers
    pnContent.scrollLeft = pnContent.scrollWidth;
};

/**
 * Build the roulette wheel
 */
rouletteUI.buildWheel = function() {
    const gameContentWrapper = rouletteUI.elements.gameContentWrapper;
    
    let wheel = document.createElement('div');
    wheel.setAttribute('class', 'wheel');
    
    let outerRim = document.createElement('div');
    outerRim.setAttribute('class', 'outerRim');
    wheel.append(outerRim);
    
    let numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    for(let i = 0; i < numbers.length; i++) {
        let a = i + 1;
        let spanClass = (numbers[i] < 10) ? 'single' : 'double';
        let sect = document.createElement('div');
        sect.setAttribute('id', 'sect'+a);
        sect.setAttribute('class', 'sect');
        let span = document.createElement('span');
        span.setAttribute('class', spanClass);
        span.innerText = numbers[i];
        sect.append(span);
        let block = document.createElement('div');
        block.setAttribute('class', 'block');
        sect.append(block);
        wheel.append(sect);
    }
    
    let pocketsRim = document.createElement('div');
    pocketsRim.setAttribute('class', 'pocketsRim');
    wheel.append(pocketsRim);
    
    let ballTrack = document.createElement('div');
    ballTrack.setAttribute('class', 'ballTrack');
    let ball = document.createElement('div');
    ball.setAttribute('class', 'ball');
    ballTrack.append(ball);
    wheel.append(ballTrack);
    
    let pockets = document.createElement('div');
    pockets.setAttribute('class', 'pockets');
    wheel.append(pockets);
    
    let cone = document.createElement('div');
    cone.setAttribute('class', 'cone');
    wheel.append(cone);
    
    let turret = document.createElement('div');
    turret.setAttribute('class', 'turret');
    wheel.append(turret);
    
    let turretHandle = document.createElement('div');
    turretHandle.setAttribute('class', 'turretHandle');
    let thendOne = document.createElement('div');
    thendOne.setAttribute('class', 'thendOne');
    turretHandle.append(thendOne);
    let thendTwo = document.createElement('div');
    thendTwo.setAttribute('class', 'thendTwo');
    turretHandle.append(thendTwo);
    wheel.append(turretHandle);
    
    // Add to game content wrapper
    gameContentWrapper.appendChild(wheel);
    
    // Store references
    rouletteUI.elements.wheel = wheel;
    rouletteUI.elements.ballTrack = ballTrack;
};

/**
 * Build the betting board
 */
rouletteUI.buildBettingBoard = function() {
    const gameContentWrapper = rouletteUI.elements.gameContentWrapper;
    const state = rouletteGame.state;
    
    let bettingBoard = document.createElement('div');
    bettingBoard.setAttribute('id', 'betting_board');
    
    let wl = document.createElement('div');
    wl.setAttribute('class', 'winning_lines');
    
    var wlttb = document.createElement('div');
    wlttb.setAttribute('id', 'wlttb_top');
    wlttb.setAttribute('class', 'wlttb');
    for(let i = 0; i < 11; i++) {
        let j = i;
        var ttbbetblock = document.createElement('div');
        ttbbetblock.setAttribute('class', 'ttbbetblock');
        var numA = (1 + (3 * j));
        var numB = (2 + (3 * j));
        var numC = (3 + (3 * j));
        var numD = (4 + (3 * j));
        var numE = (5 + (3 * j));
        var numF = (6 + (3 * j));
        let num = numA + ', ' + numB + ', ' + numC + ', ' + numD + ', ' + numE + ', ' + numF;
        var objType = 'double_street';
        ttbbetblock.onclick = function() {
            rouletteGame.placeBet(this, num, objType, 5);
        };
        ttbbetblock.oncontextmenu = function(e) {
            e.preventDefault();
            rouletteGame.removeBet(this, num, objType, 5);
        };
        wlttb.append(ttbbetblock);
    }
    wl.append(wlttb);
    
    for(let c = 1; c < 4; c++) {
        let d = c;
        var wlttb = document.createElement('div');
        wlttb.setAttribute('id', 'wlttb_'+c);
        wlttb.setAttribute('class', 'wlttb');
        for(let i = 0; i < 12; i++) {
            let j = i;
            var ttbbetblock = document.createElement('div');
            ttbbetblock.setAttribute('class', 'ttbbetblock');
            ttbbetblock.onclick = function() {
                if(d == 1 || d == 2) {
                    var numA = ((2 - (d - 1)) + (3 * j));
                    var numB = ((3 - (d - 1)) + (3 * j));
                    var num = numA + ', ' + numB;
                } else {
                    var numA = (1 + (3 * j));
                    var numB = (2 + (3 * j));
                    var numC = (3 + (3 * j));
                    var num = numA + ', ' + numB + ', ' + numC;
                }
                var objType = (d == 3) ? 'street' : 'split';
                var odd = (d == 3) ? 11 : 17;
                rouletteGame.placeBet(this, num, objType, odd);
            };
            ttbbetblock.oncontextmenu = function(e) {
                e.preventDefault();
                if(d == 1 || d == 2) {
                    var numA = ((2 - (d - 1)) + (3 * j));
                    var numB = ((3 - (d - 1)) + (3 * j));
                    var num = numA + ', ' + numB;
                } else {
                    var numA = (1 + (3 * j));
                    var numB = (2 + (3 * j));
                    var numC = (3 + (3 * j));
                    var num = numA + ', ' + numB + ', ' + numC;
                }
                var objType = (d == 3) ? 'street' : 'split';
                var odd = (d == 3) ? 11 : 17;
                rouletteGame.removeBet(this, num, objType, odd);
            };
            wlttb.append(ttbbetblock);
        }
        wl.append(wlttb);
    }
    
    for(let c = 1; c < 12; c++) {
        let d = c;
        var wlrtl = document.createElement('div');
        wlrtl.setAttribute('id', 'wlrtl_'+c);
        wlrtl.setAttribute('class', 'wlrtl');
        for(let i = 1; i < 4; i++) {
            let j = i;
            var rtlbb = document.createElement('div');
            rtlbb.setAttribute('class', 'rtlbb'+i);
            var numA = (3 + (3 * (d - 1))) - (j - 1);
            var numB = (6 + (3 * (d - 1))) - (j - 1);
            let num = numA + ', ' + numB;
            rtlbb.onclick = function() {
                rouletteGame.placeBet(this, num, 'split', 17);
            };
            rtlbb.oncontextmenu = function(e) {
                e.preventDefault();
                rouletteGame.removeBet(this, num, 'split', 17);
            };
            wlrtl.append(rtlbb);
        }
        wl.append(wlrtl);
    }
    
    for(let c = 1; c < 3; c++) {
        var wlcb = document.createElement('div');
        wlcb.setAttribute('id', 'wlcb_'+c);
        wlcb.setAttribute('class', 'wlcb');
        for(let i = 1; i < 12; i++) {
            let count = (c == 1) ? i : i + 11;
            var cbbb = document.createElement('div');
            cbbb.setAttribute('id', 'cbbb_'+count);
            cbbb.setAttribute('class', 'cbbb');
            var numA = '2';
            var numB = '3';
            var numC = '5';
            var numD = '6';
            let num = (count >= 1 && count < 12) ? 
                     (parseInt(numA) + ((count - 1) * 3)) + ', ' + 
                     (parseInt(numB) + ((count - 1) * 3)) + ', ' + 
                     (parseInt(numC) + ((count - 1) * 3)) + ', ' + 
                     (parseInt(numD) + ((count - 1) * 3)) : 
                     ((parseInt(numA) - 1) + ((count - 12) * 3)) + ', ' + 
                     ((parseInt(numB) - 1) + ((count - 12) * 3)) + ', ' + 
                     ((parseInt(numC) - 1) + ((count - 12) * 3)) + ', ' + 
                     ((parseInt(numD) - 1) + ((count - 12) * 3));
            var objType = 'corner_bet';
            cbbb.onclick = function() {
                rouletteGame.placeBet(this, num, objType, 8);
            };
            cbbb.oncontextmenu = function(e) {
                e.preventDefault();
                rouletteGame.removeBet(this, num, objType, 8);
            };
            wlcb.append(cbbb);
        }
        wl.append(wlcb);
    }
    
    bettingBoard.append(wl);
    
    let bbtop = document.createElement('div');
    bbtop.setAttribute('class', 'bbtop');
    let bbtopBlocks = ['1 to 18', '19 to 36'];
    for(let i = 0; i < bbtopBlocks.length; i++) {
        let f = i;
        var bbtoptwo = document.createElement('div');
        bbtoptwo.setAttribute('class', 'bbtoptwo');
        let num = (f == 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18' : 
                            '19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36';
        var objType = (f == 0) ? 'outside_low' : 'outside_high';
        bbtoptwo.onclick = function() {
            rouletteGame.placeBet(this, num, objType, 1);
        };
        bbtoptwo.oncontextmenu = function(e) {
            e.preventDefault();
            rouletteGame.removeBet(this, num, objType, 1);
        };
        bbtoptwo.innerText = bbtopBlocks[i];
        bbtop.append(bbtoptwo);
    }
    bettingBoard.append(bbtop);
    
    let numberBoard = document.createElement('div');
    numberBoard.setAttribute('class', 'number_board');
    
    let zero = document.createElement('div');
    zero.setAttribute('class', 'number_0');
    var objType = 'zero';
    var odds = 35;
    zero.onclick = function() {
        rouletteGame.placeBet(this, '0', objType, odds);
    };
    zero.oncontextmenu = function(e) {
        e.preventDefault();
        rouletteGame.removeBet(this, '0', objType, odds);
    };
    let nbnz = document.createElement('div');
    nbnz.setAttribute('class', 'nbn');
    nbnz.innerText = '0';
    zero.append(nbnz);
    numberBoard.append(zero);
    
    var numberBlocks = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, '2 to 1', 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, '2 to 1', 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, '2 to 1'];
    var redBlocks = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    for(let i = 0; i < numberBlocks.length; i++) {
        let a = i;
        var nbClass = (numberBlocks[i] == '2 to 1') ? 'tt1_block' : 'number_block';
        var colourClass = (redBlocks.includes(numberBlocks[i])) ? ' redNum' : ((nbClass == 'number_block') ? ' blackNum' : '');
        var numberBlock = document.createElement('div');
        numberBlock.setAttribute('class', nbClass + colourClass);
        numberBlock.onclick = function() {
            if(numberBlocks[a] != '2 to 1') {
                rouletteGame.placeBet(this, ''+numberBlocks[a]+'', 'inside_whole', 35);
            } else {
                num = (a == 12) ? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : 
                      ((a == 25) ? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : 
                                  '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
                rouletteGame.placeBet(this, num, 'outside_column', 2);
            }
        };
        numberBlock.oncontextmenu = function(e) {
            e.preventDefault();
            if(numberBlocks[a] != '2 to 1') {
                rouletteGame.removeBet(this, ''+numberBlocks[a]+'', 'inside_whole', 35);
            } else {
                num = (a == 12) ? '3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36' : 
                      ((a == 25) ? '2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35' : 
                                  '1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34');
                rouletteGame.removeBet(this, num, 'outside_column', 2);
            }
        };
        var nbn = document.createElement('div');
        nbn.setAttribute('class', 'nbn');
        nbn.innerText = numberBlocks[i];
        numberBlock.append(nbn);
        numberBoard.append(numberBlock);
    }
    bettingBoard.append(numberBoard);
    
    let bo3Board = document.createElement('div');
    bo3Board.setAttribute('class', 'bo3_board');    
    let bo3Blocks = ['1 to 12', '13 to 24', '25 to 36'];
    for(let i = 0; i < bo3Blocks.length; i++) {
        let b = i;
        var bo3Block = document.createElement('div');
        bo3Block.setAttribute('class', 'bo3_block');
        bo3Block.onclick = function() {
            num = (b == 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : 
                  ((b == 1) ? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : 
                             '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
            rouletteGame.placeBet(this, num, 'outside_dozen', 2);
        };
        bo3Block.oncontextmenu = function(e) {
            e.preventDefault();
            num = (b == 0) ? '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12' : 
                  ((b == 1) ? '13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24' : 
                             '25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36');
            rouletteGame.removeBet(this, num, 'outside_dozen', 2);
        };
        bo3Block.innerText = bo3Blocks[i];
        bo3Board.append(bo3Block);
    }
    bettingBoard.append(bo3Board);
    
    let otoBoard = document.createElement('div');
    otoBoard.setAttribute('class', 'oto_board');    
    let otoBlocks = ['EVEN', 'RED', 'BLACK', 'ODD'];
    for(let i = 0; i < otoBlocks.length; i++) {
        let d = i;
        var colourClass = (otoBlocks[i] == 'RED') ? ' redNum' : ((otoBlocks[i] == 'BLACK') ? ' blackNum' : '');
        var otoBlock = document.createElement('div');
        otoBlock.setAttribute('class', 'oto_block' + colourClass);
        otoBlock.onclick = function() {
            num = (d == 0) ? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : 
                  ((d == 1) ? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' : 
                   ((d == 2) ? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' : 
                              '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
            rouletteGame.placeBet(this, num, 'outside_oerb', 1);
        };
        otoBlock.oncontextmenu = function(e) {
            num = (d == 0) ? '2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36' : 
                  ((d == 1) ? '1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36' : 
                   ((d == 2) ? '2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35' : 
                              '1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35'));
            e.preventDefault();
            rouletteGame.removeBet(this, num, 'outside_oerb', 1);
        };
        otoBlock.innerText = otoBlocks[i];
        otoBoard.append(otoBlock);
    }
    bettingBoard.append(otoBoard);
    
    // Add to game content wrapper
    gameContentWrapper.appendChild(bettingBoard);
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';
    
    // Create chip deck
    let chipDeck = document.createElement('div');
    chipDeck.setAttribute('class', 'chipDeck');
    let chipValues = [1, 5, 10, 100, 'clear'];
    for(let i = 0; i < chipValues.length; i++) {
        let cvi = i;
        let chipColour = (i == 0) ? 'red' : ((i == 1) ? 'blue cdChipActive' : ((i == 2) ? 'orange' : ((i == 3) ? 'gold' : 'clearBet')));
        let chip = document.createElement('div');
        chip.setAttribute('class', 'cdChip ' + chipColour);
        chip.onclick = function() {
            if(cvi !== 4) {
                let cdChipActive = document.getElementsByClassName('cdChipActive');
                for(let i = 0; i < cdChipActive.length; i++) {
                    cdChipActive[i].classList.remove('cdChipActive');
                }
                let curClass = this.getAttribute('class');
                if(!curClass.includes('cdChipActive')) {
                    this.setAttribute('class', curClass + ' cdChipActive');
                }
                state.wager = parseInt(chip.childNodes[0].innerText);
                
                // Output to terminal when chip value changes
                rouletteUI.output(`Bet amount changed to $${state.wager}`, "info");
            } else {
                // Clear button - refund bets
                rouletteGame.clearBets();
            }
        };
        let chipSpan = document.createElement('span');
        chipSpan.setAttribute('class', 'cdChipSpan');
        chipSpan.innerText = chipValues[i];
        chip.append(chipSpan);
        chipDeck.append(chip);
    }
    controlsContainer.appendChild(chipDeck);
    
    // Create bank container
    let bankContainer = document.createElement('div');
    bankContainer.setAttribute('class', 'bankContainer');
    
    let bank = document.createElement('div');
    bank.setAttribute('class', 'bank');
    let bankSpan = document.createElement('span');
    bankSpan.setAttribute('id', 'bankSpan');
    bankSpan.innerText = '' + state.money.toLocaleString("en-GB") + '';
    bank.append(bankSpan);
    bankContainer.append(bank);
    
    let betDisplay = document.createElement('div');
    betDisplay.setAttribute('class', 'bet');
    let betSpan = document.createElement('span');
    betSpan.setAttribute('id', 'betSpan');
    betSpan.innerText = '' + state.currentBet.toLocaleString("en-GB") + '';
    betDisplay.append(betSpan);
    bankContainer.append(betDisplay);    
    controlsContainer.appendChild(bankContainer);
    
    // Create previous numbers block
    let pnBlock = document.createElement('div');
    pnBlock.setAttribute('class', 'pnBlock');
    let pnContent = document.createElement('div');
    pnContent.setAttribute('id', 'pnContent');
    pnContent.onwheel = function(e) {
        e.preventDefault();
        pnContent.scrollLeft += e.deltaY;
    };
    pnBlock.append(pnContent);    
    
    // Add to controls container
    controlsContainer.appendChild(pnBlock);
    
    // Add spin button if bets are placed
    if (state.currentBet > 0) {
        let spinBtn = document.createElement('div');
        spinBtn.setAttribute('class', 'spinBtn');
        spinBtn.innerText = 'spin';
        spinBtn.onclick = function() {
            this.remove();
            rouletteGame.spin();
        };
        controlsContainer.appendChild(spinBtn);
    }
    
    // Add controls container to game content wrapper
    gameContentWrapper.appendChild(controlsContainer);
    
    // Store reference
    rouletteUI.elements.bettingBoard = bettingBoard;
};

/**
 * Remove all chips from the board
 */
rouletteUI.removeChips = function() {
    var chips = document.getElementsByClassName('chip');
    if(chips.length > 0) {
        for(let i = 0; i < chips.length; i++) {
            chips[i].remove();
        }
        rouletteUI.removeChips(); // Recursively remove remaining chips
    }
};

/**
 * Show game over notification
 */
rouletteUI.showGameOver = function() {
    const state = rouletteGame.state;
    const container = rouletteUI.elements.container;
    if (!container) return;
    
    let notification = document.createElement('div');
    notification.setAttribute('id', 'notification');
    
    let nSpan = document.createElement('span');
    nSpan.setAttribute('class', 'nSpan');
    nSpan.innerText = 'Bankrupt';
    notification.append(nSpan);
    
    let nBtn = document.createElement('div');
    nBtn.setAttribute('class', 'nBtn');
    nBtn.innerText = 'Play again';    
    nBtn.onclick = function() {
        rouletteGame.resetGame();
    };
    notification.append(nBtn);
    
    container.prepend(notification);
    
    // Output to terminal
    rouletteUI.output("Game over! You've gone bankrupt. Click 'Play again' to restart.", "error");
};

/**
 * Show win notification
 * @param {number} winningNumber - The winning number
 * @param {number} winValue - The amount won
 * @param {number} betTotal - Total bet amount on the winning number
 */
rouletteUI.showWin = function(winningNumber, winValue, betTotal) {
    const state = rouletteGame.state;
    const container = rouletteUI.elements.container;
    if (!container || winValue <= 0) return;
    
    let notification = document.createElement('div');
    notification.setAttribute('id', 'notification');
    
    let nSpan = document.createElement('div');
    nSpan.setAttribute('class', 'nSpan');
    
    let nsnumber = document.createElement('span');
    nsnumber.setAttribute('class', 'nsnumber');
    nsnumber.style.cssText = (rouletteGame.RED_NUMBERS.includes(winningNumber)) ? 'color:red' : 'color:black';
    nsnumber.innerText = winningNumber;
    nSpan.append(nsnumber);
    
    let nsTxt = document.createElement('span');
    nsTxt.innerText = ' Win';
    nSpan.append(nsTxt);
    
    let nsWin = document.createElement('div');
    nsWin.setAttribute('class', 'nsWin');
    
    let nsWinBlock = document.createElement('div');
    nsWinBlock.setAttribute('class', 'nsWinBlock');
    nsWinBlock.innerText = 'Bet: ' + betTotal;
    nSpan.append(nsWinBlock);
    nsWin.append(nsWinBlock);
    
    nsWinBlock = document.createElement('div');
    nsWinBlock.setAttribute('class', 'nsWinBlock');
    nsWinBlock.innerText = 'Win: ' + winValue;
    nSpan.append(nsWinBlock);
    nsWin.append(nsWinBlock);
    
    nsWinBlock = document.createElement('div');
    nsWinBlock.setAttribute('class', 'nsWinBlock');
    nsWinBlock.innerText = 'Payout: ' + (winValue + betTotal);
    nsWin.append(nsWinBlock);
    
    nSpan.append(nsWin);
    notification.append(nSpan);
    container.prepend(notification);
    
    // Auto-hide notification after a delay
    if (state.notificationTimer) {
        clearTimeout(state.notificationTimer);
    }
    
    state.notificationTimer = setTimeout(function() {
        notification.style.cssText = 'opacity:0';
        
        setTimeout(function() {
            notification.remove();
            state.notificationTimer = null;
        }, 1000);
    }, 3000);
};

/**
 * Spin the wheel with animation
 * @param {number} winningNumber - The predetermined winning number
 */
rouletteUI.spinWheel = function(winningNumber) {
    const state = rouletteGame.state;
    const wheel = state.wheelElement;
    const ballTrack = state.ballTrackElement;
    
    if (!wheel || !ballTrack) return;
    
    // Find the degree for the winning number
    let degree = 0;
    for(let i = 0; i < rouletteGame.WHEEL_NUMBERS.length; i++) {
        if(rouletteGame.WHEEL_NUMBERS[i] == winningNumber) {
            degree = (i * 9.73) + 362;
        }
    }
    
    // Start fast wheel rotation
    wheel.style.cssText = 'animation: wheelRotate 5s linear infinite;';
    ballTrack.style.cssText = 'animation: ballRotate 1s linear infinite;';
    
    // Slow down the ball after 2 seconds
    setTimeout(function() {
        ballTrack.style.cssText = 'animation: ballRotate 2s linear infinite;';
        
        // Create the stopping animation to land on the winning number
        let style = document.createElement('style');
        style.type = 'text/css';
        style.innerText = '@keyframes ballStop {from {transform: rotate(0deg);}to{transform: rotate(-'+degree+'deg);}}';
        document.head.appendChild(style);
        
        // Keep reference to remove later
        window.lastStyle = style;
    }, 2000);
    
    // Start stopping animation
    setTimeout(function() {
        ballTrack.style.cssText = 'animation: ballStop 3s linear;';
    }, 6000);
    
    // Final position
    setTimeout(function() {
        ballTrack.style.cssText = 'transform: rotate(-'+degree+'deg);';
    }, 9000);
    
    // Cleanup
    setTimeout(function() {
        wheel.style.cssText = '';
        if (window.lastStyle) {
            window.lastStyle.remove();
            window.lastStyle = null;
        }
    }, 10000);
};

/**
 * Get translated text based on current language
 * @param {string} key - Translation key
 * @param  {...any} args - Arguments for translation function
 * @returns {string} Translated text
 */
rouletteUI.getText = function(key, defaultText = '', ...args) {
    if (!window.translations) {
        // Fallback translations object
        window.translations = {
            en: {
                'welcome': "Welcome to Roulette!",
                'spinInProgress': "Wheel is already spinning.",
                'noBets': "You need to place at least one bet before spinning.",
                'spinAlreadyInProgress': "Wheel is already spinning.",
                'outOfMoney': "You're out of money! Game over.",
                'placeMoreBets': "Place your bets for the next spin.",
                'betWon': (type, numbers, amount) => `${type} bet on ${numbers} won! You receive $${amount}.`,
                'totalWinnings': (amount) => `Total winnings: $${amount}.`,
                'noBetsWon': "Sorry, none of your bets won.",
                'cantClearBetsDuringSpin': "Can't clear bets while wheel is spinning.",
                'noBetsToClear': "No bets to clear.",
                'betsCleared': (amount) => `All bets cleared. $${amount} returned to your balance.`,
                'cantResetDuringSpin': "Can't reset the game while wheel is spinning.",
                'gameReset': "Game has been reset. Your balance is now $1000.",
                'languageChanged': "Language changed to English.",
                'languageOptions': "Available languages: en (English), es (Spanish)",
                'colorChanged': (theme) => `Color theme changed to ${theme}.`,
                'colorOptions': "Available colors: green, blue, amber, white, red, purple, cyan, orange, pink",
                'speedChanged': (speed) => `Animation speed changed to ${speed}.`,
                'speedOptions': "Available speeds: fast, normal, slow",
                'unknownCommand': "Unknown command. Type 'help' for commands.",
                'leaderboardTitle': "ROULETTE LEADERBOARD",
                'noHighScores': "No high scores yet",
                'highScore': "NEW HIGH SCORE!",
                'positionEarned': (position) => `You earned position #${position}!`,
                'enterUsername': "Enter your name:",
                'submit': "SUBMIT"
            },
            es: {
                'welcome': "¡Bienvenido a la Ruleta!",
                'spinInProgress': "La rueda ya está girando.",
                'noBets': "Necesitas hacer al menos una apuesta antes de girar.",
                'spinAlreadyInProgress': "La rueda ya está girando.",
                'outOfMoney': "¡Te has quedado sin dinero! Fin del juego.",
                'placeMoreBets': "Haz tus apuestas para el próximo giro.",
                'betWon': (type, numbers, amount) => `¡Apuesta ${type} en ${numbers} ganó! Recibes $${amount}.`,
                'totalWinnings': (amount) => `Ganancias totales: $${amount}.`,
                'noBetsWon': "Lo siento, ninguna de tus apuestas ganó.",
                'cantClearBetsDuringSpin': "No puedes borrar apuestas mientras la rueda está girando.",
                'noBetsToClear': "No hay apuestas para borrar.",
                'betsCleared': (amount) => `Todas las apuestas borradas. $${amount} devueltos a tu saldo.`,
                'cantResetDuringSpin': "No puedes reiniciar el juego mientras la rueda está girando.",
                'gameReset': "El juego ha sido reiniciado. Tu saldo ahora es de $1000.",
                'languageChanged': "Idioma cambiado a Español.",
                'languageOptions': "Idiomas disponibles: en (Inglés), es (Español)",
                'colorChanged': (theme) => `Tema de color cambiado a ${theme}.`,
                'colorOptions': "Colores disponibles: green (verde), blue (azul), amber (ámbar), white (blanco), red (rojo)",
                'speedChanged': (speed) => `Velocidad de animación cambiada a ${speed}.`,
                'speedOptions': "Velocidades disponibles: fast (rápida), normal, slow (lenta)",
                'unknownCommand': "Comando desconocido. Escribe 'help' para ver los comandos.",
                'leaderboardTitle': "TABLA DE CLASIFICACIÓN DE RULETA",
                'noHighScores': "Aún no hay puntuaciones altas",
                'highScore': "¡NUEVA PUNTUACIÓN ALTA!",
                'positionEarned': (position) => `¡Has conseguido la posición #${position}!`,
                'enterUsername': "Introduce tu nombre:",
                'submit': "ENVIAR"
            }
        };
    }
    
    // Use the provided default text if no translation key exists
    if (!key && defaultText) {
        return defaultText;
    }
    
    const language = rouletteGame.state && rouletteGame.state.language ? rouletteGame.state.language : 'en';
    const langData = window.translations[language] || window.translations.en;
    
    if (key.includes('.')) {
        const parts = key.split('.');
        let value = langData;
        for (const part of parts) {
            if (!value) return defaultText || key;
            value = value[part];
        }
        return typeof value === 'function' ? value(...args) : (value || defaultText || key);
    }
    
    const text = langData[key];
    if (!text && defaultText) {
        return defaultText;
    }
    
    return typeof text === 'function' ? text(...args) : (text || key);
};