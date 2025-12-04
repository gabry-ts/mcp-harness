import { resolve } from 'node:path';
import { describe, it, expect, afterEach } from 'vitest';
import { createHarness, McpHarness } from '../src/index.js';
import { getFirstText } from '../src/assertions.js';
import { echoServer } from './fixtures/echo-server.js';
import { slowServer } from './fixtures/slow-server.js';

const fixturesDir = resolve(import.meta.dirname, 'fixtures');

describe('lifecycle', () => {
  let harness: McpHarness;

  afterEach(async () => {
    await harness?.close();
  });

  it('close() shuts down in-memory harness', async () => {
    harness = await createHarness(echoServer);
    await harness.close();
    await expect(harness.listTools()).rejects.toThrow('Harness is closed');
  });

  it('close() shuts down subprocess harness', async () => {
    harness = await createHarness({
      command: 'npx',
      args: ['tsx', 'test/fixtures/echo-server.ts'],
    });
    await harness.close();
    await expect(harness.listTools()).rejects.toThrow('Harness is closed');
  });

  it('close() is idempotent', async () => {
    harness = await createHarness(echoServer);
    await harness.close();
    await expect(harness.close()).resolves.toBeUndefined();
  });
});

describe('timeout', () => {
  let harness: McpHarness;

  afterEach(async () => {
    await harness?.close();
  });

  it('timeout triggers error for slow tool', async () => {
    harness = await createHarness(slowServer, { timeout: 500 });
    await expect(harness.callTool('slow', { delay: 5000 })).rejects.toThrow();
  });

  it('default timeout works for fast tool', async () => {
    harness = await createHarness(slowServer);
    const result = await harness.callTool('slow', { delay: 100 });
    expect(getFirstText(result)).toBe('done');
  });
});
