import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

export const envServer = new McpServer({ name: 'env-server', version: '1.0.0' });

envServer.tool('get-env', { key: z.string() }, ({ key }) => ({
  content: [{ type: 'text', text: process.env[key] ?? 'undefined' }],
}));

envServer.tool('get-cwd', {}, () => ({
  content: [{ type: 'text', text: process.cwd() }],
}));

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  const transport = new StdioServerTransport();
  await envServer.connect(transport);
}
