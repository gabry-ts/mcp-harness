import { describe, it, expect } from 'vitest';
import type { CallToolResult, Tool, Resource, Prompt } from '@modelcontextprotocol/sdk/types.js';
import {
  hasText,
  getTexts,
  getFirstText,
  hasError,
  hasErrorMatching,
  toolExists,
  findTool,
  resourceExists,
  promptExists,
} from '../src/assertions.js';

// --- Mock helpers ---

function makeResult(texts: string[], isError = false): CallToolResult {
  return {
    content: texts.map((t) => ({ type: 'text' as const, text: t })),
    ...(isError ? { isError: true } : {}),
  };
}

function makeImageResult(): CallToolResult {
  return {
    content: [{ type: 'image' as const, data: 'abc', mimeType: 'image/png' }],
  };
}

const tools: Tool[] = [
  { name: 'echo', inputSchema: { type: 'object' } },
  { name: 'add', inputSchema: { type: 'object' } },
];

const resources: Resource[] = [{ uri: 'info://version', name: 'version' }];

const prompts: Prompt[] = [{ name: 'greet' }, { name: 'farewell' }];

// --- Tests ---

describe('hasText', () => {
  it('returns true when text matches', () => {
    expect(hasText(makeResult(['hello world']), 'hello')).toBe(true);
  });

  it('returns false when text does not match', () => {
    expect(hasText(makeResult(['hello world']), 'goodbye')).toBe(false);
  });

  it('returns false for empty content', () => {
    expect(hasText({ content: [] }, 'hello')).toBe(false);
  });

  it('returns false for non-text content blocks', () => {
    expect(hasText(makeImageResult(), 'abc')).toBe(false);
  });
});

describe('getTexts', () => {
  it('returns array of texts from multiple blocks', () => {
    expect(getTexts(makeResult(['one', 'two', 'three']))).toEqual(['one', 'two', 'three']);
  });

  it('returns empty array when no text blocks', () => {
    expect(getTexts(makeImageResult())).toEqual([]);
  });
});

describe('getFirstText', () => {
  it('returns first text string', () => {
    expect(getFirstText(makeResult(['first', 'second']))).toBe('first');
  });

  it('returns undefined when no text blocks', () => {
    expect(getFirstText(makeImageResult())).toBeUndefined();
  });
});

describe('hasError', () => {
  it('returns true for isError result', () => {
    expect(hasError(makeResult(['fail'], true))).toBe(true);
  });

  it('returns false for success result', () => {
    expect(hasError(makeResult(['ok']))).toBe(false);
  });
});

describe('hasErrorMatching', () => {
  it('matches string pattern', () => {
    expect(hasErrorMatching(makeResult(['Intentional failure'], true), 'Intentional')).toBe(true);
  });

  it('matches regex pattern', () => {
    expect(hasErrorMatching(makeResult(['Error code: 42'], true), /code: \d+/)).toBe(true);
  });

  it('returns false for non-error result', () => {
    expect(hasErrorMatching(makeResult(['Intentional failure']), 'Intentional')).toBe(false);
  });
});

describe('toolExists', () => {
  it('returns true when tool exists', () => {
    expect(toolExists(tools, 'echo')).toBe(true);
  });

  it('returns false when tool does not exist', () => {
    expect(toolExists(tools, 'nonexistent')).toBe(false);
  });
});

describe('findTool', () => {
  it('returns Tool object when found', () => {
    const tool = findTool(tools, 'echo');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('echo');
  });

  it('returns undefined when not found', () => {
    expect(findTool(tools, 'nonexistent')).toBeUndefined();
  });
});

describe('resourceExists', () => {
  it('returns true when resource exists', () => {
    expect(resourceExists(resources, 'info://version')).toBe(true);
  });

  it('returns false when resource does not exist', () => {
    expect(resourceExists(resources, 'info://unknown')).toBe(false);
  });
});

describe('promptExists', () => {
  it('returns true when prompt exists', () => {
    expect(promptExists(prompts, 'greet')).toBe(true);
  });

  it('returns false when prompt does not exist', () => {
    expect(promptExists(prompts, 'nonexistent')).toBe(false);
  });
});
