import type { ReactNode } from 'react';

import { Desktop } from '@/desktop';

import { APP_CONTENT } from './_components/appContent';

export default function DesktopPage(): ReactNode {
  return <Desktop appContent={APP_CONTENT} />;
}
