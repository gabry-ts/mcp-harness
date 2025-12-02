import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

export const slowServer = new McpServer({ name: 'slow-server', version: '1.0.0' });

slowServer.tool('slow', { delay: z.number() }, async ({ delay }) => {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return {
    content: [{ type: 'text', text: 'done' }],
  };
});

slowServer.tool('infinite', {}, async () => {
  await new Promise(() => {});
  return {
    content: [{ type: 'text', text: 'never' }],
  };
});

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  const transport = new StdioServerTransport();
  await slowServer.connect(transport);
}
