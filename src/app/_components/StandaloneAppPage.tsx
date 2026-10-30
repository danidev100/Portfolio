import type { ReactNode } from 'react';

import { StandalonePage } from '@/desktop';
import { Phone } from '@/phone';
import { APPS, type AppId } from '@/shared/util/apps';
import { isPhoneFlavor } from '@/shared/util/deviceProfile';

import { APP_CONTENT } from './appContent';
import { getDeviceProfile, type SearchParams } from './getDeviceProfile';
import { PHONE_APP_CONTENT } from './phoneAppContent';

interface StandaloneAppPageProps {
  appId: AppId;
  searchParams: Promise<SearchParams>;
}

/**
 * An app opened by its URL. A phone opens it inside the phone, so that going
 * home leads to the home screen and not to a page of its own.
 */
export async function StandaloneAppPage({
  appId,
  searchParams,
}: StandaloneAppPageProps): Promise<ReactNode> {
  const profile = await getDeviceProfile(searchParams);

  if (isPhoneFlavor(profile)) return <Phone flavor={profile} appContent={PHONE_APP_CONTENT} />;

  return <StandalonePage title={APPS[appId].title}>{APP_CONTENT[appId]}</StandalonePage>;
}
