// desmos graph: https://www.desmos.com/calculator/ytmtut1d6h

import { MinesGrid, MinesRow } from "../types";

export const minesReturnRate = 0.98;

export function calculateMinesProbability(bombs: number, tilesFlipped: number) {
  const productArr = [];

  for (let i = 0; i < tilesFlipped; i++) {
    productArr.push((25 - bombs - i) / (25 - i));
  }

  return productArr.reduce((acc, val) => acc * val, 1);
}

export function calculateMinesMultiplier(probability: number) {
  return (1 / probability) * minesReturnRate;
}

export function sanitizeMinesGrid(grid: MinesGrid): MinesGrid {
  return grid.map((row: MinesRow) =>
    row.map((tile) => ({
      revealed: tile.revealed,
    }))
  );
}
