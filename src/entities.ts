
import { BrickType } from "./definitions";

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  trail: { x: number; y: number; alpha: number }[];
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  targetX: number;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  type: BrickType;
  hits: number;
  maxHits: number;
  alive: boolean;
  shakeTimer: number;
  scaleAnim: number;
  opacity: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  emoji: string;
  size: number;
  rotation: number;
  rotSpeed: number;
}

export interface FlashMessage {
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

export interface GameData {
  score: number;
  highScore: number;
  lives: number;
  level: number;
  combo: number;
  comboTimer: number;
  bricks: Brick[][];
  ball: Ball;
  paddle: Paddle;
  particles: Particle[];
  flashes: FlashMessage[];
  shakeX: number;
  shakeY: number;
  shakeTimer: number;
}
