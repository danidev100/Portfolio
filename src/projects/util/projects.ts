/** `live` is published work; `idea` is something Daniel is exploring. */
export type ProjectStatus = 'live' | 'idea';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  /** Where a live project can be visited. */
  url?: string;
  summary: string;
  audience: string;
  aiRole: string;
  stack: readonly string[];
  value: string;
}

/** Live projects come first: the orbit opens on the first one. */
export const PROJECTS: readonly Project[] = [
  {
    id: 'nexa',
    name: 'NEXA',
    status: 'live',
    url: 'https://nexa-landing.onrender.com',
    summary:
      'Landing del primer producto de Nexus, el negocio que estoy iniciando: una plataforma que atiende clientes por WhatsApp, registra ventas y lleva el inventario.',
    audience: 'Negocios que atienden clientes todos los días.',
    aiRole:
      'NEXA atiende a los clientes 24/7 por WhatsApp y voz. La landing la construí con un flujo AI-native, con Claude Code.',
    stack: ['Angular', 'Three.js', 'Tailwind', 'Playwright'],
    value:
      'Es trabajo real y publicado: Angular prerenderizado, escena 3D en WebGPU con respaldo en WebGL 2 y pruebas e2e con auditoría de accesibilidad.',
  },
  {
    id: 'factura-lens',
    name: 'Factura Lens',
    status: 'idea',
    summary: 'Fotos de facturas convertidas en JSON contable validado con Zod, para PYMES.',
    audience: 'PYMES y contadores que aún digitan facturas a mano.',
    aiRole: 'Visión y salida estructurada validada con Zod, con cola de reintentos en BullMQ.',
    stack: ['Angular', 'NestJS', 'BullMQ', 'Postgres'],
    value: 'Ahorro medible: de minutos a segundos por factura.',
  },
  {
    id: 'solar-scout',
    name: 'Solar Scout',
    status: 'idea',
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
    status: 'idea',
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
    status: 'idea',
    summary: 'Convierte PRs en notas de versión para cada audiencia.',
    audience: 'Tech leads y product managers.',
    aiRole: 'Resume por audiencia (QA, negocio, soporte) desde GitHub, con caché por commit.',
    stack: ['GitHub App', 'Node', 'SSE'],
    value: 'Resuelve un dolor que todo equipo tiene en cada sprint.',
  },
  {
    id: 'a11y-pilot',
    name: 'A11y Pilot',
    status: 'idea',
    summary: 'Audita accesibilidad y propone el diff con el arreglo.',
    audience: 'Equipos frontend que deben cumplir WCAG.',
    aiRole: 'Axe más un modelo que explica cada hallazgo y genera el diff sugerido.',
    stack: ['Chrome Extension', 'TypeScript'],
    value: 'La accesibilidad es una exigencia legal creciente.',
  },
  {
    id: 'mfe-atlas',
    name: 'MFE Atlas',
    status: 'idea',
    summary: 'Mapa 3D de microfrontends Nx con preguntas de impacto.',
    audience: 'Arquitectos con monorepos Nx grandes.',
    aiRole: 'Se le pregunta «¿qué se rompe si cambio X?» y el grafo responde.',
    stack: ['Nx graph', 'Three.js', 'Node'],
    value: 'Une mi experiencia en Native Federation con visualización 3D.',
  },
  {
    id: 'ask-dani',
    name: 'Ask Dani',
    status: 'idea',
    summary: 'El CV como RAG conversacional con citas.',
    audience: 'Reclutadores que quieren respuestas rápidas.',
    aiRole: 'RAG con embeddings, streaming SSE y rate limiting por IP.',
    stack: ['Next.js', 'pgvector', 'AI SDK'],
    value: 'Es este mismo portafolio funcionando como demo.',
  },
  {
    id: 'interview-forge',
    name: 'Interview Forge',
    status: 'idea',
    summary: 'Simulador de entrevista técnica con rúbrica.',
    audience: 'Desarrolladores que preparan procesos de selección.',
    aiRole: 'Agente entrevistador con preguntas adaptativas y feedback estructurado.',
    stack: ['Angular', 'Signals', 'Node'],
    value: 'Pensado como producto, con posible monetización.',
  },
];
