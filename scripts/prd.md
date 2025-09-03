# PromptRunner - Product Requirements Document

## Overview
PromptRunner is an Electron application designed to facilitate easy interaction with Large Language Models (LLMs) through a user-friendly interface. The app enables users to define, manage, and execute prompts with various LLM providers while supporting template-based workflows and result analysis.

## Core Features

### 1. System Prompt Management
- **Context Definition**: Users can create, edit, and manage system prompts that define the context for LLM interactions
- **Prompt Library**: Store and organize multiple system prompts for different use cases
- **Version Control**: Track changes to system prompts with history

### 2. Template System
- **Template Creation**: Define reusable prompt templates with variable fields
- **Field Mapping**: Map template fields to data from JSONL files
- **Template Library**: Organize and categorize templates for easy access

### 3. LLM Provider Integration
- **Local LLMs**: Support for Ollama integration for local model execution
- **Cloud LLMs**: OpenAI API integration for GPT models (including GPT-5 with proper parameter handling - max_completion_tokens, default temperature)
- **API Key Management**: Secure storage and management of API keys
- **Provider Switching**: Easy switching between different LLM providers
- **Model Discovery**: Automatic fetching of available models from OpenAI API

### 4. Data Input Management
- **JSONL File Support**: Load and process data from JSONL files
- **Field Mapping**: Map JSONL fields to template variables
- **Data Preview**: Preview loaded data before execution

### 5. Execution Engine
- **Batch Processing**: Execute prompts across multiple data entries from JSONL files
- **Progress Tracking**: Real-time progress monitoring during batch operations
- **Error Handling**: Graceful handling of API failures and errors

### 6. Results Analysis
- **Result Storage**: Store and organize execution results
- **Aggregation Tools**: Analyze and aggregate results across multiple executions
- **Tabular Display**: Automatically parse JSON outputs into a flattened table with a union of fields across runs; missing values are rendered as NULL
- **Aggregations**: Compute numeric statistics (sum, average, median) and categorical distributions (value frequencies with percentages)
+ **Tabular Display**: Automatically parse JSON outputs into a flattened table with a union of fields across runs; missing values are rendered as NULL. Handles mixed content by extracting JSON objects from text.
+ **Aggregations**: Compute numeric statistics (sum, average, median) and categorical distributions (value frequencies with percentages). JSON extraction works even when outputs contain explanatory text mixed with structured data.
  - Categorical aggregation is performed only for columns with < 50 distinct classes; otherwise it is skipped.
  - Distributions are visualized with inline histograms.
- **Export Capabilities**: Export results in various formats (JSON, CSV, etc.)
- **Visualization**: Basic charts and graphs for result analysis

## Technical Requirements

### Platform
- **Electron**: Cross-platform desktop application
- **Node.js**: Backend runtime environment
- **Modern Web Technologies**: Frontend using HTML5, CSS3, JavaScript/TypeScript

### Security
- **API Key Encryption**: Secure storage of API keys using system keychain
- **Data Privacy**: Local data processing with optional cloud storage
- **Input Validation**: Comprehensive input sanitization and validation

### Performance
- **Async Processing**: Non-blocking UI during LLM operations
- **Batch Optimization**: Efficient processing of large datasets
- **Memory Management**: Proper handling of large result sets

## User Experience

### Interface Design
- **Intuitive UI**: Clean, modern interface following Electron design patterns
- **Responsive Layout**: Adaptable to different screen sizes
- **Dark/Light Mode**: User preference for theme selection

### Workflow
1. **Setup**: Configure LLM providers and API keys
2. **Template Creation**: Define prompt templates with variables
3. **Data Loading**: Import JSONL files and map fields
4. **Execution**: Run prompts and monitor progress
5. **Analysis**: Review and analyze results

## Success Metrics
- **User Adoption**: Number of active users and templates created
- **Performance**: Execution speed and reliability
- **User Satisfaction**: Feedback and feature usage patterns
- **Data Processing**: Volume of data processed successfully

## Future Enhancements
- **Additional LLM Providers**: Support for Anthropic, Google, and other providers
- **Advanced Analytics**: Machine learning insights on prompt performance
- **Collaboration Features**: Template sharing and team workflows
- **Plugin System**: Extensible architecture for custom integrations
