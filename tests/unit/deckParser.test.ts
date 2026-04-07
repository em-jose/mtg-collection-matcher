import { describe, it, expect } from "vitest";
import { parseDeck } from "../../src/services/deckParser";

describe("deckParser", () => {
  it("parses a basic decklist with mainboard only", () => {
    const text = `4 Lightning Bolt
      4 Counterspell
      2 Snapcaster Mage`;

    const deck = parseDeck(text, "1", "Test Deck");
    expect(deck.name).toBe("Test Deck");
    expect(deck.mainboard).toHaveLength(3);
    expect(deck.sideboard).toHaveLength(0);
    expect(deck.totalCards).toBe(10);
  });

  it("parses mainboard + sideboard separated by blank line", () => {
    const text = `4 Lightning Bolt
      4 Counterspell

      2 Negate
      1 Dispel`;

    const deck = parseDeck(text, "1");
    expect(deck.mainboard).toHaveLength(2);
    expect(deck.sideboard).toHaveLength(2);
    expect(deck.mainboard).toContainEqual({
      name: "Lightning Bolt",
      quantity: 4,
      set: undefined,
    });
    expect(deck.sideboard).toContainEqual({
      name: "Negate",
      quantity: 2,
      set: undefined,
    });
  });

  it('parses sideboard with explicit "Sideboard" header', () => {
    const text = `4 Lightning Bolt
      4 Counterspell

      Sideboard
      2 Negate
      1 Dispel`;

    const deck = parseDeck(text, "1");
    expect(deck.mainboard).toHaveLength(2);
    expect(deck.sideboard).toHaveLength(2);
  });

  it('parses real Grixis Affinity decklist with "Deck" header', () => {
    const text = `Deck
      3 Krark-Clan Shaman
      4 Myr Enforcer
      4 Refurbished Familiar
      4 Utrom Monitor
      4 Ichor Wellspring
      3 Nihil Spellbomb
      1 Chromatic Star
      2 Blood Fountain
      1 Hunter's Blowgun
      1 Cast Down
      3 Galvanic Blast
      4 Reckoner's Bargain
      1 Toxin Analysis
      1 Eviscerator's Insight
      4 Thoughtcast
      1 Makeshift Munitions
      2 Great Furnace
      3 Seat of the Synod
      3 Vault of Whispers
      4 Drossforge Bridge
      4 Mistvault Bridge
      3 Silverbluff Bridge

      Sideboard
      1 Turn Aside
      1 Hydroblast
      1 Pyroblast
      4 Blue Elemental Blast
      4 Red Elemental Blast
      1 Krark-Clan Shaman
      1 Nihil Spellbomb
      1 Breath Weapon
      1 Toxin Analysis`;

    const deck = parseDeck(text, "1", "Grixis Affinity");
    expect(deck.name).toBe("Grixis Affinity");
    expect(deck.mainboard).toHaveLength(22);
    expect(deck.sideboard).toHaveLength(9);

    const mainTotal = deck.mainboard.reduce((s, c) => s + c.quantity, 0);
    const sideTotal = deck.sideboard.reduce((s, c) => s + c.quantity, 0);
    expect(mainTotal).toBe(60);
    expect(sideTotal).toBe(15);
    expect(deck.totalCards).toBe(75);
  });

  it("parses real Mono Blue Terror decklist", () => {
    const text = `Deck
      4 Delver of Secrets
      4 Cryptic Serpent
      4 Tolarian Terror
      3 Force Spike
      2 Dispel
      4 Mental Note
      4 Thought Scour
      4 Counterspell
      4 Brainstorm
      2 Deem Inferior
      2 Ponder
      4 Lórien Revealed
      2 Sleep of the Dead
      1 Deep Analysis
      16 Island

      Sideboard
      4 Annul
      2 Spreading Seas
      1 Blue Elemental Blast
      4 Gut Shot
      4 Hydroblast`;

    const deck = parseDeck(text, "2", "Mono Blue Terror");
    expect(deck.name).toBe("Mono Blue Terror");

    const mainTotal = deck.mainboard.reduce((s, c) => s + c.quantity, 0);
    const sideTotal = deck.sideboard.reduce((s, c) => s + c.quantity, 0);
    expect(mainTotal).toBe(60);
    expect(sideTotal).toBe(15);
    expect(deck.totalCards).toBe(75);
  });

  it("ignores comment lines", () => {
    const text = `// This is a comment
      4 Lightning Bolt
      # Another comment
      2 Counterspell`;

    const deck = parseDeck(text, "1");
    expect(deck.mainboard).toHaveLength(2);
  });

  it('parses "SB:" prefix format', () => {
    const text = `4 Lightning Bolt
      SB: 2 Negate
      SB: 1 Dispel`;

    const deck = parseDeck(text, "1");
    expect(deck.mainboard).toHaveLength(1);
    expect(deck.sideboard).toHaveLength(2);
  });

  it("uses default name if none provided", () => {
    const deck = parseDeck("4 Lightning Bolt", "5");
    expect(deck.name).toBe("Deck 5");
  });
});
