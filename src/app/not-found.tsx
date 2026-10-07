import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { StandalonePage } from '@/desktop';

export const metadata: Metadata = { title: 'Página no encontrada' };

export default function NotFound(): ReactNode {
  return (
    <StandalonePage title="Esta página no existe">
      <p className="text-muted">
        La dirección no corresponde a ninguna app de Dani OS. Desde el escritorio puedes abrir
        Proyectos, Pregúntale a mi IA, Perfil y CV y Contacto.
      </p>
    </StandalonePage>
  );
}
