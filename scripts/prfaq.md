# PromptRunner - PR-FAQ (Product Requirements FAQ)

## What is PromptRunner?
PromptRunner is an Electron desktop application that simplifies working with Large Language Models (LLMs). It provides a user-friendly interface for creating, managing, and executing prompts with various LLM providers, supporting template-based workflows and comprehensive result analysis.

## How does PromptRunner work?

### Basic Workflow
1. **Setup**: Configure your LLM providers (Ollama for local models, OpenAI for cloud models)
2. **Create Templates**: Define reusable prompt templates with variable fields
3. **Load Data**: Import JSONL files containing your input data
4. **Map Fields**: Connect template variables to your data fields
5. **Execute**: Run prompts across your dataset
6. **Analyze**: Review and analyze the results

### Key Components
- **System Prompts**: Define the context and behavior for your LLM interactions
- **Templates**: Reusable prompt structures with variable placeholders
- **Data Sources**: JSONL files containing structured input data
- **LLM Providers**: Multiple backend options (Ollama, OpenAI)
- **Results**: Comprehensive storage and analysis of execution outcomes

## What are the main features?

### Core Capabilities
- **Multi-Provider Support**: Use local models via Ollama or cloud models via OpenAI
- **Template System**: Create reusable prompts with variable substitution
- **Batch Processing**: Execute prompts across large datasets efficiently
- **Secure Storage**: Encrypted API key management
- **Result Analysis**: Tools for aggregating and visualizing results
- **Tabular Results**: JSON outputs are auto-parsed and flattened into a table view with consistent columns across runs; missing values appear as NULL
- **Aggregations**: Numeric columns show sum/avg/median; categorical columns show value distributions (only when < 50 classes) with inline histograms
+ **Tabular Results**: JSON outputs are auto-parsed and flattened into a table view with consistent columns across runs; missing values appear as NULL. Handles mixed content by extracting JSON objects from explanatory text.
+ **Aggregations**: Numeric columns show sum/avg/median; categorical columns show value distributions (only when < 50 classes) with inline histograms. Works even when LLM outputs contain reasoning mixed with structured data.
- **Export Options**: Save results in various formats (JSON, CSV)

### Advanced Features
- **Progress Tracking**: Real-time monitoring of batch operations
- **Error Handling**: Graceful failure recovery and retry mechanisms
- **Data Preview**: Preview loaded data before execution
- **Version Control**: Track changes to prompts and templates

## What LLM providers are supported?

### Currently Supported
- **Ollama**: Local model execution (requires Ollama installation)
- **OpenAI**: GPT models via API (including GPT-5, GPT-4o, GPT-3.5) with automatic model discovery

### Future Providers
- Anthropic Claude
- Google Gemini
- Azure OpenAI
- Custom API endpoints

## How is data handled and stored?

### Data Privacy
- **Local Processing**: All data processing happens locally on your machine
- **No Cloud Storage**: Data is not uploaded to external servers
- **Encrypted Keys**: API keys are stored securely using system keychain
- **User Control**: Full control over data retention and deletion

### Data Formats
- **Input**: JSONL files (JSON Lines format)
- **Output**: JSON, CSV, or custom formats
- **Templates**: JSON-based template definitions
- **Configuration**: Local JSON configuration files

## What are the system requirements?

### Minimum Requirements
- **OS**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for application, additional space for data
- **Network**: Internet connection for cloud LLM providers

### For Local Models (Ollama)
- **Ollama Installation**: Required for local model execution
- **GPU**: Optional but recommended for better performance
- **Storage**: Additional space for model downloads

## How do I get started?

### Installation
1. Download the latest release for your platform
2. Install the application
3. Launch PromptRunner

### First Steps
1. **Configure Providers**: Set up your LLM providers and API keys
2. **Create System Prompt**: Define your first system prompt
3. **Build Template**: Create a template with variable fields
4. **Load Data**: Import a JSONL file with your data
5. **Execute**: Run your first prompt and see results

## Common Use Cases

### Content Generation
- Generate product descriptions from structured data
- Create marketing copy variations
- Produce reports from raw data

### Data Analysis
- Analyze customer feedback
- Extract insights from documents
- Categorize and classify data

### Testing and Validation
- Test prompt variations
- Validate model responses
- Benchmark different models

## Troubleshooting

### Common Issues
- **API Key Errors**: Ensure your OpenAI API key is valid and has sufficient credits
- **Ollama Connection**: Verify Ollama is running and accessible
- **Data Format**: Check that your JSONL file is properly formatted
- **Memory Issues**: Close other applications if processing large datasets

### Getting Help
- Check the documentation in the app
- Review error messages for specific guidance
- Ensure your system meets minimum requirements

## Security and Privacy

### Data Protection
- **Local Storage**: All data remains on your local machine
- **No Telemetry**: No usage data is collected or transmitted
- **Encrypted Keys**: API keys are encrypted using system security
- **User Control**: You control all data and can delete it at any time

### Best Practices
- Use strong, unique API keys
- Regularly rotate your API keys
- Keep your application updated
- Monitor your API usage and costs

## Future Development

### Planned Features
- Additional LLM provider support
- Advanced analytics and visualization
- Template sharing and collaboration
- Plugin system for custom integrations
- Mobile companion app

### Community
- Open source development
- Community contributions welcome
- Regular updates and improvements
- User feedback integration
