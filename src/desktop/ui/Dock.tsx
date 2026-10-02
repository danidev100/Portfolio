'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';

import { cn } from '@/shared/util/cn';
import { RADIUS_PX } from '@/shared/util/motion';

import { getDockItemId, type AppDefinition, type AppId } from '../util/apps';
import { getWindowLayoutId } from '../util/windowLayout';
import { AppIcon } from './AppIcon';

export interface DockItem {
  app: AppDefinition;
  isRunning: boolean;
  isFocused: boolean;
}

interface DockProps {
  items: readonly DockItem[];
  /** The route the router is on: the icon that links to it does not navigate. */
  currentHref: string;
  onActivate: (id: AppId) => void;
}

export function Dock({ items, currentHref, onActivate }: DockProps): ReactNode {
  const activate = (event: MouseEvent, app: AppDefinition): void => {
    // From an intercepted route, navigating to the current URL empties the page.
    if (app.href === currentHref) event.preventDefault();

    // The second click of a double click would undo what the first one did.
    if (event.detail > 1) {
      event.preventDefault();

      return;
    }

    onActivate(app.id);
  };

  return (
    <nav aria-label="Dock" className="flex justify-center">
      <ul className="flex items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-2 backdrop-blur">
        {items.map(({ app, isRunning, isFocused }) => (
          <li key={app.id} className="relative">
            {/* The window grows out of this plate and shrinks back into it. */}
            <motion.span
              aria-hidden="true"
              layoutId={getWindowLayoutId(app.id)}
              style={{ borderRadius: RADIUS_PX.control }}
              className="absolute inset-0 bg-surface-raised"
            />
            <Link
              id={getDockItemId(app.id)}
              href={app.href}
              aria-current={isFocused ? 'page' : undefined}
              onClick={(event) => {
                activate(event, app);
              }}
              className="group relative flex flex-col items-center rounded-control"
            >
              <AppIcon
                appId={app.id}
                tone={app.tone}
                className="transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1 motion-reduce:transition-none"
              />
              <span className="sr-only">
                {app.title}
                {isRunning ? ', abierta' : ''}
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-10 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
              >
                {app.title}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -bottom-1.5 size-1 rounded-full bg-foreground transition-opacity duration-200 motion-reduce:transition-none',
                  isRunning ? 'opacity-100' : 'opacity-0',
                )}
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
