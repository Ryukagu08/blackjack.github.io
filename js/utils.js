/**
 * Shared utility functions for Terminal Arcade
 */

// Utility namespace
window.utils = {};

/**
 * Safely access nested object properties
 * @param {Object} obj - The object to access
 * @param {string} path - The property path (e.g., 'user.profile.name')
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} The value at the path or the default value
 */
window.utils.get = (obj, path, defaultValue = undefined) => {
    if (!obj || !path) return defaultValue;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
        if (result === undefined || result === null) {
            return defaultValue;
        }
        result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
};

/**
 * Debounce function to limit execution frequency
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
window.utils.debounce = (func, wait = 300) => {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted currency string
 */
window.utils.formatCurrency = (amount, currency = '$') => {
    return `${currency}${amount.toLocaleString()}`;
};

/**
 * Generate a random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
window.utils.generateId = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
};

/**
 * Check if device is mobile
 * @returns {boolean} True if device is mobile
 */
window.utils.isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Store data in localStorage with expiration
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @param {number} ttl - Time to live in milliseconds
 */
window.utils.setWithExpiry = (key, value, ttl) => {
    const item = {
        value: value,
        expiry: Date.now() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
};

/**
 * Get data from localStorage with expiration check
 * @param {string} key - Storage key
 * @returns {*} Stored value or null if expired
 */
window.utils.getWithExpiry = (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    
    return item.value;
};

/**
 * Sanitize a string for safe display in HTML
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
window.utils.sanitize = (str) => {
    if (!str) return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

/**
 * Load a script dynamically
 * @param {string} src - Script source
 * @returns {Promise} Promise that resolves when script is loaded
 */
window.utils.loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
    });
};

/**
 * Create a translation function based on a translation object
 * @param {Object} translations - Translation dictionary
 * @param {string} defaultLanguage - Default language code
 * @returns {Function} Translation function
 */
window.utils.createTranslator = (translations, defaultLanguage = 'en') => {
    return (key, language = defaultLanguage, ...args) => {
        const langData = translations[language] || translations[defaultLanguage];
        if (!langData) return key;
        
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
};

/**
 * Convert any value to a boolean
 * @param {*} value - Value to convert
 * @returns {boolean} Boolean representation
 */
window.utils.toBoolean = (value) => {
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
    }
    return Boolean(value);
};

/**
 * Create ASCII card representation
 * @param {Object} card - Card object with suit and value
 * @param {boolean} hidden - Whether the card is hidden
 * @returns {string[]} Array of strings representing card rows
 */
window.utils.cardToAscii = (card, hidden = false) => {
    if (hidden) return ["+-----+", "|     |", "|     |", "|     |", "+-----+"];
    
    const value = card.value;
    const suit = card.suit;
    
    // Adjust for double-digit values (10)
    return value.length > 1 ? 
        ["+-----+", `|${value}   |`, `|  ${suit}  |`, `|   ${value}|`, "+-----+"] :
        ["+-----+", `|${value}    |`, `|  ${suit}  |`, `|    ${value}|`, "+-----+"];
};

/**
 * Combine multiple card ASCII representations horizontally
 * @param {Array} cardArrays - Array of card ASCII representations
 * @returns {string[]} Combined ASCII art
 */
window.utils.combineCardAscii = (cardArrays) => {
    if (!cardArrays.length) return ["", "", "", "", ""];
    
    const result = ["", "", "", "", ""];
    
    for (let row = 0; row < 5; row++) {
        for (let cardIdx = 0; cardIdx < cardArrays.length; cardIdx++) {
            result[row] += cardArrays[cardIdx][row] + " ";
        }
    }
    
    return result;
};