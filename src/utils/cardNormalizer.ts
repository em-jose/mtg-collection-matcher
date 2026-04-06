/**
 * Normalize a card name for comparison purposes.
 * Handles trimming, lowercasing, and split/DFC cards.
 */
export function normalizeCardName(name: string): string {
  const normalized = name.trim().toLowerCase();

  // For split cards like "Fire // Ice", use the full name
  // For DFCs, only use the front face (before " // ")
  // Moxfield exports DFCs with full name, but decklists usually use front face only
  // We keep the full name for split cards since both halves matter

  return normalized;
}

/**
 * Check if two card names match, handling various formats.
 */
export function cardNamesMatch(a: string, b: string): boolean {
  const normA = normalizeCardName(a);
  const normB = normalizeCardName(b);

  if (normA === normB) return true;

  // Handle case where one has " // " and the other doesn't
  // e.g., "Fire" should match "Fire // Ice"
  if (normA.includes(' // ') && !normB.includes(' // ')) {
    const frontFace = normA.split(' // ')[0];
    return frontFace === normB;
  }
  if (normB.includes(' // ') && !normA.includes(' // ')) {
    const frontFace = normB.split(' // ')[0];
    return frontFace === normA;
  }

  return false;
}
