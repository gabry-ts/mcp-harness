# mcp-harness

In-memory testing toolkit for MCP servers in TypeScript — supertest for MCP.

## Stack
- TypeScript (strict), Node.js >=18, ESM (`"type": "module"`)
- Build: tsup (dual CJS/ESM with .d.ts)
- Test: vitest (globals: true, testTimeout: 15000)
- Format: prettier (singleQuote, trailingComma all, printWidth 100)
- Dependencies: @modelcontextprotocol/sdk (runtime), zod (dev)

## Commands
- `npm run build` — build with tsup (outputs dist/)
- `npm run dev` — build in watch mode
- `npm test` — run vitest
- `npm run test:watch` — run vitest in watch mode
- `npm run lint` — check formatting with prettier
- `npm run format` — fix formatting with prettier
- `npm run changeset` — create a changeset
- `npm run version` — version packages from changesets
- `npm run release` — build and publish to npm

## Project Structure
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

## Conventions
- Entry points: src/index.ts (main), src/assertions.ts (assertion helpers)
- Exports map: `.` and `./assertions` with dual ESM/CJS + types
- tsup outputs `.js` (ESM) and `.cjs` (CJS) — not `.mjs`
- Local imports require `.js` extension (Node16 module resolution)
- Test fixtures in test/fixtures/
- Examples in examples/
