const {app, BrowserWindow, Menu, ipcMain, dialog} = require("electron");
const path = require("path");
const {setupIpcHandlers} = require("./ipc-handlers");

// Keep a global reference of the window object
let mainWindow;

/**
 * Create the main application window
 */
function createWindow () {

    // Create the browser window
    mainWindow = new BrowserWindow({
        "width": 1200,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "webPreferences": {
            "nodeIntegration": false,
            "contextIsolation": true,
            "enableRemoteModule": false,
            "preload": path.join(__dirname, "preload.js")
        },
        "icon": path.join(__dirname, "../renderer/assets/icon.png"),
        "titleBarStyle": "default",
        "show": false
    });

    // Load the app
    const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, "../renderer/index.html")}`;

    mainWindow.loadURL(startUrl);

    // Show window when ready to prevent visual flash
    mainWindow.once("ready-to-show", () => {

        mainWindow.show();

    });

    // Open DevTools in development
    if (process.env.NODE_ENV === "development") {

        mainWindow.webContents.openDevTools();

    }

    // Handle window closed
    mainWindow.on("closed", () => {

        mainWindow = null;

    });

    // Handle window focus
    mainWindow.on("focus", () => {

        mainWindow.webContents.send("window-focused");

    });

}

/**
 * Create application menu
 */
function createMenu () {

    const template = [
        {
            "label": "File",
            "submenu": [
                {
                    "label": "New Template",
                    "accelerator": "CmdOrCtrl+N",
                    "click": () => {

                        mainWindow.webContents.send("new-template");

                    }
                },
                {
                    "label": "Open Data File",
                    "accelerator": "CmdOrCtrl+O",
                    "click": async () => {

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

                            mainWindow.webContents.send("file-selected", result.filePaths[0]);

                        }

                    }
                },
                {"type": "separator"},
                {
                    "label": "Preferences",
                    "accelerator": "CmdOrCtrl+,",
                    "click": () => {

                        mainWindow.webContents.send("open-preferences");

                    }
                },
                {"type": "separator"},
                {
                    "label": "Quit",
                    "accelerator": process.platform === "darwin"
                        ? "Cmd+Q"
                        : "Ctrl+Q",
                    "click": () => {

                        app.quit();

                    }
                }
            ]
        },
        {
            "label": "Edit",
            "submenu": [
                {"role": "undo"},
                {"role": "redo"},
                {"type": "separator"},
                {"role": "cut"},
                {"role": "copy"},
                {"role": "paste"},
                {"role": "selectall"}
            ]
        },
        {
            "label": "View",
            "submenu": [
                {"role": "reload"},
                {"role": "forceReload"},
                {"role": "toggleDevTools"},
                {"type": "separator"},
                {"role": "resetZoom"},
                {"role": "zoomIn"},
                {"role": "zoomOut"},
                {"type": "separator"},
                {"role": "togglefullscreen"}
            ]
        },
        {
            "label": "Window",
            "submenu": [
                {"role": "minimize"},
                {"role": "close"}
            ]
        },
        {
            "label": "Help",
            "submenu": [
                {
                    "label": "About PromptRunner",
                    "click": () => {

                        dialog.showMessageBox(mainWindow, {
                            "type": "info",
                            "title": "About PromptRunner",
                            "message": "PromptRunner",
                            "detail": "An Electron application for running prompts with LLMs\nVersion 0.1.0"
                        });

                    }
                }
            ]
        }
    ];

    // Add macOS-specific menu items
    if (process.platform === "darwin") {

        template.unshift({
            "label": app.getName(),
            "submenu": [
                {"role": "about"},
                {"type": "separator"},
                {"role": "services"},
                {"type": "separator"},
                {"role": "hide"},
                {"role": "hideothers"},
                {"role": "unhide"},
                {"type": "separator"},
                {"role": "quit"}
            ]
        });

    }

    const menu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(menu);

}

/**
 * App event handlers
 */
app.whenReady().then(() => {

    createWindow();
    createMenu();
    setupIpcHandlers(mainWindow);

    app.on("activate", () => {

        if (BrowserWindow.getAllWindows().length === 0) {

            createWindow();

        }

    });

});

app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {

        app.quit();

    }

});

app.on("activate", () => {

    if (BrowserWindow.getAllWindows().length === 0) {

        createWindow();

    }

});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {

    contents.on("new-window", (event, navigationUrl) => {

        event.preventDefault();

    });

});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {

    console.error("Uncaught Exception:", error);
    dialog.showErrorBox("Error", `An error occurred: ${error.message}`);

});

process.on("unhandledRejection", (reason, promise) => {

    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    dialog.showErrorBox("Error", `An unhandled promise rejection occurred: ${reason}`);

});
