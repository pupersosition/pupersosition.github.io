const command = "cat nikita_vostrosablin_cv.txt";
const typedCommand = document.getElementById("typed-command");
const themeToggle = document.getElementById("theme-toggle");
const THEME_KEY = "cv-theme";
let refreshSwarmAccent = null;

function typeCommand(text, target) {
  let i = 0;
  const interval = setInterval(() => {
    if (!target) {
      clearInterval(interval);
      return;
    }

    target.textContent = text.slice(0, i + 1);
    i += 1;

    if (i >= text.length) {
      clearInterval(interval);
    }
  }, 42);
}

function revealSections() {
  const sections = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  sections.forEach((section, index) => {
    section.style.transitionDelay = `${index * 65}ms`;
    observer.observe(section);
  });
}

function setupCursorSwarm() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  if (!window.matchMedia("(pointer: fine)").matches) {
    return null;
  }

  const canvas = document.getElementById("cursor-swarm");
  if (!canvas) {
    return null;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  const particles = [];
  const GRID = 4;
  const GLYPHS = "01[]{}<>+-=*$#@%&!?";
  const DIRECTIONS = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1]
  ];
  let accent = "#b8ff76";
  let lastFrame = 0;
  let lastSpawn = 0;

  function snap(value) {
    return Math.round(value / GRID) * GRID;
  }

  function updateAccent() {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    accent = value || accent;
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnCluster(x, y) {
    const centerX = snap(x);
    const centerY = snap(y);
    const particleCount = 7 + Math.floor(Math.random() * 3);

    for (let i = 0; i < particleCount; i += 1) {
      const [dx, dy] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const speed = 0.35 + Math.random() * 0.55;
      const drift = (1 + Math.floor(Math.random() * 3)) * GRID;
      const lifetime = 260 + Math.random() * 460;
      particles.push({
        x: snap(centerX + dx * drift),
        y: snap(centerY + dy * drift),
        vx: dx * speed,
        vy: dy * speed,
        life: lifetime,
        maxLife: lifetime,
        glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        size: Math.random() < 0.25 ? 12 : 10,
        flickerPhase: Math.random() * Math.PI * 2
      });
    }
  }

  function animate(timestamp) {
    if (!lastFrame) {
      lastFrame = timestamp;
    }
    const delta = timestamp - lastFrame;
    lastFrame = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = accent;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.x = snap(p.x + p.vx * (delta * 0.075));
      p.y = snap(p.y + p.vy * (delta * 0.075));
      p.life -= delta * 0.8;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      const ratio = p.life / p.maxLife;
      const stepped = Math.ceil(ratio * 5) / 5;
      const flicker = Math.sin(timestamp * 0.04 + p.flickerPhase) > 0 ? 1 : 0.55;
      ctx.globalAlpha = stepped * flicker * 0.9;
      ctx.font = `${p.size}px "IBM Plex Mono", monospace`;
      ctx.fillText(p.glyph, p.x, p.y);
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  window.addEventListener("mousemove", (event) => {
    const now = performance.now();
    if (now - lastSpawn < 12) {
      return;
    }
    lastSpawn = now;
    spawnCluster(event.clientX, event.clientY);
  });

  window.addEventListener("resize", resize);

  resize();
  updateAccent();
  requestAnimationFrame(animate);

  return updateAccent;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeToggle) {
    const nextLabel = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
    themeToggle.setAttribute("aria-label", nextLabel);
    themeToggle.setAttribute("title", nextLabel);
  }
  if (refreshSwarmAccent) {
    refreshSwarmAccent();
  }
}

function setupThemeToggle() {
  const storedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");

  applyTheme(initialTheme);

  if (!themeToggle) {
    return;
  }

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

refreshSwarmAccent = setupCursorSwarm();
setupThemeToggle();
typeCommand(command, typedCommand);
revealSections();
