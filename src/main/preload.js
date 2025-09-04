const {contextBridge, ipcRenderer} = require("electron");

/*
 * Expose protected methods that allow the renderer process to use
 * the ipcRenderer without exposing the entire object
 */
contextBridge.exposeInMainWorld("electronAPI", {
    // File operations
    "selectFile": () => ipcRenderer.invoke("select-file"),
    "readFile": (filePath) => ipcRenderer.invoke("read-file", filePath),
    "saveFile": (filePath, content) => ipcRenderer.invoke("save-file", filePath, content),

    // LLM operations
    "testLLMConnection": (provider, config) => ipcRenderer.invoke("test-llm-connection", provider, config),
    "getOllamaModels": (url) => ipcRenderer.invoke("get-ollama-models", url),
    "getOpenAIModels": (apiKey) => ipcRenderer.invoke("get-openai-models", apiKey),
    "executePrompt": (provider, prompt, config) => ipcRenderer.invoke("execute-prompt", provider, prompt, config),
    "executeBatch": (provider, template, data, config) => ipcRenderer.invoke("execute-batch", provider, template, data, config),

    // Template operations
    "saveTemplate": (template) => ipcRenderer.invoke("save-template", template),
    "loadTemplates": () => ipcRenderer.invoke("load-templates"),
    "deleteTemplate": (templateId) => ipcRenderer.invoke("delete-template", templateId),

    // Data operations
    "parseJSONL": (filePath) => ipcRenderer.invoke("parse-jsonl", filePath),
    "validateData": (data) => ipcRenderer.invoke("validate-data", data),

    // Result operations
    "saveResults": (results, metadata) => ipcRenderer.invoke("save-results", results, metadata),
    "loadResults": (filters) => ipcRenderer.invoke("load-results", filters),
    "loadResultSet": (resultSetId) => ipcRenderer.invoke("load-result-set", resultSetId),
    "deleteResultSet": (resultSetId) => ipcRenderer.invoke("delete-result-set", resultSetId),
    "exportResults": (results, format) => ipcRenderer.invoke("export-results", results, format),

    // Security operations
    "saveAPIKey": (provider, key) => ipcRenderer.invoke("save-api-key", provider, key),
    "getAPIKey": (provider) => ipcRenderer.invoke("get-api-key", provider),
    "deleteAPIKey": (provider) => ipcRenderer.invoke("delete-api-key", provider),

    // Application operations
    "getAppVersion": () => ipcRenderer.invoke("get-app-version"),
    "openPreferences": () => ipcRenderer.invoke("open-preferences"),

    // Event listeners
    "on": (channel, callback) => {

        // Whitelist channels
        const validChannels = [
            "file-selected",
            "new-template",
            "open-preferences",
            "window-focused",
            "execution-progress",
            "execution-complete",
            "execution-error"
        ];

        if (validChannels.includes(channel)) {

            ipcRenderer.on(channel, callback);

        }

    },

    "removeListener": (channel, callback) => {

        ipcRenderer.removeListener(channel, callback);

    }
});

// Handle window focus events
window.addEventListener("focus", () => {

    ipcRenderer.send("window-focused");

});
