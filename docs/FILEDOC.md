# PromptRunner - File Documentation

This document describes the purpose, dependencies, and exports of each file in the PromptRunner project.

## Project Structure

### Root Directory
- `package.json` - Project configuration, dependencies, and scripts
- `README.md` - Project overview and getting started guide
- `CHANGELOG.md` - Version history and change tracking
- `.gitignore` - Git ignore patterns
- `.eslintrc.js` - ESLint configuration
- `jest.config.js` - Jest testing configuration

### Documentation
- `scripts/prd.md` - Product Requirements Document
- `scripts/prfaq.md` - Product Requirements FAQ
- `docs/ARCHITECTURE.md` - System architecture and design decisions
- `docs/FILEDOC.md` - This file documentation

### Source Code

#### Main Process (`src/main/`)
- `main.js` - Electron main process entry point
  - **Dependencies**: electron, path, fs, ipc-handlers
  - **Exports**: None (entry point)
  - **Purpose**: Initializes Electron app, creates windows, handles app lifecycle

- `ipc-handlers.js` - Inter-process communication handlers
  - **Dependencies**: services/*, electron
  - **Exports**: setupIpcHandlers()
  - **Purpose**: Handles communication between main and renderer processes

#### Services (`src/main/services/`)
- `llm-service.js` - LLM provider abstraction layer
  - **Dependencies**: ollama-provider, openai-provider, keychain
  - **Exports**: LLMService class
  - **Purpose**: Provides unified interface for different LLM providers

- `ollama-provider.js` - Ollama local LLM integration
  - **Dependencies**: axios, child_process
  - **Exports**: OllamaProvider class
  - **Purpose**: Handles communication with local Ollama instance

- `openai-provider.js` - OpenAI API integration
  - **Dependencies**: axios, keychain
  - **Exports**: OpenAIProvider class
  - **Purpose**: Handles OpenAI API communication and rate limiting

- `template-service.js` - Template management and processing
  - **Dependencies**: fs, path, lodash
  - **Exports**: TemplateService class
  - **Purpose**: Manages prompt templates, variable substitution, and validation

- `data-service.js` - JSONL file processing and data management
  - **Dependencies**: fs, path, csv-parser, sqlite3
  - **Exports**: DataService class
  - **Purpose**: Handles JSONL file loading, parsing, and field mapping

- `result-service.js` - Result storage and analysis
  - **Dependencies**: sqlite3, fs, path
  - **Exports**: ResultService class
  - **Purpose**: Stores, queries, and analyzes execution results

- `security-service.js` - API key management and encryption
  - **Dependencies**: keytar, crypto
  - **Exports**: SecurityService class
  - **Purpose**: Securely stores and retrieves API keys

#### Renderer Process (`src/renderer/`)
- `index.html` - Main application window HTML
  - **Dependencies**: styles/main.css, scripts/app.js
  - **Exports**: None (HTML file)
  - **Purpose**: Main application interface structure. Results tab includes view toggles (List/Table/Aggregations), a table container, and aggregation sections.

#### Styles (`src/renderer/styles/`)
- `main.css` - Main application styles
  - **Dependencies**: None
  - **Exports**: CSS styles
  - **Purpose**: Global styles and layout

- `components.css` - Component-specific styles
  - **Dependencies**: None
  - **Exports**: CSS styles
  - **Purpose**: Styles for individual UI components

#### Scripts (`src/renderer/scripts/`)
- `app.js` - Main renderer process logic
  - **Dependencies**: components/*, services/*, utils/*
  - **Exports**: None (entry point)
  - **Purpose**: Initializes UI, handles user interactions, manages state. Also parses JSON outputs from results, flattens them into a tabular structure with union columns and NULLs for missing fields, renders a results table, and computes aggregations (sum/avg/median for numeric, distributions for categorical).

#### Components (`src/renderer/scripts/components/`)
- `template-editor.js` - Template creation and editing component
  - **Dependencies**: utils/validation, utils/template-parser
  - **Exports**: TemplateEditor class
  - **Purpose**: Provides interface for creating and editing prompt templates

- `data-loader.js` - JSONL file loading component
  - **Dependencies**: utils/file-handler, utils/validation
  - **Exports**: DataLoader class
  - **Purpose**: Handles file selection, loading, and preview

- `provider-config.js` - LLM provider configuration component
  - **Dependencies**: services/security-service
  - **Exports**: ProviderConfig class
  - **Purpose**: Manages LLM provider settings and API keys

- `execution-panel.js` - Prompt execution interface
  - **Dependencies**: services/llm-service, utils/progress-tracker
  - **Exports**: ExecutionPanel class
  - **Purpose**: Controls prompt execution and progress monitoring

- `results-viewer.js` - Results display and analysis component
  - **Dependencies**: services/result-service, utils/chart-utils
  - **Exports**: ResultsViewer class
  - **Purpose**: Displays and analyzes execution results

#### Services (`src/renderer/scripts/services/`)
- `ui-state.js` - Frontend state management
  - **Dependencies**: None
  - **Exports**: UIState class
  - **Purpose**: Manages application state and UI updates

- `event-bus.js` - Event communication system
  - **Dependencies**: None
  - **Exports**: EventBus class
  - **Purpose**: Handles communication between components

#### Utils (`src/renderer/scripts/utils/`)
- `validation.js` - Input validation utilities
  - **Dependencies**: None
  - **Exports**: Validation functions
  - **Purpose**: Validates user inputs and data formats

- `template-parser.js` - Template parsing utilities
  - **Dependencies**: None
  - **Exports**: Template parsing functions
  - **Purpose**: Parses and validates template syntax

- `file-handler.js` - File handling utilities
  - **Dependencies**: None
  - **Exports**: File handling functions
  - **Purpose**: Handles file operations and formats

- `progress-tracker.js` - Progress tracking utilities
  - **Dependencies**: None
  - **Exports**: ProgressTracker class
  - **Purpose**: Tracks and reports operation progress

- `chart-utils.js` - Chart and visualization utilities
  - **Dependencies**: Chart.js
  - **Exports**: Chart utility functions
  - **Purpose**: Creates charts and visualizations for results

#### Shared (`src/shared/`)
- `constants.js` - Shared constants and configuration
  - **Dependencies**: None
  - **Exports**: Application constants
  - **Purpose**: Defines shared constants and configuration values

- `types.js` - Type definitions and interfaces
  - **Dependencies**: None
  - **Exports**: Type definitions
  - **Purpose**: Defines data structures and interfaces

- `utils.js` - Shared utility functions
  - **Dependencies**: None
  - **Exports**: Utility functions
  - **Purpose**: Provides common utility functions used across processes

### Tests (`tests/`)
- `unit/` - Unit test files
  - **Dependencies**: jest, individual source files
  - **Exports**: Test suites
  - **Purpose**: Tests individual components and functions

- `integration/` - Integration test files
  - **Dependencies**: jest, electron, multiple source files
  - **Exports**: Test suites
  - **Purpose**: Tests component interactions and workflows

- `e2e/` - End-to-end test files
  - **Dependencies**: playwright, electron
  - **Exports**: Test suites
  - **Purpose**: Tests complete user workflows

### Build and Configuration
- `webpack.config.js` - Webpack configuration
  - **Dependencies**: webpack, webpack-cli
  - **Exports**: Webpack configuration object
  - **Purpose**: Bundles renderer process code

- `electron-builder.json` - Electron Builder configuration
  - **Dependencies**: electron-builder
  - **Exports**: Build configuration
  - **Purpose**: Configures application packaging and distribution

## Dependencies Overview

### Production Dependencies
- `electron` - Desktop application framework
- `axios` - HTTP client for API calls
- `sqlite3` - SQLite database for local storage
- `keytar` - Secure key storage
- `lodash` - Utility library
- `csv-parser` - CSV/JSONL file parsing

### Development Dependencies
- `jest` - Testing framework
- `eslint` - Code linting
- `webpack` - Module bundler
- `electron-builder` - Application packaging
- `playwright` - E2E testing

### Optional Dependencies
- `chart.js` - Chart visualization (for results analysis)
- `child_process` - Process management (for Ollama integration)

## File Relationships

### Data Flow
1. `main.js` → `ipc-handlers.js` → `services/*` → Database/File System
2. `index.html` → `app.js` → `components/*` → `services/*` → IPC → Main Process
3. `services/*` → `utils/*` → Shared utilities and validation

### Import Hierarchy
- Main process services depend on shared utilities
- Renderer components depend on renderer services
- Both processes use shared constants and types
- IPC handlers bridge main and renderer processes

### State Management
- Main process: File-based state with SQLite database
- Renderer process: In-memory state with event-driven updates
- Shared state: IPC communication for cross-process state sync
