import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { APPS } from '@/shared/util/apps';

import { StandaloneAppPage } from '../_components/StandaloneAppPage';

export const metadata: Metadata = { title: APPS.contact.title };

export default function ContactPage(): ReactNode {
  return <StandaloneAppPage appId="contact" />;
}
