'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useWindowStore } from '../data-access/useWindowStore';
import { APPS, DESKTOP_HREF, getAppIdByPathname, type AppId } from '../util/apps';
import { settleLanding } from '../util/routeLandings';
import { getFocusedWindowId, type WindowStack } from '../util/windowManager';

export interface DesktopWindows {
  windows: WindowStack;
  focusedId: AppId | null;
  /**
   * The route the router is on. A link to it must not navigate: from an
   * intercepted route, navigating to the current URL leaves the page empty.
   */
  currentHref: string;
  /** Opens right away without navigating: the link that triggers it does. */
  open: (id: AppId) => void;
  focus: (id: AppId) => void;
  /** Both return the window left in focus, or `null` when none is visible. */
  minimize: (id: AppId) => AppId | null;
  close: (id: AppId) => AppId | null;
}

/** Route of the window on top of the stack, or the desktop when none is visible. */
function getFocusedHref(): string {
  const focusedId = getFocusedWindowId(useWindowStore.getState().windows);

  return focusedId ? APPS[focusedId].href : DESKTOP_HREF;
}

/**
 * Keeps the window stack and the URL in step: the route names the focused
 * window and the desktop route means no window is visible.
 *
 * The stack changes at once and its navigation lands a moment later, so the
 * two can disagree for a while. Navigations the app asked for are tracked: when
 * the last one lands on a route the visitor has already moved on from, the URL
 * is corrected instead of dragging the stack back. Only routes the app did not
 * ask for, such as the back button, move the stack.
 */
export function useDesktopWindows(): DesktopWindows {
  const pathname = usePathname();
  const router = useRouter();
  const windows = useWindowStore((state) => state.windows);
  const openWindow = useWindowStore((state) => state.openWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const showDesktop = useWindowStore((state) => state.showDesktop);
  /** Routes the app has asked to navigate to and that have not landed yet. */
  const outstandingRef = useRef<readonly string[]>([]);
  const settledPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // A landing is handled once, whatever else makes this effect run again.
    if (settledPathnameRef.current === pathname) return;
    settledPathnameRef.current = pathname;

    const { landing, outstanding } = settleLanding(outstandingRef.current, pathname);
    outstandingRef.current = outstanding;
    if (landing === 'superseded') return;

    const focusedHref = getFocusedHref();
    if (landing === 'final' && focusedHref !== pathname) {
      outstandingRef.current = [focusedHref];
      router.replace(focusedHref);

      return;
    }

    const routeAppId = getAppIdByPathname(pathname);
    if (routeAppId) openWindow(routeAppId);
    else showDesktop();
  }, [pathname, router, openWindow, showDesktop]);

  /**
   * Navigates to the focused window, unless the router is on its way there or
   * already on that route. In the second case a navigation elsewhere may still
   * be on its way: it is corrected when it lands, never by navigating to the
   * current route.
   */
  const navigateToFocusedWindow = (): AppId | null => {
    const focusedId = getFocusedWindowId(useWindowStore.getState().windows);
    const href = focusedId ? APPS[focusedId].href : DESKTOP_HREF;
    const headingTo = outstandingRef.current.at(-1) ?? pathname;

    if (href !== headingTo && href !== pathname) {
      outstandingRef.current = [...outstandingRef.current, href];
      router.push(href);
    }

    return focusedId;
  };

  return {
    windows,
    focusedId: getFocusedWindowId(windows),
    currentHref: pathname,
    open: (id) => {
      // The link navigates only when it points somewhere else.
      if (APPS[id].href !== pathname) {
        outstandingRef.current = [...outstandingRef.current, APPS[id].href];
      }
      openWindow(id);
    },
    focus: (id) => {
      focusWindow(id);
      navigateToFocusedWindow();
    },
    minimize: (id) => {
      minimizeWindow(id);

      return navigateToFocusedWindow();
    },
    close: (id) => {
      closeWindow(id);

      return navigateToFocusedWindow();
    },
  };
}
