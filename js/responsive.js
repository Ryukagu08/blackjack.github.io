/**
 * responsive.js - Responsive layout adjustments for mobile devices
 * This script handles layout adjustments for the blackjack game on mobile
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initial execution
    adjustForMobile();
    
    // Also run when window is resized
    window.addEventListener('resize', adjustForMobile);
    
    // Run when game screen becomes active or when cards are dealt
    const observer = new MutationObserver(function(mutations) {
        if (document.getElementById('blackjack-screen').classList.contains('active')) {
            adjustForMobile();
        }
    });
    
    // Observe the blackjack table for any changes
    const blackjackScreen = document.getElementById('blackjack-screen');
    if (blackjackScreen) {
        observer.observe(blackjackScreen, { 
            attributes: true,
            childList: true, 
            subtree: true
        });
    }
});

/**
 * Adjust layout based on screen size
 */
function adjustForMobile() {
    const isMobileDevice = window.innerWidth < 768;
    
    if (isMobileDevice) {
        console.log('Mobile device detected - adjusting layout');
        
        // Hide terminal on mobile
        const terminal = document.querySelector('.game-terminal');
        if (terminal) {
            terminal.style.display = 'none';
        }
        
        // Give full width to game content
        const gameContent = document.querySelector('.game-content');
        if (gameContent) {
            gameContent.style.width = '100%';
            gameContent.style.padding = '10px 5px';
        }
        
        // Optimize header elements
        optimizeHeader();
        
        // Adjust card sizes and game areas
        optimizeGameAreas();
        
        // Optimize action buttons
        optimizeButtons();
        
        // Optimize chip layout
        optimizeChips();
    } else {
        // Reset styles for desktop
        resetToDesktopLayout();
    }
}

/**
 * Optimize header elements (title, menu button, balance)
 */
function optimizeHeader() {
    const header = document.querySelector('.game-header');
    if (!header) return;
    
    // Make header more compact and properly aligned
    header.style.padding = '5px';
    header.style.marginBottom = '10px';
    
    // Scale down menu button
    const menuButton = document.querySelector('.back-btn');
    if (menuButton) {
        menuButton.style.padding = '5px 10px';
        menuButton.style.fontSize = '0.8rem';
        menuButton.style.minWidth = 'unset';
        menuButton.style.width = 'auto';
    }
    
    // Scale down and reformat balance display
    const balance = document.querySelector('.balance');
    if (balance) {
        balance.style.padding = '5px 10px';
        balance.style.fontSize = '0.8rem';
    }
    
    // Center and scale down game title
    const title = document.querySelector('.game-title');
    if (title) {
        if (window.innerWidth < 360) {
            title.style.fontSize = '1rem';
        } else if (window.innerWidth < 480) {
            title.style.fontSize = '1.2rem';
        } else {
            title.style.fontSize = '1.5rem';
        }
        title.style.position = 'static';
        title.style.transform = 'none';
        header.style.justifyContent = 'space-between';
        title.style.margin = '0 5px';
    }
}

/**
 * Optimize game areas and card sizes
 */
function optimizeGameAreas() {
    // Adjust dealer and player areas
    const dealerArea = document.querySelector('.dealer-area');
    const playerArea = document.querySelector('.player-area');
    
    if (dealerArea && playerArea) {
        // Set appropriate heights
        dealerArea.style.height = 'auto';
        playerArea.style.height = 'auto';
        dealerArea.style.minHeight = '120px';
        playerArea.style.minHeight = '120px';
        dealerArea.style.margin = '0 0 10px 0';
        playerArea.style.margin = '0 0 10px 0';
        
        // Ensure scores are visible
        const scores = document.querySelectorAll('.score');
        scores.forEach(score => {
            score.style.fontSize = '1.2rem';
            score.style.padding = '3px 10px';
        });
    }
    
    // Make table take appropriate height
    const table = document.querySelector('.blackjack-table');
    if (table) {
        table.style.height = 'auto';
        table.style.padding = '10px';
        table.style.gap = '10px';
    }
    
    // Adjust card sizes
    const cardElements = document.querySelectorAll('.card');
    const screenWidth = window.innerWidth;
    
    let cardWidth, cardHeight;
    
    // Scale cards based on screen width
    if (screenWidth < 360) {
        // Extra small phones
        cardWidth = 50;
        cardHeight = 75;
    } else if (screenWidth < 480) {
        // Small phones
        cardWidth = 55;
        cardHeight = 80;
    } else {
        // Larger phones
        cardWidth = 60;
        cardHeight = 90;
    }
    
    // Apply sizes to all cards
    cardElements.forEach(card => {
        card.style.width = `${cardWidth}px`;
        card.style.height = `${cardHeight}px`;
        
        // Also adjust font sizes inside cards
        const topLeft = card.querySelector('.card-top-left');
        const bottomRight = card.querySelector('.card-bottom-right');
        const center = card.querySelector('.card-center');
        
        if (topLeft) topLeft.style.fontSize = screenWidth < 400 ? '0.9rem' : '1rem';
        if (bottomRight) bottomRight.style.fontSize = screenWidth < 400 ? '0.9rem' : '1rem';
        if (center) center.style.fontSize = screenWidth < 400 ? '1.4rem' : '1.6rem';
    });
    
    // Adjust card containers to have appropriate spacing
    const cardsContainers = document.querySelectorAll('.cards-container');
    cardsContainers.forEach(container => {
        container.style.gap = `${Math.max(5, Math.floor(screenWidth * 0.02))}px`;
    });
}

/**
 * Optimize action buttons
 */
function optimizeButtons() {
    // Adjust action buttons section
    const actionButtons = document.getElementById('action-buttons');
    if (!actionButtons) return;
    
    // Set appropriate styles for the action button container
    actionButtons.style.display = 'flex';
    actionButtons.style.flexDirection = 'row';
    actionButtons.style.justifyContent = 'space-between';
    actionButtons.style.padding = '0';
    actionButtons.style.gap = '5px';
    actionButtons.style.width = '100%';
    actionButtons.style.marginTop = '5px';
    
    // Style individual buttons based on screen size
    const buttons = actionButtons.querySelectorAll('button');
    const screenWidth = window.innerWidth;
    
    let buttonWidth, buttonPadding, buttonFontSize;
    
    // Scale buttons based on screen width
    if (screenWidth < 330) {
        // Ultra small screens
        buttonWidth = '30%';
        buttonPadding = '6px 0';
        buttonFontSize = '0.75rem';
    } else if (screenWidth < 360) {
        // Very small screens
        buttonWidth = '31%';
        buttonPadding = '7px 0';
        buttonFontSize = '0.8rem';
    } else if (screenWidth < 480) {
        // Small screens
        buttonWidth = '32%';
        buttonPadding = '8px 0';
        buttonFontSize = '0.85rem';
    } else {
        // Regular mobile screens
        buttonWidth = '32%';
        buttonPadding = '10px 0';
        buttonFontSize = '0.9rem';
    }
    
    buttons.forEach(button => {
        button.style.width = buttonWidth;
        button.style.margin = '0';
        button.style.padding = buttonPadding;
        button.style.fontSize = buttonFontSize;
        button.style.minWidth = 'unset';
        button.style.borderRadius = screenWidth < 360 ? '3px' : '4px';
    });
    
    // Also adjust deal button
    const dealBtn = document.getElementById('deal-btn');
    if (dealBtn) {
        dealBtn.style.padding = '8px 20px';
        dealBtn.style.fontSize = '0.9rem';
        dealBtn.style.margin = '5px 0';
        dealBtn.style.minWidth = 'unset';
        dealBtn.style.width = 'auto';
    }
    
    // Adjust main control section
    const controlSection = document.querySelector('.control-section');
    if (controlSection) {
        controlSection.style.gap = '5px';
        controlSection.style.marginTop = '10px';
    }
    
    // Adjust game controls area
    const gameControls = document.querySelector('.game-controls');
    if (gameControls) {
        gameControls.style.paddingTop = '10px';
        gameControls.style.gap = '5px';
    }
}

/**
 * Optimize betting chips
 */
function optimizeChips() {
    const chipContainer = document.querySelector('.chip-container');
    if (!chipContainer) return;
    
    // Set appropriate size for chips based on screen size
    const chips = document.querySelectorAll('.chip');
    let chipSize;
    
    if (window.innerWidth < 360) {
        chipSize = 40;
        chipContainer.style.gap = '5px';
    } else if (window.innerWidth < 480) {
        chipSize = 45;
        chipContainer.style.gap = '8px';
    } else {
        chipSize = 50;
        chipContainer.style.gap = '10px';
    }
    
    // Apply sizes to all chips
    chips.forEach(chip => {
        chip.style.width = `${chipSize}px`;
        chip.style.height = `${chipSize}px`;
        chip.style.fontSize = `${chipSize * 0.4}px`;
        chip.style.borderWidth = `${Math.max(3, chipSize * 0.1)}px`;
    });
    
    // Optimize current bet display
    const currentBet = document.querySelector('.current-bet');
    if (currentBet) {
        currentBet.style.fontSize = '1rem';
        currentBet.style.padding = '5px 10px';
        currentBet.style.margin = '5px 0';
    }
    
    // Optimize chip container layout
    chipContainer.style.display = 'flex';
    chipContainer.style.justifyContent = 'center';
    chipContainer.style.alignItems = 'center';
    chipContainer.style.flexWrap = 'wrap';
}

/**
 * Reset to desktop layout
 */
function resetToDesktopLayout() {
    // Show terminal again
    const terminal = document.querySelector('.game-terminal');
    if (terminal) {
        terminal.style.display = 'block';
    }
    
    // Reset game content width
    const gameContent = document.querySelector('.game-content');
    if (gameContent) {
        gameContent.style.width = '60%';
        gameContent.style.padding = '10px';
    }
    
    // Reset all dynamically added styles
    const elements = document.querySelectorAll('.game-header, .back-btn, .balance, .game-title, ' +
                                             '.dealer-area, .player-area, .score, .blackjack-table, ' +
                                             '.card, .card-top-left, .card-bottom-right, .card-center, ' +
                                             '.cards-container, .chip, .chip-container, .current-bet, ' +
                                             '#deal-btn, #action-buttons, #action-buttons button, ' +
                                             '.control-section, .game-controls');
    
    elements.forEach(el => {
        if (el) el.removeAttribute('style');
    });
}