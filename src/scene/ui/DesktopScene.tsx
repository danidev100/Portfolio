'use client';

import { useThree } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import { useMemo, type ReactNode } from 'react';

import { resolveCameraPose } from '../util/cameraPose';
import { arrangePanels } from '../util/sceneLayout';
import type { ScenePanel } from '../util/scenePanel';
import { CameraRig } from './CameraRig';
import { Particles } from './Particles';
import { SceneCanvas } from './SceneCanvas';
import { WindowGhost } from './WindowGhost';

interface DesktopSceneProps {
  /** Must keep its identity between renders: the camera target depends on it. */
  panels: readonly ScenePanel[];
  activePanelId: string | null;
  isPulledBack: boolean;
}

interface StageProps extends DesktopSceneProps {
  isMotionReduced: boolean;
}

function Stage({ panels, activePanelId, isPulledBack, isMotionReduced }: StageProps): ReactNode {
  const aspect = useThree((state) => state.size.width / state.size.height);
  const arrangedPanels = useMemo(() => arrangePanels(panels, aspect), [panels, aspect]);
  // The rig restarts its motion whenever the pose object changes.
  const pose = useMemo(
    () => resolveCameraPose({ panels: arrangedPanels, activePanelId, isPulledBack, aspect }),
    [arrangedPanels, activePanelId, isPulledBack, aspect],
  );

  return (
    <>
      <CameraRig pose={pose} isMotionReduced={isMotionReduced} />
      <Particles />
      {arrangedPanels.map((panel) => (
        <WindowGhost key={panel.id} panel={panel} isActive={panel.id === activePanelId} />
      ))}
    </>
  );
}

/**
 * The 3D layer behind the desktop: the camera flies to the active panel. It is
 * decorative, so it stays out of the way of pointers and assistive technology.
 */
export function DesktopScene(props: DesktopSceneProps): ReactNode {
  const isMotionReduced = useReducedMotion() ?? false;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <SceneCanvas>
        <Stage {...props} isMotionReduced={isMotionReduced} />
      </SceneCanvas>
    </div>
  );
}
