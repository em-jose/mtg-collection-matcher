import type { Card, UserCollection } from '@types';

/**
 * Parse a plain text collection (Moxfield, MTGA, etc.)
 * Formats supported:
 *   1 Sol Ring
 *   1x Sol Ring
 *   1x Sol Ring (CMR)
 *   1 Sol Ring [CMR]
 */
function parseTextCollection(text: string): Card[] {
  const cards: Card[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    // Match: optional quantity (with optional 'x'), then card name, then optional set in () or []
    const match = trimmed.match(/^(\d+)x?\s+(.+?)(?:\s*[\(\[]([\w\d]+)[\)\]])?$/i);
    if (match) {
      const quantity = parseInt(match[1], 10);
      const name = match[2].trim();
      const set = match[3]?.toUpperCase();

      if (name && quantity > 0) {
        cards.push({ name, quantity, set });
      }
    }
  }

  return cards;
}

/**
 * Parse a Moxfield CSV export.
 * Expected columns: Count, Tradelist Count, Name, Edition, Edition Code, ...
 * Or: Quantity, Name, Set Code, ...
 */
function parseCsvCollection(text: string): Card[] {
  const cards: Card[] = [];
  const lines = text.split('\n').filter(l => l.trim());

  if (lines.length < 2) return cards;

  // Parse header to find column indices
  const header = parseCSVLine(lines[0]);
  const nameIdx = header.findIndex(h =>
    h.toLowerCase() === 'name' || h.toLowerCase() === 'card name'
  );
  const countIdx = header.findIndex(h =>
    ['count', 'quantity', 'qty'].includes(h.toLowerCase())
  );
  const setIdx = header.findIndex(h =>
    ['edition code', 'set code', 'set', 'edition'].includes(h.toLowerCase())
  );

  if (nameIdx === -1 || countIdx === -1) return cards;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    const name = cols[nameIdx]?.trim();
    const quantity = parseInt(cols[countIdx]?.trim(), 10);
    const set = cols[setIdx]?.trim().toUpperCase();

    if (name && quantity > 0) {
      cards.push({ name, quantity, set: set || undefined });
    }
  }

  return cards;
}

/**
 * Parse a single CSV line, handling quoted fields.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map(s => s.replace(/^"|"$/g, ''));
}

/**
 * Detect if the input is CSV or plain text and parse accordingly.
 */
function isCSV(text: string): boolean {
  const firstLine = text.split('\n')[0] || '';
  // CSV typically has commas and common header names
  return firstLine.includes(',') && (
    firstLine.toLowerCase().includes('name') ||
    firstLine.toLowerCase().includes('count') ||
    firstLine.toLowerCase().includes('quantity')
  );
}

/**
 * Merge duplicate cards (same name), summing quantities.
 */
function mergeCards(cards: Card[]): Card[] {
  const map = new Map<string, Card>();

  for (const card of cards) {
    const key = card.name.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.quantity += card.quantity;
    } else {
      map.set(key, { ...card });
    }
  }

  return Array.from(map.values());
}

/**
 * Parse a collection from text (auto-detects CSV vs plain text).
 */
export function parseCollection(text: string): UserCollection {
  if (!text.trim()) {
    return { cards: [], totalCards: 0, uniqueCards: 0 };
  }

  const rawCards = isCSV(text)
    ? parseCsvCollection(text)
    : parseTextCollection(text);

  const cards = mergeCards(rawCards);
  const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);

  return {
    cards,
    totalCards,
    uniqueCards: cards.length,
  };
}
