// DOM Elements
const terminal = document.getElementById('terminal');
const commandInput = document.getElementById('command-input');

// Color themes
const colorThemes = {
    green: { bg: '#000', text: '#0f0' },
    blue: { bg: '#000', text: '#00bfff' },
    amber: { bg: '#000', text: '#ffbf00' },
    white: { bg: '#000', text: '#fff' },
    matrix: { bg: '#000', text: '#00ff41' }
};

// Game state
const game = {
    deck: [],
    playerHand: [],
    playerHands: [],
    activeHandIndex: 0,
    dealerHand: [],
    playerScore: 0,
    dealerScore: 0,
    money: 100,
    currentBet: 0,
    insuranceBet: 0,
    gameInProgress: false,
    playerTurn: true,
    canSplit: false,
    canDouble: false,
    canInsurance: false,
    canSurrender: false,
    handSplit: false,
    language: 'en',
    colorTheme: 'green',
    firstGame: true
};

// Card definitions
const suits = ['♥', '♦', '♣', '♠'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Language translations
const translations = {
    en: {
        welcome: "Welcome to Command Line Blackjack!",
        helpPrompt: "Type 'help' for commands, 'language es' for Spanish, 'color' to change colors.",
        moneyStatus: `You have $${game.money}.`,
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
            help: "help",
            bet: "bet",
            deal: "deal",
            hit: "hit",
            stand: "stand",
            double: "double",
            split: "split",
            insurance: "insurance",
            surrender: "surrender",
            money: "money",
            clear: "clear",
            language: "language",
            color: "color"
        },
        helpText: [
            "Available commands:",
            "  help      - Show this help message",
            "  bet N     - Place a bet of N dollars",
            "  deal      - Start the game after placing a bet",
            "  hit       - Take another card",
            "  stand     - End your turn",
            "  double    - Double your bet and take one more card",
            "  split     - Split your hand when you have two cards of same value",
            "  insurance - Take insurance when dealer shows an Ace",
            "  surrender - Surrender and lose half your bet",
            "  money     - Check your current balance",
            "  clear     - Clear the terminal",
            "  language  - Change language (en/es)",
            "  color     - Change color theme"
        ],
        uiLabels: {
            dealer: "DEALER:",
            player: "PLAYER:",
            playerHands: "PLAYER HANDS:",
            hand: (num) => `Hand ${num}:`,
            score: "Score:",
            bet: "Bet:",
            money: "Money:",
            totalBet: "Total Bet:"
        }
    },
    es: {
        welcome: "¡Bienvenido al Blackjack de Línea de Comandos!",
        helpPrompt: "Escribe 'ayuda' para comandos, 'idioma en' para inglés, 'color' para cambiar colores.",
        moneyStatus: `Tienes $${game.money}.`,
        betPlaced: (bet) => `Apuesta colocada: $${bet}`,
        dealPrompt: "Escribe 'repartir' para comenzar el juego.",
        gameInProgress: "Ya hay un juego en progreso.",
        needBet: "Necesitas hacer una apuesta primero. Usa 'apostar'.",
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
        doubleDownBet: (bet) => `¡Doblando! La apuesta ahora es de $${bet}.`,
        standingAfterDouble: "Te plantas después de doblar. Turno del crupier.",
        cantSplit: "No puedes dividir ahora.",
        splitOnlyTwoCards: "Solo puedes dividir con dos cartas del mismo valor.",
        splittingHand: "¡Dividiendo tu mano!",
        playingHand: (num) => `Jugando mano ${num}...`,
        cantInsurance: "No puedes tomar seguro ahora.",
        aceNeededForInsurance: "El seguro solo está disponible cuando el crupier muestra un As.",
        takingInsurance: (cost) => `Tomando seguro por $${cost}.`,
        noBlackjackLoseInsurance: "El crupier no tiene Blackjack. Pierdes tu apuesta de seguro.",
        cantSurrender: "No puedes rendirte ahora.",
        surrendering: "Te rindes. Se te devuelve la mitad de tu apuesta.",
        dealerHits: "El crupier pide carta.",
        handBusted: (num) => `La mano ${num} ya se pasó.`,
        dealerBusts: "¡El crupier SE PASA! ¡Ganas!",
        dealerBustsHand: (num, bet) => `¡El crupier se pasa! La mano ${num} gana $${bet}.`,
        handWins: (num, score, dealerScore, bet) => `La mano ${num} gana con ${score} vs ${dealerScore} del crupier. Ganas $${bet}.`,
        handLoses: (num, score, dealerScore, bet) => `La mano ${num} pierde con ${score} vs ${dealerScore} del crupier. Pierdes $${bet}.`,
        handTies: (num, score) => `La mano ${num} empata con el crupier en ${score}. Se devuelve la apuesta.`,
        dealerWins: (score) => `El crupier gana con ${score}. Pierdes.`,
        playerWins: (score) => `¡Ganas con ${score}!`,
        tie: "¡Es un empate! Se devuelve la apuesta.",
        moneyLeft: (amount) => `Ahora tienes $${amount}.`,
        outOfMoney: "¡Te quedaste sin dinero! Fin del juego.",
        playAgain: "Escribe 'apostar' para jugar de nuevo.",
        unknownCommand: "Comando desconocido. Escribe 'ayuda' para comandos.",
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
            help: "ayuda",
            bet: "apostar",
            deal: "repartir",
            hit: "carta",
            stand: "plantarse",
            double: "doblar",
            split: "dividir",
            insurance: "seguro",
            surrender: "rendirse",
            money: "dinero",
            clear: "limpiar",
            language: "idioma",
            color: "color"
        },
        helpText: [
            "Comandos disponibles:",
            "  ayuda      - Mostrar este mensaje de ayuda",
            "  apostar N  - Realizar una apuesta de N dólares",
            "  repartir   - Comenzar el juego después de apostar",
            "  carta      - Pedir otra carta",
            "  plantarse  - Terminar tu turno",
            "  doblar     - Doblar tu apuesta y tomar una carta más",
            "  dividir    - Dividir tu mano cuando tienes dos cartas del mismo valor",
            "  seguro     - Tomar seguro cuando el crupier muestra un As",
            "  rendirse   - Rendirte y perder la mitad de tu apuesta",
            "  dinero     - Verificar tu saldo actual",
            "  limpiar    - Limpiar la terminal",
            "  idioma     - Cambiar idioma (en/es)",
            "  color      - Cambiar tema de color"
        ],
        uiLabels: {
            dealer: "CRUPIER:",
            player: "JUGADOR:",
            playerHands: "MANOS DEL JUGADOR:",
            hand: (num) => `Mano ${num}:`,
            score: "Puntos:",
            bet: "Apuesta:",
            money: "Dinero:",
            totalBet: "Apuesta Total:"
        }
    }
};

// Apply color theme to the UI
function applyColorTheme() {
    const theme = colorThemes[game.colorTheme];
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
    
    // Style the input elements
    commandInput.style.color = theme.text;
    
    // Style the command prompt and input line
    const inputLine = document.getElementById('input-line');
    const prompt = document.getElementById('prompt');
    
    if (inputLine) inputLine.style.borderColor = theme.text;
    if (prompt) prompt.style.color = theme.text;
}

// Function to get translated text
function getText(key, ...args) {
    const langData = translations[game.language];
    if (key.includes('.')) {
        const parts = key.split('.');
        let value = langData;
        for (const part of parts) {
            if (value && typeof value === 'object') {
                value = value[part];
            } else {
                value = undefined;
                break;
            }
        }
        if (typeof value === 'function') return value(...args);
        return value || key;
    }
    const text = langData[key];
    if (typeof text === 'function') return text(...args);
    return text || key;
}

// Function to get command in current language
function getCommand(cmd) {
    const langCommands = translations[game.language].commands;
    if (langCommands[cmd]) return langCommands[cmd];
    for (const [enCmd, translatedCmd] of Object.entries(langCommands)) {
        if (translatedCmd === cmd) return enCmd;
    }
    return cmd;
}

// Initialize game
function initGame() {
    const title = 
`
+--------------------------------------+
|                                      |
|          COMMAND LINE BLACKJACK      |
|                                      |
+--------------------------------------+
`;
    output(title, true);
    output(getText('welcome'));
    output(getText('helpPrompt'));
    output(getText('moneyStatus'));
    
    // Apply the current color theme
    applyColorTheme();
}

// Output text to terminal
function output(text, isAsciiArt = false) {
    const element = document.createElement('div');
    element.textContent = text;
    if (isAsciiArt) element.className = 'ascii-art';
    terminal.appendChild(element);
    terminal.scrollTop = terminal.scrollHeight;
}

// Change language
function changeLanguage(lang) {
    if (lang && (lang === 'en' || lang === 'es')) {
        game.language = lang;
        output(getText('languageChanged'));
    } else {
        output(getText('languageOptions'));
    }
}

// Change color theme
function changeColor(theme) {
    if (theme && colorThemes[theme]) {
        game.colorTheme = theme;
        applyColorTheme();
        output(getText('colorChanged', theme));
    } else {
        output(getText('colorOptions'));
    }
}

// Process commands
function processCommand(command) {
    output(`> ${command}`);
    const parts = command.trim().toLowerCase().split(' ');
    const cmd = parts[0];
    const enCmd = getCommand(cmd);
    
    switch (enCmd) {
        case 'help': showHelp(); break;
        case 'bet': placeBet(parts[1]); break;
        case 'deal': startGame(); break;
        case 'hit': hit(); break;
        case 'stand': stand(); break;
        case 'double': doubleDown(); break;
        case 'split': splitHand(); break;
        case 'insurance': takeInsurance(); break;
        case 'surrender': surrender(); break;
        case 'money': checkMoney(); break;
        case 'clear': clearTerminal(); break;
        case 'language': changeLanguage(parts[1]); break;
        case 'color': changeColor(parts[1]); break;
        default: output(getText('unknownCommand'));
    }
}

// Show help
function showHelp() {
    for (const line of getText('helpText')) {
        output(line);
    }
}

// Place a bet
function placeBet(amount) {
    if (game.gameInProgress) {
        output(getText('gameInProgress'));
        return;
    }
    
    const bet = parseInt(amount);
    if (isNaN(bet) || bet <= 0) {
        output(getText('invalidBet'));
        return;
    }
    
    if (bet > game.money) {
        output(getText('betTooHigh'));
        return;
    }
    
    game.currentBet = bet;
    output(getText('betPlaced', bet));
    
    // Auto-start the game unless it's the first game
    if (!game.firstGame) {
        startGame();
    } else {
        game.firstGame = false;
        output(getText('dealPrompt'));
    }
}

// Create a new shuffled deck
function createDeck() {
    const newDeck = [];
    for (const suit of suits) {
        for (const value of values) {
            newDeck.push({ suit, value });
        }
    }
    // Shuffle the deck (Fisher-Yates algorithm)
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
}

// Start a new game
function startGame() {
    if (game.gameInProgress) {
        output(getText('gameInProgress'));
        return;
    }
    
    if (game.currentBet <= 0) {
        output(getText('needBet'));
        return;
    }
    
    // Clear the screen and preserve just the important status
    const currentMoney = game.money;
    terminal.innerHTML = '';
    
    // Initialize game state
    game.deck = createDeck();
    game.playerHand = [];
    game.playerHands = [];
    game.activeHandIndex = 0;
    game.dealerHand = [];
    game.playerTurn = true;
    game.gameInProgress = true;
    game.handSplit = false;
    game.insuranceBet = 0;
    
    // Deal initial cards
    game.playerHand.push(dealCard());
    game.dealerHand.push(dealCard());
    game.playerHand.push(dealCard());
    game.dealerHand.push(dealCard());
    
    // Calculate scores
    game.playerScore = calculateHandValue(game.playerHand);
    game.dealerScore = calculateHandValue(game.dealerHand);
    
    // Set available actions
    game.canDouble = game.money >= game.currentBet;
    game.canSplit = (game.playerHand[0].value === game.playerHand[1].value || 
                getCardValue(game.playerHand[0]) === getCardValue(game.playerHand[1])) && 
                game.money >= game.currentBet;
    game.canInsurance = game.dealerHand[0].value === 'A' && game.money >= Math.ceil(game.currentBet / 2);
    game.canSurrender = true;
    
    // Display game state
    displayGameState();
    showOptions();
    
    // Check for blackjack
    if (game.playerScore === 21) {
        if (game.dealerScore === 21) {
            // Push - both have blackjack
            output(getText('blackjackTie'));
            endGame(true);
        } else {
            // Player has blackjack
            output(getText('blackjackWin'));
            game.money += Math.floor(game.currentBet * 1.5);
            endGame();
        }
    } else if (game.dealerScore === 21) {
        // Dealer has blackjack
        if (game.insuranceBet > 0) {
            output(getText('insurancePays'));
            game.money += game.insuranceBet * 2;
            game.money -= game.currentBet; // Still lose the main bet
        } else {
            output(getText('dealerBlackjack'));
            game.money -= game.currentBet;
        }
        endGame();
    }
}

// Card value for splitting logic
function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    if (card.value === 'A') return 11;
    return parseInt(card.value);
}

// Show available options
function showOptions() {
    if (!game.playerTurn) return;
    
    let options = [getText('commands.hit'), getText('commands.stand')];
    if (game.canDouble) options.push(getText('commands.double'));
    if (game.canSplit) options.push(getText('commands.split'));
    if (game.canInsurance) options.push(getText('commands.insurance'));
    if (game.canSurrender) options.push(getText('commands.surrender'));
    
    output(getText('availableActions', options.join(", ")));
}

// Deal a card from the deck
function dealCard() {
    return game.deck.pop();
}

// Calculate the value of a hand
function calculateHandValue(hand) {
    let value = 0;
    let aceCount = 0;
    
    // Sum up card values
    for (const card of hand) {
        if (card.value === 'A') {
            aceCount++;
            value += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            value += 10;
        } else {
            value += parseInt(card.value);
        }
    }
    
    // Adjust for aces if needed
    while (value > 21 && aceCount > 0) {
        value -= 10;
        aceCount--;
    }
    
    return value;
}

// Display ASCII card
function cardToAscii(card, hidden = false) {
    if (hidden) {
        return [
            "+-----+",
            "|#####|",
            "|#####|",
            "|#####|",
            "+-----+"
        ];
    }
    
    // Extract value and suit
    const value = card.value;
    const suit = card.suit;
    
    // Adjust for double-digit values (10)
    if (value.length > 1) {
        return [
            "+-----+",
            `|${value}   |`,
            `|  ${suit}  |`,
            `|   ${value}|`,
            "+-----+"
        ];
    } else {
        return [
            "+-----+",
            `|${value}    |`,
            `|  ${suit}  |`,
            `|    ${value}|`,
            "+-----+"
        ];
    }
}

// Format hand as ASCII art
function handToAscii(hand, hideSecond = false) {
    if (hand.length === 0) return ["", "", "", "", ""];
    
    // Create card representations
    const cardLines = [];
    for (let i = 0; i < hand.length; i++) {
        cardLines.push(cardToAscii(hand[i], hideSecond && i === 1));
    }
    
    // Combine horizontally with proper spacing
    const result = ["", "", "", "", ""];
    for (let row = 0; row < 5; row++) {
        for (let card = 0; card < cardLines.length; card++) {
            result[row] += cardLines[card][row] + " ";
        }
    }
    
    return result;
}

// Display game state
function displayGameState() {
    // Clear the terminal before displaying a new table
    terminal.innerHTML = '';
    
    let betInfo = '';
    
    if (game.handSplit) {
        // Show multiple bet amounts for split hands
        let totalBet = 0;
        game.playerHands.forEach(hand => totalBet += hand.bet);
        betInfo = `${getText('uiLabels.totalBet')} ${totalBet.toString().padStart(3)}`;
    } else {
        betInfo = `${getText('uiLabels.bet')} ${game.currentBet.toString().padStart(3)}`;
    }
    
    // Create ASCII table header
    let tableArt = 
`+---------------------------------------------------------------+
|                         BLACKJACK                             |
+---------------------------------------------------------------+
|                                                               |
| ${getText('uiLabels.dealer')}${' '.repeat(55)}|
|                                                               |
|                                                               |
|                                                               |
|                                                               |
|                                                               |
+---------------------------------------------------------------+`;

    // Add player section
    if (game.handSplit) {
        tableArt += `
|                                                               |
| ${getText('uiLabels.playerHands')}${' '.repeat(46)}|`;
        
        // Space for each hand
        for (let h = 0; h < game.playerHands.length; h++) {
            tableArt += `
|                                                               |
| ${getText('uiLabels.hand', h + 1)}${' '.repeat(52)}|
|                                                               |
|                                                               |
|                                                               |
|                                                               |
|                                                               |`;
        }
    } else {
        tableArt += `
|                                                               |
| ${getText('uiLabels.player')}${' '.repeat(53)}|
|                                                               |
|                                                               |
|                                                               |
|                                                               |
|                                                               |`;
    }
    
    // Add footer
    tableArt += `
| ${betInfo.padEnd(33)} ${getText('uiLabels.money')} ${game.money.toString().padStart(3)}${' '.repeat(18)}|
+---------------------------------------------------------------+`;

    const tableLines = tableArt.split('\n');
    
    // Add dealer cards
    const dealerCardLines = handToAscii(game.dealerHand, game.playerTurn);
    for (let i = 0; i < dealerCardLines.length; i++) {
        tableLines[4 + i] = `| ${dealerCardLines[i].padEnd(62)}|`;
    }
    
    // Add dealer score if visible
    if (!game.playerTurn) {
        tableLines[9] = `| ${getText('uiLabels.score')} ${game.dealerScore.toString().padEnd(55)}|`;
    }
    
    if (game.handSplit) {
        // Add each player hand
        let lineOffset = 12;
        for (let h = 0; h < game.playerHands.length; h++) {
            const hand = game.playerHands[h];
            const handCardLines = handToAscii(hand.cards);
            
            // Highlight active hand
            const handPrefix = (h === game.activeHandIndex && game.playerTurn) ? '> ' : '  ';
            
            // Update hand title with bet and score
            tableLines[lineOffset + 1] = `| ${getText('uiLabels.hand', h + 1)} ${handPrefix}${getText('uiLabels.bet')} ${hand.bet}  ${getText('uiLabels.score')} ${hand.score}${h === game.activeHandIndex && game.playerTurn ? ' (active)' : ''}`.padEnd(62) + '|';
            
            // Add cards
            for (let i = 0; i < handCardLines.length; i++) {
                tableLines[lineOffset + 2 + i] = `| ${handCardLines[i].padEnd(62)}|`;
            }
            
            lineOffset += 7; // Move to next hand section
        }
    } else {
        // Standard player hand display
        const playerCardLines = handToAscii(game.playerHand);
        for (let i = 0; i < playerCardLines.length; i++) {
            tableLines[12 + i] = `| ${playerCardLines[i].padEnd(62)}|`;
        }
        
        // Add player score
        tableLines[17] = `| ${getText('uiLabels.score')} ${game.playerScore.toString().padEnd(55)}|`;
    }
    
    // Output the table
    output(tableLines.join('\n'), true);
}

// Player takes another card
function hit() {
    if (!game.gameInProgress || !game.playerTurn) {
        output(getText('cantHit'));
        return;
    }
    
    // After first hit, player can no longer double, surrender, or take insurance
    game.canDouble = false;
    game.canSurrender = false;
    game.canInsurance = false;
    
    // Deal a card to player's current hand
    if (game.handSplit) {
        // When playing split hands
        const currentHand = game.playerHands[game.activeHandIndex];
        currentHand.cards.push(dealCard());
        currentHand.score = calculateHandValue(currentHand.cards);
        
        // Display updated game state
        displayGameState();
        
        // Check for bust or 21
        if (currentHand.score > 21) {
            output(getText('handBust', game.activeHandIndex + 1));
            game.money -= currentHand.bet;
            
            // Move to next hand or end game
            if (game.activeHandIndex < game.playerHands.length - 1) {
                game.activeHandIndex++;
                output(getText('playingHand', game.activeHandIndex + 1));
                // Reset options for new hand
                game.canDouble = true;
                displayGameState();
                showOptions();
            } else {
                // All hands are done, dealer's turn
                game.playerTurn = false;
                dealerPlay();
            }
        } else if (currentHand.score === 21) {
            output(getText('hand21', game.activeHandIndex + 1));
            
            // Move to next hand or end game
            if (game.activeHandIndex < game.playerHands.length - 1) {
                game.activeHandIndex++;
                output(getText('playingHand', game.activeHandIndex + 1));
                // Reset options for new hand
                game.canDouble = true;
                displayGameState();
                showOptions();
            } else {
                // All hands are done, dealer's turn
                game.playerTurn = false;
                dealerPlay();
            }
        } else {
            showOptions();
        }
    } else {
        // Standard single hand play
        game.playerHand.push(dealCard());
        game.playerScore = calculateHandValue(game.playerHand);
        
        // Display updated game state
        displayGameState();
        
        // Check for bust or 21
        if (game.playerScore > 21) {
            output(getText('bust'));
            game.money -= game.currentBet;
            endGame();
        } else if (game.playerScore === 21) {
            output(getText('have21'));
            stand();
        } else {
            showOptions();
        }
    }
}

// Player stands
function stand() {
    if (!game.gameInProgress || !game.playerTurn) {
        output(getText('cantStand'));
        return;
    }
    
    if (game.handSplit) {
        // When playing split hands
        output(getText('standingOnHand', game.activeHandIndex + 1));
        
        // Move to next hand or end game
        if (game.activeHandIndex < game.playerHands.length - 1) {
            game.activeHandIndex++;
            output(getText('playingHand', game.activeHandIndex + 1));
            // Reset options for new hand
            game.canDouble = true;
            displayGameState();
            showOptions();
        } else {
            // All hands are done, dealer's turn
            game.playerTurn = false;
            output(getText('allHandsComplete'));
            dealerPlay();
        }
    } else {
        // Standard single hand play
        game.playerTurn = false;
        output(getText('youStand'));
        
        // Reveal dealer's hand
        displayGameState();
        
        // Dealer plays
        dealerPlay();
    }
}

// Double Down
function doubleDown() {
    if (!game.gameInProgress || !game.playerTurn || !game.canDouble) {
        output(getText('cantDouble'));
        return;
    }
    
    if (game.handSplit) {
        // When playing split hands
        const currentHand = game.playerHands[game.activeHandIndex];
        
        // Double the bet for this hand
        if (game.money < currentHand.bet) {
            output(getText('notEnoughMoney'));
            return;
        }
        
        output(getText('doublingDown', game.activeHandIndex + 1));
        currentHand.bet *= 2;
        
        // Take exactly one more card
        currentHand.cards.push(dealCard());
        currentHand.score = calculateHandValue(currentHand.cards);
        
        // Display updated game state
        displayGameState();
        
        // Check result
        if (currentHand.score > 21) {
            output(getText('handBust', game.activeHandIndex + 1));
            game.money -= currentHand.bet;
        }
        
        // Move to next hand or end game
        if (game.activeHandIndex < game.playerHands.length - 1) {
            game.activeHandIndex++;
            output(getText('playingHand', game.activeHandIndex + 1));
            // Reset options for new hand
            game.canDouble = true;
            displayGameState();
            showOptions();
        } else {
            // All hands are done, dealer's turn
            game.playerTurn = false;
            dealerPlay();
        }
    } else {
        // Standard single hand play
        // Double the bet
        if (game.money < game.currentBet) {
            output(getText('notEnoughMoney'));
            return;
        }
        
        output(getText('doubleDownBet', game.currentBet * 2));
        game.currentBet *= 2;
        
        // Take exactly one more card and stand
        game.playerHand.push(dealCard());
        game.playerScore = calculateHandValue(game.playerHand);
        
        // Display updated game state
        displayGameState();
        
        // Check result
        if (game.playerScore > 21) {
            output(getText('bust'));
            game.money -= game.currentBet;
            endGame();
        } else {
            // Automatically stand after doubling
            game.playerTurn = false;
            output(getText('standingAfterDouble'));
            dealerPlay();
        }
    }
}

// Split Hand
function splitHand() {
    if (!game.gameInProgress || !game.playerTurn || !game.canSplit) {
        output(getText('cantSplit'));
        return;
    }
    
    // Need exactly two cards of same value
    if (game.playerHand.length !== 2 || 
        (game.playerHand[0].value !== game.playerHand[1].value && 
         getCardValue(game.playerHand[0]) !== getCardValue(game.playerHand[1]))) {
        output(getText('splitOnlyTwoCards'));
        return;
    }
    
    // Check if player has enough money for the additional bet
    if (game.money < game.currentBet) {
        output(getText('notEnoughMoney'));
        return;
    }
    
    output(getText('splittingHand'));
    
    // Set up split hands
    game.handSplit = true;
    game.playerHands = [
        {
            cards: [game.playerHand[0]],
            bet: game.currentBet,
            score: 0
        },
        {
            cards: [game.playerHand[1]],
            bet: game.currentBet,
            score: 0
        }
    ];
    
    // Deal one more card to each hand
    game.playerHands[0].cards.push(dealCard());
    game.playerHands[1].cards.push(dealCard());
    
    // Calculate scores
    game.playerHands[0].score = calculateHandValue(game.playerHands[0].cards);
    game.playerHands[1].score = calculateHandValue(game.playerHands[1].cards);
    
    // Set active hand to first one
    game.activeHandIndex = 0;
    
    // Reset options
    game.canSplit = false;
    game.canSurrender = false;
    game.canInsurance = false;
    game.canDouble = true;
    
    output(getText('playingHand', 1));
    displayGameState();
    showOptions();
}

// Take Insurance
function takeInsurance() {
    if (!game.gameInProgress || !game.playerTurn || !game.canInsurance) {
        output(getText('cantInsurance'));
        return;
    }
    
    // Dealer's up card must be an Ace
    if (game.dealerHand[0].value !== 'A') {
        output(getText('aceNeededForInsurance'));
        return;
    }
    
    // Insurance costs half the original bet
    const insuranceCost = Math.ceil(game.currentBet / 2);
    
    if (game.money < insuranceCost) {
        output(getText('notEnoughMoney'));
        return;
    }
    
    game.insuranceBet = insuranceCost;
    output(getText('takingInsurance', insuranceCost));
    
    // If dealer has blackjack, insurance pays 2:1
    if (game.dealerScore === 21) {
        output(getText('insurancePays'));
        game.money += game.insuranceBet * 2;
        game.money -= game.currentBet; // Still lose the main bet
        endGame();
    } else {
        output(getText('noBlackjackLoseInsurance'));
        game.money -= game.insuranceBet;
        // Game continues
        game.canInsurance = false;
        showOptions();
    }
}

// Surrender
function surrender() {
    if (!game.gameInProgress || !game.playerTurn || !game.canSurrender) {
        output(getText('cantSurrender'));
        return;
    }
    
    output(getText('surrendering'));
    game.money -= Math.floor(game.currentBet / 2);
    endGame();
}

// Dealer's turn
function dealerPlay() {
    // Dealer hits until reaching 17 or higher
    while (game.dealerScore < 17) {
        output(getText('dealerHits'));
        game.dealerHand.push(dealCard());
        game.dealerScore = calculateHandValue(game.dealerHand);
        displayGameState();
    }
    
    if (game.handSplit) {
        // For split hands, compare dealer with each hand
        let totalWinnings = 0;
        
        for (let i = 0; i < game.playerHands.length; i++) {
            const hand = game.playerHands[i];
            
            // Skip busted hands
            if (hand.score > 21) {
                output(getText('handBusted', i + 1));
                continue;
            }
            
            if (game.dealerScore > 21) {
                output(getText('dealerBustsHand', i + 1, hand.bet));
                totalWinnings += hand.bet;
            } else if (hand.score > game.dealerScore) {
                output(getText('handWins', i + 1, hand.score, game.dealerScore, hand.bet));
                totalWinnings += hand.bet;
            } else if (hand.score < game.dealerScore) {
                output(getText('handLoses', i + 1, hand.score, game.dealerScore, hand.bet));
                totalWinnings -= hand.bet;
            } else {
                output(getText('handTies', i + 1, hand.score));
            }
        }
        
        game.money += totalWinnings;
        endGame();
    } else {
        // Standard single hand resolution
        if (game.dealerScore > 21) {
            output(getText('dealerBusts'));
            game.money += game.currentBet;
            endGame();
        } else if (game.dealerScore > game.playerScore) {
            output(getText('dealerWins', game.dealerScore));
            game.money -= game.currentBet;
            endGame();
        } else if (game.dealerScore < game.playerScore) {
            output(getText('playerWins', game.playerScore));
            game.money += game.currentBet;
            endGame();
        } else {
            output(getText('tie'));
            endGame(true); // Push
        }
    }
}

// End the game
function endGame(push = false) {
    game.gameInProgress = false;
    
    if (!push) {
        output(getText('moneyLeft', game.money));
    }
    
    if (game.money <= 0) {
        output(getText('outOfMoney'));
        return;
    }
    
    output(getText('playAgain'));
}

// Check money command
function checkMoney() {
    output(getText('moneyStatus'));
}

// Clear terminal
function clearTerminal() {
    terminal.innerHTML = '';
    initGame();
}

// Event listener for command input
commandInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const command = commandInput.value.trim();
        if (command !== '') {
            processCommand(command);
            commandInput.value = '';
        }
    }
});

// Initialize the game on load
document.addEventListener('DOMContentLoaded', function() {
    initGame();
});