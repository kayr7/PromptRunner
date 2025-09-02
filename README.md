# PromptRunner

An Electron application for running prompts with Large Language Models (LLMs), supporting template-based workflows, JSONL data processing, and comprehensive result analysis.

## Features

- **Multi-Provider Support**: Use local models via Ollama or cloud models via OpenAI
- **Template System**: Create reusable prompt templates with variable substitution
- **JSONL Processing**: Load and process data from JSONL files with field mapping
- **Batch Execution**: Execute prompts across large datasets with progress tracking
- **Secure Storage**: Encrypted API key management using system keychain
- **Result Analysis**: Comprehensive storage, filtering, and export capabilities
- **Modern UI**: Clean, responsive interface with dark/light theme support

## Screenshots

*Screenshots will be added once the application is running*

## Installation

### Prerequisites

- Node.js 16+ 
- npm or yarn
- For local LLMs: [Ollama](https://ollama.ai/) installed and running

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/prompt-runner.git
cd prompt-runner
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build

# Create distributable packages
npm run dist
```

## Usage

### Getting Started

1. **Configure Providers**: Set up your LLM providers in the Providers tab
   - For Ollama: Enter the Ollama URL (default: http://localhost:11434)
   - For OpenAI: Enter your API key and select a model

2. **Create Templates**: Use the Templates tab to create prompt templates
   - Define system prompts for context
   - Create user prompt templates with variables like `{{variable_name}}`
   - Save templates for reuse

3. **Load Data**: Import JSONL files in the Data tab
   - Drag and drop or browse for JSONL files
   - Preview loaded data before execution

4. **Execute Prompts**: Use the Execution tab to run prompts
   - Select a template and provider
   - Configure batch size and other settings
   - Monitor progress in real-time

5. **Analyze Results**: View and export results in the Results tab
   - Filter results by template, provider, or date
   - Export results in JSON, CSV, or text formats

### Template Variables

Templates support variable substitution using double curly braces:

```
Hello {{name}}, your order {{order_id}} is ready for pickup at {{location}}.
```

Variables are automatically detected and can be mapped to JSONL data fields.

### JSONL Format

JSONL (JSON Lines) files contain one JSON object per line:

```jsonl
{"name": "John Doe", "email": "john@example.com", "order_id": "12345"}
{"name": "Jane Smith", "email": "jane@example.com", "order_id": "12346"}
```

## Architecture

PromptRunner follows a clean architecture pattern with clear separation of concerns:

- **Main Process**: Electron main process handling IPC and system integration
- **Renderer Process**: Web-based UI with modern JavaScript
- **Services**: Modular service layer for LLM integration, data processing, and storage
- **Shared**: Common utilities, types, and constants

### Key Components

- **LLM Service**: Abstract interface for different LLM providers
- **Template Service**: Template management and variable substitution
- **Data Service**: JSONL file processing and field mapping
- **Result Service**: Result storage, querying, and export
- **Security Service**: Secure API key management

## Development

### Project Structure

```
src/
├── main/                 # Electron main process
│   ├── main.js          # Main process entry point
│   ├── preload.js       # Preload script for security
│   ├── ipc-handlers.js  # IPC communication handlers
│   └── services/        # Backend services
├── renderer/            # Electron renderer process
│   ├── index.html       # Main application window
│   ├── styles/          # CSS stylesheets
│   └── scripts/         # Frontend JavaScript
├── shared/              # Shared utilities and types
└── tests/               # Test files
```

### Available Scripts

- `npm start` - Start the application
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run dist` - Create distributable packages
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## Configuration

### Environment Variables

- `NODE_ENV` - Set to 'development' for development mode
- `ELECTRON_START_URL` - Custom start URL for development

### Provider Configuration

#### Ollama
- URL: Ollama server URL (default: http://localhost:11434)
- Model: Available model name

#### OpenAI
- API Key: Your OpenAI API key
- Model: GPT model (gpt-4, gpt-3.5-turbo, etc.)

## Security

- API keys are encrypted and stored securely using the system keychain
- No data is transmitted except for LLM API calls
- All processing happens locally on your machine
- Input validation and sanitization throughout the application

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

### Development Guidelines

- Follow the existing code style and ESLint rules
- Write tests for new features
- Update documentation as needed
- Follow the architecture patterns established in the codebase

## Troubleshooting

### Common Issues

**Ollama Connection Failed**
- Ensure Ollama is installed and running
- Check that the URL is correct (default: http://localhost:11434)
- Verify the model is available: `ollama list`

**OpenAI API Errors**
- Verify your API key is correct
- Check your OpenAI account has sufficient credits
- Ensure the model name is valid

**JSONL Parsing Errors**
- Verify the file is valid JSONL format
- Check that each line contains valid JSON
- Ensure the file encoding is UTF-8

**Performance Issues**
- Reduce batch size for large datasets
- Close other applications to free memory
- Use local models (Ollama) for better performance

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Electron](https://electronjs.org/) for the desktop application framework
- [Ollama](https://ollama.ai/) for local LLM support
- [OpenAI](https://openai.com/) for cloud LLM APIs

## Roadmap

- [ ] Additional LLM providers (Anthropic, Google, etc.)
- [ ] Advanced result visualization and analytics
- [ ] Template sharing and collaboration features
- [ ] Plugin system for custom integrations
- [ ] Mobile companion app
- [ ] Cloud sync and backup options

## Support

For support and questions:
- Check the [FAQ](docs/FAQ.md)
- Open an issue on GitHub
- Review the [documentation](docs/)

---

**PromptRunner** - Making LLM workflows simple and efficient.
