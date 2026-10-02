import { getMinimumAspect } from './sceneLayout';
import type { ScenePanel, Vec3 } from './scenePanel';

export interface CameraPose {
  position: Vec3;
  lookAt: Vec3;
}

export interface CameraView {
  panels: readonly ScenePanel[];
  activePanelId: string | null;
  /** Steps back to show the whole scene, whatever panel is active. */
  isPulledBack: boolean;
  aspect: number;
}

/** Vertical field of view of every scene camera. */
export const CAMERA_FOV_DEGREES = 45;

const HOME_POSE: CameraPose = { position: [0, 0.2, 8.6], lookAt: [0, 0, 0] };

/** Distance from the camera to a panel of scale 1 when it is active. */
const PANEL_VIEW_DISTANCE = 5.4;
const PULLED_BACK_DISTANCE_RATIO = 1.35;

const ENTRY_DISTANCE_RATIO = 1.9;
const ENTRY_LIFT = 2.2;

/** Moves the camera along its line of sight: ratio > 1 steps back. */
function scaleDistance({ position, lookAt }: CameraPose, ratio: number): CameraPose {
  return {
    position: [
      lookAt[0] + (position[0] - lookAt[0]) * ratio,
      lookAt[1] + (position[1] - lookAt[1]) * ratio,
      lookAt[2] + (position[2] - lookAt[2]) * ratio,
    ],
    lookAt,
  };
}

function getPanelPose({ position, rotationY, scale }: ScenePanel): CameraPose {
  const viewDistance = PANEL_VIEW_DISTANCE * scale;

  return {
    position: [
      position[0] + Math.sin(rotationY) * viewDistance,
      position[1],
      position[2] + Math.cos(rotationY) * viewDistance,
    ],
    lookAt: position,
  };
}

function getBasePose({ panels, activePanelId, isPulledBack }: CameraView): CameraPose {
  if (isPulledBack) return scaleDistance(HOME_POSE, PULLED_BACK_DISTANCE_RATIO);

  const activePanel = panels.find((panel) => panel.id === activePanelId);

  return activePanel ? getPanelPose(activePanel) : HOME_POSE;
}

/**
 * On a screen narrower than `minimumAspect`, the aspect ratio the scene was
 * framed for, the camera steps back until the scene fits again.
 */
export function fitPoseToAspect(
  pose: CameraPose,
  aspect: number,
  minimumAspect: number,
): CameraPose {
  const fitRatio = Math.max(1, minimumAspect / aspect);

  return fitRatio === 1 ? pose : scaleDistance(pose, fitRatio);
}

export function resolveCameraPose(view: CameraView): CameraPose {
  return fitPoseToAspect(getBasePose(view), view.aspect, getMinimumAspect(view.aspect));
}

/** Where the camera starts so that it arrives at `pose` with a dolly-in. */
export function getEntryPose(pose: CameraPose): CameraPose {
  const { position, lookAt } = scaleDistance(pose, ENTRY_DISTANCE_RATIO);

  return { position: [position[0], position[1] + ENTRY_LIFT, position[2]], lookAt };
}
