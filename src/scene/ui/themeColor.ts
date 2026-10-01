/**
 * Reads a design token such as `--color-primary` so that 3D materials use the
 * same palette as the DOM. Browser only: the scene never renders on the server.
 */
export function readThemeColor(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}
