/**
 * Shared utility functions for PromptRunner
 */

import {TEMPLATE_VARIABLE_REGEX} from "./constants.js";

/**
 * Generate a unique ID
 */
export function generateId () {

    return Date.now().toString(36) + Math.random().toString(36)
        .substr(2);

}

/**
 * Format a date to a readable string
 */
export function formatDate (date, format = "default") {

    const d = new Date(date);

    switch (format) {

    case "short":
        return d.toLocaleDateString();
    case "long":
        return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    case "iso":
        return d.toISOString();
    default:
        return d.toLocaleString();

    }

}

/**
 * Format file size in human readable format
 */
export function formatFileSize (bytes) {

    if (bytes === 0) return "0 Bytes";

    const k = 1024,
        sizes = ["Bytes", "KB", "MB", "GB"],
        i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;

}

/**
 * Format duration in human readable format
 */
export function formatDuration (ms) {

    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m`;

    return `${Math.round(ms / 3600000)}h`;

}

/**
 * Extract variables from a template string
 */
export function extractVariables (template) {

    if (!template || typeof template !== "string") {

        return [];

    }

    const variables = new Set();
    let match;

    while ((match = TEMPLATE_VARIABLE_REGEX.exec(template)) !== null) {

        variables.add(match[1].trim());

    }

    return Array.from(variables);

}

/**
 * Replace variables in a template with data
 */
export function replaceVariables (template, data) {

    if (!template || typeof template !== "string") {

        return template;

    }

    return template.replace(TEMPLATE_VARIABLE_REGEX, (match, variable) => {

        const value = data[variable.trim()];


        return value !== undefined
            ? value
            : match;

    });

}

/**
 * Validate JSON string
 */
export function isValidJSON (str) {

    try {

        JSON.parse(str);

        return true;

    } catch (e) {

        return false;

    }

}

/**
 * Deep clone an object
 */
export function deepClone (obj) {

    if (obj === null || typeof obj !== "object") {

        return obj;

    }

    if (obj instanceof Date) {

        return new Date(obj.getTime());

    }

    if (obj instanceof Array) {

        return obj.map(item => deepClone(item));

    }

    if (typeof obj === "object") {

        const cloned = {};

        for (const key in obj) {

            if (obj.hasOwnProperty(key)) {

                cloned[key] = deepClone(obj[key]);

            }

        }

        return cloned;

    }

    return obj;

}

/**
 * Debounce a function
 */
export function debounce (func, wait) {

    let timeout;


    return function executedFunction (...args) {

        const later = () => {

            clearTimeout(timeout);
            func(...args);

        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

    };

}

/**
 * Throttle a function
 */
export function throttle (func, limit) {

    let inThrottle;


    return function () {

        const args = arguments,
            context = this;

        if (!inThrottle) {

            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);

        }

    };

}

/**
 * Generate a random string
 */
export function randomString (length = 8) {

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {

        result += chars.charAt(Math.floor(Math.random() * chars.length));

    }

    return result;

}

/**
 * Sanitize filename
 */
export function sanitizeFilename (filename) {

    return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();

}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV (csv, delimiter = ",") {

    const lines = csv.split("\n"),
        headers = lines[0].split(delimiter).map(h => h.trim()),
        result = [];

    for (let i = 1; i < lines.length; i++) {

        if (lines[i].trim()) {

            const values = lines[i].split(delimiter).map(v => v.trim()),
                obj = {};

            headers.forEach((header, index) => {

                obj[header] = values[index] || "";

            });
            result.push(obj);

        }

    }

    return result;

}

/**
 * Convert array of objects to CSV string
 */
export function toCSV (data, delimiter = ",") {

    if (!data || data.length === 0) {

        return "";

    }

    const headers = Object.keys(data[0]),
        csv = [
            headers.join(delimiter),
            ...data.map(row => headers.map(header => row[header] || "").join(delimiter))
        ];

    return csv.join("\n");

}

/**
 * Calculate percentage
 */
export function calculatePercentage (part, total) {

    if (total === 0) return 0;

    return Math.round((part / total) * 100);

}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep (ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}

/**
 * Retry a function with exponential backoff
 */
export async function retry (fn, maxAttempts = 3, baseDelay = 1000) {

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        try {

            return await fn();

        } catch (error) {

            if (attempt === maxAttempts) {

                throw error;

            }

            const delay = baseDelay * Math.pow(2, attempt - 1);

            await sleep(delay);

        }

    }

}

/**
 * Validate email address
 */
export function isValidEmail (email) {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return emailRegex.test(email);

}

/**
 * Validate URL
 */
export function isValidURL (url) {

    try {

        new URL(url);

        return true;

    } catch (e) {

        return false;

    }

}

/**
 * Truncate text to specified length
 */
export function truncateText (text, maxLength = 100, suffix = "...") {

    if (!text || text.length <= maxLength) {

        return text;

    }

    return text.substring(0, maxLength - suffix.length) + suffix;

}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords (str) {

    return str.replace(/\w\S*/g, (txt) => {

        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();

    });

}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebab (str) {

    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();

}

/**
 * Convert kebab-case to camelCase
 */
export function kebabToCamel (str) {

    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

}

/**
 * Check if object is empty
 */
export function isEmpty (obj) {

    if (obj === null || obj === undefined) {

        return true;

    }

    if (typeof obj === "string") {

        return obj.trim().length === 0;

    }

    if (Array.isArray(obj)) {

        return obj.length === 0;

    }

    if (typeof obj === "object") {

        return Object.keys(obj).length === 0;

    }

    return false;

}

/**
 * Get nested object property safely
 */
export function getNestedProperty (obj, path, defaultValue = undefined) {

    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {

        if (result && typeof result === "object" && key in result) {

            result = result[key];

        } else {

            return defaultValue;

        }

    }

    return result;

}

/**
 * Set nested object property safely
 */
export function setNestedProperty (obj, path, value) {

    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {

        const key = keys[i];

        if (!(key in current) || typeof current[key] !== "object") {

            current[key] = {};

        }
        current = current[key];

    }

    current[keys[keys.length - 1]] = value;

    return obj;

}

/**
 * Flatten object
 */
export function flattenObject (obj, prefix = "") {

    const flattened = {};

    for (const key in obj) {

        if (obj.hasOwnProperty(key)) {

            const newKey = prefix
                ? `${prefix}.${key}`
                : key;

            if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {

                Object.assign(flattened, flattenObject(obj[key], newKey));

            } else {

                flattened[newKey] = obj[key];

            }

        }

    }

    return flattened;

}

/**
 * Group array by key
 */
export function groupBy (array, key) {

    return array.reduce((groups, item) => {

        const group = item[key];

        groups[group] = groups[group] || [];
        groups[group].push(item);

        return groups;

    }, {});

}

/**
 * Sort array by multiple keys
 */
export function sortBy (array, ...keys) {

    return array.sort((a, b) => {

        for (const key of keys) {

            const aVal = getNestedProperty(a, key),
                bVal = getNestedProperty(b, key);

            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;

        }

        return 0;

    });

}

/**
 * Generate UUID v4
 */
export function generateUUID () {

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {

        const r = Math.random() * 16 | 0,
            v = c === "x"
                ? r
                : (r & 0x3 | 0x8);


        return v.toString(16);

    });

}

/**
 * Check if running in Electron
 */
export function isElectron () {

    return typeof window !== "undefined" && window.process && window.process.type;

}

/**
 * Check if running in development mode
 */
export function isDevelopment () {

    return process.env.NODE_ENV === "development";

}

/**
 * Get platform information
 */
export function getPlatform () {

    if (typeof process !== "undefined") {

        return process.platform;

    }

    return "unknown";

}

/**
 * Format bytes to human readable string with precision
 */
export function formatBytes (bytes, precision = 2) {

    if (bytes === 0) return "0 Bytes";

    const k = 1024,
        sizes = ["Bytes", "KB", "MB", "GB", "TB"],
        i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(precision))} ${sizes[i]}`;

}
