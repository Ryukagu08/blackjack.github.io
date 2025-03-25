// Cache DOM Elements
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
    deck: [], playerHand: [], playerHands: [], activeHandIndex: 0, dealerHand: [],
    playerScore: 0, dealerScore: 0, money: 100, currentBet: 0, insuranceBet: 0,
    gameInProgress: false, playerTurn: true, canSplit: false, canDouble: false,
    canInsurance: false, canSurrender: false, handSplit: false, language: 'en',
    colorTheme: 'green', firstGame: true
};

// Card definitions
const suits = ['♥', '♦', '♣', '♠'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const cardValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11 };

// Language translations - unchanged
const translations = {
    en: {
        welcome: "Welcome to Command Line Blackjack!",
        helpPrompt: "Type 'help' for commands, 'rules' for game rules, 'language es' for Spanish, 'color' to change colors.",
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
            help: "help", bet: "bet", deal: "deal", hit: "hit", stand: "stand", double: "double",
            split: "split", insurance: "insurance", surrender: "surrender", money: "money",
            clear: "clear", language: "language", color: "color", rules: "rules"
        },
        helpText: [
            "Available commands:",
            "  help      - Show this help message",
            "  rules     - Show Blackjack rules",
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
            dealer: "DEALER:", player: "PLAYER:", playerHands: "PLAYER HANDS:",
            hand: (num) => `Hand ${num}:`, score: "Score:", bet: "Bet:",
            money: "Money:", totalBet: "Total Bet:"
        }
    },
    es: {
        welcome: "¡Bienvenido al Blackjack de Línea de Comandos!",
        helpPrompt: "Escribe 'help' para comandos, 'rules' para reglas del juego, 'language en' para inglés, 'color' para cambiar colores.",
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
        moneyStatus: `Tienes $${game.money}.`,
        betPlaced: (bet) => `Apuesta colocada: $${bet}`,
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
            clear: "clear", language: "language", color: "color"
        },
        helpText: [
            "Comandos disponibles:",
            "  help      - Mostrar este mensaje de ayuda (ayuda)",
            "  rules     - Mostrar reglas del Blackjack (reglas)",
            "  bet N     - Realizar una apuesta de N dólares (apostar)",
            "  deal      - Comenzar el juego después de apostar (repartir)",
            "  hit       - Pedir otra carta (carta)",
            "  stand     - Terminar tu turno (plantarse)",
            "  double    - Doblar tu apuesta y tomar una carta más (doblar)",
            "  split     - Dividir tu mano cuando tienes dos cartas del mismo valor (dividir)",
            "  insurance - Tomar seguro cuando el crupier muestra un As (seguro)",
            "  surrender - Rendirte y perder la mitad de tu apuesta (rendirse)",
            "  money     - Verificar tu saldo actual (dinero)",
            "  clear     - Limpiar la terminal (limpiar)",
            "  language  - Cambiar idioma (en/es) (idioma)",
            "  color     - Cambiar tema de color (color)"
        ],
        uiLabels: {
            dealer: "CRUPIER:", player: "JUGADOR:", playerHands: "MANOS DEL JUGADOR:",
            hand: (num) => `Mano ${num}:`, score: "Puntos:", bet: "Apuesta:",
            money: "Dinero:", totalBet: "Apuesta Total:"
        }
    }
};

// Apply color theme - simplified
function applyColorTheme() {
    const theme = colorThemes[game.colorTheme];
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
    commandInput.style.color = theme.text;
    document.getElementById('input-line').style.borderColor = theme.text;
    document.getElementById('prompt').style.color = theme.text;
    document.documentElement.style.setProperty('--scrollbar-color', theme.text);
}

// Get translated text - optimized
function getText(key, ...args) {
    const langData = translations[game.language];
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
}

// Initialize game
function initGame() {
    terminal.innerHTML = 
`
+--------------------------------------+
|                                      |
|          COMMAND LINE BLACKJACK      |
|                                      |
+--------------------------------------+

${getText('welcome')}
${getText('helpPrompt')}
${getText('moneyStatus')}`;
    applyColorTheme();
}

// Output text to terminal - optimized
function output(text, isAsciiArt = false) {
    const div = document.createElement('div');
    div.textContent = text;
    if (isAsciiArt) div.className = 'ascii-art';
    terminal.appendChild(div);
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

// Process commands - optimized with direct method calls and Map for commands
const commandHandlers = {
    help: showHelp,
    rules: showRules,
    bet: placeBet,
    deal: startGame,
    hit: hit,
    stand: stand,
    double: doubleDown,
    split: splitHand,
    insurance: takeInsurance,
    surrender: surrender,
    money: checkMoney,
    clear: clearTerminal,
    language: changeLanguage,
    color: changeColor
};

function processCommand(command) {
    output(`> ${command}`);
    const parts = command.trim().toLowerCase().split(' ');
    const cmd = parts[0];
    
    const handler = commandHandlers[cmd];
    if (handler) {
        handler(parts[1]);
    } else {
        output(getText('unknownCommand'));
    }
}

// Show help & rules - optimized with for...of
function showHelp() {
    for (const line of getText('helpText')) output(line);
}

function showRules() {
    for (const line of getText('rulesText')) output(line);
}

// Place a bet - early returns for clarity
function placeBet(amount) {
    if (game.gameInProgress) {
        output(getText('gameInProgress'));
        return;
    }
    
    if (game.money <= 0) {
        output(getText('outOfMoney'));
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
    
    // Auto-start unless first game
    if (!game.firstGame) {
        startGame();
    } else {
        game.firstGame = false;
        output(getText('dealPrompt'));
    }
}

// Create a new shuffled deck - optimized with flatMap
function createDeck() {
    // Create all cards and shuffle
    const deck = suits.flatMap(suit => values.map(value => ({ suit, value })));
    
    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
}

// Start a new game - optimized flow
function startGame() {
    if (game.gameInProgress) {
        output(getText('gameInProgress'));
        return;
    }
    
    if (game.currentBet <= 0) {
        output(getText('needBet'));
        return;
    }
    
    // Clear and reset game state
    terminal.innerHTML = '';
    resetGameState();
    
    // Deal initial cards
    dealInitialCards();
    
    // Display game and check for blackjack
    displayGameState();
    showOptions();
    checkForBlackjack();
}

// Reset game state
function resetGameState() {
    game.deck = createDeck();
    game.playerHand = [];
    game.playerHands = [];
    game.activeHandIndex = 0;
    game.dealerHand = [];
    game.playerTurn = true;
    game.gameInProgress = true;
    game.handSplit = false;
    game.insuranceBet = 0;
}

// Deal initial cards
function dealInitialCards() {
    game.playerHand.push(dealCard());
    game.dealerHand.push(dealCard());
    game.playerHand.push(dealCard());
    game.dealerHand.push(dealCard());
    
    // Calculate scores
    game.playerScore = calculateHandValue(game.playerHand);
    game.dealerScore = calculateHandValue(game.dealerHand);
    
    // Set available actions
    game.canDouble = game.money >= game.currentBet;
    game.canSplit = (getCardValue(game.playerHand[0]) === getCardValue(game.playerHand[1])) && 
                    game.money >= game.currentBet;
    game.canInsurance = game.dealerHand[0].value === 'A' && game.money >= Math.ceil(game.currentBet / 2);
    game.canSurrender = true;
}

// Check for blackjack
function checkForBlackjack() {
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

// Card value - optimized using object lookup
function getCardValue(card) {
    return cardValues[card.value] || parseInt(card.value);
}

// Show available options
function showOptions() {
    if (!game.playerTurn) return;
    
    // Always use English commands
    const options = ['hit', 'stand'];
    if (game.canDouble) options.push('double');
    if (game.canSplit) options.push('split');
    if (game.canInsurance) options.push('insurance');
    if (game.canSurrender) options.push('surrender');
    
    output(getText('availableActions', options.join(", ")));
}

// Deal a card from the deck
function dealCard() {
    return game.deck.pop();
}

// Calculate the value of a hand - optimized using object lookup
function calculateHandValue(hand) {
    let value = 0;
    let aceCount = 0;
    
    for (const card of hand) {
        if (card.value === 'A') {
            aceCount++;
            value += 11;
        } else {
            value += cardValues[card.value] || parseInt(card.value);
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
    if (hidden) return ["+-----+", "|     |", "|     |", "|     |", "+-----+"];
    
    const value = card.value;
    const suit = card.suit;
    
    // Adjust for double-digit values (10)
    return value.length > 1 ? 
        ["+-----+", `|${value}   |`, `|  ${suit}  |`, `|   ${value}|`, "+-----+"] :
        ["+-----+", `|${value}    |`, `|  ${suit}  |`, `|    ${value}|`, "+-----+"];
}

// Format hand as ASCII art - simplified
function handToAscii(hand, hideSecond = false) {
    if (!hand.length) return ["", "", "", "", ""];
    
    // Create card representations
    const cardLines = hand.map((card, i) => cardToAscii(card, hideSecond && i === 1));
    
    // Combine horizontally with proper spacing
    const result = ["", "", "", "", ""];
    for (let row = 0; row < 5; row++) {
        for (let card = 0; card < cardLines.length; card++) {
            result[row] += cardLines[card][row] + " ";
        }
    }
    
    return result;
}

// Display game state - streamlined
function displayGameState() {
    terminal.innerHTML = '';
    
    // Get bet info
    let betInfo = game.handSplit ?
        `${getText('uiLabels.totalBet')} ${game.playerHands.reduce((sum, h) => sum + h.bet, 0).toString().padStart(3)}` :
        `${getText('uiLabels.bet')} ${game.currentBet.toString().padStart(3)}`;
    
    // Create base table
    let tableLines = createTableTemplate(betInfo);
    
    // Add dealer cards
    const dealerCardLines = handToAscii(game.dealerHand, game.playerTurn);
    for (let i = 0; i < dealerCardLines.length; i++) {
        tableLines[4 + i] = `| ${dealerCardLines[i].padEnd(62)}|`;
    }
    
    // Add dealer score if visible
    if (!game.playerTurn) {
        tableLines[9] = `| ${getText('uiLabels.score')} ${game.dealerScore.toString().padEnd(55)}|`;
    }
    
    // Add player hands
    if (game.handSplit) {
        addSplitHandsToTable(tableLines);
    } else {
        addSingleHandToTable(tableLines);
    }
    
    // Output the table
    output(tableLines.join('\n'), true);
}

// Create the base table template
function createTableTemplate(betInfo) {
    const dealerLabel = getText('uiLabels.dealer');
    const playerLabel = game.handSplit ? getText('uiLabels.playerHands') : getText('uiLabels.player');
    const moneyLabel = getText('uiLabels.money');
    
    let tableArt = 
`+---------------------------------------------------------------+
|                         BLACKJACK                             |
+---------------------------------------------------------------+
|                                                               |
| ${dealerLabel}${' '.repeat(55)}|
|                                                               |
|                                                               |
|                                                               |
|                                                               |
|                                                               |
+---------------------------------------------------------------+
|                                                               |
| ${playerLabel}${' '.repeat(game.handSplit ? 46 : 53)}|`;

    // Add player section(s)
    if (game.handSplit) {
        for (let h = 0; h < game.playerHands.length; h++) {
            const handLabel = getText('uiLabels.hand', h + 1);
            tableArt += `
|                                                               |
| ${handLabel}${' '.repeat(52)}|
|                                                               |
|                                                               |
|                                                               |
|                                                               |
|                                                               |`;
        }
    } else {
        tableArt += `
|                                                               |
|                                                               |
|                                                               |
|                                                               |
|                                                               |`;
    }
    
    // Add footer
    tableArt += `
| ${betInfo.padEnd(33)} ${moneyLabel} ${game.money.toString().padStart(3)}${' '.repeat(18)}|
+---------------------------------------------------------------+`;

    return tableArt.split('\n');
}

// Add split hands to the table
function addSplitHandsToTable(tableLines) {
    let lineOffset = 12;
    
    for (let h = 0; h < game.playerHands.length; h++) {
        const hand = game.playerHands[h];
        const handCardLines = handToAscii(hand.cards);
        
        // Highlight active hand
        const handPrefix = (h === game.activeHandIndex && game.playerTurn) ? '> ' : '  ';
        const activeText = h === game.activeHandIndex && game.playerTurn ? ' (active)' : '';
        
        // Update hand title
        tableLines[lineOffset + 1] = 
            `| ${getText('uiLabels.hand', h + 1)} ${handPrefix}${getText('uiLabels.bet')} ${hand.bet}  ` +
            `${getText('uiLabels.score')} ${hand.score}${activeText}`.padEnd(62) + '|';
        
        // Add cards
        for (let i = 0; i < handCardLines.length; i++) {
            tableLines[lineOffset + 2 + i] = `| ${handCardLines[i].padEnd(62)}|`;
        }
        
        lineOffset += 7; // Move to next hand
    }
}

// Add a single hand to the table
function addSingleHandToTable(tableLines) {
    const playerCardLines = handToAscii(game.playerHand);
    
    for (let i = 0; i < playerCardLines.length; i++) {
        tableLines[12 + i] = `| ${playerCardLines[i].padEnd(62)}|`;
    }
    
    // Add player score
    tableLines[17] = `| ${getText('uiLabels.score')} ${game.playerScore.toString().padEnd(55)}|`;
}

// Player takes another card - streamlined
function hit() {
    if (!game.gameInProgress || !game.playerTurn) {
        output(getText('cantHit'));
        return;
    }
    
    // Disable special moves after first hit
    game.canDouble = false;
    game.canSurrender = false;
    game.canInsurance = false;
    
    // Execute appropriate hit logic
    if (game.handSplit) {
        hitSplitHand();
    } else {
        hitSingleHand();
    }
}

// Hit on a single hand
function hitSingleHand() {
    game.playerHand.push(dealCard());
    game.playerScore = calculateHandValue(game.playerHand);
    displayGameState();
    
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

// Hit on a split hand
function hitSplitHand() {
    const currentHand = game.playerHands[game.activeHandIndex];
    currentHand.cards.push(dealCard());
    currentHand.score = calculateHandValue(currentHand.cards);
    displayGameState();
    
    if (currentHand.score > 21) {
        output(getText('handBust', game.activeHandIndex + 1));
        game.money -= currentHand.bet;
        moveToNextHandOrDealer();
    } else if (currentHand.score === 21) {
        output(getText('hand21', game.activeHandIndex + 1));
        moveToNextHandOrDealer();
    } else {
        showOptions();
    }
}

// Move to next hand or dealer play
function moveToNextHandOrDealer() {
    if (game.activeHandIndex < game.playerHands.length - 1) {
        game.activeHandIndex++;
        output(getText('playingHand', game.activeHandIndex + 1));
        game.canDouble = true;
        displayGameState();
        showOptions();
    } else {
        game.playerTurn = false;
        output(getText('allHandsComplete'));
        dealerPlay();
    }
}

// Player stands
function stand() {
    if (!game.gameInProgress || !game.playerTurn) {
        output(getText('cantStand'));
        return;
    }
    
    if (game.handSplit) {
        output(getText('standingOnHand', game.activeHandIndex + 1));
        moveToNextHandOrDealer();
    } else {
        game.playerTurn = false;
        output(getText('youStand'));
        displayGameState();
        dealerPlay();
    }
}

// Double down - streamlined
function doubleDown() {
    if (!game.gameInProgress || !game.playerTurn || !game.canDouble) {
        output(getText('cantDouble'));
        return;
    }
    
    if (game.handSplit) {
        doubleDownSplitHand();
    } else {
        doubleDownSingleHand();
    }
}

// Double down on split hand
function doubleDownSplitHand() {
    const currentHand = game.playerHands[game.activeHandIndex];
    
    if (game.money < currentHand.bet) {
        output(getText('notEnoughMoney'));
        return;
    }
    
    output(getText('doublingDown', game.activeHandIndex + 1));
    currentHand.bet *= 2;
    
    // Take exactly one more card
    currentHand.cards.push(dealCard());
    currentHand.score = calculateHandValue(currentHand.cards);
    displayGameState();
    
    if (currentHand.score > 21) {
        output(getText('handBust', game.activeHandIndex + 1));
        game.money -= currentHand.bet;
    }
    
    moveToNextHandOrDealer();
}

// Double down on single hand
function doubleDownSingleHand() {
    if (game.money < game.currentBet) {
        output(getText('notEnoughMoney'));
        return;
    }
    
    output(getText('doubleDownBet', game.currentBet * 2));
    game.currentBet *= 2;
    
    // Take one more card and stand
    game.playerHand.push(dealCard());
    game.playerScore = calculateHandValue(game.playerHand);
    displayGameState();
    
    if (game.playerScore > 21) {
        output(getText('bust'));
        game.money -= game.currentBet;
        endGame();
    } else {
        game.playerTurn = false;
        output(getText('standingAfterDouble'));
        dealerPlay();
    }
}

// Split hand - streamlined
function splitHand() {
    if (!game.gameInProgress || !game.playerTurn || !game.canSplit || 
        game.playerHand.length !== 2 || getCardValue(game.playerHand[0]) !== getCardValue(game.playerHand[1])) {
        output(getText(game.canSplit ? 'splitOnlyTwoCards' : 'cantSplit'));
        return;
    }
    
    if (game.money < game.currentBet) {
        output(getText('notEnoughMoney'));
        return;
    }
    
    output(getText('splittingHand'));
    
    // Set up split hands
    game.handSplit = true;
    game.playerHands = [
        { cards: [game.playerHand[0]], bet: game.currentBet, score: 0 },
        { cards: [game.playerHand[1]], bet: game.currentBet, score: 0 }
    ];
    
    // Deal one more card to each hand
    game.playerHands[0].cards.push(dealCard());
    game.playerHands[1].cards.push(dealCard());
    
    // Calculate scores
    game.playerHands[0].score = calculateHandValue(game.playerHands[0].cards);
    game.playerHands[1].score = calculateHandValue(game.playerHands[1].cards);
    
    // Reset game state
    game.activeHandIndex = 0;
    game.canSplit = false;
    game.canSurrender = false;
    game.canInsurance = false;
    game.canDouble = true;
    
    output(getText('playingHand', 1));
    displayGameState();
    showOptions();
}

// Take insurance - streamlined
function takeInsurance() {
    if (!game.gameInProgress || !game.playerTurn || !game.canInsurance || 
        game.dealerHand[0].value !== 'A') {
        output(getText(game.canInsurance ? 'aceNeededForInsurance' : 'cantInsurance'));
        return;
    }
    
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
        game.canInsurance = false;
        showOptions();
    }
}

// Surrender - streamlined
function surrender() {
    if (!game.gameInProgress || !game.playerTurn || !game.canSurrender) {
        output(getText('cantSurrender'));
        return;
    }
    
    output(getText('surrendering'));
    game.money -= Math.floor(game.currentBet / 2);
    endGame();
}

// Dealer's turn - streamlined with consolidated logic
function dealerPlay() {
    // Dealer hits until reaching 17 or higher
    while (game.dealerScore < 17) {
        output(getText('dealerHits'));
        game.dealerHand.push(dealCard());
        game.dealerScore = calculateHandValue(game.dealerHand);
        displayGameState();
    }
    
    // Resolve game based on hands
    game.handSplit ? resolveSplitHands() : resolveSingleHand();
}

// Resolve split hands
function resolveSplitHands() {
    let totalWinnings = 0;
    const dealerBusted = game.dealerScore > 21;
    
    for (let i = 0; i < game.playerHands.length; i++) {
        const hand = game.playerHands[i];
        
        // Skip busted hands
        if (hand.score > 21) {
            output(getText('handBusted', i + 1));
            continue;
        }
        
        if (dealerBusted) {
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
}

// Resolve single hand
function resolveSingleHand() {
    if (game.dealerScore > 21) {
        output(getText('dealerBusts'));
        game.money += game.currentBet;
    } else if (game.dealerScore > game.playerScore) {
        output(getText('dealerWins', game.dealerScore));
        game.money -= game.currentBet;
    } else if (game.dealerScore < game.playerScore) {
        output(getText('playerWins', game.playerScore));
        game.money += game.currentBet;
    } else {
        output(getText('tie'));
        endGame(true); // Push
        return;
    }
    endGame();
}

// End the game
function endGame(push = false) {
    game.gameInProgress = false;
    
    if (!push) {
        output(getText('moneyLeft', game.money));
    }
    
    if (game.money <= 0) {
        output(getText('outOfMoney'));
        game.currentBet = 0; // Reset bet when out of money to prevent further play
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
commandInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && commandInput.value.trim()) {
        processCommand(commandInput.value.trim());
        commandInput.value = '';
    }
});

// Initialize the game on load
document.addEventListener('DOMContentLoaded', initGame);