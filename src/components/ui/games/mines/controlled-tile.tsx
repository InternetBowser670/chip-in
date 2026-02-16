import { memo, useCallback } from "react";
import MinesTile from "@/components/ui/games/mines/tile";

interface ControlledTileProps {
  rowIndex: number;
  colIndex: number;
  revealed: boolean;
  value?: "mine" | "safe";
  onFlip: (row: number, col: number) => void;
  queued?: boolean;
}

const ControlledTile = memo(function ControlledTile({
  rowIndex,
  colIndex,
  revealed,
  value,
  onFlip,
  queued
}: ControlledTileProps) {
  const handleClick = useCallback(() => {
    if (revealed) return;
    onFlip(rowIndex, colIndex);
  }, [revealed, rowIndex, colIndex, onFlip]);

  return (
    <button type="button" className="w-1/5 m-3" onClick={handleClick}>
      <MinesTile flipped={revealed} value={value} queued={queued} />
    </button>
  );
});

export default ControlledTile;
