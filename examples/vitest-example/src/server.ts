import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

/**
 * A simple calculator MCP server for demonstration purposes.
 * Registers three tools: add, subtract, and multiply.
 */
export const calculatorServer = new McpServer({ name: 'calculator', version: '1.0.0' });

calculatorServer.tool(
  'add',
  'Add two numbers together',
  { a: z.number(), b: z.number() },
  ({ a, b }) => ({
    content: [{ type: 'text', text: String(a + b) }],
  }),
);

calculatorServer.tool(
  'subtract',
  'Subtract b from a',
  { a: z.number(), b: z.number() },
  ({ a, b }) => ({
    content: [{ type: 'text', text: String(a - b) }],
  }),
);

calculatorServer.tool(
  'multiply',
  'Multiply two numbers',
  { a: z.number(), b: z.number() },
  ({ a, b }) => ({
    content: [{ type: 'text', text: String(a * b) }],
  }),
);
