export type Vec3 = readonly [x: number, y: number, z: number];

/** A place in 3D space that the camera can fly to, drawn as a rounded panel. */
export interface ScenePanel {
  id: string;
  position: Vec3;
  /** Rotation around the vertical axis, in radians. */
  rotationY: number;
  scale: number;
  /** Name of the CSS variable that holds the accent color, e.g. `--color-primary`. */
  colorVariable: string;
}
