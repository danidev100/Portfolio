import type { ReactNode } from 'react';

import { Clock } from './Clock';

interface TopBarProps {
  isOverviewOpen: boolean;
  overviewId: string;
  onToggleOverview: () => void;
}

export function TopBar({ isOverviewOpen, overviewId, onToggleOverview }: TopBarProps): ReactNode {
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center rounded-full border border-border bg-canvas/85 p-1.5 text-sm backdrop-blur">
      <button
        type="button"
        aria-expanded={isOverviewOpen}
        aria-controls={overviewId}
        onClick={onToggleOverview}
        className="justify-self-start rounded-full px-4 py-1.5 font-semibold transition-colors duration-200 hover:bg-surface-raised aria-expanded:bg-surface-raised motion-reduce:transition-none"
      >
        Actividades
      </button>
      <Clock />
      <p className="hidden justify-self-end px-4 text-muted sm:block">Daniel Jaramillo</p>
    </header>
  );
}
