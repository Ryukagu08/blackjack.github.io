// Leaderboard functionality
const leaderboard = {
    // Maximum number of entries in the leaderboard
    maxEntries: 10,
    
    // Cache of leaderboard data
    data: [],
    
    // Initialize the leaderboard
    init: function() {
        // Wait for Firebase to be initialized
        const checkFirebase = setInterval(() => {
            if (window.firebaseDB) {
                clearInterval(checkFirebase);
                this.loadLeaderboard();
            }
        }, 100);
    },
    
    // Load leaderboard data from Firebase
    loadLeaderboard: function() {
        try {
            console.log("Loading leaderboard data from Firebase");
            
            // Reference to the leaderboard in Firebase
            const leaderboardRef = window.firebaseDB.getRef('leaderboard');
            
            // Create a query to get top scores
            const topScoresQuery = window.firebaseDB.query(
                leaderboardRef,
                window.firebaseDB.orderByChild('score'),
                window.firebaseDB.limitToLast(this.maxEntries)
            );
            
            // Listen for data changes
            window.firebaseDB.onValue(topScoresQuery, (snapshot) => {
                console.log("Received leaderboard data from Firebase");
                
                // Clear existing data
                this.data = [];
                
                // Get all entries
                const entries = snapshot.val() || {};
                console.log("Leaderboard entries:", entries);
                
                // Convert to array and add keys
                Object.keys(entries).forEach(key => {
                    this.data.push({
                        id: key,
                        ...entries[key]
                    });
                });
                
                // Sort by score (highest first)
                this.data.sort((a, b) => b.score - a.score);
                console.log("Processed leaderboard data:", this.data);
            }, (error) => {
                console.error("Error loading leaderboard data:", error);
            });
        } catch (error) {
            console.error("Exception when loading leaderboard:", error);
        }
    },
    
    // Check if a score qualifies for the leaderboard
    checkHighScore: function(score) {
        console.log(`Checking if score ${score} qualifies for leaderboard`);
        console.log(`Current leaderboard has ${this.data.length} entries (max: ${this.maxEntries})`);
        
        // If we have less than max entries, any score qualifies
        if (this.data.length < this.maxEntries) {
            console.log("Leaderboard not full, score qualifies");
            return true;
        }
        
        // Otherwise, check if score is higher than the lowest score
        this.data.sort((a, b) => b.score - a.score);
        const lowestScore = this.data[this.data.length - 1].score || 0;
        console.log(`Lowest score on leaderboard: ${lowestScore}`);
        
        return score > lowestScore;
    },
    
    // Add a new high score to the leaderboard
    addHighScore: function(username, score) {
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
                        if (scoresArray.length > this.maxEntries) {
                            // Calculate how many to remove
                            const removeCount = scoresArray.length - this.maxEntries;
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
                        output("Error saving to leaderboard. Check console for details.");
                    });
            }, { onlyOnce: true }); // This ensures we only get the data once for processing
        } catch (error) {
            console.error("Exception when adding high score:", error);
            output("Error saving to leaderboard. Check console for details.");
        }
    },
    
    // Display the leaderboard in the terminal with fixed width
    displayLeaderboard: function() {
        const title = game.language === 'en' ? 'LEADERBOARD' : 'TABLA DE CLASIFICACIÓN';
        const headers = game.language === 'en' 
            ? ['RANK', 'NAME', 'SCORE'] 
            : ['RANGO', 'NOMBRE', 'PUNTUACIÓN'];
        
        // Fixed width box - ensuring consistent width regardless of content
        const BOX_WIDTH = 39; // Total interior width
        
        // Center title in the box
        const titlePadding = Math.floor((BOX_WIDTH - title.length) / 2);
        const paddedTitle = ' '.repeat(titlePadding) + title + ' '.repeat(BOX_WIDTH - title.length - titlePadding);
        
        // Create header
        output(`+${'-'.repeat(BOX_WIDTH)}+`);
        output(`|${paddedTitle}|`);
        output(`+${'-'.repeat(BOX_WIDTH)}+`);
        
        // Calculate column widths - fixed widths that add up to BOX_WIDTH - 2 (for spacing)
        const rankWidth = 6;
        const scoreWidth = 12;
        const nameWidth = BOX_WIDTH - rankWidth - scoreWidth - 2; // -2 for separators
        
        // Header row with consistent column widths
        output(`| ${headers[0].padEnd(rankWidth-1)}| ${headers[1].padEnd(nameWidth-1)}| ${headers[2].padEnd(scoreWidth-1)}|`);
        output(`+${'-'.repeat(rankWidth)}+${'-'.repeat(nameWidth)}+${'-'.repeat(scoreWidth)}+`);
        
        // Show leaderboard entries
        if (this.data.length === 0) {
            const noDataMsg = game.language === 'en' ? 'No high scores yet!' : '¡Aún no hay puntuaciones altas!';
            // Center the message
            const msgPadding = Math.floor((BOX_WIDTH - noDataMsg.length) / 2);
            const paddedMsg = ' '.repeat(msgPadding) + noDataMsg + ' '.repeat(BOX_WIDTH - noDataMsg.length - msgPadding);
            output(`|${paddedMsg}|`);
        } else {
            // Sort by score before displaying
            const sortedData = [...this.data].sort((a, b) => b.score - a.score);
            
            // Display only up to maxEntries
            const displayData = sortedData.slice(0, this.maxEntries);
            
            displayData.forEach((entry, index) => {
                const rank = (index + 1).toString();
                // Limit username length to fit in column
                const username = entry.username.substring(0, nameWidth - 2); 
                const score = '$' + entry.score.toString();
                
                // Format with consistent column widths
                output(`| ${rank.padEnd(rankWidth-1)}| ${username.padEnd(nameWidth-1)}| ${score.padEnd(scoreWidth-1)}|`);
            });
        }
        
        output(`+${'-'.repeat(BOX_WIDTH)}+`);
    },
    
    // Prompt for username when a high score is achieved
    promptForUsername: function(score) {
        // Determine position on the leaderboard
        let position = 1;
        
        // Sort data by score (highest first)
        const sortedData = [...this.data].sort((a, b) => b.score - a.score);
        
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
        position = Math.min(position, this.maxEntries);
        
        // Fixed width for the prompt box
        const BOX_WIDTH = 39;
        
        // Get text lines and ensure they don't exceed box width
        const congratsText = getText('highScore');
        const positionText = getText('positionEarned', position);
        const usernameText = getText('enterUsername');
        
        // Create and display the prompt with consistent width
        output('');
        output(`+${'-'.repeat(BOX_WIDTH)}+`);
        output(`| ${congratsText.padEnd(BOX_WIDTH - 2)}|`);
        output(`| ${positionText.padEnd(BOX_WIDTH - 2)}|`);
        output(`| ${usernameText.padEnd(BOX_WIDTH - 2)}|`);
        output(`+${'-'.repeat(BOX_WIDTH)}+`);
        
        // Set a flag to indicate we're waiting for a username
        game.waitingForUsername = true;
        game.highScore = score;
        game.leaderboardPosition = position; // Store position for potential use later
    }
};

// Initialize leaderboard when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    leaderboard.init();
});