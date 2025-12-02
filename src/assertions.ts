import type { CallToolResult, Tool, Resource, Prompt } from '@modelcontextprotocol/sdk/types.js';

export function hasText(result: CallToolResult, text: string): boolean {
  throw new Error('not implemented');
}

export function getTexts(result: CallToolResult): string[] {
  throw new Error('not implemented');
}

export function getFirstText(result: CallToolResult): string | undefined {
  throw new Error('not implemented');
}

export function hasError(result: CallToolResult): boolean {
  throw new Error('not implemented');
}

export function hasErrorMatching(result: CallToolResult, pattern: string | RegExp): boolean {
  throw new Error('not implemented');
}

export function toolExists(tools: Tool[], name: string): boolean {
  throw new Error('not implemented');
}

export function findTool(tools: Tool[], name: string): Tool | undefined {
  throw new Error('not implemented');
}

export function resourceExists(resources: Resource[], uri: string): boolean {
  throw new Error('not implemented');
}

export function promptExists(prompts: Prompt[], name: string): boolean {
  throw new Error('not implemented');
}
