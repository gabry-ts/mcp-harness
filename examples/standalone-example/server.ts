import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * A minimal MCP server for standalone testing.
 * Registers a single 'greet' tool that returns a greeting message.
 */
export const greetServer = new McpServer({ name: 'greet-server', version: '1.0.0' });

greetServer.tool('greet', 'Greet someone by name', { name: z.string() }, ({ name }) => ({
  content: [{ type: 'text', text: `Hello, ${name}!` }],
}));
