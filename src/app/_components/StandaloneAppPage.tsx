import type { ReactNode } from 'react';

import { StandalonePage } from '@/desktop';
import { APPS, type AppId } from '@/shared/util/apps';

import { APP_CONTENT } from './appContent';

interface StandaloneAppPageProps {
  appId: AppId;
}

export function StandaloneAppPage({ appId }: StandaloneAppPageProps): ReactNode {
  return <StandalonePage title={APPS[appId].title}>{APP_CONTENT[appId]}</StandalonePage>;
}
