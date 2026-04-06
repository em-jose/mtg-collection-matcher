import { Link, useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-linear-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
              M
            </div>
            <span className="text-lg font-bold text-white">
              MTG Collection <span className="text-amber-500">Matcher</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/"
                  ? "text-amber-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Input
            </Link>
            <Link
              to="/results"
              className={`text-sm font-medium transition-colors ${
                location.pathname === "/results"
                  ? "text-amber-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Results
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
