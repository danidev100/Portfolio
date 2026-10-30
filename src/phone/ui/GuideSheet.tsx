'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, type ReactNode } from 'react';

import { shouldActivateFromClick } from '@/shared/util/appLinks';
import { APPS, type AppId } from '@/shared/util/apps';

import { GUIDE_ENTRIES } from '../util/guide';
import { PhoneAppIcon } from './PhoneAppIcon';

interface GuideSheetProps {
  isOpen: boolean;
  /** The route the router is on: a link to it must not navigate. */
  currentHref: string;
  onClose: () => void;
  onOpenApp: (id: AppId) => void;
}

/**
 * A short tour of the phone's apps, as a sheet over the home screen. A native
 * modal dialog traps the focus, closes with Escape and hands the focus back
 * to the button that opened it.
 */
export function GuideSheet({
  isOpen,
  currentHref,
  onClose,
  onOpenApp,
}: GuideSheetProps): ReactNode {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      className="fixed inset-x-2 top-auto bottom-2 m-0 w-auto max-w-none rounded-window border border-border bg-surface p-5 text-foreground backdrop:bg-canvas/70"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id={titleId} className="font-display text-2xl font-bold">
            Guía
          </h2>
          <p className="text-sm text-muted">Un recorrido corto por Dani OS.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-full bg-surface-raised px-4 text-sm font-semibold"
        >
          Cerrar
        </button>
      </div>
      <ul className="mt-5 flex flex-col gap-2">
        {GUIDE_ENTRIES.map(({ appId, description }) => (
          <li key={appId}>
            <Link
              href={APPS[appId].href}
              onClick={(event) => {
                if (!shouldActivateFromClick(event, APPS[appId].href, currentHref)) return;

                onOpenApp(appId);
                onClose();
              }}
              className="flex items-center gap-3 rounded-card bg-surface-raised p-3"
            >
              <PhoneAppIcon glyph={appId} tone={APPS[appId].tone} />
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold">{APPS[appId].title}</span>
                <span className="text-sm text-muted">{description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
