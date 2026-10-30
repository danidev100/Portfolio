'use client';

import { useState, type ReactNode } from 'react';

import { APPS, type AppId } from '@/shared/util/apps';
import type { PhoneFlavor } from '@/shared/util/deviceProfile';

import { AppScreen } from '../ui/AppScreen';
import { GuideSheet } from '../ui/GuideSheet';
import { HomeScreen } from '../ui/HomeScreen';
import { PhoneAppIcon } from '../ui/PhoneAppIcon';
import { useIsHydrated } from './useIsHydrated';
import { usePhoneNavigation } from './usePhoneNavigation';

interface PhoneProps {
  flavor: PhoneFlavor;
  /** Rendered by the app layer so the phone does not depend on other domains. */
  appContent: Readonly<Record<AppId, ReactNode>>;
}

/** Dani OS on a phone: a home screen and one app at a time, named by the URL. */
export function Phone({ flavor, appContent }: PhoneProps): ReactNode {
  const { openAppId, currentHref, markOpenedFromHome, goHome } = usePhoneNavigation();
  const isHydrated = useIsHydrated();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div
      data-flavor={flavor}
      data-hydrated={isHydrated}
      className="h-dvh overscroll-none bg-wallpaper pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      {openAppId ? (
        <AppScreen flavor={flavor} title={APPS[openAppId].title} onHome={goHome}>
          {appContent[openAppId]}
        </AppScreen>
      ) : (
        <>
          <HomeScreen
            flavor={flavor}
            currentHref={currentHref}
            onOpenApp={markOpenedFromHome}
            grid={
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => {
                  setIsGuideOpen(true);
                }}
                className="flex flex-col items-center gap-1.5 justify-self-center rounded-control"
              >
                <PhoneAppIcon glyph="guide" tone="neutral" />
                <span className="text-xs font-medium">Guía</span>
              </button>
            }
          />
          <GuideSheet
            isOpen={isGuideOpen}
            currentHref={currentHref}
            onClose={() => {
              setIsGuideOpen(false);
            }}
            onOpenApp={markOpenedFromHome}
          />
        </>
      )}
    </div>
  );
}
