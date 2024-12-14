// Environment configuration
const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        isDev: true,
        apiUrl: 'http://localhost:3000',
        logLevel: 'debug',
        features: {
            debugMode: true,
            mockData: true,
            devTools: true
        }
    },
    staging: {
        isDev: false,
        apiUrl: 'https://staging-api.reddit.com',
        logLevel: 'info',
        features: {
            debugMode: true,
            mockData: false,
            devTools: true
        }
    },
    production: {
        isDev: false,
        apiUrl: 'https://api.reddit.com',
        logLevel: 'error',
        features: {
            debugMode: false,
            mockData: false,
            devTools: false
        }
    }
};

// Validate environment
if (!config[env]) {
    throw new Error(`Invalid environment: ${env}`);
}

export const currentEnv = env;
export const envConfig = config[env];

// Environment helper functions
export const isDev = () => env === 'development';
export const isStaging = () => env === 'staging';
export const isProd = () => env === 'production';

// Feature flags
export const isFeatureEnabled = (featureName) => {
    return envConfig.features[featureName] || false;
};

// Logging utility that respects environment
export const logger = {
    debug: (...args) => {
        if (envConfig.logLevel === 'debug') {
            console.debug('[DEBUG]', ...args);
        }
    },
    info: (...args) => {
        if (['debug', 'info'].includes(envConfig.logLevel)) {
            console.info('[INFO]', ...args);
        }
    },
    warn: (...args) => {
        if (['debug', 'info', 'warn'].includes(envConfig.logLevel)) {
            console.warn('[WARN]', ...args);
        }
    },
    error: (...args) => {
        console.error('[ERROR]', ...args);
    }
};
