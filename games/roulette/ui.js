/**
 * Roulette Game Module - UI Handling
 * Redesigned with deterministic wheel animation that syncs with the actual outcome
 */

// Create roulette UI namespace
const rouletteUI = window.rouletteUI = {};

// UI Elements
rouletteUI.elements = {
    container: null,
    terminal: null,
    output: null,
    input: null,
    prompt: null
};

// Include translations
rouletteUI.translations = {
    en: {
        welcome: "Welcome to Terminal Roulette!",
        helpPrompt: "Type 'help' for commands, 'rules' for game rules, 'language es' for Spanish, 'color' to change colors.",
        highScore: "Congratulations! You got a high score!",
        positionEarned: (position) => `You earned position #${position}!`,
        enterUsername: "Enter your name (15 chars max):",
        leaderboardTitle: "LEADERBOARD",
        noHighScores: "No high scores yet!",
        highScoreAdded: "Your score has been added to the leaderboard!",
        leaderboardReset: "NOTE: Leaderboard scores are reset weekly.",
        rulesText: [
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
            "you lose if the ball lands on 0.",
            "",
            "Use 'bet [type] [number(s)] [amount]' to place bets.",
            "Examples:",
            "  bet straight 17 10     - Bet $10 on number 17",
            "  bet red 20             - Bet $20 on red",
            "  bet column 3 50        - Bet $50 on 3rd column",
            "  bet high 25            - Bet $25 on high numbers (19-36)"
        ],
        moneyStatus: (money) => `You have $${money}.`,
        availableBets: "Bet commands: 'bet straight', 'bet split', 'bet street', 'bet corner', 'bet line', 'bet column', 'bet dozen', 'bet red', 'bet black', 'bet odd', 'bet even', 'bet high', 'bet low'",
        invalidBet: "Please enter a valid bet amount.",
        betTooHigh: "You don't have enough money for that bet.",
        invalidBetType: "Invalid bet type. Type 'help bets' to see available bet types.",
        betPlaced: (type, amount) => `${type} bet of $${amount} placed.`,
        spinPrompt: "Type 'spin' to spin the wheel.",
        noBets: "You need to place at least one bet before spinning.",
        spinningWheel: "Spinning the wheel...",
        spinAlreadyInProgress: "Wheel is already spinning.",
        spinInProgress: "Can't place bets while wheel is spinning.",
        outOfMoney: "You're out of money! Game over.",
        placeMoreBets: "Place your bets for the next spin.",
        betWon: (type, numbers, amount) => `${type} bet on ${numbers} won! You receive $${amount}.`,
        totalWinnings: (amount) => `Total winnings: $${amount}.`,
        noBetsWon: "Sorry, none of your bets won.",
        cantClearBetsDuringSpin: "Can't clear bets while wheel is spinning.",
        noBetsToClear: "No bets to clear.",
        betsCleared: (amount) => `All bets cleared. $${amount} returned to your balance.`,
        cantResetDuringSpin: "Can't reset the game while wheel is spinning.",
        gameReset: "Game has been reset. Your balance is now $1000.",
        numberLanded: (number, color) => `Ball landed on ${number} ${color}!`,
        languageChanged: "Language changed to English.",
        languageOptions: "Available languages: en (English), es (Spanish)",
        colorChanged: (theme) => `Color theme changed to ${theme}.`,
        colorOptions: "Available colors: green, blue, amber, white, red, purple, cyan, orange, pink",
        speedChanged: (speed) => `Animation speed changed to ${speed}.`,
        speedOptions: "Available speeds: fast, normal, slow",
        unknownCommand: "Unknown command. Type 'help' for commands.",
        helpText: [
            "Available commands:",
            "  help           - Show this help message",
            "  help bets      - Show detailed betting information",
            "  rules          - Show Roulette rules",
            "  bet [type] ... - Place a bet (see 'help bets')",
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
        ],
        helpBetsText: [
            "BETTING COMMANDS:",
            "  bet straight [number] [amount]",
            "    Example: 'bet straight 17 10' - Bet $10 on number 17",
            "",
            "  bet split [number1] [number2] [amount]",
            "    Example: 'bet split 17 18 10' - Bet $10 on the split between 17 & 18",
            "",
            "  bet street [row] [amount] (rows are 1-12, representing the 12 rows of 3 numbers)",
            "    Example: 'bet street 4 10' - Bet $10 on 10-11-12",
            "",
            "  bet corner [number] [amount] (number is the lowest number in the corner)",
            "    Example: 'bet corner 10 10' - Bet $10 on 10-11-13-14",
            "",
            "  bet line [row] [amount] (rows are 1-11, representing two adjacent rows)",
            "    Example: 'bet line 4 10' - Bet $10 on 10-11-12-13-14-15",
            "",
            "  bet column [column] [amount] (columns are 1-3)",
            "    Example: 'bet column 2 10' - Bet $10 on the middle column",
            "",
            "  bet dozen [dozen] [amount] (dozens are 1-3, representing 1-12, 13-24, 25-36)",
            "    Example: 'bet dozen 1 10' - Bet $10 on numbers 1-12",
            "",
            "OUTSIDE BETS (SIMPLER):",
            "  bet red [amount]     - Bet on all red numbers",
            "  bet black [amount]   - Bet on all black numbers",
            "  bet odd [amount]     - Bet on all odd numbers",
            "  bet even [amount]    - Bet on all even numbers",
            "  bet high [amount]    - Bet on numbers 19-36",
            "  bet low [amount]     - Bet on numbers 1-18"
        ],
        uiLabels: {
            money: "Money:", bets: "Current Bets:", wheel: "Roulette Wheel",
            history: "History:", bet: "Bet:", on: "on", amount: "Amount:",
            board: "Betting Board", placedBets: "Active Bets:", totalBet: "Total Bet:"
        }
    },
    es: {
        welcome: "¡Bienvenido a la Ruleta Terminal!",
        helpPrompt: "Escribe 'help' para comandos, 'rules' para reglas del juego, 'language en' para inglés, 'color' para cambiar colores.",
        highScore: "¡Felicidades!",
        positionEarned: (position) => `¡Has obtenido la posición #${position}!`,
        enterUsername: "Ingresa tu nombre (máx. 15 caracteres)",
        leaderboardTitle: "TABLA DE CLASIFICACIÓN",
        noHighScores: "¡Aún no hay puntuaciones altas!",
        highScoreAdded: "¡Tu puntuación ha sido añadida a la tabla!",
        leaderboardReset: "NOTA: La tabla de clasificación se reinicia semanalmente.",
        rulesText: [
            "REGLAS DE LA RULETA:",
            "---------------------",
            "OBJETIVO:",
            "  Predecir en qué número caerá la bola y realizar apuestas en consecuencia.",
            "",
            "JUEGO:",
            "  1. Realiza apuestas en varios resultados posibles",
            "  2. Gira la rueda",
            "  3. Gana si la bola cae en tus números o grupos predichos",
            "",
            "TIPOS DE APUESTAS Y PAGOS:",
            "  • PLENO: Apuesta a un solo número (35:1)",
            "  • CABALLO: Apuesta a 2 números adyacentes (17:1)",
            "  • TRANSVERSAL: Apuesta a 3 números en fila (11:1)",
            "  • CUADRO: Apuesta a 4 números en cuadrado (8:1)",
            "  • SEISENA: Apuesta a 6 números (2 filas) (5:1)",
            "  • COLUMNA: Apuesta a 12 números (1ª, 2ª o 3ª columna) (2:1)",
            "  • DOCENA: Apuesta a 12 números (1-12, 13-24, o 25-36) (2:1)",
            "  • ROJO/NEGRO: Apuesta al color (1:1)",
            "  • IMPAR/PAR: Apuesta a la paridad del número (1:1)",
            "  • MAYOR/MENOR: Apuesta a números 1-18 o 19-36 (1:1)",
            "",
            "La rueda tiene números 0-36. El 0 es verde, los demás alternan rojo/negro.",
            "IMPORTANTE: Para todas las apuestas sencillas (rojo/negro, impar/par, mayor/menor),",
            "pierdes si la bola cae en 0.",
            "",
            "Usa 'bet [tipo] [número(s)] [cantidad]' para realizar apuestas.",
            "Ejemplos:",
            "  bet straight 17 10     - Apostar $10 al número 17",
            "  bet red 20             - Apostar $20 al rojo",
            "  bet column 3 50        - Apostar $50 a la 3ª columna",
            "  bet high 25            - Apostar $25 a números altos (19-36)"
        ],
        moneyStatus: (money) => `Tienes $${money}.`,
        availableBets: "Comandos de apuesta: 'bet straight', 'bet split', 'bet street', 'bet corner', 'bet line', 'bet column', 'bet dozen', 'bet red', 'bet black', 'bet odd', 'bet even', 'bet high', 'bet low'",
        invalidBet: "Por favor, introduce una cantidad válida para apostar.",
        betTooHigh: "No tienes suficiente dinero para esa apuesta.",
        invalidBetType: "Tipo de apuesta inválido. Escribe 'help bets' para ver los tipos disponibles.",
        betPlaced: (type, amount) => `Apuesta ${type} de $${amount} realizada.`,
        spinPrompt: "Escribe 'spin' para girar la rueda.",
        noBets: "Necesitas realizar al menos una apuesta antes de girar.",
        spinningWheel: "Girando la rueda...",
        spinAlreadyInProgress: "La rueda ya está girando.",
        spinInProgress: "No puedes apostar mientras la rueda está girando.",
        outOfMoney: "¡Te has quedado sin dinero! Fin del juego.",
        placeMoreBets: "Haz tus apuestas para el próximo giro.",
        betWon: (type, numbers, amount) => `¡Apuesta ${type} en ${numbers} ganó! Recibes $${amount}.`,
        totalWinnings: (amount) => `Ganancias totales: $${amount}.`,
        noBetsWon: "Lo siento, ninguna de tus apuestas ganó.",
        cantClearBetsDuringSpin: "No puedes borrar apuestas mientras la rueda está girando.",
        noBetsToClear: "No hay apuestas para borrar.",
        betsCleared: (amount) => `Todas las apuestas borradas. $${amount} devueltos a tu saldo.`,
        cantResetDuringSpin: "No puedes reiniciar el juego mientras la rueda está girando.",
        gameReset: "El juego ha sido reiniciado. Tu saldo ahora es de $1000.",
        numberLanded: (number, color) => `¡La bola cayó en ${number} ${color}!`,
        languageChanged: "Idioma cambiado a Español.",
        languageOptions: "Idiomas disponibles: en (Inglés), es (Español)",
        colorChanged: (theme) => `Tema de color cambiado a ${theme}.`,
        colorOptions: "Colores disponibles: green (verde), blue (azul), amber (ámbar), white (blanco), matrix",
        speedChanged: (speed) => `Velocidad de animación cambiada a ${speed}.`,
        speedOptions: "Velocidades disponibles: fast (rápida), normal, slow (lenta)",
        unknownCommand: "Comando desconocido. Escribe 'help' para ver los comandos.",
        helpText: [
            "Comandos disponibles:",
            "  help           - Mostrar este mensaje de ayuda",
            "  help bets      - Mostrar información detallada de apuestas",
            "  rules          - Mostrar reglas de la Ruleta",
            "  bet [tipo] ... - Realizar una apuesta (ver 'help bets')",
            "  spin           - Girar la rueda",
            "  clear bets     - Borrar todas las apuestas actuales",
            "  money          - Verificar tu saldo actual",
            "  speed          - Cambiar velocidad de animación (fast/normal/slow)",
            "  history        - Mostrar resultados de giros anteriores",
            "  reset          - Reiniciar el juego al estado inicial",
            "  language       - Cambiar idioma (en/es)",
            "  color          - Cambiar tema de color",
            "  leaderboard    - Mostrar tabla de clasificación (top 10)",
            "  exit           - Volver a la pantalla principal"
        ],
        helpBetsText: [
            "COMANDOS DE APUESTAS:",
            "  bet straight [número] [cantidad]",
            "    Ejemplo: 'bet straight 17 10' - Apostar $10 al número 17",
            "",
            "  bet split [número1] [número2] [cantidad]",
            "    Ejemplo: 'bet split 17 18 10' - Apostar $10 a la separación entre 17 y 18",
            "",
            "  bet street [fila] [cantidad] (filas son 1-12, representando las 12 filas de 3 números)",
            "    Ejemplo: 'bet street 4 10' - Apostar $10 a 10-11-12",
            "",
            "  bet corner [número] [cantidad] (número es el número más bajo en la esquina)",
            "    Ejemplo: 'bet corner 10 10' - Apostar $10 a 10-11-13-14",
            "",
            "  bet line [fila] [cantidad] (filas son 1-11, representando dos filas adyacentes)",
            "    Ejemplo: 'bet line 4 10' - Apostar $10 a 10-11-12-13-14-15",
            "",
            "  bet column [columna] [cantidad] (columnas son 1-3)",
            "    Ejemplo: 'bet column 2 10' - Apostar $10 a la columna central",
            "",
            "  bet dozen [docena] [cantidad] (docenas son 1-3, representando 1-12, 13-24, 25-36)",
            "    Ejemplo: 'bet dozen 1 10' - Apostar $10 a números 1-12",
            "",
            "APUESTAS EXTERNAS (MÁS SIMPLES):",
            "  bet red [cantidad]     - Apostar a todos los números rojos",
            "  bet black [cantidad]   - Apostar a todos los números negros",
            "  bet odd [cantidad]     - Apostar a todos los números impares",
            "  bet even [cantidad]    - Apostar a todos los números pares",
            "  bet high [cantidad]    - Apostar a números 19-36",
            "  bet low [cantidad]     - Apostar a números 1-18"
        ],
        uiLabels: {
            money: "Dinero:", bets: "Apuestas Actuales:", wheel: "Rueda de Ruleta",
            history: "Historial:", bet: "Apuesta:", on: "en", amount: "Cantidad:",
            board: "Mesa de Apuestas", placedBets: "Apuestas Activas:", totalBet: "Apuesta Total:"
        }
    }
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
    terminal.appendChild(terminalOutput);
    terminal.appendChild(inputLine);
    
    // Add to container
    container.appendChild(terminal);
    
    // Store references
    rouletteUI.elements.terminal = terminal;
    rouletteUI.elements.output = terminalOutput;
    rouletteUI.elements.input = commandInput;
    rouletteUI.elements.prompt = prompt;
    
    // Create settings modal
    rouletteUI.createSettingsModal(container);
    
    // Only focus input on initial creation
    if (document.activeElement === document.body) {
        commandInput.focus();
    }
};

/**
 * Create settings modal
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
    
    // Language settings (top row)
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
            if (rouletteGame.state.spinInProgress) {
                rouletteUI.displaySpinAnimation(rouletteGame.state);
            } else {
                rouletteUI.displayGameState();
            }
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
 * Display welcome message
 */
rouletteUI.displayWelcomeMessage = function() {
    const state = rouletteGame.state;
    
    // First remove input element so it can be re-appended after content
    const inputElement = rouletteUI.elements.input && rouletteUI.elements.input.parentElement;
    if (inputElement && inputElement.parentElement) {
        inputElement.parentElement.removeChild(inputElement);
    }
    
    // Clear terminal
    if (rouletteUI.elements.output) {
        rouletteUI.elements.output.innerHTML = '';
    }
    
    // Create welcome container
    const welcomeContainer = document.createElement('div');
    welcomeContainer.className = 'welcome-container';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'terminal-box-header';
    header.textContent = 'TERMINAL ROULETTE';
    welcomeContainer.appendChild(header);
    
    // Create money display
    const moneyDisplay = document.createElement('div');
    moneyDisplay.className = 'money-display';
    moneyDisplay.textContent = rouletteUI.getText('moneyStatus', state.money);
    welcomeContainer.appendChild(moneyDisplay);
    
    // Add betting board to the welcome screen
    const bettingBoard = rouletteUI.createBettingBoard([]);
    welcomeContainer.appendChild(bettingBoard);
    
    // Create wheel for welcome screen - below the betting board
    const wheelContainer = rouletteUI.createRouletteWheel();
    welcomeContainer.appendChild(wheelContainer);
    
    // Create welcome message
    const welcomeText = document.createElement('div');
    welcomeText.className = 'welcome-text';
    welcomeText.innerHTML = `
        <p>${rouletteUI.getText('welcome')}</p>
        <p>${rouletteUI.getText('helpPrompt')}</p>
        <p>${rouletteUI.getText('leaderboardReset')}</p>
    `;
    welcomeContainer.appendChild(welcomeText);
    
    // Add to output
    rouletteUI.elements.output.appendChild(welcomeContainer);
    
    // Re-append input at the end and focus it
    if (inputElement && rouletteUI.elements.terminal) {
        rouletteUI.elements.terminal.appendChild(inputElement);
        
        if (rouletteUI.elements.input) {
            setTimeout(() => {
                rouletteUI.elements.input.focus();
            }, 10);
        }
    }
};

/**
 * Create a visual roulette wheel with European sequence
 * @returns {HTMLElement} The wheel container element
 */
rouletteUI.createRouletteWheel = function() {
    const wheelNumbers = rouletteGame.WHEEL_NUMBERS;
    const cellWidth = rouletteGame.ANIMATION.CELL_WIDTH;
    
    // Create wheel container
    const wheelContainer = document.createElement('div');
    wheelContainer.className = 'roulette-wheel-container';
    
    // Create header for wheel
    const wheelHeader = document.createElement('div');
    wheelHeader.className = 'wheel-header';
    wheelHeader.textContent = rouletteUI.getText('uiLabels.wheel');
    wheelContainer.appendChild(wheelHeader);
    
    // Create wheel window (the visible portion of the wheel)
    const wheelWindow = document.createElement('div');
    wheelWindow.className = 'roulette-wheel-window';
    wheelWindow.id = 'roulette-wheel-window';
    
    // Add indicator (the pointer that shows the winning number)
    const indicator = document.createElement('div');
    indicator.className = 'roulette-indicator';
    wheelWindow.appendChild(indicator);
    
    // Add ball (the bouncing ball that follows the wheel)
    const ball = document.createElement('div');
    ball.className = 'roulette-ball';
    wheelWindow.appendChild(ball);
    
    // Create wheel strip (will contain all the numbers)
    const wheelStrip = document.createElement('div');
    wheelStrip.className = 'roulette-wheel-strip';
    wheelStrip.id = 'roulette-wheel-strip';
    
    // Add numbers to the wheel strip multiple times for seamless animation
    // We use 3 copies to ensure continuity during animation
    const repeatMultiple = 3;
    
    for (let i = 0; i < repeatMultiple; i++) {
        wheelNumbers.forEach(number => {
            const cell = document.createElement('div');
            cell.className = `roulette-number-cell ${rouletteGame.NUMBER_COLORS[number]}`;
            cell.textContent = number;
            cell.setAttribute('data-number', number);
            wheelStrip.appendChild(cell);
        });
    }
    
    // Set initial position to center the middle sequence
    const middleSequenceOffset = (repeatMultiple > 1) 
        ? Math.floor(repeatMultiple / 2) * (wheelNumbers.length * cellWidth)
        : 0;
    const initialOffset = ((rouletteGame.ANIMATION.VISIBLE_CELLS * cellWidth) / 2) - middleSequenceOffset;
    wheelStrip.style.transform = `translateX(${initialOffset}px)`;
    
    // Add strip to window
    wheelWindow.appendChild(wheelStrip);
    
    // Add window to container
    wheelContainer.appendChild(wheelWindow);
    
    // Create current number display
    const currentNumber = document.createElement('div');
    currentNumber.className = 'current-number';
    currentNumber.id = 'roulette-current-number';
    
    const numberValue = document.createElement('span');
    numberValue.className = 'number-value';
    
    // Show random number initially
    const randomNumber = wheelNumbers[Math.floor(Math.random() * wheelNumbers.length)];
    numberValue.textContent = randomNumber;
    numberValue.style.color = rouletteGame.NUMBER_COLORS[randomNumber] === 'red' ? '#d32f2f' :
                             rouletteGame.NUMBER_COLORS[randomNumber] === 'black' ? 'white' :
                             '#2e7d32'; // Green
    
    currentNumber.appendChild(numberValue);
    wheelContainer.appendChild(currentNumber);
    
    return wheelContainer;
};

/**
 * Create a standardized betting board that matches real roulette tables
 * @param {Array} currentBets - Current active bets
 * @returns {HTMLElement} The betting board element
 */
rouletteUI.createBettingBoard = function(currentBets = []) {
    const boardContainer = document.createElement('div');
    boardContainer.className = 'betting-board-container';
    
    // Create header
    const boardHeader = document.createElement('div');
    boardHeader.className = 'terminal-box-header';
    boardHeader.textContent = rouletteUI.getText('uiLabels.board');
    boardContainer.appendChild(boardHeader);
    
    // Create main board table - standard European roulette layout
    const table = document.createElement('table');
    table.className = 'roulette-table';
    
    // Create 4 rows for the main board (0 at top, then 3 rows of numbers)
    const zeroRow = document.createElement('tr');
    const row1 = document.createElement('tr'); // Top row (3, 6, 9, 12...)
    const row2 = document.createElement('tr'); // Middle row (2, 5, 8, 11...)
    const row3 = document.createElement('tr'); // Bottom row (1, 4, 7, 10...)
    
    // Create zero cell spanning 3 columns for the top row
    const zeroCell = document.createElement('td');
    zeroCell.className = 'zero-cell';
    zeroCell.rowSpan = 1;
    zeroCell.colSpan = 3;
    zeroCell.textContent = '0';
    zeroCell.setAttribute('data-number', '0');
    
    // Check for zero bet
    const zeroBet = currentBets.find(b => 
        b.type === 'STRAIGHT' && b.numbers.includes(0)
    );
    
    if (zeroBet) {
        zeroCell.classList.add('active-bet');
        const betAmount = document.createElement('div');
        betAmount.className = 'bet-amount';
        betAmount.textContent = `$${zeroBet.amount}`;
        zeroCell.appendChild(betAmount);
    }
    
    zeroRow.appendChild(zeroCell);
    
    // Add all numbers 1-36 in the correct layout
    for (let col = 0; col < 12; col++) {
        // Each column has 3 numbers
        for (let row = 0; row < 3; row++) {
            const number = (3 * col) + (3 - row);
            const cell = document.createElement('td');
            cell.className = `number-cell ${rouletteGame.NUMBER_COLORS[number]}`;
            cell.textContent = number;
            cell.setAttribute('data-number', number);
            
            // Check for straight bet on this number
            const straightBet = currentBets.find(b => 
                b.type === 'STRAIGHT' && b.numbers.includes(number)
            );
            
            if (straightBet) {
                cell.classList.add('active-bet');
                const betAmount = document.createElement('div');
                betAmount.className = 'bet-amount';
                betAmount.textContent = `$${straightBet.amount}`;
                cell.appendChild(betAmount);
            }
            
            // Add to the appropriate row
            if (row === 0) row3.appendChild(cell);
            else if (row === 1) row2.appendChild(cell);
            else row1.appendChild(cell);
        }
    }
    
    table.appendChild(zeroRow);
    table.appendChild(row1);
    table.appendChild(row2);
    table.appendChild(row3);
    
    // Create rows for outside bets
    
    // 2 to 1 columns
    const columnsRow = document.createElement('tr');
    
    for (let col = 1; col <= 3; col++) {
        const columnCell = document.createElement('td');
        columnCell.className = 'outside-bet column-bet';
        columnCell.textContent = '2:1';
        columnCell.setAttribute('data-column', col);
        
        // Highlight active column bets
        const columnBet = currentBets.find(b => 
            b.type === 'COLUMN' && b.numbers[0] === col
        );
        
        if (columnBet) {
            columnCell.classList.add('active-bet');
            const betAmount = document.createElement('div');
            betAmount.className = 'bet-amount';
            betAmount.textContent = `$${columnBet.amount}`;
            columnCell.appendChild(betAmount);
        }
        
        columnsRow.appendChild(columnCell);
    }
    
    table.appendChild(columnsRow);
    
    // Dozens
    const dozensRow = document.createElement('tr');
    
    for (let dozen = 1; dozen <= 3; dozen++) {
        const dozenCell = document.createElement('td');
        dozenCell.className = 'outside-bet dozen-bet';
        dozenCell.colSpan = 4;
        dozenCell.textContent = `${(dozen-1)*12+1}-${dozen*12}`;
        dozenCell.setAttribute('data-dozen', dozen);
        
        // Highlight active dozen bets
        const dozenBet = currentBets.find(b => 
            b.type === 'DOZEN' && b.numbers[0] === dozen
        );
        
        if (dozenBet) {
            dozenCell.classList.add('active-bet');
            const betAmount = document.createElement('div');
            betAmount.className = 'bet-amount';
            betAmount.textContent = `$${dozenBet.amount}`;
            dozenCell.appendChild(betAmount);
        }
        
        dozensRow.appendChild(dozenCell);
    }
    
    table.appendChild(dozensRow);
    
    // Simple outside bets (split into 2 rows for better layout)
    const outsideBets1 = document.createElement('tr');
    const outsideBets2 = document.createElement('tr');
    
    // Create Low/High cells
    const lowCell = document.createElement('td');
    lowCell.className = 'outside-bet low-bet';
    lowCell.textContent = '1-18';
    lowCell.colSpan = 2;
    lowCell.setAttribute('data-bet-type', 'LOW');
    
    const highCell = document.createElement('td');
    highCell.className = 'outside-bet high-bet';
    highCell.textContent = '19-36';
    highCell.colSpan = 2;
    highCell.setAttribute('data-bet-type', 'HIGH');
    
    // Create Even/Odd cells
    const evenCell = document.createElement('td');
    evenCell.className = 'outside-bet even-bet';
    evenCell.textContent = 'EVEN';
    evenCell.colSpan = 2;
    evenCell.setAttribute('data-bet-type', 'EVEN');
    
    const oddCell = document.createElement('td');
    oddCell.className = 'outside-bet odd-bet';
    oddCell.textContent = 'ODD';
    oddCell.colSpan = 2;
    oddCell.setAttribute('data-bet-type', 'ODD');
    
    // Create Red/Black cells
    const redCell = document.createElement('td');
    redCell.className = 'outside-bet red-bet';
    redCell.style.backgroundColor = '#d32f2f';
    redCell.textContent = 'RED';
    redCell.colSpan = 2;
    redCell.setAttribute('data-bet-type', 'RED');
    
    const blackCell = document.createElement('td');
    blackCell.className = 'outside-bet black-bet';
    blackCell.style.backgroundColor = '#212121';
    blackCell.textContent = 'BLACK';
    blackCell.colSpan = 2;
    blackCell.setAttribute('data-bet-type', 'BLACK');
    
    // Check for active outside bets
    const lowBet = currentBets.find(b => b.type === 'LOW');
    const highBet = currentBets.find(b => b.type === 'HIGH');
    const evenBet = currentBets.find(b => b.type === 'EVEN');
    const oddBet = currentBets.find(b => b.type === 'ODD');
    const redBet = currentBets.find(b => b.type === 'RED');
    const blackBet = currentBets.find(b => b.type === 'BLACK');
    
    // Highlight active bets
    if (lowBet) {
        lowCell.classList.add('active-bet');
        const betAmount = document.createElement('div');
        betAmount.className = 'bet-amount';
        betAmount.textContent = `$${lowBet.amount}`;
        lowCell.appendChild(betAmount);
    }
    
    if (highBet) {
        highCell.classList.add('active-bet');
        const betAmount = document.createElement('div');
        betAmount.className = 'bet-amount';
        betAmount.textContent = `$${highBet.amount}`;
        highCell.appendChild(betAmount);
    }
    
    if (evenBet) {
        evenCell.classList.add('active-bet');
        const betAmount = document.createElement('div');
        betAmount.className = 'bet-amount';
        betAmount.textContent = `$${evenBet.amount}`;
        evenCell.appendChild(betAmount);
    }
    
    if (oddBet) {
        oddCell.classList.add('active-bet');
        const betAmount = document.createElement('div');
        betAmount.className = 'bet-amount';
        betAmount.textContent = `$${oddBet.amount}`;
        oddCell.appendChild(betAmount);
    }
    
    if (redBet) {
        redCell.classList.add('active-bet');
        const betAmount = document.createElement('div');
        betAmount.className = 'bet-amount';
        betAmount.textContent = `$${redBet.amount}`;
        redCell.appendChild(betAmount);
    }
    
    if (blackBet) {
        blackCell.classList.add('active-bet');
        const betAmount = document.createElement('div');
        betAmount.className = 'bet-amount';
        betAmount.textContent = `$${blackBet.amount}`;
        blackCell.appendChild(betAmount);
    }
    
    // Arrange cells in rows
    outsideBets1.appendChild(lowCell);
    outsideBets1.appendChild(evenCell);
    outsideBets1.appendChild(redCell);
    
    outsideBets2.appendChild(highCell);
    outsideBets2.appendChild(oddCell);
    outsideBets2.appendChild(blackCell);
    
    table.appendChild(outsideBets1);
    table.appendChild(outsideBets2);
    
    boardContainer.appendChild(table);
    
    // Add list of placed bets if there are any
    if (currentBets && currentBets.length > 0) {
        const betsContainer = document.createElement('div');
        betsContainer.className = 'current-bets-container';
        
        const betsHeader = document.createElement('div');
        betsHeader.className = 'current-bets-header';
        betsHeader.textContent = rouletteUI.getText('uiLabels.placedBets');
        betsContainer.appendChild(betsHeader);
        
        const betsList = document.createElement('ul');
        betsList.className = 'current-bets-list';
        
        // Calculate total bet amount
        let totalBet = 0;
        
        currentBets.forEach(bet => {
            totalBet += bet.amount;
            
            const betItem = document.createElement('li');
            
            // Format bet description based on type
            let betDesc = '';
            const betTypeName = rouletteGame.BET_TYPES[bet.type].name;
            
            switch (bet.type) {
                case 'STRAIGHT':
                    betDesc = `${betTypeName} ${rouletteUI.getText('uiLabels.on')} ${bet.numbers[0]}`;
                    break;
                case 'COLUMN':
                    betDesc = `${betTypeName} ${rouletteUI.getText('uiLabels.on')} ${bet.numbers[0]}`;
                    break;
                case 'DOZEN':
                    const start = (bet.numbers[0] - 1) * 12 + 1;
                    const end = bet.numbers[0] * 12;
                    betDesc = `${betTypeName} ${rouletteUI.getText('uiLabels.on')} ${start}-${end}`;
                    break;
                case 'RED':
                case 'BLACK':
                case 'ODD':
                case 'EVEN':
                case 'HIGH':
                case 'LOW':
                    betDesc = betTypeName;
                    break;
                default:
                    betDesc = `${betTypeName} ${rouletteUI.getText('uiLabels.on')} ${bet.numbers.join(', ')}`;
            }
            
            betItem.textContent = `${betDesc}: $${bet.amount}`;
            betsList.appendChild(betItem);
        });
        
        betsContainer.appendChild(betsList);
        
        // Add total bet amount
        const totalItem = document.createElement('div');
        totalItem.className = 'total-bet';
        totalItem.textContent = `${rouletteUI.getText('uiLabels.totalBet')} $${totalBet}`;
        
        betsContainer.appendChild(totalItem);
        
        boardContainer.appendChild(betsContainer);
    }
    
    return boardContainer;
};

/**
 * Display current game state
 */
rouletteUI.displayGameState = function() {
    const state = rouletteGame.state;
    
    // First remove input element so it can be re-appended after content
    const inputElement = rouletteUI.elements.input && rouletteUI.elements.input.parentElement;
    if (inputElement && inputElement.parentElement) {
        inputElement.parentElement.removeChild(inputElement);
    }
    
    // Clear terminal
    if (rouletteUI.elements.output) {
        rouletteUI.elements.output.innerHTML = '';
    }
    
    // Create the game state container
    const gameStateContainer = document.createElement('div');
    gameStateContainer.className = 'roulette-game-state';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'terminal-box-header';
    header.textContent = 'ROULETTE';
    gameStateContainer.appendChild(header);
    
    // Create money display
    const moneyDisplay = document.createElement('div');
    moneyDisplay.className = 'money-display';
    moneyDisplay.textContent = `${rouletteUI.getText('uiLabels.money')} $${state.money}`;
    gameStateContainer.appendChild(moneyDisplay);
    
    // Create betting board
    const bettingBoard = rouletteUI.createBettingBoard(state.bets);
    gameStateContainer.appendChild(bettingBoard);
    
    // Add roulette wheel
    const wheelElement = rouletteUI.createRouletteWheel();
    gameStateContainer.appendChild(wheelElement);
    
    // Add history section if available
    if (state.spinHistory.length > 0) {
        const historySection = document.createElement('div');
        historySection.className = 'history-section';
        
        const historyHeader = document.createElement('div');
        historyHeader.className = 'section-header';
        historyHeader.textContent = rouletteUI.getText('uiLabels.history');
        historySection.appendChild(historyHeader);
        
        const historyDisplay = document.createElement('div');
        historyDisplay.className = 'history-display';
        
        state.spinHistory.slice(0, 10).forEach((spin) => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${rouletteGame.NUMBER_COLORS[spin.number]}`;
            historyItem.textContent = spin.number;
            historyDisplay.appendChild(historyItem);
        });
        
        historySection.appendChild(historyDisplay);
        gameStateContainer.appendChild(historySection);
    }
    
    // Add to output
    rouletteUI.elements.output.appendChild(gameStateContainer);
    
    // Re-append input at the end and focus it
    if (inputElement && rouletteUI.elements.terminal) {
        rouletteUI.elements.terminal.appendChild(inputElement);
        
        if (rouletteUI.elements.input) {
            setTimeout(() => {
                rouletteUI.elements.input.focus();
            }, 10);
        }
    }
};

/**
 * Initialize the spin animation UI
 * @param {Object} state - The current game state
 */
rouletteUI.displaySpinAnimation = function(state) {
    // Add spin-in-progress class to terminal for animation control
    if (rouletteUI.elements.terminal) {
        rouletteUI.elements.terminal.classList.add('spin-in-progress');
    }
    
    // First remove input element so it can be re-appended after content
    const inputElement = rouletteUI.elements.input && rouletteUI.elements.input.parentElement;
    if (inputElement && inputElement.parentElement) {
        inputElement.parentElement.removeChild(inputElement);
    }
    
    // Clear terminal
    if (rouletteUI.elements.output) {
        rouletteUI.elements.output.innerHTML = '';
    }
    
    // Create the animation container
    const animContainer = document.createElement('div');
    animContainer.className = 'roulette-animation-container';
    animContainer.id = 'roulette-animation-container';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'roulette-animation-header';
    header.textContent = 'SPINNING THE WHEEL';
    animContainer.appendChild(header);
    
    // Create money display
    const moneyDisplay = document.createElement('div');
    moneyDisplay.className = 'money-display';
    moneyDisplay.textContent = `${rouletteUI.getText('uiLabels.money')} $${state.money}`;
    animContainer.appendChild(moneyDisplay);
    
    // Create wheel container for the animation
    const wheelContainer = document.createElement('div');
    wheelContainer.className = 'roulette-wheel-container';
    
    // Create wheel window (the visible portion of the wheel)
    const wheelWindow = document.createElement('div');
    wheelWindow.className = 'roulette-wheel-window';
    wheelWindow.id = 'roulette-wheel-window';
    
    // Add indicator (the pointer that shows the winning number)
    const indicator = document.createElement('div');
    indicator.className = 'roulette-indicator';
    wheelWindow.appendChild(indicator);
    
    // Add ball (the bouncing ball that follows the wheel)
    const ball = document.createElement('div');
    ball.className = 'roulette-ball';
    wheelWindow.appendChild(ball);
    
    // Create wheel strip (will contain all the numbers)
    const wheelStrip = document.createElement('div');
    wheelStrip.className = 'roulette-wheel-strip';
    wheelStrip.id = 'roulette-wheel-strip';
    
    // Add numbers to the wheel strip multiple times for continuous spinning
    // Use 5 repetitions to ensure there's always enough content in view
    const repeatMultiple = 5; // More repetitions for better looping
    
    for (let i = 0; i < repeatMultiple; i++) {
        rouletteGame.WHEEL_NUMBERS.forEach(number => {
            const cell = document.createElement('div');
            cell.className = `roulette-number-cell ${rouletteGame.NUMBER_COLORS[number]}`;
            cell.textContent = number;
            cell.setAttribute('data-number', number);
            cell.setAttribute('data-sequence', i); // Track which sequence this cell belongs to
            wheelStrip.appendChild(cell);
        });
    }
    
    // Add strip to window
    wheelWindow.appendChild(wheelStrip);
    wheelContainer.appendChild(wheelWindow);
    
    // Create current number display
    const currentNumber = document.createElement('div');
    currentNumber.className = 'current-number';
    currentNumber.id = 'roulette-current-number';
    
    const numberValue = document.createElement('span');
    numberValue.className = 'number-value';
    numberValue.textContent = '?';
    numberValue.style.color = 'white';
    
    currentNumber.appendChild(numberValue);
    wheelContainer.appendChild(currentNumber);
    
    // Add wheel container to animation container
    animContainer.appendChild(wheelContainer);
    
    // Show bets
    if (state.bets && state.bets.length > 0) {
        const betsContainer = rouletteUI.createBettingBoard(state.bets);
        animContainer.appendChild(betsContainer);
    }
    
    // Add to output
    rouletteUI.elements.output.appendChild(animContainer);
    
    // Re-append input at the end and focus it
    if (inputElement && rouletteUI.elements.terminal) {
        rouletteUI.elements.terminal.appendChild(inputElement);
        
        if (rouletteUI.elements.input) {
            setTimeout(() => {
                rouletteUI.elements.input.focus();
            }, 10);
        }
    }
    
    // Cache the DOM elements that will be updated during animation
    state.uiElements = {
        strip: document.getElementById('roulette-wheel-strip'),
        ball: document.querySelector('.roulette-ball'),
        numberDisplay: document.getElementById('roulette-current-number'),
        numberValue: document.querySelector('#roulette-current-number .number-value')
    };
    
    // Initialize wheel position
    // Get the initial position from the strip (calculated during creation)
    const initialPosition = parseInt(wheelStrip.getAttribute('data-initial-position') || '0');
    
    // Start with this initial position
    state.wheelPosition = initialPosition;
    state.initialWheelPosition = initialPosition; // Store for reference
    wheelStrip.style.transform = `translateX(${state.wheelPosition}px)`;
    
    // Use a short timeout to ensure the initial position is applied before any transitions
    setTimeout(() => {
        wheelStrip.style.transition = 'transform 0.05s linear';
    }, 50);
};

/**
 * Update wheel position during animation
 * @param {Object} state - The current game state
 * @param {boolean} isComplete - Whether this is the final update (animation complete)
 */
rouletteUI.updateWheelPosition = function(state, isComplete = false) {
    if (!state.uiElements || !state.uiElements.strip) return;
    
    const { strip, numberValue, ball } = state.uiElements;
    
    // Check if we need to extend the strip for infinite scrolling
    const shouldExtendStrip = rouletteUI.checkAndExtendWheelStrip(strip, state.wheelPosition);
    
    // Apply the current position to the wheel strip
    strip.style.transform = `translateX(${state.wheelPosition}px)`;
    
    // Determine current visible number at the center
    let centerNumber = rouletteUI.getCenteredNumber(strip);
    
    // Only if not final update, adjust transition and ball animation based on progress
    if (!isComplete) {
        // Calculate progress through animation
        const currentTime = performance.now();
        const elapsedTime = currentTime - state.spinStartTime;
        const progress = Math.min(elapsedTime / state.spinDuration, 1);
        
        if (progress < 0.7) {
            // Fast at beginning - quick transitions
            strip.style.transition = 'transform 0.05s linear';
            
            // Update the number display with the center number
            numberValue.textContent = centerNumber;
            numberValue.style.color = rouletteGame.NUMBER_COLORS[centerNumber] === 'red' ? '#d32f2f' :
                                     rouletteGame.NUMBER_COLORS[centerNumber] === 'black' ? 'white' :
                                     '#2e7d32'; // Green
            
            // Fast ball movement
            ball.style.animation = 'ballBounce 0.15s ease-in-out infinite alternate';
            
        } else if (progress < 0.9) {
            // Slowing down
            strip.style.transition = 'transform 0.15s ease-out';
            
            // Update the number display with the center number
            numberValue.textContent = centerNumber;
            numberValue.style.color = rouletteGame.NUMBER_COLORS[centerNumber] === 'red' ? '#d32f2f' :
                                     rouletteGame.NUMBER_COLORS[centerNumber] === 'black' ? 'white' :
                                     '#2e7d32'; // Green
            
            // Slower ball movement
            ball.style.animation = 'ballBounce 0.3s ease-in-out infinite alternate';
            
        } else {
            // Final approach to target number - make sure we end up showing the correct number
            strip.style.transition = 'transform 0.3s ease-out';
            
            // Show target number (predetermined winner)
            numberValue.textContent = state.targetNumber;
            numberValue.style.color = rouletteGame.NUMBER_COLORS[state.targetNumber] === 'red' ? '#d32f2f' :
                                     rouletteGame.NUMBER_COLORS[state.targetNumber] === 'black' ? 'white' :
                                     '#2e7d32'; // Green
            
            // Stop ball animation when wheel stops
            ball.style.animation = 'none';
            ball.style.transform = 'translateX(-50%) translateY(0)';
        }
    } else {
        // Final position - force correct target number display
        strip.style.transition = 'none';
        
        // Ensure the target number is displayed
        numberValue.textContent = state.targetNumber;
        numberValue.style.color = rouletteGame.NUMBER_COLORS[state.targetNumber] === 'red' ? '#d32f2f' :
                                 rouletteGame.NUMBER_COLORS[state.targetNumber] === 'black' ? 'white' :
                                 '#2e7d32'; // Green
        
        // Stop ball animation
        ball.style.animation = 'none';
        ball.style.transform = 'translateX(-50%) translateY(0)';
        
        // Find and highlight the winning cell
        setTimeout(() => {
            const cells = strip.querySelectorAll('.roulette-number-cell');
            cells.forEach(cell => {
                cell.classList.remove('highlight');
                
                // Find cells that match our target number
                if (parseInt(cell.getAttribute('data-number')) === state.targetNumber) {
                    // Get cell position relative to the window
                    const cellRect = cell.getBoundingClientRect();
                    const windowRect = document.getElementById('roulette-wheel-window').getBoundingClientRect();
                    const windowCenter = windowRect.left + (windowRect.width / 2);
                    const cellCenter = cellRect.left + (cellRect.width / 2);
                    
                    // Highlight cell only if it's very close to center (within 15px)
                    if (Math.abs(cellCenter - windowCenter) < 15) {
                        cell.classList.add('highlight');
                    }
                }
            });
            
            // Apply celebration animation to number display
            numberValue.style.animation = 'numberPulse 1s ease-in-out infinite alternate';
        }, 50);
    }
};

/**
 * Get the number currently centered in the wheel
 * @param {HTMLElement} strip - The wheel strip element
 * @returns {number} The centered number
 */
rouletteUI.getCenteredNumber = function(strip) {
    // Default to 0 if we can't determine
    let centerNumber = 0;
    
    // Try to identify the centered number visually by examining the DOM
    const wheelWindow = document.getElementById('roulette-wheel-window');
    if (wheelWindow) {
        const windowRect = wheelWindow.getBoundingClientRect();
        const windowCenter = windowRect.left + (windowRect.width / 2);
        
        // Find the cell closest to the center
        let closestCell = null;
        let minDistance = Infinity;
        
        const cells = strip.querySelectorAll('.roulette-number-cell');
        cells.forEach(cell => {
            const cellRect = cell.getBoundingClientRect();
            const cellCenter = cellRect.left + (cellRect.width / 2);
            const distance = Math.abs(cellCenter - windowCenter);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestCell = cell;
            }
        });
        
        if (closestCell) {
            centerNumber = parseInt(closestCell.getAttribute('data-number'));
        }
    }
    
    return centerNumber;
};

/**
 * Check if the wheel strip needs extension and add cells if necessary
 * This creates the infinite scrolling effect
 * @param {HTMLElement} strip - The wheel strip element
 * @param {number} position - Current position of the strip
 * @returns {boolean} Whether the strip was extended
 */
rouletteUI.checkAndExtendWheelStrip = function(strip, position) {
    const wheelWindow = document.getElementById('roulette-wheel-window');
    if (!wheelWindow) return false;
    
    const windowWidth = wheelWindow.offsetWidth;
    const cellWidth = rouletteGame.ANIMATION.CELL_WIDTH;
    const wheelNumbers = rouletteGame.WHEEL_NUMBERS;
    const sequenceWidth = wheelNumbers.length * cellWidth;
    
    // We'll add cells when we're getting within one full sequence of the edge
    const buffer = sequenceWidth * 1.5;
    
    // Get all cells and count
    const cells = strip.querySelectorAll('.roulette-number-cell');
    const cellCount = cells.length;
    
    // Get first and last cells to determine strip boundaries
    if (cellCount === 0) {
        rouletteUI.populateWheelStrip(strip);
        return true;
    }
    
    // Calculate the visible left and right edges of the wheel window
    // relative to the strip's current position
    const leftEdge = -position;
    const rightEdge = leftEdge + windowWidth;
    
    // Calculate the left and right edges of the content in the strip
    const stripLeft = 0;
    const stripRight = cellCount * cellWidth;
    
    let didExtend = false;
    
    // If we're approaching the left edge, add cells to the beginning
    if (leftEdge - stripLeft < buffer) {
        // Need to add more cells at the beginning
        // First disable transitions temporarily to prevent jumpiness
        const originalTransition = strip.style.transition;
        strip.style.transition = 'none';
        
        // Insert a full sequence at the beginning
        const originalFirstCell = cells[0];
        let insertPosition = 0;
        
        // Calculate offset to adjust position when adding cells
        const offsetAdjustment = sequenceWidth;
        
        // Prepend a new sequence to the strip
        for (let i = wheelNumbers.length - 1; i >= 0; i--) {
            const number = wheelNumbers[i];
            const cell = document.createElement('div');
            cell.className = `roulette-number-cell ${rouletteGame.NUMBER_COLORS[number]}`;
            cell.textContent = number;
            cell.setAttribute('data-number', number);
            cell.setAttribute('data-index', i);
            
            // Insert at the beginning
            if (originalFirstCell) {
                strip.insertBefore(cell, originalFirstCell);
            } else {
                strip.appendChild(cell);
            }
        }
        
        // Adjust the position to maintain visual continuity
        // This is crucial - we shift the strip right by the width of the added cells
        strip.style.transform = `translateX(${position + offsetAdjustment}px)`;
        
        // Restore transition after a brief delay to ensure position update takes effect
        setTimeout(() => {
            strip.style.transition = originalTransition;
        }, 10);
        
        didExtend = true;
    }
    
    // If we're approaching the right edge, add cells to the end
    if (stripRight - rightEdge < buffer) {
        // Add more cells at the end - no need to adjust position
        const lastSequenceIndex = Math.floor(cellCount / wheelNumbers.length);
        const nextSequenceIndex = lastSequenceIndex + 1;
        
        // Append a new sequence to the strip
        wheelNumbers.forEach((number, index) => {
            const cell = document.createElement('div');
            cell.className = `roulette-number-cell ${rouletteGame.NUMBER_COLORS[number]}`;
            cell.textContent = number;
            cell.setAttribute('data-number', number);
            cell.setAttribute('data-sequence', nextSequenceIndex);
            cell.setAttribute('data-index', index);
            strip.appendChild(cell);
        });
        
        didExtend = true;
    }
    
    // Trim excess cells if the strip gets too long
    // This prevents memory issues from having too many DOM elements
    if (cellCount > wheelNumbers.length * 10) {
        // Remove cells that are far from the visible area
        const visibleStart = Math.floor(leftEdge / cellWidth) - wheelNumbers.length;
        const visibleEnd = Math.ceil(rightEdge / cellWidth) + wheelNumbers.length;
        
        // Remove excess cells from beginning if they're far from visible area
        const cellsToRemoveStart = Math.max(0, Math.min(visibleStart, cellCount - wheelNumbers.length * 5));
        if (cellsToRemoveStart > wheelNumbers.length) {
            for (let i = 0; i < cellsToRemoveStart; i++) {
                if (strip.firstChild) {
                    strip.removeChild(strip.firstChild);
                }
            }
        }
        
        // Remove excess cells from end if they're far from visible area
        const cellsToKeep = Math.min(cellCount, visibleEnd - visibleStart + wheelNumbers.length * 2);
        const cellsToRemoveEnd = cellCount - cellsToKeep;
        if (cellsToRemoveEnd > wheelNumbers.length) {
            for (let i = 0; i < cellsToRemoveEnd; i++) {
                if (strip.lastChild) {
                    strip.removeChild(strip.lastChild);
                }
            }
        }
    }
    
    return didExtend;
};

/**
 * Display spin result with enhanced visualization
 * @param {number} number - Winning number
 */
rouletteUI.displaySpinResult = function(number) {
    const color = rouletteGame.NUMBER_COLORS[number];
    const colorName = color === 'red' ? 'RED' : color === 'black' ? 'BLACK' : 'GREEN';
    
    // Remove spin-in-progress class to re-enable animations
    if (rouletteUI.elements.terminal) {
        rouletteUI.elements.terminal.classList.remove('spin-in-progress');
    }
    
    // Output the result
    rouletteUI.output(rouletteUI.getText('numberLanded', number, colorName), false, 'success');
    
    // Create result container
    const resultContainer = document.createElement('div');
    resultContainer.className = 'roulette-result-container';
    
    // Create result header
    const resultHeader = document.createElement('div');
    resultHeader.className = 'roulette-result-header';
    resultHeader.textContent = 'FINAL RESULT';
    resultContainer.appendChild(resultHeader);
    
    // Create winning number display
    const winningNumber = document.createElement('div');
    winningNumber.className = `winning-number ${color}`;
    winningNumber.textContent = number;
    resultContainer.appendChild(winningNumber);
    
    // Create color name display
    const colorNameDisplay = document.createElement('div');
    colorNameDisplay.className = 'color-name';
    colorNameDisplay.textContent = colorName;
    colorNameDisplay.style.color = color === 'red' ? '#d32f2f' : color === 'black' ? 'white' : '#2e7d32';
    resultContainer.appendChild(colorNameDisplay);
    
    // Add to output
    rouletteUI.elements.output.appendChild(resultContainer);
    
    // Update the game state display after a delay
    setTimeout(() => {
        rouletteUI.displayGameState();
    }, 2500);
};

/**
 * Get translated text based on current language
 * @param {string} key - Translation key
 * @param  {...any} args - Arguments for translation function
 * @returns {string} Translated text
 */
rouletteUI.getText = function(key, ...args) {
    const language = rouletteGame.state.language || 'en';
    const langData = rouletteUI.translations[language] || rouletteUI.translations.en;
    
    if (key.includes('.')) {
        const parts = key.split('.');
        let value = langData;
        for (const part of parts) {
            if (!value) return key;
            value = value[part];
        }
        return typeof value === 'function' ? value(...args) : (value || key);
    }
    
    const text = langData[key];
    return typeof text === 'function' ? text(...args) : (text || key);
};