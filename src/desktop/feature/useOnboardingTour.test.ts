import { act, renderHook } from '@testing-library/react';

import type { OnboardingStorage } from '../data-access/onboardingStorage';
import { useOnboardingTour } from './useOnboardingTour';

const START_DELAY_MS = 700;

function buildStorage(hasSeen: boolean): OnboardingStorage & { markTourSeen: jest.Mock } {
  return { hasSeenTour: () => hasSeen, markTourSeen: jest.fn() };
}

describe('useOnboardingTour', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens a moment after a first visit', () => {
    const { result } = renderHook(() => useOnboardingTour(buildStorage(false), START_DELAY_MS));
    expect(result.current.isOpen).toBe(false);

    act(() => {
      jest.advanceTimersByTime(START_DELAY_MS);
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('stays closed once seen', () => {
    const { result } = renderHook(() => useOnboardingTour(buildStorage(true), START_DELAY_MS));

    act(() => {
      jest.advanceTimersByTime(START_DELAY_MS);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('opens on demand even once seen', () => {
    const { result } = renderHook(() => useOnboardingTour(buildStorage(true), START_DELAY_MS));

    act(() => {
      result.current.start();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('closes and remembers it was seen', () => {
    const storage = buildStorage(false);
    const { result } = renderHook(() => useOnboardingTour(storage, START_DELAY_MS));
    act(() => {
      jest.advanceTimersByTime(START_DELAY_MS);
    });

    act(() => {
      result.current.end();
    });

    expect(result.current.isOpen).toBe(false);
    expect(storage.markTourSeen).toHaveBeenCalledTimes(1);
  });

  it('does not appear later when the visitor got going before it showed', () => {
    const storage = buildStorage(false);
    const { result } = renderHook(() => useOnboardingTour(storage, START_DELAY_MS));

    act(() => {
      result.current.end();
      jest.advanceTimersByTime(START_DELAY_MS);
    });

    expect(result.current.isOpen).toBe(false);
    expect(storage.markTourSeen).toHaveBeenCalledTimes(1);
  });

  it('does nothing when ended while it is not active', () => {
    const storage = buildStorage(true);
    const { result } = renderHook(() => useOnboardingTour(storage, START_DELAY_MS));

    act(() => {
      result.current.end();
    });

    expect(storage.markTourSeen).not.toHaveBeenCalled();
  });

  it('still opens, and can be closed, when the storage is blocked', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const blocked: OnboardingStorage = {
      hasSeenTour: () => false,
      markTourSeen: () => {
        console.warn('blocked');
      },
    };
    const { result } = renderHook(() => useOnboardingTour(blocked, START_DELAY_MS));

    act(() => {
      jest.advanceTimersByTime(START_DELAY_MS);
    });
    act(() => {
      result.current.end();
    });

    expect(result.current.isOpen).toBe(false);
    warn.mockRestore();
  });
});
