
// ─── Game Constants ───────────────────────────────────────────────────────────

export const CANVAS_WIDTH  = 800;
export const CANVAS_HEIGHT = 650;

export const PADDLE_WIDTH  = 110;
export const PADDLE_HEIGHT = 14;
export const PADDLE_Y_OFFSET = 50;

export const BALL_RADIUS = 9;
export const BALL_BASE_SPEED = 5.5;
export const BALL_MAX_SPEED  = 18;

export const BRICK_COLS    = 10;
export const BRICK_ROWS    = 6;
export const BRICK_WIDTH   = 60;
export const BRICK_HEIGHT  = 40;
export const BRICK_PAD_X   = 8;
export const BRICK_PAD_Y   = 7;
export const BRICK_OFFSET_X = 16;
export const BRICK_OFFSET_Y = 58;

export const LIVES_START = 3;
export const TOTAL_LEVELS = 100;

// ─── Brick Types ──────────────────────────────────────────────────────────────

export const enum BrickType {
  POOP   = 'poop',
  TOILET = 'toilet',
  EMPTY  = 'empty',
}

// ─── Game States ──────────────────────────────────────────────────────────────

export const enum GameState {
  START        = 'start',
  PLAYING      = 'playing',
  PAUSED       = 'paused',
  BALL_LAUNCH  = 'ball_launch',
  GAME_OVER    = 'game_over',
  LEVEL_CLEAR  = 'level_clear',
  WIN          = 'win',
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export const SCORE_POOP_PER_HIT   = 10;
export const SCORE_TOILET_PER_HIT = 20;
