// app/constants/gameConfig.ts
export const GRID_COLS = 5;
export const INITIAL_ROWS = 3;
export const MAX_ROWS = 8;
export const LEVEL_TIME = 180; // seconds

export const LEVELS = [
  {
    id: 1,
    name: "Beginner",
    description: "Easy numbers with all match types",
    numberRange: [1, 5],
    targetMatches: 10,
    allowDiagonal: true,
    maxAddRows: null,
    colorFrom: "#4B5563",
    colorTo: "#111827",
  },
  {
    id: 2,
    name: "Intermediate",
    description: "More numbers, higher target",
    numberRange: [1, 7],
    targetMatches: 15,
    allowDiagonal: true,
    maxAddRows: null,
    colorFrom: "#374151",
    colorTo: "#0b1220",
  },
  {
    id: 3,
    name: "Advanced",
    description: "Hardest numbers + limited add-rows",
    numberRange: [1, 9],
    targetMatches: 20,
    allowDiagonal: true,
    maxAddRows: 3,
    colorFrom: "#111827",
    colorTo: "#000000",
  },
];