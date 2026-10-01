import { getInsets, toInsetClipPath } from './reveal';

const CONTAINER = { top: 100, right: 900, bottom: 600, left: 100 };

describe('getInsets', () => {
  it('measures how far each edge of the origin is from the container', () => {
    const origin = { top: 180, right: 620, bottom: 520, left: 380 };

    expect(getInsets(CONTAINER, origin)).toEqual({ top: 80, right: 280, bottom: 80, left: 280 });
  });

  it('is zero on every side when the origin fills the container', () => {
    expect(getInsets(CONTAINER, CONTAINER)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it('never goes negative when the origin sticks out of the container', () => {
    const origin = { top: 60, right: 950, bottom: 640, left: 40 };

    expect(getInsets(CONTAINER, origin)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });
});

describe('toInsetClipPath', () => {
  it('writes the insets clockwise from the top, with rounded corners', () => {
    const insets = { top: 80, right: 280, bottom: 60, left: 240 };

    expect(toInsetClipPath(insets, 20)).toBe('inset(80px 280px 60px 240px round 20px)');
  });
});
