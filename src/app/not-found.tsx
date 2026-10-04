import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-paper p-8 text-center">
      <h2 className="text-3xl font-black text-ink">404</h2>
      <p className="text-sm text-inkMuted">Página não encontrada.</p>
      <Link
        href="/"
        className="rounded-xl bg-clay px-4 py-2 text-sm font-bold text-paper transition-colors hover:bg-clayDark"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
