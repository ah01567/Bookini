export default function Home() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold">
        Bienvenue sur <span className="text-primary">Bookini</span>
      </h1>
      <p className="mt-3 text-slate-600">
        Réservez des hébergements en Algérie — simple, rapide, sécurisé.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold">Rechercher</h3>
          <p className="text-sm text-slate-600">Trouvez hôtels, maisons, etc.</p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold">Comparer</h3>
          <p className="text-sm text-slate-600">Lisez les avis et comparez.</p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold">Réserver</h3>
          <p className="text-sm text-slate-600">Confirmation instantanée.</p>
        </div>
      </div>
    </section>
  );
}
