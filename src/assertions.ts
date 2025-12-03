import type { CallToolResult, Tool, Resource, Prompt } from '@modelcontextprotocol/sdk/types.js';

export function hasText(result: CallToolResult, text: string): boolean {
  return (result.content ?? []).some((block) => block.type === 'text' && block.text.includes(text));
}

export function getTexts(result: CallToolResult): string[] {
  return (result.content ?? [])
    .filter(
      (block): block is Extract<(typeof result.content)[number], { type: 'text' }> =>
        block.type === 'text',
    )
    .map((block) => block.text);
}

export function getFirstText(result: CallToolResult): string | undefined {
  const block = (result.content ?? []).find((b) => b.type === 'text');
  return block && block.type === 'text' ? block.text : undefined;
}

export function hasError(result: CallToolResult): boolean {
  return result.isError === true;
}

export function hasErrorMatching(result: CallToolResult, pattern: string | RegExp): boolean {
  if (result.isError !== true) return false;
  return (result.content ?? []).some(
    (block) =>
      block.type === 'text' &&
      (typeof pattern === 'string' ? block.text.includes(pattern) : pattern.test(block.text)),
  );
}

export function toolExists(tools: Tool[], name: string): boolean {
  return tools.some((t) => t.name === name);
}

export function findTool(tools: Tool[], name: string): Tool | undefined {
  return tools.find((t) => t.name === name);
}

export function resourceExists(resources: Resource[], uri: string): boolean {
  return resources.some((r) => r.uri === uri);
}

export function promptExists(prompts: Prompt[], name: string): boolean {
  return prompts.some((p) => p.name === name);
}
