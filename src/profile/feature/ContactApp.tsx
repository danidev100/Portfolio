import type { ReactNode } from 'react';

import { CONTACT_LINKS, LOCATION } from '../util/profile';

export function ContactApp(): ReactNode {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {CONTACT_LINKS.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="flex flex-wrap items-center justify-between gap-x-4 rounded-full border border-border bg-surface-raised px-5 py-3 transition-colors duration-200 hover:bg-border motion-reduce:transition-none"
            >
              <span className="text-sm text-muted">{link.label}</span>
              <span className="font-semibold break-all">{link.value}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">{LOCATION}</p>
    </div>
  );
}
