'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useId, type ReactNode } from 'react';

import { FADE_TRANSITION } from '@/shared/util/motion';

import type { AppDefinition, AppId } from '../util/apps';
import { AppIcon } from './AppIcon';

export interface OverviewWindow {
  app: AppDefinition;
  isMinimized: boolean;
}

interface ActivitiesOverviewProps {
  id: string;
  windows: readonly OverviewWindow[];
  /** The route the router is on: the card that links to it does not navigate. */
  currentHref: string;
  onSelect: (id: AppId) => void;
}

export function ActivitiesOverview({
  id,
  windows,
  currentHref,
  onSelect,
}: ActivitiesOverviewProps): ReactNode {
  const headingId = useId();

  return (
    <motion.section
      id={id}
      aria-labelledby={headingId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE_TRANSITION}
      className="absolute inset-0 z-10 flex flex-col gap-6 overflow-auto rounded-window bg-canvas/80 p-6 backdrop-blur-md sm:p-8"
    >
      <h2 id={headingId} className="font-display text-2xl font-bold">
        Ventanas abiertas
      </h2>
      {windows.length === 0 ? (
        <div>
          <p className="font-semibold">No hay ventanas abiertas</p>
          <p className="text-muted">Abre una app desde el dock para empezar.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {windows.map(({ app, isMinimized }) => (
            <li key={app.id}>
              <Link
                href={app.href}
                onClick={(event) => {
                  // From an intercepted route, navigating to the current URL
                  // empties the page.
                  if (app.href === currentHref) event.preventDefault();
                  onSelect(app.id);
                }}
                className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-6 transition-colors duration-200 hover:bg-surface-raised motion-reduce:transition-none"
              >
                <AppIcon appId={app.id} tone={app.tone} />
                <span className="sr-only">
                  {app.title}
                  {isMinimized ? ', minimizada' : ''}
                </span>
                <span aria-hidden="true" className="font-semibold">
                  {app.title}
                </span>
                <span aria-hidden="true" className="text-xs text-muted">
                  {isMinimized ? 'Minimizada' : 'Visible'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
