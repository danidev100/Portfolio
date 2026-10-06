import { act, render, screen } from '@testing-library/react';

import { TypewriterText } from './TypewriterText';

const TEXT = 'Hola, soy la IA de Daniel.';

describe('TypewriterText', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('types the text word by word', () => {
    render(<TypewriterText text={TEXT} isTyping />);
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText(TEXT)).toBeInTheDocument();
  });

  it('shows the whole text at once when it is not typing', () => {
    render(<TypewriterText text={TEXT} isTyping={false} />);

    expect(screen.getByText(TEXT)).toBeInTheDocument();
  });

  describe('with reduced motion', () => {
    // jsdom has no `matchMedia`: it is defined for these tests and removed after.
    beforeEach(() => {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        value: jest.fn().mockReturnValue({ matches: true }),
      });
    });

    afterEach(() => {
      Reflect.deleteProperty(window, 'matchMedia');
    });

    it('starts like the server renders it, so hydration matches', () => {
      render(<TypewriterText text={TEXT} isTyping />);

      expect(screen.queryByText(TEXT)).not.toBeInTheDocument();
    });

    it('shows the whole text at the first tick instead of typing it', () => {
      render(<TypewriterText text={TEXT} isTyping />);

      act(() => {
        jest.advanceTimersByTime(35);
      });

      expect(screen.getByText(TEXT)).toBeInTheDocument();
    });
  });
});
