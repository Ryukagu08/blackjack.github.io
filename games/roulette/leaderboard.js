/**
 * Roulette Game Module - Leaderboard Handling
 */

// Create roulette leaderboard namespace
const rouletteLeaderboard = window.rouletteLeaderboard = {};

// Leaderboard configuration
rouletteLeaderboard.config = {
    maxEntries: 10,
    localStorageKey: 'rouletteLeaderboard'
};

// Leaderboard data
rouletteLeaderboard.data = [];

/**
 * Initialize the leaderboard
 */
rouletteLeaderboard.init = function() {
    // Load from Firebase if available, otherwise from localStorage
    if (window.firebaseDB) {
        // Wait for Firebase to be initialized
        const checkFirebase = setInterval(() => {
            if (window.firebaseDB) {
                clearInterval(checkFirebase);
                rouletteLeaderboard.loadLeaderboardFromFirebase();
            }
        }, 100);
    } else {
        // Fallback to localStorage
        rouletteLeaderboard.loadLeaderboardFromLocalStorage();
    }
};

/**
 * Load leaderboard data from Firebase
 */
rouletteLeaderboard.loadLeaderboardFromFirebase = function() {
    try {
        console.log("Loading roulette leaderboard data from Firebase");
        
        // Reference to the leaderboard in Firebase
        const leaderboardRef = window.firebaseDB.getRef('leaderboards/roulette');
        
        // Create a query to get top scores
        const topScoresQuery = window.firebaseDB.query(
            leaderboardRef,
            window.firebaseDB.orderByChild('score'),
            window.firebaseDB.limitToLast(rouletteLeaderboard.config.maxEntries)
        );
        
        // Listen for data changes
        window.firebaseDB.onValue(topScoresQuery, (snapshot) => {
            console.log("Received roulette leaderboard data from Firebase");
            
            // Clear existing data
            rouletteLeaderboard.data = [];
            
            // Get all entries
            const entries = snapshot.val() || {};
            console.log("Roulette leaderboard entries:", entries);
            
            // Convert to array and add keys
            Object.keys(entries).forEach(key => {
                rouletteLeaderboard.data.push({
                    id: key,
                    ...entries[key]
                });
            });
            
            // Sort by score (highest first)
            rouletteLeaderboard.data.sort((a, b) => b.score - a.score);
            console.log("Processed roulette leaderboard data:", rouletteLeaderboard.data);
        }, (error) => {
            console.error("Error loading roulette leaderboard data:", error);
            // Fallback to localStorage if Firebase fails
            rouletteLeaderboard.loadLeaderboardFromLocalStorage();
        });
    } catch (error) {
        console.error("Exception when loading roulette leaderboard:", error);
        // Fallback to localStorage
        rouletteLeaderboard.loadLeaderboardFromLocalStorage();
    }
};

/**
 * Load leaderboard data from localStorage (fallback when Firebase is unavailable)
 */
rouletteLeaderboard.loadLeaderboardFromLocalStorage = function() {
    try {
        const savedData = localStorage.getItem(rouletteLeaderboard.config.localStorageKey);
        if (savedData) {
            rouletteLeaderboard.data = JSON.parse(savedData);
            // Sort by score (highest first)
            rouletteLeaderboard.data.sort((a, b) => b.score - a.score);
            console.log("Loaded leaderboard data from localStorage:", rouletteLeaderboard.data);
        } else {
            rouletteLeaderboard.data = [];
        }
    } catch (error) {
        console.error("Error loading leaderboard from localStorage:", error);
        rouletteLeaderboard.data = [];
    }
};

/**
 * Save leaderboard data to localStorage
 */
rouletteLeaderboard.saveLeaderboardToLocalStorage = function() {
    try {
        localStorage.setItem(rouletteLeaderboard.config.localStorageKey, JSON.stringify(rouletteLeaderboard.data));
        console.log("Saved leaderboard data to localStorage");
    } catch (error) {
        console.error("Error saving leaderboard to localStorage:", error);
    }
};

/**
 * Check if a score qualifies for the leaderboard
 * @param {number} score - Score to check
 * @returns {boolean} Whether the score qualifies
 */
rouletteLeaderboard.checkHighScore = function(score) {
    console.log(`Checking if score ${score} qualifies for roulette leaderboard`);
    console.log(`Current leaderboard has ${rouletteLeaderboard.data.length} entries (max: ${rouletteLeaderboard.config.maxEntries})`);
    
    // If we have less than max entries, any score qualifies
    if (rouletteLeaderboard.data.length < rouletteLeaderboard.config.maxEntries) {
        console.log("Leaderboard not full, score qualifies");
        return true;
    }
    
    // Otherwise, check if score is higher than the lowest score
    rouletteLeaderboard.data.sort((a, b) => b.score - a.score);
    const lowestScore = rouletteLeaderboard.data[rouletteLeaderboard.data.length - 1].score || 0;
    console.log(`Lowest score on leaderboard: ${lowestScore}`);
    
    return score > lowestScore;
};

/**
 * Add a high score to the leaderboard
 * @param {string} username - Player username
 * @param {number} score - Player score
 */
rouletteLeaderboard.addHighScore = function(username, score) {
    console.log(`Attempting to add high score for ${username} with score ${score}`);
    
    // Create a new entry
    const newEntry = {
        id: Date.now().toString(), // Unique ID for localStorage
        username: username,
        score: score,
        timestamp: Date.now()
    };
    
    try {
        // Use Firebase if available
        if (window.firebaseDB) {
            // Use the enhanced Firebase service if available
            if (window.firebaseService && window.firebaseService.getGameDB) {
                const rouletteDB = window.firebaseService.getGameDB('roulette');
                rouletteDB.addScore(username, score)
                    .then(() => {
                        console.log("Score added successfully to Firebase");
                        rouletteUI.output("Your score has been added to the leaderboard!", false, 'success');
                    })
                    .catch(err => {
                        console.error("Error adding score to Firebase:", err);
                        // Fallback to localStorage
                        rouletteLeaderboard.addHighScoreToLocalStorage(newEntry);
                    });
                return;
            }
            
            // Fallback to original Firebase implementation
            const leaderboardRef = window.firebaseDB.getRef('leaderboards/roulette');
            
            window.firebaseDB.onValue(leaderboardRef, (snapshot) => {
                // This is a one-time read to get current state
                window.firebaseDB.onValue(leaderboardRef, () => {}, { onlyOnce: true });
                
                // Get all entries and convert to array
                const entries = snapshot.val() || {};
                const scoresArray = [];
                
                Object.keys(entries).forEach(key => {
                    scoresArray.push({
                        id: key,
                        ...entries[key]
                    });
                });
                
                // Add the new entry
                const newEntryRef = window.firebaseDB.push(leaderboardRef);
                window.firebaseDB.set(newEntryRef, newEntry)
                    .then(() => {
                        console.log("Score added successfully to Firebase");
                        
                        // Add new entry to our array for cleanup processing
                        scoresArray.push({
                            id: newEntryRef.key,
                            ...newEntry
                        });
                        
                        // Sort scores (lowest first)
                        scoresArray.sort((a, b) => a.score - b.score);
                        
                        // If we have more than max entries, remove the lowest ones
                        if (scoresArray.length > rouletteLeaderboard.config.maxEntries) {
                            // Calculate how many to remove
                            const removeCount = scoresArray.length - rouletteLeaderboard.config.maxEntries;
                            console.log(`Leaderboard will have ${scoresArray.length} entries, need to remove ${removeCount}`);
                            
                            // Get entries to remove (the lowest scores)
                            const entriesToRemove = scoresArray.slice(0, removeCount);
                            
                            // Remove each entry from Firebase
                            entriesToRemove.forEach(entry => {
                                console.log(`Removing entry: ${entry.username} with score ${entry.score}`);
                                const removeRef = window.firebaseDB.getRef(`leaderboards/roulette/${entry.id}`);
                                window.firebaseDB.remove(removeRef)
                                    .then(() => console.log(`Successfully removed entry ${entry.id}`))
                                    .catch(err => console.error(`Failed to remove entry ${entry.id}:`, err));
                            });
                        }
                        
                        rouletteUI.output("Your score has been added to the leaderboard!", false, 'success');
                    })
                    .catch(error => {
                        console.error("Error adding score to Firebase:", error);
                        // Fallback to localStorage
                        rouletteLeaderboard.addHighScoreToLocalStorage(newEntry);
                    });
            }, { onlyOnce: true }); // This ensures we only get the data once for processing
        } else {
            // Fallback to localStorage
            rouletteLeaderboard.addHighScoreToLocalStorage(newEntry);
        }
    } catch (error) {
        console.error("Exception when adding high score:", error);
        // Fallback to localStorage
        rouletteLeaderboard.addHighScoreToLocalStorage(newEntry);
    }
};

/**
 * Add a high score to localStorage (fallback when Firebase is unavailable)
 * @param {Object} newEntry - The new entry to add
 */
rouletteLeaderboard.addHighScoreToLocalStorage = function(newEntry) {
    // Add to our data array
    rouletteLeaderboard.data.push(newEntry);
    
    // Sort scores (highest first)
    rouletteLeaderboard.data.sort((a, b) => b.score - a.score);
    
    // Trim to max entries
    if (rouletteLeaderboard.data.length > rouletteLeaderboard.config.maxEntries) {
        rouletteLeaderboard.data = rouletteLeaderboard.data.slice(0, rouletteLeaderboard.config.maxEntries);
    }
    
    // Save to localStorage
    rouletteLeaderboard.saveLeaderboardToLocalStorage();
    
    // Notify user
    rouletteUI.output("Your score has been added to the leaderboard!", false, 'success');
};

/**
 * Display the leaderboard in the terminal
 */
rouletteLeaderboard.displayLeaderboard = function() {
    const title = rouletteUI.getText('leaderboardTitle', 'ROULETTE LEADERBOARD');
    const headers = rouletteGame.state && rouletteGame.state.language === 'es' 
        ? ['RANGO', 'NOMBRE', 'PUNTUACIÓN'] 
        : ['RANK', 'NAME', 'SCORE'];
    
    // Fixed width box - ensuring consistent width regardless of content
    const BOX_WIDTH = 39; // Total interior width
    
    // Center title in the box
    const titlePadding = Math.floor((BOX_WIDTH - title.length) / 2);
    const paddedTitle = ' '.repeat(titlePadding) + title + ' '.repeat(BOX_WIDTH - title.length - titlePadding);
    
    // Create header
    rouletteUI.output(`+${'-'.repeat(BOX_WIDTH)}+`);
    rouletteUI.output(`|${paddedTitle}|`);
    rouletteUI.output(`+${'-'.repeat(BOX_WIDTH)}+`);
    
    // Calculate column widths - fixed widths that add up to BOX_WIDTH - 2 (for spacing)
    const rankWidth = 6;
    const scoreWidth = 12;
    const nameWidth = BOX_WIDTH - rankWidth - scoreWidth - 2; // -2 for separators
    
    // Header row with consistent column widths
    rouletteUI.output(`| ${headers[0].padEnd(rankWidth-1)}| ${headers[1].padEnd(nameWidth-1)}| ${headers[2].padEnd(scoreWidth-1)}|`);
    rouletteUI.output(`+${'-'.repeat(rankWidth)}+${'-'.repeat(nameWidth)}+${'-'.repeat(scoreWidth)}+`);
    
    // Show leaderboard entries
    if (rouletteLeaderboard.data.length === 0) {
        const noDataMsg = rouletteUI.getText('noHighScores', 'No high scores yet');
        // Center the message
        const msgPadding = Math.floor((BOX_WIDTH - noDataMsg.length) / 2);
        const paddedMsg = ' '.repeat(msgPadding) + noDataMsg + ' '.repeat(BOX_WIDTH - noDataMsg.length - msgPadding);
        rouletteUI.output(`|${paddedMsg}|`);
    } else {
        // Sort by score before displaying
        const sortedData = [...rouletteLeaderboard.data].sort((a, b) => b.score - a.score);
        
        // Display only up to maxEntries
        const displayData = sortedData.slice(0, rouletteLeaderboard.config.maxEntries);
        
        displayData.forEach((entry, index) => {
            const rank = (index + 1).toString();
            // Limit username length to fit in column
            const username = entry.username.substring(0, nameWidth - 2); 
            const score = '$' + entry.score.toString();
            
            // Format with consistent column widths
            rouletteUI.output(`| ${rank.padEnd(rankWidth-1)}| ${username.padEnd(nameWidth-1)}| ${score.padEnd(scoreWidth-1)}|`);
        });
    }
    
    rouletteUI.output(`+${'-'.repeat(BOX_WIDTH)}+`);
};

/**
 * Prompt for username when a high score is achieved
 * @param {number} score - Player's score
 */
rouletteLeaderboard.promptForUsername = function(score) {
    // Determine position on the leaderboard
    let position = 1;
    
    // Sort data by score (highest first)
    const sortedData = [...rouletteLeaderboard.data].sort((a, b) => b.score - a.score);
    
    // Find where the new score would be inserted
    for (let i = 0; i < sortedData.length; i++) {
        if (score > sortedData[i].score) {
            position = i + 1;
            break;
        } else {
            position = i + 2; // If it's less than current score, it would go after
        }
    }
    
    // If leaderboard is empty, position is 1
    if (sortedData.length === 0) {
        position = 1;
    }
    
    // Ensure position doesn't exceed maxEntries
    position = Math.min(position, rouletteLeaderboard.config.maxEntries);
    
    // Fixed width for the prompt box
    const BOX_WIDTH = 39;
    
    // Get text lines and ensure they don't exceed box width
    const congratsText = rouletteUI.getText('highScore', 'NEW HIGH SCORE!');
    const positionText = rouletteUI.getText('positionEarned', `You earned position #${position}!`);
    const usernameText = rouletteUI.getText('enterUsername', 'Enter your name:');
    
    // Create and display the prompt with consistent width
    rouletteUI.output('');
    rouletteUI.output(`+${'-'.repeat(BOX_WIDTH)}+`);
    rouletteUI.output(`| ${congratsText.padEnd(BOX_WIDTH - 2)}|`);
    rouletteUI.output(`| ${positionText.padEnd(BOX_WIDTH - 2)}|`);
    rouletteUI.output(`| ${usernameText.padEnd(BOX_WIDTH - 2)}|`);
    rouletteUI.output(`+${'-'.repeat(BOX_WIDTH)}+`);
    
    // Set a flag to indicate we're waiting for a username
    rouletteGame.state.waitingForUsername = true;
    rouletteGame.state.highScore = score;
    rouletteGame.state.leaderboardPosition = position; // Store position for potential use later
};

/**
 * Create DOM-based leaderboard (alternative visualization)
 * @param {HTMLElement} container - Container element to append leaderboard to
 */
rouletteLeaderboard.createLeaderboardUI = function(container) {
    // Create leaderboard container
    const leaderboardContainer = document.createElement('div');
    leaderboardContainer.className = 'leaderboard-container';
    
    // Create title
    const title = document.createElement('div');
    title.className = 'leaderboard-title';
    title.textContent = rouletteUI.getText('leaderboardTitle', 'ROULETTE LEADERBOARD');
    leaderboardContainer.appendChild(title);
    
    // Create table
    const table = document.createElement('table');
    table.className = 'leaderboard-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = rouletteGame.state && rouletteGame.state.language === 'es' 
        ? ['RANGO', 'NOMBRE', 'PUNTUACIÓN'] 
        : ['RANK', 'NAME', 'SCORE'];
    
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        
        // Add specific column classes for styling
        if (index === 0) th.className = 'rank-column';
        if (index === 1) th.className = 'username-column';
        if (index === 2) th.className = 'score-column';
        
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Sort data by score before displaying
    const sortedData = [...rouletteLeaderboard.data].sort((a, b) => b.score - a.score);
    
    // Display only up to maxEntries
    const displayData = sortedData.slice(0, rouletteLeaderboard.config.maxEntries);
    
    if (displayData.length === 0) {
        // No scores yet
        const noDataRow = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.colSpan = 3;
        noDataCell.textContent = rouletteUI.getText('noHighScores', 'No high scores yet');
        noDataCell.style.textAlign = 'center';
        noDataCell.style.padding = '20px 0';
        noDataRow.appendChild(noDataCell);
        tbody.appendChild(noDataRow);
    } else {
        // Add scores
        displayData.forEach((entry, index) => {
            const row = document.createElement('tr');
            
            // Rank column
            const rankCell = document.createElement('td');
            rankCell.className = 'rank-column';
            rankCell.textContent = (index + 1).toString();
            row.appendChild(rankCell);
            
            // Username column
            const usernameCell = document.createElement('td');
            usernameCell.className = 'username-column';
            usernameCell.textContent = entry.username;
            row.appendChild(usernameCell);
            
            // Score column
            const scoreCell = document.createElement('td');
            scoreCell.className = 'score-column';
            scoreCell.textContent = '$' + entry.score.toString();
            row.appendChild(scoreCell);
            
            tbody.appendChild(row);
        });
    }
    
    table.appendChild(tbody);
    leaderboardContainer.appendChild(table);
    
    // Add to container
    container.appendChild(leaderboardContainer);
};

/**
 * Create a high score prompt UI
 * @param {HTMLElement} container - Container element to append prompt to
 * @param {number} score - Player's score
 * @param {Function} callback - Callback function to call with username
 */
rouletteLeaderboard.createHighScorePromptUI = function(container, score, callback) {
    // Create prompt container
    const promptContainer = document.createElement('div');
    promptContainer.className = 'highscore-prompt';
    
    // Create title
    const title = document.createElement('div');
    title.className = 'highscore-title';
    title.textContent = rouletteUI.getText('highScore', 'NEW HIGH SCORE!');
    promptContainer.appendChild(title);
    
    // Create subtitle
    const subtitle = document.createElement('div');
    subtitle.className = 'highscore-subtitle';
    subtitle.textContent = `$${score}`;
    promptContainer.appendChild(subtitle);
    
    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'highscore-input';
    input.placeholder = rouletteUI.getText('enterUsername', 'Enter your name');
    input.maxLength = 15;
    promptContainer.appendChild(input);
    
    // Create button
    const button = document.createElement('button');
    button.className = 'highscore-button';
    button.textContent = rouletteUI.getText('submit', 'SUBMIT');
    button.addEventListener('click', () => {
        const username = input.value.trim();
        if (username) {
            callback(username);
            promptContainer.remove();
        } else {
            input.focus();
            input.style.border = '2px solid red';
        }
    });
    promptContainer.appendChild(button);
    
    // Add to container
    container.appendChild(promptContainer);
    
    // Focus input
    setTimeout(() => {
        input.focus();
    }, 100);
};