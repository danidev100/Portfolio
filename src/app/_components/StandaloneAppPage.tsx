import type { ReactNode } from 'react';

import { APPS, StandalonePage, type AppId } from '@/desktop';

import { APP_CONTENT } from './appContent';

interface StandaloneAppPageProps {
  appId: AppId;
}

export function StandaloneAppPage({ appId }: StandaloneAppPageProps): ReactNode {
  return <StandalonePage title={APPS[appId].title}>{APP_CONTENT[appId]}</StandalonePage>;
}
