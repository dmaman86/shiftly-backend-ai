/**
 * SHIFT PARSER API HANDLER
 *
 * Main entry point for the shift parsing API endpoint.
 * Responsibility: Orchestrate request/response flow, delegate to services and middleware.
 *
 * Architecture: Layered architecture with separation of concerns
 * - CORS Middleware: Handles cross-origin requests
 * - Validation Middleware: Validates request structure
 * - AI Parser Service: Processes shift parsing logic
 * - Error Handler: Standardizes error responses
 *
 * Flow:
 * 1. CORS handling (preflight + headers)
 * 2. Request validation (method + body)
 * 3. AI service invocation
 * 4. Success response or error handling
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { corsMiddleware } from "./middleware/cors.middleware";
import { validateRequest } from "./middleware/validation.middleware";
import { createAIParserService } from "./services/ai-parser.service";
import { handleError } from "./utils/error-handler.util";
import { config } from "./config/environment.config";

/**
 * Main API handler for shift parsing
 *
 * @param req - Vercel request object
 * @param res - Vercel response object
 *
 * @endpoint POST /api/parse
 * @body { text: string } - Natural language text containing shift information
 * @returns { date: string, startTime: string, endTime: string }[] - Parsed shifts
 *
 * @example
 * Request:
 * POST /api/parse
 * { "text": "I work Monday 9am to 5pm and Tuesday 10am to 6pm" }
 *
 * Response:
 * [
 *   { "date": "2026-01-12", "startTime": "09:00", "endTime": "17:00" },
 *   { "date": "2026-01-13", "startTime": "10:00", "endTime": "18:00" }
 * ]
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  // Step 1: Handle CORS (preflight + headers)
  if (corsMiddleware(req, res, { allowedOrigins: config.ALLOWED_ORIGINS })) {
    return; // OPTIONS request handled, terminate
  }

  try {
    // Step 2: Validate request (method + body)
    const { text } = validateRequest(req);

    // Step 3: Initialize AI parser service
    const aiParser = createAIParserService(
      config.GEMINI_API_KEY,
      config.AI_MODEL_NAME,
    );

    // Step 4: Parse shifts from text
    const shifts = await aiParser.parseShifts(text);

    // Step 5: Send success response
    res.status(200).json(shifts);
  } catch (error) {
    // Step 6: Handle errors with centralized error handler
    handleError(error as Error, res);
  }
}
