/**
 * PromptRunner - Main Application
 * Handles UI logic, user interactions, and communication with the main process
 */

class PromptRunnerApp {

    constructor () {

        this.currentTab = "templates";
        this.currentData = null;
        this.currentDataFile = null; // Store the current file path
        this.templates = [];
        this.results = [];
        this.flattenedResults = [];
        this.resultsView = "list"; // list | table | aggregations
        this.isExecuting = false;
        this.columnWidths = new Map(); // Store column widths for resizing
        this.isResizing = false;

        this.init();

    }

    /**
     * Initialize the application
     */
    init () {

        this.setupEventListeners();
        this.loadAppVersion();
        this.loadTemplates();
        this.setupTheme();
        this.setupOpenAIModelsRefresh();
        this.loadSavedConfigurations();
        // Ensure execution controls start in an enabled state
        this.updateExecutionUI(false);
        this.updateStatus("Ready");

    }

    /**
     * Load saved configurations
     */
    async loadSavedConfigurations() {
        try {
            // Load OpenAI API key
            const openaiResult = await window.electronAPI.getAPIKey("openai");
            if (openaiResult.success && openaiResult.key) {
                const apiKeyInput = document.getElementById("openai-api-key");
                apiKeyInput.value = openaiResult.key;
                this.updateProviderStatus("openai", "configuring");
                console.log("Loaded saved OpenAI API key");
            }
        } catch (error) {
            console.error("Error loading saved configurations:", error);
        }
    }

    /**
     * Setup OpenAI models refresh button
     */
    setupOpenAIModelsRefresh() {
        const refreshBtn = document.getElementById("refresh-openai-models-btn");
        if (refreshBtn) {
            refreshBtn.addEventListener("click", () => {
                console.log("Refresh OpenAI models button clicked");
                this.refreshOpenAIModels();
            });
        } else {
            console.error("Refresh OpenAI models button not found");
        }
    }

    /**
     * Refresh OpenAI models
     */
    async refreshOpenAIModels () {
        console.log("refreshOpenAIModels called");
        const apiKey = document.getElementById("openai-api-key").value;
        console.log("API key length:", apiKey ? apiKey.length : 0);
        
        if (!apiKey) {
            this.showNotification("Please enter OpenAI API key first", "error");
            return;
        }

        try {
            this.updateStatus("Fetching OpenAI models...");
            console.log("Calling getOpenAIModels...");
            const result = await window.electronAPI.getOpenAIModels(apiKey);
            console.log("getOpenAIModels result:", result);
            
            if (result.success) {
                const modelSelect = document.getElementById("openai-model");
                console.log("Populating model dropdown with:", result.models.length, "models");
                modelSelect.innerHTML = "<option value=\"\">Select model...</option>";
                
                result.models.forEach(model => {
                    const option = document.createElement("option");
                    option.value = model.id;
                    option.textContent = model.name;
                    modelSelect.appendChild(option);
                    console.log("Added model option:", model.id, model.name);
                });
                
                this.showNotification(`Loaded ${result.models.length} models`, "success");
                this.updateStatus("OpenAI models loaded");
            } else {
                this.showNotification("Failed to load models", "error");
                this.updateStatus("Failed to load models");
            }
        } catch (error) {
            console.error("Error in refreshOpenAIModels:", error);
            this.showNotification("Error loading models", "error");
            this.updateStatus("Error loading models");
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners () {

        // Navigation
        document.querySelectorAll(".nav-link").forEach(link => {

            link.addEventListener("click", (e) => {

                this.switchTab(e.target.dataset.tab);

            });

        });

        // Theme toggle
        document.getElementById("theme-toggle").addEventListener("click", () => {

            this.toggleTheme();

        });

        // Template editor
        document.getElementById("new-template-btn").addEventListener("click", () => {

            this.newTemplate();

        });

        document.getElementById("save-template-btn").addEventListener("click", () => {

            this.saveTemplate();

        });

        document.getElementById("preview-template-btn").addEventListener("click", () => {

            this.previewTemplate();

        });

        // Data loading
        document.getElementById("load-data-btn").addEventListener("click", () => {

            this.loadDataFile();

        });

        document.getElementById("clear-data-btn").addEventListener("click", () => {

            this.clearData();

        });

        // File drop zone
        const dropZone = document.getElementById("file-drop-zone");

        dropZone.addEventListener("click", () => this.loadDataFile());
        dropZone.addEventListener("dragover", (e) => {

            e.preventDefault();
            dropZone.classList.add("dragover");

        });
        dropZone.addEventListener("dragleave", () => {

            dropZone.classList.remove("dragover");

        });
        dropZone.addEventListener("drop", (e) => {

            e.preventDefault();
            dropZone.classList.remove("dragover");
            const {files} = e.dataTransfer;

            if (files.length > 0) {

                this.handleFileDrop(files[0]);

            }

        });

        // Provider configuration
        document.getElementById("test-ollama-btn").addEventListener("click", () => {

            this.testOllamaConnection();

        });

        document.getElementById("refresh-ollama-models-btn").addEventListener("click", () => {

            this.refreshOllamaModels();

        });

        document.getElementById("test-openai-btn").addEventListener("click", () => {

            this.testOpenAIConnection();

        });

        document.getElementById("save-openai-config-btn").addEventListener("click", () => {

            this.saveOpenAIConfig();

        });

        document.getElementById("toggle-openai-key").addEventListener("click", () => {

            this.toggleAPIKeyVisibility();

        });

        // Execution
        document.getElementById("start-execution-btn").addEventListener("click", () => {

            this.startExecution();

        });

        document.getElementById("stop-execution-btn").addEventListener("click", () => {

            this.stopExecution();

        });

        // Results
        document.getElementById("export-results-btn").addEventListener("click", () => {

            this.exportResults();

        });

        document.getElementById("clear-results-btn").addEventListener("click", () => {

            this.clearResults();

        });

        // Results view toggles
        ["results-view-list", "results-view-table", "results-view-aggregations"].forEach(id => {
            document.getElementById(id).addEventListener("click", (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchResultsView(view);
            });
        });

        // Categorical histograms button
        document.getElementById("show-categorical-histograms-btn").addEventListener("click", () => {
            this.showCategoricalHistograms();
        });

        // Save/Load results buttons
        document.getElementById("save-results-btn").addEventListener("click", () => {
            this.showSaveResultsModal();
        });

        document.getElementById("load-saved-results-btn").addEventListener("click", () => {
            this.showLoadResultsModal();
        });

        // Modal event listeners
        document.getElementById("close-save-modal").addEventListener("click", () => {
            this.hideSaveResultsModal();
        });

        document.getElementById("cancel-save-results").addEventListener("click", () => {
            this.hideSaveResultsModal();
        });

        document.getElementById("confirm-save-results").addEventListener("click", () => {
            this.saveResults();
        });

        document.getElementById("close-load-modal").addEventListener("click", () => {
            this.hideLoadResultsModal();
        });

        document.getElementById("close-load-results").addEventListener("click", () => {
            this.hideLoadResultsModal();
        });

        // Search functionality
        document.getElementById("load-results-search").addEventListener("input", (e) => {
            this.filterSavedResults(e.target.value);
        });

        // Results search functionality
        document.getElementById("results-search-input").addEventListener("input", (e) => {
            this.filterResults(e.target.value);
        });

        // Compare results functionality
        document.getElementById("compare-results-btn").addEventListener("click", () => {
            this.showCompareResultsModal();
        });

        document.getElementById("close-compare-modal").addEventListener("click", () => {
            this.hideCompareResultsModal();
        });

        document.getElementById("start-comparison-btn").addEventListener("click", () => {
            this.startComparison();
        });

        // Cell content modal functionality
        document.getElementById("close-cell-modal").addEventListener("click", () => {
            this.hideCellContentModal();
        });

        document.getElementById("close-cell-content").addEventListener("click", () => {
            this.hideCellContentModal();
        });

        document.getElementById("copy-cell-content").addEventListener("click", () => {
            this.copyCellContent();
        });

        // IPC event listeners
        window.electronAPI.on("file-selected", (event, filePath) => {

            this.handleFileSelected(filePath);

        });

        window.electronAPI.on("new-template", () => {

            this.newTemplate();

        });

        window.electronAPI.on("execution-progress", (event, progress) => {

            this.updateExecutionProgress(progress);

        });

        window.electronAPI.on("execution-complete", (event, results) => {

            this.handleExecutionComplete(results);

        });

        window.electronAPI.on("execution-error", (event, error) => {

            this.handleExecutionError(error);

        });

        // Template variable detection
        document.getElementById("user-prompt").addEventListener("input", () => {

            this.updateTemplateVariables();

        });

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            // Escape key to close modals
            if (e.key === "Escape") {
                const cellModal = document.getElementById("cell-content-modal");
                if (!cellModal.classList.contains("hidden")) {
                    this.hideCellContentModal();
                }
            }
        });

    }

    /**
     * Switch between tabs
     */
    switchTab (tabName) {

        // Update navigation
        document.querySelectorAll(".nav-link").forEach(link => {

            link.classList.remove("active");

        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

        // Update content
        document.querySelectorAll(".tab-content").forEach(content => {

            content.classList.remove("active");

        });
        document.getElementById(`${tabName}-tab`).classList.add("active");

        this.currentTab = tabName;

    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme () {

        const currentTheme = document.documentElement.getAttribute("data-theme"),
            newTheme = currentTheme === "dark"
                ? "light"
                : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);

        const themeIcon = document.querySelector(".theme-icon");

        themeIcon.textContent = newTheme === "dark"
            ? "☀️"
            : "🌙";

    }

    /**
     * Setup theme from localStorage
     */
    setupTheme () {

        const savedTheme = localStorage.getItem("theme") || "light";

        document.documentElement.setAttribute("data-theme", savedTheme);

        const themeIcon = document.querySelector(".theme-icon");

        themeIcon.textContent = savedTheme === "dark"
            ? "☀️"
            : "🌙";

    }

    /**
     * Load application version
     */
    async loadAppVersion () {

        try {

            const version = await window.electronAPI.getAppVersion();

            document.getElementById("app-version").textContent = `v${version}`;

        } catch (error) {

            console.error("Failed to load app version:", error);

        }

    }

    /**
     * Create a new template
     */
    newTemplate () {

        const nameInput = document.getElementById("template-name");
        nameInput.value = "";
        delete nameInput.dataset.templateId;
        delete nameInput.dataset.originalName; // Clear original name for new templates
        document.getElementById("system-prompt").value = "";
        document.getElementById("user-prompt").value = "";
        this.updateTemplateVariables();
        this.switchTab("templates");

    }

    /**
     * Save the current template
     */
    async saveTemplate () {

        const name = document.getElementById("template-name").value.trim(),
            systemPrompt = document.getElementById("system-prompt").value.trim(),
            userPrompt = document.getElementById("user-prompt").value.trim();

        if (!name) {

            this.showNotification("Please enter a template name", "error");

            return;

        }

        if (!userPrompt) {

            this.showNotification("Please enter a user prompt template", "error");

            return;

        }

        // Check if we're editing an existing template
        const nameInput = document.getElementById("template-name");
        const existingTemplateId = nameInput.dataset.templateId;
        const originalName = nameInput.dataset.originalName;
        
        // Determine if this should be a new template
        const isEditingExisting = !!existingTemplateId;
        const nameChanged = isEditingExisting && originalName && originalName !== name;
        const shouldCreateNew = nameChanged;
        
        let templateId;
        let createdAt;
        
        if (shouldCreateNew) {
            // Name changed - create new template
            templateId = Date.now().toString();
            createdAt = new Date().toISOString();
            console.log(`Creating new template due to name change: "${originalName}" -> "${name}"`);
        } else if (isEditingExisting) {
            // Same name - update existing
            templateId = existingTemplateId;
            createdAt = undefined; // Will be preserved by backend
        } else {
            // Brand new template
            templateId = Date.now().toString();
            createdAt = new Date().toISOString();
        }
        
        const template = {
            "id": templateId,
            name,
            systemPrompt,
            userPrompt,
            "variables": this.extractVariables(userPrompt),
            "createdAt": createdAt,
            "isNewFromNameChange": shouldCreateNew // Flag for backend
        };

        try {

            const result = await window.electronAPI.saveTemplate(template);

            if (result.success) {

                if (shouldCreateNew) {
                    this.showNotification(`New template created: "${name}"`, "success");
                    // Clear editing state since we created a new template
                    nameInput.dataset.templateId = result.id;
                    nameInput.dataset.originalName = name;
                } else {
                    this.showNotification("Template saved successfully", "success");
                }
                
                // Update templates directly from the response
                this.templates = result.templates || [];
                this.renderTemplates();
                this.updateTemplateSelects();

            } else {

                this.showNotification("Failed to save template", "error");

            }

        } catch (error) {

            this.showNotification("Error saving template", "error");
            console.error("Save template error:", error);

        }

    }

    /**
     * Preview the current template
     */
    previewTemplate () {

        const systemPrompt = document.getElementById("system-prompt").value,
            userPrompt = document.getElementById("user-prompt").value,
            variables = this.extractVariables(userPrompt);

        if (!userPrompt) {

            this.showNotification("Please enter a user prompt template", "error");

            return;

        }

        let preview = `System Prompt:\n${systemPrompt || "(None)"}\n\n`;

        preview += `User Prompt Template:\n${userPrompt}\n\n`;

        if (variables.length > 0) {

            preview += `Variables: ${variables.join(", ")}`;

        } else {

            preview += "No variables detected";

        }

        alert(preview);

    }

    /**
     * Load saved templates
     */
    async loadTemplates () {

        try {

            const result = await window.electronAPI.loadTemplates();

            if (result.success) {

                this.templates = result.templates || [];
                this.renderTemplates();
                this.updateTemplateSelects();

            } else {

                console.error("Failed to load templates:", result.error);

            }

        } catch (error) {

            console.error("Load templates error:", error);

        }

    }

    /**
     * Render templates in the list
     */
    renderTemplates () {

        const container = document.getElementById("templates-container");

        if (this.templates.length === 0) {

            container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <p>No templates saved yet</p>
          <p>Create your first template to get started</p>
        </div>
      `;

            return;

        }

        container.innerHTML = this.templates.map(template => `
      <div class="template-card" data-template-id="${template.id}">
        <h4>${template.name}</h4>
        <p>${template.userPrompt.substring(0, 100)}${template.userPrompt.length > 100
    ? "..."
    : ""}</p>
        <div class="template-actions">
          <button class="btn btn-text" onclick="app.editTemplate('${template.id}')">Edit</button>
          <button class="btn btn-text" onclick="app.deleteTemplate('${template.id}')">Delete</button>
        </div>
      </div>
    `).join("");

    }

    /**
     * Update template variables display
     */
    updateTemplateVariables () {

        const userPrompt = document.getElementById("user-prompt").value,
            variables = this.extractVariables(userPrompt),
            container = document.getElementById("template-variables");

        if (variables.length === 0) {

            container.innerHTML = "<div class=\"variable-item\"><span class=\"variable-name\">No variables defined</span></div>";

            return;

        }

        container.innerHTML = variables.map(variable => `
      <div class="variable-item">
        <span class="variable-name">{{${variable}}}</span>
      </div>
    `).join("");

    }

    /**
     * Extract variables from template
     */
    extractVariables (template) {

        const regex = /\{\{([^}]+)\}\}/g,
            variables = new Set();
        let match;

        while ((match = regex.exec(template)) !== null) {

            variables.add(match[1].trim());

        }

        return Array.from(variables);

    }

    /**
     * Load data file
     */
    async loadDataFile () {

        try {

            const filePath = await window.electronAPI.selectFile();

            if (filePath) {

                await this.handleFileSelected(filePath);

            }

        } catch (error) {

            this.showNotification("Error selecting file", "error");
            console.error("Select file error:", error);

        }

    }

    /**
     * Handle file selection
     */
    async handleFileSelected (filePath) {

        try {

            this.updateStatus("Loading file...");
            const result = await window.electronAPI.parseJSONL(filePath);

            if (result.success) {

                this.currentData = result.data;
                this.currentDataFile = filePath; // Store the file path
                this.renderDataPreview();
                this.updateStatus(`Loaded ${result.data.length} records`);

            } else {

                this.showNotification("Failed to parse file", "error");
                this.updateStatus("Error loading file");

            }

        } catch (error) {

            this.showNotification("Error loading file", "error");
            this.updateStatus("Error loading file");
            console.error("File loading error:", error);

        }

    }

    /**
     * Handle file drop
     */
    async handleFileDrop (file) {

        if (!file.name.endsWith(".jsonl")) {

            this.showNotification("Please select a JSONL file", "error");

            return;

        }

        try {

            this.updateStatus("Loading file...");
            const content = await window.electronAPI.readFile(file.path),
                result = await window.electronAPI.parseJSONL(file.path);

            if (result.success) {

                this.currentData = result.data;
                this.currentDataFile = file.path; // Store the file path
                this.renderDataPreview();
                this.updateStatus(`Loaded ${result.data.length} records`);

            } else {

                this.showNotification("Failed to parse file", "error");
                this.updateStatus("Error loading file");

            }

        } catch (error) {

            this.showNotification("Error loading file", "error");
            this.updateStatus("Error loading file");
            console.error("File drop error:", error);

        }

    }

    /**
     * Render data preview
     */
    renderDataPreview () {

        const preview = document.getElementById("data-preview"),
            count = document.getElementById("data-count"),
            headers = document.getElementById("data-headers"),
            rows = document.getElementById("data-rows");

        preview.classList.remove("hidden");
        count.textContent = `${this.currentData.length} records`;

        if (this.currentData.length === 0) {

            headers.innerHTML = "";
            rows.innerHTML = "<tr><td colspan=\"1\">No data</td></tr>";

            return;

        }

        // Get all unique keys
        const allKeys = new Set();

        this.currentData.forEach(item => {

            Object.keys(item).forEach(key => allKeys.add(key));

        });
        const keys = Array.from(allKeys);

        // Render headers
        headers.innerHTML = keys.map(key => `<th>${key}</th>`).join("");

        // Render first 10 rows
        const displayData = this.currentData.slice(0, 10);

        rows.innerHTML = displayData.map(item => `
      <tr>${keys.map(key => `<td>${item[key] || ""}</td>`).join("")}</tr>
    `).join("");

        if (this.currentData.length > 10) {

            rows.innerHTML += `<tr><td colspan="${keys.length}" style="text-align: center; color: var(--text-muted);">... and ${this.currentData.length - 10} more rows</td></tr>`;

        }

    }

    /**
     * Clear loaded data
     */
    clearData () {

        this.currentData = null;
        document.getElementById("data-preview").classList.add("hidden");
        this.updateStatus("Data cleared");

    }

    /**
     * Test Ollama connection
     */
    async testOllamaConnection () {

        const url = document.getElementById("ollama-url").value,
            model = document.getElementById("ollama-model").value;

        if (!url) {

            this.showNotification("Please enter Ollama URL", "error");

            return;

        }

        try {

            this.updateStatus("Testing Ollama connection...");
            const result = await window.electronAPI.testLLMConnection("ollama", {url,
                model});

            if (result.success) {

                this.showNotification("Ollama connection successful", "success");
                this.updateProviderStatus("ollama", "online");
                this.updateStatus("Ollama connected");

            } else {

                this.showNotification("Ollama connection failed", "error");
                this.updateProviderStatus("ollama", "offline");
                this.updateStatus("Ollama connection failed");

            }

        } catch (error) {

            this.showNotification("Error testing Ollama connection", "error");
            this.updateProviderStatus("ollama", "offline");
            this.updateStatus("Ollama connection error");
            console.error("Ollama test error:", error);

        }

    }

    /**
     * Refresh Ollama models
     */
    async refreshOllamaModels () {

        const url = document.getElementById("ollama-url").value;

        if (!url) {

            this.showNotification("Please enter Ollama URL first", "error");

            return;

        }

        try {

            this.updateStatus("Fetching Ollama models...");
            const result = await window.electronAPI.getOllamaModels(url);

            if (result.success) {

                const modelSelect = document.getElementById("ollama-model");
                modelSelect.innerHTML = "<option value=\"\">Select model...</option>";

                result.models.forEach(model => {

                    const option = document.createElement("option");
                    option.value = model;
                    option.textContent = model;
                    modelSelect.appendChild(option);

                });

                this.showNotification(`Loaded ${result.models.length} models`, "success");
                this.updateStatus("Ollama models loaded");

            } else {

                this.showNotification("Failed to load models", "error");
                this.updateStatus("Failed to load models");

            }

        } catch (error) {

            this.showNotification("Error loading models", "error");
            this.updateStatus("Error loading models");
            console.error("Load models error:", error);

        }

    }

    /**
     * Test OpenAI connection
     */
    async testOpenAIConnection () {

        const apiKey = document.getElementById("openai-api-key").value,
            model = document.getElementById("openai-model").value;

        if (!apiKey) {

            this.showNotification("Please enter OpenAI API key", "error");

            return;

        }

        try {

            this.updateStatus("Testing OpenAI connection...");
            const result = await window.electronAPI.testLLMConnection("openai", {apiKey,
                model});

            if (result.success) {

                this.showNotification("OpenAI connection successful", "success");
                this.updateProviderStatus("openai", "online");
                this.updateStatus("OpenAI connected");

            } else {

                this.showNotification("OpenAI connection failed", "error");
                this.updateProviderStatus("openai", "offline");
                this.updateStatus("OpenAI connection failed");

            }

        } catch (error) {

            this.showNotification("Error testing OpenAI connection", "error");
            this.updateProviderStatus("openai", "offline");
            this.updateStatus("OpenAI connection error");
            console.error("OpenAI test error:", error);

        }

    }

    /**
     * Save OpenAI configuration
     */
    async saveOpenAIConfig () {

        const apiKey = document.getElementById("openai-api-key").value;

        if (!apiKey) {

            this.showNotification("Please enter OpenAI API key", "error");

            return;

        }

        try {

            const result = await window.electronAPI.saveAPIKey("openai", apiKey);

            if (result.success) {

                this.showNotification("OpenAI configuration saved", "success");
                this.updateProviderStatus("openai", "configuring");
                this.updateStatus("OpenAI configured");

            } else {

                this.showNotification("Failed to save OpenAI configuration", "error");

            }

        } catch (error) {

            this.showNotification("Error saving OpenAI configuration", "error");
            console.error("Save OpenAI config error:", error);

        }

    }

    /**
     * Toggle API key visibility
     */
    toggleAPIKeyVisibility () {

        const input = document.getElementById("openai-api-key"),
            button = document.getElementById("toggle-openai-key");

        if (input.type === "password") {

            input.type = "text";
            button.textContent = "🙈";

        } else {

            input.type = "password";
            button.textContent = "👁️";

        }

    }

    /**
     * Start execution
     */
    async startExecution () {

        const templateId = document.getElementById("execution-template").value,
            provider = document.getElementById("execution-provider").value,
            manualInput = document.getElementById("execution-input").value.trim();

        if (!templateId) {

            this.showNotification("Please select a template", "error");

            return;

        }

        if (!provider) {

            this.showNotification("Please select a provider", "error");

            return;

        }

        const template = this.templates.find(t => t.id === templateId);

        if (!template) {

            this.showNotification("Template not found", "error");

            return;

        }

        // Determine data source
        let executionData = [];
        if (manualInput) {
            // Use manual input
            try {
                const parsedInput = JSON.parse(manualInput);
                executionData = [parsedInput];
            } catch (error) {
                this.showNotification("Invalid JSON in manual input", "error");
                return;
            }
        } else if (this.currentData && this.currentData.length > 0) {
            // Use loaded JSONL data
            executionData = this.currentData;
        } else {
            this.showNotification("Please provide manual input or load a JSONL file", "error");
            return;
        }

        try {

            this.isExecuting = true;
            this.updateExecutionUI(true);
            this.updateStatus("Starting execution...");

            // Build provider-specific config
            let providerConfig = {};
            if (provider === "ollama") {
                const url = document.getElementById("ollama-url").value.trim(),
                    model = document.getElementById("ollama-model").value.trim();

                if (!url) {
                    this.showNotification("Please enter Ollama URL", "error");
                    return;
                }
                if (!model) {
                    this.showNotification("Please select an Ollama model", "error");
                    return;
                }

                providerConfig = { url, model };

            } else if (provider === "openai") {
                const apiKey = document.getElementById("openai-api-key").value.trim(),
                    model = document.getElementById("openai-model").value.trim();

                console.log("OpenAI execution config:", { apiKey: apiKey ? "***" : "missing", model });

                if (!apiKey) {
                    this.showNotification("Please enter OpenAI API key", "error");
                    return;
                }
                if (!model) {
                    this.showNotification("Please select an OpenAI model", "error");
                    return;
                }

                providerConfig = { apiKey, model };
            }

            const result = await window.electronAPI.executeBatch(provider, template, executionData, providerConfig);

            if (result.success) {

                this.results = result.results;
                
                // Calculate execution summary
                const totalResults = this.results.length;
                const errorCount = this.results.filter(r => !!r.error).length;
                const emptyCount = this.results.filter(r => r.isEmpty || (!r.output || r.output.toString().trim() === "")).length;
                const successCount = totalResults - errorCount;
                
                console.log("Execution Summary:", {
                    total: totalResults,
                    successful: successCount,
                    errors: errorCount,
                    empty: emptyCount,
                    emptyPercentage: ((emptyCount / totalResults) * 100).toFixed(1) + '%'
                });
                
                // Auto-save results with metadata
                try {
                    const template = this.templates.find(t => t.id === this.results[0]?.templateId);
                    
                    // Get input file name
                    let inputFileName = "Manual Input";
                    if (this.currentDataFile) {
                        const pathParts = this.currentDataFile.split('/');
                        inputFileName = pathParts[pathParts.length - 1] || "Unknown File";
                    }
                    
                    // Get provider and model
                    const provider = this.results[0]?.provider || "Unknown Provider";
                    const model = this.results[0]?.model || "Unknown Model";
                    
                    // Generate auto-save name
                    const autoSaveName = `${template?.name || "Template"} - ${inputFileName} - ${provider} (${model})`;
                    
                    const metadata = {
                        name: autoSaveName,
                        description: `Auto-saved results from ${template?.name || "template"} execution`,
                        templateId: template?.id,
                        templateName: template?.name,
                        provider: provider,
                        model: model
                    };
                    
                    await window.electronAPI.saveResults(this.results, metadata);
                } catch (e) {
                    console.error('Failed to auto-save results:', e);
                }
                
                // Show completion notification with summary
                let notificationMessage = `Execution completed: ${successCount}/${totalResults} successful`;
                if (emptyCount > 0) {
                    notificationMessage += `, ${emptyCount} empty outputs`;
                }
                if (errorCount > 0) {
                    notificationMessage += `, ${errorCount} errors`;
                }
                
                this.showNotification(notificationMessage, emptyCount > 0 || errorCount > 0 ? "warning" : "success");
                this.updateStatus(`Execution completed: ${totalResults} results (${successCount} successful, ${emptyCount} empty, ${errorCount} errors)`);
                this.renderResults();
                this.switchTab("results");

            } else {

                this.showNotification("Execution failed", "error");
                this.updateStatus("Execution failed");

            }

        } catch (error) {

            this.showNotification("Error during execution", "error");
            this.updateStatus("Execution error");
            console.error("Execution error:", error);

        } finally {

            this.isExecuting = false;
            this.updateExecutionUI(false);

        }

    }

    /**
     * Stop execution
     */
    stopExecution () {

        this.isExecuting = false;
        this.updateExecutionUI(false);
        this.updateStatus("Execution stopped");

    }

    /**
     * Render results list
     */
    renderResults () {

        const list = document.getElementById("results-list");
        const listContainer = document.getElementById("results-list-container");
        const listEmpty = document.getElementById("results-list-empty");

        if (!this.results || this.results.length === 0) {
            listContainer.classList.add("hidden");
            listEmpty.classList.remove("hidden");
            return;
        }

        // Show the list container and hide empty state
        listContainer.classList.remove("hidden");
        listEmpty.classList.add("hidden");

        // Build a map of templateId -> template name for display
        const templateNameById = {};
        this.templates.forEach(t => { templateNameById[t.id] = t.name; });

        list.innerHTML = this.results.map((r, index) => {
            const title = `${templateNameById[r.templateId] || "Template"} • ${r.provider || "provider"} • #${r.id}`;
            const input = JSON.stringify(r.input, null, 2);
            
            // Determine if output is empty or has error
            const hasError = !!r.error;
            const isEmpty = r.isEmpty || (!r.output || r.output.toString().trim() === "");
            const hasEmptyOutput = isEmpty && !hasError;
            
            // Add status badges
            let badges = "";
            if (hasError) {
                badges += '<span class="error-badge">Error</span>';
            } else if (hasEmptyOutput) {
                badges += '<span class="empty-output-badge">Empty Output</span>';
            }
            
            // Determine content and styling
            let content;
            let itemClasses = "result-item";
            
            if (hasError) {
                content = `<pre class="error">${r.error}</pre>`;
                itemClasses += " has-error";
            } else if (hasEmptyOutput) {
                content = `<pre class="empty">(Empty response from ${r.provider})</pre>`;
                itemClasses += " has-empty-output";
            } else {
                content = `<pre>${r.output.toString()}</pre>`;
            }
            
            return `
      <div class="${itemClasses}" data-result-index="${index}">
        <div class="result-header"><h4>${title}${badges}</h4></div>
        <div class="result-body">
          <div class="result-section">
            <div class="result-label">Input</div>
            <pre>${input}</pre>
          </div>
          <div class="result-section">
            <div class="result-label">Output</div>
            ${content}
          </div>
        </div>
      </div>
    `;
        }).join("");

        // Clear any existing search
        document.getElementById("results-search-input").value = "";

        // Precompute flattened results for table/aggregations
        try {
            this.flattenedResults = this.flattenResults(this.results);
        } catch (e) {
            console.error("Failed to flatten results:", e);
            this.flattenedResults = [];
        }
        if (this.resultsView === "table") this.renderResultsTable();
        if (this.resultsView === "aggregations") this.renderAggregations();

    }

    /**
     * Switch Results view
     */
    switchResultsView (view) {
        this.resultsView = view;
        const listContainerEl = document.getElementById("results-list-container");
        const listEmptyEl = document.getElementById("results-list-empty");
        const tableEl = document.getElementById("results-table");
        const aggsEl = document.getElementById("results-aggregations");
        const hide = (el) => el.classList.add("hidden");
        const show = (el) => el.classList.remove("hidden");
        
        // Hide all views first
        hide(listContainerEl);
        hide(listEmptyEl);
        hide(tableEl);
        hide(aggsEl);
        
        if (view === "list") {
            if (this.results && this.results.length > 0) {
                show(listContainerEl);
            } else {
                show(listEmptyEl);
            }
        }
        if (view === "table") { 
            show(tableEl); 
            this.renderResultsTable(); 
        }
        if (view === "aggregations") { 
            show(aggsEl); 
            this.renderAggregations(); 
        }
    }

    /**
     * Try parse result.output as JSON. Returns parsed value or original string.
     * Handles mixed content by extracting JSON objects from text.
     */
    parseResultOutput (output) {
        if (output == null) return null;
        if (typeof output === "object") return output;
        if (typeof output === "string") {
            const trimmed = output.trim();
            // First try exact JSON match
            if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
                try { return JSON.parse(trimmed); } catch (_) { /* fall through to extraction */ }
            }
            // Extract JSON objects from mixed content
            const jsonMatches = this.extractJSONFromText(trimmed);
            if (jsonMatches.length > 0) {
                // If multiple JSON objects, merge them (last one wins for conflicts)
                const merged = {};
                jsonMatches.forEach(obj => {
                    if (typeof obj === "object" && obj !== null) {
                        Object.assign(merged, obj);
                    }
                });
                return Object.keys(merged).length > 0 ? merged : output;
            }
        }
        return output;
    }

    /**
     * Extract JSON objects from text that may contain mixed content.
     */
    extractJSONFromText (text) {
        const results = [];
        // Match JSON objects: { ... }
        const objectRegex = /\{[\s\S]*?\}/g;
        let match;
        while ((match = objectRegex.exec(text)) !== null) {
            try {
                const parsed = JSON.parse(match[0]);
                results.push(parsed);
            } catch (_) {
                // Skip invalid JSON
            }
        }
        // Match JSON arrays: [ ... ]
        const arrayRegex = /\[[\s\S]*?\]/g;
        while ((match = arrayRegex.exec(text)) !== null) {
            try {
                const parsed = JSON.parse(match[0]);
                results.push(parsed);
            } catch (_) {
                // Skip invalid JSON
            }
        }
        return results;
    }

    /**
     * Flatten results into uniform objects with union of fields; missing => null
     */
    flattenResults (results) {
        // Build rows from input + parsed output
        const rows = results.map(r => {
            const parsed = this.parseResultOutput(r.output);
            const row = { "_id": r.id, "_templateId": r.templateId, "_provider": r.provider };
            // include input fields (shallow)
            if (r.input && typeof r.input === "object") {
                Object.keys(r.input).forEach(k => { row[`input.${k}`] = r.input[k]; });
            }
            // include output fields (flattened)
            if (parsed && typeof parsed === "object") {
                const flat = this.flattenObject(parsed, "output");
                Object.assign(row, flat);
            } else {
                row["output"] = r.output;
            }
            return row;
        });
        // union of keys
        const keys = new Set();
        rows.forEach(row => Object.keys(row).forEach(k => keys.add(k)));
        const allKeys = Array.from(keys);
        // normalize missing fields as null
        const normalized = rows.map(row => {
            const copy = {};
            allKeys.forEach(k => { copy[k] = (k in row) ? row[k] : null; });
            return copy;
        });
        return { rows: normalized, keys: allKeys };
    }

    /**
     * Flatten nested object with prefix. Similar to shared utils but scoped here.
     */
    flattenObject (obj, basePrefix = "") {
        const out = {};
        const rec = (o, prefix) => {
            Object.keys(o).forEach(k => {
                const key = prefix ? `${prefix}.${k}` : k;
                const v = o[k];
                if (v && typeof v === "object" && !Array.isArray(v)) {
                    rec(v, key);
                } else {
                    out[key] = v;
                }
            });
        };
        rec(obj, basePrefix);
        return out;
    }

    /**
     * Render Results Table
     */
    renderResultsTable () {
        const container = document.getElementById("results-table");
        const thead = document.getElementById("results-table-headers");
        const tbody = document.getElementById("results-table-rows");
        if (!this.flattenedResults || !this.flattenedResults.rows || this.flattenedResults.rows.length === 0) {
            thead.innerHTML = "";
            tbody.innerHTML = `<tr><td colspan="1">No tabular data</td></tr>`;
            return;
        }
        const { keys, rows } = this.flattenedResults;
        
        // Create headers with resize handles
        thead.innerHTML = keys.map((k, index) => {
            const width = this.columnWidths.get(k) || 150;
            return `<th class="resizable" style="width: ${width}px; min-width: 100px;" data-column="${k}" data-index="${index}">
                <span class="column-title">${k}</span>
                <div class="resize-handle"></div>
            </th>`;
        }).join("");
        
        // Add resize event listeners
        this.setupColumnResize();
        
        // Show all rows (with performance consideration for very large datasets)
        if (rows.length > 1000) {
            // For very large datasets, show a warning but still display all rows
            console.warn(`Rendering large table with ${rows.length} rows. This may affect performance.`);
        }
        
        tbody.innerHTML = rows.map((r, rowIndex) => `<tr>${keys.map((k, colIndex) => `<td class="cell-content" data-row="${rowIndex}" data-column="${this.escapeHtml(k)}" data-column-index="${colIndex}">${this.formatCell(r[k], k)}</td>`).join("")}</tr>`).join("");
        
        // Add click event listeners to cells
        this.setupCellClickHandlers();
    }

    formatCell (value, columnKey = "") {
        if (value === null || value === undefined) return '<span style="color: var(--text-muted); font-style: italic;">NULL</span>';
        if (typeof value === "object") return `<pre>${this.safeStringify(value)}</pre>`;
        
        // Check for empty output columns
        if (columnKey === "output" && (!value || value.toString().trim() === "")) {
            return '<span style="color: var(--accent-warning); font-style: italic;">(Empty)</span>';
        }
        
        return String(value);
    }

    safeStringify (v) {
        try { return JSON.stringify(v, null, 2); } catch (_) { return String(v); }
    }

    /**
     * Compute and render aggregations
     */
    renderAggregations () {
        const numericEl = document.getElementById("agg-numeric");
        const categoricalEl = document.getElementById("agg-categorical");
        numericEl.innerHTML = "";
        categoricalEl.innerHTML = "";
        if (!this.flattenedResults || !this.flattenedResults.rows || this.flattenedResults.rows.length === 0) {
            numericEl.textContent = "No data";
            categoricalEl.textContent = "No data";
            return;
        }
        const { keys, rows } = this.flattenedResults;
        
        // Filter out internal columns
        const filteredKeys = keys.filter(k => k !== '_id' && k !== '_templateId');
        
        // Determine column types (numeric if all non-null values are numbers)
        const numericKeys = [];
        const categoricalKeys = [];
        filteredKeys.forEach(k => {
            const nonNull = rows.map(r => r[k]).filter(v => v !== null && v !== undefined);
            if (nonNull.length === 0) return; // skip all-null columns
            const allNumbers = nonNull.every(v => typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))));
            if (allNumbers) numericKeys.push(k);
            else categoricalKeys.push(k);
        });

        // Numeric stats with histograms
        const numHtml = numericKeys.map(k => {
            const values = rows.map(r => r[k]).filter(v => v !== null && v !== undefined).map(v => typeof v === "number" ? v : Number((v||"").toString().trim())).filter(v => !isNaN(v));
            if (values.length === 0) return "";
            const sum = values.reduce((a,b) => a+b, 0);
            const avg = sum / values.length;
            const sorted = [...values].sort((a,b)=>a-b);
            const mid = Math.floor(sorted.length/2);
            const median = sorted.length % 2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
            const min = sorted[0];
            const max = sorted[sorted.length-1];
            
            // Create histogram
            const uniqueValues = new Set(values);
            const histogram = this.createHistogram(values, uniqueValues.size);
            
            return `
            <div class="agg-numeric-col">
                <div class="agg-col-title"><strong>${k}</strong>: count=${values.length}, sum=${this.round(sum)}, avg=${this.round(avg)}, median=${this.round(median)}, min=${this.round(min)}, max=${this.round(max)}</div>
                ${histogram}
            </div>`;
        }).join("");
        numericEl.innerHTML = numHtml || "No numeric columns";

        // Categorical distributions with sqrt(n) threshold for text outputs
        const totalSamples = rows.length;
        const sqrtThreshold = Math.ceil(Math.sqrt(totalSamples));
        const catHtml = categoricalKeys.map(k => {
            const values = rows.map(r => r[k]).filter(v => v !== null && v !== undefined);
            if (values.length === 0) return "";
            const freq = new Map();
            values.forEach(v => {
                const key = typeof v === "string" ? v : JSON.stringify(v);
                freq.set(key, (freq.get(key) || 0) + 1);
            });
            const numClasses = freq.size;
            
            // Skip if too many unique values (sqrt threshold)
            if (numClasses >= sqrtThreshold) {
                return `<div class="agg-col"><div class="agg-col-title"><strong>${k}</strong> (n=${values.length})</div><div class="agg-note">Skipped aggregation: ${numClasses} classes (>= sqrt(${totalSamples}) = ${sqrtThreshold})</div></div>`;
            }
            
            const total = values.length;
            const entries = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
            const rowsHtml = entries.map(([val, count]) => {
                const pct = total > 0 ? (100 * count / total) : 0;
                return `
                <div class="agg-cat-item" style="display:flex; align-items:center; gap:8px; margin:4px 0;">
                  <div class="agg-cat-label" style="min-width: 220px; font-size: 12px; text-align:left;">${this.escapeHtml(val)}</div>
                  <div class="agg-cat-count" style="min-width: 100px; font-size: 12px; text-align:right;">${count} (${this.round(pct)}%)</div>
                </div>`;
            }).join("");
            return `<div class="agg-col"><div class="agg-col-title"><strong>${k}</strong> (n=${total}, classes=${numClasses})</div>${rowsHtml}</div>`;
        }).join("");
        categoricalEl.innerHTML = catHtml || "No categorical columns";
    }

    /**
     * Show histograms for categorical data
     */
    showCategoricalHistograms() {
        if (!this.flattenedResults || !this.flattenedResults.rows || this.flattenedResults.rows.length === 0) {
            this.showNotification("No data available", "warning");
            return;
        }

        const { keys, rows } = this.flattenedResults;
        
        // Filter out internal columns
        const filteredKeys = keys.filter(k => k !== '_id' && k !== '_templateId');
        
        const categoricalKeys = [];
        
        // Determine categorical columns
        filteredKeys.forEach(k => {
            const nonNull = rows.map(r => r[k]).filter(v => v !== null && v !== undefined);
            if (nonNull.length === 0) return;
            const allNumbers = nonNull.every(v => typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))));
            if (!allNumbers) categoricalKeys.push(k);
        });

        if (categoricalKeys.length === 0) {
            this.showNotification("No categorical columns found", "info");
            return;
        }

        // Re-render categorical section with histograms
        this.renderCategoricalWithHistograms(categoricalKeys);
    }

    /**
     * Render categorical data with histograms
     */
    renderCategoricalWithHistograms(categoricalKeys) {
        const categoricalEl = document.getElementById("agg-categorical");
        const { rows } = this.flattenedResults;
        
        const totalSamples = rows.length;
        const sqrtThreshold = Math.ceil(Math.sqrt(totalSamples));
        const catHtml = categoricalKeys.map(k => {
            const values = rows.map(r => r[k]).filter(v => v !== null && v !== undefined);
            if (values.length === 0) return "";
            const freq = new Map();
            values.forEach(v => {
                const key = typeof v === "string" ? v : JSON.stringify(v);
                freq.set(key, (freq.get(key) || 0) + 1);
            });
            const numClasses = freq.size;
            
            // Skip if too many unique values (sqrt threshold)
            if (numClasses >= sqrtThreshold) {
                return `<div class="agg-col"><div class="agg-col-title"><strong>${k}</strong> (n=${values.length})</div><div class="agg-note">Skipped aggregation: ${numClasses} classes (>= sqrt(${totalSamples}) = ${sqrtThreshold})</div></div>`;
            }
            
            const total = values.length;
            const entries = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
            const maxCount = entries.length > 0 ? entries[0][1] : 1;
            const rowsHtml = entries.map(([val, count]) => {
                const pct = total > 0 ? (100 * count / total) : 0;
                const barWidth = maxCount > 0 ? Math.max(2, Math.round(100 * count / maxCount)) : 2;
                return `
                <div class="agg-cat-item" style="display:flex; align-items:center; gap:8px; margin:4px 0;">
                  <div class="agg-cat-bar" style="flex:1; background:var(--bg-muted,#e0e0e0); height:12px; position:relative; border-radius:4px; overflow:hidden;">
                    <div style="width:${barWidth}%; height:100%; background:var(--accent-color,#4a90e2);"></div>
                  </div>
                  <div class="agg-cat-label" style="min-width: 220px; font-size: 12px; text-align:left;">${this.escapeHtml(val)}</div>
                  <div class="agg-cat-count" style="min-width: 100px; font-size: 12px; text-align:right;">${count} (${this.round(pct)}%)</div>
                </div>`;
            }).join("");
            return `<div class="agg-col"><div class="agg-col-title"><strong>${k}</strong> (n=${total}, classes=${numClasses})</div>${rowsHtml}</div>`;
        }).join("");
        categoricalEl.innerHTML = catHtml || "No categorical columns";
    }

    /**
     * Show save results modal
     */
    showSaveResultsModal() {
        if (this.results.length === 0) {
            this.showNotification("No results to save", "warning");
            return;
        }

        const modal = document.getElementById("save-results-modal");
        const nameInput = document.getElementById("save-results-name");
        const descriptionInput = document.getElementById("save-results-description");

        // Generate default name with template, input file, provider, and model
        const template = this.templates.find(t => t.id === this.results[0]?.templateId);
        const templateName = template?.name || "Unknown Template";
        
        // Get input file name
        let inputFileName = "Manual Input";
        if (this.currentDataFile) {
            const pathParts = this.currentDataFile.split('/');
            inputFileName = pathParts[pathParts.length - 1] || "Unknown File";
        }
        
        // Get provider and model
        const provider = this.results[0]?.provider || "Unknown Provider";
        const model = this.results[0]?.model || "Unknown Model";
        
        const defaultName = `${templateName} - ${inputFileName} - ${provider} (${model})`;
        nameInput.value = defaultName;
        descriptionInput.value = "";

        modal.classList.remove("hidden");
        nameInput.focus();
    }

    /**
     * Hide save results modal
     */
    hideSaveResultsModal() {
        const modal = document.getElementById("save-results-modal");
        modal.classList.add("hidden");
    }

    /**
     * Save results with metadata
     */
    async saveResults() {
        const nameInput = document.getElementById("save-results-name");
        const descriptionInput = document.getElementById("save-results-description");

        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!name) {
            this.showNotification("Please enter a name for the result set", "error");
            return;
        }

        try {
            // Get metadata from current results
            const template = this.templates.find(t => t.id === this.results[0]?.templateId);
            const metadata = {
                name: name,
                description: description,
                templateId: template?.id,
                templateName: template?.name,
                provider: this.results[0]?.provider,
                model: this.results[0]?.model
            };

            const result = await window.electronAPI.saveResults(this.results, metadata);

            if (result.success) {
                this.showNotification("Results saved successfully", "success");
                this.hideSaveResultsModal();
            } else {
                this.showNotification("Failed to save results", "error");
            }
        } catch (error) {
            console.error("Error saving results:", error);
            this.showNotification("Error saving results", "error");
        }
    }

    /**
     * Show load results modal
     */
    async showLoadResultsModal() {
        const modal = document.getElementById("load-results-modal");
        modal.classList.remove("hidden");
        
        await this.loadSavedResultsList();
    }

    /**
     * Hide load results modal
     */
    hideLoadResultsModal() {
        const modal = document.getElementById("load-results-modal");
        modal.classList.add("hidden");
    }

    /**
     * Load saved results list
     */
    async loadSavedResultsList() {
        try {
            const result = await window.electronAPI.loadResults();
            
            if (result.success) {
                this.renderSavedResultsList(result.resultSets);
            } else {
                this.showNotification("Failed to load saved results", "error");
            }
        } catch (error) {
            console.error("Error loading saved results:", error);
            this.showNotification("Error loading saved results", "error");
        }
    }

    /**
     * Render saved results list
     */
    renderSavedResultsList(resultSets) {
        const listContainer = document.getElementById("saved-results-list");
        
        if (resultSets.length === 0) {
            listContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">No saved results found</div>';
            return;
        }

        const html = resultSets.map(resultSet => {
            const date = new Date(resultSet.timestamp).toLocaleString();
            return `
            <div class="saved-result-item" data-id="${resultSet.id}">
                <div class="saved-result-header">
                    <div>
                        <div class="saved-result-name">${this.escapeHtml(resultSet.name)}</div>
                        <div class="saved-result-meta">
                            <span>${resultSet.sampleCount} samples</span>
                            <span>${resultSet.templateName || 'Unknown template'}</span>
                            <span>${resultSet.provider || 'Unknown provider'} (${resultSet.model || 'Unknown model'})</span>
                            <span>${date}</span>
                        </div>
                    </div>
                </div>
                ${resultSet.description ? `<div class="saved-result-description">${this.escapeHtml(resultSet.description)}</div>` : ''}
                <div class="saved-result-actions">
                    <button class="btn btn-primary btn-sm" onclick="app.loadResultSet('${resultSet.id}')">Load</button>
                    <button class="btn btn-text btn-sm" onclick="app.deleteResultSet('${resultSet.id}')">Delete</button>
                </div>
            </div>`;
        }).join("");

        listContainer.innerHTML = html;
    }

    /**
     * Filter saved results
     */
    async filterSavedResults(searchTerm) {
        try {
            const result = await window.electronAPI.loadResults({ search: searchTerm });
            
            if (result.success) {
                this.renderSavedResultsList(result.resultSets);
            }
        } catch (error) {
            console.error("Error filtering saved results:", error);
        }
    }

    /**
     * Load a specific result set
     */
    async loadResultSet(resultSetId) {
        try {
            const result = await window.electronAPI.loadResultSet(resultSetId);
            
            if (result.success) {
                this.results = result.results;
                this.renderResults();
                this.hideLoadResultsModal();
                this.showNotification("Results loaded successfully", "success");
            } else {
                this.showNotification("Failed to load result set", "error");
            }
        } catch (error) {
            console.error("Error loading result set:", error);
            this.showNotification("Error loading result set", "error");
        }
    }

    /**
     * Delete a result set
     */
    async deleteResultSet(resultSetId) {
        if (!confirm("Are you sure you want to delete this result set?")) {
            return;
        }

        try {
            const result = await window.electronAPI.deleteResultSet(resultSetId);
            
            if (result.success) {
                this.showNotification("Result set deleted successfully", "success");
                await this.loadSavedResultsList();
            } else {
                this.showNotification("Failed to delete result set", "error");
            }
        } catch (error) {
            console.error("Error deleting result set:", error);
            this.showNotification("Error deleting result set", "error");
        }
    }

    /**
     * Create histogram for numerical data
     */
    createHistogram (values, uniqueCount) {
        const maxBuckets = 20;
        const minBuckets = 5;
        
        if (uniqueCount <= 50) {
            // Show all unique values as discrete histogram
            const freq = new Map();
            values.forEach(v => freq.set(v, (freq.get(v) || 0) + 1));
            const entries = Array.from(freq.entries()).sort((a, b) => a[0] - b[0]);
            const maxFreq = Math.max(...entries.map(([_, count]) => count));
            
            const bars = entries.map(([val, count]) => {
                const height = maxFreq > 0 ? Math.max(2, Math.round(100 * count / maxFreq)) : 2;
                return `
                <div class="histogram-bar" style="display:flex; align-items:flex-end; gap:4px; margin:2px 0;">
                    <div style="width:${height}%; height:20px; background:var(--accent-color,#4a90e2); border-radius:2px; min-width:4px;"></div>
                    <div style="font-size:10px; color:var(--text-muted); min-width:40px;">${this.round(val)}</div>
                    <div style="font-size:10px; color:var(--text-muted); min-width:30px;">${count}</div>
                </div>`;
            }).join("");
            
            return `<div class="histogram-discrete" style="margin-top:8px; padding:8px; background:var(--bg-muted,#f5f5f5); border-radius:4px;">${bars}</div>`;
        } else {
            // Create buckets for continuous data
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            
            // Determine number of buckets (aim for 10-20 buckets)
            let numBuckets = Math.min(maxBuckets, Math.max(minBuckets, Math.ceil(Math.sqrt(uniqueCount))));
            if (range === 0) numBuckets = 1;
            
            const bucketSize = range / numBuckets;
            const buckets = new Array(numBuckets).fill(0);
            
            values.forEach(v => {
                if (range === 0) {
                    buckets[0]++;
                } else {
                    const bucketIndex = Math.min(Math.floor((v - min) / bucketSize), numBuckets - 1);
                    buckets[bucketIndex]++;
                }
            });
            
            const maxBucket = Math.max(...buckets);
            const bars = buckets.map((count, i) => {
                const height = maxBucket > 0 ? Math.max(2, Math.round(100 * count / maxBucket)) : 2;
                const bucketStart = min + i * bucketSize;
                const bucketEnd = min + (i + 1) * bucketSize;
                const label = range === 0 ? `${this.round(min)}` : `${this.round(bucketStart)}-${this.round(bucketEnd)}`;
                
                return `
                <div class="histogram-bar" style="display:flex; align-items:flex-end; gap:4px; margin:2px 0;">
                    <div style="width:${height}%; height:20px; background:var(--accent-color,#4a90e2); border-radius:2px; min-width:4px;"></div>
                    <div style="font-size:10px; color:var(--text-muted); min-width:80px;">${label}</div>
                    <div style="font-size:10px; color:var(--text-muted); min-width:30px;">${count}</div>
                </div>`;
            }).join("");
            
            return `<div class="histogram-continuous" style="margin-top:8px; padding:8px; background:var(--bg-muted,#f5f5f5); border-radius:4px;">${bars}</div>`;
        }
    }

    round (v, decimals = 3) { 
        const factor = Math.pow(10, decimals);
        return Math.round(v * factor) / factor; 
    }
    
    escapeHtml (s) { return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }

    /**
     * Calculate diversity index (Gini-Simpson diversity index)
     */
    calculateDiversityIndex(frequencies, total) {
        if (total === 0) return 0;
        
        let sumSquared = 0;
        frequencies.forEach(freq => {
            const proportion = freq / total;
            sumSquared += proportion * proportion;
        });
        
        // Simpson's diversity index (1 - sum of squared proportions)
        return 1 - sumSquared;
    }

    /**
     * Calculate Jaccard similarity coefficient
     */
    calculateJaccardSimilarity(freqA, freqB) {
        const keysA = new Set(Object.keys(freqA));
        const keysB = new Set(Object.keys(freqB));
        
        // Intersection: values present in both sets
        const intersection = new Set([...keysA].filter(x => keysB.has(x)));
        
        // Union: all unique values across both sets
        const union = new Set([...keysA, ...keysB]);
        
        if (union.size === 0) return 0;
        
        return intersection.size / union.size;
    }

    /**
     * Analyze text length statistics for long text columns
     */
    analyzeTextLengths(valuesA, valuesB) {
        const getTextStats = (values) => {
            // Convert all values to strings for analysis (including numbers, etc.)
            const stringValues = values
                .filter(val => val !== null && val !== undefined)
                .map(val => typeof val === 'string' ? val : String(val))
                .filter(str => str.length > 0); // Remove empty strings
                
            if (stringValues.length === 0) return null;
            
            const lengths = stringValues.map(str => str.length);
            lengths.sort((a, b) => a - b);
            
            const sum = lengths.reduce((a, b) => a + b, 0);
            const mean = sum / lengths.length;
            const median = lengths.length % 2 === 0 
                ? (lengths[lengths.length / 2 - 1] + lengths[lengths.length / 2]) / 2
                : lengths[Math.floor(lengths.length / 2)];
            
            // Calculate standard deviation
            const variance = lengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / lengths.length;
            const stdDev = Math.sqrt(variance);
            
            return {
                count: stringValues.length,
                min: Math.min(...lengths),
                max: Math.max(...lengths),
                mean: this.round(mean, 1),
                median: this.round(median, 1),
                stdDev: this.round(stdDev, 1),
                totalChars: sum
            };
        };
        
        const statsA = getTextStats(valuesA);
        const statsB = getTextStats(valuesB);
        
        // Return analysis even if only one set has text data
        if (!statsA && !statsB) {
            return null;
        }
        
        // Handle cases where only one set has text data
        if (!statsA || !statsB) {
            return {
                setA: statsA || { count: 0, min: 0, max: 0, mean: 0, median: 0, stdDev: 0, totalChars: 0 },
                setB: statsB || { count: 0, min: 0, max: 0, mean: 0, median: 0, stdDev: 0, totalChars: 0 },
                comparison: {
                    meanDifference: statsA && statsB ? this.round(statsA.mean - statsB.mean, 1) : null,
                    medianDifference: statsA && statsB ? this.round(statsA.median - statsB.median, 1) : null,
                    meanPercentChange: null
                },
                tTest: null
            };
        }
        
        // Perform t-test on text lengths if we have enough data
        let tTest = null;
        if (statsA.count >= 3 && statsB.count >= 3) {
            const lengthsA = valuesA
                .filter(val => val !== null && val !== undefined)
                .map(val => typeof val === 'string' ? val : String(val))
                .filter(str => str.length > 0)
                .map(str => str.length);
            const lengthsB = valuesB
                .filter(val => val !== null && val !== undefined)
                .map(val => typeof val === 'string' ? val : String(val))
                .filter(str => str.length > 0)
                .map(str => str.length);
            tTest = this.performTTest(lengthsA, lengthsB);
        }
        
        return {
            setA: statsA,
            setB: statsB,
            comparison: {
                meanDifference: this.round(statsA.mean - statsB.mean, 1),
                medianDifference: this.round(statsA.median - statsB.median, 1),
                meanPercentChange: statsB.mean !== 0 ? this.round(((statsA.mean - statsB.mean) / statsB.mean) * 100, 1) : null
            },
            tTest: tTest
        };
    }

    /**
     * Show cell content in modal overlay
     */
    showCellContent(rowIndex, columnKey, columnIndex) {
        if (!this.flattenedResults || !this.flattenedResults.rows) {
            console.error("No flattened results available");
            return;
        }

        const row = this.flattenedResults.rows[rowIndex];
        if (!row) {
            console.error("Row not found:", rowIndex);
            return;
        }

        const value = row[columnKey];
        const modal = document.getElementById("cell-content-modal");
        
        // Set modal title and metadata
        document.getElementById("cell-content-title").textContent = `Cell Content - ${columnKey}`;
        document.getElementById("cell-column-name").textContent = `Column: ${columnKey}`;
        document.getElementById("cell-row-number").textContent = `Row: ${rowIndex + 1}`;
        
        // Determine content type and format
        let contentType, formattedContent, contentClass;
        
        if (value === null || value === undefined) {
            contentType = "null";
            formattedContent = "(NULL)";
            contentClass = "empty-content";
        } else if (typeof value === "object") {
            contentType = "json";
            formattedContent = this.safeStringify(value);
            contentClass = "json-content";
        } else if (typeof value === "string" && value.trim() === "") {
            contentType = "empty";
            formattedContent = "(Empty string)";
            contentClass = "empty-content";
        } else {
            const stringValue = value.toString();
            
            // Try to detect if it's JSON
            if (stringValue.trim().startsWith('{') || stringValue.trim().startsWith('[')) {
                try {
                    const parsed = JSON.parse(stringValue);
                    contentType = "json";
                    formattedContent = JSON.stringify(parsed, null, 2);
                    contentClass = "json-content";
                } catch (e) {
                    contentType = "text";
                    formattedContent = stringValue;
                    contentClass = "text-content";
                }
            } else {
                contentType = "text";
                formattedContent = stringValue;
                contentClass = "text-content";
            }
        }
        
        // Set content metadata
        document.getElementById("cell-content-type").textContent = `Type: ${contentType}`;
        document.getElementById("cell-content-length").textContent = `Length: ${formattedContent.length} chars`;
        
        // Set content
        const contentElement = document.getElementById("cell-content-text");
        contentElement.textContent = formattedContent;
        contentElement.className = contentClass;
        
        // Store content for copying
        this.currentCellContent = formattedContent;
        
        // Show modal
        modal.classList.remove("hidden");
    }

    /**
     * Hide cell content modal
     */
    hideCellContentModal() {
        const modal = document.getElementById("cell-content-modal");
        modal.classList.add("hidden");
        this.currentCellContent = null;
    }

    /**
     * Copy cell content to clipboard
     */
    async copyCellContent() {
        if (!this.currentCellContent) {
            this.showNotification("No content to copy", "warning");
            return;
        }

        try {
            await navigator.clipboard.writeText(this.currentCellContent);
            this.showNotification("Content copied to clipboard", "success");
        } catch (error) {
            console.error("Failed to copy content:", error);
            
            // Fallback for browsers that don't support clipboard API
            try {
                const textArea = document.createElement("textarea");
                textArea.value = this.currentCellContent;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification("Content copied to clipboard", "success");
            } catch (fallbackError) {
                this.showNotification("Failed to copy content", "error");
            }
        }
    }

    /**
     * Setup cell click handlers for the table
     */
    setupCellClickHandlers() {
        const cells = document.querySelectorAll("#results-table .cell-content");
        cells.forEach(cell => {
            cell.addEventListener("click", (e) => {
                const rowIndex = parseInt(cell.dataset.row);
                const columnKey = cell.dataset.column;
                const columnIndex = parseInt(cell.dataset.columnIndex);
                this.showCellContent(rowIndex, columnKey, columnIndex);
            });
        });
    }

    /**
     * Setup column resizing functionality
     */
    setupColumnResize() {
        const table = document.querySelector("#results-table table");
        if (!table) return;

        const headers = table.querySelectorAll("th.resizable");
        headers.forEach((header) => {
            const resizeHandle = header.querySelector(".resize-handle");
            if (!resizeHandle) return;

            let startX = 0;
            let startWidth = 0;
            let isResizing = false;

            const startResize = (e) => {
                isResizing = true;
                this.isResizing = true;
                startX = e.clientX;
                startWidth = parseInt(window.getComputedStyle(header).width, 10);
                document.addEventListener("mousemove", doResize);
                document.addEventListener("mouseup", stopResize);
                e.preventDefault();
            };

            const doResize = (e) => {
                if (!isResizing) return;
                const diff = e.clientX - startX;
                const newWidth = Math.max(100, startWidth + diff);
                header.style.width = newWidth + "px";
                
                // Update column width in memory
                const columnName = header.dataset.column;
                if (columnName) {
                    this.columnWidths.set(columnName, newWidth);
                }

                // Update corresponding table cells
                const columnIndex = parseInt(header.dataset.index, 10);
                const rows = table.querySelectorAll("tbody tr");
                rows.forEach(row => {
                    const cell = row.cells[columnIndex];
                    if (cell) {
                        cell.style.width = newWidth + "px";
                    }
                });
            };

            const stopResize = () => {
                isResizing = false;
                this.isResizing = false;
                document.removeEventListener("mousemove", doResize);
                document.removeEventListener("mouseup", stopResize);
            };

            resizeHandle.addEventListener("mousedown", startResize);
        });
    }

    /**
     * Filter results based on search term
     */
    filterResults(searchTerm) {
        if (!this.results || this.results.length === 0) return;

        const resultItems = document.querySelectorAll(".result-item");
        const term = searchTerm.toLowerCase().trim();

        // Build template name lookup
        const templateNameById = {};
        this.templates.forEach(t => { templateNameById[t.id] = t.name; });

        resultItems.forEach((item, index) => {
            const result = this.results[index];
            if (!result) return;

            let shouldShow = true;

            if (term) {
                // Search in template name
                const templateName = (templateNameById[result.templateId] || "").toLowerCase();
                
                // Search in provider
                const provider = (result.provider || "").toLowerCase();
                
                // Search in input
                const input = JSON.stringify(result.input || {}).toLowerCase();
                
                // Search in output
                const output = (result.output || "").toString().toLowerCase();
                
                // Search in error
                const error = (result.error || "").toLowerCase();

                shouldShow = templateName.includes(term) || 
                           provider.includes(term) || 
                           input.includes(term) || 
                           output.includes(term) || 
                           error.includes(term);
            }

            if (shouldShow) {
                item.classList.remove("hidden");
            } else {
                item.classList.add("hidden");
            }
        });

        // Update search status
        const visibleItems = document.querySelectorAll(".result-item:not(.hidden)").length;
        const totalItems = resultItems.length;
        
        if (term && visibleItems < totalItems) {
            console.log(`Search filtered: showing ${visibleItems} of ${totalItems} results`);
        }
    }

    /**
     * Update execution UI state
     */
    updateExecutionUI (isExecuting) {

        const startBtn = document.getElementById("start-execution-btn"),
            stopBtn = document.getElementById("stop-execution-btn"),
            progress = document.getElementById("execution-progress");

        startBtn.disabled = isExecuting;
        stopBtn.disabled = !isExecuting;

        if (isExecuting) {

            progress.classList.remove("hidden");

        } else {

            progress.classList.add("hidden");

        }

    }

    /**
     * Update execution progress
     */
    updateExecutionProgress (progress) {

        const progressText = document.getElementById("progress-text"),
            progressFill = document.getElementById("progress-fill"),
            currentItem = document.getElementById("current-item");

        progressText.textContent = `${progress.current} / ${progress.total} (${Math.round(progress.percentage)}%)`;
        progressFill.style.width = `${progress.percentage}%`;
        currentItem.textContent = `Processing item ${progress.current} of ${progress.total}`;

    }

    /**
     * Update provider status
     */
    updateProviderStatus (provider, status) {

        const statusElement = document.getElementById(`${provider}-status`),
            indicator = statusElement.querySelector(".status-indicator"),
            text = statusElement.querySelector(".status-text");

        indicator.className = `status-indicator ${status}`;

        switch (status) {

        case "online":
            text.textContent = "Online";
            break;
        case "offline":
            text.textContent = "Offline";
            break;
        case "configuring":
            text.textContent = "Configured";
            break;
        default:
            text.textContent = "Unknown";

        }

    }

    /**
     * Update template selects
     */
    updateTemplateSelects () {

        const selects = [
            document.getElementById("execution-template"),
            document.getElementById("results-template-filter")
        ];

        selects.forEach(select => {

            const currentValue = select.value;

            select.innerHTML = "<option value=\"\">Select template...</option>";

            this.templates.forEach(template => {

                const option = document.createElement("option");

                option.value = template.id;
                option.textContent = template.name;
                select.appendChild(option);

            });

            if (currentValue) {

                select.value = currentValue;

            }

        });

    }

    /**
     * Show notification
     */
    showNotification (message, type = "info") {

        const notification = document.createElement("div");

        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {

            notification.remove();

        }, 3000);

    }

    /**
     * Update status message
     */
    updateStatus (message) {

        const statusElement = document.getElementById("status-message");

        statusElement.textContent = message;

    }

    /**
     * Export results
     */
    async exportResults () {

        if (this.results.length === 0) {

            this.showNotification("No results to export", "warning");

            return;

        }

        try {

            const result = await window.electronAPI.exportResults(this.results, "json");

            if (result.success) {

                this.showNotification("Results exported successfully", "success");

            } else {

                this.showNotification("Failed to export results", "error");

            }

        } catch (error) {

            this.showNotification("Error exporting results", "error");
            console.error("Export error:", error);

        }

    }

    /**
     * Edit template
     */
    editTemplate (templateId) {

        const template = this.templates.find(t => t.id === templateId);

        if (!template) {

            this.showNotification("Template not found", "error");

            return;

        }

        // Populate the editor with template data
        const nameInput = document.getElementById("template-name");
        nameInput.value = template.name;
        nameInput.dataset.templateId = template.id;
        nameInput.dataset.originalName = template.name; // Store original name for comparison
        document.getElementById("system-prompt").value = template.systemPrompt || "";
        document.getElementById("user-prompt").value = template.userPrompt;

        // Update variables display
        this.updateTemplateVariables();

        // Switch to templates tab
        this.switchTab("templates");

    }

    /**
     * Delete template
     */
    async deleteTemplate (templateId) {

        if (!confirm("Are you sure you want to delete this template?")) {

            return;

        }

        try {

            const result = await window.electronAPI.deleteTemplate(templateId);

            if (result.success) {

                this.showNotification("Template deleted", "success");
                this.loadTemplates();

            } else {

                this.showNotification("Failed to delete template", "error");

            }

        } catch (error) {

            this.showNotification("Error deleting template", "error");
            console.error("Delete template error:", error);

        }

    }

    /**
     * Clear results
     */
    clearResults () {

        this.results = [];
        this.flattenedResults = [];
        this.columnWidths.clear();
        
        // Hide search container and show empty state
        document.getElementById("results-list-container").classList.add("hidden");
        document.getElementById("results-list-empty").classList.remove("hidden");
        
        // Clear search input
        document.getElementById("results-search-input").value = "";
        
        // Clear other views
        document.getElementById("results-table").classList.add("hidden");
        document.getElementById("results-aggregations").classList.add("hidden");
        
        this.updateStatus("Results cleared");

    }

    /**
     * Handle execution complete
     */
    handleExecutionComplete (results) {

        this.results = results;
        this.showNotification("Execution completed", "success");
        this.updateStatus(`Execution completed: ${results.length} results`);
        this.switchTab("results");

    }

    /**
     * Handle execution error
     */
    handleExecutionError (error) {

        this.showNotification(`Execution error: ${error.message}`, "error");
        this.updateStatus("Execution error");

    }

    /**
     * Check if a column contains long text strings that should not be compared categorically
     */
    isLongTextColumn(values) {
        if (!Array.isArray(values) || values.length === 0) return false;
        
        const stringValues = values.filter(val => typeof val === 'string' && val !== null && val !== undefined);
        if (stringValues.length === 0) return false;
        
        // Calculate average length of string values
        const totalLength = stringValues.reduce((sum, str) => sum + str.length, 0);
        const averageLength = totalLength / stringValues.length;
        
        // More conservative detection - need both conditions to be true for long text
        // 1. Average length > 150 characters (raised from 100)
        // 2. AND either: most texts are long OR we have very long outliers
        const hasVeryLongText = stringValues.some(str => str.length > 500); // raised from 300
        const mostTextsAreLong = stringValues.filter(str => str.length > 100).length >= (stringValues.length * 0.7);
        
        const isLongText = averageLength > 150 && (hasVeryLongText || mostTextsAreLong);
        
        console.log(`Long text detection for column: avgLen=${averageLength.toFixed(1)}, hasVeryLong=${hasVeryLongText}, mostLong=${mostTextsAreLong}, result=${isLongText}`);
        
        return isLongText;
    }

    /**
     * Check if a column contains numerical values
     */
    isNumericalColumn(values) {
        if (!Array.isArray(values) || values.length === 0) return false;
        
        // Check if at least 80% of values are numbers AND have meaningful numerical relationships
        const numericCount = values.filter(val => {
            if (val === null || val === undefined) return false;
            if (typeof val === 'number') {
                // If it's an integer with small values (like 1-5 rating scale), might be categorical
                if (Number.isInteger(val) && val >= 1 && val <= 10) {
                    return false; // Treat small integer ranges as categorical
                }
                return true;
            }
            if (typeof val === 'string') {
                const trimmed = val.trim();
                if (trimmed === '') return false;
                const parsed = parseFloat(trimmed);
                if (!isNaN(parsed) && isFinite(parsed)) {
                    // Same check for string numbers
                    if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 10) {
                        return false; // Treat small integer ranges as categorical
                    }
                    return true;
                }
            }
            return false;
        }).length;
        
        return (numericCount / values.length) >= 0.8;
    }

    /**
     * Show compare results modal
     */
    async showCompareResultsModal() {
        const modal = document.getElementById("compare-results-modal");
        modal.classList.remove("hidden");
        
        await this.loadSavedResultsForComparison();
    }

    /**
     * Hide compare results modal
     */
    hideCompareResultsModal() {
        const modal = document.getElementById("compare-results-modal");
        modal.classList.add("hidden");
        
        // Reset comparison results
        document.getElementById("comparison-results").classList.add("hidden");
        document.getElementById("compare-result-a").value = "";
        document.getElementById("compare-result-b").value = "";
    }

    /**
     * Load saved results for comparison dropdowns
     */
    async loadSavedResultsForComparison() {
        try {
            const result = await window.electronAPI.loadResults();
            
            if (result.success) {
                const selectA = document.getElementById("compare-result-a");
                const selectB = document.getElementById("compare-result-b");
                
                // Clear existing options
                selectA.innerHTML = '<option value="">Select result set...</option>';
                selectB.innerHTML = '<option value="">Select result set...</option>';
                
                result.resultSets.forEach(resultSet => {
                    const optionA = document.createElement("option");
                    optionA.value = resultSet.id;
                    optionA.textContent = `${resultSet.name} (${resultSet.sampleCount} samples)`;
                    selectA.appendChild(optionA);
                    
                    const optionB = document.createElement("option");
                    optionB.value = resultSet.id;
                    optionB.textContent = `${resultSet.name} (${resultSet.sampleCount} samples)`;
                    selectB.appendChild(optionB);
                });
            } else {
                this.showNotification("Failed to load saved results", "error");
            }
        } catch (error) {
            console.error("Error loading saved results for comparison:", error);
            this.showNotification("Error loading saved results", "error");
        }
    }

    /**
     * Start comparison between two result sets
     */
    async startComparison() {
        const resultSetAId = document.getElementById("compare-result-a").value;
        const resultSetBId = document.getElementById("compare-result-b").value;
        
        if (!resultSetAId || !resultSetBId) {
            this.showNotification("Please select two result sets to compare", "error");
            return;
        }
        
        if (resultSetAId === resultSetBId) {
            this.showNotification("Please select different result sets to compare", "error");
            return;
        }
        
        try {
            this.updateStatus("Loading result sets for comparison...");
            console.log("Starting comparison between:", resultSetAId, "and", resultSetBId);
            
            // Load both result sets
            const [resultA, resultB] = await Promise.all([
                window.electronAPI.loadResultSet(resultSetAId),
                window.electronAPI.loadResultSet(resultSetBId)
            ]);
            
            console.log("Loaded result sets:", resultA.success, resultB.success);
            console.log("Result A count:", resultA.results?.length);
            console.log("Result B count:", resultB.results?.length);
            
            if (resultA.success && resultB.success) {
                console.log("Performing comparison...");
                const comparison = this.performComparison(resultA.results, resultB.results);
                console.log("Comparison completed:", comparison);
                this.displayComparisonResults(comparison);
            } else {
                this.showNotification("Failed to load one or both result sets", "error");
            }
        } catch (error) {
            console.error("Error during comparison:", error);
            console.error("Error stack:", error.stack);
            this.showNotification(`Error during comparison: ${error.message}`, "error");
        } finally {
            this.updateStatus("Ready");
        }
    }

    /**
     * Perform statistical comparison between two result sets
     */
    performComparison(resultsA, resultsB) {
        console.log("performComparison called with:", resultsA.length, "and", resultsB.length, "results");
        
        // Flatten both result sets
        console.log("Sample results A:", resultsA.slice(0, 2));
        const flattenedA = this.flattenResults(resultsA);
        console.log("Flattened A keys:", flattenedA.keys);
        console.log("Sample flattened A rows:", flattenedA.rows.slice(0, 2));
        
        console.log("Sample results B:", resultsB.slice(0, 2));
        const flattenedB = this.flattenResults(resultsB);
        console.log("Flattened B keys:", flattenedB.keys);
        console.log("Sample flattened B rows:", flattenedB.rows.slice(0, 2));
        
        const comparison = {
            overview: {
                setA: { count: resultsA.length, name: "Result Set A" },
                setB: { count: resultsB.length, name: "Result Set B" }
            },
            numerical: {},
            categorical: {},
            textLength: {},
            significance: {}
        };
        
        // Get all unique columns - handle null/undefined cases
        const columnsA = flattenedA.keys || [];
        const columnsB = flattenedB.keys || [];
        const allColumns = new Set([...columnsA, ...columnsB]);
        
        console.log("Columns A:", columnsA);
        console.log("Columns B:", columnsB);
        
        console.log("All columns to process:", Array.from(allColumns));
        console.log("Will analyze", Array.from(allColumns).filter(col => !col.startsWith('_')).length, "non-internal columns");
        
        allColumns.forEach(column => {
            if (column.startsWith('_')) {
                console.log(`Skipping internal column: ${column}`);
                return; // Skip internal columns
            }
            
            // Safely get values with null/undefined handling
            const valuesA = (flattenedA.rows || []).map(row => row && row[column]).filter(v => v !== null && v !== undefined);
            const valuesB = (flattenedB.rows || []).map(row => row && row[column]).filter(v => v !== null && v !== undefined);
            
            console.log(`Processing column ${column}: A has ${valuesA.length} values, B has ${valuesB.length} values`);
            console.log(`Sample values A:`, valuesA.slice(0, 5));
            console.log(`Sample values B:`, valuesB.slice(0, 5));
            console.log(`Value types A:`, valuesA.slice(0, 5).map(v => typeof v));
            console.log(`Value types B:`, valuesB.slice(0, 5).map(v => typeof v));
            
            // Skip if no data in either set
            if (valuesA.length === 0 && valuesB.length === 0) {
                console.log(`Skipping column ${column} - no data in either set`);
                return;
            }
            
            // Check column type
            const isNumericalA = this.isNumericalColumn(valuesA);
            const isNumericalB = this.isNumericalColumn(valuesB);
            const isNumerical = isNumericalA && isNumericalB;
            
            const isLongTextA = this.isLongTextColumn(valuesA);
            const isLongTextB = this.isLongTextColumn(valuesB);
            const isLongText = isLongTextA || isLongTextB;
            
            // Check if column has any text content (for text length analysis)
            const hasTextA = valuesA.some(val => typeof val === 'string' && val !== null && val !== undefined);
            const hasTextB = valuesB.some(val => typeof val === 'string' && val !== null && val !== undefined);
            const hasText = hasTextA || hasTextB;
            
            console.log(`Column ${column} type check: numerical=(A=${isNumericalA}, B=${isNumericalB}, both=${isNumerical}), longText=(A=${isLongTextA}, B=${isLongTextB}, either=${isLongText}), hasText=${hasText}`);
            
            // Perform appropriate analysis - multiple analyses can be done for the same column
            if (isNumerical && valuesA.length > 0 && valuesB.length > 0) {
                console.log(`Column ${column} is numerical - performing numerical comparison`);
                try {
                    comparison.numerical[column] = this.compareNumericalValues(valuesA, valuesB);
                } catch (error) {
                    console.error(`Error comparing numerical values for column ${column}:`, error);
                    console.log(`Falling back to categorical comparison for column ${column}`);
                    comparison.categorical[column] = this.compareCategoricalValues(valuesA, valuesB);
                }
            } else {
                // For non-numerical columns, determine the best analysis approach
                
                // Always do text length analysis if there's text content in either set
                if (hasText && (valuesA.length > 0 || valuesB.length > 0)) {
                    console.log(`Column ${column} contains text - performing text length analysis`);
                    try {
                        const textAnalysis = this.analyzeTextLengths(valuesA, valuesB);
                        if (textAnalysis) {
                            comparison.textLength[column] = textAnalysis;
                            console.log(`Text length analysis result for ${column}:`, textAnalysis);
                        } else {
                            console.log(`Text length analysis returned null for ${column}`);
                        }
                    } catch (error) {
                        console.error(`Error analyzing text lengths for column ${column}:`, error);
                    }
                }
                
                // Do categorical analysis for non-long-text columns OR as fallback
                if (!isLongText && (valuesA.length > 0 || valuesB.length > 0)) {
                    console.log(`Column ${column} is categorical - performing categorical comparison`);
                    try {
                        comparison.categorical[column] = this.compareCategoricalValues(valuesA, valuesB);
                        console.log(`Categorical comparison result for ${column}:`, comparison.categorical[column]);
                    } catch (error) {
                        console.error(`Error comparing categorical values for column ${column}:`, error);
                    }
                } else if (isLongText) {
                    console.log(`Column ${column} is long text - skipping categorical analysis to avoid noise`);
                }
            }
            
            if (valuesA.length === 0 && valuesB.length === 0) {
                console.log(`Column ${column} skipped - no valid data in either set`);
            }
        });
        
        console.log("Comparison result:", comparison);
        console.log("Analysis summary:");
        console.log(`- Numerical columns: ${Object.keys(comparison.numerical).length}`, Object.keys(comparison.numerical));
        console.log(`- Categorical columns: ${Object.keys(comparison.categorical).length}`, Object.keys(comparison.categorical));
        console.log(`- Text length columns: ${Object.keys(comparison.textLength).length}`, Object.keys(comparison.textLength));
        
        return comparison;
    }

    /**
     * Compare numerical values between two sets
     */
    compareNumericalValues(valuesA, valuesB) {
        const statsA = this.calculateNumericalStats(valuesA);
        const statsB = this.calculateNumericalStats(valuesB);
        
        // Calculate differences
        const differences = {
            mean: statsB.mean - statsA.mean,
            median: statsB.median - statsA.median,
            stdDev: statsB.stdDev - statsA.stdDev
        };
        
        // Perform t-test for significance
        const tTest = this.performTTest(valuesA, valuesB);
        
        return {
            setA: statsA,
            setB: statsB,
            differences,
            tTest
        };
    }

    /**
     * Compare categorical values between two sets
     */
    compareCategoricalValues(valuesA, valuesB) {
        const freqA = this.calculateFrequencyDistribution(valuesA);
        const freqB = this.calculateFrequencyDistribution(valuesB);
        
        // Get all unique values
        const allValues = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
        
        const comparison = {};
        let totalDivergence = 0;
        
        allValues.forEach(value => {
            const countA = freqA[value] || 0;
            const countB = freqB[value] || 0;
            const totalA = valuesA.length;
            const totalB = valuesB.length;
            
            const percentageA = totalA > 0 ? (countA / totalA) * 100 : 0;
            const percentageB = totalB > 0 ? (countB / totalB) * 100 : 0;
            const percentageDifference = percentageB - percentageA;
            
            // Calculate relative importance (how much this value contributes to overall difference)
            const relativeImportance = Math.abs(percentageDifference);
            totalDivergence += relativeImportance;
            
            comparison[value] = {
                setA: { count: countA, percentage: percentageA },
                setB: { count: countB, percentage: percentageB },
                difference: countB - countA,
                percentageDifference: percentageDifference,
                relativeImportance: relativeImportance
            };
        });
        
        // Normalize relative importance to percentages
        Object.values(comparison).forEach(comp => {
            comp.relativeImportance = totalDivergence > 0 ? (comp.relativeImportance / totalDivergence) * 100 : 0;
        });
        
        // Calculate additional metrics
        const uniqueToA = Array.from(allValues).filter(value => (freqA[value] || 0) > 0 && (freqB[value] || 0) === 0);
        const uniqueToB = Array.from(allValues).filter(value => (freqA[value] || 0) === 0 && (freqB[value] || 0) > 0);
        const sharedValues = Array.from(allValues).filter(value => (freqA[value] || 0) > 0 && (freqB[value] || 0) > 0);
        
        // Calculate diversity metrics (Gini-Simpson diversity index)
        const diversityA = this.calculateDiversityIndex(Object.values(freqA), valuesA.length);
        const diversityB = this.calculateDiversityIndex(Object.values(freqB), valuesB.length);
        
        // Calculate overlap coefficient (Jaccard similarity for counts)
        const jaccardSimilarity = this.calculateJaccardSimilarity(freqA, freqB);
        
        // Perform chi-square test for significance
        const chiSquareTest = this.performChiSquareTest(freqA, freqB, valuesA.length, valuesB.length);
        
        return {
            distributions: comparison,
            chiSquareTest,
            summary: {
                totalUniqueValues: allValues.size,
                uniqueToA: uniqueToA.length,
                uniqueToB: uniqueToB.length,
                sharedValues: sharedValues.length,
                diversityA: diversityA,
                diversityB: diversityB,
                jaccardSimilarity: jaccardSimilarity,
                totalDivergence: totalDivergence
            }
        };
    }

    /**
     * Calculate numerical statistics
     */
    calculateNumericalStats(values) {
        if (!Array.isArray(values) || values.length === 0) {
            return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, count: 0 };
        }
        
        // Convert all values to numbers, filtering out invalid ones
        const numericValues = values.map(val => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                const trimmed = val.trim();
                if (trimmed === '') return null;
                const parsed = parseFloat(trimmed);
                return !isNaN(parsed) && isFinite(parsed) ? parsed : null;
            }
            return null;
        }).filter(val => val !== null);
        
        if (numericValues.length === 0) {
            return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, count: 0 };
        }
        
        const sorted = numericValues.sort((a, b) => a - b);
        const sum = numericValues.reduce((acc, val) => acc + val, 0);
        const mean = sum / numericValues.length;
        const median = sorted.length % 2 === 0 
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];
        
        const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
        const stdDev = Math.sqrt(variance);
        
        return {
            mean: this.round(mean),
            median: this.round(median),
            stdDev: this.round(stdDev),
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            count: numericValues.length
        };
    }

    /**
     * Calculate frequency distribution
     */
    calculateFrequencyDistribution(values) {
        if (!Array.isArray(values)) return {};
        
        const freq = {};
        values.forEach(value => {
            if (value === null || value === undefined) {
                freq['null'] = (freq['null'] || 0) + 1;
                return;
            }
            
            const key = typeof value === "string" ? value : JSON.stringify(value);
            freq[key] = (freq[key] || 0) + 1;
        });
        return freq;
    }

    /**
     * Perform t-test for significance
     */
    performTTest(valuesA, valuesB) {
        if (!Array.isArray(valuesA) || !Array.isArray(valuesB) || valuesA.length < 2 || valuesB.length < 2) {
            return { significant: false, pValue: 1, tValue: 0 };
        }
        
        // Convert to numbers and filter out invalid values
        const numericA = valuesA.map(val => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                const parsed = parseFloat(val.trim());
                return !isNaN(parsed) && isFinite(parsed) ? parsed : null;
            }
            return null;
        }).filter(val => val !== null);
        
        const numericB = valuesB.map(val => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                const parsed = parseFloat(val.trim());
                return !isNaN(parsed) && isFinite(parsed) ? parsed : null;
            }
            return null;
        }).filter(val => val !== null);
        
        if (numericA.length < 2 || numericB.length < 2) {
            return { significant: false, pValue: 1, tValue: 0 };
        }
        
        const meanA = numericA.reduce((acc, val) => acc + val, 0) / numericA.length;
        const meanB = numericB.reduce((acc, val) => acc + val, 0) / numericB.length;
        
        const varianceA = numericA.reduce((acc, val) => acc + Math.pow(val - meanA, 2), 0) / (numericA.length - 1);
        const varianceB = numericB.reduce((acc, val) => acc + Math.pow(val - meanB, 2), 0) / (numericB.length - 1);
        
        const pooledVariance = ((numericA.length - 1) * varianceA + (numericB.length - 1) * varianceB) / (numericA.length + numericB.length - 2);
        const standardError = Math.sqrt(pooledVariance * (1 / numericA.length + 1 / numericB.length));
        
        const tValue = Math.abs(meanB - meanA) / standardError;
        
        // Approximate p-value using t-distribution (simplified)
        const degreesOfFreedom = numericA.length + numericB.length - 2;
        const pValue = this.approximatePValue(tValue, degreesOfFreedom);
        
        return {
            significant: pValue < 0.05,
            pValue: this.round(pValue, 4),
            tValue: this.round(tValue, 4)
        };
    }

    /**
     * Perform chi-square test for categorical data
     */
    performChiSquareTest(freqA, freqB, totalA, totalB) {
        const allValues = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
        let chiSquare = 0;
        
        allValues.forEach(value => {
            const observedA = freqA[value] || 0;
            const observedB = freqB[value] || 0;
            
            // Expected frequencies
            const expectedA = totalA * (observedA + observedB) / (totalA + totalB);
            const expectedB = totalB * (observedA + observedB) / (totalA + totalB);
            
            if (expectedA > 0) {
                chiSquare += Math.pow(observedA - expectedA, 2) / expectedA;
            }
            if (expectedB > 0) {
                chiSquare += Math.pow(observedB - expectedB, 2) / expectedB;
            }
        });
        
        const degreesOfFreedom = allValues.size - 1;
        const pValue = this.approximateChiSquarePValue(chiSquare, degreesOfFreedom);
        
        return {
            significant: pValue < 0.05,
            pValue: this.round(pValue, 4),
            chiSquareValue: this.round(chiSquare, 4)
        };
    }

    /**
     * Approximate p-value for t-test (simplified)
     */
    approximatePValue(tValue, degreesOfFreedom) {
        // Simplified approximation - in a real implementation, you'd use a proper t-distribution table
        if (tValue > 3.291) return 0.001;
        if (tValue > 2.576) return 0.01;
        if (tValue > 1.96) return 0.05;
        if (tValue > 1.645) return 0.1;
        return 0.5;
    }

    /**
     * Approximate p-value for chi-square test (simplified)
     */
    approximateChiSquarePValue(chiSquareValue, degreesOfFreedom) {
        // Simplified approximation - in a real implementation, you'd use a proper chi-square distribution
        if (chiSquareValue > 10.828) return 0.001;
        if (chiSquareValue > 7.879) return 0.01;
        if (chiSquareValue > 5.991) return 0.05;
        if (chiSquareValue > 4.605) return 0.1;
        return 0.5;
    }

    /**
     * Display comparison results
     */
    displayComparisonResults(comparison) {
        document.getElementById("comparison-results").classList.remove("hidden");
        
        // Display overview
        this.displayComparisonOverview(comparison.overview);
        
        // Display numerical comparisons
        console.log("Displaying numerical comparisons:", Object.keys(comparison.numerical));
        this.displayNumericalComparisons(comparison.numerical);
        
        console.log("Displaying categorical comparisons:", Object.keys(comparison.categorical));
        this.displayCategoricalComparisons(comparison.categorical);
        
        console.log("Displaying text length comparisons:", Object.keys(comparison.textLength || {}));
        if (comparison.textLength && Object.keys(comparison.textLength).length > 0) {
            console.log("Text length data:", comparison.textLength);
        }
        this.displayTextLengthComparisons(comparison.textLength || {});
        
        // Display significance tests
        this.displaySignificanceTests(comparison);
    }

    /**
     * Display comparison overview
     */
    displayComparisonOverview(overview) {
        const summaryEl = document.getElementById("comparison-summary");
        summaryEl.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <strong>${overview.setA.name}:</strong> ${overview.setA.count} samples
                </div>
                <div>
                    <strong>${overview.setB.name}:</strong> ${overview.setB.count} samples
                </div>
            </div>
        `;
    }

    /**
     * Display numerical comparisons
     */
    displayNumericalComparisons(numericalComparisons) {
        const container = document.getElementById("numerical-comparisons");
        
        if (Object.keys(numericalComparisons).length === 0) {
            container.innerHTML = "<p>No numerical columns found for comparison.</p>";
            return;
        }
        
        let html = '<table class="comparison-table">';
        html += '<thead><tr><th>Metric</th><th>Set A</th><th>Set B</th><th>Difference (B-A)</th><th>Significance</th></tr></thead><tbody>';
        
        Object.entries(numericalComparisons).forEach(([column, comparison]) => {
            const { setA, setB, differences, tTest } = comparison;
            
            html += `
                <tr class="${tTest.significant ? 'significant' : ''}">
                    <td class="metric-name">${this.escapeHtml(column)} - Mean</td>
                    <td>${setA.mean}</td>
                    <td>${setB.mean}</td>
                    <td class="difference ${differences.mean >= 0 ? 'positive' : 'negative'}">${differences.mean >= 0 ? '+' : ''}${differences.mean}</td>
                    <td><span class="significance-indicator ${tTest.significant ? 'significant' : 'not-significant'}">${tTest.significant ? 'p<0.05' : 'p≥0.05'}</span></td>
                </tr>
                <tr>
                    <td class="metric-name">${this.escapeHtml(column)} - Median</td>
                    <td>${setA.median}</td>
                    <td>${setB.median}</td>
                    <td class="difference ${differences.median >= 0 ? 'positive' : 'negative'}">${differences.median >= 0 ? '+' : ''}${differences.median}</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td class="metric-name">${this.escapeHtml(column)} - Std Dev</td>
                    <td>${setA.stdDev}</td>
                    <td>${setB.stdDev}</td>
                    <td class="difference ${differences.stdDev >= 0 ? 'positive' : 'negative'}">${differences.stdDev >= 0 ? '+' : ''}${differences.stdDev}</td>
                    <td>-</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    /**
     * Display categorical comparisons
     */
    displayCategoricalComparisons(categoricalComparisons) {
        const container = document.getElementById("distribution-comparisons");
        
        console.log("displayCategoricalComparisons called with:", categoricalComparisons);
        
        if (!categoricalComparisons || Object.keys(categoricalComparisons).length === 0) {
            console.log("No categorical comparisons to display");
            container.innerHTML = "<p>No categorical columns found for comparison.</p>";
            return;
        }
        
        console.log("Found categorical comparisons for columns:", Object.keys(categoricalComparisons));
        
        let html = '';
        
        Object.entries(categoricalComparisons).forEach(([column, comparison]) => {
            const { distributions, chiSquareTest, summary } = comparison;
            
            // Use summary statistics from the comparison
            const totalValues = summary?.totalUniqueValues || Object.keys(distributions).length;
            const uniqueToA = summary?.uniqueToA || Object.entries(distributions).filter(([_, data]) => data.setA.count > 0 && data.setB.count === 0).length;
            const uniqueToB = summary?.uniqueToB || Object.entries(distributions).filter(([_, data]) => data.setA.count === 0 && data.setB.count > 0).length;
            const sharedValues = summary?.sharedValues || Object.entries(distributions).filter(([_, data]) => data.setA.count > 0 && data.setB.count > 0).length;
            
            // Find most significant differences
            const sortedByDifference = Object.entries(distributions)
                .map(([value, data]) => ({
                    value,
                    data,
                    absoluteDifference: Math.abs(data.percentageDifference)
                }))
                .sort((a, b) => b.absoluteDifference - a.absoluteDifference)
                .slice(0, 5); // Top 5 differences
            
            html += `
                <div class="comparison-section" style="margin-bottom: 32px; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px;">
                    <h5 style="margin-bottom: 16px; color: var(--text-primary);">${this.escapeHtml(column)}</h5>
                    
                    <!-- Summary Statistics -->
                    <div class="categorical-summary" style="background: var(--bg-tertiary); padding: 12px; border-radius: 6px; margin-bottom: 16px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; font-size: 12px;">
                            <div><strong>Total Values:</strong> ${totalValues}</div>
                            <div><strong>Shared Values:</strong> ${sharedValues}</div>
                            <div><strong>Only in Set A:</strong> ${uniqueToA}</div>
                            <div><strong>Only in Set B:</strong> ${uniqueToB}</div>
                            ${summary ? `
                                <div><strong>Jaccard Similarity:</strong> ${this.round(summary.jaccardSimilarity, 2)}</div>
                                <div><strong>Diversity A:</strong> ${this.round(summary.diversityA, 2)}</div>
                                <div><strong>Diversity B:</strong> ${this.round(summary.diversityB, 2)}</div>
                                <div><strong>Total Divergence:</strong> ${this.round(summary.totalDivergence, 1)}%</div>
                            ` : ''}
                        </div>
                        ${summary ? `
                            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-light); font-size: 11px; color: var(--text-muted);">
                                <strong>Interpretation:</strong> 
                                Jaccard similarity of ${this.round(summary.jaccardSimilarity, 2)} indicates ${summary.jaccardSimilarity > 0.7 ? 'high' : summary.jaccardSimilarity > 0.3 ? 'moderate' : 'low'} overlap between sets.
                                Diversity indices show how evenly distributed values are (higher = more diverse).
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Side-by-side Distribution Charts -->
                    <div class="distribution-comparison" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                        <div class="distribution-chart" style="border: 1px solid var(--border-light); border-radius: 6px; padding: 12px;">
                            <h6 style="margin-bottom: 8px; color: var(--text-secondary);">Set A Distribution</h6>
                            ${this.renderDistributionChart(distributions, 'setA')}
                        </div>
                        <div class="distribution-chart" style="border: 1px solid var(--border-light); border-radius: 6px; padding: 12px;">
                            <h6 style="margin-bottom: 8px; color: var(--text-secondary);">Set B Distribution</h6>
                            ${this.renderDistributionChart(distributions, 'setB')}
                        </div>
                    </div>
                    
                    <!-- Detailed Comparison Table -->
                    <div class="categorical-table" style="margin-bottom: 16px;">
                        <h6 style="margin-bottom: 8px; color: var(--text-secondary);">Top Differences</h6>
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                            <thead>
                                <tr style="background: var(--bg-tertiary);">
                                    <th style="padding: 8px; text-align: left; border: 1px solid var(--border-light);">Value</th>
                                    <th style="padding: 8px; text-align: right; border: 1px solid var(--border-light);">Set A</th>
                                    <th style="padding: 8px; text-align: right; border: 1px solid var(--border-light);">Set B</th>
                                    <th style="padding: 8px; text-align: right; border: 1px solid var(--border-light);">Difference</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sortedByDifference.map(({ value, data }) => {
                                    const diffColor = data.percentageDifference > 0 ? 'var(--accent-success)' : 'var(--accent-danger)';
                                    const diffIcon = data.percentageDifference > 0 ? '↗' : '↘';
                                    return `
                                        <tr>
                                            <td style="padding: 6px 8px; border: 1px solid var(--border-light); max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${this.escapeHtml(value)}</td>
                                            <td style="padding: 6px 8px; border: 1px solid var(--border-light); text-align: right;">${data.setA.count} (${this.round(data.setA.percentage)}%)</td>
                                            <td style="padding: 6px 8px; border: 1px solid var(--border-light); text-align: right;">${data.setB.count} (${this.round(data.setB.percentage)}%)</td>
                                            <td style="padding: 6px 8px; border: 1px solid var(--border-light); text-align: right; color: ${diffColor};">
                                                ${diffIcon} ${this.round(Math.abs(data.percentageDifference))}%
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Statistical Significance -->
                    <div class="significance-result" style="padding: 12px; border-radius: 6px; background: ${chiSquareTest.significant ? 'rgba(244, 67, 54, 0.05)' : 'rgba(76, 175, 80, 0.05)'}; border-left: 4px solid ${chiSquareTest.significant ? 'var(--accent-danger)' : 'var(--accent-success)'};">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <strong>Chi-Square Test Result:</strong>
                            <span class="significance-indicator ${chiSquareTest.significant ? 'significant' : 'not-significant'}" style="padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: 600; color: white; background: ${chiSquareTest.significant ? 'var(--accent-danger)' : 'var(--accent-success)'};">
                                ${chiSquareTest.significant ? 'SIGNIFICANT' : 'NOT SIGNIFICANT'}
                            </span>
                        </div>
                        <div style="font-size: 12px; color: var(--text-muted);">
                            χ² = ${chiSquareTest.chiSquareValue}, p = ${chiSquareTest.pValue} 
                            ${chiSquareTest.significant ? '(p < 0.05: distributions are significantly different)' : '(p ≥ 0.05: no significant difference)'}
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * Render distribution chart
     */
    renderDistributionChart(distributions, setKey) {
        const entries = Object.entries(distributions).sort((a, b) => b[1][setKey].count - a[1][setKey].count);
        const maxCount = entries.length > 0 ? entries[0][1][setKey].count : 1;
        const totalCount = entries.reduce((sum, [_, data]) => sum + data[setKey].count, 0);
        
        if (entries.length === 0) {
            return '<div style="color: var(--text-muted); font-style: italic; text-align: center; padding: 16px;">No data</div>';
        }
        
        // Limit to top 10 entries for better readability
        const topEntries = entries.slice(0, 10);
        const remainingCount = entries.length - topEntries.length;
        
        return `
            <div style="max-height: 300px; overflow-y: auto;">
                ${topEntries.map(([value, data]) => {
                    const count = data[setKey].count;
                    const percentage = data[setKey].percentage;
                    const barWidth = maxCount > 0 ? Math.max(2, Math.round(80 * count / maxCount)) : 2;
                    
                    return `
                        <div style="display: flex; align-items: center; margin-bottom: 6px; font-size: 11px;">
                            <div style="min-width: 80px; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 8px;" title="${this.escapeHtml(value)}">
                                ${this.escapeHtml(value)}
                            </div>
                            <div style="flex: 1; background: var(--bg-muted); height: 14px; border-radius: 7px; overflow: hidden; margin-right: 8px;">
                                <div style="width: ${barWidth}%; height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-primary-light)); border-radius: 7px;"></div>
                            </div>
                            <div style="min-width: 60px; text-align: right; color: var(--text-secondary);">
                                ${count} (${this.round(percentage)}%)
                            </div>
                        </div>
                    `;
                }).join('')}
                ${remainingCount > 0 ? `
                    <div style="text-align: center; margin-top: 8px; font-size: 10px; color: var(--text-muted); font-style: italic;">
                        ... and ${remainingCount} more values
                    </div>
                ` : ''}
                <div style="border-top: 1px solid var(--border-light); margin-top: 8px; padding-top: 6px; font-size: 10px; color: var(--text-muted); text-align: center;">
                    Total: ${totalCount} items
                </div>
            </div>
        `;
    }

    /**
     * Display text length comparisons
     */
    displayTextLengthComparisons(textLengthComparisons) {
        // Clear any existing text length analysis first
        const existingSection = document.querySelector('.comparison-details .text-length-section');
        if (existingSection) {
            existingSection.remove();
        }
        
        if (!textLengthComparisons || Object.keys(textLengthComparisons).length === 0) {
            return; // No text length comparisons to display
        }

        console.log("Found text length comparisons for columns:", Object.keys(textLengthComparisons));

        let html = '<div class="comparison-section text-length-section"><h4>📝 Text Length Analysis</h4>';
        html += '<div class="text-length-grid">';

        Object.entries(textLengthComparisons).forEach(([column, analysis]) => {
            if (!analysis) return;

            const { setA, setB, comparison: comp, tTest } = analysis;

            html += `
                <div class="text-length-comparison">
                    <h5>${this.escapeHtml(column)}</h5>
                    
                    <!-- Summary Statistics -->
                    <div class="text-stats-summary">
                        <div class="stats-overview">
                            <div class="stat-group">
                                <h6>Set A (${setA.count} texts)</h6>
                                <div class="stat-row">
                                    <span>Average Length:</span>
                                    <span class="stat-value">${setA.mean} chars</span>
                                </div>
                                <div class="stat-row">
                                    <span>Median Length:</span>
                                    <span class="stat-value">${setA.median} chars</span>
                                </div>
                                <div class="stat-row">
                                    <span>Range:</span>
                                    <span class="stat-value">${setA.min} - ${setA.max} chars</span>
                                </div>
                                <div class="stat-row">
                                    <span>Std Dev:</span>
                                    <span class="stat-value">${setA.stdDev} chars</span>
                                </div>
                                <div class="stat-row">
                                    <span>Total:</span>
                                    <span class="stat-value">${setA.totalChars.toLocaleString()} chars</span>
                                </div>
                            </div>
                            
                            <div class="stat-group">
                                <h6>Set B (${setB.count} texts)</h6>
                                <div class="stat-row">
                                    <span>Average Length:</span>
                                    <span class="stat-value">${setB.mean} chars</span>
                                </div>
                                <div class="stat-row">
                                    <span>Median Length:</span>
                                    <span class="stat-value">${setB.median} chars</span>
                                </div>
                                <div class="stat-row">
                                    <span>Range:</span>
                                    <span class="stat-value">${setB.min} - ${setB.max} chars</span>
                                </div>
                                <div class="stat-row">
                                    <span>Std Dev:</span>
                                    <span class="stat-value">${setB.stdDev} chars</span>
                                </div>
                                <div class="stat-row">
                                    <span>Total:</span>
                                    <span class="stat-value">${setB.totalChars.toLocaleString()} chars</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Comparison -->
                        <div class="comparison-summary">
                            <h6>Comparison</h6>
                            <div class="stat-row">
                                <span>Mean Difference:</span>
                                <span class="stat-value ${comp.meanDifference > 0 ? 'positive' : comp.meanDifference < 0 ? 'negative' : 'neutral'}">${comp.meanDifference > 0 ? '+' : ''}${comp.meanDifference} chars</span>
                            </div>
                            <div class="stat-row">
                                <span>Median Difference:</span>
                                <span class="stat-value ${comp.medianDifference > 0 ? 'positive' : comp.medianDifference < 0 ? 'negative' : 'neutral'}">${comp.medianDifference > 0 ? '+' : ''}${comp.medianDifference} chars</span>
                            </div>
                            ${comp.meanPercentChange !== null ? `
                                <div class="stat-row">
                                    <span>Percent Change:</span>
                                    <span class="stat-value ${comp.meanPercentChange > 0 ? 'positive' : comp.meanPercentChange < 0 ? 'negative' : 'neutral'}">${comp.meanPercentChange > 0 ? '+' : ''}${comp.meanPercentChange}%</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Statistical Test -->
                    ${tTest ? `
                        <div class="statistical-test">
                            <h6>Statistical Significance</h6>
                            <div class="test-result">
                                <span class="test-name">T-Test:</span>
                                <span class="p-value ${tTest.pValue < 0.05 ? 'significant' : 'not-significant'}">
                                    p = ${tTest.pValue.toFixed(4)} ${tTest.pValue < 0.05 ? '(significant)' : '(not significant)'}
                                </span>
                            </div>
                            <div class="test-interpretation">
                                ${tTest.pValue < 0.05 
                                    ? '<span class="interpretation significant">The difference in text lengths is statistically significant.</span>'
                                    : '<span class="interpretation not-significant">No significant difference in text lengths detected.</span>'
                                }
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += '</div></div>';

        // Find the comparison details container and add text length section
        const detailsContainer = document.querySelector('.comparison-details');
        
        if (detailsContainer) {
            detailsContainer.insertAdjacentHTML('beforeend', html);
        } else {
            console.error('Could not find comparison details container for text length analysis');
        }
    }

    /**
     * Display significance tests summary
     */
    displaySignificanceTests(comparison) {
        const container = document.getElementById("significance-tests");
        
        let significantTests = 0;
        let totalTests = 0;
        
        // Count significant numerical tests
        Object.values(comparison.numerical).forEach(comp => {
            totalTests++;
            if (comp.tTest.significant) significantTests++;
        });
        
        // Count significant categorical tests
        Object.values(comparison.categorical).forEach(comp => {
            totalTests++;
            if (comp.chiSquareTest.significant) significantTests++;
        });
        
        container.innerHTML = `
            <div style="padding: 16px; background: var(--bg-muted); border-radius: 8px;">
                <h5>Significance Summary</h5>
                <p><strong>Total Tests:</strong> ${totalTests}</p>
                <p><strong>Significant Differences:</strong> ${significantTests} (${totalTests > 0 ? this.round(significantTests / totalTests * 100) : 0}%)</p>
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">
                    Significant differences are marked with p < 0.05. This indicates that the observed differences are unlikely to have occurred by chance alone.
                </p>
            </div>
        `;
    }

}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {

    window.app = new PromptRunnerApp();

});
