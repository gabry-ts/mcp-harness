import { resolve } from 'node:path';
import { describe, it, expect, afterEach } from 'vitest';
import { createHarness, McpHarness } from '../src/index.js';
import { hasText, getFirstText } from '../src/assertions.js';

const fixturesDir = resolve(import.meta.dirname, 'fixtures');

describe('subprocess harness', () => {
  let harness: McpHarness;

  afterEach(async () => {
    await harness?.close();
  });

  it('creates harness from subprocess command', async () => {
    harness = await createHarness({
      command: 'npx',
      args: ['tsx', 'test/fixtures/echo-server.ts'],
    });
    expect(harness).toBeInstanceOf(McpHarness);
  });

  it('lists tools via subprocess', async () => {
    harness = await createHarness({
      command: 'npx',
      args: ['tsx', 'test/fixtures/echo-server.ts'],
    });
    const tools = await harness.listTools();
    expect(tools).toHaveLength(2);
    expect(tools.map((t) => t.name).sort()).toEqual(['add', 'echo']);
  });

  it('calls tool via subprocess', async () => {
    harness = await createHarness({
      command: 'npx',
      args: ['tsx', 'test/fixtures/echo-server.ts'],
    });
    const result = await harness.callTool('echo', { message: 'hello' });
    expect(hasText(result, 'hello')).toBe(true);
    expect(getFirstText(result)).toBe('hello');
  });

  it('passes environment variables', async () => {
    harness = await createHarness({
      command: 'npx',
      args: ['tsx', 'test/fixtures/env-server.ts'],
      env: { MY_VAR: 'test123' },
    });
    const result = await harness.callTool('get-env', { key: 'MY_VAR' });
    expect(getFirstText(result)).toBe('test123');
  });

  it('passes cwd', async () => {
    harness = await createHarness({
      command: 'npx',
      args: ['tsx', resolve(fixturesDir, 'env-server.ts')],
      cwd: '/tmp',
    });
    const result = await harness.callTool('get-cwd', {});
    const cwd = getFirstText(result);
    expect(cwd).toBeDefined();
    expect(cwd!).toContain('tmp');
  });
});
