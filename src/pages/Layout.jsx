import { Outlet } from "react-router-dom";
import Header from "../ui/Header.jsx";
import Footer from "../ui/Footer.jsx";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-slate-800">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
