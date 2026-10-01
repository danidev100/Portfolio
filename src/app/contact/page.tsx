import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { APPS } from '@/desktop';

import { StandaloneAppPage } from '../_components/StandaloneAppPage';

export const metadata: Metadata = { title: APPS.contact.title };

export default function ContactPage(): ReactNode {
  return <StandaloneAppPage appId="contact" />;
}
