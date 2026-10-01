'use client';

import type { ReactNode } from 'react';

import type { ScenePanel } from '../util/scenePanel';
import { RoundedPanel } from './RoundedPanel';
import { readThemeColor } from './themeColor';

const BODY = { width: 3, height: 2.06, radius: 0.2 } as const;
const ICON = { size: 0.44, radius: 0.12 } as const;
const LINE = { height: 0.1, gap: 0.26 } as const;
const LINE_WIDTHS = [1.9, 1.5, 1.1] as const;
const PADDING = 0.3;

/** Layers are stacked slightly apart so they never fight for the same depth. */
const LAYER_GAP = 0.01;
const DETAIL_RENDER_ORDER = 1;

const LEFT_EDGE = -BODY.width / 2 + PADDING;
const ICON_Y = BODY.height / 2 - PADDING - ICON.size / 2;
const FIRST_LINE_Y = ICON_Y - ICON.size / 2 - LINE.gap;

interface WindowGhostProps {
  panel: ScenePanel;
  isActive: boolean;
}

/** The silhouette of an app window, marking that app's place in the scene. */
export function WindowGhost({ panel, isActive }: WindowGhostProps): ReactNode {
  const surface = readThemeColor('--color-surface-raised');
  const line = readThemeColor('--color-border');
  const accent = readThemeColor(panel.colorVariable);

  return (
    <group position={panel.position} rotation-y={panel.rotationY} scale={panel.scale}>
      <RoundedPanel {...BODY} color={surface} opacity={isActive ? 1 : 0.85} />
      <RoundedPanel
        width={ICON.size}
        height={ICON.size}
        radius={ICON.radius}
        color={accent}
        position={[LEFT_EDGE + ICON.size / 2, ICON_Y, LAYER_GAP]}
        renderOrder={DETAIL_RENDER_ORDER}
      />
      {LINE_WIDTHS.map((width, index) => (
        <RoundedPanel
          key={width}
          width={width}
          height={LINE.height}
          radius={LINE.height / 2}
          color={line}
          position={[LEFT_EDGE + width / 2, FIRST_LINE_Y - index * LINE.gap, LAYER_GAP]}
          renderOrder={DETAIL_RENDER_ORDER}
        />
      ))}
    </group>
  );
}
