/**
 * Options for creating an MCP harness instance.
 */
export interface HarnessOptions {
  /** Connection timeout in milliseconds. */
  timeout?: number;
  /** Client name sent during initialization. Defaults to 'mcp-harness'. */
  clientName?: string;
  /** Client version sent during initialization. Defaults to '0.1.0'. */
  clientVersion?: string;
  /** Additional client capabilities to advertise. */
  clientCapabilities?: object;
}

/**
 * Configuration for launching an MCP server as a subprocess.
 */
export interface SubprocessConfig {
  /** Command to execute (e.g. 'node', 'npx'). */
  command: string;
  /** Arguments to pass to the command. */
  args?: string[];
  /** Environment variables to set for the subprocess. */
  env?: Record<string, string>;
  /** Working directory for the subprocess. */
  cwd?: string;
}

/**
 * Type guard to check if a value is a SubprocessConfig.
 */
export function isSubprocessConfig(value: unknown): value is SubprocessConfig {
  return typeof value === 'object' && value !== null && 'command' in value;
}
