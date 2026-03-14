import { useEffect, useRef, useCallback, useState } from "react";

// Game constants
const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;
const PLAYER_BASE_WIDTH = 40;
const PLAYER_BASE_HEIGHT = 50;
const GAME_DURATION = 60;
const RANKING_KEY = "snowHarvestRanking_v1";

// Updated spawn rates: Santa & Rudolph more frequent than Snow
const SPAWN_RATES = {
  snow: 1.1,
  santa: 1.6,
  rudolph: 1.2,
  gift: 0.07,
};

// Scoring
const SCORES = {
  snow: 10,
  santa: -10,
  rudolph: -30,
};

interface GameObject {
  x: number;
  y: number;
  type: "snow" | "santa" | "rudolph" | "gift" | "rewardSnow";
  speed: number;
  radius: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  wobblePhase: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface RankingEntry {
  nickname: string;
  score: number;
  count: number;
  maxCombo: number;
  date: number;
}

type GameState = "START" | "PLAYING" | "GAMEOVER";

const SnowHarvestGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState>("START");
  const [gameState, setGameState] = useState<GameState>("START");
  const [showRanking, setShowRanking] = useState(false);
  const [nickname, setNickname] = useState("");
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalCount, setFinalCount] = useState(0);
  const [finalMaxCombo, setFinalMaxCombo] = useState(0);

  // Game state refs
  const playerRef = useRef({ x: CANVAS_WIDTH / 2, vx: 0, scale: 1.0 });
  const objectsRef = useRef<GameObject[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scoreRef = useRef(0);
  const countRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const lastSnowTimeRef = useRef(0);
  const timeLeftRef = useRef(GAME_DURATION);
  const growTimerRef = useRef(0);
  const shakeRef = useRef(0);
  const lastSpawnXRef = useRef(CANVAS_WIDTH / 2);

  // Input state
  const keysRef = useRef({ left: false, right: false });
  const touchRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });

  // Spawn timers
  const spawnTimersRef = useRef({
    snow: 0,
    santa: 0,
    rudolph: 0,
    gift: 0,
  });

  // Reward drops queue
  const rewardDropsRef = useRef<{ x: number; count: number; delay: number; timer: number }[]>([]);

  // Lerp helper
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const loadRankings = useCallback(() => {
    try {
      const saved = localStorage.getItem(RANKING_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRankings(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load rankings", e);
      setRankings([]);
    }
  }, []);

  const saveRanking = useCallback(() => {
    if (!nickname.trim()) return;

    const newEntry: RankingEntry = {
      nickname: nickname.trim().slice(0, 10),
      score: finalScore,
      count: finalCount,
      maxCombo: finalMaxCombo,
      date: Date.now(),
    };

    const updated = [...rankings, newEntry]
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.count !== a.count) return b.count - a.count;
        if (b.maxCombo !== a.maxCombo) return b.maxCombo - a.maxCombo;
        return b.date - a.date;
      })
      .slice(0, 10);

    try {
      localStorage.setItem(RANKING_KEY, JSON.stringify(updated));
      setRankings(updated);
      setNickname("");
    } catch (e) {
      console.error("Failed to save ranking", e);
    }
  }, [nickname, finalScore, finalCount, finalMaxCombo, rankings]);

  const resetGame = useCallback(() => {
    playerRef.current = { x: CANVAS_WIDTH / 2, vx: 0, scale: 1.0 };
    objectsRef.current = [];
    floatingTextsRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    countRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    lastSnowTimeRef.current = 0;
    timeLeftRef.current = GAME_DURATION;
    growTimerRef.current = 0;
    shakeRef.current = 0;
    spawnTimersRef.current = { snow: 0, santa: 0, rudolph: 0, gift: 0 };
    rewardDropsRef.current = [];
    lastSpawnXRef.current = CANVAS_WIDTH / 2;
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    gameStateRef.current = "PLAYING";
    setGameState("PLAYING");
  }, [resetGame]);

  const endGame = useCallback(() => {
    gameStateRef.current = "GAMEOVER";
    setGameState("GAMEOVER");
    setFinalScore(scoreRef.current);
    setFinalCount(countRef.current);
    setFinalMaxCombo(maxComboRef.current);
    loadRankings();
  }, [loadRankings]);

  const spawnParticles = useCallback((x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 100,
        vy: (Math.random() - 0.5) * 100,
        life: 0.5,
        color,
      });
    }
  }, []);

  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      x,
      y,
      text,
      color,
      life: 0.7,
      maxLife: 0.7,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let lastTime = performance.now();

    // Input handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keysRef.current.left = true;
      if (e.key === "ArrowRight") keysRef.current.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") keysRef.current.left = false;
      if (e.key === "ArrowRight") keysRef.current.right = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        if (x < rect.width / 2) {
          touchRef.current.left = true;
        } else {
          touchRef.current.right = true;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      touchRef.current.left = false;
      touchRef.current.right = false;
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        if (x < rect.width / 2) {
          touchRef.current.left = true;
        } else {
          touchRef.current.right = true;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });

    const getCurrentSpeed = () => {
      const elapsed = GAME_DURATION - timeLeftRef.current;
      const progress = elapsed / GAME_DURATION;
      return 140 + progress * 120;
    };

    const getSpawnX = () => {
      const margin = 30;
      let x: number;
      let attempts = 0;
      do {
        x = margin + Math.random() * (CANVAS_WIDTH - margin * 2);
        attempts++;
      } while (Math.abs(x - lastSpawnXRef.current) < 18 && attempts < 10);
      lastSpawnXRef.current = x;
      return x;
    };

    const spawnObject = (type: GameObject["type"], x?: number) => {
      const speed = getCurrentSpeed();
      let radius = 15;
      let objSpeed = speed;

      if (type === "santa") {
        radius = 25;
        objSpeed = speed * 0.9;
      } else if (type === "rudolph") {
        radius = 30;
        objSpeed = speed * 1.1;
      } else if (type === "gift") {
        radius = 20;
      } else if (type === "rewardSnow") {
        radius = 15;
      }

      const spawnX = x !== undefined ? x + (Math.random() - 0.5) * 20 : getSpawnX();

      objectsRef.current.push({
        x: spawnX,
        y: -radius,
        type,
        speed: objSpeed,
        radius,
        wobbleOffset: (Math.random() - 0.5) * 3,
        wobbleSpeed: 2 + Math.random() * 2,
        wobblePhase: Math.random() * Math.PI * 2,
      });
    };

    const checkCollision = (obj: GameObject, playerX: number, playerY: number, playerScale: number) => {
      const playerCenterX = playerX;
      const playerCenterY = playerY;
      const playerRadius = (PLAYER_BASE_WIDTH / 2) * playerScale;

      const dx = obj.x - playerCenterX;
      const dy = obj.y - playerCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance < obj.radius + playerRadius;
    };

    const getComboBonus = (combo: number) => {
      return Math.min(10, Math.floor(combo / 3) * 2);
    };

    const update = (dt: number, now: number) => {
      if (gameStateRef.current !== "PLAYING") return;

      // Update timer
      timeLeftRef.current -= dt;
      if (timeLeftRef.current <= 0) {
        timeLeftRef.current = 0;
        endGame();
        return;
      }

      // Update grow effect
      const player = playerRef.current;
      if (growTimerRef.current > 0) {
        growTimerRef.current -= dt;
        player.scale = lerp(player.scale, 1.45, 0.2 * dt * 10);
        if (growTimerRef.current <= 0) {
          growTimerRef.current = 0;
        }
      } else {
        player.scale = lerp(player.scale, 1.0, 0.2 * dt * 10);
      }

      // Update shake
      if (shakeRef.current > 0) {
        shakeRef.current -= dt * 10;
        if (shakeRef.current < 0) shakeRef.current = 0;
      }

      // Update combo timer
      if (comboRef.current > 0 && now - lastSnowTimeRef.current > 1200) {
        comboRef.current = 0;
      }

      // Player movement
      const accel = 800;
      const maxSpeed = 300;
      const friction = 600;

      let moving = false;
      if (keysRef.current.left || touchRef.current.left) {
        player.vx -= accel * dt;
        moving = true;
      }
      if (keysRef.current.right || touchRef.current.right) {
        player.vx += accel * dt;
        moving = true;
      }

      if (!moving) {
        if (player.vx > 0) {
          player.vx = Math.max(0, player.vx - friction * dt);
        } else {
          player.vx = Math.min(0, player.vx + friction * dt);
        }
      }

      player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));
      player.x += player.vx * dt;
      player.x = Math.max(PLAYER_BASE_WIDTH / 2, Math.min(CANVAS_WIDTH - PLAYER_BASE_WIDTH / 2, player.x));

      const playerY = CANVAS_HEIGHT - 80;

      // Spawn objects
      const spawnMultiplier = 1 + (GAME_DURATION - timeLeftRef.current) / GAME_DURATION * 0.3;
      
      spawnTimersRef.current.snow += dt;
      spawnTimersRef.current.santa += dt;
      spawnTimersRef.current.rudolph += dt;
      spawnTimersRef.current.gift += dt;

      if (spawnTimersRef.current.snow > 1 / (SPAWN_RATES.snow * spawnMultiplier)) {
        spawnTimersRef.current.snow = 0;
        spawnObject("snow");
      }
      if (spawnTimersRef.current.santa > 1 / (SPAWN_RATES.santa * spawnMultiplier)) {
        spawnTimersRef.current.santa = 0;
        spawnObject("santa");
      }
      if (spawnTimersRef.current.rudolph > 1 / (SPAWN_RATES.rudolph * spawnMultiplier)) {
        spawnTimersRef.current.rudolph = 0;
        spawnObject("rudolph");
      }
      if (spawnTimersRef.current.gift > 1 / SPAWN_RATES.gift) {
        spawnTimersRef.current.gift = 0;
        spawnObject("gift");
      }

      // Process reward drops
      for (let i = rewardDropsRef.current.length - 1; i >= 0; i--) {
        const drop = rewardDropsRef.current[i];
        drop.timer += dt;
        if (drop.timer >= drop.delay && drop.count > 0) {
          spawnObject("rewardSnow", drop.x);
          drop.count--;
          drop.timer = 0;
        }
        if (drop.count <= 0) {
          rewardDropsRef.current.splice(i, 1);
        }
      }

      // Update objects
      for (let i = objectsRef.current.length - 1; i >= 0; i--) {
        const obj = objectsRef.current[i];
        
        // Add horizontal wobble
        obj.wobblePhase += obj.wobbleSpeed * dt;
        obj.x += Math.sin(obj.wobblePhase) * obj.wobbleOffset * dt * 10;

        obj.y += obj.speed * dt;

        // Check collision
        if (checkCollision(obj, player.x, playerY, player.scale)) {
          if (obj.type === "snow" || obj.type === "rewardSnow") {
            const bonus = getComboBonus(comboRef.current);
            const points = SCORES.snow + bonus;
            scoreRef.current += points;
            countRef.current++;
            comboRef.current++;
            maxComboRef.current = Math.max(maxComboRef.current, comboRef.current);
            lastSnowTimeRef.current = now;
            addFloatingText(obj.x, obj.y, `+${points}`, "#22c55e");
            spawnParticles(obj.x, obj.y, "#a5f3fc", 5);
          } else if (obj.type === "santa") {
            scoreRef.current += SCORES.santa;
            comboRef.current = 0;
            shakeRef.current = 3;
            addFloatingText(obj.x, obj.y, `${SCORES.santa}`, "#ef4444");
          } else if (obj.type === "rudolph") {
            scoreRef.current += SCORES.rudolph;
            comboRef.current = 0;
            shakeRef.current = 5;
            addFloatingText(obj.x, obj.y, `${SCORES.rudolph}`, "#ef4444");
          } else if (obj.type === "gift") {
            // GROW effect for 3 seconds
            growTimerRef.current = 3.0;
            spawnParticles(obj.x, obj.y, "#fbbf24", 10);
            addFloatingText(obj.x, obj.y, "GROW!", "#fbbf24");
          }
          objectsRef.current.splice(i, 1);
          continue;
        }

        // Check if exited bottom
        if (obj.y > CANVAS_HEIGHT + obj.radius) {
          if (obj.type === "santa") {
            rewardDropsRef.current.push({ x: obj.x, count: 3, delay: 0.12, timer: 0 });
          } else if (obj.type === "rudolph") {
            rewardDropsRef.current.push({ x: obj.x, count: 5, delay: 0.1, timer: 0 });
          }
          objectsRef.current.splice(i, 1);
        }
      }

      // Update floating texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const text = floatingTextsRef.current[i];
        text.life -= dt;
        text.y -= 30 * dt;
        if (text.life <= 0) {
          floatingTextsRef.current.splice(i, 1);
        }
      }

      // Update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }
    };

    const drawSnowflake = (x: number, y: number, size: number, isReward: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = isReward ? "#67e8f9" : "#ffffff";
      ctx.strokeStyle = isReward ? "#22d3ee" : "#a5f3fc";
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -size);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.5);
        ctx.lineTo(-size * 0.3, -size * 0.7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.5);
        ctx.lineTo(size * 0.3, -size * 0.7);
        ctx.stroke();
      }
      
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Cute chibi Santa
    const drawSanta = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      
      // Big chibi head
      ctx.fillStyle = "#fcd5b8";
      ctx.beginPath();
      ctx.arc(0, -size * 0.2, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Rosy cheeks
      ctx.fillStyle = "#ffb3b3";
      ctx.beginPath();
      ctx.arc(-size * 0.25, -size * 0.05, size * 0.12, 0, Math.PI * 2);
      ctx.arc(size * 0.25, -size * 0.05, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      
      // Small body
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.ellipse(0, size * 0.35, size * 0.35, size * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Belt
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(-size * 0.35, size * 0.25, size * 0.7, size * 0.12);
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(-size * 0.08, size * 0.23, size * 0.16, size * 0.16);
      
      // Hat
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.moveTo(-size * 0.4, -size * 0.5);
      ctx.quadraticCurveTo(0, -size * 1.1, size * 0.4, -size * 0.5);
      ctx.closePath();
      ctx.fill();
      
      // Hat trim
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.5, size * 0.45, size * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Hat pom
      ctx.beginPath();
      ctx.arc(size * 0.25, -size * 0.85, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      
      // Big cute eyes
      ctx.fillStyle = "#1f2937";
      ctx.beginPath();
      ctx.arc(-size * 0.15, -size * 0.25, size * 0.1, 0, Math.PI * 2);
      ctx.arc(size * 0.15, -size * 0.25, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye shines
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-size * 0.12, -size * 0.28, size * 0.04, 0, Math.PI * 2);
      ctx.arc(size * 0.18, -size * 0.28, size * 0.04, 0, Math.PI * 2);
      ctx.fill();
      
      // Big smile
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -size * 0.08, size * 0.18, 0.2, Math.PI - 0.2);
      ctx.stroke();
      
      // Tiny arms/hands raised
      ctx.fillStyle = "#fcd5b8";
      ctx.beginPath();
      ctx.arc(-size * 0.45, size * 0.2, size * 0.1, 0, Math.PI * 2);
      ctx.arc(size * 0.45, size * 0.2, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    // Cute chibi Rudolph
    const drawRudolph = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      
      // Big chibi head
      ctx.fillStyle = "#a16207";
      ctx.beginPath();
      ctx.arc(0, -size * 0.15, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
      
      // Fluffy ears
      ctx.fillStyle = "#92400e";
      ctx.beginPath();
      ctx.ellipse(-size * 0.4, -size * 0.35, size * 0.12, size * 0.18, -0.4, 0, Math.PI * 2);
      ctx.ellipse(size * 0.4, -size * 0.35, size * 0.12, size * 0.18, 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner ear
      ctx.fillStyle = "#fcd5b8";
      ctx.beginPath();
      ctx.ellipse(-size * 0.4, -size * 0.35, size * 0.06, size * 0.1, -0.4, 0, Math.PI * 2);
      ctx.ellipse(size * 0.4, -size * 0.35, size * 0.06, size * 0.1, 0.4, 0, Math.PI * 2);
      ctx.fill();
      
      // Antlers
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-size * 0.25, -size * 0.5);
      ctx.lineTo(-size * 0.35, -size * 0.8);
      ctx.lineTo(-size * 0.45, -size * 0.7);
      ctx.moveTo(-size * 0.35, -size * 0.8);
      ctx.lineTo(-size * 0.25, -size * 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(size * 0.25, -size * 0.5);
      ctx.lineTo(size * 0.35, -size * 0.8);
      ctx.lineTo(size * 0.45, -size * 0.7);
      ctx.moveTo(size * 0.35, -size * 0.8);
      ctx.lineTo(size * 0.25, -size * 0.9);
      ctx.stroke();
      
      // Small body
      ctx.fillStyle = "#92400e";
      ctx.beginPath();
      ctx.ellipse(0, size * 0.35, size * 0.3, size * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Belly
      ctx.fillStyle = "#d4a574";
      ctx.beginPath();
      ctx.ellipse(0, size * 0.38, size * 0.18, size * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Big cute eyes
      ctx.fillStyle = "#1f2937";
      ctx.beginPath();
      ctx.arc(-size * 0.15, -size * 0.2, size * 0.1, 0, Math.PI * 2);
      ctx.arc(size * 0.15, -size * 0.2, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye shines
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-size * 0.12, -size * 0.23, size * 0.04, 0, Math.PI * 2);
      ctx.arc(size * 0.18, -size * 0.23, size * 0.04, 0, Math.PI * 2);
      ctx.fill();
      
      // Big red nose
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(0, -size * 0.02, size * 0.14, 0, Math.PI * 2);
      ctx.fill();
      
      // Nose shine
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.arc(-size * 0.04, -size * 0.06, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
      
      // Cute smile
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, size * 0.05, size * 0.12, 0.3, Math.PI - 0.3);
      ctx.stroke();
      
      // Tiny hooves
      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      ctx.arc(-size * 0.35, size * 0.55, size * 0.08, 0, Math.PI * 2);
      ctx.arc(size * 0.35, size * 0.55, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const drawGift = (x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      
      // Box
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(-size * 0.5, -size * 0.3, size, size * 0.8);
      
      // Ribbon vertical
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(-size * 0.1, -size * 0.3, size * 0.2, size * 0.8);
      
      // Ribbon horizontal
      ctx.fillRect(-size * 0.5, 0, size, size * 0.15);
      
      // Bow
      ctx.beginPath();
      ctx.ellipse(-size * 0.2, -size * 0.35, size * 0.15, size * 0.1, -0.3, 0, Math.PI * 2);
      ctx.ellipse(size * 0.2, -size * 0.35, size * 0.15, size * 0.1, 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(0, -size * 0.3, size * 0.08, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    // Gingerbread man holding gift bundle
    const drawPlayer = (x: number, y: number, scale: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      
      const w = PLAYER_BASE_WIDTH;
      const h = PLAYER_BASE_HEIGHT;
      
      // Body (brown gingerbread)
      ctx.fillStyle = "#a0522d";
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.4, h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Head
      ctx.beginPath();
      ctx.arc(0, -h * 0.45, w * 0.35, 0, Math.PI * 2);
      ctx.fill();
      
      // Arms
      ctx.fillStyle = "#a0522d";
      ctx.beginPath();
      ctx.ellipse(-w * 0.55, -h * 0.05, w * 0.2, h * 0.12, -0.3, 0, Math.PI * 2);
      ctx.ellipse(w * 0.55, -h * 0.05, w * 0.2, h * 0.12, 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Legs
      ctx.beginPath();
      ctx.ellipse(-w * 0.25, h * 0.45, w * 0.15, h * 0.2, -0.1, 0, Math.PI * 2);
      ctx.ellipse(w * 0.25, h * 0.45, w * 0.15, h * 0.2, 0.1, 0, Math.PI * 2);
      ctx.fill();
      
      // Icing outline
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      
      // Body icing
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.35, h * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      
      // Head icing
      ctx.beginPath();
      ctx.arc(0, -h * 0.45, w * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.setLineDash([]);
      
      // Button dots (icing)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(0, -h * 0.1, 3, 0, Math.PI * 2);
      ctx.arc(0, h * 0.08, 3, 0, Math.PI * 2);
      ctx.arc(0, h * 0.26, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Eyes
      ctx.fillStyle = "#1f2937";
      ctx.beginPath();
      ctx.arc(-w * 0.12, -h * 0.48, 3, 0, Math.PI * 2);
      ctx.arc(w * 0.12, -h * 0.48, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Big smile
      ctx.strokeStyle = "#dc2626";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -h * 0.38, w * 0.15, 0.3, Math.PI - 0.3);
      ctx.stroke();
      
      // Gift bundle (held on right side)
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(w * 0.6, -h * 0.15, w * 0.25, 0, Math.PI * 2);
      ctx.fill();
      
      // Bundle tie
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(w * 0.5, -h * 0.35, w * 0.2, h * 0.08);
      
      // Bundle top knot
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(w * 0.6, -h * 0.38, w * 0.08, 0, Math.PI * 2);
      ctx.fill();
      
      // Bundle dots
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(w * 0.5, -h * 0.12, 2, 0, Math.PI * 2);
      ctx.arc(w * 0.7, -h * 0.1, 2, 0, Math.PI * 2);
      ctx.arc(w * 0.55, -h * 0.22, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    };

    const render = () => {
      // Clear with shake offset
      const shakeX = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current * 2 : 0;
      const shakeY = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current * 2 : 0;
      
      ctx.save();
      ctx.translate(shakeX, shakeY);
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, "#1e3a5f");
      gradient.addColorStop(1, "#0f172a");
      ctx.fillStyle = gradient;
      ctx.fillRect(-10, -10, CANVAS_WIDTH + 20, CANVAS_HEIGHT + 20);
      
      // Background snow particles (decorative)
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      for (let i = 0; i < 30; i++) {
        const x = (i * 47 + performance.now() * 0.01) % CANVAS_WIDTH;
        const y = (i * 31 + performance.now() * 0.02) % CANVAS_HEIGHT;
        ctx.beginPath();
        ctx.arc(x, y, 1 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
      
      if (gameStateRef.current === "PLAYING") {
        // Draw objects
        for (const obj of objectsRef.current) {
          if (obj.type === "snow") {
            drawSnowflake(obj.x, obj.y, obj.radius, false);
          } else if (obj.type === "rewardSnow") {
            drawSnowflake(obj.x, obj.y, obj.radius, true);
          } else if (obj.type === "santa") {
            drawSanta(obj.x, obj.y, obj.radius);
          } else if (obj.type === "rudolph") {
            drawRudolph(obj.x, obj.y, obj.radius);
          } else if (obj.type === "gift") {
            drawGift(obj.x, obj.y, obj.radius);
          }
        }
        
        // Draw player
        drawPlayer(playerRef.current.x, CANVAS_HEIGHT - 80, playerRef.current.scale);
        
        // Draw particles
        for (const p of particlesRef.current) {
          ctx.globalAlpha = p.life * 2;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Draw floating texts
        for (const text of floatingTextsRef.current) {
          ctx.globalAlpha = text.life / text.maxLife;
          ctx.fillStyle = text.color;
          ctx.font = "bold 18px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(text.text, text.x, text.y);
        }
        ctx.globalAlpha = 1;
        
        // HUD
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px sans-serif";
        
        // Top left
        ctx.textAlign = "left";
        ctx.fillText(`⏱ ${Math.ceil(timeLeftRef.current)}s`, 10, 25);
        ctx.fillText(`🔥 Combo: ${comboRef.current}`, 10, 45);
        ctx.fillText(`❄️ Count: ${countRef.current}`, 10, 65);
        
        // Top right
        ctx.textAlign = "right";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText(`Score: ${scoreRef.current}`, CANVAS_WIDTH - 10, 25);
        
        // GROW indicator
        if (growTimerRef.current > 0) {
          ctx.textAlign = "center";
          ctx.fillStyle = "#fbbf24";
          ctx.font = "bold 14px sans-serif";
          ctx.fillText(`🎁 GROW ${growTimerRef.current.toFixed(1)}s`, CANVAS_WIDTH / 2, 25);
        }
        
        // Mobile controls hint
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "12px sans-serif";
        ctx.fillText("← Tap left/right to move →", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
      }
      
      ctx.restore();
    };

    const gameLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      update(dt, time);
      render();

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [endGame, addFloatingText, spawnParticles]);

  useEffect(() => {
    loadRankings();
  }, [loadRankings]);

  return (
    <section id="snow-harvest" className="py-16 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            🎮 Snow Harvest
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Collect snowflakes, dodge Santa & Rudolph, and harvest bonus snow!
          </p>
        </div>

        <div 
          ref={containerRef}
          className="relative flex justify-center"
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="rounded-xl shadow-2xl border-2 border-primary/20 max-w-full touch-none"
            style={{ maxHeight: "80vh" }}
          />

          {/* Start Screen Overlay */}
          {gameState === "START" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
              <div className="text-center p-6 max-w-xs">
                <h3 className="font-display text-3xl text-foreground mb-4">
                  ❄️ Snow Harvest ❄️
                </h3>
                <p className="text-muted-foreground mb-2 text-sm">
                  Gingerbread Edition
                </p>
                <div className="text-left text-sm text-muted-foreground mb-6 space-y-1">
                  <p>❄️ Collect snowflakes (+10 pts)</p>
                  <p>🎅 Avoid Santa (-10 pts)</p>
                  <p>🦌 Avoid Rudolph (-30 pts)</p>
                  <p>🎁 Grab gifts to GROW!</p>
                  <p className="text-primary">💡 Let them pass for bonus snow!</p>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  ⌨️ Arrow keys or 👆 tap left/right
                </p>
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-primary text-primary-foreground font-display text-lg rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
                >
                  START GAME
                </button>
              </div>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === "GAMEOVER" && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-xl overflow-y-auto">
              <div className="text-center p-4 max-w-xs w-full">
                <h3 className="font-display text-2xl text-foreground mb-4">
                  🎄 Game Over! 🎄
                </h3>
                
                <div className="bg-card rounded-lg p-4 mb-4 text-left">
                  <p className="text-foreground">Score: <span className="font-bold text-primary">{finalScore}</span></p>
                  <p className="text-foreground">Snowflakes: <span className="font-bold">{finalCount}</span></p>
                  <p className="text-foreground">Max Combo: <span className="font-bold text-orange-400">{finalMaxCombo}</span></p>
                </div>

                {/* Save Score */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Your name (max 10)"
                    maxLength={10}
                    className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm mb-2"
                  />
                  <button
                    onClick={saveRanking}
                    disabled={!nickname.trim()}
                    className="w-full px-4 py-2 bg-secondary text-secondary-foreground font-display rounded hover:bg-secondary/80 transition-colors disabled:opacity-50 text-sm"
                  >
                    Save my record
                  </button>
                </div>

                {/* Rankings */}
                <button
                  onClick={() => setShowRanking(!showRanking)}
                  className="text-sm text-primary underline mb-2"
                >
                  {showRanking ? "Hide" : "Show"} Top 10
                </button>

                {showRanking && (
                  <div className="bg-card rounded-lg p-2 mb-4 max-h-40 overflow-y-auto text-xs">
                    {rankings.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-left">#</th>
                            <th className="text-left">Name</th>
                            <th className="text-right">Score</th>
                            <th className="text-right">Combo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rankings.map((entry, i) => (
                            <tr key={i} className="text-foreground">
                              <td>{i + 1}</td>
                              <td>{entry.nickname}</td>
                              <td className="text-right">{entry.score}</td>
                              <td className="text-right">{entry.maxCombo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-muted-foreground text-center py-2">No records yet!</p>
                    )}
                  </div>
                )}

                <button
                  onClick={startGame}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground font-display rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SnowHarvestGame;
