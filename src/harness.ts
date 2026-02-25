import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type {
  CallToolResult,
  ReadResourceResult,
  GetPromptResult,
  Tool,
  Resource,
  ResourceTemplate,
  Prompt,
  ServerCapabilities,
} from '@modelcontextprotocol/sdk/types.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { HarnessOptions, SubprocessConfig } from './types.js';
import { isSubprocessConfig } from './types.js';

export class McpHarness {
  private _closed = false;
  private _closing: Promise<void> | null = null;
  private _requestTimeout?: number;
  private _getStderr?: () => string;

  constructor(
    private _client: Client,
    private _cleanup: () => Promise<void>,
    requestTimeout?: number,
    getStderr?: () => string,
  ) {
    this._requestTimeout = requestTimeout;
    this._getStderr = getStderr;
  }

  get client(): Client {
    return this._client;
  }

  get stderr(): string | undefined {
    return this._getStderr?.();
  }

  private assertOpen(): void {
    if (this._closed) {
      throw new Error('Harness is closed');
    }
  }

  private get _reqOpts(): { timeout: number } | undefined {
    return this._requestTimeout ? { timeout: this._requestTimeout } : undefined;
  }

  async listTools(): Promise<Tool[]> {
    this.assertOpen();
    const result = await this._client.listTools(undefined, this._reqOpts);
    return result.tools;
  }

  async callTool(name: string, args?: Record<string, unknown>): Promise<CallToolResult> {
    this.assertOpen();
    const result = await this._client.callTool({ name, arguments: args }, undefined, this._reqOpts);
    return result as CallToolResult;
  }

  async listResources(): Promise<Resource[]> {
    this.assertOpen();
    const result = await this._client.listResources(undefined, this._reqOpts);
    return result.resources;
  }

  async readResource(uri: string): Promise<ReadResourceResult> {
    this.assertOpen();
    const result = await this._client.readResource({ uri }, this._reqOpts);
    return result as ReadResourceResult;
  }

  async listResourceTemplates(): Promise<ResourceTemplate[]> {
    this.assertOpen();
    const result = await this._client.listResourceTemplates(undefined, this._reqOpts);
    return result.resourceTemplates;
  }

  async listPrompts(): Promise<Prompt[]> {
    this.assertOpen();
    const result = await this._client.listPrompts(undefined, this._reqOpts);
    return result.prompts;
  }

  async getPrompt(name: string, args?: Record<string, string>): Promise<GetPromptResult> {
    this.assertOpen();
    const result = await this._client.getPrompt({ name, arguments: args }, this._reqOpts);
    return result as GetPromptResult;
  }

  async ping(): Promise<void> {
    this.assertOpen();
    await this._client.ping(this._reqOpts);
  }

  getServerCapabilities(): ServerCapabilities | undefined {
    return this._client.getServerCapabilities();
  }

  getServerVersion(): { name: string; version: string } | undefined {
    return this._client.getServerVersion();
  }

  async close(): Promise<void> {
    if (this._closed) return this._closing ?? undefined;
    this._closed = true;
    this._closing = (async () => {
      await this._cleanup();
    })();
    return this._closing;
  }
}

export async function createHarness(
  serverOrConfig: McpServer | SubprocessConfig,
  options?: HarnessOptions,
): Promise<McpHarness> {
  if (isSubprocessConfig(serverOrConfig)) {
    const { createSubprocessHarness } = await import('./subprocess.js');
    return createSubprocessHarness(serverOrConfig, options);
  } else {
    const { createInMemoryHarness } = await import('./in-memory.js');
    return createInMemoryHarness(serverOrConfig, options);
  }
}
