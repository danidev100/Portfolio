import { act, renderHook, type RenderHookResult } from '@testing-library/react';

import { useWindowStore } from '../data-access/useWindowStore';
import { useDesktopWindows, type DesktopWindows } from './useDesktopWindows';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: (): string => mockPathname,
  useRouter: (): { push: jest.Mock; replace: jest.Mock } => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

const openIds = (): string[] =>
  useWindowStore.getState().windows.map((managedWindow) => managedWindow.id);

function renderAt(pathname: string): RenderHookResult<DesktopWindows, unknown> {
  mockPathname = pathname;

  return renderHook(() => useDesktopWindows());
}

describe('useDesktopWindows', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    useWindowStore.setState(useWindowStore.getInitialState(), true);
  });

  describe('following the route', () => {
    it('opens the window that owns the current route', () => {
      const { result } = renderAt('/projects');

      expect(result.current.focusedId).toBe('projects');
    });

    it('raises the window of the new route when the route changes', () => {
      const { result, rerender } = renderAt('/projects');

      mockPathname = '/terminal';
      rerender();

      expect(openIds()).toEqual(['projects', 'terminal']);
      expect(result.current.focusedId).toBe('terminal');
    });

    it('shows the bare desktop on the desktop route', () => {
      const { result, rerender } = renderAt('/projects');

      mockPathname = '/';
      rerender();

      expect(result.current.focusedId).toBeNull();
      expect(openIds()).toEqual(['projects']);
    });
  });

  describe('focus', () => {
    it('raises the window and navigates to its route', () => {
      const { result, rerender } = renderAt('/projects');
      mockPathname = '/terminal';
      rerender();

      act(() => {
        result.current.focus('projects');
      });

      expect(result.current.focusedId).toBe('projects');
      expect(mockPush).toHaveBeenCalledWith('/projects');
    });

    it('does not navigate when the window already owns the route', () => {
      const { result } = renderAt('/projects');

      act(() => {
        result.current.focus('projects');
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('minimize', () => {
    it('navigates to the next visible window', () => {
      const { result, rerender } = renderAt('/projects');
      mockPathname = '/terminal';
      rerender();

      act(() => {
        result.current.minimize('terminal');
      });

      expect(result.current.focusedId).toBe('projects');
      expect(mockPush).toHaveBeenCalledWith('/projects');
    });

    it('navigates to the desktop when no window is left visible', () => {
      const { result } = renderAt('/projects');

      act(() => {
        result.current.minimize('projects');
      });

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('close', () => {
    it('removes the window and navigates to the desktop when it was the last one', () => {
      const { result } = renderAt('/projects');

      act(() => {
        result.current.close('projects');
      });

      expect(openIds()).toEqual([]);
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('keeps the route when a background window is closed', () => {
      const { result, rerender } = renderAt('/projects');
      mockPathname = '/terminal';
      rerender();

      act(() => {
        result.current.close('projects');
      });

      expect(openIds()).toEqual(['terminal']);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('never navigating to the route it is already on', () => {
    it('leaves the router alone when a background window is closed', () => {
      const { result, rerender } = renderAt('/projects');
      mockPathname = '/terminal';
      rerender();

      act(() => {
        result.current.close('projects');
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('leaves the router alone when a window is closed before its navigation lands', () => {
      const { result } = renderAt('/');
      act(() => {
        result.current.open('about');
      });

      act(() => {
        result.current.close('about');
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('does not ask twice for a route that is already on its way', () => {
      const { result, rerender } = renderAt('/projects');
      mockPathname = '/terminal';
      rerender();

      act(() => {
        result.current.focus('projects');
        result.current.focus('projects');
      });

      expect(mockPush).toHaveBeenCalledTimes(1);
    });
  });

  describe('a navigation that lands after the visitor changed their mind', () => {
    it('does not reopen a window closed before its navigation landed', () => {
      const { result, rerender } = renderAt('/');
      act(() => {
        result.current.open('about');
      });
      act(() => {
        result.current.close('about');
      });

      mockPathname = '/about';
      rerender();

      expect(openIds()).toEqual([]);
      expect(mockReplace).toHaveBeenCalledWith('/');
    });

    it('keeps a window reopened while the navigation away from it was on its way', () => {
      const { result, rerender } = renderAt('/projects');
      act(() => {
        result.current.minimize('projects');
      });
      act(() => {
        result.current.open('projects');
      });

      mockPathname = '/';
      rerender();

      expect(result.current.focusedId).toBe('projects');
      expect(mockReplace).toHaveBeenCalledWith('/projects');
    });

    it('still follows the back button once its own navigations have landed', () => {
      const { result, rerender } = renderAt('/');
      act(() => {
        result.current.open('about');
      });
      mockPathname = '/about';
      rerender();

      mockPathname = '/';
      rerender();

      expect(result.current.focusedId).toBeNull();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('the current route', () => {
    it('is exposed so that links to it can skip navigating', () => {
      const { result } = renderAt('/projects');

      expect(result.current.currentHref).toBe('/projects');
    });
  });

  describe('what is left in focus', () => {
    it('reports the window that takes the focus after a minimize', () => {
      const { result, rerender } = renderAt('/projects');
      mockPathname = '/terminal';
      rerender();

      let nowFocused: string | null = 'unset';
      act(() => {
        nowFocused = result.current.minimize('terminal');
      });

      expect(nowFocused).toBe('projects');
    });

    it('reports that nothing is left in focus after closing the last window', () => {
      const { result } = renderAt('/projects');

      let nowFocused: string | null = 'unset';
      act(() => {
        nowFocused = result.current.close('projects');
      });

      expect(nowFocused).toBeNull();
    });
  });

  describe('open', () => {
    it('opens the window right away without navigating, since the link does', () => {
      const { result } = renderAt('/');

      act(() => {
        result.current.open('about');
      });

      expect(result.current.focusedId).toBe('about');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
