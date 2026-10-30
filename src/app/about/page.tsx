import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { APPS } from '@/shared/util/apps';

import { StandaloneAppPage } from '../_components/StandaloneAppPage';

export const metadata: Metadata = { title: APPS.about.title };

export default function AboutPage(): ReactNode {
  return <StandaloneAppPage appId="about" />;
}
