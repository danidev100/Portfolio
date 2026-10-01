/** Edges of a rectangle in the same coordinate space, like a `DOMRect`. */
export interface Box {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const NO_INSETS: Box = { top: 0, right: 0, bottom: 0, left: 0 };

/** How far each edge of `origin` is from the matching edge of `container`. */
export function getInsets(container: Box, origin: Box): Box {
  return {
    top: Math.max(0, origin.top - container.top),
    right: Math.max(0, container.right - origin.right),
    bottom: Math.max(0, container.bottom - origin.bottom),
    left: Math.max(0, origin.left - container.left),
  };
}

/** CSS `clip-path` that shows only the area left inside the insets. */
export function toInsetClipPath({ top, right, bottom, left }: Box, radiusPx: number): string {
  return `inset(${String(top)}px ${String(right)}px ${String(bottom)}px ${String(left)}px round ${String(radiusPx)}px)`;
}
