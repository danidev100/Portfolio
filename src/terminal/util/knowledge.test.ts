import { GRAPH_NODES } from './graph';
import { getCitedNodeIds, KNOWLEDGE_BLOCKS } from './knowledge';

const MAX_BLOCK_LENGTH = 600;

describe('KNOWLEDGE_BLOCKS', () => {
  it('covers every graph node', () => {
    const coveredIds = new Set(KNOWLEDGE_BLOCKS.flatMap((block) => block.nodeIds));

    expect(GRAPH_NODES.filter((node) => !coveredIds.has(node.id))).toEqual([]);
  });

  it('only names nodes that exist', () => {
    const nodeIds = new Set(GRAPH_NODES.map((node) => node.id));
    const unknownIds = KNOWLEDGE_BLOCKS.flatMap((block) => block.nodeIds).filter(
      (nodeId) => !nodeIds.has(nodeId),
    );

    expect(unknownIds).toEqual([]);
  });

  it('keeps blocks short enough to cite', () => {
    for (const block of KNOWLEDGE_BLOCKS) {
      expect(block.text.trim()).not.toBe('');
      expect(block.text.length).toBeLessThanOrEqual(MAX_BLOCK_LENGTH);
    }
  });

  it('includes the current LinkedIn and no other', () => {
    const texts = KNOWLEDGE_BLOCKS.map((block) => block.text);

    expect(texts.some((text) => text.includes('linkedin.com/in/daniel-jaramillo-bustamante'))).toBe(
      true,
    );
    expect(texts.some((text) => text.includes('daniel-jaramillobustamante'))).toBe(false);
  });
});

describe('current situation', () => {
  it('tells that Daniel left Home Power and is looking for work', () => {
    const situation = KNOWLEDGE_BLOCKS.find((block) => block.text.includes('busca trabajo'));

    expect(situation?.text).toContain('terminó en septiembre de 2026');
  });
});

describe('topics the AI never answers', () => {
  it('leaves out where Daniel lives, which the prompt refers to Contact', () => {
    const texts = KNOWLEDGE_BLOCKS.map((block) => block.text);

    expect(texts.filter((text) => /Vive en|UTC/.test(text))).toEqual([]);
  });
});

describe('getCitedNodeIds', () => {
  it('gives the nodes of a single cited block', () => {
    expect(getCitedNodeIds(0, 1)).toEqual(KNOWLEDGE_BLOCKS[0]?.nodeIds);
  });

  it('gives a node shared by several cited blocks only once', () => {
    const citedIds = getCitedNodeIds(2, 4);

    expect(citedIds.filter((nodeId) => nodeId === 'hp')).toEqual(['hp']);
    expect(citedIds).toEqual(expect.arrayContaining(['k7', 'ds']));
  });

  it('gives nothing for a range outside the blocks', () => {
    expect(getCitedNodeIds(KNOWLEDGE_BLOCKS.length, KNOWLEDGE_BLOCKS.length + 2)).toEqual([]);
  });
});
