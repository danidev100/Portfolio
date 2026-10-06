import { DOCK_ID, getDockItemId } from './apps';
import { getNextStepIndex, getPreviousStepIndex, TOUR_STEPS } from './tourSteps';

describe('TOUR_STEPS', () => {
  it('points at the profile, then the dock, then the ai', () => {
    expect(TOUR_STEPS.map((step) => step.anchorId)).toEqual([
      getDockItemId('about'),
      DOCK_ID,
      getDockItemId('terminal'),
    ]);
  });

  it('carries the copy agreed in the spec', () => {
    expect(TOUR_STEPS.map((step) => step.body)).toEqual([
      'Empieza aquí: mi perfil, experiencia y CV para descargar.',
      'Cada icono abre una sección en su propia ventana. Ciérrala con ✕ o vuelve a pulsar su icono para minimizarla.',
      'Pregúntale a mi IA por mi experiencia: responde y te muestra en un grafo de qué está hablando.',
    ]);
  });
});

describe('getNextStepIndex', () => {
  it('moves to the following step', () => {
    expect(getNextStepIndex(0, 3)).toBe(1);
  });

  it('is null after the last step, which ends the tour', () => {
    expect(getNextStepIndex(2, 3)).toBeNull();
  });
});

describe('getPreviousStepIndex', () => {
  it('moves to the step before', () => {
    expect(getPreviousStepIndex(2)).toBe(1);
  });

  it('never goes before the first step', () => {
    expect(getPreviousStepIndex(0)).toBe(0);
  });
});
