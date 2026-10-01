export interface Experience {
  company: string;
  role: string;
  period: string;
}

export const EXPERIENCE: readonly Experience[] = [
  { company: 'Home Power Colombia', role: 'Tech Lead', period: 'nov 2024 – sep 2026' },
  { company: 'Globant', role: 'Web UI Developer Ssr', period: '2022 – 2024' },
  { company: 'ARUS', role: 'Automation Analyst', period: '2017 – 2022' },
];

export const ACHIEVEMENTS: readonly string[] = [
  'Lideré un equipo de 7 desarrolladores.',
  'Design system con 60% de adopción en producción.',
  '−90% de esfuerzo de handoff a QA con CI/CD a TestFlight.',
  '50% de los algoritmos de IA de ARUS llevados a interfaces web.',
];

export interface ContactLink {
  label: string;
  value: string;
  href: string;
}

export const CONTACT_LINKS: readonly ContactLink[] = [
  { label: 'Correo', value: 'jaramillob93@gmail.com', href: 'mailto:jaramillob93@gmail.com' },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/daniel-jaramillo-bustamante',
    href: 'https://www.linkedin.com/in/daniel-jaramillo-bustamante',
  },
];

export const LOCATION = 'Medellín · UTC−5';
