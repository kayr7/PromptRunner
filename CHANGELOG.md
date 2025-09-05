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

### Enhanced
- **Results Analysis Improvements**:
  - Added horizontal scrolling to results table view for wide datasets
  - Implemented resizable table columns with drag-to-resize functionality
  - Added search functionality to filter results in list view by input, output, template, or provider
  - Improved table styling with sticky headers and better cell content handling
  - Enhanced user experience with visual feedback during column resizing

### Fixed
- **Table View**: Removed artificial row limit - table view now displays all results instead of limiting to 50 rows
- **Performance**: Added performance optimizations for large datasets with CSS containment and viewport-based sizing

### Debug & Monitoring
- **Empty Output Debugging**: Added comprehensive logging to track when LLM requests produce empty outputs
  - Detailed request/response logging with unique request IDs for tracing
  - Empty output detection and warnings in both Ollama and OpenAI providers
  - Batch execution summary showing empty output counts and percentages
  - Visual indicators in frontend for empty outputs (badges, styling, and special handling)
  - Enhanced error logging with context information
- **Execution Analytics**: Added execution summary statistics showing successful/empty/error counts

### Improved
- **Template Management**: Template name changes now create new templates instead of overwriting existing ones
  - Preserves template history when names are modified
  - Automatic detection of name changes during editing
  - Clear notifications distinguishing between updates and new creations
  - Backend logging for template creation/update operations
- **Results Comparison - Categorical Analysis**: Enhanced categorical value comparison with comprehensive statistics
  - Detailed comparison tables showing top differences between result sets
  - Visual distribution charts with improved bar graphs and data visualization
  - Statistical metrics including Jaccard similarity, diversity indices, and divergence analysis
  - Summary statistics showing shared values, unique values, and overlap coefficients
  - Automatic interpretation of similarity scores and diversity measures
  - Color-coded significance indicators for chi-square test results
- **Table View - Cell Content Overlay**: Enhanced table viewing with clickable cells for detailed content inspection
  - Click any table cell to view full content in an overlay modal
  - Automatic content type detection (JSON, text, null, empty)
  - Syntax highlighting and proper formatting for JSON content
  - Copy-to-clipboard functionality for cell content
  - Content metadata display (type, length, row/column info)
  - Keyboard shortcuts (Escape to close) and hover indicators
- **Results Comparison - Bug Fixes**: Fixed critical issues with categorical variable comparison
  - Fixed column detection issue that prevented categorical analysis from running
  - Enhanced numerical vs categorical classification for small integer ranges (1-10)
  - Rating scales and sentiment scores now properly treated as categorical data
  - Added comprehensive debug logging for comparison troubleshooting
  - Improved error handling and edge case detection
- **Text Length Analysis**: Comprehensive text analysis for all text-containing columns
  - Text length statistics provided for ALL columns with text content (regardless of length)
  - Dual analysis approach: categorical comparison for short text + text length stats
  - Only very long text (avg >150 chars) skips categorical to avoid noise
  - Statistical analysis including mean, median, range, standard deviation for all text
  - T-test for significant differences in text lengths between result sets
  - Handles mixed data types by converting to strings for length analysis
  - Works even when only one result set contains text data
- **Identical Input Analysis**: Compare how different providers handle the same inputs
  - Automatically finds matching inputs between result sets
  - Side-by-side output comparison for identical prompts
  - Difference scoring based on length, word count, and content similarity
  - Structured data comparison for JSON outputs with key-level differences
  - Summary statistics showing identical vs different outputs
  - Provider combination analysis to identify common comparisons
  - Visual diff display with color-coded differences and metrics
- Development environment with webpack, ESLint, and testing setup
- Documentation: PRD, PR-FAQ, Architecture, FileDoc, README
- **Template Management**: Proper template saving, loading, editing, and deletion with file-based storage
- **Ollama Integration**: Real Ollama API integration with model fetching and connection testing
- **Manual Input Mode**: Added JSON input field for single template execution
- **Improved Execution**: Removed batch mode, now loops through JSONL items individually
- **Template Selection**: Fixed template selection in execution dropdown
- **OpenAI Integration**: Enhanced OpenAI support with latest models (GPT-5, GPT-4o) and automatic model discovery from API
- **Bug Fix**: Fixed OpenAI refresh models button functionality with proper event listener setup
- **Bug Fix**: Fixed OpenAI API requests failing with 400 errors by using standard chat completions format
- **Bug Fix**: Fixed GPT-5 compatibility by using `max_completion_tokens` instead of `max_tokens` for GPT-5 models
- **Bug Fix**: Fixed GPT-5 temperature parameter - GPT-5 only supports default temperature (1), no custom values
- **Enhanced Aggregations**: Added histograms for numerical values and optional histograms for categorical data via explicit button
- **Fixed API Key Persistence**: Implemented proper save/load functionality for OpenAI API keys using file-based storage
- **Enhanced Aggregations**: Improved aggregation display by filtering out internal columns (_id, _templateId) and implementing sqrt(n) threshold for text outputs
- **Results Persistence**: Added comprehensive save/load functionality for results with named result sets, metadata storage, and search capabilities
- **Enhanced Result Naming**: Auto-generated result names now include template, input file, provider, and model information
- **Result Comparison**: Added comprehensive comparison functionality between two result sets
  - Side-by-side numerical comparison with mean, median, standard deviation
  - Distribution comparison with visualizations
  - Statistical significance testing (t-tests for numerical data, chi-square tests for categorical data)
  - Significance indicators and p-value reporting
  - Summary statistics showing total tests and significant differences
- **Results Table & Aggregations**: Results tab now includes List/Table/Aggregations views. JSON outputs are parsed and flattened into a table with union columns and NULLs for missing fields. Added numeric statistics (sum/average/median/min/max with histograms) and categorical distributions (only when < 50 classes) with inline histogram bars. Enhanced JSON parsing to extract structured data from mixed content (explanatory text + JSON).

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
