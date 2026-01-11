/**
 * VALIDATION MIDDLEWARE
 * 
 * Validates incoming API requests for method and body structure.
 * Responsibility: Ensure requests meet API contract before processing.
 * 
 * Validation includes:
 * - HTTP method validation
 * - Request body structure validation
 * - Required field validation
 */

import type { VercelRequest } from "@vercel/node";
import type { ParseRequest } from "../types/shift.types";
import { ValidationError, MethodNotAllowedError } from "../utils/error-handler.util";

/**
 * Validates that the HTTP method is POST
 * 
 * @param req - Vercel request object
 * @throws {MethodNotAllowedError} If method is not POST
 */
export function validateMethod(req: VercelRequest): void {
  if (req.method !== "POST") {
    throw new MethodNotAllowedError(req.method || "UNKNOWN");
  }
}

/**
 * Validates that the request body exists and has correct structure
 * 
 * @param req - Vercel request object
 * @throws {ValidationError} If body is missing or malformed
 */
function validateBody(req: VercelRequest): void {
  if (!req.body) {
    throw new ValidationError("Request body is required", {
      contentType: req.headers["content-type"],
    });
  }

  if (typeof req.body !== "object") {
    throw new ValidationError("Request body must be a JSON object", {
      bodyType: typeof req.body,
    });
  }
}

/**
 * Validates that required fields are present in the request body
 * 
 * @param body - Request body object
 * @throws {ValidationError} If required fields are missing or invalid
 */
function validateRequiredFields(body: Record<string, unknown>): void {
  const { text } = body;

  if (!text) {
    throw new ValidationError("Field 'text' is required", {
      providedFields: Object.keys(body),
      missingField: "text",
    });
  }

  if (typeof text !== "string") {
    throw new ValidationError("Field 'text' must be a string", {
      field: "text",
      providedType: typeof text,
      expectedType: "string",
    });
  }

  if (text.trim() === "") {
    throw new ValidationError("Field 'text' cannot be empty", {
      field: "text",
      length: text.length,
    });
  }
}

/**
 * Type guard to check if object is a valid ParseRequest
 * 
 * @param obj - Object to check
 * @returns true if obj is a valid ParseRequest
 */
function isParseRequest(obj: unknown): obj is ParseRequest {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const candidate = obj as Record<string, unknown>;
  return (
    "text" in candidate &&
    typeof candidate.text === "string" &&
    candidate.text.trim().length > 0
  );
}

/**
 * Complete request validation middleware
 * Validates method, body structure, and required fields
 * 
 * @param req - Vercel request object
 * @returns Validated and typed request body
 * @throws {MethodNotAllowedError} If method is not POST
 * @throws {ValidationError} If body validation fails
 * 
 * @example
 * ```typescript
 * export const handler = async (req, res) => {
 *   try {
 *     const { text } = validateRequest(req);
 *     // text is guaranteed to be a non-empty string
 *   } catch (error) {
 *     handleError(error, res);
 *   }
 * };
 * ```
 */
export function validateRequest(req: VercelRequest): ParseRequest {
  // Step 1: Validate HTTP method
  validateMethod(req);

  // Step 2: Validate body structure
  validateBody(req);

  // Step 3: Validate required fields
  validateRequiredFields(req.body as Record<string, unknown>);

  // Step 4: Type guard check
  if (!isParseRequest(req.body)) {
    throw new ValidationError("Request body does not match expected structure", {
      body: req.body,
    });
  }

  return req.body;
}

/**
 * Validates only the text field from request body
 * Lighter validation for scenarios where method is already validated
 * 
 * @param req - Vercel request object
 * @returns Extracted text field
 * @throws {ValidationError} If text field is invalid
 */
export function validateTextField(req: VercelRequest): string {
  const body = req.body as Record<string, unknown>;

  if (!body.text) {
    throw new ValidationError("Field 'text' is required");
  }

  if (typeof body.text !== "string") {
    throw new ValidationError("Field 'text' must be a string", {
      providedType: typeof body.text,
    });
  }

  if (body.text.trim() === "") {
    throw new ValidationError("Field 'text' cannot be empty");
  }

  return body.text;
}
