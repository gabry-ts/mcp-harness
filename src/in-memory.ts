import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpHarness } from './harness.js';
import type { HarnessOptions } from './types.js';

export async function createInMemoryHarness(
  server: McpServer,
  options?: HarnessOptions,
): Promise<McpHarness> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await server.connect(serverTransport);

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
        client.connect(clientTransport),
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
    await client.connect(clientTransport);
  }

  const cleanup = async () => {
    await client.close();
    await server.close();
  };

  return new McpHarness(client, cleanup, options?.timeout);
}
