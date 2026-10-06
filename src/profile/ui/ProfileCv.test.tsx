import { render, screen, within } from '@testing-library/react';

import { PROFILE_CV, type ProfileCvData } from '../util/profile';
import { ProfileCv } from './ProfileCv';

function renderCv(cv: ProfileCvData = PROFILE_CV): void {
  render(<ProfileCv cv={cv} cvPdfHref="/cv/cv.pdf" contactHref="/contact" />);
}

describe('ProfileCv', () => {
  it('opens with who Daniel is', () => {
    renderCv();

    expect(screen.getByText('Daniel Jaramillo Bustamante')).toBeInTheDocument();
    expect(screen.getByText(/más de 9 años construyendo frontends escalables/)).toBeInTheDocument();
  });

  it('offers the CV as a download and a way to get in touch', () => {
    renderCv();

    const download = screen.getByRole('link', { name: 'Descargar CV (PDF)' });

    expect(download).toHaveAttribute('href', '/cv/cv.pdf');
    expect(download).toHaveAttribute('download');
    expect(screen.getByRole('link', { name: 'Contactar' })).toHaveAttribute('href', '/contact');
  });

  it('lists the experience with what was achieved in each job', () => {
    renderCv();

    const experience = screen.getByRole('region', { name: 'Experiencia' });

    expect(within(experience).getAllByRole('article')).toHaveLength(3);
    expect(experience).toHaveTextContent('60% de adopción en producción');
  });

  it('shows skills, education, courses and languages', () => {
    renderCv();

    expect(screen.getByRole('region', { name: 'Skills' })).toHaveTextContent('Angular');
    expect(screen.getByRole('region', { name: 'Formación' })).toHaveTextContent(
      'Politécnico Grancolombiano',
    );
    expect(screen.getByRole('region', { name: 'Cursos y certificaciones' })).toHaveTextContent(
      'RxJS',
    );
    expect(screen.getByRole('region', { name: 'Idiomas' })).toHaveTextContent('Inglés (B2)');
  });

  it('leaves out a section without data', () => {
    renderCv({ ...PROFILE_CV, courses: [] });

    expect(
      screen.queryByRole('region', { name: 'Cursos y certificaciones' }),
    ).not.toBeInTheDocument();
  });
});
