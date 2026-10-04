import { Github } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="pointer-events-auto fixed bottom-2 left-1/2 z-[1100] -translate-x-1/2">
      <a
        href="https://github.com/codebylmstudio"
        target="_blank"
        rel="noopener noreferrer"
        className="type-alt flex items-center gap-1.5 rounded-full border border-sand bg-white/90 px-3 py-1.5 text-[11px] font-medium text-ink shadow-md backdrop-blur-md transition-all hover:scale-105 hover:text-clay"
      >
        <Github size={13} className="text-clay" />
        <span>Desenvolvido por LM Studio</span>
      </a>
    </footer>
  );
}
