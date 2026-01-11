/**
 * AI PARSER SERVICE
 * 
 * Handles all interactions with Google Generative AI for shift parsing.
 * Responsibility: Encapsulate AI logic, prompt engineering, and response parsing.
 * 
 * This service is designed with dependency injection to support testing and flexibility.
 */

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ParsedShift } from "../types/shift.types";
import { AIServiceError, ConfigurationError } from "../utils/error-handler.util";

/**
 * AI Parser Service Configuration
 */
interface AIParserConfig {
  apiKey: string;
  modelName: string;
}

/**
 * Google AI Response Schema for shift parsing
 * Enforces structured JSON output from the model
 */
const SHIFT_RESPONSE_SCHEMA = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      date: {
        type: SchemaType.STRING,
        description: "Shift date in YYYY-MM-DD format",
      },
      startTime: {
        type: SchemaType.STRING,
        description: "Shift start time in HH:mm format (24-hour)",
      },
      endTime: {
        type: SchemaType.STRING,
        description: "Shift end time in HH:mm format (24-hour)",
      },
    },
    required: ["date", "startTime", "endTime"],
  },
};

/**
 * AI Parser Service
 * 
 * Provides methods to parse shift data from natural language text using Google's
 * Generative AI. Implements proper error handling and validation.
 */
export class AIParserService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName: string;

  /**
   * Creates an instance of AIParserService
   * 
   * @param config - Configuration object containing API key and model name
   * @throws {ConfigurationError} If API key is invalid
   */
  constructor(config: AIParserConfig) {
    if (!config.apiKey || config.apiKey.trim() === "") {
      throw new ConfigurationError(
        "Invalid API key provided to AIParserService",
        { provided: !!config.apiKey }
      );
    }

    if (!config.modelName || config.modelName.trim() === "") {
      throw new ConfigurationError(
        "Invalid model name provided to AIParserService",
        { provided: !!config.modelName }
      );
    }

    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.modelName = config.modelName;
  }

  /**
   * Builds the prompt for the AI model
   * Incorporates current year for context and clear instructions
   * 
   * @param text - User-provided text containing shift information
   * @returns Formatted prompt string
   */
  private buildPrompt(text: string): string {
    const currentYear = new Date().getFullYear();

    return `
Analyze the provided text and extract work shifts.

Current Context: Year ${currentYear} (use this year if the year is missing in the date).

Instructions:
- Extract all shift information including dates, start times, and end times
- Normalize dates to YYYY-MM-DD format
- Normalize times to HH:mm format (24-hour)
- If year is missing, use ${currentYear}
- Return data strictly as a JSON array matching the schema

Input text: "${text}"
    `.trim();
  }

  /**
   * Parses shift data from natural language text
   * 
   * @param text - User-provided text containing shift information
   * @returns Promise resolving to array of parsed shifts
   * @throws {ValidationError} If text is empty or invalid
   * @throws {AIServiceError} If AI service fails or returns invalid data
   */
  async parseShifts(text: string): Promise<ParsedShift[]> {
    // Validate input
    if (!text || text.trim() === "") {
      throw new AIServiceError(
        "Cannot parse empty text",
        { inputLength: text?.length || 0 }
      );
    }

    try {
      // Get the generative model with configuration
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: SHIFT_RESPONSE_SCHEMA as any, // Type assertion needed for Google AI SDK compatibility
        },
      });

      // Build prompt
      const prompt = this.buildPrompt(text);

      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Parse response text
      const responseText = response.text();
      
      if (!responseText || responseText.trim() === "") {
        throw new AIServiceError(
          "AI model returned empty response",
          { modelName: this.modelName }
        );
      }

      // Parse JSON response
      let parsedShifts: ParsedShift[];
      try {
        parsedShifts = JSON.parse(responseText);
      } catch (parseError) {
        throw new AIServiceError(
          "Failed to parse AI response as JSON",
          {
            modelName: this.modelName,
            responsePreview: responseText.substring(0, 200),
            parseError: parseError instanceof Error ? parseError.message : String(parseError),
          }
        );
      }

      // Validate response structure
      if (!Array.isArray(parsedShifts)) {
        throw new AIServiceError(
          "AI response is not an array",
          {
            modelName: this.modelName,
            responseType: typeof parsedShifts,
          }
        );
      }

      // Validate each shift object
      this.validateShifts(parsedShifts);

      return parsedShifts;

    } catch (error) {
      // Re-throw custom errors
      if (error instanceof AIServiceError) {
        throw error;
      }

      // Wrap unknown errors
      throw new AIServiceError(
        "Failed to generate shifts from AI service",
        {
          modelName: this.modelName,
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  }

  /**
   * Validates the structure of parsed shifts
   * Ensures each shift has required fields with correct types
   * 
   * @param shifts - Array of shifts to validate
   * @throws {AIServiceError} If validation fails
   */
  private validateShifts(shifts: ParsedShift[]): void {
    for (let i = 0; i < shifts.length; i++) {
      const shift = shifts[i];
      
      if (!shift || typeof shift !== "object") {
        throw new AIServiceError(
          `Invalid shift at index ${i}: not an object`,
          { shiftIndex: i, shiftType: typeof shift }
        );
      }

      const requiredFields: (keyof ParsedShift)[] = ["date", "startTime", "endTime"];
      
      for (const field of requiredFields) {
        if (!shift[field] || typeof shift[field] !== "string") {
          throw new AIServiceError(
            `Invalid shift at index ${i}: missing or invalid field '${field}'`,
            {
              shiftIndex: i,
              field,
              provided: shift[field],
              type: typeof shift[field],
            }
          );
        }
      }
    }
  }
}

/**
 * Factory function to create AIParserService instance
 * Provides a convenient way to instantiate the service
 * 
 * @param apiKey - Google Generative AI API key
 * @param modelName - Name of the AI model to use
 * @returns New AIParserService instance
 */
export function createAIParserService(
  apiKey: string,
  modelName: string
): AIParserService {
  return new AIParserService({ apiKey, modelName });
}
