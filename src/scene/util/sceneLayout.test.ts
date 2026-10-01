import type { ScenePanel } from './scenePanel';
import { arrangePanels, getMinimumAspect } from './sceneLayout';

const LANDSCAPE = 16 / 9;
const PORTRAIT = 9 / 16;

const PANELS: readonly ScenePanel[] = [
  { id: 'left', position: [-3, 1, -1], rotationY: 0.3, scale: 1, colorVariable: '--color-ai' },
  { id: 'right', position: [3, -1, -1], rotationY: -0.3, scale: 1, colorVariable: '--color-ai' },
];

describe('arrangePanels', () => {
  it('keeps the authored layout on landscape screens', () => {
    expect(arrangePanels(PANELS, LANDSCAPE)).toBe(PANELS);
  });

  it('brings the panels toward the middle column on portrait screens', () => {
    const [left, right] = arrangePanels(PANELS, PORTRAIT);

    expect(Math.abs(left?.position[0] ?? NaN)).toBeLessThan(3);
    expect(Math.abs(right?.position[0] ?? NaN)).toBeLessThan(3);
  });

  it('moves the panels away from the vertical center on portrait screens', () => {
    const [left, right] = arrangePanels(PANELS, PORTRAIT);

    expect(left?.position[1]).toBeGreaterThan(1);
    expect(right?.position[1]).toBeLessThan(-1);
  });

  it('keeps the depth and identity of every panel', () => {
    const arranged = arrangePanels(PANELS, PORTRAIT);

    expect(arranged.map((panel) => panel.id)).toEqual(['left', 'right']);
    expect(arranged.map((panel) => panel.position[2])).toEqual([-1, -1]);
  });
});

describe('getMinimumAspect', () => {
  it('needs less width for the portrait arrangement than for the landscape one', () => {
    expect(getMinimumAspect(PORTRAIT)).toBeLessThan(getMinimumAspect(LANDSCAPE));
  });
});
