/**
 * ERROR HANDLING UTILITIES
 * 
 * Centralized error handling with custom error classes and HTTP status mapping.
 * Responsibility: Standardize error responses and logging across the application.
 */

import type { VercelResponse } from "@vercel/node";

/**
 * Base custom error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error (400 Bad Request)
 * Used when request validation fails
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 400, true, context);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Method not allowed error (405)
 * Used when HTTP method is not supported
 */
export class MethodNotAllowedError extends AppError {
  constructor(method: string) {
    super(`HTTP method ${method} is not allowed for this endpoint`, 405, true, { method });
    Object.setPrototypeOf(this, MethodNotAllowedError.prototype);
  }
}

/**
 * Configuration error (500 Internal Server Error)
 * Used when server configuration is invalid
 */
export class ConfigurationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 500, false, context);
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * AI Service error (500 Internal Server Error)
 * Used when AI service fails to process request
 */
export class AIServiceError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 500, true, context);
    Object.setPrototypeOf(this, AIServiceError.prototype);
  }
}

/**
 * Error response structure sent to client
 */
interface ErrorResponse {
  error: string;
  statusCode?: number;
  context?: Record<string, unknown>;
}

/**
 * Determines if error is an operational error (safe to expose to client)
 */
function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Logs error with appropriate severity
 * In production, this could integrate with logging services (e.g., Sentry, Datadog)
 */
function logError(error: Error, context?: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    name: error.name,
    message: error.message,
    stack: error.stack,
    context,
  };

  if (error instanceof AppError && !error.isOperational) {
    // Critical error - requires immediate attention
    console.error("[CRITICAL ERROR]", JSON.stringify(errorInfo, null, 2));
  } else {
    // Operational error - expected error that was handled
    console.error("[ERROR]", JSON.stringify(errorInfo, null, 2));
  }
}

/**
 * Builds error response object for client
 */
function buildErrorResponse(error: Error): ErrorResponse {
  if (error instanceof AppError) {
    // Custom error - provide detailed information
    return {
      error: error.message,
      statusCode: error.statusCode,
      ...(process.env.NODE_ENV !== "production" && error.context ? { context: error.context } : {}),
    };
  }

  // Unknown error - provide generic message
  return {
    error: "An unexpected error occurred while processing your request",
    statusCode: 500,
  };
}

/**
 * Centralized error handler for API responses
 * Handles all error types and sends appropriate HTTP response
 * 
 * @param error - The error that occurred
 * @param res - Vercel response object
 */
export function handleError(error: Error, res: VercelResponse): void {
  // Log the error
  logError(error, error instanceof AppError ? error.context : undefined);

  // Determine status code
  const statusCode = error instanceof AppError ? error.statusCode : 500;

  // Build response
  const response = buildErrorResponse(error);

  // Send response
  res.status(statusCode).json(response);
}

/**
 * Async wrapper to catch errors in async route handlers
 * Usage: export const handler = asyncHandler(async (req, res) => { ... });
 */
export function asyncHandler(
  fn: (req: any, res: VercelResponse) => Promise<void>
) {
  return async (req: any, res: VercelResponse): Promise<void> => {
    try {
      await fn(req, res);
    } catch (error) {
      handleError(error as Error, res);
    }
  };
}
