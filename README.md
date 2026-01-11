# Shiftly API - Shift Parser Service

> **Production-ready REST API for parsing work shift data using Google Generative AI**

## 📋 Overview

This API provides an intelligent shift parsing endpoint that converts natural language text into structured shift data using Google's Generative AI (Gemini). Built with a clean, layered architecture following enterprise best practices.

### Key Features

- ✅ **Natural Language Processing**: Parse shifts from plain text
- ✅ **Type-Safe**: Full TypeScript coverage
- ✅ **Production-Ready**: Comprehensive error handling and validation
- ✅ **Testable**: Modular architecture with dependency injection
- ✅ **Secure**: CORS protection and input validation
- ✅ **Documented**: Extensive inline documentation

---

## 🏗️ Architecture

### Layered Architecture Pattern

```
api/
├── parse.ts                          # Main handler (orchestration only)
├── types/
│   └── shift.types.ts               # Type definitions & contracts
├── config/
│   └── environment.config.ts        # Configuration & env validation
├── middleware/
│   ├── cors.middleware.ts           # CORS handling
│   └── validation.middleware.ts     # Request validation
├── services/
│   └── ai-parser.service.ts         # AI service logic
└── utils/
    └── error-handler.util.ts        # Error handling utilities
```

### Architecture Principles

- **Separation of Concerns**: Each module has a single, clear responsibility
- **Dependency Injection**: Services are instantiated with dependencies
- **Type Safety**: Full TypeScript coverage with strict types
- **Error Handling**: Custom error classes with proper HTTP status codes
- **Configuration**: Centralized environment variable management

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (CommonJS)
- Google Generative AI API Key ([Get one here](https://ai.google.dev/))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd shiftly-api

# Install dependencies
npm install

# Set up environment variables
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

### Environment Variables

```bash
# Required
GEMINI_API_KEY=your_google_ai_api_key

# Optional
ALLOWED_ORIGINS=https://example.com,http://localhost:3000
AI_MODEL_NAME=gemini-1.5-flash
NODE_ENV=production
```

### Deployment

```bash
# Deploy to Vercel
vercel --prod

# Or use Vercel CLI with auto-deployment
git push origin main
```

---

## 📡 API Reference

### Parse Shifts

**Endpoint:** `POST /api/parse`

**Description:** Parse work shifts from natural language text

#### Request

```json
{
  "text": "I work Monday 9am to 5pm and Tuesday 10am to 6pm"
}
```

#### Response (200 OK)

```json
[
  {
    "date": "2026-01-12",
    "startTime": "09:00",
    "endTime": "17:00"
  },
  {
    "date": "2026-01-13",
    "startTime": "10:00",
    "endTime": "18:00"
  }
]
```

#### Error Responses

**400 Bad Request**

```json
{
  "error": "Field 'text' is required",
  "statusCode": 400
}
```

**405 Method Not Allowed**

```json
{
  "error": "HTTP method GET is not allowed for this endpoint",
  "statusCode": 405
}
```

**500 Internal Server Error**

```json
{
  "error": "Failed to generate shifts from AI service",
  "statusCode": 500
}
```

---

## 🧪 Testing

### Unit Tests (Example)

```typescript
import { AIParserService } from "./api/services/ai-parser.service";
import { validateRequest } from "./api/middleware/validation.middleware";
import { corsMiddleware } from "./api/middleware/cors.middleware";

describe("AIParserService", () => {
  it("should parse shifts from text", async () => {
    const service = new AIParserService({
      apiKey: "test-key",
      modelName: "gemini-1.5-flash",
    });

    const shifts = await service.parseShifts("Monday 9am to 5pm");
    expect(shifts).toHaveLength(1);
    expect(shifts[0]).toMatchObject({
      date: expect.any(String),
      startTime: expect.any(String),
      endTime: expect.any(String),
    });
  });
});

describe("Validation Middleware", () => {
  it("should throw ValidationError for missing text", () => {
    const req = { method: "POST", body: {} };
    expect(() => validateRequest(req)).toThrow(ValidationError);
  });
});

describe("CORS Middleware", () => {
  it("should allow whitelisted origins", () => {
    const req = { headers: { origin: "https://example.com" } };
    const res = { setHeader: jest.fn() };

    corsMiddleware(req, res, { allowedOrigins: ["https://example.com"] });

    expect(res.setHeader).toHaveBeenCalledWith(
      "Access-Control-Allow-Origin",
      "https://example.com",
    );
  });
});
```

---

## 📊 Code Metrics

| Metric               | Value        | Description                        |
| -------------------- | ------------ | ---------------------------------- |
| **Files**            | 7 modules    | Clean separation of concerns       |
| **Lines**            | 1,011 total  | Comprehensive with documentation   |
| **Main Handler**     | 76 lines     | Orchestration only (20% reduction) |
| **Type Coverage**    | 100%         | Full TypeScript safety             |
| **Custom Errors**    | 5 types      | Comprehensive error handling       |
| **Type Definitions** | 7 interfaces | Clear contracts                    |

---

## 🔧 Development

### Project Structure

```
shiftly-api/
├── api/                              # API source code
│   ├── parse.ts                      # Main handler (76 lines)
│   ├── parse.ts.backup               # Original backup (95 lines)
│   ├── types/
│   │   └── shift.types.ts           # Type definitions (74 lines)
│   ├── config/
│   │   └── environment.config.ts    # Configuration (116 lines)
│   ├── middleware/
│   │   ├── cors.middleware.ts       # CORS handling (148 lines)
│   │   └── validation.middleware.ts # Validation (167 lines)
│   ├── services/
│   │   └── ai-parser.service.ts     # AI service (251 lines)
│   └── utils/
│       └── error-handler.util.ts    # Error handling (179 lines)
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── README.md                         # This file
├── REFACTORING_SUMMARY.md            # Refactoring details
├── VALIDATION_CHECKLIST.md           # Validation results
└── BEFORE_AFTER_COMPARISON.md        # Before/after comparison
```

### Type Checking

```bash
# Run TypeScript type checking
npx tsc --noEmit

# Should output no errors
```

### Linting (Future)

```bash
# Install ESLint
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Run linting
npm run lint
```

---

## 🛡️ Security

### CORS Protection

- Whitelisted origins only (configurable via `ALLOWED_ORIGINS`)
- Preflight request handling
- Credentials support

### Input Validation

- Request method validation (POST only)
- Body structure validation
- Type guards for runtime safety
- Required field validation

### Error Handling

- No sensitive data in error messages
- Production-safe error responses
- Structured logging

### Environment Variables

- Required variables validated on startup
- Type-safe configuration access
- No hardcoded credentials

---

## 📈 Performance

- **Cold Start**: ~2-3 seconds (Vercel serverless)
- **Warm Request**: ~500ms-1s (depending on AI response)
- **No Database**: Stateless API
- **Scalability**: Unlimited (serverless auto-scaling)

---

## 🤝 Contributing

### Code Style

- Use TypeScript for all new code
- Follow existing architecture patterns
- Add JSDoc comments for public functions
- Write tests for new features

### Pull Request Process

1. Create feature branch from `main`
2. Make changes following code style
3. Add/update tests
4. Update documentation
5. Submit pull request with clear description

---

## 📝 License

ISC License - See LICENSE file for details

---

## 🙏 Acknowledgments

- Google Generative AI (Gemini) for shift parsing
- Vercel for serverless hosting
- TypeScript community for type safety

---

## 📞 Support

For issues, questions, or contributions:

- Create an issue on GitHub
- Contact: [dmaman86@gmail.com]

---

## 🎯 Roadmap

### Version 1.0 (Current)

- ✅ Natural language shift parsing
- ✅ TypeScript support
- ✅ Error handling
- ✅ CORS protection

### Version 1.1 (Planned)

- [ ] Unit test suite (Jest)
- [ ] Integration tests
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Request logging middleware

### Version 2.0 (Future)

- [ ] Rate limiting
- [ ] Caching layer (Redis)
- [ ] Multiple AI model support
- [ ] Batch parsing support
- [ ] WebSocket support for real-time parsing
- [ ] Authentication/API keys

---

**Built with ❤️ using TypeScript, Google Generative AI, and clean architecture principles**
