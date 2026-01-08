import { GiClubs, GiDiamonds, GiSpades, GiHearts } from "react-icons/gi";
import { PlayingCardProps } from "@/lib/types";

export default function PlayingCard({
  suit,
  rank,
  width = 56,
}: PlayingCardProps) {
  const SuitIcon =
    suit === "hearts"
      ? GiHearts
      : suit === "diamonds"
      ? GiDiamonds
      : suit === "clubs"
      ? GiClubs
      : GiSpades;

  const cardWidth = width * 4;
  const cardHeight = (width / 7) * 40;

  return (
    <div
      style={{
        width: cardWidth,
        height: cardHeight,
      }}
      
      className={`relative flex flex-col items-center justify-between rounded-2xl bg-gray-50 ${
        suit === "hearts" || suit === "diamonds"
          ? "text-red-500"
          : "text-gray-800"
      }`}
    >
      <div className="flex flex-col items-start w-full pl-2">
        <p style={{ fontSize: width / 56 * 60 }} className="font-bold leading-tight">{rank}</p>
        <SuitIcon size={width / 56 * 48} />
      </div>

      <div className="absolute -translate-y-1/2 top-1/2">
        <SuitIcon size={width / 56 * 130} />
      </div>

      <div className="flex flex-col items-start w-full pl-2 rotate-180">
        <p style={{ fontSize: width / 56 * 60 }} className="font-bold leading-tight">{rank}</p>
        <SuitIcon size={width / 56 * 48} />
      </div>
    </div>
  );
}
