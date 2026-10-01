import type { ReactNode } from 'react';

const PROMPT = 'dani@fedora ~ $';

export function TerminalApp(): ReactNode {
  return (
    <div className="flex min-h-full flex-col gap-1 rounded-card bg-canvas p-4 font-mono text-sm">
      <p>
        <span className="text-positive">{PROMPT}</span> portfolio --about
      </p>
      <p className="text-muted">Frontend Tech Lead · 9+ años</p>
      <p className="text-muted">Angular · React Native · AI-native</p>
      <p>
        <span className="text-positive">{PROMPT}</span> ask --help
      </p>
      <p className="text-ai">
        ▸ Asistente en construcción: pronto podrás preguntar por mi experiencia.
      </p>
    </div>
  );
}
