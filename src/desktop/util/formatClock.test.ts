import { formatClock } from './formatClock';

describe('formatClock', () => {
  it('formats the date as short weekday, day, month and 24h time', () => {
    const date = new Date('2026-10-01T16:39:00Z');

    expect(formatClock(date, 'UTC')).toBe('jue 1 oct · 16:39');
  });

  it('uses the given time zone', () => {
    const date = new Date('2026-10-01T02:05:00Z');

    expect(formatClock(date, 'America/Bogota')).toBe('mié 30 sept · 21:05');
  });
});
