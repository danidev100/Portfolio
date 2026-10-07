/** The part of a click on a link that decides what the link does. */
export interface AppLinkClick {
  /** Clicks in a row: 2 on the second click of a double click, 0 from the keyboard. */
  detail: number;
  preventDefault: () => void;
}

/**
 * The single rule for every link that opens an app (dock, greeting, windows
 * overview, tour). It never navigates to the route the router is on, because
 * from an intercepted route that leaves the page empty, and it ignores the
 * second click of a double click, which would undo what the first one did.
 * Returns whether the app should be activated.
 */
export function shouldActivateFromClick(
  click: AppLinkClick,
  href: string,
  currentHref: string,
): boolean {
  if (href === currentHref) click.preventDefault();

  if (click.detail > 1) {
    click.preventDefault();

    return false;
  }

  return true;
}
