import { GRAPH_NODES, type GraphNode } from './graph';
import { layoutGraph, type Position } from './graphLayout';

const distanceFromCenter = ([x, y, z]: Position): number => Math.hypot(x, y, z);

const positionsOfType = (type: GraphNode['type']): Position[] => {
  const layout = layoutGraph(GRAPH_NODES);

  return GRAPH_NODES.filter((node) => node.type === type).flatMap((node) => {
    const position = layout.get(node.id);

    return position ? [position] : [];
  });
};

describe('layoutGraph', () => {
  it('places every node', () => {
    const layout = layoutGraph(GRAPH_NODES);

    expect(layout.size).toBe(GRAPH_NODES.length);
  });

  it('puts the core node at the center', () => {
    expect(positionsOfType('core')).toEqual([[0, 0, 0]]);
  });

  it('keeps the experience nodes closer to the center than the rest', () => {
    const farthestExperience = Math.max(...positionsOfType('experience').map(distanceFromCenter));
    const nearestSkill = Math.min(...positionsOfType('skill').map(distanceFromCenter));

    expect(farthestExperience).toBeLessThan(nearestSkill);
  });

  it('never puts two nodes in the same place', () => {
    const positions = [...layoutGraph(GRAPH_NODES).values()].map((position) => position.join());

    expect(new Set(positions).size).toBe(positions.length);
  });

  it('gives the same layout every time', () => {
    expect([...layoutGraph(GRAPH_NODES)]).toEqual([...layoutGraph(GRAPH_NODES)]);
  });
});
