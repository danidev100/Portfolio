import {
  getCardOpacity,
  getFrontIndex,
  getNeighborRotation,
  getReleaseRotation,
  getRotationToIndex,
  getSnapRotation,
  getStep,
} from './orbit';

const COUNT = 8;
const STEP = Math.PI / 4;
const FULL_TURN = Math.PI * 2;

describe('getStep', () => {
  it('splits the full turn evenly between the cards', () => {
    expect(getStep(COUNT)).toBeCloseTo(STEP);
  });
});

describe('getFrontIndex', () => {
  it('is the first card when the ring has not turned', () => {
    expect(getFrontIndex(0, COUNT)).toBe(0);
  });

  it('advances as the ring turns to the left', () => {
    expect(getFrontIndex(-STEP, COUNT)).toBe(1);
    expect(getFrontIndex(-3 * STEP, COUNT)).toBe(3);
  });

  it('wraps to the last card when the ring turns to the right', () => {
    expect(getFrontIndex(STEP, COUNT)).toBe(COUNT - 1);
  });

  it('picks the nearest card between two positions', () => {
    expect(getFrontIndex(-0.4 * STEP, COUNT)).toBe(0);
    expect(getFrontIndex(-0.6 * STEP, COUNT)).toBe(1);
  });

  it('wraps after more than one full turn', () => {
    expect(getFrontIndex(-(FULL_TURN + STEP), COUNT)).toBe(1);
  });
});

describe('getSnapRotation', () => {
  it('settles on the nearest card', () => {
    expect(getSnapRotation(-1.2 * STEP, COUNT)).toBeCloseTo(-STEP);
    expect(getSnapRotation(0.7 * STEP, COUNT)).toBeCloseTo(STEP);
  });
});

describe('getRotationToIndex', () => {
  it('turns left to reach a card on the right side', () => {
    expect(getRotationToIndex(0, 2, COUNT)).toBeCloseTo(-2 * STEP);
  });

  it('takes the short way round to a card on the left side', () => {
    expect(getRotationToIndex(0, COUNT - 1, COUNT)).toBeCloseTo(STEP);
  });

  it('stays within half a turn of the current rotation after many turns', () => {
    const rotation = -3 * FULL_TURN;

    const target = getRotationToIndex(rotation, 1, COUNT);

    expect(target).toBeCloseTo(rotation - STEP);
  });

  it('does not move when the card is already in front', () => {
    expect(getRotationToIndex(-2 * STEP, 2, COUNT)).toBeCloseTo(-2 * STEP);
  });
});

describe('getNeighborRotation', () => {
  it('brings the next card to the front', () => {
    const rotation = getNeighborRotation(0, 1, COUNT);

    expect(getFrontIndex(rotation, COUNT)).toBe(1);
  });

  it('brings the previous card to the front', () => {
    const rotation = getNeighborRotation(0, -1, COUNT);

    expect(getFrontIndex(rotation, COUNT)).toBe(COUNT - 1);
  });

  it('moves a single card even when the ring is between two positions', () => {
    const rotation = getNeighborRotation(-0.3 * STEP, 1, COUNT);

    expect(rotation).toBeCloseTo(-STEP);
  });
});

describe('getReleaseRotation', () => {
  it('settles on the nearest card when released without speed', () => {
    expect(getReleaseRotation(-1.2 * STEP, 0, COUNT)).toBeCloseTo(-STEP);
  });

  it('carries on in the direction of a fast release', () => {
    const slow = getReleaseRotation(0, -0.5, COUNT);
    const fast = getReleaseRotation(0, -8, COUNT);

    expect(fast).toBeLessThan(slow);
  });

  it('always lands exactly on a card', () => {
    const rotation = getReleaseRotation(0.37, -3.3, COUNT);

    expect(rotation / STEP).toBeCloseTo(Math.round(rotation / STEP));
  });
});

describe('getCardOpacity', () => {
  it('is fully opaque for the card in front', () => {
    expect(getCardOpacity(0, 0, COUNT)).toBeCloseTo(1);
    expect(getCardOpacity(2, -2 * STEP, COUNT)).toBeCloseTo(1);
  });

  it('fades the cards toward the sides', () => {
    const front = getCardOpacity(0, 0, COUNT);
    const neighbor = getCardOpacity(1, 0, COUNT);
    const side = getCardOpacity(2, 0, COUNT);

    expect(neighbor).toBeLessThan(front);
    expect(side).toBeLessThan(neighbor);
  });

  it('never fades a card out completely', () => {
    expect(getCardOpacity(2, 0, COUNT)).toBeGreaterThan(0);
  });
});
