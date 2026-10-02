import { CAMERA_FOV_DEGREES, type CameraPose } from './cameraPose';
import type { Vec3 } from './scenePanel';

export interface FocusView {
  /** Rotation around the vertical axis that brings the points to face the camera. */
  yaw: number;
  pose: CameraPose;
}

const FULL_TURN = Math.PI * 2;
const HALF_FOV_TANGENT = Math.tan((CAMERA_FOV_DEGREES / 2) * (Math.PI / 180));

/** Closer to the vertical axis than this, a point has no side to turn toward. */
const AXIS_RADIUS = 0.3;

/** The camera looks at a spot between the center of the scene and the points. */
const LOOK_AT_RATIO = 0.6;
/** Free space kept around the points, in world units: room for their labels. */
const FRAME_MARGIN = 0.9;
/** However tight the points are, the camera stays this far from what it looks at. */
const MIN_VIEW_DISTANCE = 4.5;
/** Aspect ratio the frame is computed for; narrower screens fit it afterwards. */
const DEFAULT_ASPECT = 1.3;

function getCentroid(points: readonly Vec3[]): Vec3 {
  const sum = points.reduce<Vec3>(
    (total, point) => [total[0] + point[0], total[1] + point[1], total[2] + point[2]],
    [0, 0, 0],
  );

  return [sum[0] / points.length, sum[1] / points.length, sum[2] / points.length];
}

/** Where a point ends up when the group that holds it turns by `yaw`. */
function rotateY([x, y, z]: Vec3, yaw: number): Vec3 {
  return [x * Math.cos(yaw) + z * Math.sin(yaw), y, -x * Math.sin(yaw) + z * Math.cos(yaw)];
}

/**
 * How to show a set of points that live in a group: turn the group until
 * their center faces the camera, then put the camera in front of it, as far
 * back as it takes to keep every point in the frame.
 */
export function getFocusView(
  points: readonly Vec3[],
  aspect: number = DEFAULT_ASPECT,
): FocusView | null {
  if (points.length === 0) return null;

  const [x, y, z] = getCentroid(points);
  const radius = Math.hypot(x, z);
  const yaw = radius < AXIS_RADIUS ? 0 : -Math.atan2(x, z);
  const lookAt: Vec3 = [0, y * LOOK_AT_RATIO, radius * LOOK_AT_RATIO];

  // The frame widens with distance, so each point asks for the camera to be
  // at least so far in front of it, and the most demanding one decides.
  const cameraZ = points
    .map((point) => rotateY(point, yaw))
    .reduce((farthest, [pointX, pointY, pointZ]) => {
      const neededHalfHeight = Math.max(
        Math.abs(pointY - lookAt[1]) + FRAME_MARGIN,
        (Math.abs(pointX) + FRAME_MARGIN) / aspect,
      );

      return Math.max(farthest, pointZ + neededHalfHeight / HALF_FOV_TANGENT);
    }, lookAt[2] + MIN_VIEW_DISTANCE);

  return { yaw, pose: { position: [0, lookAt[1], cameraZ], lookAt } };
}

/** The angle equivalent to `target` that is less than half a turn from `current`. */
export function getNearestAngle(current: number, target: number): number {
  const turn = target - current;
  const shortestTurn = ((((turn + Math.PI) % FULL_TURN) + FULL_TURN) % FULL_TURN) - Math.PI;

  return current + shortestTurn;
}
