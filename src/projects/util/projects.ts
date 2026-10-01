export interface Project {
  id: string;
  name: string;
  summary: string;
}

export const PROJECTS: readonly Project[] = [
  {
    id: 'factura-lens',
    name: 'Factura Lens',
    summary: 'Fotos de facturas convertidas en JSON contable validado con Zod, para PYMES.',
  },
  {
    id: 'solar-scout',
    name: 'Solar Scout',
    summary: 'Estima el ahorro solar a partir de una factura de energía.',
  },
  {
    id: 'ds-copilot',
    name: 'DS Copilot',
    summary: 'Genera pantallas Angular usando solo el design system, a través de un servidor MCP.',
  },
  {
    id: 'release-radar',
    name: 'Release Radar',
    summary: 'Convierte PRs en notas de versión para cada audiencia.',
  },
  {
    id: 'a11y-pilot',
    name: 'A11y Pilot',
    summary: 'Audita accesibilidad y propone el diff con el arreglo.',
  },
  {
    id: 'mfe-atlas',
    name: 'MFE Atlas',
    summary: 'Mapa 3D de microfrontends Nx con preguntas de impacto.',
  },
  {
    id: 'ask-dani',
    name: 'Ask Dani',
    summary: 'El CV como RAG conversacional con citas.',
  },
  {
    id: 'interview-forge',
    name: 'Interview Forge',
    summary: 'Simulador de entrevista técnica con rúbrica.',
  },
];
