import type { ReactNode } from 'react';

export function DesktopGreeting(): ReactNode {
  return (
    <section className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="font-mono text-xs tracking-widest text-muted uppercase">Daniel Jaramillo</p>
      <h1 className="font-display text-5xl font-bold sm:text-6xl">Dani OS</h1>
      <p className="text-muted">Frontend Tech Lead · AI App Developer</p>
      <p className="text-sm text-muted">Abre una app desde el dock para empezar.</p>
    </section>
  );
}
