/**
 * What the AI knows, transcribed from `CV_Daniel_Jaramillo_AI_Native.pdf`.
 * Each fact lives in exactly one block, and each block names the graph nodes
 * it is about: Claude cites blocks, and a cited block lights up its nodes.
 */
export interface KnowledgeBlock {
  nodeIds: readonly string[];
  text: string;
}

export const KNOWLEDGE_TITLE = 'CV de Daniel Jaramillo Bustamante';

export const KNOWLEDGE_BLOCKS: readonly KnowledgeBlock[] = [
  {
    nodeIds: ['dani'],
    text: 'Daniel Jaramillo Bustamante es Frontend Tech Lead con más de 9 años de experiencia diseñando soluciones frontend escalables y liderando equipos en servicios tecnológicos, servicios profesionales multinacionales y energía renovable residencial. Su perfil es Frontend Tech Lead, AI-Native Engineering, Angular y React Native, TypeScript y Node.js. Le apasiona usar la ingeniería aumentada con IA para multiplicar lo que produce un equipo sin sacrificar la calidad del código.',
  },
  {
    nodeIds: ['hp', 'mcp'],
    text: 'En Home Power Colombia fue pionero en adoptar flujos de desarrollo AI-native en el equipo: integró Claude CLI y Claude Design en entornos MCP (Model Context Protocol) para acotar e implementar MVPs, dando a negocio visibilidad sobre el desarrollo que venía a partir de la librería de componentes existente.',
  },
  {
    nodeIds: ['hp', 'k7', 'ng'],
    text: 'En Home Power Colombia lideró un equipo frontend de 7 desarrolladores y definió los estándares de arquitectura Angular y las buenas prácticas de código para tener soluciones frontend escalables, mantenibles y adaptables.',
  },
  {
    nodeIds: ['hp', 'ds', 'k60'],
    text: 'En Home Power Colombia diseñó y construyó la librería de componentes del design system corporativo, que llegó al 60% de adopción en producción y redujo de forma notable el tiempo de desarrollo de UI gracias a la reutilización.',
  },
  {
    nodeIds: ['hp', 'ci'],
    text: 'En Home Power Colombia estandarizó quality gates automáticos (SonarQube y Husky) dentro de CI/CD, que priorizan y validan los problemas antes de que lleguen a QA y se suman a las prácticas de revisión automatizadas y asistidas por IA del equipo.',
  },
  {
    nodeIds: ['hp', 'rn', 'k90'],
    text: 'En Home Power Colombia construyó los pipelines de CI/CD para entregar la app móvil a QA por TestFlight, reduciendo un 90% el esfuerzo manual de entrega y acelerando los ciclos de release.',
  },
  {
    nodeIds: ['hp', 'mfe', 'rx', 'aws'],
    text: 'Home Power Colombia, cargo Frontend Tech Lead, de noviembre de 2024 a septiembre de 2026. Stack: Angular, React Native, Claude CLI, Claude Design, MCP, Tailwind, Native Federation, Signals, RxJS, CSR, Nx, Node.js, Express, SASS, AWS (S3, API Gateway, Lambda, CodeCommit), GitHub Actions, Git, Jest y unit testing.',
  },
  {
    nodeIds: ['glb', 'ng', 'node', 'aws'],
    text: 'Globant, cargo Web UI Developer Ssr, de marzo de 2022 a noviembre de 2024. Mantuvo y evolucionó bases de código Angular legadas mientras entregaba funcionalidades nuevas en plataformas de clientes enterprise; aplicó metodologías estándar de desarrollo y despliegue; cumplió los objetivos de cada sprint en plazo y facilitó la comunicación entre equipos técnicos y de procesos. Stack: Angular, Kendo, Node.js, SASS, AWS (S3, API, Lambda, CodeCommit), Dynamics 365, Git y unit testing.',
  },
  {
    nodeIds: ['arus', 'k50', 'node'],
    text: 'ARUS, cargo Automation Analyst, de marzo de 2017 a 2022. Entregó plataformas web que ampliaron el acceso de los clientes a información crítica, dando soporte a las mesas de servicio de cerca del 30% de la base de clientes. Llevó el 50% de los algoritmos de IA de la organización a interfaces web intuitivas, con retorno medible: su primer contacto práctico con IA en producción. Stack: Electron, Angular, Node.js, AWS, MySQL, MongoDB y Git.',
  },
  {
    nodeIds: ['ts', 'node'],
    text: 'Lenguajes: JavaScript avanzado, TypeScript avanzado, Node.js avanzado y Python básico.',
  },
  {
    nodeIds: ['mcp', 'sdk'],
    text: 'Ingeniería AI-native: Claude CLI medio-avanzado, con adopción en producción; Claude Design medio; entornos MCP (Model Context Protocol) medio-avanzado; implementación, testing y code review asistidos por IA, medio; integración de AI SDKs con streaming y tool-calling, en progreso. Hoy profundiza en AI SDKs (streaming, tool-calling, flujos agénticos).',
  },
  {
    nodeIds: ['ng', 'rn'],
    text: 'Frameworks frontend: Angular avanzado, React Native avanzado, React con conocimiento práctico y en camino a nivel de producción, y Electron medio.',
  },
  {
    nodeIds: ['mfe', 'ds', 'rx', 'a11y'],
    text: 'Arquitectura frontend y design systems: microfrontends con Nx y Native Federation, medio-avanzado y entregados en producción; librerías de componentes y design systems, avanzado; RxJS avanzado; Signals medio-avanzado; CSR avanzado; SSR medio; accesibilidad con conocimiento práctico, que está profundizando.',
  },
  {
    nodeIds: ['aws', 'node'],
    text: 'Backend y cloud: Node.js avanzado; Express avanzado, con APIs en producción; AWS (Lambda, S3, API Gateway, CodeCommit, RDS, SQS) medio.',
  },
  {
    nodeIds: ['ci'],
    text: 'Calidad, testing y CI/CD: Git avanzado, GitHub avanzado, GitHub Actions medio-avanzado, SonarQube medio, Husky medio, Jest medio, unit testing medio y Lighthouse medio.',
  },
  {
    nodeIds: ['dani'],
    text: 'Formación: Ingeniería de Software en el Politécnico Grancolombiano (Medellín, Antioquia), en el último ciclo desde julio de 2021. Cursos: JavaScript Master (Udemy, 2020), Desarrollo web con Angular (Udemy, 2022), GitHub para desarrolladores (LinkedIn Learning, 2022), PowerApps guía completa (Udemy, 2022), Programación reactiva con RxJS (Platzi, 2023) y Web Components con JavaScript (Platzi, 2023). Idiomas: español nativo e inglés B2.',
  },
  {
    nodeIds: ['dani'],
    text: 'Contacto: correo jaramillob93@gmail.com y LinkedIn linkedin.com/in/daniel-jaramillo-bustamante. En este portafolio, la app Contacto reúne estos datos.',
  },
  {
    nodeIds: ['ask', 'sdk'],
    text: 'Este asistente es el proyecto Ask Dani: Claude responde con citas a partir de este CV, en streaming, y el grafo de experiencia ilumina los nodos que cita.',
  },
  {
    nodeIds: ['dani', 'hp'],
    text: 'Situación actual: su etapa como Frontend Tech Lead en Home Power Colombia terminó en septiembre de 2026 y hoy busca trabajo activamente.',
  },
];

/** Graph nodes of the cited blocks, `endBlockIndex` excluded, each one once. */
export function getCitedNodeIds(startBlockIndex: number, endBlockIndex: number): string[] {
  const citedIds = KNOWLEDGE_BLOCKS.slice(startBlockIndex, endBlockIndex).flatMap(
    (block) => block.nodeIds,
  );

  return [...new Set(citedIds)];
}
