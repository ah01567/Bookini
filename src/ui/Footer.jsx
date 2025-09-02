export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary" />
            <span className="font-extrabold">Bookini</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Votre plateforme pour réserver des hébergements partout en Algérie.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Découvrir</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><a className="hover:text-primary" href="#">Villes populaires</a></li>
            <li><a className="hover:text-primary" href="#">Offres du moment</a></li>
            <li><a className="hover:text-primary" href="#">Expériences</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Assistance</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><a className="hover:text-primary" href="#">Centre d’aide</a></li>
            <li><a className="hover:text-primary" href="#">Annulations</a></li>
            <li><a className="hover:text-primary" href="#">Sécurité & confidentialité</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Professionnels</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><a className="hover:text-primary" href="#">Inscrire un établissement</a></li>
            <li><a className="hover:text-primary" href="#">Partenariats</a></li>
            <li><a className="hover:text-primary" href="#">Carrières</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 text-sm flex flex-col md:flex-row items-center justify-between gap-2 text-slate-500">
          <p>© {new Date().getFullYear()} Bookini — Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <a className="hover:text-primary" href="#">Conditions</a>
            <a className="hover:text-primary" href="#">Confidentialité</a>
            <a className="hover:text-primary" href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
