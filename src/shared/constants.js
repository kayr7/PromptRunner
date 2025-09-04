/**
 * Shared constants for PromptRunner
 */

// Application constants
export const APP_NAME = "PromptRunner";
export const APP_VERSION = "0.1.0";
export const APP_DESCRIPTION = "An Electron application for running prompts with LLMs";

// File paths and directories
export const DATA_DIR = "data";
export const TEMPLATES_DIR = "templates";
export const RESULTS_DIR = "results";
export const CONFIG_DIR = "config";

// File extensions
export const SUPPORTED_FILE_EXTENSIONS = [".jsonl", ".json"];
export const EXPORT_FORMATS = ["json", "csv", "txt"];

// LLM Providers
export const PROVIDERS = {
    "OLLAMA": "ollama",
    "OPENAI": "openai"
};

export const PROVIDER_NAMES = {
    [PROVIDERS.OLLAMA]: "Ollama (Local)",
    [PROVIDERS.OPENAI]: "OpenAI (Cloud)"
};

// Default configurations
export const DEFAULT_CONFIG = {
    "ollama": {
        "url": "http://localhost:11434",
        "model": "llama2",
        "timeout": 60000
    },
    "openai": {
        "model": "gpt-3.5-turbo",
        "maxTokens": 100000,
        "temperature": 0.7,
        "timeout": 60000
    }
};

// Template variables
export const TEMPLATE_VARIABLE_REGEX = /\{\{([^}]+)\}\}/g;
export const MAX_TEMPLATE_NAME_LENGTH = 100;
export const MAX_PROMPT_LENGTH = 100000;

// Execution settings
export const DEFAULT_BATCH_SIZE = 10;
export const MAX_BATCH_SIZE = 100;
export const MIN_BATCH_SIZE = 1;
export const EXECUTION_TIMEOUT = 600000; // 5 minutes

// UI constants
export const THEMES = {
    "LIGHT": "light",
    "DARK": "dark"
};

export const NOTIFICATION_TYPES = {
    "SUCCESS": "success",
    "ERROR": "error",
    "WARNING": "warning",
    "INFO": "info"
};

export const NOTIFICATION_DURATION = 3000; // 3 seconds

// Status indicators
export const STATUS_TYPES = {
    "ONLINE": "online",
    "OFFLINE": "offline",
    "CONFIGURING": "configuring",
    "ERROR": "error"
};

// Error messages
export const ERROR_MESSAGES = {
    "FILE_NOT_FOUND": "File not found",
    "INVALID_JSON": "Invalid JSON format",
    "NETWORK_ERROR": "Network error occurred",
    "API_KEY_MISSING": "API key is required",
    "TEMPLATE_NOT_FOUND": "Template not found",
    "DATA_NOT_LOADED": "No data loaded",
    "EXECUTION_FAILED": "Execution failed",
    "PROVIDER_NOT_CONFIGURED": "Provider not configured"
};

// Success messages
export const SUCCESS_MESSAGES = {
    "TEMPLATE_SAVED": "Template saved successfully",
    "DATA_LOADED": "Data loaded successfully",
    "CONNECTION_SUCCESS": "Connection successful",
    "EXECUTION_COMPLETE": "Execution completed",
    "RESULTS_EXPORTED": "Results exported successfully"
};

// Database constants
export const DB_NAME = "promptrunner.db";
export const DB_VERSION = 1;

// Security constants
export const KEYCHAIN_SERVICE = "PromptRunner";
export const ENCRYPTION_ALGORITHM = "aes-256-gcm";

// Rate limiting
export const RATE_LIMITS = {
    "openai": {
        "requestsPerMinute": 60,
        "requestsPerHour": 3500
    },
    "ollama": {
        "requestsPerMinute": 100,
        "requestsPerHour": 10000
    }
};

// Validation rules
export const VALIDATION_RULES = {
    "templateName": {
        "minLength": 1,
        "maxLength": MAX_TEMPLATE_NAME_LENGTH,
        "pattern": /^[a-zA-Z0-9\s\-_]+$/
    },
    "apiKey": {
        "minLength": 20,
        "pattern": /^sk-[a-zA-Z0-9]{32,}$/
    },
    "url": {
        "pattern": /^https?:\/\/.+/,
        "protocols": ["http:", "https:"]
    }
};

// Performance settings
export const PERFORMANCE = {
    "MAX_CONCURRENT_REQUESTS": 5,
    "REQUEST_DELAY": 100, // ms between requests
    "CACHE_TTL": 3600000, // 1 hour
    "MAX_MEMORY_USAGE": 512 * 1024 * 1024 // 512MB
};

// Logging
export const LOG_LEVELS = {
    "ERROR": "error",
    "WARN": "warn",
    "INFO": "info",
    "DEBUG": "debug"
};

export const LOG_FILE = "promptrunner.log";
export const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_LOG_FILES = 5;

// Export formats
export const EXPORT_OPTIONS = {
    "json": {
        "extension": ".json",
        "mimeType": "application/json",
        "description": "JSON format"
    },
    "csv": {
        "extension": ".csv",
        "mimeType": "text/csv",
        "description": "CSV format"
    },
    "txt": {
        "extension": ".txt",
        "mimeType": "text/plain",
        "description": "Plain text"
    }
};

// UI Layout
export const LAYOUT = {
    "SIDEBAR_WIDTH": 240,
    "HEADER_HEIGHT": 60,
    "FOOTER_HEIGHT": 40,
    "MIN_WINDOW_WIDTH": 800,
    "MIN_WINDOW_HEIGHT": 600
};

// Animation durations
export const ANIMATIONS = {
    "FAST": 150,
    "NORMAL": 300,
    "SLOW": 500
};

// Color schemes
export const COLORS = {
    "primary": "#007bff",
    "secondary": "#6c757d",
    "success": "#28a745",
    "danger": "#dc3545",
    "warning": "#ffc107",
    "info": "#17a2b8"
};
