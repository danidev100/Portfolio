import {
  closeWindow,
  focusWindow,
  getFocusedWindowId,
  minimizeAllWindows,
  minimizeWindow,
  openWindow,
  type WindowStack,
} from './windowManager';

const EMPTY: WindowStack = [];

const ids = (stack: WindowStack): string[] => stack.map((managedWindow) => managedWindow.id);

describe('openWindow', () => {
  it('adds a closed window on top of the stack', () => {
    const stack = openWindow(openWindow(EMPTY, 'projects'), 'terminal');

    expect(ids(stack)).toEqual(['projects', 'terminal']);
  });

  it('raises an already open window instead of duplicating it', () => {
    const stack = openWindow(openWindow(openWindow(EMPTY, 'projects'), 'terminal'), 'projects');

    expect(ids(stack)).toEqual(['terminal', 'projects']);
  });

  it('restores a minimized window', () => {
    const minimized = minimizeWindow(openWindow(EMPTY, 'projects'), 'projects');

    const stack = openWindow(minimized, 'projects');

    expect(stack).toEqual([{ id: 'projects', isMinimized: false }]);
  });

  it('returns the same stack when the window is already focused', () => {
    const stack = openWindow(EMPTY, 'projects');

    expect(openWindow(stack, 'projects')).toBe(stack);
  });
});

describe('focusWindow', () => {
  it('raises an open window to the top', () => {
    const stack = focusWindow(openWindow(openWindow(EMPTY, 'projects'), 'terminal'), 'projects');

    expect(ids(stack)).toEqual(['terminal', 'projects']);
  });

  it('ignores a window that is not open', () => {
    const stack = openWindow(EMPTY, 'projects');

    expect(focusWindow(stack, 'terminal')).toBe(stack);
  });

  it('ignores a minimized window', () => {
    const stack = minimizeWindow(openWindow(openWindow(EMPTY, 'projects'), 'terminal'), 'projects');

    expect(focusWindow(stack, 'projects')).toBe(stack);
  });
});

describe('minimizeWindow', () => {
  it('keeps the window open but hidden', () => {
    const stack = minimizeWindow(openWindow(EMPTY, 'projects'), 'projects');

    expect(stack).toEqual([{ id: 'projects', isMinimized: true }]);
  });

  it('ignores a window that is not open', () => {
    const stack = openWindow(EMPTY, 'projects');

    expect(minimizeWindow(stack, 'terminal')).toBe(stack);
  });
});

describe('closeWindow', () => {
  it('removes the window from the stack', () => {
    const stack = closeWindow(openWindow(openWindow(EMPTY, 'projects'), 'terminal'), 'projects');

    expect(ids(stack)).toEqual(['terminal']);
  });

  it('ignores a window that is not open', () => {
    const stack = openWindow(EMPTY, 'projects');

    expect(closeWindow(stack, 'terminal')).toBe(stack);
  });
});

describe('minimizeAllWindows', () => {
  it('minimizes every open window', () => {
    const stack = minimizeAllWindows(openWindow(openWindow(EMPTY, 'projects'), 'terminal'));

    expect(stack.every((managedWindow) => managedWindow.isMinimized)).toBe(true);
  });

  it('returns the same stack when nothing is visible', () => {
    const stack = minimizeWindow(openWindow(EMPTY, 'projects'), 'projects');

    expect(minimizeAllWindows(stack)).toBe(stack);
  });
});

describe('getFocusedWindowId', () => {
  it('is null when no window is open', () => {
    expect(getFocusedWindowId(EMPTY)).toBeNull();
  });

  it('is the topmost visible window', () => {
    const stack = openWindow(openWindow(EMPTY, 'projects'), 'terminal');

    expect(getFocusedWindowId(stack)).toBe('terminal');
  });

  it('skips minimized windows', () => {
    const stack = minimizeWindow(openWindow(openWindow(EMPTY, 'projects'), 'terminal'), 'terminal');

    expect(getFocusedWindowId(stack)).toBe('projects');
  });

  it('is null when every window is minimized', () => {
    const stack = minimizeAllWindows(openWindow(EMPTY, 'projects'));

    expect(getFocusedWindowId(stack)).toBeNull();
  });
});
