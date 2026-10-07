import { getBalloonPosition, getBalloonWidth } from './balloonPosition';

const VIEWPORT = { width: 1280, height: 800 };

describe('getBalloonWidth', () => {
  it('is 20rem where there is room', () => {
    expect(getBalloonWidth(1280)).toBe(320);
  });

  it('leaves a margin on each side of a narrow screen', () => {
    expect(getBalloonWidth(320)).toBe(288);
  });
});

describe('getBalloonPosition', () => {
  const anchor = { top: 720, left: 600, width: 64, height: 68 };

  it('centers the balloon over its anchor', () => {
    const position = getBalloonPosition(anchor, VIEWPORT, 320);

    expect(position.left + 320 / 2).toBe(anchor.left + anchor.width / 2);
  });

  it('sits above the anchor, with a gap', () => {
    const position = getBalloonPosition(anchor, VIEWPORT, 320);

    expect(VIEWPORT.height - position.bottom).toBeLessThan(anchor.top);
  });

  it('stays inside the screen when the anchor is near an edge', () => {
    const nearLeft = getBalloonPosition({ ...anchor, left: 0 }, VIEWPORT, 320);
    const nearRight = getBalloonPosition({ ...anchor, left: 1250 }, VIEWPORT, 320);

    expect(nearLeft.left).toBeGreaterThanOrEqual(16);
    expect(nearRight.left + 320).toBeLessThanOrEqual(VIEWPORT.width - 16);
  });

  it('points the arrow at the anchor when the balloon is pushed aside', () => {
    const nearEdge = { ...anchor, left: 40 };

    const position = getBalloonPosition(nearEdge, VIEWPORT, 320);

    expect(position.left + position.arrowLeft).toBe(nearEdge.left + nearEdge.width / 2);
  });

  it('keeps the arrow off the rounded corner when the anchor is right at the edge', () => {
    const position = getBalloonPosition({ ...anchor, left: 0 }, VIEWPORT, 320);

    expect(position.arrowLeft).toBe(24);
  });

  it('fits a 320px phone', () => {
    const phone = { width: 320, height: 640 };
    const width = getBalloonWidth(phone.width);

    const position = getBalloonPosition(
      { top: 570, left: 230, width: 64, height: 68 },
      phone,
      width,
    );

    expect(position.left).toBeGreaterThanOrEqual(16);
    expect(position.left + width).toBeLessThanOrEqual(phone.width - 16);
  });
});
