/**
 * Motion only keeps corners round while it scales an element when the radius
 * is a number, so these mirror the `--radius-*` tokens.
 */
export const RADIUS_PX = { control: 14, card: 20, window: 28 } as const;

/** Critically damped: a shared element settles without overshooting. */
export const MORPH_TRANSITION = { type: 'spring', duration: 0.5, bounce: 0 } as const;

export const FADE_TRANSITION = { duration: 0.2, ease: 'easeOut' } as const;

/** Fades content in once most of a morph is done, so it is never seen stretched. */
export const REVEAL_TRANSITION = { ...FADE_TRANSITION, delay: 0.25 };
