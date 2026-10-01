import { getEntryPose, resolveCameraPose, type CameraView } from './cameraPose';
import type { ScenePanel, Vec3 } from './scenePanel';

const WIDE_ASPECT = 16 / 9;

const buildPanel = (overrides: Partial<ScenePanel> = {}): ScenePanel => ({
  id: 'panel',
  position: [0, 0, 0],
  rotationY: 0,
  scale: 1,
  colorVariable: '--color-primary',
  ...overrides,
});

const buildView = (overrides: Partial<CameraView> = {}): CameraView => ({
  panels: [buildPanel()],
  activePanelId: null,
  isPulledBack: false,
  aspect: WIDE_ASPECT,
  ...overrides,
});

const distance = (a: Vec3, b: Vec3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const distanceToTarget = (view: CameraView): number => {
  const pose = resolveCameraPose(view);

  return distance(pose.position, pose.lookAt);
};

describe('resolveCameraPose', () => {
  it('looks at the center of the scene from the front when nothing is active', () => {
    const pose = resolveCameraPose(buildView());

    expect(pose.lookAt).toEqual([0, 0, 0]);
    expect(pose.position[0]).toBe(0);
    expect(pose.position[2]).toBeGreaterThan(0);
  });

  it('looks at the active panel', () => {
    const panel = buildPanel({ id: 'terminal', position: [-3, 1, -1] });

    const pose = resolveCameraPose(buildView({ panels: [panel], activePanelId: 'terminal' }));

    expect(pose.lookAt).toEqual([-3, 1, -1]);
  });

  it('gets closer to its target when a panel is active', () => {
    const home = distanceToTarget(buildView());
    const focused = distanceToTarget(buildView({ activePanelId: 'panel' }));

    expect(focused).toBeLessThan(home);
  });

  it('faces a rotated panel head-on', () => {
    const panel = buildPanel({ rotationY: Math.PI / 2 });

    const pose = resolveCameraPose(buildView({ panels: [panel], activePanelId: 'panel' }));

    expect(pose.position[0]).toBeGreaterThan(0);
    expect(pose.position[2]).toBeCloseTo(0);
  });

  it('keeps more distance from a bigger panel', () => {
    const small = distanceToTarget(buildView({ activePanelId: 'panel' }));
    const big = distanceToTarget(
      buildView({ panels: [buildPanel({ scale: 2 })], activePanelId: 'panel' }),
    );

    expect(big).toBeGreaterThan(small);
  });

  it('stays home when the active panel does not exist', () => {
    const view = buildView();

    expect(resolveCameraPose({ ...view, activePanelId: 'missing' })).toEqual(
      resolveCameraPose(view),
    );
  });

  it('steps back from home when pulled back', () => {
    const home = distanceToTarget(buildView());
    const pulledBack = distanceToTarget(buildView({ isPulledBack: true }));

    expect(pulledBack).toBeGreaterThan(home);
  });

  it('shows the whole scene when pulled back, even with an active panel', () => {
    const panel = buildPanel({ position: [-3, 1, -1] });

    const pose = resolveCameraPose(
      buildView({ panels: [panel], activePanelId: 'panel', isPulledBack: true }),
    );

    expect(pose.lookAt).toEqual([0, 0, 0]);
  });

  it('steps back on narrow screens so the scene still fits', () => {
    const wide = distanceToTarget(buildView());
    const narrow = distanceToTarget(buildView({ aspect: 9 / 16 }));

    expect(narrow).toBeGreaterThan(wide);
  });

  it('does not come closer on screens wider than the reference', () => {
    const wide = distanceToTarget(buildView());
    const ultraWide = distanceToTarget(buildView({ aspect: 32 / 9 }));

    expect(ultraWide).toBeCloseTo(wide);
  });
});

describe('getEntryPose', () => {
  it('starts farther and higher while looking at the same target', () => {
    const pose = resolveCameraPose(buildView());

    const entry = getEntryPose(pose);

    expect(entry.lookAt).toEqual(pose.lookAt);
    expect(distance(entry.position, entry.lookAt)).toBeGreaterThan(
      distance(pose.position, pose.lookAt),
    );
    expect(entry.position[1]).toBeGreaterThan(pose.position[1]);
  });
});
