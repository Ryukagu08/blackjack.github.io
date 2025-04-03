/**
 * App.js - Main application logic
 */

// Application state
const app = {
    currentScreen: 'welcome',
    
    /**
     * Initialize the application
     */
    init() {
        // Set up navigation between screens
        this.setupNavigation();
        
        // Set up terminal text animation
        this.setupTypewriter();
        
        // Set up glitch text effect
        this.setupGlitchEffect();
        
        console.log('Neon Casino initialized!');
    },
    
    /**
     * Set up navigation between screens
     */
    setupNavigation() {
        // Back button functionality
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.navigateTo('welcome');
            });
        });
        
        // Game option selection
        document.querySelectorAll('.game-option').forEach(option => {
            option.addEventListener('click', () => {
                if (!option.classList.contains('disabled')) {
                    const game = option.getAttribute('data-game');
                    if (game) {
                        this.navigateTo(game);
                    }
                }
            });
        });
    },
    
    /**
     * Navigate to a screen
     * @param {string} screenId - ID of the screen to navigate to
     */
    navigateTo(screenId) {
        // Hide current screen
        document.getElementById(`${this.currentScreen}-screen`).classList.remove('active');
        
        // Show target screen
        document.getElementById(`${screenId}-screen`).classList.add('active');
        
        // Update current screen
        this.currentScreen = screenId;
        
        // Initialize screen if needed
        if (screenId === 'blackjack' && typeof initBlackjack === 'function') {
            setTimeout(() => {
                initBlackjack();
            }, 300);
        }
    },
    
    /**
     * Set up typewriter effect for welcome text
     */
    setupTypewriter() {
        const typeElements = document.querySelectorAll('.type-text');
        
        typeElements.forEach(element => {
            // Store the original text
            const text = element.textContent;
            
            // Create a hidden span to maintain the space
            const hiddenSpan = document.createElement('span');
            hiddenSpan.textContent = text;
            hiddenSpan.style.visibility = 'hidden';
            hiddenSpan.style.position = 'absolute';
            hiddenSpan.style.whiteSpace = 'nowrap';
            
            // Create a visible span for the typed text
            const visibleSpan = document.createElement('span');
            visibleSpan.style.whiteSpace = 'nowrap';
            
            // Clear the original element and add both spans
            element.textContent = '';
            element.appendChild(hiddenSpan);
            element.appendChild(visibleSpan);
            
            // Type the text into the visible span
            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    visibleSpan.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 50);
                }
            };
            
            // Start the typewriter effect
            setTimeout(typeWriter, 1000);
        });
    },
    
    /**
     * Set up glitch text effect
     */
    setupGlitchEffect() {
        const glitchElements = document.querySelectorAll('.glitch');
        
        glitchElements.forEach(element => {
            // Store original text as a data attribute
            const text = element.textContent;
            element.setAttribute('data-text', text);
        });
    },
    
    /**
     * Check if the device is mobile
     * @returns {boolean} True if device is mobile
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    /**
     * Add a custom CSS class to a DOM element
     * @param {HTMLElement} element - The element to add the class to
     * @param {string} className - The CSS class to add
     * @param {number} delay - Delay in milliseconds before adding the class
     */
    addClassWithDelay(element, className, delay) {
        setTimeout(() => {
            element.classList.add(className);
        }, delay);
    }
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    
    // Add keyboard navigation for menu
    document.addEventListener('keydown', (e) => {
        if (app.currentScreen === 'welcome') {
            if (e.key === 'Enter' && e.target.id === 'welcome-input') {
                // Let the terminal handle this
                return;
            }
            
            // Handle number keys for quick game selection
            if (e.key >= '1' && e.key <= '3') {
                const index = parseInt(e.key) - 1;
                const gameOptions = document.querySelectorAll('.game-option');
                
                if (index < gameOptions.length) {
                    if (!gameOptions[index].classList.contains('disabled')) {
                        const game = gameOptions[index].getAttribute('data-game');
                        const welcomeTerminal = terminalSystem.getTerminal('welcome');
                        
                        if (welcomeTerminal) {
                            welcomeTerminal.inputElement.value = `play ${game}`;
                            welcomeTerminal.handleCommand();
                        }
                    }
                }
            }
        }
    });
    
    // Create a neon flicker effect on the logo
    const neonLogo = document.querySelector('.neon-logo h1');
    if (neonLogo) {
        setInterval(() => {
            if (Math.random() < 0.1) {
                neonLogo.style.opacity = 0.7;
                setTimeout(() => {
                    neonLogo.style.opacity = 1;
                }, 100);
            }
        }, 500);
    }
});