import { memo, useCallback } from "react";
import MinesTile from "@/components/ui/games/mines/tile";

interface ControlledTileProps {
  rowIndex: number;
  colIndex: number;
  revealed: boolean;
  value?: "mine" | "safe";
  onFlip: (row: number, col: number) => void;
}

const ControlledTile = memo(function ControlledTile({
  rowIndex,
  colIndex,
  revealed,
  value,
  onFlip,
}: ControlledTileProps) {
  const handleClick = useCallback(() => {
    if (revealed) return;
    onFlip(rowIndex, colIndex);
  }, [revealed, rowIndex, colIndex, onFlip]);

  return (
    <button type="button" className="m-2" onClick={handleClick}>
      <MinesTile flipped={revealed} value={value} />
    </button>
  );
});

export default ControlledTile;
