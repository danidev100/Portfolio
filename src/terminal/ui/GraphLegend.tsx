import type { ReactNode } from 'react';

import { cn } from '@/shared/util/cn';

import { LEGEND_TYPES, NODE_TYPE_STYLES } from './nodeTypeStyles';

export function GraphLegend(): ReactNode {
  return (
    <ul
      aria-label="Tipos de nodo"
      className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 rounded-full bg-canvas/80 px-3 py-1 text-xs text-muted"
    >
      {LEGEND_TYPES.map((type) => (
        <li key={type} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn('size-2 rounded-full', NODE_TYPE_STYLES[type].dotClass)}
          />
          {NODE_TYPE_STYLES[type].name}
        </li>
      ))}
    </ul>
  );
}
