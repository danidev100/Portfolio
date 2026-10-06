import { DOCK_ID, getDockItemId } from './apps';

export interface TourStep {
  id: string;
  /** DOM id of the element the balloon points at. Always in the dock, which is always visible. */
  anchorId: string;
  title: string;
  body: string;
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: 'profile',
    anchorId: getDockItemId('about'),
    title: 'Empieza por aquí',
    body: 'Empieza aquí: mi perfil, experiencia y CV para descargar.',
  },
  {
    id: 'dock',
    anchorId: DOCK_ID,
    title: 'Una ventana por sección',
    body: 'Cada icono abre una sección en su propia ventana. Ciérrala con ✕ o vuelve a pulsar su icono para minimizarla.',
  },
  {
    id: 'ai',
    anchorId: getDockItemId('terminal'),
    title: 'Habla con mi IA',
    body: 'Pregúntale a mi IA por mi experiencia: responde y te muestra en un grafo de qué está hablando.',
  },
];

/** The step after `index`, or `null` once the last one is done. */
export function getNextStepIndex(index: number, count: number): number | null {
  return index + 1 < count ? index + 1 : null;
}

export function getPreviousStepIndex(index: number): number {
  return Math.max(0, index - 1);
}
