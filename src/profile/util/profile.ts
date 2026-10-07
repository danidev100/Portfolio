export interface Experience {
  company: string;
  role: string;
  period: string;
  highlights: readonly string[];
  stack: readonly string[];
}

export interface Skill {
  name: string;
  level: string;
}

export interface SkillGroup {
  name: string;
  skills: readonly Skill[];
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
}

export interface Course {
  provider: string;
  name: string;
  year: string;
}

export interface SpokenLanguage {
  name: string;
  level: string;
}

export interface ProfileCvData {
  name: string;
  role: string;
  location: string;
  summary: string;
  experience: readonly Experience[];
  skillGroups: readonly SkillGroup[];
  education: readonly Education[];
  courses: readonly Course[];
  languages: readonly SpokenLanguage[];
}

/** The CV, translated from `CV_Daniel_Jaramillo_AI_Native.pdf`. */
export const PROFILE_CV: ProfileCvData = {
  name: 'Daniel Jaramillo Bustamante',
  role: 'Frontend Tech Lead · AI App Developer',
  location: 'Colombia · UTC−5',
  summary:
    'Frontend Tech Lead con más de 9 años construyendo frontends escalables y liderando equipos. Llevo a producción arquitecturas de microfrontends con Angular, Nx y Native Federation, y design systems que los equipos adoptan de verdad. Introduje flujos de desarrollo AI-native (Claude CLI, MCP) en un equipo en producción y hoy profundizo en AI SDKs con streaming y tool-calling.',
  experience: [
    {
      company: 'Home Power Colombia',
      role: 'Frontend Tech Lead',
      period: 'nov 2024 – sep 2026',
      highlights: [
        'Introduje flujos de desarrollo AI-native en el equipo, integrando Claude CLI y Claude Design en entornos MCP para acotar e implementar MVPs, con visibilidad para negocio sobre lo que venía a partir de la librería de componentes.',
        'Lideré un equipo frontend de 7 desarrolladores y definí los estándares de arquitectura Angular y las buenas prácticas del equipo.',
        'Diseñé y construí el design system corporativo: 60% de adopción en producción y mucho menos tiempo de desarrollo de UI.',
        'Estandaricé quality gates automáticos (SonarQube, Husky) en CI/CD, que priorizan y validan los problemas antes de que lleguen a QA.',
        'Construí los pipelines de CI/CD para entregar la app móvil a QA (TestFlight): −90% de esfuerzo manual de entrega y ciclos de release más rápidos.',
      ],
      stack: [
        'Angular',
        'React Native',
        'Claude CLI',
        'Claude Design',
        'MCP',
        'Tailwind',
        'Native Federation',
        'Signals',
        'RxJS',
        'Nx',
        'Node.js',
        'Express',
        'AWS',
        'GitHub Actions',
        'Jest',
      ],
    },
    {
      company: 'Globant',
      role: 'Web UI Developer Ssr',
      period: 'mar 2022 – nov 2024',
      highlights: [
        'Mantuve y evolucioné bases de código Angular legadas mientras entregaba funcionalidades nuevas en plataformas de clientes enterprise.',
        'Apliqué metodologías estándar de desarrollo y despliegue para mejorar la eficiencia y la integridad del código en cada release.',
        'Cumplí los objetivos de cada sprint dentro de los plazos comprometidos.',
        'Facilité la comunicación entre los equipos técnicos y de procesos para mejorar el diseño y el desarrollo del producto.',
      ],
      stack: ['Angular', 'Kendo UI', 'Node.js', 'SASS', 'AWS', 'Dynamics 365'],
    },
    {
      company: 'ARUS',
      role: 'Automation Analyst',
      period: 'mar 2017 – 2022',
      highlights: [
        'Entregué plataformas web que ampliaron el acceso de los clientes a información crítica, dando soporte a las mesas de servicio de cerca del 30% de la base de clientes.',
        'Llevé el 50% de los algoritmos de IA de la organización a interfaces web intuitivas, con retorno medible: mi primer contacto con IA en producción.',
        'Lideré sesiones de colaboración entre equipos multidisciplinarios aplicando prácticas técnicas de referencia.',
        'Facilité la comunicación entre los equipos técnicos y de procesos para mejorar el diseño del producto.',
      ],
      stack: ['Electron', 'Angular', 'Node.js', 'AWS', 'MySQL', 'MongoDB'],
    },
  ],
  skillGroups: [
    {
      name: 'Lenguajes',
      skills: [
        { name: 'JavaScript', level: 'avanzado' },
        { name: 'TypeScript', level: 'avanzado' },
        { name: 'Node.js', level: 'avanzado' },
        { name: 'Python', level: 'básico' },
      ],
    },
    {
      name: 'Ingeniería AI-native',
      skills: [
        { name: 'Claude CLI', level: 'medio-avanzado, en producción' },
        { name: 'MCP', level: 'medio-avanzado' },
        { name: 'Claude Design', level: 'medio' },
        { name: 'Implementación, testing y code review asistidos por IA', level: 'medio' },
        { name: 'AI SDK con streaming y tool-calling', level: 'en progreso' },
      ],
    },
    {
      name: 'Frameworks frontend',
      skills: [
        { name: 'Angular', level: 'avanzado' },
        { name: 'React Native', level: 'avanzado' },
        { name: 'React', level: 'en progreso hacia nivel de producción' },
        { name: 'Electron', level: 'medio' },
      ],
    },
    {
      name: 'Arquitectura y design systems',
      skills: [
        { name: 'Microfrontends con Nx y Native Federation', level: 'medio-avanzado' },
        { name: 'Librerías de componentes y design systems', level: 'avanzado' },
        { name: 'RxJS', level: 'avanzado' },
        { name: 'Signals', level: 'medio-avanzado' },
        { name: 'CSR', level: 'avanzado' },
        { name: 'SSR', level: 'medio' },
        { name: 'Accesibilidad', level: 'en progreso' },
      ],
    },
    {
      name: 'Backend y cloud',
      skills: [
        { name: 'Node.js y Express', level: 'avanzado, APIs en producción' },
        { name: 'AWS: Lambda, S3, API Gateway, CodeCommit, RDS, SQS', level: 'medio' },
      ],
    },
    {
      name: 'Calidad, testing y CI/CD',
      skills: [
        { name: 'Git y GitHub', level: 'avanzado' },
        { name: 'GitHub Actions', level: 'medio-avanzado' },
        { name: 'SonarQube, Husky, Jest, unit testing y Lighthouse', level: 'medio' },
      ],
    },
  ],
  education: [
    {
      degree: 'Ingeniería de Software (último ciclo)',
      institution: 'Politécnico Grancolombiano, Medellín',
      period: 'jul 2021 – actualidad',
    },
  ],
  courses: [
    { provider: 'Udemy', name: 'JavaScript Master', year: '2020' },
    { provider: 'Udemy', name: 'Desarrollo web con Angular', year: '2022' },
    { provider: 'LinkedIn Learning', name: 'GitHub para desarrolladores', year: '2022' },
    { provider: 'Udemy', name: 'PowerApps, guía completa', year: '2022' },
    { provider: 'Platzi', name: 'Programación reactiva con RxJS', year: '2023' },
    { provider: 'Platzi', name: 'Web Components con JavaScript', year: '2023' },
  ],
  languages: [
    { name: 'Español', level: 'nativo' },
    { name: 'Inglés', level: 'B2' },
  ],
};

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
