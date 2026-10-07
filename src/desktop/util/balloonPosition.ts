/** A box on screen, like a `DOMRect`. */
export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export interface BalloonPosition {
  /** Distance from the left edge of the screen. */
  left: number;
  /** Distance from the bottom edge of the screen: the balloon sits above its anchor. */
  bottom: number;
  /** Where the arrow goes, from the left edge of the balloon. */
  arrowLeft: number;
}

const MAX_WIDTH_PX = 320;
const VIEWPORT_MARGIN_PX = 16;
const ANCHOR_GAP_PX = 12;
/** Keeps the arrow off the rounded corners of the balloon. */
const ARROW_INSET_PX = 24;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getBalloonWidth(viewportWidth: number): number {
  return Math.min(MAX_WIDTH_PX, viewportWidth - VIEWPORT_MARGIN_PX * 2);
}

/** Centers the balloon above its anchor, pushed back inside the screen near an edge. */
export function getBalloonPosition(
  anchor: Rect,
  viewport: ViewportSize,
  width: number,
): BalloonPosition {
  const anchorCenter = anchor.left + anchor.width / 2;
  const maxLeft = Math.max(VIEWPORT_MARGIN_PX, viewport.width - VIEWPORT_MARGIN_PX - width);
  const left = clamp(anchorCenter - width / 2, VIEWPORT_MARGIN_PX, maxLeft);

  return {
    left,
    bottom: viewport.height - anchor.top + ANCHOR_GAP_PX,
    arrowLeft: clamp(anchorCenter - left, ARROW_INSET_PX, width - ARROW_INSET_PX),
  };
}
