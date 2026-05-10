
import { BrickType, BRICK_COLS, BRICK_ROWS, TOTAL_LEVELS } from "./definitions";

// P = poop, T = toilet, _ = empty
type Cell = 'P' | 'T' | '_';
type Grid = Cell[][];

const R = BRICK_ROWS;  // 6
const C = BRICK_COLS;  // 10

// ─── Helper to fill a full grid ───────────────────────────────────────────────
function fullGrid(cell: Cell = 'P'): Grid {
  return Array.from({ length: R }, () => Array(C).fill(cell));
}

function emptyGrid(): Grid {
  return Array.from({ length: R }, () => Array(C).fill('_'));
}

function clone(g: Grid): Grid {
  return g.map(r => [...r]);
}

// ─── Shape stamps (row, col offsets) ─────────────────────────────────────────
const DIAMOND: [number, number][] = [
  [0,4],[0,5],
  [1,3],[1,4],[1,5],[1,6],
  [2,2],[2,3],[2,4],[2,5],[2,6],[2,7],
  [3,3],[3,4],[3,5],[3,6],
  [4,4],[4,5],
];
const HEART: [number, number][] = [
  [0,2],[0,3],[0,6],[0,7],
  [1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],
  [2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],
  [3,2],[3,3],[3,4],[3,5],[3,6],[3,7],
  [4,3],[4,4],[4,5],[4,6],
  [5,4],[5,5],
];
const X_SHAPE: [number, number][] = [
  [0,0],[0,1],[0,8],[0,9],
  [1,1],[1,2],[1,7],[1,8],
  [2,2],[2,3],[2,4],[2,5],[2,6],[2,7],
  [3,3],[3,4],[3,5],[3,6],
  [4,1],[4,2],[4,7],[4,8],
  [5,0],[5,1],[5,8],[5,9],
];
const BORDER: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (let c = 0; c < C; c++) { pts.push([0, c]); pts.push([R-1, c]); }
  for (let r = 1; r < R-1; r++) { pts.push([r, 0]); pts.push([r, C-1]); }
  return pts;
})();
const CHECKERBOARD: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if ((r + c) % 2 === 0) pts.push([r, c]);
  return pts;
})();
const ZIGZAG: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (let r = 0; r < R; r++) {
    const start = (r % 2 === 0) ? 0 : 1;
    for (let c = start; c < C; c += 2) pts.push([r, c]);
  }
  return pts;
})();
const WAVE: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (let c = 0; c < C; c++) {
    const r = Math.round(2.5 + 2.5 * Math.sin((c / C) * Math.PI * 2));
    const clampedR = Math.max(0, Math.min(R-1, r));
    pts.push([clampedR, c]);
    if (clampedR > 0) pts.push([clampedR - 1, c]);
  }
  return pts;
})();
const SPIRAL: [number, number][] = [
  [0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],
  [1,9],[2,9],[3,9],[4,9],[5,9],
  [5,8],[5,7],[5,6],[5,5],[5,4],[5,3],[5,2],[5,1],[5,0],
  [4,0],[3,0],[2,0],[1,0],
  [1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7],[1,8],
  [2,8],[3,8],[4,8],
  [4,7],[4,6],[4,5],[4,4],[4,3],[4,2],[4,1],
  [3,1],[2,1],
  [2,2],[2,3],[2,4],[2,5],[2,6],[2,7],
  [3,7],[3,6],[3,5],[3,4],[3,3],[3,2],
];
const COLUMNS: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (let c = 1; c < C; c += 3) for (let r = 0; r < R; r++) pts.push([r, c]);
  return pts;
})();
const ROWS_ALT: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (let r = 0; r < R; r += 2) for (let c = 0; c < C; c++) pts.push([r, c]);
  return pts;
})();
const TRIANGLE: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (let r = 0; r < R; r++) {
    const start = Math.floor(r / 2);
    const end = C - Math.floor(r / 2);
    for (let c = start; c < end; c++) pts.push([r, c]);
  }
  return pts;
})();
const PLUS_SIGN: [number, number][] = (() => {
  const pts: [number, number][] = [];
  const midR = Math.floor(R / 2);
  const midC = Math.floor(C / 2);
  for (let r = 0; r < R; r++) pts.push([r, midC], [r, midC - 1]);
  for (let c = 0; c < C; c++) pts.push([midR, c], [midR - 1, c]);
  return pts;
})();
const HOURGLASS: [number, number][] = (() => {
  const pts: [number, number][] = [];
  for (let r = 0; r < R; r++) {
    const margin = r <= R/2 ? r : R - 1 - r;
    for (let c = margin; c < C - margin; c++) pts.push([r, c]);
  }
  return pts;
})();

// ─── stamp helpers ────────────────────────────────────────────────────────────
function stamp(g: Grid, pts: [number,number][], cell: Cell): void {
  for (const [r, c] of pts) {
    if (r >= 0 && r < R && c >= 0 && c < C) g[r][c] = cell;
  }
}

// ─── Compute hit values for a level ──────────────────────────────────────────
// Level 1: poop=1, toilet=2
// Level 100: poop=5, toilet=10
// We scale linearly.
export function getHitValues(level: number): { poopHits: number; toiletHits: number } {
  const t = (level - 1) / (TOTAL_LEVELS - 1); // 0..1
  const poopHits   = Math.round(1 + t * 4);    // 1..5
  const toiletHits = Math.round(2 + t * 8);    // 2..10
  return { poopHits, toiletHits };
}

// ─── Speed multiplier per level ──────────────────────────────────────────────
export function getLevelSpeedMult(level: number): number {
  // 1.0 at lvl 1 → 2.0 at lvl 100
  return 1 + ((level - 1) / (TOTAL_LEVELS - 1)) * 1.0;
}

// ─── The 100-level layout generator ─────────────────────────────────────────
export function generateLayout(level: number): BrickType[][] {
  const grid: Grid = emptyGrid();

  const t = (level - 1) / (TOTAL_LEVELS - 1); // 0..1

  // How dense is 'T' vs 'P'? Early=mostly P, late=mostly T
  // At lvl 1 t=0: 0% T, at lvl 100 t=1: 90% T
  const toiletRatio = Math.pow(t, 0.7) * 0.9;

  // Pick a shape pattern cycling through our shapes
  const shapeIndex = (level - 1) % 20;

  function fill(g: Grid, pts: [number,number][]): void {
    for (const [r, c] of pts) {
      if (r < 0 || r >= R || c < 0 || c >= C) continue;
      const isToilet = Math.random() < toiletRatio;
      g[r][c] = isToilet ? 'T' : 'P';
    }
  }

  // ─── Phase 1: Levels 1–20: Simple shapes, mostly poop ──────────────────
  // ─── Phase 2: Levels 21–60: More complex, mixed ─────────────────────────
  // ─── Phase 3: Levels 61–100: Dense, all bricks, toilet-heavy ────────────

  switch (shapeIndex) {
    case 0: { // Full grid
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) grid[r][c] = 'P';
      stamp(grid, BORDER.filter(([rr]) => rr < 3), 'T');
      break;
    }
    case 1: { // Checkerboard P+T
      fill(grid, CHECKERBOARD);
      // Invert cells
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        if ((r + c) % 2 !== 0) grid[r][c] = Math.random() < toiletRatio ? 'T' : 'P';
      }
      break;
    }
    case 2: { // Diamond
      fill(grid, DIAMOND);
      // Fill rest sparsely
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        if (grid[r][c] === '_' && Math.random() < 0.3) grid[r][c] = 'P';
      }
      break;
    }
    case 3: { // X shape
      fill(grid, X_SHAPE);
      break;
    }
    case 4: { // Border only
      fill(grid, BORDER);
      break;
    }
    case 5: { // Zigzag
      fill(grid, ZIGZAG);
      break;
    }
    case 6: { // Wave
      fill(grid, WAVE);
      // Fill a few extras
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        if (grid[r][c] === '_' && Math.random() < 0.2) grid[r][c] = 'P';
      }
      break;
    }
    case 7: { // Spiral
      fill(grid, SPIRAL);
      break;
    }
    case 8: { // Columns
      fill(grid, COLUMNS);
      // Also fill alternating rows
      fill(grid, ROWS_ALT.filter(([rr]) => rr % 2 === 0 && Math.random() < 0.5));
      break;
    }
    case 9: { // Heart
      fill(grid, HEART);
      break;
    }
    case 10: { // Triangle
      fill(grid, TRIANGLE);
      break;
    }
    case 11: { // Plus sign
      fill(grid, PLUS_SIGN);
      break;
    }
    case 12: { // Hourglass
      fill(grid, HOURGLASS);
      break;
    }
    case 13: { // Border + inner fill (fortress)
      fill(grid, BORDER);
      // Inner region every other cell
      for (let r = 2; r < R - 2; r++) for (let c = 2; c < C - 2; c++) {
        if (Math.random() < 0.5) grid[r][c] = Math.random() < toiletRatio ? 'T' : 'P';
      }
      break;
    }
    case 14: { // Diagonal stripes
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const stripe = ((r + c) % 4);
        if (stripe < 2) grid[r][c] = stripe === 0 ? 'T' : 'P';
      }
      break;
    }
    case 15: { // Pyramid
      for (let r = 0; r < R; r++) {
        const count = C - r * 2;
        if (count <= 0) continue;
        const start = r;
        for (let c = start; c < C - r; c++) grid[r][c] = Math.random() < toiletRatio ? 'T' : 'P';
      }
      break;
    }
    case 16: { // Full grid with empty circle in middle
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const dr = r - (R-1)/2;
        const dc = c - (C-1)/2;
        const dist = Math.sqrt(dr*dr + dc*dc*0.6);
        if (dist > 1.5) grid[r][c] = Math.random() < toiletRatio ? 'T' : 'P';
      }
      break;
    }
    case 17: { // Two diagonal bands
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        const d1 = Math.abs(r - c * R/C);
        const d2 = Math.abs(r - (R-1) + c * R/C);
        if (d1 < 1.2 || d2 < 1.2) grid[r][c] = Math.random() < toiletRatio ? 'T' : 'P';
      }
      break;
    }
    case 18: { // Scattered random dense
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
        if (Math.random() < 0.65 + t * 0.3) grid[r][c] = Math.random() < toiletRatio ? 'T' : 'P';
      }
      break;
    }
    case 19: { // Checkerboard of shapes (4 quadrants)
      // Top-left: diamond
      fill(grid, DIAMOND.filter(([r,c]) => r < R/2 && c < C/2));
      // Top-right: columns
      fill(grid, COLUMNS.filter(([r,c]) => r < R/2 && c >= C/2));
      // Bottom-left: rows_alt
      fill(grid, ROWS_ALT.filter(([r,c]) => r >= R/2 && c < C/2));
      // Bottom-right: fill
      for (let r = Math.floor(R/2); r < R; r++) for (let c = Math.floor(C/2); c < C; c++) {
        if (Math.random() < 0.7) grid[r][c] = Math.random() < toiletRatio ? 'T' : 'P';
      }
      break;
    }
  }

  // For higher levels ensure minimum brick density
  const minDensity = 0.4 + t * 0.5; // 40%..90%
  let count = 0;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c] !== '_') count++;
  const total = R * C;
  if (count / total < minDensity) {
    const need = Math.floor(total * minDensity) - count;
    let added = 0;
    for (let r = 0; r < R && added < need; r++) {
      for (let c = 0; c < C && added < need; c++) {
        if (grid[r][c] === '_') {
          grid[r][c] = Math.random() < toiletRatio ? 'T' : 'P';
          added++;
        }
      }
    }
  }

  // Convert to BrickType[][]
  return grid.map(row => row.map(cell => {
    if (cell === 'T') return BrickType.TOILET;
    if (cell === 'P') return BrickType.POOP;
    return BrickType.EMPTY;
  }));
}
