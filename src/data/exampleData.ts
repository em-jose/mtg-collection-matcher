import collectionCsv from "@data/fixtures/moxfield_haves_2026-03-22-1812Z.csv?raw";
import grixisAffinityDeck from "@data/fixtures/grixis_affinity.txt?raw";
import monoBlueTerrorDeck from "@data/fixtures/mono_blue_terror.txt?raw";

export const EXAMPLE_COLLECTION_DATA = collectionCsv.trim();

export const EXAMPLE_DECKS_DATA = [
  {
    name: "Grixis Affinity",
    content: grixisAffinityDeck.trim(),
  },
  {
    name: "Mono Blue Terror",
    content: monoBlueTerrorDeck.trim(),
  },
];
