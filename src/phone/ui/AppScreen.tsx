import type { MouseEvent, ReactNode } from 'react';

import type { PhoneFlavor } from '@/shared/util/deviceProfile';

import { AndroidTopAppBar } from './AndroidTopAppBar';
import { IosNavigationBar } from './IosNavigationBar';

interface AppScreenProps {
  flavor: PhoneFlavor;
  title: string;
  /** Decides whether the link to the home screen navigates or goes back in the history. */
  onHome: (event: MouseEvent<HTMLAnchorElement>) => void;
  children: ReactNode;
}

const BARS = { ios: IosNavigationBar, android: AndroidTopAppBar } as const satisfies Record<
  PhoneFlavor,
  unknown
>;

/** An app on the phone: its system's bar back to the home screen, then its content. */
export function AppScreen({ flavor, title, onHome, children }: AppScreenProps): ReactNode {
  const Bar = BARS[flavor];

  return (
    <div className="flex h-full flex-col">
      <Bar title={title} onHome={onHome} />
      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">{children}</main>
    </div>
  );
}
