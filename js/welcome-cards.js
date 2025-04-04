/**
 * welcome-cards.js - Handles the interactive game cards on the welcome screen
 * Optimized version focusing on interactions and viewport height.
 */

// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize viewport height fix
    fixViewportHeight();

    // Set up game card interaction
    setupGameCards();

    // Add keyboard navigation
    setupKeyboardNavigation();

    // Add animation effects
    addAnimationEffects();

    // Set initial body overflow based on active screen
    updateBodyOverflow();

    // Watch for screen changes to manage body overflow
    setupScreenChangeObserver();

    // Reapply viewport height fix on resize
    window.addEventListener('resize', fixViewportHeight);
});

/**
 * Fix viewport height issues on mobile browsers
 */
function fixViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

/**
 * Set up game card click handlers
 */
function setupGameCards() {
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach(card => {
        // Handle click on the whole card
        card.addEventListener('click', (e) => {
            // Ensure click isn't on the button itself if it has its own handler
            if (!e.target.closest('.card-play-btn')) {
                handleCardSelection(card);
            }
        });

        // Separate handler for the Play button for better UX
        const playBtn = card.querySelector('.card-play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent double trigger with card click
                handleCardSelection(card);
            });
        }
    });
}

/**
 * Handle game card selection
 * @param {HTMLElement} card - The selected game card
 */
function handleCardSelection(card) {
    // Clear existing notifications first
    const existingNotification = card.querySelector('.game-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    if (card.classList.contains('disabled')) {
        // Show a flash effect for disabled cards
        card.classList.add('flash-disabled');

        // Create a pulsing notification
        const notification = document.createElement('div');
        notification.className = 'game-notification';
        notification.textContent = 'Coming Soon';
        // Append to card-inner or card-front for better positioning within border-radius
        const cardFront = card.querySelector('.card-front');
        if (cardFront) cardFront.appendChild(notification);
        else card.appendChild(notification); // Fallback

        // Remove notification after animation completes
        setTimeout(() => {
            card.classList.remove('flash-disabled');
            notification.remove();
        }, 1500);

        return;
    }

    // Get the game type from data attribute
    const gameType = card.getAttribute('data-game');

    if (gameType) {
        // Add a selection animation effect
        card.classList.add('card-selected');

        // Navigate to the game screen after a short delay for animation
        setTimeout(() => {
            const welcomeScreen = document.getElementById('welcome-screen');
            const targetScreen = document.getElementById(`${gameType}-screen`);

            if (welcomeScreen && targetScreen) {
                welcomeScreen.classList.remove('active');
                targetScreen.classList.add('active');
                updateBodyOverflow(); // Update overflow after screen change
            }

            // Reset the selection effect
            card.classList.remove('card-selected');

            // Initialize the game if needed
            if (gameType === 'blackjack' && typeof initBlackjack === 'function') {
                // Small delay ensures screen transition is complete
                setTimeout(() => {
                    initBlackjack();
                }, 50); // Reduced delay
            }
        }, 300);
    }
}

/**
 * Set up keyboard navigation for game cards
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        const welcomeScreen = document.getElementById('welcome-screen');
        if (!welcomeScreen || !welcomeScreen.classList.contains('active')) {
            return;
        }

        // Prevent interference with terminal input
        if (e.target.matches('#welcome-input, #blackjack-input')) {
            return;
        }

        // Handle number keys 1-3 for quick selection
        if (e.key >= '1' && e.key <= '3') {
            const index = parseInt(e.key) - 1;
            const gameCards = document.querySelectorAll('.game-cards .game-card'); // Target cards within container

            if (index < gameCards.length) {
                handleCardSelection(gameCards[index]);
            }
        }
    });
}

/**
 * Add special animation effects to the cards
 */
function addAnimationEffects() {
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach(card => {
        // 3D Tilt Effect
        card.addEventListener('mousemove', (e) => {
            if (card.classList.contains('disabled')) return;

            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            const percentX = (e.clientX - cardCenterX) / (cardRect.width / 2);
            const percentY = (e.clientY - cardCenterY) / (cardRect.height / 2);
            const maxRotation = 8; // Reduced rotation
            const rotateY = percentX * maxRotation;
            const rotateX = -percentY * maxRotation;

            const cardInner = card.querySelector('.card-inner');
            if (cardInner) {
                cardInner.style.transform =
                    `perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
            }

            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.background = `radial-gradient(
                    circle at ${e.clientX - cardRect.left}px ${e.clientY - cardRect.top}px,
                    rgba(91, 192, 222, 0.15) 0%,
                    rgba(91, 192, 222, 0) 70%
                )`;
            }
        });

        // Reset transform when mouse leaves
        card.addEventListener('mouseleave', () => {
            const cardInner = card.querySelector('.card-inner');
            if (cardInner) {
                cardInner.style.transform = '';
            }
            const glow = card.querySelector('.card-glow');
            if (glow) {
                glow.style.background = '';
            }
        });
    });

    // Animated roulette wheel rotation
    const rouletteWheels = document.querySelectorAll('.roulette-wheel');
    if (rouletteWheels.length) {
        let angle = 0;
        function animateWheels() {
            angle = (angle + 0.15) % 360; // Slow rotation
            rouletteWheels.forEach(wheel => {
                // Only animate if the card is visible and not being interacted with
                const parentCard = wheel.closest('.game-card');
                if (parentCard && !parentCard.matches(':hover')) {
                    wheel.style.transform = `rotate(${angle}deg)`;
                }
            });
            requestAnimationFrame(animateWheels);
        }
        requestAnimationFrame(animateWheels);
    }

    // Add floating animation to card hands
    animateCardHands();
}

/**
 * Animate the card hands with subtle floating movement
 */
function animateCardHands() {
    const blackjackCards = {
        ace: document.querySelector('.bj-card-ace'),
        king: document.querySelector('.bj-card-king')
    };
    const pokerCards = {
        card1: document.querySelector('.poker-card-1'),
        card2: document.querySelector('.poker-card-2'),
        card3: document.querySelector('.poker-card-3')
    };

    let startTime = null;
    function animateCards(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000; // seconds
        const yOffset = Math.sin(elapsed * 1.5) * 2; // Subtle vertical movement
        const yOffsetSlow = Math.sin(elapsed * 1.2) * 2;

        // Animate blackjack cards if they exist
        if (blackjackCards.ace && blackjackCards.king) {
            const blackjackCard = blackjackCards.ace.closest('.game-card');
            if (blackjackCard && !blackjackCard.matches(':hover')) {
                blackjackCards.ace.style.transform = `rotate(-15deg) translateX(-18px) translateY(${yOffset}px)`;
                blackjackCards.king.style.transform = `rotate(10deg) translateX(18px) translateY(${yOffsetSlow}px)`;
            }
        }

        // Animate poker cards if they exist
        if (pokerCards.card1 && pokerCards.card2 && pokerCards.card3) {
            const pokerCard = pokerCards.card1.closest('.game-card');
            if (pokerCard && !pokerCard.matches(':hover')) {
                pokerCards.card1.style.transform = `translateX(-30px) rotate(-5deg) translateY(${yOffsetSlow}px)`;
                pokerCards.card2.style.transform = `translateY(-5px) translateY(${yOffset}px)`;
                pokerCards.card3.style.transform = `translateX(30px) rotate(5deg) translateY(${yOffsetSlow}px)`;
            }
        }

        requestAnimationFrame(animateCards);
    }

    requestAnimationFrame(animateCards);
}


/**
 * Update body overflow based on which screen is active.
 * Prevent body scroll when welcome or game screens are active.
 */
function updateBodyOverflow() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const blackjackScreen = document.getElementById('blackjack-screen');

    if ((welcomeScreen && welcomeScreen.classList.contains('active')) ||
        (blackjackScreen && blackjackScreen.classList.contains('active'))) {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
    }
}

/**
 * Observe changes to screen classes to update body overflow
 */
function setupScreenChangeObserver() {
    const screenObserver = new MutationObserver((mutations) => {
        // Check if the 'active' class changed on any screen
        let classChanged = mutations.some(mutation => mutation.attributeName === 'class');
        if (classChanged) {
            updateBodyOverflow();
        }
    });

    const welcomeScreen = document.getElementById('welcome-screen');
    const blackjackScreen = document.getElementById('blackjack-screen');

    if (welcomeScreen) screenObserver.observe(welcomeScreen, { attributes: true });
    if (blackjackScreen) screenObserver.observe(blackjackScreen, { attributes: true });
}
