/**
 * Blackjack Game Module - UI Handling
 */

// Create blackjack UI namespace
const blackjackUI = window.blackjackUI = {};

// UI Elements
blackjackUI.elements = {
    container: null,
    terminal: null,
    output: null,
    input: null,
    prompt: null
};

// Include translations
blackjackUI.translations = {
    en: {
        welcome: "Welcome to Command Line Blackjack!",
        helpPrompt: "Type 'help' for commands, 'rules' for game rules, 'language es' for Spanish, 'color' to change colors.",
        highScore: "Congratulations! You got a high score!",
        positionEarned: (position) => `You earned position #${position}!`,
        enterUsername: "Enter your name (15 chars max):",
        leaderboardTitle: "LEADERBOARD",
        noHighScores: "No high scores yet!",
        highScoreAdded: "Your score has been added to the leaderboard!",
        leaderboardReset: "NOTE: Leaderboard scores are reset weekly.",
        rulesText: [
            "BLACKJACK RULES:",
            "---------------------",
            "OBJECTIVE:",
            "  Get a hand value closer to 21 than the dealer without going over.",
            "",
            "CARD VALUES:",
            "  • Number cards (2-10): Face value",
            "  • Face cards (J, Q, K): 10 points",
            "  • Ace: 1 or 11 points (whichever benefits you more)",
            "",
            "GAMEPLAY:",
            "  1. Place a bet to start the game",
            "  2. You and the dealer each get two cards",
            "  3. Dealer's first card is face up, second is hidden",
            "  4. You choose to hit (take another card) or stand (end your turn)",
            "  5. You can continue hitting until you stand or bust (go over 21)",
            "  6. When you stand, the dealer reveals their hidden card",
            "  7. Dealer must hit until they have 17 or higher",
            "  8. Closest to 21 without busting wins",
            "",
            "SPECIAL MOVES:",
            "  • DOUBLE: Double your bet and take exactly one more card",
            "  • SPLIT: If you have two cards of the same value, split them into two hands",
            "  • INSURANCE: If dealer shows an Ace, bet half your wager against dealer blackjack",
            "  • SURRENDER: Give up your hand and lose only half your bet",
            "",
            "PAYOUTS:",
            "  • Win: 1:1 (bet $10, win $10)",
            "  • Blackjack (21 with first two cards): 3:2 (bet $10, win $15)",
            "  • Insurance win: 2:1 (insurance bet $5, win $10)",
            "  • Push (tie): Bet returned"
        ],
        moneyStatus: (money) => `You have $${money}.`,
        betPlaced: (bet) => `Bet placed: $${bet}`,
        dealPrompt: "Type 'deal' to start the game.",
        gameInProgress: "A game is already in progress.",
        needBet: "You need to place a bet first. Use 'bet' command.",
        blackjackTie: "Both have Blackjack! It's a tie.",
        blackjackWin: "BLACKJACK! You win 3:2 on your bet!",
        dealerBlackjack: "Dealer has Blackjack! You lose.",
        insurancePays: "Dealer has Blackjack! Your insurance pays 2:1.",
        cantHit: "You can't hit right now.",
        bust: "BUST! You went over 21. You lose.",
        have21: "You have 21! Standing automatically.",
        cantStand: "You can't stand right now.",
        youStand: "You stand. Dealer's turn.",
        allHandsComplete: "All hands complete. Dealer's turn.",
        cantDouble: "You can't double down right now.",
        notEnoughMoney: "You don't have enough money for that.",
        doublingDown: (hand) => `Doubling down on hand ${hand}.`,
        doubleDownBet: (bet) => `Doubling down! Bet is now $${bet}.`,
        standingAfterDouble: "Standing after double down. Dealer's turn.",
        cantSplit: "You can't split right now.",
        splitOnlyTwoCards: "You can only split with two cards of same value.",
        splittingHand: "Splitting your hand!",
        playingHand: (num) => `Playing hand ${num}...`,
        cantInsurance: "You can't take insurance right now.",
        aceNeededForInsurance: "Insurance is only available when dealer shows an Ace.",
        takingInsurance: (cost) => `Taking insurance for $${cost}.`,
        noBlackjackLoseInsurance: "Dealer does not have Blackjack. You lose your insurance bet.",
        cantSurrender: "You can't surrender right now.",
        surrendering: "You surrender. Half your bet is returned.",
        dealerHits: "Dealer hits.",
        handBusted: (num) => `Hand ${num} already busted.`,
        dealerBusts: "Dealer BUSTS! You win!",
        dealerBustsHand: (num, bet) => `Dealer busts! Hand ${num} wins $${bet}.`,
        handWins: (num, score, dealerScore, bet) => `Hand ${num} wins with ${score} vs dealer's ${dealerScore}. You win $${bet}.`,
        handLoses: (num, score, dealerScore, bet) => `Hand ${num} loses with ${score} vs dealer's ${dealerScore}. You lose $${bet}.`,
        handTies: (num, score) => `Hand ${num} ties with dealer at ${score}. Bet returned.`,
        dealerWins: (score) => `Dealer wins with ${score}. You lose.`,
        playerWins: (score) => `You win with ${score}!`,
        tie: "It's a tie! Bet returned.",
        moneyLeft: (amount) => `You now have $${amount}.`,
        outOfMoney: "You're out of money! Game over.",
        playAgain: "Type 'bet' to play again.",
        unknownCommand: "Unknown command. Type 'help' for commands.",
        availableActions: (options) => `Available actions: ${options}`,
        handBust: (num) => `Hand ${num} BUSTS! You lose this hand's bet.`,
        hand21: (num) => `Hand ${num} has 21! Standing automatically.`,
        standingOnHand: (num) => `Standing on hand ${num}.`,
        invalidBet: "Please enter a valid bet amount.",
        betTooHigh: "You don't have enough money for that bet.",
        languageChanged: "Language changed to English.",
        languageOptions: "Available languages: en (English), es (Spanish)",
        colorChanged: (theme) => `Color theme changed to ${theme}.`,
        colorOptions: "Available colors: green, blue, amber, white, matrix",
        commands: {
            help: "help", bet: "bet", deal: "deal", hit: "hit", stand: "stand", double: "double",
            split: "split", insurance: "insurance", surrender: "surrender", money: "money",
            clear: "clear", language: "language", color: "color", rules: "rules", leaderboard: "leaderboard"
        },
        helpText: [
            "Comandos disponibles:",
            "  help        - Mostrar este mensaje de ayuda (ayuda)",
            "  rules       - Mostrar reglas del Blackjack (reglas)",
            "  bet N       - Realizar una apuesta de N dólares (apostar)",
            "  deal        - Comenzar el juego después de apostar (repartir)",
            "  hit         - Pedir otra carta (carta)",
            "  stand       - Terminar tu turno (plantarse)",
            "  double      - Doblar tu apuesta y tomar una carta más (doblar)",
            "  split       - Dividir tu mano cuando tienes dos cartas del mismo valor (dividir)",
            "  insurance   - Tomar seguro cuando el crupier muestra un As (seguro)",
            "  surrender   - Rendirte y perder la mitad de tu apuesta (rendirse)",
            "  money       - Verificar tu saldo actual (dinero)",
            "  clear       - Limpiar la terminal (limpiar)",
            "  language    - Cambiar idioma (en/es) (idioma)",
            "  color       - Cambiar tema de color (color)",
            "  leaderboard - Mostrar tabla de clasificación (top 10)",
            "  exit        - Volver a la pantalla principal"
        ],
        uiLabels: {
            dealer: "DEALER:", player: "PLAYER:", playerHands: "PLAYER HANDS:",
            hand: (num) => `Hand ${num}:`, score: "Score:", bet: "Bet:",
            money: "Money:", totalBet: "Total Bet:"
        }
    },
    es: {
        welcome: "¡Bienvenido al Blackjack de Línea de Comandos!",
        helpPrompt: "Escribe 'help' para comandos, 'rules' para reglas del juego, 'language en' para inglés, 'color' para cambiar colores.",
        highScore: "¡Felicidades!",
        positionEarned: (position) => `¡Has obtenido la posición #${position}!`,
        enterUsername: "Ingresa tu nombre (máx. 15 caracteres)",
        leaderboardTitle: "TABLA DE CLASIFICACIÓN",
        noHighScores: "¡Aún no hay puntuaciones altas!",
        highScoreAdded: "¡Tu puntuación ha sido añadida a la tabla!",
        leaderboardReset: "NOTA: La tabla de clasificación se reinicia semanalmente.",
        rulesText: [
            "REGLAS DEL BLACKJACK:",
            "---------------------",
            "OBJETIVO:",
            "  Obtener una mano con valor más cercano a 21 que el crupier sin pasarte.",
            "",
            "VALOR DE LAS CARTAS:",
            "  • Cartas numéricas (2-10): Valor facial",
            "  • Figuras (J, Q, K): 10 puntos",
            "  • As: 1 u 11 puntos (el que más te beneficie)",
            "",
            "JUEGO:",
            "  1. Haz una apuesta para comenzar el juego",
            "  2. Tú y el crupier reciben dos cartas cada uno",
            "  3. La primera carta del crupier está boca arriba, la segunda oculta",
            "  4. Eliges pedir carta (hit) o plantarte (stand)",
            "  5. Puedes seguir pidiendo cartas hasta que te plantes o te pases de 21",
            "  6. Cuando te plantas, el crupier revela su carta oculta",
            "  7. El crupier debe pedir carta hasta tener 17 o más",
            "  8. El más cercano a 21 sin pasarse gana",
            "",
            "JUGADAS ESPECIALES:",
            "  • DOBLAR: Duplica tu apuesta y recibe exactamente una carta más",
            "  • DIVIDIR: Si tienes dos cartas del mismo valor, divídelas en dos manos",
            "  • SEGURO: Si el crupier muestra un As, apuesta la mitad contra blackjack del crupier",
            "  • RENDIRSE: Abandona tu mano y pierde solo la mitad de tu apuesta",
            "",
            "PAGOS:",
            "  • Victoria: 1:1 (apuestas $10, ganas $10)",
            "  • Blackjack (21 con las dos primeras cartas): 3:2 (apuestas $10, ganas $15)",
            "  • Victoria del seguro: 2:1 (apuestas $5 en seguro, ganas $10)",
            "  • Empate: Se devuelve la apuesta"
        ],
        moneyStatus: (money) => `Tienes ${money}.`,
        betPlaced: (bet) => `Apuesta colocada: ${bet}`,
        dealPrompt: "Escribe 'deal' para comenzar el juego.",
        gameInProgress: "Ya hay un juego en progreso.",
        needBet: "Necesitas hacer una apuesta primero. Usa el comando 'bet'.",
        blackjackTie: "¡Ambos tienen Blackjack! Es un empate.",
        blackjackWin: "¡BLACKJACK! ¡Ganas 3:2 en tu apuesta!",
        dealerBlackjack: "¡El crupier tiene Blackjack! Pierdes.",
        insurancePays: "¡El crupier tiene Blackjack! Tu seguro paga 2:1.",
        cantHit: "No puedes pedir carta ahora.",
        bust: "¡PASADO! Te pasaste de 21. Pierdes.",
        have21: "¡Tienes 21! Te plantas automáticamente.",
        cantStand: "No puedes plantarte ahora.",
        youStand: "Te plantas. Turno del crupier.",
        allHandsComplete: "Todas las manos completadas. Turno del crupier.",
        cantDouble: "No puedes doblar ahora.",
        notEnoughMoney: "No tienes suficiente dinero para eso.",
        doublingDown: (hand) => `Doblando en la mano ${hand}.`,
        doubleDownBet: (bet) => `¡Doblando! La apuesta ahora es de ${bet}.`,
        standingAfterDouble: "Te plantas después de doblar. Turno del crupier.",
        cantSplit: "No puedes dividir ahora.",
        splitOnlyTwoCards: "Solo puedes dividir con dos cartas del mismo valor.",
        splittingHand: "¡Dividiendo tu mano!",
        playingHand: (num) => `Jugando mano ${num}...`,
        cantInsurance: "No puedes tomar seguro ahora.",
        aceNeededForInsurance: "El seguro solo está disponible cuando el crupier muestra un As.",
        takingInsurance: (cost) => `Tomando seguro por ${cost}.`,
        noBlackjackLoseInsurance: "El crupier no tiene Blackjack. Pierdes tu apuesta de seguro.",
        cantSurrender: "No puedes rendirte ahora.",
        surrendering: "Te rindes. Se te devuelve la mitad de tu apuesta.",
        dealerHits: "El crupier pide carta.",
        handBusted: (num) => `La mano ${num} ya se pasó.`,
        dealerBusts: "¡El crupier SE PASA! ¡Ganas!",
        dealerBustsHand: (num, bet) => `¡El crupier se pasa! La mano ${num} gana ${bet}.`,
        handWins: (num, score, dealerScore, bet) => `La mano ${num} gana con ${score} vs ${dealerScore} del crupier. Ganas ${bet}.`,
        handLoses: (num, score, dealerScore, bet) => `La mano ${num} pierde con ${score} vs ${dealerScore} del crupier. Pierdes ${bet}.`,
        handTies: (num, score) => `La mano ${num} empata con el crupier en ${score}. Se devuelve la apuesta.`,
        dealerWins: (score) => `El crupier gana con ${score}. Pierdes.`,
        playerWins: (score) => `¡Ganas con ${score}!`,
        tie: "¡Es un empate! Se devuelve la apuesta.",
        moneyLeft: (amount) => `Ahora tienes ${amount}.`,
        outOfMoney: "¡Te quedaste sin dinero! Fin del juego.",
        playAgain: "Escribe 'bet' para jugar de nuevo.",
        unknownCommand: "Comando desconocido. Escribe 'help' para comandos.",
        availableActions: (options) => `Acciones disponibles: ${options}`,
        handBust: (num) => `¡La mano ${num} SE PASA! Pierdes la apuesta de esta mano.`,
        hand21: (num) => `¡La mano ${num} tiene 21! Te plantas automáticamente.`,
        standingOnHand: (num) => `Te plantas en la mano ${num}.`,
        invalidBet: "Por favor, ingresa una cantidad de apuesta válida.",
        betTooHigh: "No tienes suficiente dinero para esa apuesta.",
        languageChanged: "Idioma cambiado a Español.",
        languageOptions: "Idiomas disponibles: en (Inglés), es (Español)",
        colorChanged: (theme) => `Tema de color cambiado a ${theme}.`,
        colorOptions: "Colores disponibles: green (verde), blue (azul), amber (ámbar), white (blanco), matrix",
        commands: {
            help: "help", bet: "bet", deal: "deal", hit: "hit", stand: "stand", double: "double",
            split: "split", insurance: "insurance", surrender: "surrender", money: "money",
            clear: "clear", language: "language", color: "color", rules: "rules", leaderboard: "leaderboard",
            exit: "exit"
        },
        helpText: [
            "Comandos disponibles:",
            "  help        - Mostrar este mensaje de ayuda (ayuda)",
            "  rules       - Mostrar reglas del Blackjack (reglas)",
            "  bet N       - Realizar una apuesta de N dólares (apostar)",
            "  deal        - Comenzar el juego después de apostar (repartir)",
            "  hit         - Pedir otra carta (carta)",
            "  stand       - Terminar tu turno (plantarse)",
            "  double      - Doblar tu apuesta y tomar una carta más (doblar)",
            "  split       - Dividir tu mano cuando tienes dos cartas del mismo valor (dividir)",
            "  insurance   - Tomar seguro cuando el crupier muestra un As (seguro)",
            "  surrender   - Rendirte y perder la mitad de tu apuesta (rendirse)",
            "  money       - Verificar tu saldo actual (dinero)",
            "  clear       - Limpiar la terminal (limpiar)",
            "  language    - Cambiar idioma (en/es) (idioma)",
            "  color       - Cambiar tema de color (color)",
            "  leaderboard - Mostrar tabla de clasificación (top 10)",
            "  exit        - Volver a la pantalla principal"
        ],
        uiLabels: {
            dealer: "CRUPIER:", player: "JUGADOR:", playerHands: "MANOS DEL JUGADOR:",
            hand: (num) => `Mano ${num}:`, score: "Puntos:", bet: "Apuesta:",
            money: "Dinero:", totalBet: "Apuesta Total:"
        }
    }
};

/**
 * Create the game UI
 * @param {HTMLElement} container - The container element
 */
blackjackUI.createGameUI = function(container) {
    // Store container
    blackjackUI.elements.container = container;
    
    // Create terminal elements
    const terminal = document.createElement('div');
    terminal.className = 'game-terminal';
    terminal.style.display = 'block'; // Change from flex to block
    
    // Create header
    const header = document.createElement('div');
    header.className = 'game-header';
    
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.textContent = '< Home';
    backButton.addEventListener('click', () => {
        if (blackjackGame.state.exitCallback) {
            blackjackGame.state.exitCallback();
        }
    });
    
    const gameTitle = document.createElement('div');
    gameTitle.className = 'game-title';
    gameTitle.textContent = 'Blackjack';
    
    const settingsContainer = document.createElement('div');
    settingsContainer.className = 'game-settings';
    
    const settingsButton = document.createElement('button');
    settingsButton.className = 'settings-button';
    settingsButton.textContent = 'Settings';
    settingsButton.addEventListener('click', () => {
        blackjackUI.showSettingsModal();
    });
    
    // Assemble header
    header.appendChild(backButton);
    header.appendChild(gameTitle);
    settingsContainer.appendChild(settingsButton);
    header.appendChild(settingsContainer);
    
    // Create terminal output
    const terminalOutput = document.createElement('div');
    terminalOutput.className = 'terminal-output';
    terminalOutput.id = 'blackjack-output';
    
    // Create input line
    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-input';
    
    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = '>';
    
    const commandInput = document.createElement('input');
    commandInput.type = 'text';
    commandInput.className = 'command-input';
    commandInput.id = 'blackjack-command-input';
    commandInput.autocomplete = 'off';
    commandInput.placeholder = 'type a command...';
    
    // Assemble terminal input
    inputLine.appendChild(prompt);
    inputLine.appendChild(commandInput);
    
    // Assemble terminal - notice order change
    terminal.appendChild(header);
    terminal.appendChild(terminalOutput);
    terminal.appendChild(inputLine); // Input now follows output directly
    
    // Add to container
    container.appendChild(terminal);
    
    // Store references
    blackjackUI.elements.terminal = terminal;
    blackjackUI.elements.output = terminalOutput;
    blackjackUI.elements.input = commandInput;
    blackjackUI.elements.prompt = prompt;
    
    // Create settings modal
    blackjackUI.createSettingsModal(container);
    
    // Only focus input on initial creation
    if (document.activeElement === document.body) {
        commandInput.focus();
    }
};

/**
 * Create settings modal
 * @param {HTMLElement} container - The container element
 */
blackjackUI.createSettingsModal = function(container) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.id = 'blackjack-settings-modal';
    
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
        
        if (blackjackGame.state.language === lang.value) {
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
            blackjackGame.state.language = newLanguage;
            
            // Save state
            blackjackGame.saveState();
            
            // Update UI with new language
            if (blackjackGame.state.gameInProgress) {
                blackjackUI.displayGameState();
            } else {
                blackjackUI.displayWelcomeMessage();
            }
        });
        
        languageOptions.appendChild(langOption);
    });
    
    languageGroup.appendChild(languageTitle);
    languageGroup.appendChild(languageOptions);
    
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
        
        if (blackjackGame.state.colorTheme === color.value) {
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
            blackjackGame.state.colorTheme = newTheme;
            
            // Apply theme
            blackjackUI.applyColorTheme(newTheme);
            
            // Save state
            blackjackGame.saveState();
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
        
        if ((blackjackGame.state.backgroundTheme || 'black') === color.value) {
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
            blackjackGame.state.backgroundTheme = newBg;
            
            // Apply background
            blackjackUI.applyBackgroundTheme(newBg);
            
            // Save state
            blackjackGame.saveState();
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
    blackjackUI.elements.settingsModal = modal;
};

/**
 * Show settings modal
 */
blackjackUI.showSettingsModal = function() {
    const modal = blackjackUI.elements.settingsModal;
    if (modal) {
        // First, remove selected class from all options
        const allOptions = modal.querySelectorAll('.settings-option');
        allOptions.forEach(option => {
            option.classList.remove('selected');
        });
        
        // Language - select the current language
        const languageOptions = modal.querySelectorAll('.settings-option[data-value]');
        languageOptions.forEach(option => {
            if (!option.dataset.type && option.dataset.value === blackjackGame.state.language) {
                option.classList.add('selected');
            }
        });
        
        // Text color - select the current theme
        const textColorOptions = modal.querySelectorAll('.settings-option[data-type="text-color"]');
        textColorOptions.forEach(option => {
            if (option.dataset.value === blackjackGame.state.colorTheme) {
                option.classList.add('selected');
            }
        });
        
        // Background color - select the current background
        const bgColorOptions = modal.querySelectorAll('.settings-option[data-type="bg-color"]');
        bgColorOptions.forEach(option => {
            if (option.dataset.value === (blackjackGame.state.backgroundTheme || 'black')) {
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
blackjackUI.applyBackgroundTheme = function(background) {
    // Remove all background classes
    document.body.classList.remove('bg-black', 'bg-dark-gray', 'bg-navy', 'bg-dark-green', 'bg-dark-brown', 'bg-dark-purple');
    
    // Add new background class
    document.body.classList.add(`bg-${background}`);
    
    // Apply to terminal elements
    const elements = blackjackUI.elements;
    
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
blackjackUI.applyColorTheme = function(theme) {
    // Set the theme class on body for global CSS variables
    document.body.classList.remove('theme-green', 'theme-blue', 'theme-amber', 'theme-white', 'theme-red', 'theme-purple', 'theme-cyan', 'theme-orange', 'theme-pink');
    document.body.classList.add(`theme-${theme}`);
    
    // Apply to specific elements
    const elements = blackjackUI.elements;
    
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
blackjackUI.output = function(text, isAsciiArt = false, messageType = 'auto') {
    const outputElement = blackjackUI.elements.output;
    const terminalElement = blackjackUI.elements.terminal;
    const inputElement = blackjackUI.elements.input && blackjackUI.elements.input.parentElement;
    
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
                       text.toLowerCase().includes('blackjack') ||
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
    if (blackjackUI.elements.input) {
        setTimeout(() => {
            blackjackUI.elements.input.focus();
        }, 10);
    }
};

/**
 * Display welcome message
 */
blackjackUI.displayWelcomeMessage = function() {
    const state = blackjackGame.state;
    
    // First remove input element so it can be re-appended after content
    const inputElement = blackjackUI.elements.input && blackjackUI.elements.input.parentElement;
    if (inputElement && inputElement.parentElement) {
        inputElement.parentElement.removeChild(inputElement);
    }
    
    // Clear terminal
    if (blackjackUI.elements.output) {
        blackjackUI.elements.output.innerHTML = '';
    }
    
    // Display welcome header
    blackjackUI.output(`
+--------------------------------------+
|                                      |
|          COMMAND LINE BLACKJACK      |
|                                      |
+--------------------------------------+

${blackjackUI.getText('welcome')}
${blackjackUI.getText('helpPrompt')}
${blackjackUI.getText('moneyStatus', state.money)}

${blackjackUI.getText('leaderboardReset')}`);
    
    // Re-append input at the end and focus it
    if (inputElement && blackjackUI.elements.terminal) {
        blackjackUI.elements.terminal.appendChild(inputElement);
        
        if (blackjackUI.elements.input) {
            setTimeout(() => {
                blackjackUI.elements.input.focus();
            }, 10);
        }
    }
};

/**
 * Display current game state
 */
blackjackUI.displayGameState = function() {
    const state = blackjackGame.state;
    
    // First remove input element so it can be re-appended after content
    const inputElement = blackjackUI.elements.input && blackjackUI.elements.input.parentElement;
    if (inputElement && inputElement.parentElement) {
        inputElement.parentElement.removeChild(inputElement);
    }
    
    // Clear terminal
    if (blackjackUI.elements.output) {
        blackjackUI.elements.output.innerHTML = '';
    }
    
    // Fixed width for the game table
    const TABLE_WIDTH = 63; // Total width including borders
    const CONTENT_WIDTH = TABLE_WIDTH - 2; // Width of content area (excluding borders)
    
    // Get bet info
    let betInfo = state.handSplit ?
        `${blackjackUI.getText('uiLabels.totalBet')} ${state.playerHands.reduce((sum, h) => sum + h.bet, 0).toString().padStart(3)}` :
        `${blackjackUI.getText('uiLabels.bet')} ${state.currentBet.toString().padStart(3)}`;
    
    // Get label texts - to ensure we have correct widths with different languages
    const dealerLabel = blackjackUI.getText('uiLabels.dealer');
    const playerLabel = state.handSplit ? blackjackUI.getText('uiLabels.playerHands') : blackjackUI.getText('uiLabels.player');
    const moneyLabel = blackjackUI.getText('uiLabels.money');
    
    // Create the header of the table
    let tableLines = [
        `+${'-'.repeat(CONTENT_WIDTH)}+`,
        `|${' BLACKJACK '.padStart(Math.floor(CONTENT_WIDTH/2) + 5).padEnd(CONTENT_WIDTH)}|`,
        `+${'-'.repeat(CONTENT_WIDTH)}+`,
        `|${' '.repeat(CONTENT_WIDTH)}|`,
        `| ${dealerLabel}${' '.repeat(CONTENT_WIDTH - dealerLabel.length - 1)}|`
    ];
    
    // Add empty lines for dealer area
    for (let i = 0; i < 5; i++) {
        tableLines.push(`|${' '.repeat(CONTENT_WIDTH)}|`);
    }
    
    // Add separator and player section header
    tableLines.push(
        `+${'-'.repeat(CONTENT_WIDTH)}+`,
        `|${' '.repeat(CONTENT_WIDTH)}|`,
        `| ${playerLabel}${' '.repeat(CONTENT_WIDTH - playerLabel.length - 1)}|`
    );
    
    // Add player section(s)
    if (state.handSplit) {
        for (let h = 0; h < state.playerHands.length; h++) {
            const handLabel = blackjackUI.getText('uiLabels.hand', h + 1);
            // Add empty line before each hand except the first one
            if (h > 0) tableLines.push(`|${' '.repeat(CONTENT_WIDTH)}|`);
            
            tableLines.push(`|${' '.repeat(CONTENT_WIDTH)}|`);
            tableLines.push(`| ${handLabel}${' '.repeat(CONTENT_WIDTH - handLabel.length - 1)}|`);
            
            // Add 5 empty lines for cards
            for (let i = 0; i < 5; i++) {
                tableLines.push(`|${' '.repeat(CONTENT_WIDTH)}|`);
            }
        }
    } else {
        // Add 5 empty lines for cards
        for (let i = 0; i < 5; i++) {
            tableLines.push(`|${' '.repeat(CONTENT_WIDTH)}|`);
        }
    }
    
    // Add footer with bet and money info
    const footerText = `${betInfo.padEnd(33)} ${moneyLabel} ${state.money.toString().padStart(3)}`;
    tableLines.push(
        `| ${footerText}${' '.repeat(CONTENT_WIDTH - footerText.length - 1)}|`,
        `+${'-'.repeat(CONTENT_WIDTH)}+`
    );
    
    // Add dealer cards
    const dealerCardLines = blackjackUI.handToAscii(state.dealerHand, state.playerTurn);
    for (let i = 0; i < dealerCardLines.length; i++) {
        // Make sure the line doesn't exceed the content width
        const cardText = dealerCardLines[i].substring(0, CONTENT_WIDTH - 2);
        tableLines[5 + i] = `| ${cardText.padEnd(CONTENT_WIDTH - 2)}|`;
    }
    
    // Add dealer score if visible
    if (!state.playerTurn) {
        const scoreText = `${blackjackUI.getText('uiLabels.score')} ${state.dealerScore}`;
        tableLines[10] = `| ${scoreText.padEnd(CONTENT_WIDTH - 2)}|`;
    }
    
    // Add player hands
    if (state.handSplit) {
        let lineOffset = 13;
        
        for (let h = 0; h < state.playerHands.length; h++) {
            const hand = state.playerHands[h];
            const handCardLines = blackjackUI.handToAscii(hand.cards);
            
            // Highlight active hand
            const handPrefix = (h === state.activeHandIndex && state.playerTurn) ? '> ' : '  ';
            const activeText = h === state.activeHandIndex && state.playerTurn ? ' (active)' : '';
            
            // Update hand title
            const handTitle = `${blackjackUI.getText('uiLabels.hand', h + 1)} ${handPrefix}${blackjackUI.getText('uiLabels.bet')} ${hand.bet}  ` +
                             `${blackjackUI.getText('uiLabels.score')} ${hand.score}${activeText}`;
            tableLines[lineOffset + 1] = `| ${handTitle.padEnd(CONTENT_WIDTH - 2)}|`;
            
            // Add cards
            for (let i = 0; i < handCardLines.length; i++) {
                // Make sure the line doesn't exceed the content width
                const cardText = handCardLines[i].substring(0, CONTENT_WIDTH - 2);
                tableLines[lineOffset + 2 + i] = `| ${cardText.padEnd(CONTENT_WIDTH - 2)}|`;
            }
            
            lineOffset += 7; // Move to next hand
        }
    } else {
        const playerCardLines = blackjackUI.handToAscii(state.playerHand);
        
        for (let i = 0; i < playerCardLines.length; i++) {
            // Make sure the line doesn't exceed the content width
            const cardText = playerCardLines[i].substring(0, CONTENT_WIDTH - 2);
            tableLines[13 + i] = `| ${cardText.padEnd(CONTENT_WIDTH - 2)}|`;
        }
        
        // Add player score
        const scoreText = `${blackjackUI.getText('uiLabels.score')} ${state.playerScore}`;
        tableLines[18] = `| ${scoreText.padEnd(CONTENT_WIDTH - 2)}|`;
    }
    
    // Output the table
    blackjackUI.output(tableLines.join('\n'), true);
    
    // Re-append input at the end and focus it
    if (inputElement && blackjackUI.elements.terminal) {
        blackjackUI.elements.terminal.appendChild(inputElement);
        
        if (blackjackUI.elements.input) {
            setTimeout(() => {
                blackjackUI.elements.input.focus();
            }, 10);
        }
    }
};

/**
 * Format hand as ASCII art
 * @param {Array} hand - Hand of cards
 * @param {boolean} hideSecond - Whether to hide the second card
 * @returns {Array} Array of ASCII art lines
 */
blackjackUI.handToAscii = function(hand, hideSecond = false) {
    if (!hand || !hand.length) return ["", "", "", "", ""];
    
    // Create card representations
    const cardLines = hand.map((card, i) => window.utils.cardToAscii(card, hideSecond && i === 1));
    
    // Combine horizontally with proper spacing
    return window.utils.combineCardAscii(cardLines);
};

/**
 * Show available options/commands
 */
blackjackUI.showOptions = function() {
    const state = blackjackGame.state;
    if (!state.playerTurn) return;
    
    // Always use English commands
    const options = ['hit', 'stand'];
    if (state.canDouble) options.push('double');
    if (state.canSplit) options.push('split');
    if (state.canInsurance) options.push('insurance');
    if (state.canSurrender) options.push('surrender');
    
    blackjackUI.output(blackjackUI.getText('availableActions', options.join(", ")), false, 'info');
};

/**
 * Get translated text based on current language
 * @param {string} key - Translation key
 * @param  {...any} args - Arguments for translation function
 * @returns {string} Translated text
 */
blackjackUI.getText = function(key, ...args) {
    const language = blackjackGame.state.language || 'en';
    const langData = blackjackUI.translations[language] || blackjackUI.translations.en;
    
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