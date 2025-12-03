import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { McpHarness } from './harness.js';
import type { SubprocessConfig, HarnessOptions } from './types.js';

export async function createSubprocessHarness(
  config: SubprocessConfig,
  options?: HarnessOptions,
): Promise<McpHarness> {
  const transport = new StdioClientTransport({
    command: config.command,
    args: config.args,
    env: config.env ? ({ ...process.env, ...config.env } as Record<string, string>) : undefined,
    cwd: config.cwd,
    stderr: 'pipe',
  });

  const client = new Client({
    name: options?.clientName ?? 'mcp-harness',
    version: options?.clientVersion ?? '0.1.0',
  });

  if (options?.timeout) {
    await Promise.race([
      client.connect(transport),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Harness connection timed out')), options.timeout),
      ),
    ]);
  } else {
    await client.connect(transport);
  }

  const cleanup = async () => {
    await transport.close();
  };

  return new McpHarness(client, cleanup);
}
