import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { AppGlyph, type AppGlyphId } from '@/shared/ui/AppGlyph';

import type { LauncherTone } from '../util/home';

// Android draws a circle on the raised surface with the stroke in the app's tone.
const tile = cva(
  'flex size-15 shrink-0 items-center justify-center rounded-control android:rounded-full android:bg-surface-raised',
  {
    variants: {
      tone: {
        primary: 'bg-primary text-on-primary android:text-primary',
        ai: 'bg-ai text-on-ai android:text-ai',
        highlight: 'bg-highlight text-on-highlight android:text-highlight',
        positive: 'bg-positive text-on-positive android:text-positive',
        neutral: 'bg-surface-raised text-foreground',
      } satisfies Record<LauncherTone, string>,
    },
  },
);

interface PhoneAppIconProps {
  glyph: AppGlyphId;
  tone: LauncherTone;
}

/** Decorative: the link or button that renders it provides the accessible name. */
export function PhoneAppIcon({ glyph, tone }: PhoneAppIconProps): ReactNode {
  return (
    <span aria-hidden="true" className={tile({ tone })}>
      <AppGlyph glyph={glyph} className="size-7" />
    </span>
  );
}
