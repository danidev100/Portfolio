'use client';

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';

import { TourBalloon } from '../ui/TourBalloon';
import {
  getBalloonPosition,
  getBalloonWidth,
  type Rect,
  type ViewportSize,
} from '../util/balloonPosition';
import { getNextStepIndex, getPreviousStepIndex, TOUR_STEPS } from '../util/tourSteps';

const HIGHLIGHT_ATTRIBUTE = 'data-tour-highlight';

interface AnchorLayout {
  anchor: Rect;
  viewport: ViewportSize;
}

function measureAnchor(anchorId: string): AnchorLayout | null {
  const element = document.getElementById(anchorId);
  if (!element) return null;

  const { top, left, width, height } = element.getBoundingClientRect();

  return {
    anchor: { top, left, width, height },
    viewport: { width: window.innerWidth, height: window.innerHeight },
  };
}

/** Where the anchor is on screen, measured again when the window resizes. */
function useAnchorLayout(anchorId: string): AnchorLayout | null {
  const [layout, setLayout] = useState<AnchorLayout | null>(null);

  useEffect(() => {
    const update = (): void => {
      setLayout(measureAnchor(anchorId));
    };
    // Measured on the next frame, once the dock has its final layout.
    const frame = requestAnimationFrame(update);
    window.addEventListener('resize', update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
    };
  }, [anchorId]);

  return layout;
}

/** Rings the element the current step points at. */
function useHighlight(anchorId: string): void {
  useEffect(() => {
    const element = document.getElementById(anchorId);
    element?.setAttribute(HIGHLIGHT_ATTRIBUTE, '');

    return () => {
      element?.removeAttribute(HIGHLIGHT_ATTRIBUTE);
    };
  }, [anchorId]);
}

interface OnboardingTourProps {
  /** Ends the tour: «Saltar guía», «Terminar», Escape. */
  onClose: () => void;
  /** The link on the last step. It ends the tour itself, through the app it opens. */
  finalAction: {
    label: string;
    href: string;
    onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  };
}

export function OnboardingTour({ onClose, finalAction }: OnboardingTourProps): ReactNode {
  const [stepIndex, setStepIndex] = useState(0);
  const step = TOUR_STEPS[stepIndex] ?? TOUR_STEPS[0];
  const anchorId = step?.anchorId ?? '';
  const layout = useAnchorLayout(anchorId);
  // Where the focus was before the tour took it, to give it back on close. Read
  // on the first render: the balloon takes the focus in its own effect, which
  // runs before any effect of this component. The tour only renders in the
  // browser (it opens after mount), so `document` exists here.
  const returnFocusRef = useRef<Element | null>(document.activeElement);
  useHighlight(anchorId);

  if (!step || !layout) return null;

  /** Closing gives the focus back; opening an app leaves it to the new window. */
  const close = (): void => {
    const returnFocus = returnFocusRef.current;
    onClose();
    if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus();
  };

  const width = getBalloonWidth(layout.viewport.width);

  return (
    <TourBalloon
      step={step}
      stepNumber={stepIndex + 1}
      stepCount={TOUR_STEPS.length}
      position={getBalloonPosition(layout.anchor, layout.viewport, width)}
      width={width}
      finalAction={finalAction}
      onNext={() => {
        const nextIndex = getNextStepIndex(stepIndex, TOUR_STEPS.length);
        if (nextIndex === null) close();
        else setStepIndex(nextIndex);
      }}
      onPrevious={() => {
        setStepIndex(getPreviousStepIndex(stepIndex));
      }}
      onClose={close}
    />
  );
}
