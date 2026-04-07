import type { SharedCard, CardPrice } from "@types";
import { Badge } from "@components/ui/Badge";
import { CardImage } from "@components/ui/CardImage";

interface SharedCardsProps {
  sharedCards: SharedCard[];
  prices: Map<string, CardPrice>;
}

export function SharedCards({ sharedCards, prices }: SharedCardsProps) {
  if (sharedCards.length === 0) return null;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5">
      <h3 className="text-lg font-bold text-white mb-4">
        Shared Cards Between Decks
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left py-2 pr-4">Card</th>
              <th className="text-left py-2 pr-4">Decks</th>
              <th className="text-right py-2 pr-4">Needed</th>
              <th className="text-right py-2 pr-4">Owned</th>
              <th className="text-right py-2">Shortage</th>
            </tr>
          </thead>
          <tbody>
            {sharedCards.map((card) => (
              <tr
                key={card.name}
                className="border-b border-gray-700/50 hover:bg-gray-700/30"
              >
                <td className="py-2 pr-4 text-gray-200 font-medium">
                  <CardImage cardName={card.name} prices={prices}>
                    <span className="cursor-help">{card.name}</span>
                  </CardImage>
                </td>
                <td className="py-2 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {card.decks.map((deck, i) => (
                      <Badge key={i} variant="default">
                        {deck}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="py-2 pr-4 text-right text-gray-300">
                  {card.totalNeeded}
                </td>
                <td className="py-2 pr-4 text-right text-gray-300">
                  {card.owned}
                </td>
                <td
                  className={`py-2 text-right font-medium ${card.shortage > 0 ? "text-red-400" : "text-emerald-400"}`}
                >
                  {card.shortage > 0 ? `${card.shortage}` : "OK"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
