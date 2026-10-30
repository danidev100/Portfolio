'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useRef, type MouseEvent } from 'react';

import { getAppIdByPathname, type AppId } from '@/shared/util/apps';

export interface PhoneNavigation {
  /** The app on screen: the route names it, there is no other state. */
  openAppId: AppId | null;
  currentHref: string;
  /** Called when the home screen opens an app, so going home can go back instead. */
  markOpenedFromHome: (id: AppId) => void;
  goHome: (event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * The URL is the phone's state. Going home from an app opened on the home
 * screen goes back in the history, so the home screen is the entry before it
 * and the system back gesture does not return to the app just closed.
 */
export function usePhoneNavigation(): PhoneNavigation {
  const pathname = usePathname();
  const router = useRouter();
  const openedFromHomeRef = useRef<AppId | null>(null);
  const openAppId = getAppIdByPathname(pathname);

  return {
    openAppId,
    currentHref: pathname,
    markOpenedFromHome: (id) => {
      openedFromHomeRef.current = id;
    },
    goHome: (event) => {
      // Moved to another app from inside this one: home is not the entry before.
      if (openAppId === null || openedFromHomeRef.current !== openAppId) return;

      event.preventDefault();
      openedFromHomeRef.current = null;
      router.back();
    },
  };
}
