import assert from 'node:assert/strict';
import { createHarness } from 'mcp-harness';
import { hasText, getFirstText, toolExists } from 'mcp-harness/assertions';
import { greetServer } from './server.js';

async function main() {
  const harness = await createHarness(greetServer);

  try {
    // Test: list tools returns the greet tool
    const tools = await harness.listTools();
    assert.ok(toolExists(tools, 'greet'), 'greet tool should exist');
    assert.equal(tools.length, 1, 'should have exactly 1 tool');

    // Test: call greet tool returns correct greeting
    const result = await harness.callTool('greet', { name: 'World' });
    assert.ok(hasText(result, 'Hello, World!'), 'result should contain greeting');
    assert.equal(getFirstText(result), 'Hello, World!', 'first text should be the greeting');

    // Test: call with different name
    const result2 = await harness.callTool('greet', { name: 'MCP' });
    assert.equal(getFirstText(result2), 'Hello, MCP!', 'should greet MCP');

    // Test: invalid args returns error
    const errResult = await harness.callTool('greet', {});
    assert.equal(errResult.isError, true, 'missing name should return error');

    console.log('All tests passed');
  } finally {
    await harness.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
