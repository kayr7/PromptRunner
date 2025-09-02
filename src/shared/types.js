/**
 * Type definitions and interfaces for PromptRunner
 */

// Template structure
export class Template {

    constructor (data = {}) {

        this.id = data.id || null;
        this.name = data.name || "";
        this.systemPrompt = data.systemPrompt || "";
        this.userPrompt = data.userPrompt || "";
        this.variables = data.variables || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.description = data.description || "";
        this.tags = data.tags || [];
        this.isActive = data.isActive !== undefined
            ? data.isActive
            : true;

    }

    static fromJSON (json) {

        return new Template(json);

    }

    toJSON () {

        return {
            "id": this.id,
            "name": this.name,
            "systemPrompt": this.systemPrompt,
            "userPrompt": this.userPrompt,
            "variables": this.variables,
            "createdAt": this.createdAt,
            "updatedAt": this.updatedAt,
            "description": this.description,
            "tags": this.tags,
            "isActive": this.isActive
        };

    }

    validate () {

        const errors = [];

        if (!this.name || this.name.trim().length === 0) {

            errors.push("Template name is required");

        }

        if (!this.userPrompt || this.userPrompt.trim().length === 0) {

            errors.push("User prompt is required");

        }

        if (this.name && this.name.length > 100) {

            errors.push("Template name must be less than 100 characters");

        }

        return errors;

    }

}

// Data record structure
export class DataRecord {

    constructor (data = {}) {

        this.id = data.id || null;
        this.data = data.data || {};
        this.metadata = data.metadata || {};
        this.createdAt = data.createdAt || new Date().toISOString();

    }

    static fromJSON (json) {

        return new DataRecord(json);

    }

    toJSON () {

        return {
            "id": this.id,
            "data": this.data,
            "metadata": this.metadata,
            "createdAt": this.createdAt
        };

    }

}

// Execution result structure
export class ExecutionResult {

    constructor (data = {}) {

        this.id = data.id || null;
        this.templateId = data.templateId || null;
        this.provider = data.provider || "";
        this.input = data.input || {};
        this.output = data.output || "";
        this.metadata = data.metadata || {};
        this.executionTime = data.executionTime || 0;
        this.tokensUsed = data.tokensUsed || 0;
        this.status = data.status || "pending";
        this.error = data.error || null;
        this.createdAt = data.createdAt || new Date().toISOString();

    }

    static fromJSON (json) {

        return new ExecutionResult(json);

    }

    toJSON () {

        return {
            "id": this.id,
            "templateId": this.templateId,
            "provider": this.provider,
            "input": this.input,
            "output": this.output,
            "metadata": this.metadata,
            "executionTime": this.executionTime,
            "tokensUsed": this.tokensUsed,
            "status": this.status,
            "error": this.error,
            "createdAt": this.createdAt
        };

    }

}

// Provider configuration structure
export class ProviderConfig {

    constructor (data = {}) {

        this.provider = data.provider || "";
        this.name = data.name || "";
        this.config = data.config || {};
        this.isActive = data.isActive !== undefined
            ? data.isActive
            : true;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();

    }

    static fromJSON (json) {

        return new ProviderConfig(json);

    }

    toJSON () {

        return {
            "provider": this.provider,
            "name": this.name,
            "config": this.config,
            "isActive": this.isActive,
            "createdAt": this.createdAt,
            "updatedAt": this.updatedAt
        };

    }

}

// Execution configuration structure
export class ExecutionConfig {

    constructor (data = {}) {

        this.templateId = data.templateId || null;
        this.provider = data.provider || "";
        this.batchSize = data.batchSize || 10;
        this.maxConcurrent = data.maxConcurrent || 5;
        this.timeout = data.timeout || 300000;
        this.retryAttempts = data.retryAttempts || 3;
        this.retryDelay = data.retryDelay || 1000;
        this.progressCallback = data.progressCallback || null;
        this.errorCallback = data.errorCallback || null;

    }

    static fromJSON (json) {

        return new ExecutionConfig(json);

    }

    toJSON () {

        return {
            "templateId": this.templateId,
            "provider": this.provider,
            "batchSize": this.batchSize,
            "maxConcurrent": this.maxConcurrent,
            "timeout": this.timeout,
            "retryAttempts": this.retryAttempts,
            "retryDelay": this.retryDelay
        };

    }

}

// Progress tracking structure
export class ProgressTracker {

    constructor (total = 0) {

        this.total = total;
        this.current = 0;
        this.completed = 0;
        this.failed = 0;
        this.skipped = 0;
        this.startTime = null;
        this.endTime = null;
        this.estimatedTimeRemaining = 0;

    }

    start () {

        this.startTime = new Date();
        this.current = 0;
        this.completed = 0;
        this.failed = 0;
        this.skipped = 0;

    }

    update (current, completed = 0, failed = 0, skipped = 0) {

        this.current = current;
        this.completed = completed;
        this.failed = failed;
        this.skipped = skipped;

        if (this.startTime && this.current > 0) {

            const elapsed = Date.now() - this.startTime.getTime(),
                rate = this.current / elapsed;

            this.estimatedTimeRemaining = (this.total - this.current) / rate;

        }

    }

    complete () {

        this.endTime = new Date();
        this.current = this.total;

    }

    getProgress () {

        return {
            "current": this.current,
            "total": this.total,
            "completed": this.completed,
            "failed": this.failed,
            "skipped": this.skipped,
            "percentage": this.total > 0
                ? (this.current / this.total) * 100
                : 0,
            "estimatedTimeRemaining": this.estimatedTimeRemaining,
            "startTime": this.startTime,
            "endTime": this.endTime
        };

    }

}

// API response structure
export class APIResponse {

    constructor (success = false, data = null, error = null) {

        this.success = success;
        this.data = data;
        this.error = error;
        this.timestamp = new Date().toISOString();

    }

    static success (data) {

        return new APIResponse(true, data, null);

    }

    static error (error) {

        return new APIResponse(false, null, error);

    }

    toJSON () {

        return {
            "success": this.success,
            "data": this.data,
            "error": this.error,
            "timestamp": this.timestamp
        };

    }

}

// Validation result structure
export class ValidationResult {

    constructor (isValid = true, errors = []) {

        this.isValid = isValid;
        this.errors = errors;

    }

    static valid () {

        return new ValidationResult(true, []);

    }

    static invalid (errors) {

        return new ValidationResult(false, Array.isArray(errors)
            ? errors
            : [errors]);

    }

    addError (error) {

        this.errors.push(error);
        this.isValid = false;

    }

    hasErrors () {

        return this.errors.length > 0;

    }

    getFirstError () {

        return this.errors.length > 0
            ? this.errors[0]
            : null;

    }

}

// Filter structure for results
export class ResultFilter {

    constructor (data = {}) {

        this.templateId = data.templateId || null;
        this.provider = data.provider || null;
        this.status = data.status || null;
        this.dateFrom = data.dateFrom || null;
        this.dateTo = data.dateTo || null;
        this.limit = data.limit || 100;
        this.offset = data.offset || 0;
        this.sortBy = data.sortBy || "createdAt";
        this.sortOrder = data.sortOrder || "desc";

    }

    static fromJSON (json) {

        return new ResultFilter(json);

    }

    toJSON () {

        return {
            "templateId": this.templateId,
            "provider": this.provider,
            "status": this.status,
            "dateFrom": this.dateFrom,
            "dateTo": this.dateTo,
            "limit": this.limit,
            "offset": this.offset,
            "sortBy": this.sortBy,
            "sortOrder": this.sortOrder
        };

    }

}

// Export configuration structure
export class ExportConfig {

    constructor (data = {}) {

        this.format = data.format || "json";
        this.includeMetadata = data.includeMetadata !== undefined
            ? data.includeMetadata
            : true;
        this.includeTimestamps = data.includeTimestamps !== undefined
            ? data.includeTimestamps
            : true;
        this.compression = data.compression || false;
        this.filename = data.filename || null;
        this.fields = data.fields || null;

    }

    static fromJSON (json) {

        return new ExportConfig(json);

    }

    toJSON () {

        return {
            "format": this.format,
            "includeMetadata": this.includeMetadata,
            "includeTimestamps": this.includeTimestamps,
            "compression": this.compression,
            "filename": this.filename,
            "fields": this.fields
        };

    }

}

// Type guards
export function isTemplate (obj) {

    return obj && typeof obj === "object" && "name" in obj && "userPrompt" in obj;

}

export function isDataRecord (obj) {

    return obj && typeof obj === "object" && "data" in obj;

}

export function isExecutionResult (obj) {

    return obj && typeof obj === "object" && "templateId" in obj && "provider" in obj;

}

export function isProviderConfig (obj) {

    return obj && typeof obj === "object" && "provider" in obj && "config" in obj;

}

export function isAPIResponse (obj) {

    return obj && typeof obj === "object" && "success" in obj && "timestamp" in obj;

}

export function isValidationResult (obj) {

    return obj && typeof obj === "object" && "isValid" in obj && "errors" in obj;

}
