// DOM Elements
const terminal = document.getElementById('terminal');
const commandInput = document.getElementById('command-input');

// Game state
const game = {
    deck: [],
    playerHand: [],
    dealerHand: [],
    playerScore: 0,
    dealerScore: 0,
    money: 100,
    currentBet: 0,
    gameInProgress: false,
    playerTurn: true
};

// Card definitions
const suits = ['♥', '♦', '♣', '♠'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

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
    output("Welcome to Command Line Blackjack!");
    output("Type 'help' for a list of commands.");
    output(`You have $${game.money}.`);
}

// Output text to terminal
function output(text, isAsciiArt = false) {
    const element = document.createElement('div');
    element.textContent = text;
    
    if (isAsciiArt) {
        element.className = 'ascii-art';
    }
    
    terminal.appendChild(element);
    terminal.scrollTop = terminal.scrollHeight;
}

// Process commands
function processCommand(command) {
    // Echo command
    output(`> ${command}`);
    
    // Split command into parts
    const parts = command.trim().toLowerCase().split(' ');
    const cmd = parts[0];
    
    // Process command
    switch (cmd) {
        case 'help':
            showHelp();
            break;
        case 'bet':
            placeBet(parts[1]);
            break;
        case 'deal':
            startGame();
            break;
        case 'hit':
            hit();
            break;
        case 'stand':
            stand();
            break;
        case 'money':
            checkMoney();
            break;
        case 'clear':
            clearTerminal();
            break;
        default:
            output("Unknown command. Type 'help' for available commands.");
    }
}

// Show help
function showHelp() {
    output("Available commands:");
    output("  help   - Show this help message");
    output("  bet N  - Place a bet of N dollars");
    output("  deal   - Deal cards and start the game");
    output("  hit    - Take another card");
    output("  stand  - End your turn");
    output("  money  - Check your current balance");
    output("  clear  - Clear the terminal");
}

// Place a bet
function placeBet(amount) {
    if (game.gameInProgress) {
        output("Cannot place a bet during a game.");
        return;
    }
    
    const bet = parseInt(amount);
    
    if (isNaN(bet) || bet <= 0) {
        output("Please enter a valid bet amount.");
        return;
    }
    
    if (bet > game.money) {
        output("You don't have enough money for that bet.");
        return;
    }
    
    game.currentBet = bet;
    output(`Bet placed: $${bet}`);
    output("Type 'deal' to start the game.");
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
        output("A game is already in progress.");
        return;
    }
    
    if (game.currentBet <= 0) {
        output("You need to place a bet first. Use 'bet' command.");
        return;
    }
    
    // Initialize game state
    game.deck = createDeck();
    game.playerHand = [];
    game.dealerHand = [];
    game.playerTurn = true;
    game.gameInProgress = true;
    
    // Deal initial cards
    game.playerHand.push(dealCard());
    game.dealerHand.push(dealCard());
    game.playerHand.push(dealCard());
    game.dealerHand.push(dealCard());
    
    // Calculate scores
    game.playerScore = calculateHandValue(game.playerHand);
    game.dealerScore = calculateHandValue(game.dealerHand);
    
    // Display game state
    displayGameState();
    
    // Check for blackjack
    if (game.playerScore === 21) {
        if (game.dealerScore === 21) {
            // Push - both have blackjack
            output("Both have Blackjack! It's a tie.");
            endGame(true);
        } else {
            // Player has blackjack
            output("BLACKJACK! You win 3:2 on your bet!");
            game.money += Math.floor(game.currentBet * 1.5);
            endGame();
        }
    } else if (game.dealerScore === 21) {
        // Dealer has blackjack
        output("Dealer has Blackjack! You lose.");
        game.money -= game.currentBet;
        endGame();
    }
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

// Display simple ASCII card
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
    
    const value = card.value.padEnd(2);
    return [
        "+-----+",
        `|${value}   |`,
        `|  ${card.suit}  |`,
        `|   ${value}|`,
        "+-----+"
    ];
}

// Format hand as ASCII art
function handToAscii(hand, hideSecond = false) {
    if (hand.length === 0) return ["", "", "", "", ""];
    
    // Create card representations
    const cardLines = [];
    for (let i = 0; i < hand.length; i++) {
        cardLines.push(cardToAscii(hand[i], hideSecond && i === 1));
    }
    
    // Combine horizontally
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
    // Create ASCII table
    let tableArt = 
`+---------------------------------------------------------------+
|                         BLACKJACK                             |
+---------------------------------------------------------------+
|                                                               |
| DEALER:                                                       |
|                                                               |
|                                                               |
|                                                               |
|                                                               |
|                                                               |
+---------------------------------------------------------------+
|                                                               |
| PLAYER:                                                       |
|                                                               |
|                                                               |
|                                                               |
|                                                               |
|                                                               |
| Bet: $${game.currentBet.toString().padStart(3)}                      Money: $${game.money.toString().padStart(3)}      |
+---------------------------------------------------------------+`;

    const tableLines = tableArt.split('\n');
    
    // Add dealer cards
    const dealerCardLines = handToAscii(game.dealerHand, game.playerTurn);
    for (let i = 0; i < dealerCardLines.length; i++) {
        tableLines[4 + i] = `| ${dealerCardLines[i].padEnd(61)}|`;
    }
    
    // Add dealer score if visible
    if (!game.playerTurn) {
        tableLines[9] = `| Score: ${game.dealerScore.toString().padEnd(55)}|`;
    }
    
    // Add player cards
    const playerCardLines = handToAscii(game.playerHand);
    for (let i = 0; i < playerCardLines.length; i++) {
        tableLines[12 + i] = `| ${playerCardLines[i].padEnd(61)}|`;
    }
    
    // Add player score
    tableLines[17] = `| Score: ${game.playerScore.toString().padEnd(44)}Bet: $${game.currentBet.toString().padStart(3)}      Money: $${game.money.toString().padStart(3)}      |`;
    
    // Output the table
    output(tableLines.join('\n'), true);
    
    // Show game options
    if (game.playerTurn) {
        output("Type 'hit' to take another card or 'stand' to hold.");
    }
}

// Player takes another card
function hit() {
    if (!game.gameInProgress || !game.playerTurn) {
        output("You can't hit right now.");
        return;
    }
    
    // Deal a card to player
    game.playerHand.push(dealCard());
    game.playerScore = calculateHandValue(game.playerHand);
    
    // Display updated game state
    displayGameState();
    
    // Check for bust or 21
    if (game.playerScore > 21) {
        output("BUST! You went over 21. You lose.");
        game.money -= game.currentBet;
        endGame();
    } else if (game.playerScore === 21) {
        output("You have 21! Standing automatically.");
        stand();
    }
}

// Player stands
function stand() {
    if (!game.gameInProgress || !game.playerTurn) {
        output("You can't stand right now.");
        return;
    }
    
    game.playerTurn = false;
    output("You stand. Dealer's turn.");
    
    // Reveal dealer's hand
    displayGameState();
    
    // Dealer plays
    dealerPlay();
}

// Dealer's turn
function dealerPlay() {
    // Dealer hits until reaching 17 or higher
    while (game.dealerScore < 17) {
        output("Dealer hits.");
        game.dealerHand.push(dealCard());
        game.dealerScore = calculateHandValue(game.dealerHand);
        displayGameState();
    }
    
    // Determine winner
    if (game.dealerScore > 21) {
        output("Dealer BUSTS! You win!");
        game.money += game.currentBet;
        endGame();
    } else if (game.dealerScore > game.playerScore) {
        output("Dealer wins with " + game.dealerScore + ". You lose.");
        game.money -= game.currentBet;
        endGame();
    } else if (game.dealerScore < game.playerScore) {
        output("You win with " + game.playerScore + "!");
        game.money += game.currentBet;
        endGame();
    } else {
        output("It's a tie! Bet returned.");
        endGame(true); // Push
    }
}

// End the game
function endGame(push = false) {
    game.gameInProgress = false;
    
    if (!push) {
        output(`You now have $${game.money}.`);
    }
    
    if (game.money <= 0) {
        output("You're out of money! Game over.");
        return;
    }
    
    output("Type 'bet' to play again.");
}

// Check money command
function checkMoney() {
    output(`You have $${game.money}.`);
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