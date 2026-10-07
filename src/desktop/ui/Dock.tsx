'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/shared/util/cn';
import { RADIUS_PX } from '@/shared/util/motion';

import { shouldActivateFromClick } from '../util/appLinks';
import { DOCK_ID, getDockItemId, type AppDefinition, type AppId } from '../util/apps';
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
  return (
    <nav aria-label="Dock" className="flex justify-center">
      <ul
        id={DOCK_ID}
        className="flex items-start gap-1 rounded-full border border-border bg-surface/90 px-3 py-2 backdrop-blur sm:gap-2"
      >
        {items.map(({ app, isRunning, isFocused }) => (
          <li key={app.id} className="relative">
            {/* The window grows out of this plate and shrinks back into it. */}
            <motion.span
              aria-hidden="true"
              layoutId={getWindowLayoutId(app.id)}
              style={{ borderRadius: RADIUS_PX.control }}
              className="absolute inset-x-0 top-0 mx-auto size-12 bg-surface-raised"
            />
            <Link
              id={getDockItemId(app.id)}
              href={app.href}
              aria-current={isFocused ? 'page' : undefined}
              onClick={(event) => {
                if (shouldActivateFromClick(event, app.href, currentHref)) onActivate(app.id);
              }}
              className="group relative flex w-16 flex-col items-center gap-1 rounded-control"
            >
              <AppIcon
                appId={app.id}
                tone={app.tone}
                className="transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1 motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="max-w-full truncate text-xs text-muted group-aria-[current=page]:text-foreground"
              >
                {app.shortTitle}
              </span>
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
