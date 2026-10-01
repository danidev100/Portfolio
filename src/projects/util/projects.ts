export interface Project {
  id: string;
  name: string;
  summary: string;
  audience: string;
  aiRole: string;
  stack: readonly string[];
  value: string;
}

export const PROJECTS: readonly Project[] = [
  {
    id: 'factura-lens',
    name: 'Factura Lens',
    summary: 'Fotos de facturas convertidas en JSON contable validado con Zod, para PYMES.',
    audience: 'PYMES y contadores que aún digitan facturas a mano.',
    aiRole: 'Visión y salida estructurada validada con Zod, con cola de reintentos en BullMQ.',
    stack: ['Angular', 'NestJS', 'BullMQ', 'Postgres'],
    value: 'Ahorro medible: de minutos a segundos por factura.',
  },
  {
    id: 'solar-scout',
    name: 'Solar Scout',
    summary: 'Estima el ahorro solar a partir de una factura de energía.',
    audience: 'Empresas de energía residencial y su equipo comercial.',
    aiRole:
      'Extrae el consumo de la factura, calcula el sistema y explica el resultado en lenguaje claro.',
    stack: ['React Native', 'Node', 'AI SDK'],
    value: 'Conecta con mi experiencia en energía renovable.',
  },
  {
    id: 'ds-copilot',
    name: 'DS Copilot',
    summary: 'Genera pantallas Angular usando solo el design system, a través de un servidor MCP.',
    audience: 'Equipos con una librería de componentes propia.',
    aiRole:
      'Un servidor MCP expone el catálogo de componentes al modelo y valida el código generado.',
    stack: ['Angular', 'Nx', 'MCP', 'Storybook'],
    value: 'Parte de un caso real: un design system con 60% de adopción en producción.',
  },
  {
    id: 'release-radar',
    name: 'Release Radar',
    summary: 'Convierte PRs en notas de versión para cada audiencia.',
    audience: 'Tech leads y product managers.',
    aiRole: 'Resume por audiencia (QA, negocio, soporte) desde GitHub, con caché por commit.',
    stack: ['GitHub App', 'Node', 'SSE'],
    value: 'Resuelve un dolor que todo equipo tiene en cada sprint.',
  },
  {
    id: 'a11y-pilot',
    name: 'A11y Pilot',
    summary: 'Audita accesibilidad y propone el diff con el arreglo.',
    audience: 'Equipos frontend que deben cumplir WCAG.',
    aiRole: 'Axe más un modelo que explica cada hallazgo y genera el diff sugerido.',
    stack: ['Chrome Extension', 'TypeScript'],
    value: 'La accesibilidad es una exigencia legal creciente.',
  },
  {
    id: 'mfe-atlas',
    name: 'MFE Atlas',
    summary: 'Mapa 3D de microfrontends Nx con preguntas de impacto.',
    audience: 'Arquitectos con monorepos Nx grandes.',
    aiRole: 'Se le pregunta «¿qué se rompe si cambio X?» y el grafo responde.',
    stack: ['Nx graph', 'Three.js', 'Node'],
    value: 'Une mi experiencia en Native Federation con visualización 3D.',
  },
  {
    id: 'ask-dani',
    name: 'Ask Dani',
    summary: 'El CV como RAG conversacional con citas.',
    audience: 'Reclutadores que quieren respuestas rápidas.',
    aiRole: 'RAG con embeddings, streaming SSE y rate limiting por IP.',
    stack: ['Next.js', 'pgvector', 'AI SDK'],
    value: 'Es este mismo portafolio funcionando como demo.',
  },
  {
    id: 'interview-forge',
    name: 'Interview Forge',
    summary: 'Simulador de entrevista técnica con rúbrica.',
    audience: 'Desarrolladores que preparan procesos de selección.',
    aiRole: 'Agente entrevistador con preguntas adaptativas y feedback estructurado.',
    stack: ['Angular', 'Signals', 'Node'],
    value: 'Pensado como producto, con posible monetización.',
  },
];
