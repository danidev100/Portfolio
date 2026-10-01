import type { AppId } from './apps';

export interface ManagedWindow {
  id: AppId;
  isMinimized: boolean;
}

/** Open windows ordered back to front: the index is the z-order. */
export type WindowStack = readonly ManagedWindow[];

function isOnTop(stack: WindowStack, id: AppId): boolean {
  return stack.at(-1)?.id === id;
}

function raise(stack: WindowStack, id: AppId): WindowStack {
  return [...stack.filter((managedWindow) => managedWindow.id !== id), { id, isMinimized: false }];
}

export function openWindow(stack: WindowStack, id: AppId): WindowStack {
  const top = stack.at(-1);
  if (top?.id === id && !top.isMinimized) return stack;

  return raise(stack, id);
}

export function focusWindow(stack: WindowStack, id: AppId): WindowStack {
  const target = stack.find((managedWindow) => managedWindow.id === id);
  if (!target || target.isMinimized || isOnTop(stack, id)) return stack;

  return raise(stack, id);
}

export function minimizeWindow(stack: WindowStack, id: AppId): WindowStack {
  const target = stack.find((managedWindow) => managedWindow.id === id);
  if (!target || target.isMinimized) return stack;

  return stack.map((managedWindow) =>
    managedWindow.id === id ? { ...managedWindow, isMinimized: true } : managedWindow,
  );
}

export function closeWindow(stack: WindowStack, id: AppId): WindowStack {
  if (!stack.some((managedWindow) => managedWindow.id === id)) return stack;

  return stack.filter((managedWindow) => managedWindow.id !== id);
}

export function minimizeAllWindows(stack: WindowStack): WindowStack {
  if (getFocusedWindowId(stack) === null) return stack;

  return stack.map((managedWindow) => ({ ...managedWindow, isMinimized: true }));
}

export function getFocusedWindowId(stack: WindowStack): AppId | null {
  return stack.findLast((managedWindow) => !managedWindow.isMinimized)?.id ?? null;
}
