import { create } from 'zustand';

import type { AppId } from '../util/apps';
import {
  closeWindow,
  focusWindow,
  minimizeAllWindows,
  minimizeWindow,
  openWindow,
  type WindowStack,
} from '../util/windowManager';

interface WindowStore {
  windows: WindowStack;
  openWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  showDesktop: () => void;
}

export const useWindowStore = create<WindowStore>()((set) => ({
  windows: [],
  openWindow: (id) => {
    set((state) => ({ windows: openWindow(state.windows, id) }));
  },
  focusWindow: (id) => {
    set((state) => ({ windows: focusWindow(state.windows, id) }));
  },
  minimizeWindow: (id) => {
    set((state) => ({ windows: minimizeWindow(state.windows, id) }));
  },
  closeWindow: (id) => {
    set((state) => ({ windows: closeWindow(state.windows, id) }));
  },
  showDesktop: () => {
    set((state) => ({ windows: minimizeAllWindows(state.windows) }));
  },
}));
