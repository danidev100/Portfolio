import type { ScenePanel } from './scenePanel';

interface SceneArrangement {
  /** Multipliers applied to the authored x and y of every panel. */
  spread: { x: number; y: number };
  /** Narrowest aspect ratio at which the arranged panels still fit in view. */
  minimumAspect: number;
}

const LANDSCAPE: SceneArrangement = { spread: { x: 1, y: 1 }, minimumAspect: 1.5 };

/**
 * On a tall screen the panels move above and below the center instead of
 * shrinking next to it, where they would sit behind the desktop greeting.
 */
const PORTRAIT: SceneArrangement = { spread: { x: 0.45, y: 2.3 }, minimumAspect: 0.82 };

function getArrangement(aspect: number): SceneArrangement {
  return aspect < 1 ? PORTRAIT : LANDSCAPE;
}

export function getMinimumAspect(aspect: number): number {
  return getArrangement(aspect).minimumAspect;
}

export function arrangePanels(
  panels: readonly ScenePanel[],
  aspect: number,
): readonly ScenePanel[] {
  const arrangement = getArrangement(aspect);
  if (arrangement === LANDSCAPE) return panels;

  const { spread } = arrangement;

  return panels.map((panel) => ({
    ...panel,
    position: [panel.position[0] * spread.x, panel.position[1] * spread.y, panel.position[2]],
  }));
}
