import { describe, it, expect, afterEach } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createHarness, McpHarness } from '../src/index.js';
import { hasText, getFirstText, hasError } from '../src/assertions.js';
import { echoServer } from './fixtures/echo-server.js';

describe('edge cases', () => {
  const harnesses: McpHarness[] = [];

  afterEach(async () => {
    await Promise.all(harnesses.map((h) => h.close()));
    harnesses.length = 0;
  });

  async function track(h: Promise<McpHarness>): Promise<McpHarness> {
    const harness = await h;
    harnesses.push(harness);
    return harness;
  }

  it('returns error when calling tool with empty args that requires args', async () => {
    const harness = await track(createHarness(echoServer));
    const result = await harness.callTool('echo', {});
    expect(hasError(result)).toBe(true);
  });

  it('succeeds when calling tool with no args on tool with no input schema', async () => {
    const server = new McpServer({ name: 'no-args-server', version: '1.0.0' });
    server.tool('ping', () => ({
      content: [{ type: 'text', text: 'pong' }],
    }));

    const harness = await track(createHarness(server));
    const result = await harness.callTool('ping');
    expect(hasError(result)).toBe(false);
    expect(getFirstText(result)).toBe('pong');
  });

  it('supports multiple harness instances simultaneously', async () => {
    const serverA = new McpServer({ name: 'server-a', version: '1.0.0' });
    serverA.tool('id', () => ({
      content: [{ type: 'text', text: 'a' }],
    }));

    const serverB = new McpServer({ name: 'server-b', version: '1.0.0' });
    serverB.tool('id', () => ({
      content: [{ type: 'text', text: 'b' }],
    }));

    const harnessA = await track(createHarness(serverA));
    const harnessB = await track(createHarness(serverB));

    const resultA = await harnessA.callTool('id');
    const resultB = await harnessB.callTool('id');

    expect(getFirstText(resultA)).toBe('a');
    expect(getFirstText(resultB)).toBe('b');
  });

  it('harness still usable after tool throws', async () => {
    const server = new McpServer({ name: 'resilient-server', version: '1.0.0' });
    server.tool('fail', () => {
      throw new Error('Intentional failure');
    });
    server.tool('echo', { message: z.string() }, ({ message }) => ({
      content: [{ type: 'text', text: message }],
    }));

    const harness = await track(createHarness(server));

    const failResult = await harness.callTool('fail');
    expect(hasError(failResult)).toBe(true);

    const echoResult = await harness.callTool('echo', { message: 'still works' });
    expect(hasError(echoResult)).toBe(false);
    expect(hasText(echoResult, 'still works')).toBe(true);
  });

  it('handles large payload', async () => {
    const harness = await track(createHarness(echoServer));
    const largeMessage = 'x'.repeat(100000);
    const result = await harness.callTool('echo', { message: largeMessage });
    expect(hasError(result)).toBe(false);
    expect(getFirstText(result)).toBe(largeMessage);
  });
});
