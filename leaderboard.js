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
        // If we have less than max entries, any score qualifies
        if (this.data.length < this.maxEntries) {
            return true;
        }
        
        // Otherwise, check if score is higher than the lowest score
        const lowestScore = this.data[this.data.length - 1]?.score || 0;
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
            // Reference to the leaderboard
            const leaderboardRef = window.firebaseDB.getRef('leaderboard');
            
            // Add to Firebase
            const newEntryRef = window.firebaseDB.push(leaderboardRef);
            window.firebaseDB.set(newEntryRef, newEntry)
                .then(() => {
                    console.log("Score added successfully to Firebase");
                    
                    // The entry will be added via the onValue listener
                    // so we don't need to manually add it to the local cache
                })
                .catch(error => {
                    console.error("Error adding score to Firebase:", error);
                    output("Error saving to leaderboard. Check console for details.");
                    
                    // In case of error, add to local cache only
                    this.addToLocalCache({
                        id: 'local-' + Date.now(),
                        ...newEntry
                    });
                });
        } catch (error) {
            console.error("Exception when adding high score:", error);
            output("Error saving to leaderboard. Check console for details.");
            
            // Still add to local data for this session
            this.addToLocalCache({
                id: 'local-' + Date.now(),
                ...newEntry
            });
        }
    },
    
    // Helper method to add entry to local cache without duplicates
    addToLocalCache: function(entry) {
        // First check if we already have this entry
        const existingIndex = this.data.findIndex(item => item.id === entry.id);
        
        if (existingIndex >= 0) {
            // Update existing entry
            this.data[existingIndex] = entry;
        } else {
            // Add new entry
            this.data.push(entry);
        }
        
        // Sort the data
        this.data.sort((a, b) => b.score - a.score);
        
        // Limit to max entries
        if (this.data.length > this.maxEntries) {
            this.data = this.data.slice(0, this.maxEntries);
        }
    },
    
    // Display the leaderboard in the terminal
    displayLeaderboard: function() {
        const title = game.language === 'en' ? 'LEADERBOARD' : 'TABLA DE CLASIFICACIÓN';
        const headers = game.language === 'en' 
            ? ['RANK', 'NAME', 'SCORE'] 
            : ['RANGO', 'NOMBRE', 'PUNTUACIÓN'];
            
        // Create header
        output(`+---------------------------------------+`);
        output(`|             ${title}             |`);
        output(`+---------------------------------------+`);
        output(`| ${headers[0].padEnd(4)} | ${headers[1].padEnd(15)} | ${headers[2].padStart(10)} |`);
        output(`+---------------------------------------+`);
        
        // Show leaderboard entries
        if (this.data.length === 0) {
            const noDataMsg = game.language === 'en' ? 'No high scores yet!' : '¡Aún no hay puntuaciones altas!';
            output(`| ${noDataMsg.padEnd(37)} |`);
        } else {
            this.data.forEach((entry, index) => {
                const rank = (index + 1).toString();
                const username = entry.username.substring(0, 15); // Limit username length
                const score = '$' + entry.score.toString();
                
                output(`| ${rank.padEnd(4)} | ${username.padEnd(15)} | ${score.padStart(10)} |`);
            });
        }
        
        output(`+---------------------------------------+`);
    },
    
    // Prompt for username when a high score is achieved
    promptForUsername: function(score) {
        // Create and display the prompt
        output('');
        output(`+---------------------------------------+`);
        output(`| ${getText('highScore')}                          |`);
        output(`| ${getText('enterUsername')}                     |`);
        output(`+---------------------------------------+`);
        
        // Set a flag to indicate we're waiting for a username
        game.waitingForUsername = true;
        game.highScore = score;
    }
};

// Initialize leaderboard when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    leaderboard.init();
});