const command = "cat nikita_vostrosablin_cv.txt";
const typedCommand = document.getElementById("typed-command");
const themeToggle = document.getElementById("theme-toggle");
const exportPdfButton = document.getElementById("export-pdf");
const cursorSwarm = document.getElementById("cursor-swarm");
const codefield = document.getElementById("codefield");
const THEME_KEY = "cv-theme";

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

function setupFlashlightBackground() {
  if (!codefield) {
    return;
  }

  function randomByte() {
    return Math.floor(Math.random() * 256)
      .toString(2)
      .padStart(8, "0");
  }

  function buildCodefield() {
    const rowCount = Math.ceil(window.innerHeight / 16) + 8;
    const groupCount = Math.ceil(window.innerWidth / 88) + 6;
    const rows = [];

    for (let row = 0; row < rowCount; row += 1) {
      const offset = (row * groupCount * 4).toString(16).padStart(4, "0");
      const groups = [];

      for (let column = 0; column < groupCount; column += 1) {
        groups.push(randomByte());
      }

      rows.push(`${offset}  ${groups.join(" ")}`);
    }

    codefield.textContent = rows.join("\n");
  }

  buildCodefield();

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(buildCodefield, 120);
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  if (!window.matchMedia("(pointer: fine)").matches) {
    return;
  }

  document.documentElement.dataset.flashlight = "enabled";

  function updatePointer(x, y) {
    document.documentElement.style.setProperty("--pointer-x", `${x}px`);
    document.documentElement.style.setProperty("--pointer-y", `${y}px`);
  }

  updatePointer(window.innerWidth * 0.5, window.innerHeight * 0.32);

  window.addEventListener(
    "pointermove",
    (event) => {
      updatePointer(event.clientX, event.clientY);
    },
    { passive: true }
  );
}

function setupCursorSwarm() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  if (!window.matchMedia("(pointer: fine)").matches) {
    return null;
  }

  if (!cursorSwarm) {
    return null;
  }

  const ctx = cursorSwarm.getContext("2d");
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
  let accent = "#2f7d40";
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
    cursorSwarm.width = Math.floor(window.innerWidth * dpr);
    cursorSwarm.height = Math.floor(window.innerHeight * dpr);
    cursorSwarm.style.width = `${window.innerWidth}px`;
    cursorSwarm.style.height = `${window.innerHeight}px`;
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

    ctx.clearRect(0, 0, cursorSwarm.width, cursorSwarm.height);
    ctx.fillStyle = accent;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.x = snap(particle.x + particle.vx * (delta * 0.075));
      particle.y = snap(particle.y + particle.vy * (delta * 0.075));
      particle.life -= delta * 0.8;

      if (particle.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      const ratio = particle.life / particle.maxLife;
      const stepped = Math.ceil(ratio * 5) / 5;
      const flicker = Math.sin(timestamp * 0.04 + particle.flickerPhase) > 0 ? 1 : 0.55;
      ctx.globalAlpha = stepped * flicker * 0.9;
      ctx.font = `${particle.size}px "IBM Plex Mono", monospace`;
      ctx.fillText(particle.glyph, particle.x, particle.y);
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      if (document.documentElement.dataset.theme !== "light") {
        return;
      }

      const now = performance.now();
      if (now - lastSpawn < 12) {
        return;
      }
      lastSpawn = now;
      spawnCluster(event.clientX, event.clientY);
    },
    { passive: true }
  );

  window.addEventListener("resize", resize);

  document.documentElement.dataset.swarm = "enabled";
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

function setupPdfExport() {
  if (!exportPdfButton) {
    return;
  }

  exportPdfButton.addEventListener("click", () => {
    window.print();
  });
}

const refreshSwarmAccent = setupCursorSwarm();
setupFlashlightBackground();
setupPdfExport();
setupThemeToggle();
typeCommand(command, typedCommand);
revealSections();
