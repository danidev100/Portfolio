import { CAMERA_FOV_DEGREES } from './cameraPose';
import { getFocusView, getNearestAngle } from './focusView';
import type { Vec3 } from './scenePanel';

const FULL_TURN = Math.PI * 2;

/** Rotates a point around the vertical axis, like the group that holds it. */
const rotateY = ([x, y, z]: Vec3, yaw: number): Vec3 => [
  x * Math.cos(yaw) + z * Math.sin(yaw),
  y,
  -x * Math.sin(yaw) + z * Math.cos(yaw),
];

describe('getFocusView', () => {
  it('has nothing to frame without points', () => {
    expect(getFocusView([])).toBeNull();
  });

  it('turns the group so that the points end up in front of the camera', () => {
    const point: Vec3 = [3, 0.5, 0];

    const view = getFocusView([point]);
    const turned = rotateY(point, view?.yaw ?? NaN);

    expect(turned[0]).toBeCloseTo(0);
    expect(turned[2]).toBeCloseTo(3);
  });

  it('frames the middle of several points', () => {
    const view = getFocusView([
      [2, 1, 2],
      [-2, 1, 2],
    ]);

    expect(view?.yaw).toBeCloseTo(0);
    expect(view?.pose.lookAt[0]).toBeCloseTo(0);
    expect(view?.pose.lookAt[1]).toBeGreaterThan(0);
  });

  it('places the camera in front of the points, looking back at them', () => {
    const view = getFocusView([[0, 0, 3]]);

    expect(view?.pose.position[0]).toBeCloseTo(0);
    expect(view?.pose.position[2]).toBeGreaterThan(view?.pose.lookAt[2] ?? NaN);
  });

  it('does not turn for points on the vertical axis, which have no side to face', () => {
    const view = getFocusView([[0, 2, 0]]);

    expect(view?.yaw).toBe(0);
  });
});

describe('getNearestAngle', () => {
  it('keeps a target that is already less than half a turn away', () => {
    expect(getNearestAngle(0, 1)).toBeCloseTo(1);
  });

  it('goes the short way round instead of unwinding whole turns', () => {
    const current = 3 * FULL_TURN + 0.2;

    expect(getNearestAngle(current, 0.5)).toBeCloseTo(3 * FULL_TURN + 0.5);
  });

  it('crosses zero backwards when that is shorter', () => {
    expect(getNearestAngle(0.2, FULL_TURN - 0.3)).toBeCloseTo(-0.3);
  });
});

describe('getFocusView framing', () => {
  const ASPECT = 1.3;
  const HALF_FOV_TANGENT = Math.tan((CAMERA_FOV_DEGREES / 2) * (Math.PI / 180));

  /** Whether a point, once the group has turned, falls inside the camera frame. */
  const isInFrame = (point: Vec3, view: NonNullable<ReturnType<typeof getFocusView>>): boolean => {
    const [x, y, z] = rotateY(point, view.yaw);
    const [cameraX, cameraY, cameraZ] = view.pose.position;
    const halfHeight = (cameraZ - z) * HALF_FOV_TANGENT;

    return Math.abs(x - cameraX) < halfHeight * ASPECT && Math.abs(y - cameraY) < halfHeight;
  };

  it('steps back for points that are far apart', () => {
    const tight = getFocusView([
      [0.2, 0, 3],
      [-0.2, 0, 3],
    ]);
    const wide = getFocusView([
      [3, 0, 1],
      [-3, 0, 1],
    ]);

    expect(wide?.pose.position[2]).toBeGreaterThan(tight?.pose.position[2] ?? NaN);
  });

  it('keeps every point inside the frame, however spread out they are', () => {
    const points: Vec3[] = [
      [3.2, 1.8, 0.4],
      [-3.1, -2.2, 0.6],
      [0.5, 2.5, -1],
      [1, -2.4, 2.9],
    ];

    const view = getFocusView(points, ASPECT);

    expect(view).not.toBeNull();
    expect(points.every((point) => view !== null && isInFrame(point, view))).toBe(true);
  });
});
