import { getConnectedNodeIds, GRAPH_EDGES, GRAPH_NODES, type GraphEdge } from './graph';

const EDGES: readonly GraphEdge[] = [
  ['a', 'b'],
  ['c', 'a'],
  ['b', 'c'],
];

describe('getConnectedNodeIds', () => {
  it('finds the nodes linked in either direction', () => {
    expect(getConnectedNodeIds('a', EDGES)).toEqual(['b', 'c']);
  });

  it('is empty for a node without links', () => {
    expect(getConnectedNodeIds('z', EDGES)).toEqual([]);
  });
});

describe('graph data', () => {
  it('only links nodes that exist', () => {
    const ids = new Set(GRAPH_NODES.map((node) => node.id));

    const danglingEdges = GRAPH_EDGES.filter(([from, to]) => !ids.has(from) || !ids.has(to));

    expect(danglingEdges).toEqual([]);
  });

  it('gives every node a unique id', () => {
    const ids = GRAPH_NODES.map((node) => node.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
