import { GiClubs, GiDiamonds, GiSpades, GiHearts } from "react-icons/gi";
import { PlayingCardProps } from "@/lib/types";
import clsx from "clsx";
import { PiPokerChip } from "react-icons/pi";

export default function PlayingCard({
  suit,
  rank,
  width = 56,
  className,
  faceDown,
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
      className={clsx(
        `${className} + relative flex flex-col items-center justify-between rounded-2xl border ${
          suit === "hearts" || suit === "diamonds"
            ? "text-red-500"
            : "text-foreground"
        }`,
        faceDown ? "bg-background-700" : "bg-card"
      )}
    >
      {faceDown ? (
        <>
          {" "}
          <div className="flex-1 w-[calc(100%-16px)] h-[calc(100%-16px)] max-w-full max-h-full m-4 border-16 text-background-800 border-background-800 flex justify-center items-center">
            <PiPokerChip size={(width / 56) * 130} />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-start w-full pl-2">
            <p
              style={{ fontSize: (width / 56) * 60 }}
              className="font-bold leading-tight"
            >
              {rank.toLocaleUpperCase()}
            </p>
            <SuitIcon size={(width / 56) * 48} />
          </div>

          <div className="absolute -translate-y-1/2 top-1/2">
            <SuitIcon size={(width / 56) * 130} />
          </div>

          <div className="flex flex-col items-start w-full pl-2 rotate-180">
            <p
              style={{ fontSize: (width / 56) * 60 }}
              className="font-bold leading-tight"
            >
              {rank.toLocaleUpperCase()}
            </p>
            <SuitIcon size={(width / 56) * 48} />
          </div>
        </>
      )}
    </div>
  );
}
