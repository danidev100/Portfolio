import {
  getCardOpacity,
  getFrontIndex,
  getNeighborRotation,
  getReleaseRotation,
  getRotationToIndex,
  getSnapRotation,
  getStep,
  isWithinReach,
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

  it('keeps the neighbors of the front card fully opaque, so their text stays legible', () => {
    expect(getCardOpacity(1, 0, COUNT)).toBeCloseTo(1);
    expect(getCardOpacity(COUNT - 1, 0, COUNT)).toBeCloseTo(1);
  });

  it('fades the cards beyond the neighbors', () => {
    expect(getCardOpacity(2, 0, COUNT)).toBeLessThan(1);
  });

  it('fades a card gradually as it turns away past the neighbor position', () => {
    const justPast = getCardOpacity(1, -0.25 * -STEP, COUNT);
    const farther = getCardOpacity(1, -0.75 * -STEP, COUNT);

    expect(justPast).toBeLessThan(1);
    expect(farther).toBeLessThan(justPast);
  });

  it('hides the cards that face sideways or away', () => {
    expect(getCardOpacity(2, 0, COUNT)).toBeCloseTo(0);
    expect(getCardOpacity(4, 0, COUNT)).toBe(0);
  });
});

describe('isWithinReach', () => {
  it('reaches the front card and its two neighbors', () => {
    expect(isWithinReach(0, 0, COUNT)).toBe(true);
    expect(isWithinReach(1, 0, COUNT)).toBe(true);
    expect(isWithinReach(COUNT - 1, 0, COUNT)).toBe(true);
  });

  it('does not reach the cards that face sideways or away', () => {
    expect(isWithinReach(2, 0, COUNT)).toBe(false);
    expect(isWithinReach(4, 0, COUNT)).toBe(false);
  });

  it('counts the neighbors around the end of the ring', () => {
    expect(isWithinReach(0, COUNT - 1, COUNT)).toBe(true);
  });
});
