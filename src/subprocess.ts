import type { SubprocessConfig, HarnessOptions } from './types.js';
import type { McpHarness } from './harness.js';

export async function createSubprocessHarness(
  _config: SubprocessConfig,
  _options?: HarnessOptions,
): Promise<McpHarness> {
  throw new Error('not implemented');
}
