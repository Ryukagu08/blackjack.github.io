// DOM Elements
const terminal = document.getElementById('terminal');
const commandInput = document.getElementById('command-input');

// Game state
const game = {
    deck: [],
    playerHand: [],
    playerHands: [],    // For split hands
    activeHandIndex: 0, // Current hand being played
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
    handSplit: false
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
        case 'double':
            doubleDown();
            break;
        case 'split':
            splitHand();
            break;
        case 'insurance':
            takeInsurance();
            break;
        case 'surrender':
            surrender();
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
    output("  help      - Show this help message");
    output("  bet N     - Place a bet of N dollars");
    output("  deal      - Deal cards and start the game");
    output("  hit       - Take another card");
    output("  stand     - End your turn");
    output("  double    - Double your bet and take one more card");
    output("  split     - Split your hand when you have two cards of same value");
    output("  insurance - Take insurance when dealer shows an Ace");
    output("  surrender - Surrender and lose half your bet");
    output("  money     - Check your current balance");
    output("  clear     - Clear the terminal");
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
    
    // Check if player can double (always allowed on initial hand)
    game.canDouble = game.money >= game.currentBet;
    
    // Check if player can split (two cards of same value)
    game.canSplit = (game.playerHand[0].value === game.playerHand[1].value || 
                    getCardValue(game.playerHand[0]) === getCardValue(game.playerHand[1])) && 
                    game.money >= game.currentBet;
    
    // Check if player can take insurance (dealer shows an Ace)
    game.canInsurance = game.dealerHand[0].value === 'A' && game.money >= Math.ceil(game.currentBet / 2);
    
    // Check if player can surrender (always allowed on initial hand)
    game.canSurrender = true;
    
    // Display game state
    displayGameState();
    
    // Show available options
    showOptions();
    
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
        if (game.insuranceBet > 0) {
            output("Dealer has Blackjack! Your insurance pays 2:1.");
            game.money += game.insuranceBet * 2;
            game.money -= game.currentBet; // Still lose the main bet
        } else {
            output("Dealer has Blackjack! You lose.");
            game.money -= game.currentBet;
        }
        endGame();
    }
}

// Get card value (used for splitting logic)
function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) {
        return 10;
    } else if (card.value === 'A') {
        return 11;
    } else {
        return parseInt(card.value);
    }
}

// Show available options based on game state
function showOptions() {
    if (!game.playerTurn) return;
    
    let options = ["hit", "stand"];
    
    if (game.canDouble) options.push("double");
    if (game.canSplit) options.push("split");
    if (game.canInsurance) options.push("insurance");
    if (game.canSurrender) options.push("surrender");
    
    output("Available actions: " + options.join(", "));
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

// Display simple ASCII card with dashed borders
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
    
    // Create card with proper formatting to match screenshot
    // Adjust spacing based on value length (for double digits like "10")
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
    let betInfo = '';
    
    if (game.handSplit) {
        // Show multiple bet amounts for split hands
        let totalBet = 0;
        game.playerHands.forEach(hand => totalBet += hand.bet);
        betInfo = `Total Bet: ${totalBet.toString().padStart(3)}`;
    } else {
        betInfo = `Bet: ${game.currentBet.toString().padStart(3)}`;
    }
    
    // Create ASCII table header
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
+---------------------------------------------------------------+`;

    // Split hand display requires more space
    if (game.handSplit) {
        tableArt += `
|                                                               |
| PLAYER HANDS:                                                 |`;
        
        // Add space for each hand
        for (let h = 0; h < game.playerHands.length; h++) {
            tableArt += `
|                                                               |
| Hand ${h + 1}:                                                        |
|                                                               |
|                                                               |
|                                                               |
|                                                               |
|                                                               |`;
        }
    } else {
        tableArt += `
|                                                               |
| PLAYER:                                                       |
|                                                               |
|                                                               |
|                                                               |
|                                                               |
|                                                               |`;
    }
    
    // Add footer
    tableArt += `
| ${betInfo.padEnd(33)} Money: ${game.money.toString().padStart(3)}                  |
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
    
    if (game.handSplit) {
        // Add each player hand
        let lineOffset = 12;
        
        for (let h = 0; h < game.playerHands.length; h++) {
            const hand = game.playerHands[h];
            const handCardLines = handToAscii(hand.cards);
            
            // Highlight active hand
            const handPrefix = (h === game.activeHandIndex && game.playerTurn) ? '> ' : '  ';
            
            // Update hand title with bet and score
            tableLines[lineOffset + 1] = `| Hand ${h + 1}: ${handPrefix}Bet: ${hand.bet}  Score: ${hand.score}${h === game.activeHandIndex && game.playerTurn ? ' (active)' : ''}`.padEnd(62) + '|';
            
            // Add cards
            for (let i = 0; i < handCardLines.length; i++) {
                tableLines[lineOffset + 2 + i] = `| ${handCardLines[i].padEnd(61)}|`;
            }
            
            lineOffset += 7; // Move to next hand section
        }
    } else {
        // Standard player hand display
        const playerCardLines = handToAscii(game.playerHand);
        for (let i = 0; i < playerCardLines.length; i++) {
            tableLines[12 + i] = `| ${playerCardLines[i].padEnd(61)}|`;
        }
        
        // Add player score
        tableLines[17] = `| Score: ${game.playerScore.toString().padEnd(55)}|`;
    }
    
    // Output the table
    output(tableLines.join('\n'), true);
}

// Player takes another card
function hit() {
    if (!game.gameInProgress || !game.playerTurn) {
        output("You can't hit right now.");
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
            output(`Hand ${game.activeHandIndex + 1} BUSTS! You lose this hand's bet.`);
            game.money -= currentHand.bet;
            
            // Move to next hand or end game
            if (game.activeHandIndex < game.playerHands.length - 1) {
                game.activeHandIndex++;
                output(`Playing hand ${game.activeHandIndex + 1}...`);
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
            output(`Hand ${game.activeHandIndex + 1} has 21! Standing automatically.`);
            
            // Move to next hand or end game
            if (game.activeHandIndex < game.playerHands.length - 1) {
                game.activeHandIndex++;
                output(`Playing hand ${game.activeHandIndex + 1}...`);
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
            output("BUST! You went over 21. You lose.");
            game.money -= game.currentBet;
            endGame();
        } else if (game.playerScore === 21) {
            output("You have 21! Standing automatically.");
            stand();
        } else {
            showOptions();
        }
    }
}

// Player stands
function stand() {
    if (!game.gameInProgress || !game.playerTurn) {
        output("You can't stand right now.");
        return;
    }
    
    if (game.handSplit) {
        // When playing split hands
        output(`Standing on hand ${game.activeHandIndex + 1}.`);
        
        // Move to next hand or end game
        if (game.activeHandIndex < game.playerHands.length - 1) {
            game.activeHandIndex++;
            output(`Playing hand ${game.activeHandIndex + 1}...`);
            // Reset options for new hand
            game.canDouble = true;
            displayGameState();
            showOptions();
        } else {
            // All hands are done, dealer's turn
            game.playerTurn = false;
            output("All hands complete. Dealer's turn.");
            dealerPlay();
        }
    } else {
        // Standard single hand play
        game.playerTurn = false;
        output("You stand. Dealer's turn.");
        
        // Reveal dealer's hand
        displayGameState();
        
        // Dealer plays
        dealerPlay();
    }
}

// Double Down
function doubleDown() {
    if (!game.gameInProgress || !game.playerTurn || !game.canDouble) {
        output("You can't double down right now.");
        return;
    }
    
    if (game.handSplit) {
        // When playing split hands
        const currentHand = game.playerHands[game.activeHandIndex];
        
        // Double the bet for this hand
        if (game.money < currentHand.bet) {
            output("You don't have enough money to double down.");
            return;
        }
        
        output(`Doubling down on hand ${game.activeHandIndex + 1}.`);
        currentHand.bet *= 2;
        
        // Take exactly one more card
        currentHand.cards.push(dealCard());
        currentHand.score = calculateHandValue(currentHand.cards);
        
        // Display updated game state
        displayGameState();
        
        // Check result
        if (currentHand.score > 21) {
            output(`Hand ${game.activeHandIndex + 1} BUSTS! You lose this hand's bet.`);
            game.money -= currentHand.bet;
        }
        
        // Move to next hand or end game
        if (game.activeHandIndex < game.playerHands.length - 1) {
            game.activeHandIndex++;
            output(`Playing hand ${game.activeHandIndex + 1}...`);
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
            output("You don't have enough money to double down.");
            return;
        }
        
        output("Doubling down! Bet is now $" + (game.currentBet * 2) + ".");
        game.currentBet *= 2;
        
        // Take exactly one more card and stand
        game.playerHand.push(dealCard());
        game.playerScore = calculateHandValue(game.playerHand);
        
        // Display updated game state
        displayGameState();
        
        // Check result
        if (game.playerScore > 21) {
            output("BUST! You went over 21. You lose $" + game.currentBet + ".");
            game.money -= game.currentBet;
            endGame();
        } else {
            // Automatically stand after doubling
            game.playerTurn = false;
            output("Standing automatically after double down. Dealer's turn.");
            dealerPlay();
        }
    }
}

// Split Hand
function splitHand() {
    if (!game.gameInProgress || !game.playerTurn || !game.canSplit) {
        output("You can't split right now.");
        return;
    }
    
    // Need exactly two cards of same value
    if (game.playerHand.length !== 2 || 
        (game.playerHand[0].value !== game.playerHand[1].value && 
         getCardValue(game.playerHand[0]) !== getCardValue(game.playerHand[1]))) {
        output("You can only split with two cards of the same value.");
        return;
    }
    
    // Check if player has enough money for the additional bet
    if (game.money < game.currentBet) {
        output("You don't have enough money to split.");
        return;
    }
    
    output("Splitting your hand!");
    
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
    
    output("Playing hand 1...");
    displayGameState();
    showOptions();
}

// Take Insurance
function takeInsurance() {
    if (!game.gameInProgress || !game.playerTurn || !game.canInsurance) {
        output("You can't take insurance right now.");
        return;
    }
    
    // Dealer's up card must be an Ace
    if (game.dealerHand[0].value !== 'A') {
        output("Insurance is only available when the dealer shows an Ace.");
        return;
    }
    
    // Insurance costs half the original bet
    const insuranceCost = Math.ceil(game.currentBet / 2);
    
    if (game.money < insuranceCost) {
        output("You don't have enough money for insurance.");
        return;
    }
    
    game.insuranceBet = insuranceCost;
    output(`Taking insurance for ${insuranceCost}.`);
    
    // If dealer has blackjack, insurance pays 2:1
    if (game.dealerScore === 21) {
        output("Dealer has Blackjack! Your insurance pays 2:1.");
        game.money += game.insuranceBet * 2;
        game.money -= game.currentBet; // Still lose the main bet
        endGame();
    } else {
        output("Dealer does not have Blackjack. You lose your insurance bet.");
        game.money -= game.insuranceBet;
        // Game continues
        game.canInsurance = false;
        showOptions();
    }
}

// Surrender
function surrender() {
    if (!game.gameInProgress || !game.playerTurn || !game.canSurrender) {
        output("You can't surrender right now.");
        return;
    }
    
    output("You surrender. Half your bet is returned.");
    game.money -= Math.floor(game.currentBet / 2);
    endGame();
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
    
    if (game.handSplit) {
        // For split hands, compare dealer with each hand
        let totalWinnings = 0;
        
        for (let i = 0; i < game.playerHands.length; i++) {
            const hand = game.playerHands[i];
            
            // Skip busted hands
            if (hand.score > 21) {
                output(`Hand ${i + 1} already busted.`);
                continue;
            }
            
            if (game.dealerScore > 21) {
                output(`Dealer busts! Hand ${i + 1} wins ${hand.bet}.`);
                totalWinnings += hand.bet;
            } else if (hand.score > game.dealerScore) {
                output(`Hand ${i + 1} wins with ${hand.score} vs dealer's ${game.dealerScore}. You win ${hand.bet}.`);
                totalWinnings += hand.bet;
            } else if (hand.score < game.dealerScore) {
                output(`Hand ${i + 1} loses with ${hand.score} vs dealer's ${game.dealerScore}. You lose ${hand.bet}.`);
                totalWinnings -= hand.bet;
            } else {
                output(`Hand ${i + 1} ties with dealer at ${hand.score}. Bet returned.`);
            }
        }
        
        game.money += totalWinnings;
        endGame();
    } else {
        // Standard single hand resolution
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