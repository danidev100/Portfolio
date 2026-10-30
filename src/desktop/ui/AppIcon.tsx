import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { AppGlyph } from '@/shared/ui/AppGlyph';
import type { AppId, AppTone } from '@/shared/util/apps';
import { cn } from '@/shared/util/cn';

const tile = cva('flex size-12 shrink-0 items-center justify-center rounded-control', {
  variants: {
    tone: {
      primary: 'bg-primary text-on-primary',
      ai: 'bg-ai text-on-ai',
      highlight: 'bg-highlight text-on-highlight',
      positive: 'bg-positive text-on-positive',
    } satisfies Record<AppTone, string>,
  },
});

interface AppIconProps {
  appId: AppId;
  tone: AppTone;
  className?: string;
}

/** Decorative: the element that renders it provides the accessible name. */
export function AppIcon({ appId, tone, className }: AppIconProps): ReactNode {
  return (
    <span aria-hidden="true" className={cn(tile({ tone }), className)}>
      <AppGlyph glyph={appId} className="size-6" />
    </span>
  );
}
