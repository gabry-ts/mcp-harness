import { describe, it, expect, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createHarness, McpHarness } from '../src/index.js';
import { hasText, getFirstText, hasError } from '../src/assertions.js';
import { echoServer } from './fixtures/echo-server.js';
import { errorServer } from './fixtures/error-server.js';

describe('in-memory harness', () => {
  let harness: McpHarness;

  afterEach(async () => {
    await harness?.close();
  });

  it('creates harness from McpServer instance', async () => {
    harness = await createHarness(echoServer);
    expect(harness).toBeInstanceOf(McpHarness);
  });

  it('lists all registered tools', async () => {
    harness = await createHarness(echoServer);
    const tools = await harness.listTools();
    expect(tools).toHaveLength(2);
    expect(tools.map((t) => t.name).sort()).toEqual(['add', 'echo']);
  });

  it('calls echo tool', async () => {
    harness = await createHarness(echoServer);
    const result = await harness.callTool('echo', { message: 'hello' });
    expect(hasText(result, 'hello')).toBe(true);
    expect(getFirstText(result)).toBe('hello');
  });

  it('calls add tool', async () => {
    harness = await createHarness(echoServer);
    const result = await harness.callTool('add', { a: 2, b: 3 });
    expect(getFirstText(result)).toBe('5');
  });

  it('returns error for non-existent tool', async () => {
    harness = await createHarness(echoServer);
    const result = await harness.callTool('nonexistent');
    expect(hasError(result)).toBe(true);
  });

  it('returns error for invalid arguments', async () => {
    harness = await createHarness(echoServer);
    const result = await harness.callTool('echo', { message: 123 as unknown as string });
    expect(hasError(result)).toBe(true);
  });

  it('lists resources', async () => {
    harness = await createHarness(echoServer);
    const resources = await harness.listResources();
    expect(resources).toHaveLength(1);
    expect(resources[0].uri).toBe('info://version');
  });

  it('reads resource', async () => {
    harness = await createHarness(echoServer);
    const result = await harness.readResource('info://version');
    expect(result.contents).toBeDefined();
    expect(result.contents[0].text).toBe('1.0.0');
  });

  it('lists prompts', async () => {
    harness = await createHarness(echoServer);
    const prompts = await harness.listPrompts();
    expect(prompts).toHaveLength(1);
    expect(prompts[0].name).toBe('greet');
  });

  it('gets prompt with args', async () => {
    harness = await createHarness(echoServer);
    const result = await harness.getPrompt('greet', { name: 'Gab' });
    expect(result.messages).toBeDefined();
    expect(result.messages.length).toBeGreaterThan(0);
    const text =
      typeof result.messages[0].content === 'string'
        ? result.messages[0].content
        : result.messages[0].content.text;
    expect(text).toContain('Gab');
  });

  it('exposes raw MCP Client', async () => {
    harness = await createHarness(echoServer);
    expect(harness.client).toBeDefined();
    expect(harness.client).toBeInstanceOf(Client);
  });

  describe('with error-server', () => {
    it('returns isError for fail tool', async () => {
      harness = await createHarness(errorServer);
      const result = await harness.callTool('fail');
      expect(hasError(result)).toBe(true);
    });

    it('conditional-fail works both ways', async () => {
      harness = await createHarness(errorServer);
      const failResult = await harness.callTool('conditional-fail', { shouldFail: true });
      expect(hasError(failResult)).toBe(true);

      const successResult = await harness.callTool('conditional-fail', { shouldFail: false });
      expect(hasError(successResult)).toBe(false);
      expect(hasText(successResult, 'success')).toBe(true);
    });
  });
});
