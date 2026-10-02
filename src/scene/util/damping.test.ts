import { clampFrameDelta, getDampingFactor, isSettled, MAX_FRAME_DELTA_S } from './damping';

const LAMBDA = 3.2;

describe('getDampingFactor', () => {
  it('does not move when no time has passed', () => {
    expect(getDampingFactor(LAMBDA, 0)).toBe(0);
  });

  it('covers part of the remaining distance each frame, never all of it', () => {
    const factor = getDampingFactor(LAMBDA, 1 / 60);

    expect(factor).toBeGreaterThan(0);
    expect(factor).toBeLessThan(1);
  });

  it('is frame-rate independent: two half steps equal one full step', () => {
    const fullStep = getDampingFactor(LAMBDA, 1 / 30);
    const halfStep = getDampingFactor(LAMBDA, 1 / 60);

    const remainingAfterTwoHalfSteps = (1 - halfStep) ** 2;

    expect(1 - fullStep).toBeCloseTo(remainingAfterTwoHalfSteps);
  });

  it('approaches the target faster with a higher lambda', () => {
    expect(getDampingFactor(LAMBDA * 2, 1 / 60)).toBeGreaterThan(getDampingFactor(LAMBDA, 1 / 60));
  });
});

describe('isSettled', () => {
  it('is settled when the positions are indistinguishable', () => {
    expect(isSettled([1, 2, 3], [1, 2, 3.0001])).toBe(true);
  });

  it('is not settled while there is visible distance left', () => {
    expect(isSettled([1, 2, 3], [1, 2, 3.1])).toBe(false);
  });
});

describe('clampFrameDelta', () => {
  it('keeps the time of a normal frame', () => {
    expect(clampFrameDelta(1 / 60)).toBeCloseTo(1 / 60);
  });

  it('caps the long gap of the first frame after an idle period', () => {
    expect(clampFrameDelta(4)).toBe(MAX_FRAME_DELTA_S);
  });
});
