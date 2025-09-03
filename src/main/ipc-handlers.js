const {ipcMain, dialog} = require("electron");
const path = require("path"),
    fs = require("fs").promises;
const axios = require("axios");

/*
 * Import services (will be implemented later)
 * const LLMService = require('./services/llm-service');
 * const TemplateService = require('./services/template-service');
 * const DataService = require('./services/data-service');
 * const ResultService = require('./services/result-service');
 * const SecurityService = require('./services/security-service');
 */

// Simple in-memory storage for templates (will be replaced with proper database later)
let templates = [];
const templatesFile = path.join(process.cwd(), 'data/templates.json');

/**
 * Setup all IPC handlers for main process
 * @param {BrowserWindow} mainWindow - The main application window
 */
function setupIpcHandlers (mainWindow) {

    // File operations
    ipcMain.handle("select-file", async () => {

        const result = await dialog.showOpenDialog(mainWindow, {
            "properties": ["openFile"],
            "filters": [
                {"name": "JSONL Files",
                    "extensions": ["jsonl"]},
                {"name": "All Files",
                    "extensions": ["*"]}
            ]
        });

        if (!result.canceled) {

            return result.filePaths[0];

        }

        return null;

    });

    ipcMain.handle("read-file", async (event, filePath) => {

        try {

            const content = await fs.readFile(filePath, "utf8");


            return content;

        } catch (error) {

            throw new Error(`Failed to read file: ${error.message}`);

        }

    });

    ipcMain.handle("save-file", async (event, filePath, content) => {

        try {

            await fs.writeFile(filePath, content, "utf8");

            return true;

        } catch (error) {

            throw new Error(`Failed to save file: ${error.message}`);

        }

    });

    // LLM operations (placeholder implementations)
    ipcMain.handle("test-llm-connection", async (event, provider, config) => {

        try {

            if (provider === "ollama") {
                // Test Ollama connection
                const response = await axios.get(`${config.url}/api/tags`, {
                    timeout: 5000
                });
                return {"success": true, "message": "Ollama connection successful"};
            } else if (provider === "openai") {
                // Test OpenAI connection
                const response = await axios.get("https://api.openai.com/v1/models", {
                    headers: {
                        "Authorization": `Bearer ${config.apiKey}`
                    },
                    timeout: 5000
                });
                return {"success": true, "message": "OpenAI connection successful"};
            }

            return {"success": false, "message": "Unknown provider"};

        } catch (error) {

            return {"success": false, "message": error.message};

        }

    });

    ipcMain.handle("get-ollama-models", async (event, url) => {
        try {
            const response = await axios.get(`${url}/api/tags`, {
                timeout: 5000
            });
            const models = response.data.models || [];
            return {"success": true, "models": models.map(model => model.name)};
        } catch (error) {
            return {"success": false, "error": error.message};
        }
    });

    ipcMain.handle("get-openai-models", async (event, apiKey) => {
        try {
            const response = await axios.get("https://api.openai.com/v1/models", {
                headers: {
                    "Authorization": `Bearer ${apiKey}`
                },
                timeout: 10000
            });
            
            // Filter for chat models and sort by name
            const models = response.data.data
                .filter(model => model.id.includes('gpt') || model.id.includes('claude') || model.id.includes('gemini'))
                .map(model => ({
                    id: model.id,
                    name: model.id,
                    created: model.created,
                    object: model.object
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
            
            return {"success": true, "models": models};
        } catch (error) {
            return {"success": false, "error": error.message};
        }
    });

    // Helper function for executing prompts
    async function executePrompt(provider, prompt, config) {
        try {
            if (provider === "ollama") {
                const response = await axios.post(`${config.url}/api/generate`, {
                    "model": config.model,
                    "prompt": prompt,
                    // Ensure template's system prompt is applied for model behavior
                    "system": config.systemPrompt || undefined,
                    "stream": false
                }, {
                    timeout: config.timeout || 30000
                });

                return {"success": true, "result": response.data.response};
            } else if (provider === "openai") {
                // Use standard chat completions format for all models
                console.log("OpenAI request:", {
                    model: config.model,
                    systemPrompt: config.systemPrompt,
                    userPrompt: prompt,
                    maxTokens: config.maxTokens,
                    temperature: config.temperature
                });
                
                // Determine if using GPT-5 which has specific requirements
                const isGPT5 = config.model && config.model.includes('gpt-5');
                const requestBody = {
                    model: config.model,
                    messages: [
                        {"role": "system", "content": config.systemPrompt || "You are a helpful assistant."},
                        {"role": "user", "content": prompt}
                    ]
                };
                
                // GPT-5 has specific requirements:
                // - Uses max_completion_tokens instead of max_tokens
                // - Only supports default temperature (1), no custom values
                if (isGPT5) {
                    requestBody.max_completion_tokens = config.maxTokens || 1000;
                    // Don't set temperature for GPT-5 - it only supports default (1)
                } else {
                    requestBody.max_tokens = config.maxTokens || 1000;
                    requestBody.temperature = config.temperature || 0.7;
                }
                
                const response = await axios.post("https://api.openai.com/v1/chat/completions", requestBody, {
                    headers: {
                        "Authorization": `Bearer ${config.apiKey}`,
                        "Content-Type": "application/json"
                    },
                    timeout: config.timeout || 30000
                });

                return {"success": true, "result": response.data.choices[0].message.content};
            }

            return {"success": false, "error": "Unknown provider"};
        } catch (error) {
            console.error("Execute prompt error:", error.response?.data || error.message);
            if (error.response?.status === 400) {
                return {"success": false, "error": `Bad request: ${error.response.data?.error?.message || error.message}`};
            } else if (error.response?.status === 401) {
                return {"success": false, "error": "Invalid API key"};
            } else if (error.response?.status === 429) {
                return {"success": false, "error": "Rate limit exceeded"};
            } else {
                return {"success": false, "error": error.message};
            }
        }
    }

    ipcMain.handle("execute-prompt", async (event, provider, prompt, config) => {
        return await executePrompt(provider, prompt, config);
    });

    ipcMain.handle("execute-batch", async (event, provider, template, data, config) => {

        try {

            const results = [];

            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                
                // Replace variables in template
                let userPrompt = template.userPrompt;
                Object.keys(item).forEach(key => {
                    userPrompt = userPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), item[key]);
                });

                // Execute prompt
                const result = await executePrompt(provider, userPrompt, {
                    ...config,
                    systemPrompt: template.systemPrompt
                });

                if (result.success) {
                    results.push({
                        id: i,
                        input: item,
                        output: result.result,
                        templateId: template.id,
                        provider: provider
                    });
                } else {
                    results.push({
                        id: i,
                        input: item,
                        output: null,
                        error: result.error,
                        templateId: template.id,
                        provider: provider
                    });
                }

                // Send progress update
                mainWindow.webContents.send("execution-progress", {
                    "current": i + 1,
                    "total": data.length,
                    "percentage": ((i + 1) / data.length) * 100
                });

                // Small delay to prevent overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            return {"success": true, "results": results};

        } catch (error) {

            return {"success": false, "error": error.message};

        }

    });

    // Template operations (implemented with file storage)
    ipcMain.handle("save-template", async (event, template) => {

        try {

            // Ensure data directory exists
            const dataDir = path.dirname(templatesFile);
            await fs.mkdir(dataDir, { recursive: true });

            // Load existing templates
            let existingTemplates = [];
            try {
                const content = await fs.readFile(templatesFile, "utf8");
                existingTemplates = JSON.parse(content);
            } catch (error) {
                // File doesn't exist or is invalid, start with empty array
            }

            // Add or update template (handle case where renderer provided an id for new templates)
            if (template.id) {
                const index = existingTemplates.findIndex(t => t.id === template.id);
                const now = new Date().toISOString();
                if (index !== -1) {
                    // Update existing
                    const existing = existingTemplates[index];
                    existingTemplates[index] = {
                        ...existing,
                        ...template,
                        "createdAt": existing.createdAt || template.createdAt || now,
                        "updatedAt": now
                    };
                } else {
                    // Treat as new if not found
                    const newTemplate = {
                        ...template,
                        "createdAt": template.createdAt || now,
                        "updatedAt": now
                    };
                    existingTemplates.push(newTemplate);
                }
            } else {
                // Add new template (no id provided)
                const now = new Date().toISOString();
                template.id = Date.now().toString();
                template.createdAt = now;
                template.updatedAt = now;
                existingTemplates.push(template);
            }

            // Save to file
            const jsonContent = JSON.stringify(existingTemplates, null, 2);
            await fs.writeFile(templatesFile, jsonContent, "utf8");

            // Update the in-memory templates array
            templates = existingTemplates;

            return {"success": true, "id": template.id, "templates": existingTemplates};

        } catch (error) {

            return {"success": false, "error": error.message};

        }

    });

    ipcMain.handle("load-templates", async () => {

        try {

            // Load templates from file
            try {
                const content = await fs.readFile(templatesFile, "utf8");
                console.log("Read content from file:", content);
                templates = JSON.parse(content);
                console.log("Parsed templates:", templates);
            } catch (error) {
                // File doesn't exist or is invalid, return empty array
                templates = [];
                console.log("Error reading file:", error.message);
            }

            return {"success": true, "templates": templates};

        } catch (error) {

            return {"success": false, "error": error.message};

        }

    });

    ipcMain.handle("delete-template", async (event, templateId) => {

        try {

            // Load existing templates
            let existingTemplates = [];
            try {
                const content = await fs.readFile(templatesFile, "utf8");
                existingTemplates = JSON.parse(content);
            } catch (error) {
                return {"success": false, "error": "No templates found"};
            }

            // Remove template
            existingTemplates = existingTemplates.filter(t => t.id !== templateId);

            // Save updated list
            await fs.writeFile(templatesFile, JSON.stringify(existingTemplates, null, 2));

            return {"success": true};

        } catch (error) {

            return {"success": false, "error": error.message};

        }

    });

    // Data operations (placeholder implementations)
    ipcMain.handle("parse-jsonl", async (event, filePath) => {

        try {

            const content = await fs.readFile(filePath, "utf8"),
                lines = content.trim().split("\n"),
                data = lines.map((line, index) => {

                    try {

                        return JSON.parse(line);

                    } catch (error) {

                        throw new Error(`Invalid JSON at line ${index + 1}: ${error.message}`);

                    }

                });

            return {"success": true,
                data};

        } catch (error) {

            return {"success": false,
                "error": error.message};

        }

    });

    ipcMain.handle("validate-data", async (event, data) => {

        try {

            // TODO: Implement data validation
            return {"success": true,
                "valid": true,
                "errors": []};

        } catch (error) {

            return {"success": false,
                "error": error.message};

        }

    });

    // Result operations (placeholder implementations)
    ipcMain.handle("save-results", async (event, results) => {

        try {

            const resultsFile = path.join(process.cwd(), 'data/results.json');
            await fs.mkdir(path.dirname(resultsFile), { recursive: true });

            let existing = [];
            try {
                const content = await fs.readFile(resultsFile, 'utf8');
                existing = JSON.parse(content);
            } catch (_) {
                existing = [];
            }

            const updated = [...existing, ...results];
            await fs.writeFile(resultsFile, JSON.stringify(updated, null, 2), 'utf8');

            return {"success": true};

        } catch (error) {

            return {"success": false,
                "error": error.message};

        }

    });

    ipcMain.handle("load-results", async (event, filters) => {

        try {

            const resultsFile = path.join(process.cwd(), 'data/results.json');
            let results = [];
            try {
                const content = await fs.readFile(resultsFile, 'utf8');
                results = JSON.parse(content);
            } catch (_) {
                results = [];
            }

            // Basic filtering by templateId/provider if provided
            if (filters && (filters.templateId || filters.provider)) {
                results = results.filter(r => (
                    (!filters.templateId || r.templateId === filters.templateId) &&
                    (!filters.provider || r.provider === filters.provider)
                ));
            }

            return {"success": true,
                results};

        } catch (error) {

            return {"success": false,
                "error": error.message};

        }

    });

    ipcMain.handle("export-results", async (event, results, format) => {

        try {

            // TODO: Implement result export
            console.log(`Exporting ${results.length} results in ${format} format`);

            return {"success": true,
                "filePath": "exported_results.json"};

        } catch (error) {

            return {"success": false,
                "error": error.message};

        }

    });

    // Security operations (placeholder implementations)
    ipcMain.handle("save-api-key", async (event, provider, key) => {

        try {

            const fs = require("fs");
            const path = require("path");
            
            // Create config directory if it doesn't exist
            const configDir = path.join(__dirname, "../../data/config");
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            
            // Save API key to config file
            const configFile = path.join(configDir, "api-keys.json");
            let config = {};
            
            // Load existing config if it exists
            if (fs.existsSync(configFile)) {
                const configData = fs.readFileSync(configFile, "utf8");
                config = JSON.parse(configData);
            }
            
            // Save the API key
            config[provider] = key;
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            
            console.log(`Saved API key for ${provider}`);

            return {"success": true};

        } catch (error) {

            console.error("Error saving API key:", error);
            return {"success": false,
                "error": error.message};

        }

    });

    ipcMain.handle("get-api-key", async (event, provider) => {

        try {

            const fs = require("fs");
            const path = require("path");
            
            // Check if config file exists
            const configFile = path.join(__dirname, "../../data/config/api-keys.json");
            if (!fs.existsSync(configFile)) {
                return {"success": true, "key": null};
            }
            
            // Load config
            const configData = fs.readFileSync(configFile, "utf8");
            const config = JSON.parse(configData);
            
            const key = config[provider] || null;

            return {"success": true, "key": key};

        } catch (error) {

            console.error("Error loading API key:", error);
            return {"success": false,
                "error": error.message};

        }

    });

    ipcMain.handle("delete-api-key", async (event, provider) => {

        try {

            // TODO: Implement API key deletion
            console.log(`Deleting API key for ${provider}`);

            return {"success": true};

        } catch (error) {

            return {"success": false,
                "error": error.message};

        }

    });

    // Application operations
    ipcMain.handle("get-app-version", () => {

        return require("../../package.json").version;

    });

    ipcMain.handle("open-preferences", () => {

        // TODO: Implement preferences window
        console.log("Opening preferences");

        return {"success": true};

    });

    // Error handling for unhandled IPC calls
    ipcMain.handle("*", (event, ...args) => {

        console.warn("Unhandled IPC call:", event.sender.id, args);

        return {"success": false,
            "error": "Unhandled IPC call"};

    });

}

module.exports = {
    setupIpcHandlers
};
