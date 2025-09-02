/**
 * Basic tests for PromptRunner
 */

const path = require('path');
const fs = require('fs');

describe('PromptRunner Basic Tests', () => {
  test('package.json exists and has required fields', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson.name).toBe('prompt-runner');
    expect(packageJson.version).toBe('0.1.0');
    expect(packageJson.main).toBe('src/main/main.js');
    expect(packageJson.scripts).toHaveProperty('start');
    expect(packageJson.scripts).toHaveProperty('dev');
    expect(packageJson.scripts).toHaveProperty('build');
  });

  test('main application files exist', () => {
    const files = [
      'src/main/main.js',
      'src/main/preload.js',
      'src/main/ipc-handlers.js',
      'src/renderer/index.html',
      'src/renderer/scripts/app.js',
      'src/renderer/styles/main.css',
      'src/renderer/styles/components.css',
      'src/shared/constants.js',
      'src/shared/types.js',
      'src/shared/utils.js'
    ];

    files.forEach(file => {
      expect(fs.existsSync(path.join(__dirname, '..', file))).toBe(true);
    });
  });

  test('webpack configuration exists', () => {
    expect(fs.existsSync(path.join(__dirname, '..', 'webpack.config.js'))).toBe(true);
  });

  test('ESLint configuration exists', () => {
    expect(fs.existsSync(path.join(__dirname, '..', '.eslintrc.js'))).toBe(true);
  });

  test('documentation files exist', () => {
    const docs = [
      'README.md',
      'CHANGELOG.md',
      'TaskMaster.md',
      'scripts/prd.md',
      'scripts/prfaq.md',
      'docs/ARCHITECTURE.md',
      'docs/FILEDOC.md'
    ];

    docs.forEach(doc => {
      expect(fs.existsSync(path.join(__dirname, '..', doc))).toBe(true);
    });
  });

  test('HTML file has correct structure', () => {
    const htmlPath = path.join(__dirname, '..', 'src/renderer/index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<title>PromptRunner</title>');
    expect(html).toContain('id="app"');
    expect(html).toContain('app-header');
    expect(html).toContain('app-sidebar');
    expect(html).toContain('app-content');
    expect(html).toContain('app-footer');
  });

  test('Main process file has correct structure', () => {
    const mainPath = path.join(__dirname, '..', 'src/main/main.js');
    const main = fs.readFileSync(mainPath, 'utf8');
    
    expect(main).toContain('const { app, BrowserWindow');
    expect(main).toContain('function createWindow()');
    expect(main).toContain('app.whenReady()');
  });

  test('Preload script has correct structure', () => {
    const preloadPath = path.join(__dirname, '..', 'src/main/preload.js');
    const preload = fs.readFileSync(preloadPath, 'utf8');
    
    expect(preload).toContain('contextBridge');
    expect(preload).toContain('electronAPI');
    expect(preload).toContain('ipcRenderer');
  });

  test('IPC handlers have correct structure', () => {
    const ipcPath = path.join(__dirname, '..', 'src/main/ipc-handlers.js');
    const ipc = fs.readFileSync(ipcPath, 'utf8');
    
    expect(ipc).toContain('setupIpcHandlers');
    expect(ipc).toContain('ipcMain.handle');
  });

  test('App.js has correct structure', () => {
    const appPath = path.join(__dirname, '..', 'src/renderer/scripts/app.js');
    const app = fs.readFileSync(appPath, 'utf8');
    
    expect(app).toContain('class PromptRunnerApp');
    expect(app).toContain('constructor()');
    expect(app).toContain('init()');
    expect(app).toContain('setupEventListeners()');
  });

  test('Constants file has required exports', () => {
    const constantsPath = path.join(__dirname, '..', 'src/shared/constants.js');
    const constants = fs.readFileSync(constantsPath, 'utf8');
    
    expect(constants).toContain('APP_NAME');
    expect(constants).toContain('APP_VERSION');
    expect(constants).toContain('PROVIDERS');
    expect(constants).toContain('DEFAULT_CONFIG');
  });

  test('Types file has required classes', () => {
    const typesPath = path.join(__dirname, '..', 'src/shared/types.js');
    const types = fs.readFileSync(typesPath, 'utf8');
    
    expect(types).toContain('class Template');
    expect(types).toContain('class DataRecord');
    expect(types).toContain('class ExecutionResult');
    expect(types).toContain('class ProviderConfig');
  });

  test('Utils file has required functions', () => {
    const utilsPath = path.join(__dirname, '..', 'src/shared/utils.js');
    const utils = fs.readFileSync(utilsPath, 'utf8');
    
    expect(utils).toContain('generateId');
    expect(utils).toContain('extractVariables');
    expect(utils).toContain('replaceVariables');
    expect(utils).toContain('isValidJSON');
  });
});
