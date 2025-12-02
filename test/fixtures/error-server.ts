import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

export const errorServer = new McpServer({ name: 'error-server', version: '1.0.0' });

errorServer.tool('fail', () => {
  throw new Error('Intentional failure');
});

errorServer.tool('fail-with-message', { message: z.string() }, ({ message }) => {
  throw new Error(message);
});

errorServer.tool('conditional-fail', { shouldFail: z.boolean() }, ({ shouldFail }) => {
  if (shouldFail) {
    throw new Error('Conditional failure');
  }
  return { content: [{ type: 'text', text: 'success' }] };
});

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  const transport = new StdioServerTransport();
  await errorServer.connect(transport);
}
