import type { ScenePanel } from '@/scene';

import { APP_IDS, APPS, type AppId } from '../util/apps';

type PanelPlacement = Pick<ScenePanel, 'position' | 'rotationY' | 'scale'>;

/** The four corners leave the center free for the desktop greeting. */
const PLACEMENTS: Record<AppId, PanelPlacement> = {
  terminal: { position: [-3.45, 0.95, -0.9], rotationY: 0.36, scale: 0.82 },
  about: { position: [-3.15, -1.15, -0.6], rotationY: 0.32, scale: 0.74 },
  projects: { position: [3.45, 0.9, -0.9], rotationY: -0.36, scale: 0.86 },
  contact: { position: [3.15, -1.2, -0.6], rotationY: -0.32, scale: 0.7 },
};

/** Where each app lives in the 3D scene behind the desktop. */
export const APP_SCENE_PANELS: readonly ScenePanel[] = APP_IDS.map((id) => ({
  ...PLACEMENTS[id],
  id,
  colorVariable: `--color-${APPS[id].tone}`,
}));
