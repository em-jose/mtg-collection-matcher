import type { Card, ParsedDeck } from '@types';

type Section = 'mainboard' | 'sideboard' | 'commander' | 'companion';

const SECTION_MARKERS: Record<string, Section> = {
  'sideboard': 'sideboard',
  'sb:': 'sideboard',
  'side': 'sideboard',
  'commander': 'commander',
  'companion': 'companion',
  'deck': 'mainboard',
  'mainboard': 'mainboard',
  'main': 'mainboard',
};

/**
 * Parse a single decklist string into a ParsedDeck.
 * Supports mainboard + sideboard separated by blank line or section headers.
 */
export function parseDeck(text: string, id: string, name?: string): ParsedDeck {
  const mainboard: Card[] = [];
  const sideboard: Card[] = [];
  let currentSection: Section = 'mainboard';
  let hasSeenBlankLine = false;

  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    // Check for blank line (signals transition to sideboard if no explicit marker)
    if (!trimmed) {
      if (mainboard.length > 0) {
        hasSeenBlankLine = true;
      }
      continue;
    }

    // Check for section markers
    const lowerTrimmed = trimmed.toLowerCase();
    const sectionMatch = Object.entries(SECTION_MARKERS).find(([marker]) => {
      // Match "Sideboard", "SB:", "Deck", etc. at the start of the line
      if (lowerTrimmed === marker) return true;
      if (lowerTrimmed.startsWith(marker + ' ')) return true;
      if (lowerTrimmed.startsWith(marker + ':')) return true;
      // Also match without colon for markers that have it (e.g., "sb:" matches "sb")
      const markerNoColon = marker.replace(':', '');
      if (lowerTrimmed === markerNoColon) return true;
      if (lowerTrimmed.startsWith(markerNoColon + ':')) return true;
      if (lowerTrimmed.startsWith(markerNoColon + ' ')) return true;
      return false;
    });
    if (sectionMatch) {
      currentSection = sectionMatch[1];

      // If the marker line also contains a card (e.g., "SB: 2 Negate"), parse it
      // Strip the marker and any colon/space after it
      const markerPattern = new RegExp(`^${sectionMatch[0].replace(':', '')}:?\\s*`, 'i');
      const rest = trimmed.replace(markerPattern, '').trim();
      if (rest) {
        const card = parseCardLine(rest);
        if (card) {
          addToSection(card, currentSection, mainboard, sideboard);
        }
      }
      continue;
    }

    // If we've seen a blank line and no explicit section marker, assume sideboard
    if (hasSeenBlankLine && currentSection === 'mainboard') {
      currentSection = 'sideboard';
    }

    // Parse card line
    const card = parseCardLine(trimmed);
    if (card) {
      addToSection(card, currentSection, mainboard, sideboard);
    }
  }

  const totalCards = mainboard.reduce((s, c) => s + c.quantity, 0)
    + sideboard.reduce((s, c) => s + c.quantity, 0);

  return {
    id,
    name: name || `Deck ${id}`,
    mainboard,
    sideboard,
    totalCards,
  };
}

function addToSection(card: Card, section: Section, mainboard: Card[], sideboard: Card[]) {
  // Commander and companion go to mainboard
  if (section === 'sideboard') {
    sideboard.push(card);
  } else {
    mainboard.push(card);
  }
}

/**
 * Parse a single card line: "4 Lightning Bolt", "4x Lightning Bolt (M21)", etc.
 */
function parseCardLine(line: string): Card | null {
  const match = line.match(/^(\d+)x?\s+(.+?)(?:\s*[\(\[]([\w\d]+)[\)\]])?$/i);
  if (!match) return null;

  const quantity = parseInt(match[1], 10);
  const name = match[2].trim();
  const set = match[3]?.toUpperCase();

  if (!name || quantity <= 0) return null;

  return { name, quantity, set };
}
