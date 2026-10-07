'use client';

import { useEffect, useRef, useState } from 'react';

import { browserOnboardingStorage, type OnboardingStorage } from '../data-access/onboardingStorage';

/** Lets the desktop paint and settle before the first balloon points at it. */
const TOUR_START_DELAY_MS = 700;

export interface OnboardingTourControls {
  isOpen: boolean;
  start: () => void;
  /** Closes the tour, or cancels it before it shows, and remembers it was seen. */
  end: () => void;
}

/** Shows the tour on a first visit, and on demand from «Guía». */
export function useOnboardingTour(
  storage: OnboardingStorage = browserOnboardingStorage,
  startDelayMs: number = TOUR_START_DELAY_MS,
): OnboardingTourControls {
  const [isOpen, setIsOpen] = useState(false);
  const pendingStartRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (storage.hasSeenTour()) return;

    pendingStartRef.current = setTimeout(() => {
      pendingStartRef.current = null;
      setIsOpen(true);
    }, startDelayMs);

    return () => {
      if (pendingStartRef.current) clearTimeout(pendingStartRef.current);
    };
  }, [storage, startDelayMs]);

  return {
    isOpen,
    start: () => {
      setIsOpen(true);
    },
    end: () => {
      const isPending = pendingStartRef.current !== null;
      if (pendingStartRef.current) {
        clearTimeout(pendingStartRef.current);
        pendingStartRef.current = null;
      }
      if (!isOpen && !isPending) return;

      setIsOpen(false);
      storage.markTourSeen();
    },
  };
}
