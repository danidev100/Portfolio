import type { ReactNode } from 'react';

import { ProfileCv } from '../ui/ProfileCv';
import { CV_PDF_HREF } from '../util/cvPdf';
import { PROFILE_CV } from '../util/profile';

/** The route of the contact app; the profile domain does not import the desktop. */
const CONTACT_HREF = '/contact';

export function AboutApp(): ReactNode {
  return <ProfileCv cv={PROFILE_CV} cvPdfHref={CV_PDF_HREF} contactHref={CONTACT_HREF} />;
}
