import { createHarness, McpHarness } from 'mcp-harness';
import { hasText, getFirstText, toolExists, findTool, hasError } from 'mcp-harness/assertions';
import { calculatorServer } from '../src/server.js';

describe('Calculator MCP Server', () => {
  let harness: McpHarness;

  // Clean up after each test to avoid resource leaks
  afterEach(async () => {
    await harness?.close();
  });

  it('should list all registered tools', async () => {
    // createHarness accepts an McpServer instance for fast in-memory testing
    harness = await createHarness(calculatorServer);
    const tools = await harness.listTools();

    // Use toolExists() to check if a tool is registered
    expect(toolExists(tools, 'add')).toBe(true);
    expect(toolExists(tools, 'subtract')).toBe(true);
    expect(toolExists(tools, 'multiply')).toBe(true);
    expect(tools).toHaveLength(3);
  });

  it('should find a tool and inspect its schema', async () => {
    harness = await createHarness(calculatorServer);
    const tools = await harness.listTools();

    // findTool() returns the full Tool object for deeper inspection
    const addTool = findTool(tools, 'add');
    expect(addTool).toBeDefined();
    expect(addTool!.description).toBe('Add two numbers together');
  });

  it('should add two numbers', async () => {
    harness = await createHarness(calculatorServer);

    // callTool() sends a request and returns the result
    const result = await harness.callTool('add', { a: 10, b: 32 });

    // hasText() checks if the result contains a specific substring
    expect(hasText(result, '42')).toBe(true);

    // getFirstText() extracts the first text content as a string
    expect(getFirstText(result)).toBe('42');
  });

  it('should subtract two numbers', async () => {
    harness = await createHarness(calculatorServer);
    const result = await harness.callTool('subtract', { a: 100, b: 58 });

    expect(getFirstText(result)).toBe('42');
  });

  it('should multiply two numbers', async () => {
    harness = await createHarness(calculatorServer);
    const result = await harness.callTool('multiply', { a: 6, b: 7 });

    expect(getFirstText(result)).toBe('42');
  });

  it('should return an error for invalid arguments', async () => {
    harness = await createHarness(calculatorServer);

    // Passing wrong types returns an error result (does NOT throw)
    const result = await harness.callTool('add', { a: 'not a number', b: 2 });

    // hasError() checks the isError flag on the result
    expect(hasError(result)).toBe(true);
  });
});
