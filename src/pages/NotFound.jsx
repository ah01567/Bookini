import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">Page introuvable</h1>
      <p className="text-slate-600">La page demandée n’existe pas.</p>
      <Link to="/" className="inline-block mt-6 px-4 py-2 rounded-lg bg-primary text-white">
        Retour à l’accueil
      </Link>
    </div>
  );
}
