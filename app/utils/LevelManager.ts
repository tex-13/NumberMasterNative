// app/utils/LevelManager.ts
// A small reusable Level Manager class that can be plugged into any game.
// Keeps level config and progression logic separate from UI / gameplay.

import {
  LEVELS as DEFAULT_LEVELS,
  GRID_COLS,
  INITIAL_ROWS,
  MAX_ROWS,
  LEVEL_TIME,
} from "../constants/gameConfig";

export type LevelConfig = {
  id: number;
  name: string;
  description: string;
  numberRange: [number, number];
  targetMatches: number;
  allowDiagonal: boolean;
  maxAddRows: number | null;
  colorFrom?: string;
  colorTo?: string;
};

export class LevelManager {
  private levels: LevelConfig[];
  private currentIndex: number;

  constructor(levels?: LevelConfig[], startIndex = 0) {
    this.levels = levels ?? (DEFAULT_LEVELS as any);
    this.currentIndex = startIndex;
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  getCurrentLevel(): LevelConfig {
    return this.levels[this.currentIndex];
  }

  getLevelByIndex(i: number): LevelConfig {
    return this.levels[i];
  }

  // Set the current level (used by UI to start/change levels)
  setLevel(index: number) {
    if (index < 0 || index >= this.levels.length)
      throw new Error("invalid level index");
    this.currentIndex = index;
  }

  // Move to next level (returns false if already last)
  nextLevel(): boolean {
    if (this.currentIndex < this.levels.length - 1) {
      this.currentIndex++;
      return true;
    }
    return false;
  }

  // Reset to first level
  reset() {
    this.currentIndex = 0;
  }

  // Return a minimal serializable snapshot (useful for saving or communicating to UI)
  getSnapshot() {
    const lvl = this.getCurrentLevel();
    return {
      index: this.currentIndex,
      id: lvl.id,
      name: lvl.name,
      targetMatches: lvl.targetMatches,
      allowDiagonal: lvl.allowDiagonal,
      maxAddRows: lvl.maxAddRows,
      numberRange: lvl.numberRange,
      duration: LEVEL_TIME,
      gridCols: GRID_COLS,
      initialRows: INITIAL_ROWS,
      maxRows: MAX_ROWS,
    };
  }
}

export default LevelManager;
