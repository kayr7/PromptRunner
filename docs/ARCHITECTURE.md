# PromptRunner - Architecture Documentation

## Overview
PromptRunner is built as an Electron application with a modular architecture that separates concerns between the main process, renderer process, and various service layers. The application follows a clean architecture pattern with clear separation between UI, business logic, and data persistence.

## Architecture Layers

### 1. Presentation Layer (Renderer Process)
- **Technology**: Electron renderer process with HTML/CSS/JavaScript
- **Framework**: Vanilla JavaScript with modern ES6+ features
- **UI Components**: Custom web components for modularity
- **State Management**: Event-driven architecture with custom state management

### 2. Application Layer (Main Process)
- **Technology**: Electron main process with Node.js
- **IPC Communication**: Secure communication between main and renderer processes
- **Service Orchestration**: Coordinates between different service layers
- **Error Handling**: Centralized error handling and logging

### 3. Domain Layer (Services)
- **LLM Service**: Abstract interface for different LLM providers
- **Template Service**: Template management and variable substitution
- **Data Service**: JSONL file processing and field mapping
- **Result Service**: Result storage, aggregation, and analysis
  - Renderer computes lightweight client-side aggregations for the current result set: JSON parsing (including extraction from mixed content), flattening to a union schema, numeric stats (sum/avg/median/min/max with histograms), and categorical distributions (only when number of classes < 50), with inline histogram rendering.
- **Security Service**: API key management and encryption

### 4. Infrastructure Layer
- **File System**: Local file storage for data, templates, and results
- **Database**: SQLite for structured data storage
- **Keychain**: System keychain for secure API key storage
- **Network**: HTTP client for API communications

## Core Components

### LLM Provider System
```
LLMService (Abstract)
├── OllamaProvider
│   ├── Local model execution
│   ├── Model management
│   └── Connection handling
└── OpenAIProvider
    ├── API communication
    ├── Rate limiting
    ├── Latest model support (GPT-5, GPT-4o)
    ├── Automatic model discovery
    └── Error handling
```

### Template Engine
```
TemplateService
├── Template Parser
│   ├── Variable extraction
│   ├── Syntax validation
│   └── Template compilation
├── Field Mapper
│   ├── JSONL field mapping
│   ├── Data validation
│   └── Type conversion
└── Execution Engine
    ├── Batch processing
    ├── Progress tracking
    └── Result collection
```

### Data Management
```
DataService
├── File Loader
│   ├── JSONL parsing
│   ├── Schema detection
│   └── Data validation
├── Field Mapper
│   ├── Template field binding
│   ├── Data transformation
│   └── Error handling
└── Result Storage
    ├── Structured storage
    ├── Query interface
    ├── Export capabilities
    └── Renderer-side tabularization and aggregations (union schema with NULLs)
```

## Data Flow

### Template Execution Flow
1. **Template Selection**: User selects a template from the library
2. **Data Loading**: JSONL file is loaded and parsed
3. **Field Mapping**: Template variables are mapped to data fields
4. **Provider Selection**: LLM provider is selected (Ollama/OpenAI)
5. **Batch Execution**: Prompts are executed across the dataset
6. **Result Collection**: Results are stored and indexed
7. **Analysis**: Results are processed for analysis and visualization

### Security Flow
1. **API Key Input**: User provides API key through secure UI
2. **Encryption**: Key is encrypted using system keychain
3. **Storage**: Encrypted key is stored locally
4. **Retrieval**: Key is decrypted when needed for API calls
5. **Validation**: Key validity is checked before use

## File Structure
```
src/
├── main/
│   ├── main.js                 # Electron main process
│   ├── ipc-handlers.js         # IPC communication handlers
│   └── services/
│       ├── llm-service.js      # LLM provider abstraction
│       ├── template-service.js # Template management
│       ├── data-service.js     # Data processing
│       ├── result-service.js   # Result management
│       └── security-service.js # Security and encryption
├── renderer/
│   ├── index.html              # Main application window
│   ├── styles/
│   │   ├── main.css            # Main stylesheet
│   │   └── components.css      # Component styles
│   ├── scripts/
│   │   ├── app.js              # Main application logic
│   │   ├── components/         # Web components
│   │   ├── services/           # Frontend services
│   │   └── utils/              # Utility functions
│   └── assets/                 # Images, icons, etc.
├── shared/
│   ├── constants.js            # Shared constants
│   ├── types.js                # Type definitions
│   └── utils.js                # Shared utilities
└── tests/                      # Test files
    ├── unit/
    ├── integration/
    └── e2e/
```

## Security Architecture

### API Key Management
- **Encryption**: Uses system keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)
- **Access Control**: Keys are only accessible to the application process
- **Validation**: Keys are validated before storage and use
- **Rotation**: Support for key rotation and updates

### Data Protection
- **Local Storage**: All data remains on the local machine
- **No Network**: No data is transmitted except for LLM API calls
- **Input Validation**: Comprehensive validation of all inputs
- **Error Handling**: Secure error messages that don't expose sensitive data

## Performance Considerations

### Memory Management
- **Streaming**: Large JSONL files are processed in streams
- **Chunking**: Batch operations are processed in configurable chunks
- **Cleanup**: Automatic cleanup of temporary data and results
- **Caching**: Intelligent caching of frequently accessed data

### Async Processing
- **Non-blocking UI**: All heavy operations run in background threads
- **Progress Updates**: Real-time progress reporting to UI
- **Cancellation**: Support for canceling long-running operations
- **Retry Logic**: Automatic retry for transient failures

## Error Handling

### Error Categories
- **Validation Errors**: Input validation and format errors
- **Network Errors**: API communication and connectivity issues
- **Provider Errors**: LLM provider-specific errors
- **System Errors**: File system and resource errors

### Error Recovery
- **Graceful Degradation**: Application continues with reduced functionality
- **Automatic Retry**: Retry failed operations with exponential backoff
- **User Notification**: Clear error messages with actionable guidance
- **Logging**: Comprehensive error logging for debugging

## Testing Strategy

### Test Types
- **Unit Tests**: Individual component testing
- **Integration Tests**: Service interaction testing
- **E2E Tests**: Full application workflow testing
- **Performance Tests**: Load and stress testing

### Test Coverage
- **Core Services**: 90%+ coverage for business logic
- **UI Components**: Component-level testing
- **Error Scenarios**: Comprehensive error condition testing
- **Security**: Security-focused testing

## Deployment Architecture

### Build Process
- **Electron Builder**: Automated build and packaging
- **Code Signing**: Application signing for distribution
- **Auto-updater**: Automatic update mechanism
- **Platform Support**: Windows, macOS, and Linux builds

### Distribution
- **GitHub Releases**: Automated release management
- **Installers**: Platform-specific installers
- **Portable**: Portable versions for advanced users
- **Updates**: Seamless update process

## Future Architecture Considerations

### Scalability
- **Plugin System**: Extensible architecture for custom providers
- **Cloud Integration**: Optional cloud storage and sync
- **Multi-user**: Support for team collaboration features
- **API Server**: Optional API server for external integrations

### Performance Improvements
- **Web Workers**: Background processing for heavy operations
- **IndexedDB**: Advanced client-side storage
- **Service Workers**: Offline capability and caching
- **WebAssembly**: Performance-critical operations in WASM
