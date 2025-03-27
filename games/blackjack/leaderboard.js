/**
 * Blackjack Game Module - Leaderboard Handling
 * This maintains compatibility with the original implementation
 * while fitting into the new modular architecture
 */

// Create blackjack leaderboard namespace
const blackjackLeaderboard = window.blackjackLeaderboard = {};

// Leaderboard configuration
blackjackLeaderboard.config = {
    maxEntries: 10
};

// Leaderboard data
blackjackLeaderboard.data = [];

/**
 * Initialize the leaderboard
 */
blackjackLeaderboard.init = function() {
    // Wait for Firebase to be initialized
    const checkFirebase = setInterval(() => {
        if (window.firebaseDB) {
            clearInterval(checkFirebase);
            blackjackLeaderboard.loadLeaderboard();
        }
    }, 100);
};

/**
 * Load leaderboard data from Firebase
 */
blackjackLeaderboard.loadLeaderboard = function() {
    try {
        console.log("Loading leaderboard data from Firebase");
        
        // Reference to the leaderboard in Firebase - using original path
        const leaderboardRef = window.firebaseDB.getRef('leaderboard');
        
        // Create a query to get top scores
        const topScoresQuery = window.firebaseDB.query(
            leaderboardRef,
            window.firebaseDB.orderByChild('score'),
            window.firebaseDB.limitToLast(blackjackLeaderboard.config.maxEntries)
        );
        
        // Listen for data changes
        window.firebaseDB.onValue(topScoresQuery, (snapshot) => {
            console.log("Received leaderboard data from Firebase");
            
            // Clear existing data
            blackjackLeaderboard.data = [];
            
            // Get all entries
            const entries = snapshot.val() || {};
            console.log("Leaderboard entries:", entries);
            
            // Convert to array and add keys
            Object.keys(entries).forEach(key => {
                blackjackLeaderboard.data.push({
                    id: key,
                    ...entries[key]
                });
            });
            
            // Sort by score (highest first)
            blackjackLeaderboard.data.sort((a, b) => b.score - a.score);
            console.log("Processed leaderboard data:", blackjackLeaderboard.data);
        }, (error) => {
            console.error("Error loading leaderboard data:", error);
        });
    } catch (error) {
        console.error("Exception when loading leaderboard:", error);
    }
};

/**
 * Check if a score qualifies for the leaderboard
 * @param {number} score - Score to check
 * @returns {boolean} Whether the score qualifies
 */
blackjackLeaderboard.checkHighScore = function(score) {
    console.log(`Checking if score ${score} qualifies for leaderboard`);
    console.log(`Current leaderboard has ${blackjackLeaderboard.data.length} entries (max: ${blackjackLeaderboard.config.maxEntries})`);
    
    // If we have less than max entries, any score qualifies
    if (blackjackLeaderboard.data.length < blackjackLeaderboard.config.maxEntries) {
        console.log("Leaderboard not full, score qualifies");
        return true;
    }
    
    // Otherwise, check if score is higher than the lowest score
    blackjackLeaderboard.data.sort((a, b) => b.score - a.score);
    const lowestScore = blackjackLeaderboard.data[blackjackLeaderboard.data.length - 1].score || 0;
    console.log(`Lowest score on leaderboard: ${lowestScore}`);
    
    return score > lowestScore;
};

/**
 * Add a high score to the leaderboard
 * @param {string} username - Player username
 * @param {number} score - Player score
 */
blackjackLeaderboard.addHighScore = function(username, score) {
    console.log(`Attempting to add high score for ${username} with score ${score}`);
    
    // Create a new entry
    const newEntry = {
        username: username,
        score: score,
        timestamp: Date.now()
    };
    
    try {
        // Get all existing entries from Firebase first
        const leaderboardRef = window.firebaseDB.getRef('leaderboard');
        
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
                    if (scoresArray.length > blackjackLeaderboard.config.maxEntries) {
                        // Calculate how many to remove
                        const removeCount = scoresArray.length - blackjackLeaderboard.config.maxEntries;
                        console.log(`Leaderboard will have ${scoresArray.length} entries, need to remove ${removeCount}`);
                        
                        // Get entries to remove (the lowest scores)
                        const entriesToRemove = scoresArray.slice(0, removeCount);
                        
                        // Remove each entry from Firebase
                        entriesToRemove.forEach(entry => {
                            console.log(`Removing entry: ${entry.username} with score ${entry.score}`);
                            const removeRef = window.firebaseDB.getRef(`leaderboard/${entry.id}`);
                            window.firebaseDB.remove(removeRef)
                                .then(() => console.log(`Successfully removed entry ${entry.id}`))
                                .catch(err => console.error(`Failed to remove entry ${entry.id}:`, err));
                        });
                    }
                })
                .catch(error => {
                    console.error("Error adding score to Firebase:", error);
                    blackjackUI.output("Error saving to leaderboard. Check console for details.");
                });
        }, { onlyOnce: true }); // This ensures we only get the data once for processing
    } catch (error) {
        console.error("Exception when adding high score:", error);
        blackjackUI.output("Error saving to leaderboard. Check console for details.");
    }
};

/**
 * Display the leaderboard in the terminal
 */
blackjackLeaderboard.displayLeaderboard = function() {
    const title = blackjackUI.getText('leaderboardTitle');
    const headers = blackjackGame.state.language === 'en' 
        ? ['RANK', 'NAME', 'SCORE'] 
        : ['RANGO', 'NOMBRE', 'PUNTUACIÓN'];
    
    // Fixed width box - ensuring consistent width regardless of content
    const BOX_WIDTH = 39; // Total interior width
    
    // Center title in the box
    const titlePadding = Math.floor((BOX_WIDTH - title.length) / 2);
    const paddedTitle = ' '.repeat(titlePadding) + title + ' '.repeat(BOX_WIDTH - title.length - titlePadding);
    
    // Create header
    blackjackUI.output(`+${'-'.repeat(BOX_WIDTH)}+`);
    blackjackUI.output(`|${paddedTitle}|`);
    blackjackUI.output(`+${'-'.repeat(BOX_WIDTH)}+`);
    
    // Calculate column widths - fixed widths that add up to BOX_WIDTH - 2 (for spacing)
    const rankWidth = 6;
    const scoreWidth = 12;
    const nameWidth = BOX_WIDTH - rankWidth - scoreWidth - 2; // -2 for separators
    
    // Header row with consistent column widths
    blackjackUI.output(`| ${headers[0].padEnd(rankWidth-1)}| ${headers[1].padEnd(nameWidth-1)}| ${headers[2].padEnd(scoreWidth-1)}|`);
    blackjackUI.output(`+${'-'.repeat(rankWidth)}+${'-'.repeat(nameWidth)}+${'-'.repeat(scoreWidth)}+`);
    
    // Show leaderboard entries
    if (blackjackLeaderboard.data.length === 0) {
        const noDataMsg = blackjackUI.getText('noHighScores');
        // Center the message
        const msgPadding = Math.floor((BOX_WIDTH - noDataMsg.length) / 2);
        const paddedMsg = ' '.repeat(msgPadding) + noDataMsg + ' '.repeat(BOX_WIDTH - noDataMsg.length - msgPadding);
        blackjackUI.output(`|${paddedMsg}|`);
    } else {
        // Sort by score before displaying
        const sortedData = [...blackjackLeaderboard.data].sort((a, b) => b.score - a.score);
        
        // Display only up to maxEntries
        const displayData = sortedData.slice(0, blackjackLeaderboard.config.maxEntries);
        
        displayData.forEach((entry, index) => {
            const rank = (index + 1).toString();
            // Limit username length to fit in column
            const username = entry.username.substring(0, nameWidth - 2); 
            const score = '$' + entry.score.toString();
            
            // Format with consistent column widths
            blackjackUI.output(`| ${rank.padEnd(rankWidth-1)}| ${username.padEnd(nameWidth-1)}| ${score.padEnd(scoreWidth-1)}|`);
        });
    }
    
    blackjackUI.output(`+${'-'.repeat(BOX_WIDTH)}+`);
};

/**
 * Prompt for username when a high score is achieved
 * @param {number} score - Player's score
 */
blackjackLeaderboard.promptForUsername = function(score) {
    // Determine position on the leaderboard
    let position = 1;
    
    // Sort data by score (highest first)
    const sortedData = [...blackjackLeaderboard.data].sort((a, b) => b.score - a.score);
    
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
    position = Math.min(position, blackjackLeaderboard.config.maxEntries);
    
    // Fixed width for the prompt box
    const BOX_WIDTH = 39;
    
    // Get text lines and ensure they don't exceed box width
    const congratsText = blackjackUI.getText('highScore');
    const positionText = blackjackUI.getText('positionEarned', position);
    const usernameText = blackjackUI.getText('enterUsername');
    
    // Create and display the prompt with consistent width
    blackjackUI.output('');
    blackjackUI.output(`+${'-'.repeat(BOX_WIDTH)}+`);
    blackjackUI.output(`| ${congratsText.padEnd(BOX_WIDTH - 2)}|`);
    blackjackUI.output(`| ${positionText.padEnd(BOX_WIDTH - 2)}|`);
    blackjackUI.output(`| ${usernameText.padEnd(BOX_WIDTH - 2)}|`);
    blackjackUI.output(`+${'-'.repeat(BOX_WIDTH)}+`);
    
    // Set a flag to indicate we're waiting for a username
    blackjackGame.state.waitingForUsername = true;
    blackjackGame.state.highScore = score;
    blackjackGame.state.leaderboardPosition = position; // Store position for potential use later
};