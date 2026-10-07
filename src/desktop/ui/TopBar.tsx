import type { ReactNode } from 'react';

import { Clock } from './Clock';

interface TopBarProps {
  isOverviewOpen: boolean;
  overviewId: string;
  onToggleOverview: () => void;
  onOpenGuide: () => void;
}

export function TopBar({
  isOverviewOpen,
  overviewId,
  onToggleOverview,
  onOpenGuide,
}: TopBarProps): ReactNode {
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center rounded-full border border-border bg-canvas/85 p-1.5 text-sm backdrop-blur">
      <button
        type="button"
        aria-expanded={isOverviewOpen}
        aria-controls={overviewId}
        onClick={onToggleOverview}
        className="justify-self-start rounded-full px-3 py-1.5 font-semibold transition-colors duration-200 hover:bg-surface-raised aria-expanded:bg-surface-raised motion-reduce:transition-none sm:px-4"
      >
        Ventanas
      </button>
      <Clock />
      <div className="flex items-center gap-1 justify-self-end">
        <p className="hidden px-3 text-muted sm:block">Daniel Jaramillo</p>
        <button
          type="button"
          onClick={onOpenGuide}
          className="rounded-full px-3 py-1.5 font-semibold transition-colors duration-200 hover:bg-surface-raised motion-reduce:transition-none sm:px-4"
        >
          Guía
        </button>
      </div>
    </header>
  );
}
