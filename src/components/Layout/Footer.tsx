export function Footer() {
  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-center text-xs text-gray-500">
          Powered by{" "}
          <a
            href="https://scryfall.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-amber-500 transition-colors"
          >
            Scryfall
          </a>{" "}
          &middot; MTG Collection Matcher is not affiliated with Wizards of the
          Coast
        </p>
      </div>
    </footer>
  );
}
