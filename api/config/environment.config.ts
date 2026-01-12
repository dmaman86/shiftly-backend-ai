/**
 * ENVIRONMENT CONFIGURATION MODULE
 *
 * Centralizes all environment variable access and validation.
 * Responsibility: Provide type-safe access to configuration values with validation.
 *
 * Environment Variables Required:
 * - GEMINI_API_KEY: Google Generative AI API key (required)
 * - ALLOWED_ORIGINS: Comma-separated list of allowed CORS origins (optional, has defaults)
 */

/**
 * Application configuration interface
 */
interface AppConfig {
  GEMINI_API_KEY: string;
  ALLOWED_ORIGINS: string[];
  AI_MODEL_NAME: string;
}

/**
 * Default CORS allowed origins
 * Used when ALLOWED_ORIGINS environment variable is not set
 */
const DEFAULT_ALLOWED_ORIGINS = [
  "https://dmaman86.github.io",
  "http://localhost:5173",
];

/**
 * Default AI model name
 */
const DEFAULT_MODEL_NAME = "gemini-1.5-flash-001";

/**
 * Validates and retrieves the GEMINI_API_KEY from environment
 * @throws {Error} If GEMINI_API_KEY is not set
 */
function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "GEMINI_API_KEY environment variable is required but not set. " +
        "Please configure your API key in the environment.",
    );
  }

  return apiKey.trim();
}

/**
 * Parses and retrieves allowed CORS origins from environment
 * Falls back to default origins if not configured
 */
function getAllowedOrigins(): string[] {
  const originsEnv = process.env.ALLOWED_ORIGINS;

  if (!originsEnv || originsEnv.trim() === "") {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  // Parse comma-separated list and trim whitespace
  return originsEnv
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

/**
 * Retrieves the AI model name from environment
 * Falls back to default if not configured
 */
function getModelName(): string {
  const modelName = process.env.AI_MODEL_NAME;

  if (!modelName || modelName.trim() === "") {
    return DEFAULT_MODEL_NAME;
  }

  return modelName.trim();
}

/**
 * Build and validate configuration object
 * This function is called once when the module is imported
 */
function buildConfig(): AppConfig {
  return {
    GEMINI_API_KEY: getApiKey(),
    ALLOWED_ORIGINS: getAllowedOrigins(),
    AI_MODEL_NAME: getModelName(),
  };
}

/**
 * Exported configuration object
 * All configuration access should go through this object
 */
export const config: AppConfig = buildConfig();

/**
 * Utility function to check if configuration is valid
 * Used for health checks and debugging
 */
export function isConfigValid(): boolean {
  try {
    return !!(
      config.GEMINI_API_KEY &&
      config.ALLOWED_ORIGINS.length > 0 &&
      config.AI_MODEL_NAME
    );
  } catch {
    return false;
  }
}
