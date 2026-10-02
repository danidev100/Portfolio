'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

import { useAskStore } from '../data-access/useAskStore';
import { GraphLegend } from '../ui/GraphLegend';
import { GRAPH_EDGES, GRAPH_NODES } from '../util/graph';

/**
 * WebGL only exists in the browser, and loading the graph apart keeps
 * three.js out of the first load of the standalone page.
 */
const ExperienceGraph = dynamic(
  () => import('../ui/ExperienceGraph').then((module) => module.ExperienceGraph),
  { ssr: false },
);

/**
 * The graph, following the focus of the conversation. It only subscribes to
 * the focus, so the tokens of a streaming answer do not re-render the scene.
 */
export function TerminalGraph(): ReactNode {
  const focusNodeIds = useAskStore((state) => state.focusNodeIds);
  const selectNode = useAskStore((state) => state.selectNode);

  return (
    <section
      aria-label="Grafo de experiencia"
      className="relative min-h-64 flex-1 overflow-hidden rounded-card bg-canvas"
    >
      <ExperienceGraph
        nodes={GRAPH_NODES}
        edges={GRAPH_EDGES}
        activeNodeIds={focusNodeIds}
        onSelectNode={selectNode}
      />
      <GraphLegend />
    </section>
  );
}
