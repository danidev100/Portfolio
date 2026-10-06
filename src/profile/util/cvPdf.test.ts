import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { CV_PDF_HREF } from './cvPdf';

const pdfPath = join(process.cwd(), 'public', CV_PDF_HREF);

describe('the published CV', () => {
  it('is served from the public folder, so the download link is never broken', () => {
    expect(existsSync(pdfPath)).toBe(true);
  });

  it('links to the current LinkedIn profile', () => {
    const bytes = readFileSync(pdfPath).toString('latin1');

    expect(bytes).toContain('linkedin.com/in/daniel-jaramillo-bustamante');
    expect(bytes).not.toContain('linkedin.com/in/daniel-jaramillobustamante');
  });
});
