# URL Shortener Service — Junior Developer Test

## Overview

You are given an existing **Node.js REST API boilerplate** built with **Koa 2**. The codebase is written in **JavaScript (ES6)** and follows a layered architecture: server → middleware → controller → core (validation, authorization).

Your task has **two phases**:

1. **Convert the entire codebase to TypeScript** — types, interfaces, proper typing.
2. **Implement a URL shortener feature** on top of the converted TypeScript codebase.

Read the entire document before starting.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Repository Structure](#repository-structure)
- [Understanding the Existing Codebase](#understanding-the-existing-codebase)
- [Phase 1: TypeScript Migration](#phase-1-typescript-migration)
- [Phase 2: URL Shortener Implementation](#phase-2-url-shortener-implementation)
- [Acceptance Criteria](#acceptance-criteria)
- [Deliverables](#deliverables)
- [Evaluation Rubric](#evaluation-rubric)
- [Submission Instructions](#submission-instructions)

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** or **yarn**
- **MongoDB** instance (local or remote, e.g., MongoDB Atlas free tier)
- Basic familiarity with:
  - TypeScript
  - Koa.js or Express.js
  - MongoDB
  - REST API design

---

## Repository Structure (Before)

```
.
├── index.js                          # Entry point
├── package.json
├── app.yaml                          # GAE deployment config
├── commitlint.config.js
├── .eslintrc.json
├── .gcloudignore
├── .gitignore
├── README.md
├── LICENSE
└── src/
    ├── common/
    │   ├── crypto.js                 # JWT helpers
    │   ├── errors.js                 # Custom error classes
    │   └── utils.js                  # General utilities
    ├── config/
    │   ├── index.js                  # Config loader (env-based)
    │   ├── config.dev.js             # Dev config
    │   ├── config.prod.js            # Prod config
    │   ├── constants/
    │   │   └── index.js
    │   ├── keys/
    │   │   └── .keep
    │   └── locales/
    │       ├── en.json
    │       ├── ar.json
    │       └── _.json
    ├── controllers/
    │   └── index.js                  # Root controller (/, /live, /ready)
    ├── core/
    │   ├── baseController.js         # Base controller class
    │   ├── authorization/
    │   │   ├── index.js              # ACL authorization logic
    │   │   └── accessList.js         # Roles & resources definition
    │   └── validation/
    │       ├── index.js              # AJV validation wrapper
    │       └── schemas.js           # JSON schemas
    ├── public/
    │   └── img/
    │       └── 404.png
    └── server/
        ├── index.js                  # Server class (Koa setup)
        ├── hooks/
        │   ├── index.js
        │   ├── context/
        │   │   └── index.js
        │   └── global/
        │       ├── index.js
        │       └── logger.js         # Pino logger setup
        └── middlewares/
            ├── index.js              # Middleware pipeline
            ├── authentication.js     # JWT authentication
            ├── routes.js             # Route builder from controllers
            ├── request/
            │   ├── index.js
            │   ├── logger.js         # Request logger
            │   ├── multipart.js      # File upload handler
            │   └── interceptors/
            │       ├── index.js
            │       ├── headerParser.js
            │       ├── mongoSanitizer.js
            │       └── queryParser.js
            └── response/
                ├── index.js
                ├── error.js          # Global error handler
                ├── notFound.js       # 404 handler
                └── interceptors/
                    └── index.js
```

---

## Understanding the Existing Codebase

Read and understand every file before you start. Here is what each layer does:

### Entry Point (`index.js`)
Creates a `Server` instance with imported hooks and middlewares, then calls `start()`.

### Server Layer (`src/server/`)
- **`src/server/index.js`** — A `Server` class that wraps Koa. It:
  - Creates a Koa app with i18n localization
  - Applies global hooks (functions attached to `global.Api`)
  - Applies context hooks (functions attached to `ctx`)
  - Runs the middleware pipeline in order
  - Starts an HTTP server
- **`src/server/hooks/`** — System hooks. Currently only a pino logger registered as `global.Api.log`.
- **`src/server/middlewares/`** — Koa middleware pipeline (order matters):
  1. `error` — Catches all thrown errors and returns JSON
  2. `compress` — Gzip/brotli compression
  3. `response/interceptors` — Post-response hook (currently a no-op passthrough)
  4. `request/logger` — Logs each request with status, method, URL, and duration
  5. `cors` — CORS headers
  6. `koa-body` — Body parser
  7. `request/interceptors` — Parses headers, query strings, sanitizes MongoDB operators
  8. `authentication` — JWT verification (currently referenced but incomplete)
  9. `routes` — Auto-builds routes from controllers
  10. `notFound` — Throws 404 for unmatched routes

### Controller Layer (`src/controllers/`)
- **`src/controllers/index.js`** — A controller that registers routes on `/`, `/live`, `/ready`.
- Each controller extends `BaseController` and defines `routes`, `name`, `path`.

### Core Layer (`src/core/`)
- **`baseController.js`** — Provides `beforeAction`, `afterAction`, `authorize()`, and `validate()` methods.
- **`authorization/`** — ACL-based authorization using `accesscontrol` library. Defines roles (`internal`, `public`) and resources.
- **`validation/`** — Wraps AJV for JSON schema validation.

### Common Layer (`src/common/`)
- **`crypto.js`** — JWT sign/verify helpers using `jsonwebtoken`.
- **`errors.js`** — Custom error classes: `BaseError`, `NotFoundError`, `UnauthenticatedError`, `UnauthorizedError`, `ValidationError`, `MethodNotImplementedError`, `UnexpectedError`. Each has `status`, `code`, `name`, `message`.
- **`utils.js`** — Misc helpers: `inDevelopment()`, `isObject()`, `parseBoolean()`, `parseInt()`, `merge()`.

### Config Layer (`src/config/`)
- Loads config based on `NODE_ENV` (development/production).
- Exposes `api`, `common`, `locales`, `authentication` settings.

---

## Phase 1: TypeScript Migration

Convert every `.js` file to `.ts` with proper typing. Do not change runtime behavior.

### Requirements

1. **Rename all `.js` files to `.ts`**.
2. **Install TypeScript dependencies**:
   - `typescript`
      - `@types/node`
         - `@types/koa`, `@types/koa-router`, `@types/koa-body`, `@types/koa-compress`, `@types/koa__cors`, `@types/koa__multer`
            - `@types/jsonwebtoken`, `@types/lodash`, `@types/multer`, `@types/bson`
               - `ts-node` (for development)
               3. **Create `tsconfig.json`**:
                  - Target: `ES2020`
                     - Module: `commonjs`
                        - Strict mode enabled
                           - `outDir: ./dist`
                              - `rootDir: ./src`
                                 - `esModuleInterop: true`
                                    - `resolveJsonModule: true`
                                    4. **Type every module**:
                                       - Add proper TypeScript types/interfaces for all function parameters, return values, class properties.
                                          - Replace `require` with `import` / `export`.
                                             - Use `import type` where applicable.
                                             5. **Create type declaration files** where needed:
                                                - Global augmentations for `global.Api` (the logger, etc.)
                                                   - Koa context extensions (`ctx._locals`)
                                                      - Custom error classes
                                                      6. **Do NOT**:
                                                         - Change runtime logic or behavior
                                                            - Remove or restructure files
                                                               - Add new dependencies beyond what is listed above

### Migration Checklist

| File | Status |
|------|--------|
| `src/common/errors.js` → `.ts` | ☐ |
| `src/common/utils.js` → `.ts` | ☐ |
| `src/common/crypto.js` → `.ts` | ☐ |
| `src/config/index.js` → `.ts` | ☐ |
| `src/config/config.dev.js` → `.ts` | ☐ |
| `src/config/config.prod.js` → `.ts` | ☐ |
| `src/config/constants/index.js` → `.ts` | ☐ |
| `src/controllers/index.js` → `.ts` | ☐ |
| `src/core/baseController.js` → `.ts` | ☐ |
| `src/core/authorization/index.js` → `.ts` | ☐ |
| `src/core/authorization/accessList.js` → `.ts` | ☐ |
| `src/core/validation/index.js` → `.ts` | ☐ |
| `src/core/validation/schemas.js` → `.ts` | ☐ |
| `src/server/index.js` → `.ts` | ☐ |
| `src/server/hooks/index.js` → `.ts` | ☐ |
| `src/server/hooks/context/index.js` → `.ts` | ☐ |
| `src/server/hooks/global/index.js` → `.ts` | ☐ |
| `src/server/hooks/global/logger.js` → `.ts` | ☐ |
| `src/server/middlewares/index.js` → `.ts` | ☐ |
| `src/server/middlewares/routes.js` → `.ts` | ☐ |
| `src/server/middlewares/authentication.js` → `.ts` | ☐ |
| `src/server/middlewares/request/index.js` → `.ts` | ☐ |
| `src/server/middlewares/request/logger.js` → `.ts` | ☐ |
| `src/server/middlewares/request/multipart.js` → `.ts` | ☐ |
| `src/server/middlewares/request/interceptors/index.js` → `.ts` | ☐ |
| `src/server/middlewares/request/interceptors/headerParser.js` → `.ts` | ☐ |
| `src/server/middlewares/request/interceptors/queryParser.js` → `.ts` | ☐ |
| `src/server/middlewares/request/interceptors/mongoSanitizer.js` → `.ts` | ☐ |
| `src/server/middlewares/response/index.js` → `.ts` | ☐ |
| `src/server/middlewares/response/error.js` → `.ts` | ☐ |
| `src/server/middlewares/response/notFound.js` → `.ts` | ☐ |
| `src/server/middlewares/response/interceptors/index.js` → `.ts` | ☐ |
| `index.js` → `index.ts` | ☐ |

---

## Phase 2: URL Shortener Implementation

After the TypeScript migration is complete and compiles without errors, implement a full URL shortener service.

### Feature Requirements

#### 1. Database Setup
- Add MongoDB connection logic (use the existing `mongodb` driver in the project, or switch to `mongoose` if preferred — document the decision).
- Connect to MongoDB on server startup.
- Handle connection errors gracefully.

#### 2. URL Model
Create a data model / collection for shortened URLs with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated |
| `shortCode` | string | Unique short identifier (e.g., `abc123`) — indexed |
| `originalUrl` | string | The original long URL |
| `visits` | number | Counter of how many times it was accessed (default 0) |
| `createdAt` | Date | Timestamp of creation |
| `updatedAt` | Date | Timestamp of last update |
| `expiresAt` | Date? | Optional expiration date (nullable) |

#### 3. API Endpoints

Implement the following endpoints:

**`POST /api/urls`** — Create a shortened URL

- Request body:
  ```json
  {
    "originalUrl": "https://example.com/very/long/path",
    "expiresAt": "2026-12-31T23:59:59Z" (optional)
  }
  ```
- Response (201):
  ```json
  {
    "shortCode": "abc123",
    "originalUrl": "https://example.com/very/long/path",
    "shortUrl": "http://localhost:8080/abc123",
    "createdAt": "2026-05-27T12:00:00Z",
    "expiresAt": null
  }
  ```
- Validation:
  - `originalUrl` is required and must be a valid URL
  - If `expiresAt` is provided, it must be a future date
  - Generate a unique short code (see [Code Generation](#4-code-generation))

**`GET /api/urls`** — List all URLs (with pagination)

- Uses the existing query parser (`page`, `limit`, `sort`, `projection`)
- Response (200):
  ```json
  {
    "data": [...],
    "page": 1,
    "limit": 10,
    "total": 42
  }
  ```

**`GET /api/urls/:shortCode`** — Get URL details

- Response (200): Full URL object
- Response (404): If not found or expired -******** edit the error

**`PUT /api/urls/:shortCode`** — Update a URL

- Allowed updates: `originalUrl`, `expiresAt`
- Response (200): Updated URL object

**`DELETE /api/urls/:shortCode`** — Delete a URL

- Response (204): No content

**`GET /:shortCode`** — Redirect to original URL (the actual shortener)

- Look up the short code
- Increment the `visits` counter
- If expired, return 410 Gone
- Redirect (302) to the original URL

#### 4. Code Generation

Implement a short code generation algorithm. Options (choose one):

| Method | Example | Notes |
|--------|---------|-------|
| **nanoid-style** | `V1StGXR8_Z5jdHi6B-myT` | Random URL-safe string, 8-10 chars |
| **hashids** | `3kq7` | Already a dependency! Encode a counter |
| **Base62 encoding** | `a3F2z` | Encode a MongoDB ObjectId or incrementing counter |
| **Hash-based** | `abc123` | MD5/SHA256 of URL, take first N chars |

Requirements:
- Generated codes must be **unique** (handle collisions).
- Collision probability must be acceptably low for the expected scale.
- Minimum 6 characters, maximum 10 characters.

#### 5. ACL Integration

Extend the existing ACL system:
- Add a new resource `url` in `accessList.js`
- `internal` role: full CRUD (`create:any`, `read:any`, `update:any`, `delete:any`)
- `public` role: `read:any` only (can read but not create/update/delete)

Since there is no real user auth flow, hardcode a fallback:
- Requests with header `x-internal: true` → internal role
- All other requests → public role

Apply authorization in the URL controller using `this.authorize()`.

#### 6. Validation

Use the existing AJV validation system (`this.validate()`) with JSON schemas for:
- `createUrlSchema`
- `updateUrlSchema`
- `getUrlSchema` (by short code)

#### 7. Link Expiration

- URLs with `expiresAt` in the past are considered expired.
- Expired URLs:
  - Are excluded from `GET /api/urls` listing
  - Return `404` on `GET /api/urls/:shortCode`
  - Return `410 Gone` on `GET /:shortCode` redirect
- Expired URLs are **not** deleted from the database (soft-expire).

#### 8. Additional Considerations

- **Idempotency**: Creating the same `originalUrl` twice should return two different short codes (each is unique).
- **Input sanitization**: The existing `mongoSanitizer` middleware protects against `$` operator injection.
- **Error handling**: Use the existing error classes (`NotFoundError`, `ValidationError`, etc.)
- **Logging**: Use `Api.log` for request logging (already wired).

---

## Deliverables

1. A **GitHub repository** (or equivalent) containing:
   - All TypeScript source files (migrated from the original JS)
   - The URL shortener implementation
   - `tsconfig.json`
   - Updated `package.json` with new scripts and dependencies

2. Scripts in `package.json`:
   - `npm run build` — Compiles TypeScript to `dist/`
   - `npm run start` — Runs the compiled output
   - `npm run dev` — Runs with `ts-node` for development

3. A **brief summary** (in the PR description or a separate `NOTES.md`) covering:
   - What decisions you made and why
   - Any trade-offs or shortcuts
   - What you would improve given more time

---

## Acceptance Criteria

The project must meet these criteria to be considered complete:

1. **TypeScript compilation** produces zero errors (`npm run build` passes).
2. **The server starts** and responds to requests.
3. **`POST /api/urls`** creates a URL and returns 201.
4. **`GET /api/urls`** returns a paginated list.
5. **`GET /api/urls/:shortCode`** returns a single URL.
6. **`PUT /api/urls/:shortCode`** updates a URL.
7. **`DELETE /api/urls/:shortCode`** deletes a URL (204).
8. **`GET /:shortCode`** redirects (302) to the original URL.
9. **Expired URLs** return 410 on redirect and 404 on detail.
10. **Collision-resistant** short code generation.
11. **ACL** restricts write operations for public requests.
12. **Validation** rejects invalid input with 400.

---

## Suggested Task Breakdown

If you want to organise your work, here is a suggested order:

### Phase 1: TypeScript Migration

| # | Task | Est. Time |
|---|------|-----------|
| 1.1 | Install TypeScript and `@types/*` packages | 10 min |
| 1.2 | Create `tsconfig.json` | 5 min |
| 1.3 | Convert `src/common/` (errors, utils, crypto) — no Koa deps | 30 min |
| 1.4 | Convert `src/config/` (no framework deps) | 15 min |
| 1.5 | Convert `src/core/` (baseController, authorization, validation) | 45 min |
| 1.6 | Convert `src/server/hooks/` (logger) | 10 min |
| 1.7 | Convert `src/server/middlewares/` — the bulk of the work | 60 min |
| 1.8 | Convert `src/server/index.js` and `src/controllers/` | 30 min |
| 1.9 | Convert entry `index.js` | 5 min |
| 1.10 | Fix all TypeScript errors, verify `npx tsc --noEmit` passes | 45 min |

### Phase 2: URL Shortener

| # | Task | Est. Time |
|---|------|-----------|
| 2.1 | Add MongoDB connection logic to server startup | 20 min |
| 2.2 | Create URL model/interface and a repository/dal layer | 30 min |
| 2.3 | Implement short code generation | 20 min |
| 2.4 | Create URL controller with CRUD endpoints | 45 min |
| 2.5 | Implement redirect endpoint (`GET /:shortCode`) | 20 min |
| 2.6 | Add validation schemas for URL endpoints | 15 min |
| 2.7 | Integrate ACL for URL resource | 15 min |
| 2.8 | Handle expiration logic | 15 min |
| 2.9 | Test everything end-to-end | 30 min |

**Total estimated time: ~7-8 hours**

---

## Evaluation Rubric

Your submission will be evaluated on:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **TypeScript correctness** | 20% | Types are used properly, no `any` abuse, strict mode compliance |
| **Migration completeness** | 15% | Every file is converted, no JS files left behind |
| **API correctness** | 20% | All endpoints work as specified |
| **Code quality** | 15% | Clean code, follows existing patterns, error handling |
| **Short code design** | 10% | Collision-resistant, appropriate length, justified choice |
| **ACL & Validation** | 10% | Properly integrated with existing systems |
| **Edge cases** | 10% | Expiration, 404, 410, duplicate URLs, invalid input |

---

## Tips

- **Read the codebase thoroughly first.** Understanding the existing patterns will save you time.
- **The `BaseController` is your friend.** Use `this.validate()` and `this.authorize()` instead of reinventing.
- **The route builder auto-discovers routes** from your controller's `routes` array. Follow the pattern in `controllers/index.js`.
- **TypeScript strict mode is required.** Use `strict: true` in `tsconfig.json`. This means no implicit `any`, strict null checks, etc.
- **Handle the `expiresAt` edge case** early. If stored as a string, convert it properly.
- **Write your short code generation as a separate utility** in `src/common/` for testability.
- **Commit frequently.** Multiple small commits are better than one giant one.
