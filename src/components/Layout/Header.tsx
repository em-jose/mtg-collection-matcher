import { Link, useLocation } from "react-router-dom";

export function Header() {
  const location = useLocation();

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-linear-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="w-6 h-6 text-white "
              >
                <path
                  fill="currentColor"
                  d="M128 464L213.7 255.8C230.7 214.5 261.5 180.5 300.9 159.5L447.8 81.2C460.1 74.6 474.3 85.9 470.8 99.4L433.6 241.8C432.5 245.9 432 250.1 432 254.4C432 260.7 433.2 267 435.6 272.9L512 464L304.9 464L316.7 428.6L357.1 415.1C363.6 412.9 368 406.8 368 399.9C368 393 363.6 386.9 357.1 384.7L316.7 371.2L303.2 330.8C301 324.4 294.9 320 288 320C281.1 320 275 324.4 272.8 330.9L259.3 371.3L218.9 384.8C212.4 387 208 393.1 208 400C208 406.9 212.4 413 218.9 415.2L259.3 428.7L271.1 464.1L128 464.1zM343.6 205.5C342.5 202.2 339.5 200 336 200C332.5 200 329.5 202.2 328.4 205.5L321.7 225.7L301.5 232.4C298.2 233.5 296 236.5 296 240C296 243.5 298.2 246.5 301.5 247.6L321.7 254.3L328.4 274.5C329.5 277.8 332.5 280 336 280C339.5 280 342.5 277.8 343.6 274.5L350.3 254.3L370.5 247.6C373.8 246.5 376 243.5 376 240C376 236.5 373.8 233.5 370.5 232.4L350.3 225.7L343.6 205.5zM96 512L544 512C561.7 512 576 526.3 576 544C576 561.7 561.7 576 544 576L96 576C78.3 576 64 561.7 64 544C64 526.3 78.3 512 96 512z"
                />
              </svg>
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
