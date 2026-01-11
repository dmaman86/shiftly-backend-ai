/**
 * CORS MIDDLEWARE
 * 
 * Handles Cross-Origin Resource Sharing (CORS) for API requests.
 * Responsibility: Validate request origins and set appropriate CORS headers.
 * 
 * Security Note: Only allows requests from whitelisted origins defined in configuration.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * CORS headers to be set on all responses
 */
const CORS_HEADERS = {
  CREDENTIALS: "Access-Control-Allow-Credentials",
  METHODS: "Access-Control-Allow-Methods",
  HEADERS: "Access-Control-Allow-Headers",
  ORIGIN: "Access-Control-Allow-Origin",
};

/**
 * Allowed HTTP methods for CORS
 */
const ALLOWED_METHODS = "GET,OPTIONS,PATCH,DELETE,POST,PUT";

/**
 * Allowed HTTP headers for CORS
 */
const ALLOWED_HEADERS = [
  "X-CSRF-Token",
  "X-Requested-With",
  "Accept",
  "Accept-Version",
  "Content-Length",
  "Content-MD5",
  "Content-Type",
  "Date",
  "X-Api-Version",
].join(", ");

/**
 * CORS Middleware Configuration
 */
export interface CORSConfig {
  allowedOrigins: string[];
}

/**
 * Validates if the request origin is allowed
 * 
 * @param origin - Request origin from headers
 * @param allowedOrigins - List of allowed origins
 * @returns The origin if valid, "null" otherwise
 */
function validateOrigin(
  origin: string | undefined,
  allowedOrigins: string[]
): string {
  if (!origin) {
    return "null";
  }

  if (allowedOrigins.includes(origin)) {
    return origin;
  }

  return "null";
}

/**
 * Sets CORS headers on the response
 * 
 * @param res - Vercel response object
 * @param origin - Validated origin to allow
 */
function setCORSHeaders(res: VercelResponse, origin: string): void {
  res.setHeader(CORS_HEADERS.ORIGIN, origin);
  res.setHeader(CORS_HEADERS.CREDENTIALS, "true");
  res.setHeader(CORS_HEADERS.METHODS, ALLOWED_METHODS);
  res.setHeader(CORS_HEADERS.HEADERS, ALLOWED_HEADERS);
}

/**
 * CORS Middleware
 * 
 * Handles CORS preflight (OPTIONS) requests and sets appropriate headers.
 * Returns true if the request should be terminated (OPTIONS request),
 * false if the request should continue processing.
 * 
 * @param req - Vercel request object
 * @param res - Vercel response object
 * @param config - CORS configuration with allowed origins
 * @returns true if request was handled (OPTIONS), false otherwise
 * 
 * @example
 * ```typescript
 * export const handler = async (req, res) => {
 *   if (corsMiddleware(req, res, { allowedOrigins: config.ALLOWED_ORIGINS })) {
 *     return; // OPTIONS request handled, terminate
 *   }
 *   // Continue with normal request processing
 * };
 * ```
 */
export function corsMiddleware(
  req: VercelRequest,
  res: VercelResponse,
  config: CORSConfig
): boolean {
  // Validate and set origin
  const requestOrigin = req.headers.origin as string | undefined;
  const validatedOrigin = validateOrigin(requestOrigin, config.allowedOrigins);

  // Set CORS headers
  setCORSHeaders(res, validatedOrigin);

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return true; // Request handled, terminate
  }

  return false; // Continue processing
}

/**
 * Factory function to create CORS middleware with bound configuration
 * Useful for creating a reusable middleware instance
 * 
 * @param config - CORS configuration
 * @returns Configured CORS middleware function
 * 
 * @example
 * ```typescript
 * const cors = createCORSMiddleware({ allowedOrigins: config.ALLOWED_ORIGINS });
 * 
 * export const handler = async (req, res) => {
 *   if (cors(req, res)) return;
 *   // ... rest of handler
 * };
 * ```
 */
export function createCORSMiddleware(config: CORSConfig) {
  return (req: VercelRequest, res: VercelResponse): boolean => {
    return corsMiddleware(req, res, config);
  };
}
