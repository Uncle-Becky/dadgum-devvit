// State management for Wordsmith
class StateManager {
    constructor() {
        this.state = {
            initialized: false,
            loading: false,
            experience: {
                active: false,
                settings: {}
            },
            user: {
                preferences: this.loadFromStorage('userPreferences') || {}
            }
        };
        
        this.listeners = new Set();
    }

    // Initialize state with data from Devvit
    init(data) {
        this.state = {
            ...this.state,
            ...data,
            initialized: true
        };
        this.notifyListeners();
    }

    // Subscribe to state changes
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    // Notify all listeners of state changes
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Update state and notify listeners
    setState(updater) {
        const newState = typeof updater === 'function' 
            ? updater(this.state)
            : updater;

        this.state = {
            ...this.state,
            ...newState
        };

        this.notifyListeners();
    }

    // Get current state
    getState() {
        return this.state;
    }

    // Save data to localStorage
    saveToStorage(key, data) {
        try {
            localStorage.setItem(`wordsmith_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    // Load data from localStorage
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(`wordsmith_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    // Update user preferences
    updateUserPreferences(preferences) {
        this.setState(state => ({
            user: {
                ...state.user,
                preferences: {
                    ...state.user.preferences,
                    ...preferences
                }
            }
        }));
        this.saveToStorage('userPreferences', this.state.user.preferences);
        
        // Notify Devvit of preference changes
        window.parent.postMessage({
            type: 'webview-message',
            message: {
                type: 'PREFERENCES_UPDATE',
                data: preferences
            }
        }, '*');
    }

    // Handle incoming state updates from Devvit
    handleDevvitUpdate(update) {
        switch (update.type) {
            case 'PREFERENCES_SYNC':
                this.setState(state => ({
                    user: {
                        ...state.user,
                        preferences: {
                            ...state.user.preferences,
                            ...update.data
                        }
                    }
                }));
                break;
            case 'EXPERIENCE_UPDATE':
                this.setState(state => ({
                    experience: {
                        ...state.experience,
                        ...update.data
                    }
                }));
                break;
            default:
                console.log('Unknown update type:', update.type);
        }
    }
}

// Create and export singleton instance
export const stateManager = new StateManager();
