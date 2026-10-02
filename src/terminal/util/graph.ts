export type GraphNodeType = 'core' | 'experience' | 'skill' | 'ai' | 'achievement';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  /** Words a question can use to refer to this node, without accents. */
  tags: readonly string[];
}

export type GraphEdge = readonly [fromId: string, toId: string];

export const GRAPH_NODES: readonly GraphNode[] = [
  { id: 'dani', label: 'Dani', type: 'core', tags: ['dani'] },
  {
    id: 'hp',
    label: 'Home Power · Tech Lead',
    type: 'experience',
    tags: [
      'equipo',
      'lider',
      'lead',
      'liderazgo',
      'angular',
      'react',
      'native',
      'movil',
      'energia',
    ],
  },
  {
    id: 'glb',
    label: 'Globant · Web UI',
    type: 'experience',
    tags: ['angular', 'kendo', 'legacy', 'enterprise'],
  },
  {
    id: 'arus',
    label: 'ARUS · Automatización',
    type: 'experience',
    tags: ['ia', 'electron', 'automatizacion', 'algoritmos'],
  },
  { id: 'ng', label: 'Angular', type: 'skill', tags: ['angular', 'frontend'] },
  {
    id: 'rn',
    label: 'React Native',
    type: 'skill',
    tags: ['react', 'native', 'movil', 'mobile', 'app'],
  },
  { id: 'ts', label: 'TypeScript', type: 'skill', tags: ['typescript', 'javascript'] },
  {
    id: 'node',
    label: 'Node · Express',
    type: 'skill',
    tags: ['node', 'express', 'backend', 'api'],
  },
  {
    id: 'rx',
    label: 'RxJS · Signals',
    type: 'skill',
    tags: ['rxjs', 'signals', 'estado', 'reactivo'],
  },
  {
    id: 'mfe',
    label: 'Nx · Native Federation',
    type: 'skill',
    tags: ['microfrontends', 'nx', 'federation', 'arquitectura'],
  },
  {
    id: 'ds',
    label: 'Design System',
    type: 'skill',
    tags: ['design', 'system', 'componentes', 'ui', 'libreria'],
  },
  {
    id: 'ci',
    label: 'CI/CD · GitHub Actions',
    type: 'skill',
    tags: ['ci', 'cd', 'github', 'actions', 'sonarqube', 'husky', 'calidad'],
  },
  {
    id: 'aws',
    label: 'AWS Lambda · S3',
    type: 'skill',
    tags: ['aws', 'cloud', 'lambda', 's3', 'backend'],
  },
  {
    id: 'mcp',
    label: 'Claude CLI · MCP',
    type: 'ai',
    tags: ['ia', 'ai', 'claude', 'mcp', 'agentes'],
  },
  {
    id: 'sdk',
    label: 'AI SDK · streaming',
    type: 'ai',
    tags: ['ia', 'ai', 'streaming', 'tool', 'calling', 'sse'],
  },
  { id: 'a11y', label: 'Accesibilidad', type: 'skill', tags: ['accesibilidad', 'a11y'] },
  {
    id: 'k7',
    label: 'Equipo de 7 devs',
    type: 'achievement',
    tags: ['equipo', 'lider', 'liderazgo'],
  },
  {
    id: 'k60',
    label: '60% adopción del DS',
    type: 'achievement',
    tags: ['design', 'system', 'adopcion'],
  },
  {
    id: 'k90',
    label: '−90% handoff a QA',
    type: 'achievement',
    tags: ['ci', 'cd', 'testflight', 'movil', 'qa'],
  },
  {
    id: 'k50',
    label: '50% de algoritmos IA en UI',
    type: 'achievement',
    tags: ['ia', 'algoritmos'],
  },
  { id: 'ask', label: 'Proyecto · Ask Dani', type: 'ai', tags: ['ia', 'rag', 'proyecto'] },
];

export const GRAPH_EDGES: readonly GraphEdge[] = [
  ['dani', 'hp'],
  ['dani', 'glb'],
  ['dani', 'arus'],
  ['hp', 'ng'],
  ['hp', 'rn'],
  ['hp', 'mfe'],
  ['hp', 'ds'],
  ['hp', 'ci'],
  ['hp', 'mcp'],
  ['hp', 'k7'],
  ['hp', 'k60'],
  ['hp', 'k90'],
  ['hp', 'aws'],
  ['glb', 'ng'],
  ['glb', 'node'],
  ['glb', 'aws'],
  ['arus', 'node'],
  ['arus', 'k50'],
  ['arus', 'ng'],
  ['ds', 'k60'],
  ['ci', 'k90'],
  ['mcp', 'sdk'],
  ['sdk', 'ask'],
  ['mcp', 'ask'],
  ['ng', 'rx'],
  ['ng', 'ts'],
  ['rn', 'ts'],
  ['node', 'ts'],
  ['ng', 'a11y'],
  ['ds', 'a11y'],
  ['dani', 'ask'],
];

/** Ids of the nodes linked to `nodeId`, in either direction, in edge order. */
export function getConnectedNodeIds(nodeId: string, edges: readonly GraphEdge[]): string[] {
  return edges.flatMap(([fromId, toId]) => {
    if (fromId === nodeId) return [toId];
    if (toId === nodeId) return [fromId];

    return [];
  });
}
