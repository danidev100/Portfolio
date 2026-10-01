/**
 * The `@window` slot renders nothing: its intercepting routes only exist so
 * that opening an app from the desktop keeps the desktop mounted. The desktop
 * itself opens the window for the current route.
 */
export default function WindowSlot(): null {
  return null;
}
