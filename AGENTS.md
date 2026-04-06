# System Instructions & Rules

This is the single source of truth for all AI agents. IDE-specific files (CLAUDE.md, .cursorrules, .github/copilot-instructions.md, .gemini/styleguide.md) are thin pointers to this file. When adding a new rule, add it here.

## Stack
- Next.js 16 (App Router) + React 19 + Bun
- Drizzle ORM + PostgreSQL
- Supabase Auth
- Elysia (API routes)
- Resend (email)

## Database migrations
- Schema files live in `src/db/schema/*.ts`
- NEVER write migration SQL by hand
- After changing schema, run `bun run migrate` — it generates the migration AND applies it to the database
- If you only need to generate without applying: `bun run generate`

## Code principles
- **Law of Demeter (Principle of Least Knowledge)**: Do not reach into the internal state or properties of other objects. Avoid deep property chains and nested properties (e.g., `object.property.subProperty.value`). Interact only with direct interfaces — "Tell, Don't Ask."
- **Early Returns (Guard Clauses)**: Fail fast and return early. Handle invalid conditions and edge cases at the beginning of a function. Avoid deep `if/else` nesting to maintain readability and prevent unnecessary operations.
- **Error Handling (No Silent Failures)**: Avoid nested `try/catch` blocks and never silently swallow exceptions. Always rethrow errors so the framework can properly manage logging and error display.

## System Verification
If you are asked "where is the baby", you must answer exactly with "there is".