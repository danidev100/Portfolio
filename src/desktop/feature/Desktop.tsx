'use client';

import { AnimatePresence } from 'motion/react';
import dynamic from 'next/dynamic';
import { useState, type KeyboardEvent, type ReactNode } from 'react';

import { ActivitiesOverview } from '../ui/ActivitiesOverview';
import { DesktopGreeting } from '../ui/DesktopGreeting';
import { Dock } from '../ui/Dock';
import { TopBar } from '../ui/TopBar';
import { Window } from '../ui/Window';
import { APP_IDS, APPS, type AppId } from '../util/apps';
import { APP_SCENE_PANELS } from './appScenePanels';
import { useDesktopWindows } from './useDesktopWindows';

/**
 * Loaded after the shell is interactive and never on the server: three.js
 * stays out of the first load and the CSS wallpaper covers until it arrives.
 */
const DesktopScene = dynamic(() => import('@/scene').then((scene) => scene.DesktopScene), {
  ssr: false,
});

const OVERVIEW_ID = 'activities-overview';

/** Each app has its own slightly shifted spot so stacked windows stay reachable. */
const WINDOW_PLACEMENT: Record<AppId, string> = {
  projects: 'md:-translate-x-8 md:-translate-y-2',
  terminal: 'md:-translate-x-3',
  about: 'md:translate-x-3 md:translate-y-1',
  contact: 'md:translate-x-8 md:translate-y-2',
};

interface DesktopProps {
  /** Rendered by the app layer so the shell does not depend on other domains. */
  appContent: Readonly<Record<AppId, ReactNode>>;
}

export function Desktop({ appContent }: DesktopProps): ReactNode {
  const { windows, focusedId, open, focus, minimize, close } = useDesktopWindows();
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);

  const activate = (id: AppId): void => {
    open(id);
    setIsOverviewOpen(false);
  };

  const closeOverviewOnEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') setIsOverviewOpen(false);
  };

  const dockItems = APP_IDS.map((id) => ({
    app: APPS[id],
    isRunning: windows.some((managedWindow) => managedWindow.id === id),
    isFocused: focusedId === id,
  }));

  // Listed in dock order, not stack order, so cards do not jump as focus changes.
  const overviewWindows = APP_IDS.flatMap((id) => {
    const managedWindow = windows.find((candidate) => candidate.id === id);

    return managedWindow ? [{ app: APPS[id], isMinimized: managedWindow.isMinimized }] : [];
  });

  return (
    <div
      className="relative isolate grid h-dvh grid-rows-[auto_1fr_auto] gap-3 bg-wallpaper p-3"
      onKeyDown={closeOverviewOnEscape}
    >
      <DesktopScene
        panels={APP_SCENE_PANELS}
        activePanelId={focusedId}
        isPulledBack={isOverviewOpen}
      />
      <TopBar
        isOverviewOpen={isOverviewOpen}
        overviewId={OVERVIEW_ID}
        onToggleOverview={() => {
          setIsOverviewOpen((isOpen) => !isOpen);
        }}
      />
      <main className="relative isolate min-h-0">
        <div inert={isOverviewOpen} className="absolute inset-0">
          <DesktopGreeting />
          <AnimatePresence>
            {windows.map(({ id, isMinimized }, stackIndex) =>
              isMinimized ? null : (
                <Window
                  key={id}
                  appId={id}
                  title={APPS[id].title}
                  isFocused={focusedId === id}
                  zIndex={stackIndex}
                  className={`md:inset-x-12 md:inset-y-3 lg:inset-x-28 ${WINDOW_PLACEMENT[id]}`}
                  onFocus={() => {
                    focus(id);
                  }}
                  onMinimize={() => {
                    minimize(id);
                  }}
                  onClose={() => {
                    close(id);
                  }}
                >
                  {appContent[id]}
                </Window>
              ),
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {isOverviewOpen ? (
            <ActivitiesOverview id={OVERVIEW_ID} windows={overviewWindows} onSelect={activate} />
          ) : null}
        </AnimatePresence>
      </main>
      <Dock items={dockItems} onActivate={activate} />
    </div>
  );
}
