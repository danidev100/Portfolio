import type { GraphNode, GraphNodeType } from './graph';

export type Position = readonly [x: number, y: number, z: number];

const CENTER: Position = [0, 0, 0];

/** Experience sits on an inner shell around the core; everything else, outside. */
const INNER_RADIUS = 1.9;
const OUTER_RADIUS = 3.3;
/** Flattens the sphere a little so it fits a wide window. */
const VERTICAL_SQUASH = 0.78;

/** The golden angle spreads consecutive points evenly around a sphere. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const ANGLE_STRIDE = 1.7;

function getRadius(type: GraphNodeType): number {
  return type === 'experience' ? INNER_RADIUS : OUTER_RADIUS;
}

/**
 * Places the nodes on two concentric spheres, walking from the top pole to
 * the bottom one. It only depends on the order of the nodes, so the graph
 * looks the same on every visit.
 */
export function layoutGraph(nodes: readonly GraphNode[]): ReadonlyMap<string, Position> {
  const lastIndex = Math.max(1, nodes.length - 1);

  return new Map(
    nodes.map((node, index): [string, Position] => {
      if (node.type === 'core') return [node.id, CENTER];

      const height = 1 - (index / lastIndex) * 2;
      const ringRadius = Math.sqrt(1 - height * height);
      const angle = GOLDEN_ANGLE * index * ANGLE_STRIDE;
      const radius = getRadius(node.type);

      return [
        node.id,
        [
          Math.cos(angle) * ringRadius * radius,
          height * radius * VERTICAL_SQUASH,
          Math.sin(angle) * ringRadius * radius,
        ],
      ];
    }),
  );
}
