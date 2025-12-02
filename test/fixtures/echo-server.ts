import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

export const echoServer = new McpServer({ name: 'echo-server', version: '1.0.0' });

echoServer.tool('echo', { message: z.string() }, ({ message }) => ({
  content: [{ type: 'text', text: message }],
}));

echoServer.tool('add', { a: z.number(), b: z.number() }, ({ a, b }) => ({
  content: [{ type: 'text', text: String(a + b) }],
}));

echoServer.resource('version', 'info://version', {}, () => ({
  contents: [{ uri: 'info://version', text: '1.0.0' }],
}));

echoServer.prompt('greet', { name: z.string() }, ({ name }) => ({
  messages: [{ role: 'user', content: { type: 'text', text: `Hello, ${name}!` } }],
}));

if (process.argv[1] && import.meta.url.endsWith(process.argv[1])) {
  const transport = new StdioServerTransport();
  await echoServer.connect(transport);
}
