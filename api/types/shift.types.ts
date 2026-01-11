/**
 * TYPE DEFINITIONS FOR SHIFT PARSER API
 * 
 * This module defines all TypeScript interfaces and types used across the API.
 * Responsibility: Provide type safety and contract definitions for the entire application.
 */

import { SchemaType } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Request body schema for shift parsing endpoint
 */
export interface ParseRequest {
  text: string;
}

/**
 * Individual shift data structure returned by the AI
 */
export interface ParsedShift {
  date: string;      // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm
  endTime: string;   // Format: HH:mm
}

/**
 * API response type - array of parsed shifts
 */
export type ParseResponse = ParsedShift[];

/**
 * Google AI schema definition for structured output
 * Maps to the generationConfig.responseSchema configuration
 */
export interface ShiftSchema {
  type: typeof SchemaType.ARRAY;
  items: {
    type: typeof SchemaType.OBJECT;
    properties: {
      date: {
        type: typeof SchemaType.STRING;
        description: string;
      };
      startTime: {
        type: typeof SchemaType.STRING;
        description: string;
      };
      endTime: {
        type: typeof SchemaType.STRING;
        description: string;
      };
    };
    required: string[];
  };
}

/**
 * Vercel serverless function handler type
 * Re-exported for consistency across the application
 */
export type RequestHandler = (
  req: VercelRequest,
  res: VercelResponse
) => Promise<void> | void;

/**
 * Custom error types for better error handling
 */
export interface APIError {
  message: string;
  statusCode: number;
  context?: Record<string, unknown>;
}
