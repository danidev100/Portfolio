import type { ReactNode } from 'react';

import { Desktop } from '@/desktop';
import { Phone } from '@/phone';
import { isPhoneFlavor } from '@/shared/util/deviceProfile';

import { APP_CONTENT } from './_components/appContent';
import { getDeviceProfile } from './_components/getDeviceProfile';
import { PHONE_APP_CONTENT } from './_components/phoneAppContent';

export default async function HomePage({ searchParams }: PageProps<'/'>): Promise<ReactNode> {
  const profile = await getDeviceProfile(searchParams);

  if (isPhoneFlavor(profile)) return <Phone flavor={profile} appContent={PHONE_APP_CONTENT} />;

  return <Desktop appContent={APP_CONTENT} />;
}
