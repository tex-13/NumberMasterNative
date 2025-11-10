// app/utils/gameLogic.ts
import { GRID_COLS } from "../constants/gameConfig";

/* Pure utility functions, unchanged logic from your original file */

export const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
export const makeId = () => Math.random().toString(36).slice(2, 9);

export const generateNumberSequence = (
  totalCells: number,
  min: number,
  max: number,
  guaranteedPairs: number
) => {
  const numbers: number[] = [];

  for (let i = 0; i < guaranteedPairs; i++) {
    if (Math.random() > 0.5) {
      const candidates: [number, number][] = [];
      for (let x = min; x <= max; x++) {
        const y = 10 - x;
        if (y >= min && y <= max && x !== y) candidates.push([x, y]);
      }
      if (candidates.length > 0) {
        const pair = candidates[randInt(0, candidates.length - 1)];
        numbers.push(pair[0], pair[1]);
        continue;
      }
    }
    const n = randInt(min, max);
    numbers.push(n, n);
  }

  while (numbers.length < totalCells) numbers.push(randInt(min, max));

  // Fisher-Yates shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return numbers;
};

export const numbersToGrid = (numbers: number[], cols = GRID_COLS) => {
  const grid: any[] = [];
  for (let i = 0; i < numbers.length; i += cols) {
    const row = numbers.slice(i, i + cols).map((value) => ({
      value,
      matched: false,
      id: makeId(),
    }));
    grid.push(row);
  }
  return grid;
};

export const isPathClear = (
  grid: any[][],
  pos1: { row: number; col: number },
  pos2: { row: number; col: number },
  allowDiagonal: boolean
) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const r1 = pos1.row,
    c1 = pos1.col;
  const r2 = pos2.row,
    c2 = pos2.col;

  if (r1 === r2 && c1 === c2) return false;

  const isBlocking = (r: number, c: number) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    const cell = grid[r][c];
    if (!cell) return false;
    return !cell.matched;
  };

  // Horizontal
  if (r1 === r2) {
    const start = Math.min(c1, c2) + 1;
    const end = Math.max(c1, c2) - 1;
    for (let c = start; c <= end; c++) if (isBlocking(r1, c)) return false;
    return true;
  }

  // Vertical
  if (c1 === c2) {
    const start = Math.min(r1, r2) + 1;
    const end = Math.max(r1, r2) - 1;
    for (let r = start; r <= end; r++) if (isBlocking(r, c1)) return false;
    return true;
  }

  // Diagonal (only if allowed and difference equal)
  if (allowDiagonal && Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
    const rowStep = r2 > r1 ? 1 : -1;
    const colStep = c2 > c1 ? 1 : -1;
    let r = r1 + rowStep,
      c = c1 + colStep;
    while (!(r === r2 && c === c2)) {
      if (isBlocking(r, c)) return false;
      r += rowStep;
      c += colStep;
    }
    return true;
  }

  // Line-by-line flatten
  const flattened: any[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) flattened.push(grid[r][c] ?? null);

  const idx1 = r1 * cols + c1;
  const idx2 = r2 * cols + c2;
  const startIdx = Math.min(idx1, idx2) + 1;
  const endIdx = Math.max(idx1, idx2) - 1;
  for (let i = startIdx; i <= endIdx; i++) {
    const cell = flattened[i];
    if (cell && !cell.matched) return false;
  }

  return true;
};