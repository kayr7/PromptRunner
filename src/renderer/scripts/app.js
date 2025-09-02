/**
 * PromptRunner - Main Application
 * Handles UI logic, user interactions, and communication with the main process
 */

class PromptRunnerApp {

    constructor () {

        this.currentTab = "templates";
        this.currentData = null;
        this.templates = [];
        this.results = [];
        this.isExecuting = false;

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
        this.updateStatus("Ready");

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

        document.getElementById("template-name").value = "";
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

        const template = {
            "id": Date.now().toString(),
            name,
            systemPrompt,
            userPrompt,
            "variables": this.extractVariables(userPrompt),
            "createdAt": new Date().toISOString()
        };

        try {

            const result = await window.electronAPI.saveTemplate(template);

            if (result.success) {

                this.showNotification("Template saved successfully", "success");
                this.loadTemplates();

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
            batchSize = parseInt(document.getElementById("execution-batch-size").value);

        if (!templateId) {

            this.showNotification("Please select a template", "error");

            return;

        }

        if (!provider) {

            this.showNotification("Please select a provider", "error");

            return;

        }

        if (!this.currentData || this.currentData.length === 0) {

            this.showNotification("Please load data first", "error");

            return;

        }

        const template = this.templates.find(t => t.id === templateId);

        if (!template) {

            this.showNotification("Template not found", "error");

            return;

        }

        try {

            this.isExecuting = true;
            this.updateExecutionUI(true);
            this.updateStatus("Starting execution...");

            const result = await window.electronAPI.executeBatch(provider, template, this.currentData, {batchSize});

            if (result.success) {

                this.results = result.results;
                this.showNotification("Execution completed", "success");
                this.updateStatus(`Execution completed: ${result.results.length} results`);
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
     * Clear results
     */
    clearResults () {

        this.results = [];
        document.getElementById("results-list").innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📈</span>
        <p>No results yet</p>
        <p>Execute some prompts to see results here</p>
      </div>
    `;
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

}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {

    window.app = new PromptRunnerApp();

});
