import { stateManager } from './state.js';

// Main application logic and message handling
class App {
    constructor() {
        this.setupDOMElements();
        this.initMessageHandling();
        this.initStateSubscription();
    }

    setupDOMElements() {
        this.loadingElement = document.getElementById('loading');
        this.launchButton = document.getElementById('launch-app');
        this.mainContent = document.getElementById('main-content');

        // Setup launch button
        this.launchButton.addEventListener('click', () => this.launchExperience());
    }

    initStateSubscription() {
        // Subscribe to state changes
        stateManager.subscribe((state) => {
            this.updateUI(state);
        });
    }

    updateUI(state) {
        // Update UI based on state changes
        if (state.initialized && !state.loading) {
            this.launchButton.classList.remove('hidden');
        }

        if (state.loading) {
            this.loadingElement.classList.remove('hidden');
            this.launchButton.classList.add('hidden');
        } else {
            this.loadingElement.classList.add('hidden');
        }

        if (state.experience.active) {
            this.mainContent.classList.remove('hidden');
        } else {
            this.mainContent.classList.add('hidden');
        }
    }

    initMessageHandling() {
        // Listen for messages from Devvit
        window.addEventListener('message', (event) => {
            if (event.data.type === 'devvit-message') {
                const { message } = event.data;
                this.handleDevvitMessage(message);
            }
        });

        // Request initialization
        this.sendToDevvit({
            type: 'INIT_REQUEST'
        });
    }

    handleDevvitMessage(message) {
        switch (message.type) {
            case 'INIT_RESPONSE':
                stateManager.init(message.data);
                break;
            case 'STATE_UPDATE':
                stateManager.handleDevvitUpdate(message.data);
                break;
            case 'ERROR':
                console.error('Error from Devvit:', message.error);
                // Update state to show error
                stateManager.setState({ error: message.error });
                break;
            default:
                console.log('Unknown message type:', message.type);
        }
    }

    sendToDevvit(message) {
        window.parent.postMessage({
            type: 'webview-message',
            message
        }, '*');
    }

    launchExperience() {
        const state = stateManager.getState();
        if (!state.initialized) {
            console.error('App not initialized');
            return;
        }

        // Update state to show loading
        stateManager.setState({ loading: true });

        // Initialize experience
        this.sendToDevvit({
            type: 'LAUNCH_REQUEST'
        });

        // Simulate loading (remove in production)
        setTimeout(() => {
            stateManager.setState({
                loading: false,
                experience: {
                    ...state.experience,
                    active: true
                }
            });
        }, 1500);
    }
}

// Initialize the application
const app = new App();
