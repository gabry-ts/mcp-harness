import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type {
  CallToolResult,
  ReadResourceResult,
  GetPromptResult,
  Tool,
  Resource,
  Prompt,
} from '@modelcontextprotocol/sdk/types.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { HarnessOptions, SubprocessConfig } from './types.js';
import { isSubprocessConfig } from './types.js';

export class McpHarness {
  private _closed = false;

  constructor(
    private _client: Client,
    private _cleanup: () => Promise<void>,
  ) {}

  get client(): Client {
    return this._client;
  }

  private assertOpen(): void {
    if (this._closed) {
      throw new Error('Harness is closed');
    }
  }

  async listTools(): Promise<Tool[]> {
    this.assertOpen();
    const result = await this._client.listTools();
    return result.tools;
  }

  async callTool(name: string, args?: Record<string, unknown>): Promise<CallToolResult> {
    this.assertOpen();
    const result = await this._client.callTool({ name, arguments: args });
    return result as CallToolResult;
  }

  async listResources(): Promise<Resource[]> {
    this.assertOpen();
    const result = await this._client.listResources();
    return result.resources;
  }

  async readResource(uri: string): Promise<ReadResourceResult> {
    this.assertOpen();
    const result = await this._client.readResource({ uri });
    return result as ReadResourceResult;
  }

  async listPrompts(): Promise<Prompt[]> {
    this.assertOpen();
    const result = await this._client.listPrompts();
    return result.prompts;
  }

  async getPrompt(name: string, args?: Record<string, string>): Promise<GetPromptResult> {
    this.assertOpen();
    const result = await this._client.getPrompt({ name, arguments: args });
    return result as GetPromptResult;
  }

  async close(): Promise<void> {
    if (this._closed) return;
    this._closed = true;
    await this._client.close();
    await this._cleanup();
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
