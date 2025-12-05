# Changelog

## v0.1.0

Initial release.

### Features

- **In-memory mode** — test MCP servers with zero IO using `InMemoryTransport`
- **Subprocess mode** — test compiled servers via stdio transport
- **Unified `createHarness()` factory** — auto-detects mode from `McpServer` or `SubprocessConfig`
- **`McpHarness` class** — convenience methods for `listTools`, `callTool`, `listResources`, `readResource`, `listPrompts`, `getPrompt`
- **Assertion helpers** (`mcp-harness/assertions`) — `hasText`, `getTexts`, `getFirstText`, `hasError`, `hasErrorMatching`, `toolExists`, `findTool`, `resourceExists`, `promptExists`
- **Configurable timeouts** — per-connection and per-request timeout support
- **Dual CJS/ESM output** — works in any Node.js environment
- **TypeScript-first** — full type definitions included
