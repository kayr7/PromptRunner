# Changelog

All notable changes to PromptRunner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete Electron application framework setup
- Modern, responsive user interface with dark/light theme support
- Tab-based navigation system (Templates, Data, Providers, Execution, Results)
- Template editor with variable detection and preview
- JSONL file loading and preview functionality
- Provider configuration interface for Ollama and OpenAI
- Execution progress tracking and monitoring
- Results viewing and export capabilities
- Comprehensive IPC communication system
- Shared utilities, types, and constants
- Development environment with webpack, ESLint, and testing setup
- Documentation: PRD, PR-FAQ, Architecture, FileDoc, README
- **Template Management**: Proper template saving, loading, editing, and deletion with file-based storage
- **Ollama Integration**: Real Ollama API integration with model fetching and connection testing
- **Manual Input Mode**: Added JSON input field for single template execution
- **Improved Execution**: Removed batch mode, now loops through JSONL items individually
- **Template Selection**: Fixed template selection in execution dropdown
- **Model Refresh**: Added refresh button for Ollama models
- **Results Table & Aggregations**: Results tab now includes List/Table/Aggregations views. JSON outputs are parsed and flattened into a table with union columns and NULLs for missing fields. Added numeric statistics (sum/average/median) and categorical distributions (only when < 50 classes) with inline histogram bars.

### Technical Implementation
- Main process with secure preload script
- Renderer process with modern JavaScript
- Component-based UI architecture
- Responsive CSS with CSS custom properties
- File handling and drag-and-drop support
- Template variable extraction and substitution
- Progress tracking and status updates
- Error handling and user notifications

### Fixed
- Template selection not working after creation
- Ollama model fetching not implemented
- Batch execution mode complexity
- Missing template editing and deletion functionality

### Changed
- Simplified execution flow to process items one by one
- Added manual JSON input option alongside JSONL file loading
- Improved error handling and user feedback
- Enhanced UI with better input validation

### Planned for Next Release
- Secure API key management with system keychain
- Advanced result analytics and visualization
- Database integration for better performance
- Plugin system for custom integrations

## [0.1.0] - 2024-01-XX

### Added
- Initial project structure
- Documentation framework
- Development guidelines
- Architecture planning

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A
