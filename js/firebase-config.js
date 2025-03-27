/**
 * Centralized Firebase configuration for Terminal Arcade
 * This file initializes Firebase and makes it available globally
 * with the same interface as the original implementation for compatibility
 */

// Import Firebase services
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    onValue, 
    push, 
    set, 
    remove, 
    query, 
    orderByChild, 
    limitToLast 
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyALIuEucPEd5RRAlUaR2QrS91FhDBQreKs",
    authDomain: "smr-leaderboard.firebaseapp.com",
    projectId: "smr-leaderboard",
    storageBucket: "smr-leaderboard.firebasestorage.app",
    messagingSenderId: "430300229787",
    appId: "1:430300229787:web:e1fe27358deffe2f64563e",
    databaseURL: "https://smr-leaderboard-default-rtdb.europe-west1.firebasedatabase.app"
};

try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);
    
    // Create global firebaseDB reference to maintain compatibility with original code
    window.firebaseDB = {
        database,
        getRef: (path) => ref(database, path),
        query,
        orderByChild,
        limitToLast,
        onValue,
        push,
        set,
        remove
    };
    
    // Enhanced Firebase service for new games
    window.firebaseService = {
        // Database reference functions
        db: database,
        getRef: (path) => ref(database, path),
        
        // Query functions
        query,
        orderByChild,
        limitToLast,
        
        // Data operations
        onValue,
        push,
        set,
        remove,
        
        // Create a scoped reference for specific games
        getGameDB: (gameId) => {
            return {
                // Create game-specific references
                getLeaderboardRef: () => ref(database, `leaderboards/${gameId}`),
                
                // Game-specific leaderboard functions
                getTopScores: (limit = 10, callback) => {
                    const leaderboardRef = ref(database, `leaderboards/${gameId}`);
                    const topScoresQuery = query(
                        leaderboardRef,
                        orderByChild('score'),
                        limitToLast(limit)
                    );
                    
                    onValue(topScoresQuery, (snapshot) => {
                        // Convert to array and sort
                        const entries = snapshot.val() || {};
                        const scores = Object.keys(entries).map(key => ({
                            id: key,
                            ...entries[key]
                        })).sort((a, b) => b.score - a.score);
                        
                        callback(scores);
                    });
                },
                
                // Add a score to the leaderboard
                addScore: (username, score, metadata = {}) => {
                    if (!username || typeof score !== 'number') {
                        return Promise.reject(new Error('Invalid score data'));
                    }
                    
                    const leaderboardRef = ref(database, `leaderboards/${gameId}`);
                    const newScoreRef = push(leaderboardRef);
                    
                    return set(newScoreRef, {
                        username: username.substring(0, 15), // Limit username length
                        score: score,
                        timestamp: Date.now(),
                        ...metadata
                    });
                },
                
                // Remove a score from the leaderboard
                removeScore: (scoreId) => {
                    const scoreRef = ref(database, `leaderboards/${gameId}/${scoreId}`);
                    return remove(scoreRef);
                }
            };
        }
    };
    
    console.log('Firebase initialized successfully');
    
} catch (error) {
    console.error('Error initializing Firebase:', error);
    
    // Provide fallback for both interfaces
    window.firebaseDB = {
        getRef: () => null,
        query: () => null,
        orderByChild: () => null,
        limitToLast: () => null,
        onValue: (_, callback) => callback({ val: () => null }),
        push: () => ({ key: 'offline-key' }),
        set: () => Promise.resolve(),
        remove: () => Promise.resolve()
    };
    
    window.firebaseService = {
        getRef: () => null,
        query: () => null,
        orderByChild: () => null,
        limitToLast: () => null,
        onValue: (_, callback) => callback({ val: () => null }),
        push: () => ({ key: 'offline-key' }),
        set: () => Promise.resolve(),
        remove: () => Promise.resolve(),
        
        // Offline game DB
        getGameDB: () => ({
            getLeaderboardRef: () => null,
            getTopScores: (_, callback) => callback([]),
            addScore: () => Promise.resolve(),
            removeScore: () => Promise.resolve()
        })
    };
    
    console.warn('Firebase is in offline mode - leaderboards will not persist');
}