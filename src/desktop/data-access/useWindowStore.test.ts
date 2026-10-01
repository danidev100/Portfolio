import { useWindowStore } from './useWindowStore';

const windowIds = (): string[] =>
  useWindowStore.getState().windows.map((managedWindow) => managedWindow.id);

describe('useWindowStore', () => {
  beforeEach(() => {
    useWindowStore.setState(useWindowStore.getInitialState(), true);
  });

  it('starts with no open windows', () => {
    expect(windowIds()).toEqual([]);
  });

  it('opens windows and keeps the last one on top', () => {
    useWindowStore.getState().openWindow('projects');
    useWindowStore.getState().openWindow('terminal');

    expect(windowIds()).toEqual(['projects', 'terminal']);
  });

  it('focuses, minimizes and closes windows', () => {
    const { openWindow, focusWindow, minimizeWindow, closeWindow } = useWindowStore.getState();
    openWindow('projects');
    openWindow('terminal');

    focusWindow('projects');
    minimizeWindow('projects');
    closeWindow('terminal');

    expect(useWindowStore.getState().windows).toEqual([{ id: 'projects', isMinimized: true }]);
  });

  it('minimizes every window when showing the desktop', () => {
    useWindowStore.getState().openWindow('projects');
    useWindowStore.getState().openWindow('terminal');

    useWindowStore.getState().showDesktop();

    expect(useWindowStore.getState().windows.every((w) => w.isMinimized)).toBe(true);
  });
});
