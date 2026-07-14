import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-ink/95 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display italic text-2xl text-paper">Marginalia</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-gold">
            learning portal
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-paper/70">
              Hi, <span className="text-paper font-medium">{user.name.split(" ")[0]}</span>
            </span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="text-sm font-medium text-ink bg-gold hover:bg-gold-light rounded-full px-4 py-1.5 transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
