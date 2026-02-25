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

  const stderrChunks: Buffer[] = [];
  transport.stderr?.on('data', (chunk: Buffer) => {
    stderrChunks.push(chunk);
  });

  const client = new Client(
    {
      name: options?.clientName ?? 'mcp-harness',
      version: options?.clientVersion ?? '0.1.0',
    },
    options?.clientCapabilities ? { capabilities: options.clientCapabilities } : undefined,
  );

  if (options?.timeout) {
    let timer: ReturnType<typeof setTimeout>;
    try {
      await Promise.race([
        client.connect(transport),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error('Harness connection timed out')),
            options.timeout,
          );
        }),
      ]);
    } finally {
      clearTimeout(timer!);
    }
  } else {
    await client.connect(transport);
  }

  const cleanup = async () => {
    await client.close();
    await transport.close();
  };

  return new McpHarness(client, cleanup, options?.timeout, () =>
    Buffer.concat(stderrChunks).toString(),
  );
}
