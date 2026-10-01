const CLOCK_LOCALE = 'es';

type ClockPart = 'weekday' | 'day' | 'month' | 'hour' | 'minute';

/** Formats a date like the GNOME top bar: `jue 1 oct · 16:39`. */
export function formatClock(date: Date, timeZone?: string): string {
  const parts = new Intl.DateTimeFormat(CLOCK_LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).formatToParts(date);

  const valueOf = (type: ClockPart): string =>
    parts.find((part) => part.type === type)?.value.replace('.', '') ?? '';

  return `${valueOf('weekday')} ${valueOf('day')} ${valueOf('month')} · ${valueOf('hour')}:${valueOf('minute')}`;
}
