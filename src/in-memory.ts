import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { HarnessOptions } from './types.js';
import type { McpHarness } from './harness.js';

export async function createInMemoryHarness(
  _server: McpServer,
  _options?: HarnessOptions,
): Promise<McpHarness> {
  throw new Error('not implemented');
}
