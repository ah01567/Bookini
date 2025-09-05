import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { keyify } from "../lib/text";

// Minimal inline icons (no extra deps)
const Icon = ({ className, children }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const BedIcon = ({ className = "w-5 h-5 text-slate-500" }) => (
  <Icon className={className}>
    <path d="M3 8v8M21 16V12a3 3 0 0 0-3-3H6M21 16H3M6 9v7" />
  </Icon>
);

const CalendarIcon = ({ className = "w-5 h-5 text-slate-500" }) => (
  <Icon className={className}>
    <path d="M7 3v3M17 3v3M3 8h18" />
    <rect x="3" y="8" width="18" height="13" rx="2" />
  </Icon>
);

const UserIcon = ({ className = "w-5 h-5 text-slate-500" }) => (
  <Icon className={className}>
    <circle cx="12" cy="8" r="3" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </Icon>
);

export default function SearchBar() {
  const nav = useNavigate();
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState({ in: "", out: "" });
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });

  const submit = (e) => {
    e.preventDefault();
    const wilayaKey = keyify(destination);
    const params = new URLSearchParams({
      wilayaKey,
      in: dates.in || "",
      out: dates.out || "",
      adults: String(guests.adults),
      children: String(guests.children),
      rooms: String(guests.rooms),
    });
    nav(`/recherche?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-6xl -mt-12">
      <div className="flex flex-col md:flex-row gap-2 p-2 bg-white rounded-2xl border-2 border-primary shadow-lg">
        {/* Destination */}
        <div className="flex-1 flex items-center gap-3 px-3 py-3 rounded-xl bg-white">
          <BedIcon />
          <input
            placeholder="Où allez-vous ? (Wilaya)"
            className="w-full outline-none"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
        </div>

        {/* Dates */}
        <div className="flex-[1.2] grid grid-cols-2 gap-2 items-center px-3 py-3 rounded-xl bg-white">
          <div className="flex items-center gap-2">
            <CalendarIcon />
            <input
              type="date"
              className="w-full outline-none"
              value={dates.in}
              onChange={(e) => setDates((s) => ({ ...s, in: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon />
            <input
              type="date"
              className="w-full outline-none"
              value={dates.out}
              onChange={(e) => setDates((s) => ({ ...s, out: e.target.value }))}
            />
          </div>
        </div>

        {/* Guests */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white">
          <UserIcon />
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-1">
              Adultes
              <input
                type="number"
                min={1}
                className="w-16 border rounded px-2 py-1"
                value={guests.adults}
                onChange={(e) =>
                  setGuests((s) => ({ ...s, adults: Number(e.target.value) || 1 }))
                }
              />
            </label>
            <label className="flex items-center gap-1">
              Enfants
              <input
                type="number"
                min={0}
                className="w-16 border rounded px-2 py-1"
                value={guests.children}
                onChange={(e) =>
                  setGuests((s) => ({ ...s, children: Number(e.target.value) || 0 }))
                }
              />
            </label>
            <label className="flex items-center gap-1">
              Chambres
              <input
                type="number"
                min={1}
                className="w-16 border rounded px-2 py-1"
                value={guests.rooms}
                onChange={(e) =>
                  setGuests((s) => ({ ...s, rooms: Number(e.target.value) || 1 }))
                }
              />
            </label>
          </div>
        </div>

        {/* CTA */}
        <button className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90">
          Rechercher
        </button>
      </div>
    </form>
  );
}
