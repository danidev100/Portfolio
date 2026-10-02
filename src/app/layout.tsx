import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { fontVariables } from '@/core/fonts';
import { MotionProvider } from '@/core/providers/MotionProvider';
import '@/core/styles/globals.css';

const DESCRIPTION =
  'Portafolio de Daniel Jaramillo, Frontend Tech Lead y AI App Developer, presentado como un sistema operativo navegable en 3D.';

export const metadata: Metadata = {
  title: {
    default: 'Dani OS — Daniel Jaramillo',
    template: '%s · Dani OS',
  },
  description: DESCRIPTION,
  openGraph: {
    title: 'Dani OS — Daniel Jaramillo',
    description: DESCRIPTION,
    type: 'website',
    locale: 'es_CO',
  },
};

export const viewport: Viewport = {
  colorScheme: 'dark',
};

export default function RootLayout({ children, window }: LayoutProps<'/'>): ReactNode {
  return (
    <html lang="es" className={fontVariables}>
      <body className="min-h-dvh bg-canvas font-sans text-foreground antialiased">
        <MotionProvider>
          {children}
          {window}
        </MotionProvider>
      </body>
    </html>
  );
}
