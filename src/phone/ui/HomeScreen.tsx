import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';

import { AppGlyph } from '@/shared/ui/AppGlyph';
import { shouldActivateFromClick } from '@/shared/util/appLinks';
import { APP_IDS, APPS, type AppId } from '@/shared/util/apps';
import type { PhoneFlavor } from '@/shared/util/deviceProfile';

import { PhoneAppIcon } from './PhoneAppIcon';
import { ProfileWidget } from './ProfileWidget';

interface HomeScreenProps {
  flavor: PhoneFlavor;
  /** The route the router is on: a link to it must not navigate. */
  currentHref: string;
  onOpenApp: (id: AppId) => void;
  /** Launchers that are not links, such as the guide. */
  grid?: ReactNode;
}

/**
 * The phone's home: who it belongs to, its launchers and the dock. Each
 * flavor lays them out in its own DOM order, never with CSS `order`, so the
 * keyboard walks them in the order the eye does.
 */
export function HomeScreen({ flavor, currentHref, onOpenApp, grid }: HomeScreenProps): ReactNode {
  const isAndroid = flavor === 'android';
  const openFromClick = (id: AppId) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (shouldActivateFromClick(event, APPS[id].href, currentHref)) onOpenApp(id);
  };

  const apps = (
    <nav aria-label="Apps" className="grid grid-cols-4 gap-y-5">
      <Link
        href={APPS.about.href}
        onClick={openFromClick('about')}
        className="flex flex-col items-center gap-1.5 justify-self-center rounded-control"
      >
        <PhoneAppIcon glyph="cv" tone="neutral" />
        <span className="text-xs font-medium">CV</span>
      </Link>
      {grid}
    </nav>
  );

  const dock = (
    <nav
      aria-label="Dock"
      className="grid w-full grid-cols-4 rounded-window border border-border bg-surface-raised p-4 android:border-0 android:bg-transparent android:p-0"
    >
      {APP_IDS.map((id) => (
        <Link
          key={id}
          href={APPS[id].href}
          aria-label={APPS[id].title}
          onClick={openFromClick(id)}
          className="flex flex-col items-center gap-1.5 justify-self-center rounded-control"
        >
          <PhoneAppIcon glyph={id} tone={APPS[id].tone} />
          {isAndroid && <span className="text-xs font-medium">{APPS[id].shortTitle}</span>}
        </Link>
      ))}
    </nav>
  );

  const ask = isAndroid ? (
    <Link
      href={APPS.terminal.href}
      onClick={openFromClick('terminal')}
      className="flex h-14 w-full items-center gap-3 rounded-full bg-surface-raised px-5 text-muted"
    >
      <AppGlyph glyph="terminal" className="size-6 shrink-0 text-ai" />
      Pregúntale a mi IA
    </Link>
  ) : (
    <Link
      href={APPS.terminal.href}
      onClick={openFromClick('terminal')}
      className="rounded-full bg-surface-raised px-4 py-2 text-sm font-medium"
    >
      Pregúntale a mi IA
    </Link>
  );

  return (
    <main className="flex h-full flex-col gap-6 overflow-y-auto px-6 pt-6 pb-2 android:px-4">
      <h1 className="sr-only">Dani OS</h1>
      <ProfileWidget onOpenCv={openFromClick('about')} />
      {isAndroid ? (
        <div className="mt-auto flex flex-col gap-6">
          {apps}
          {dock}
          {ask}
        </div>
      ) : (
        <>
          {apps}
          <div className="mt-auto flex flex-col items-center gap-4">
            {ask}
            {dock}
          </div>
        </>
      )}
    </main>
  );
}
