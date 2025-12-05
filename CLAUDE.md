# Ralph Agent Instructions

You are an autonomous coding agent working on a software project.

## Your Task

1. Read the PRD at `prd.json` (in the same directory as this file)
2. Read the progress log at `progress.txt` (check Codebase Patterns section first)
3. Check you're on the correct branch from PRD `branchName`. If not, check it out or create from main.
4. Pick the **highest priority** user story where `passes: false`
5. Implement that single user story
6. Run quality checks (e.g., typecheck, lint, test - use whatever your project requires)
7. Update CLAUDE.md files if you discover reusable patterns (see below)
8. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
9. Update the PRD to set `passes: true` for the completed story
10. Append your progress to `progress.txt`

## Progress Report Format

APPEND to progress.txt (never replace, always append):
```
## [Date/Time] - [Story ID]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered (e.g., "this codebase uses X for Y")
  - Gotchas encountered (e.g., "don't forget to update Z when changing W")
  - Useful context (e.g., "the evaluation panel is in component X")
---
```

The learnings section is critical - it helps future iterations avoid repeating mistakes and understand the codebase better.

## Consolidate Patterns

If you discover a **reusable pattern** that future iterations should know, add it to the `## Codebase Patterns` section at the TOP of progress.txt (create it if it doesn't exist). This section should consolidate the most important learnings:

```
## Codebase Patterns
- Example: Use `sql<number>` template for aggregations
- Example: Always use `IF NOT EXISTS` for migrations
- Example: Export types from actions.ts for UI components
```

Only add patterns that are **general and reusable**, not story-specific details.

## Update CLAUDE.md Files

Before committing, check if any edited files have learnings worth preserving in nearby CLAUDE.md files:

1. **Identify directories with edited files** - Look at which directories you modified
2. **Check for existing CLAUDE.md** - Look for CLAUDE.md in those directories or parent directories
3. **Add valuable learnings** - If you discovered something future developers/agents should know:
   - API patterns or conventions specific to that module
   - Gotchas or non-obvious requirements
   - Dependencies between files
   - Testing approaches for that area
   - Configuration or environment requirements

**Examples of good CLAUDE.md additions:**
- "When modifying X, also update Y to keep them in sync"
- "This module uses pattern Z for all API calls"
- "Tests require the dev server running on PORT 3000"
- "Field names must match the template exactly"

**Do NOT add:**
- Story-specific implementation details
- Temporary debugging notes
- Information already in progress.txt

Only update CLAUDE.md if you have **genuinely reusable knowledge** that would help future work in that directory.

## Quality Requirements

- ALL commits must pass your project's quality checks (typecheck, lint, test)
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing code patterns

## Browser Testing (If Available)

For any story that changes UI, verify it works in the browser if you have browser testing tools configured (e.g., via MCP):

1. Navigate to the relevant page
2. Verify the UI changes work as expected
3. Take a screenshot if helpful for the progress log

If no browser tools are available, note in your progress report that manual browser verification is needed.

## Stop Condition

After completing a user story, check if ALL stories have `passes: true`.

If ALL stories are complete and passing, reply with:
<promise>COMPLETE</promise>

If there are still stories with `passes: false`, end your response normally (another iteration will pick up the next story).

## Important

- Work on ONE story per iteration
- Commit frequently
- Keep CI green
- Read the Codebase Patterns section in progress.txt before starting

## Project: mcp-harness

In-memory testing toolkit for MCP servers in TypeScript — supertest for MCP.

### Stack
- TypeScript (strict), Node.js >=18, ESM (`"type": "module"`)
- Build: tsup (dual CJS/ESM with .d.ts)
- Test: vitest (globals: true, testTimeout: 15000)
- Format: prettier (singleQuote, trailingComma all, printWidth 100)
- Dependencies: @modelcontextprotocol/sdk (runtime), zod (dev)

### Commands
- `npm run build` — build with tsup (outputs dist/)
- `npm run dev` — build in watch mode
- `npm test` — run vitest
- `npm run test:watch` — run vitest in watch mode
- `npm run lint` — check formatting with prettier
- `npm run format` — fix formatting with prettier
- `npm run changeset` — create a changeset
- `npm run version` — version packages from changesets
- `npm run release` — build and publish to npm

### Project Structure
```
src/
  index.ts          — main entry point, re-exports public API
  assertions.ts     — framework-agnostic assertion helpers
  types.ts          — HarnessOptions, SubprocessConfig, isSubprocessConfig
  harness.ts        — McpHarness class, createHarness factory
  in-memory.ts      — in-memory transport mode
  subprocess.ts     — subprocess/stdio transport mode
test/
  in-memory.test.ts — in-memory mode tests
  subprocess.test.ts — subprocess mode tests
  lifecycle.test.ts — close/timeout tests
  assertions.test.ts — assertion helper unit tests
  edge-cases.test.ts — edge case tests
  fixtures/
    echo-server.ts  — tool/resource/prompt test fixture
    error-server.ts — error scenario fixture
    slow-server.ts  — timeout test fixture
    env-server.ts   — env/cwd test fixture
examples/
  vitest-example/   — Vitest usage example
  jest-example/     — Jest usage example
  standalone-example/ — node:assert usage example
```

### Conventions
- Entry points: src/index.ts (main), src/assertions.ts (assertion helpers)
- Exports map: `.` and `./assertions` with dual ESM/CJS + types
- tsup outputs `.js` (ESM) and `.cjs` (CJS) — not `.mjs`
- Local imports require `.js` extension (Node16 module resolution)
- Test fixtures in test/fixtures/
- Examples in examples/
