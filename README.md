# mcp-harness

[![npm version](https://img.shields.io/npm/v/mcp-harness.svg)](https://www.npmjs.com/package/mcp-harness)
[![CI](https://github.com/gabrielepartiti/mcp-harness/actions/workflows/ci.yml/badge.svg)](https://github.com/gabrielepartiti/mcp-harness/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> In-memory testing toolkit for MCP servers in TypeScript — supertest for MCP.

## Why

Testing MCP servers today means running them as subprocesses, connecting over stdio, and manually inspecting JSON. It's slow, flaky, and hard to integrate into CI.

**mcp-harness** gives you a fast, in-memory test harness that connects directly to your `McpServer` instance — no child processes, no ports, no IO. Just import your server, create a harness, and assert on results. Think [supertest](https://github.com/ladjs/supertest) but for the Model Context Protocol.

## Quick Start

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createHarness } from 'mcp-harness';
import { hasText, getFirstText } from 'mcp-harness/assertions';

const server = new McpServer({ name: 'my-server', version: '1.0.0' });
server.tool('greet', { name: z.string() }, async ({ name }) => ({
  content: [{ type: 'text', text: `Hello, ${name}!` }],
}));

const harness = await createHarness(server);
const result = await harness.callTool('greet', { name: 'World' });

console.log(getFirstText(result)); // "Hello, World!"
console.log(hasText(result, 'Hello')); // true

await harness.close();
```

## Installation

```bash
npm install --save-dev mcp-harness
```

**Peer dependency:** `@modelcontextprotocol/sdk` must be installed in your project.

## Usage

### In-Memory Mode

Pass your `McpServer` instance directly. Zero IO, instant startup:

```ts
import { createHarness } from 'mcp-harness';
import { myServer } from './server.js';

const harness = await createHarness(myServer);

// List tools, resources, prompts
const tools = await harness.listTools();
const resources = await harness.listResources();
const prompts = await harness.listPrompts();

// Call a tool
const result = await harness.callTool('my-tool', { arg: 'value' });

// Read a resource
const resource = await harness.readResource('info://version');

// Get a prompt
const prompt = await harness.getPrompt('my-prompt', { name: 'Gab' });

// Always close when done
await harness.close();
```

### Subprocess Mode

Test compiled servers via stdio transport, just like a real MCP client would:

```ts
import { createHarness } from 'mcp-harness';

const harness = await createHarness({
  command: 'node',
  args: ['dist/server.js'],
  env: { API_KEY: 'test-key' },
  cwd: '/path/to/project',
});

const tools = await harness.listTools();
await harness.close();
```

### Assertion Helpers

Framework-agnostic helpers for inspecting MCP results. Use with Vitest, Jest, node:assert, or any test runner:

```ts
import {
  hasText,
  getTexts,
  getFirstText,
  hasError,
  hasErrorMatching,
  toolExists,
  findTool,
  resourceExists,
  promptExists,
} from 'mcp-harness/assertions';

// Inspect tool call results
const result = await harness.callTool('echo', { message: 'hi' });
hasText(result, 'hi'); // true
getFirstText(result); // "hi"
getTexts(result); // ["hi"]

// Check for errors
hasError(result); // false
hasErrorMatching(result, /timeout/); // false

// Inspect server capabilities
const tools = await harness.listTools();
toolExists(tools, 'echo'); // true
findTool(tools, 'echo'); // Tool object or undefined

const resources = await harness.listResources();
resourceExists(resources, 'info://version'); // true

const prompts = await harness.listPrompts();
promptExists(prompts, 'greet'); // true
```

### Options

```ts
const harness = await createHarness(server, {
  timeout: 5000, // Connection/request timeout in ms
  clientName: 'my-test', // Client name for MCP handshake
  clientVersion: '1.0.0', // Client version
  clientCapabilities: {}, // Additional client capabilities
});
```

## API Reference

### `createHarness(server, options?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `server` | `McpServer \| SubprocessConfig` | Server instance or subprocess config |
| `options` | `HarnessOptions` | Optional connection settings |
| **Returns** | `Promise<McpHarness>` | Connected harness instance |

### `McpHarness`

| Method | Signature | Description |
|--------|-----------|-------------|
| `listTools()` | `() => Promise<Tool[]>` | List all registered tools |
| `callTool()` | `(name, args?) => Promise<CallToolResult>` | Call a tool by name |
| `listResources()` | `() => Promise<Resource[]>` | List all registered resources |
| `readResource()` | `(uri) => Promise<ReadResourceResult>` | Read a resource by URI |
| `listPrompts()` | `() => Promise<Prompt[]>` | List all registered prompts |
| `getPrompt()` | `(name, args?) => Promise<GetPromptResult>` | Get a prompt by name |
| `close()` | `() => Promise<void>` | Close the harness (idempotent) |
| `client` | `Client` | Raw MCP Client for advanced use |

### `HarnessOptions`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `timeout` | `number` | — | Connection/request timeout in ms |
| `clientName` | `string` | `'mcp-harness'` | Client name for handshake |
| `clientVersion` | `string` | `'0.1.0'` | Client version |
| `clientCapabilities` | `object` | — | Additional capabilities |

### `SubprocessConfig`

| Field | Type | Description |
|-------|------|-------------|
| `command` | `string` | Command to execute (`'node'`, `'npx'`) |
| `args` | `string[]` | Command arguments |
| `env` | `Record<string, string>` | Environment variables (merged with `process.env`) |
| `cwd` | `string` | Working directory |

### Assertion Helpers (`mcp-harness/assertions`)

| Function | Signature | Description |
|----------|-----------|-------------|
| `hasText()` | `(result, text) => boolean` | Check if any text block contains substring |
| `getTexts()` | `(result) => string[]` | Extract all text strings from result |
| `getFirstText()` | `(result) => string \| undefined` | Get first text string or undefined |
| `hasError()` | `(result) => boolean` | Check if result is an error |
| `hasErrorMatching()` | `(result, pattern) => boolean` | Check error matches string/RegExp |
| `toolExists()` | `(tools, name) => boolean` | Check if tool exists by name |
| `findTool()` | `(tools, name) => Tool \| undefined` | Find tool by name |
| `resourceExists()` | `(resources, uri) => boolean` | Check if resource exists by URI |
| `promptExists()` | `(prompts, name) => boolean` | Check if prompt exists by name |

## Examples

- **[Vitest example](./examples/vitest-example/)** — Full test suite with Vitest
- **[Jest example](./examples/jest-example/)** — Same tests with Jest + ESM
- **[Standalone example](./examples/standalone-example/)** — No test framework, just `node:assert`

## How It Works

In **in-memory mode**, mcp-harness uses the MCP SDK's `InMemoryTransport` to create a linked pair of transports. Your `McpServer` connects to one side, and a `Client` connects to the other. Messages flow directly through memory — no serialization, no IO, no child processes.

```
┌──────────────┐     InMemoryTransport     ┌──────────────┐
│  MCP Client   │◄════════════════════════►│  McpServer    │
│  (harness)    │    linked pair            │  (your code)  │
└──────────────┘                           └──────────────┘
```

In **subprocess mode**, the harness spawns your server as a child process and connects via `StdioClientTransport`, the same way a real MCP host would.

## Contributing

```bash
git clone https://github.com/gabrielepartiti/mcp-harness.git
cd mcp-harness
npm install
npm test
npm run build
```

## License

[MIT](./LICENSE) &copy; Gabriele Partiti
