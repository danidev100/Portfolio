import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { APPS } from '@/desktop';

import { StandaloneAppPage } from '../_components/StandaloneAppPage';

export const metadata: Metadata = { title: APPS.about.title };

export default function AboutPage(): ReactNode {
  return <StandaloneAppPage appId="about" />;
}
