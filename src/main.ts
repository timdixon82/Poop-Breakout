
import { PoopBreakout } from "./game";
import { showScreen, hideAllScreens } from "./ui";
import { persistence } from "./libs/persistence";
import { shareScore } from "./utils";

const HS_KEY      = "poopBreakout_highScore";
const LEVEL_KEY   = "poopBreakout_savedLevel";
const SCORE_KEY   = "poopBreakout_savedScore";
const LIVES_KEY   = "poopBreakout_savedLives";

async function main(): Promise<void> {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  const game = new PoopBreakout(canvas);

  // ─── Load persisted data ──────────────────────────────────────────────────
  const [storedHS, storedLevel, storedScore, storedLives] = await Promise.all([
    persistence.getItem(HS_KEY),
    persistence.getItem(LEVEL_KEY),
    persistence.getItem(SCORE_KEY),
    persistence.getItem(LIVES_KEY),
  ]);

  let highScore = storedHS ? parseInt(storedHS, 10) : 0;
  const savedLevel = storedLevel ? parseInt(storedLevel, 10) : 0;
  const savedScore = storedScore ? parseInt(storedScore, 10) : 0;
  const savedLives = storedLives ? parseInt(storedLives, 10) : 0;

  game.setHighScore(highScore);

  // ─── Scale canvas ─────────────────────────────────────────────────────────
  function scaleCanvas(): void {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / 800, vh / 650);
    canvas.style.width = `${800 * scale}px`;
    canvas.style.height = `${650 * scale}px`;
  }
  scaleCanvas();
  window.addEventListener("resize", scaleCanvas);

  // ─── Save helper ──────────────────────────────────────────────────────────
  async function saveProgress(): Promise<void> {
    const d = game.data;
    await Promise.all([
      persistence.setItem(LEVEL_KEY, String(d.level)),
      persistence.setItem(SCORE_KEY, String(d.score)),
      persistence.setItem(LIVES_KEY, String(d.lives)),
    ]);
  }

  async function clearProgress(): Promise<void> {
    await Promise.all([
      persistence.removeItem(LEVEL_KEY),
      persistence.removeItem(SCORE_KEY),
      persistence.removeItem(LIVES_KEY),
    ]);
  }

  game.onSaveNeeded = () => {
    saveProgress().catch(console.error);
  };

  // ─── Check for saved game ─────────────────────────────────────────────────
  const hasSave = savedLevel > 1 && savedScore >= 0 && savedLives > 0;

  if (hasSave) {
    const savedInfo = document.getElementById("saved-info");
    const savedProgress = document.getElementById("saved-progress");
    const startBtn = document.getElementById("startBtn");
    if (savedInfo) savedInfo.textContent = `Level ${savedLevel}/100 • Score ${savedScore.toLocaleString()} • ${savedLives} lives`;
    if (savedProgress) savedProgress.style.display = "block";
    if (startBtn) startBtn.style.display = "none";

    document.getElementById("newGameBtn")?.addEventListener("click", async () => {
      await clearProgress();
      hideAllScreens();
      game.startGame(1);
    });

    document.getElementById("continueBtn")?.addEventListener("click", async () => {
      hideAllScreens();
      // Restore state
      game.data.score = savedScore;
      game.data.lives = savedLives;
      game.data.highScore = highScore;
      game.startLevel(savedLevel);
      // startLevel calls startLoop via the game
      // We need to kickstart the loop manually since startLevel doesn't
      // Actually startLevel doesn't call startLoop — we fix that:
      (game as any).startLoop?.();
    });
  }

  showScreen("start-screen");

  // ─── Start button ─────────────────────────────────────────────────────────
  document.getElementById("startBtn")?.addEventListener("click", async () => {
    await clearProgress();
    hideAllScreens();
    game.startGame(1);
  });

  // ─── Restart ──────────────────────────────────────────────────────────────
  document.getElementById("restartBtn")?.addEventListener("click", async () => {
    await clearProgress();
    hideAllScreens();
    game.startGame(1);
  });

  // ─── Next level ───────────────────────────────────────────────────────────
  document.getElementById("nextLevelBtn")?.addEventListener("click", () => {
    hideAllScreens();
    const nextLevel = game.data.level + 1;
    game.startLevel(nextLevel);
    (game as any).startLoop?.();
  });

  // ─── Play again ───────────────────────────────────────────────────────────
  document.getElementById("playAgainBtn")?.addEventListener("click", async () => {
    await clearProgress();
    hideAllScreens();
    game.startGame(1);
  });

  // ─── Share buttons ────────────────────────────────────────────────────────
  document.getElementById("shareGameOverBtn")?.addEventListener("click", async () => {
    const d = game.data;
    await shareScore(d.score, d.highScore, d.level, false);
  });

  document.getElementById("shareWinBtn")?.addEventListener("click", async () => {
    const d = game.data;
    await shareScore(d.score, d.highScore, d.level, true);
  });

  // ─── Callbacks ────────────────────────────────────────────────────────────
  game.onGameOver = async (score: number, hs: number, level: number) => {
    if (hs > highScore) {
      highScore = hs;
      await persistence.setItem(HS_KEY, String(hs));
    }
    await clearProgress();
    (document.getElementById("finalScore") as HTMLElement).textContent = score.toLocaleString();
    (document.getElementById("finalLevel") as HTMLElement).textContent = String(level);
    (document.getElementById("finalHigh") as HTMLElement).textContent = highScore.toLocaleString();
    showScreen("game-over-screen");
  };

  game.onLevelClear = (score: number, level: number) => {
    (document.getElementById("levelScore") as HTMLElement).textContent = score.toLocaleString();
    (document.getElementById("nextLevelInfo") as HTMLElement).textContent = `Next: Level ${level + 1} / 100`;
    showScreen("level-complete-screen");
  };

  game.onWin = async (score: number) => {
    if (score > highScore) {
      highScore = score;
      await persistence.setItem(HS_KEY, String(score));
    }
    await clearProgress();
    (document.getElementById("winScore") as HTMLElement).textContent = score.toLocaleString();
    (document.getElementById("winHigh") as HTMLElement).textContent = highScore.toLocaleString();
    showScreen("win-screen");
  };
}

main();
