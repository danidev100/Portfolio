import { act, render, screen } from '@testing-library/react';

import { formatClock } from '../util/formatClock';
import { Clock } from './Clock';

const ONE_MINUTE_MS = 60_000;

describe('Clock', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-10-01T16:39:20Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the current date and time', () => {
    render(<Clock />);

    expect(screen.getByRole('time')).toHaveTextContent(formatClock(new Date()));
  });

  it('keeps up as the minutes pass', () => {
    render(<Clock />);

    act(() => {
      jest.advanceTimersByTime(ONE_MINUTE_MS);
    });

    expect(screen.getByRole('time')).toHaveTextContent(formatClock(new Date()));
    expect(screen.getByRole('time')).toHaveTextContent(':40');
  });
});
