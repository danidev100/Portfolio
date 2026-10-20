import { isAskEvent } from './isAskEvent';

describe('isAskEvent', () => {
  it('accepts every kind of event', () => {
    const events = [
      { type: 'focus_nodes', nodeIds: ['hp'] },
      { type: 'token', text: 'Hola' },
      { type: 'done' },
      { type: 'error', message: 'Algo falló' },
    ];

    for (const event of events) expect(isAskEvent(event)).toBe(true);
  });

  it('rejects malformed events', () => {
    const malformed: unknown[] = [
      null,
      'done',
      { type: 'token' },
      { type: 'token', text: 1 },
      { type: 'focus_nodes', nodeIds: [1] },
      { type: 'focus_nodes', nodeIds: 'hp' },
      { type: 'error' },
      { type: 'nope' },
    ];

    for (const value of malformed) expect(isAskEvent(value)).toBe(false);
  });
});
