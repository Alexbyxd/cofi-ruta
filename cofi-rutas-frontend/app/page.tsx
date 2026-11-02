import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAF4EC] flex flex-col items-center justify-center p-6 text-[#1A0F0A]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-block bg-[#6B8E4E] text-white text-xs font-bold px-3 py-1 rounded-full brutal-border -rotate-2">
          ✓ VISITA VERIFICADA • ORURO
        </div>

        <h1 className="text-5xl sm:text-6xl font-black tracking-tight font-[family-name:var(--font-space-grotesk)]">
          COFI<span className="text-[#DE7C5A]">RUTAS</span>
        </h1>

        <p className="text-base text-[#4A2E1B] font-medium">
          Descubrí las mejores cafeterías, meriendas y citas en la ciudad del Pagador.
        </p>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-block w-full py-3.5 brutal-btn-primary text-sm uppercase tracking-wider font-bold"
          >
            Comenzar mi Ruta (Login / Registro)
          </Link>
        </div>
      </div>
    </main>
  );
}
