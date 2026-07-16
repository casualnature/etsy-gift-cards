const cardData = {
  coupleNames: "Man&Lady",
  headline: "Congratulations on Your Wedding",
  message: "May your journey together be filled with love, laughter, and happiness.",
  sender: "Love"
};

const scenes = [
  "assets/scene-0-cover.png",
  "assets/scene-1-door-open.png",
  "assets/scene-2-rings.png",
  "assets/scene-3-bouquet-start.png",
  "assets/scene-4-bouquet-large.png",
  "assets/scene-5-final.png"
];

const card = document.getElementById("card");
const sceneA = document.getElementById("sceneA");
const sceneB = document.getElementById("sceneB");
const coverCopy = document.getElementById("coverCopy");
const finalMessage = document.getElementById("finalMessage");
const finalHeadline = document.getElementById("finalHeadline");
const finalCouple = document.getElementById("finalCouple");
const finalText = document.getElementById("finalText");
const finalSender = document.getElementById("finalSender");
const music = document.getElementById("cardMusic");
const musicToggle = document.getElementById("musicToggle");
const softGlow = document.getElementById("softGlow");
const sparkleLayer = document.getElementById("sparkleLayer");
const petalLayer = document.getElementById("petalLayer");
const celebrationOverlay = document.getElementById("celebrationOverlay");
const finalTapHint = document.getElementById("finalTapHint");
const replayButton = document.getElementById("replayButton");

let currentScene = 0;
let activeImage = sceneA;
let standbyImage = sceneB;
let musicRequested = false;
let finalLoopStarted = false;
let finalPetalTimer = 0;
let celebrationActive = false;
let celebrationFrame = 0;
let replayTimer = 0;

function preloadScenes() {
  scenes.forEach((src) => {
    const image = new Image();
    image.src = src;
  });
}

function applyCardData() {
  finalHeadline.textContent = cardData.headline;
  finalCouple.textContent = cardData.coupleNames;
  finalText.textContent = cardData.message;
  finalSender.textContent = cardData.sender;
}

function setMusicState(isOn) {
  musicToggle.classList.toggle("is-off", !isOn);
  musicToggle.classList.toggle("is-on", isOn);
  musicToggle.setAttribute("aria-pressed", String(isOn));
  musicToggle.setAttribute("aria-label", isOn ? "Turn music off" : "Turn music on");
  musicToggle.textContent = isOn ? "Music ON" : "Music OFF";
}

function playMusic() {
  if (!music) return;
  musicRequested = true;
  music.volume = 0.72;

  const playAttempt = music.play();
  if (playAttempt && typeof playAttempt.then === "function") {
    playAttempt
      .then(() => setMusicState(true))
      .catch(() => setMusicState(false));
  } else {
    setMusicState(true);
  }
}

function toggleMusic(event) {
  event.stopPropagation();
  if (!music) return;

  if (music.paused) {
    playMusic();
  } else {
    music.pause();
    setMusicState(false);
  }
}

function crossfadeTo(sceneIndex) {
  standbyImage.src = scenes[sceneIndex];
  standbyImage.classList.add("is-active");
  activeImage.classList.remove("is-active");
  [activeImage, standbyImage] = [standbyImage, activeImage];
}

function bloomGlow() {
  softGlow.classList.remove("bloom");
  void softGlow.offsetWidth;
  softGlow.classList.add("bloom");
}

function createSparkles(count) {
  const rect = card.getBoundingClientRect();
  const centerX = rect.width * 0.5;
  const centerY = rect.height * (currentScene === 2 ? 0.5 : 0.44);

  for (let i = 0; i < count; i += 1) {
    const sparkle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 120;
    const size = 3 + Math.random() * 5;

    sparkle.className = "sparkle";
    sparkle.style.left = `${centerX + (Math.random() - 0.5) * 64}px`;
    sparkle.style.top = `${centerY + (Math.random() - 0.5) * 72}px`;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    sparkle.style.setProperty("--dy", `${Math.sin(angle) * distance - 24}px`);
    sparkle.style.setProperty("--dur", `${980 + Math.random() * 560}ms`);
    sparkleLayer.appendChild(sparkle);
    sparkle.addEventListener("animationend", () => sparkle.remove(), { once: true });
  }
}

function createPetals(count, mode = "rise") {
  const rect = card.getBoundingClientRect();

  for (let i = 0; i < count; i += 1) {
    const petal = document.createElement("span");
    const startX = mode === "final" ? Math.random() * rect.width : rect.width * (0.24 + Math.random() * 0.52);
    const startY = mode === "final" ? rect.height * (0.72 + Math.random() * 0.25) : rect.height * (0.48 + Math.random() * 0.24);
    const driftX = (Math.random() - 0.5) * (mode === "final" ? 250 : 150);
    const driftY = -(rect.height * (mode === "final" ? 0.48 + Math.random() * 0.34 : 0.22 + Math.random() * 0.18));

    petal.className = "petal";
    petal.style.left = `${startX}px`;
    petal.style.top = `${startY}px`;
    petal.style.setProperty("--w", `${7 + Math.random() * (mode === "final" ? 8 : 6)}px`);
    petal.style.setProperty("--dx", `${driftX}px`);
    petal.style.setProperty("--dy", `${driftY}px`);
    petal.style.setProperty("--rot", `${Math.random() * 180}deg`);
    petal.style.setProperty("--spin", `${160 + Math.random() * 260}deg`);
    petal.style.setProperty("--alpha", `${0.45 + Math.random() * 0.32}`);
    petal.style.setProperty("--dur", `${mode === "final" ? 4800 + Math.random() * 2600 : 2600 + Math.random() * 1500}ms`);
    petal.style.animationDelay = `${Math.random() * (mode === "final" ? 900 : 180)}ms`;
    petalLayer.appendChild(petal);
    petal.addEventListener("animationend", () => petal.remove(), { once: true });
  }
}

function runSceneEffect(sceneIndex) {
  bloomGlow();

  if (sceneIndex === 1) {
    createPetals(9);
    createSparkles(5);
  }

  if (sceneIndex === 2) {
    createSparkles(18);
    createPetals(7);
  }

  if (sceneIndex === 3) {
    createSparkles(16);
    createPetals(14);
  }

  if (sceneIndex === 4) {
    createSparkles(18);
    createPetals(18);
  }

  if (sceneIndex === 5) {
    createSparkles(22);
    createPetals(30, "final");
    startFinalPetals();
  }
}

function showFinalMessage() {
  finalMessage.setAttribute("aria-hidden", "false");
  window.setTimeout(() => {
    finalMessage.classList.add("is-visible");
  }, 500);
  showFinalTapHint();
}

function startFinalPetals() {
  if (finalLoopStarted) return;
  finalLoopStarted = true;
  finalPetalTimer = window.setInterval(() => {
    if (document.hidden) return;
    createPetals(7, "final");
  }, 1450);
}

function showFinalTapHint() {
  finalTapHint.setAttribute("aria-hidden", "false");
  window.setTimeout(() => {
    if (!celebrationActive && currentScene === scenes.length - 1) {
      finalTapHint.classList.add("is-visible");
      finalTapHint.classList.remove("is-hidden");
    }
  }, 1100);
}

function hideFinalTapHint() {
  finalTapHint.classList.remove("is-visible");
  finalTapHint.classList.add("is-hidden");
  finalTapHint.setAttribute("aria-hidden", "true");
}

function showReplayButton() {
  replayButton.classList.add("is-visible");
}

function hideReplayButton() {
  replayButton.classList.remove("is-visible");
}

function clearCelebrationParticles() {
  if (celebrationFrame) {
    window.cancelAnimationFrame(celebrationFrame);
    celebrationFrame = 0;
  }

  if (replayTimer) {
    window.clearTimeout(replayTimer);
    replayTimer = 0;
  }

  celebrationOverlay.replaceChildren();
}

function createCelebrationParticle(type, side, rect) {
  const particle = document.createElement("span");
  particle.className = `celebration-particle ${type}`;

  const fromLeft = side === "left";
  const sizeMap = {
    rice: 3.2 + Math.random() * 3.6,
    "celebration-petal": 7 + Math.random() * 9,
    "celebration-spark": 3 + Math.random() * 4.5
  };
  const lifeMap = {
    rice: 2600 + Math.random() * 1000,
    "celebration-petal": 3100 + Math.random() * 900,
    "celebration-spark": 1800 + Math.random() * 900
  };

  const startY = rect.height * (0.56 + Math.random() * 0.26);
  const startX = fromLeft ? -18 - Math.random() * 24 : rect.width + 18 + Math.random() * 24;
  const reach = rect.width * (0.42 + Math.random() * 0.24);
  const vx = (fromLeft ? 1 : -1) * (reach / 1.45 + Math.random() * 72);
  const vy = -(rect.height * (0.25 + Math.random() * 0.28));
  const gravity = rect.height * (0.42 + Math.random() * 0.22);

  particle.style.setProperty("--size", `${sizeMap[type]}px`);
  celebrationOverlay.appendChild(particle);

  return {
    el: particle,
    x: startX,
    y: startY,
    vx,
    vy,
    gravity,
    life: lifeMap[type],
    delay: Math.random() * 420,
    rotation: Math.random() * 180,
    spin: (fromLeft ? 1 : -1) * (80 + Math.random() * 220),
    sway: type === "celebration-petal" ? 16 + Math.random() * 24 : 2 + Math.random() * 6,
    phase: Math.random() * Math.PI * 2,
    opacity: type === "rice" ? 0.78 : 0.62 + Math.random() * 0.22,
    remove: false
  };
}

function playCelebration() {
  if (celebrationActive || currentScene !== scenes.length - 1) return;

  celebrationActive = true;
  hideFinalTapHint();
  hideReplayButton();
  clearCelebrationParticles();
  bloomGlow();

  const rect = card.getBoundingClientRect();
  const particles = [];

  for (let i = 0; i < 74; i += 1) {
    particles.push(createCelebrationParticle("rice", i % 2 === 0 ? "left" : "right", rect));
  }

  for (let i = 0; i < 18; i += 1) {
    particles.push(createCelebrationParticle("celebration-petal", i % 2 === 0 ? "left" : "right", rect));
  }

  for (let i = 0; i < 14; i += 1) {
    particles.push(createCelebrationParticle("celebration-spark", i % 2 === 0 ? "left" : "right", rect));
  }

  const startedAt = performance.now();

  function animateCelebration(now) {
    let hasLiveParticle = false;

    particles.forEach((particle) => {
      const age = now - startedAt - particle.delay;
      if (age < 0 || particle.remove) {
        hasLiveParticle = hasLiveParticle || age < particle.life;
        return;
      }

      const progress = Math.min(age / particle.life, 1);
      const seconds = age / 1000;
      const x = particle.x + particle.vx * seconds + Math.sin(progress * Math.PI * 2 + particle.phase) * particle.sway;
      const y = particle.y + particle.vy * seconds + 0.5 * particle.gravity * seconds * seconds;
      const fadeIn = Math.min(progress / 0.14, 1);
      const fadeOut = Math.max((1 - progress) / 0.28, 0);
      const opacity = particle.opacity * Math.min(fadeIn, fadeOut);
      const rotate = particle.rotation + particle.spin * progress;
      const scale = 0.86 + progress * 0.28;

      particle.el.style.opacity = opacity.toFixed(3);
      particle.el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;

      if (progress >= 1) {
        particle.remove = true;
        particle.el.remove();
      } else {
        hasLiveParticle = true;
      }
    });

    if (hasLiveParticle) {
      celebrationFrame = window.requestAnimationFrame(animateCelebration);
    } else {
      celebrationFrame = 0;
    }
  }

  celebrationFrame = window.requestAnimationFrame(animateCelebration);
  replayTimer = window.setTimeout(() => {
    celebrationActive = false;
    showReplayButton();
    showFinalTapHint();
  }, 3600);
}

function resetCard(event) {
  event.stopPropagation();
  hideReplayButton();
  hideFinalTapHint();
  clearCelebrationParticles();

  if (finalPetalTimer) {
    window.clearInterval(finalPetalTimer);
    finalPetalTimer = 0;
  }

  celebrationActive = false;
  finalLoopStarted = false;
  currentScene = 0;
  sceneA.src = scenes[0];
  sceneB.src = scenes[0];
  sceneA.classList.add("is-active");
  sceneB.classList.remove("is-active");
  activeImage = sceneA;
  standbyImage = sceneB;
  coverCopy.classList.remove("is-hidden");
  finalMessage.classList.remove("is-visible");
  finalMessage.setAttribute("aria-hidden", "true");

  if (musicRequested && !music.paused) {
    music.currentTime = 0;
    playMusic();
  }
}

function nextScene() {
  if (currentScene >= scenes.length - 1) {
    playCelebration();
    return;
  }

  if (!musicRequested) {
    playMusic();
  }

  currentScene += 1;
  crossfadeTo(currentScene);
  coverCopy.classList.add("is-hidden");
  runSceneEffect(currentScene);

  if (currentScene === scenes.length - 1) {
    showFinalMessage();
  }
}

function keepMusicStateInSync() {
  if (!music) return;
  if (music.paused) {
    setMusicState(false);
  }
}

preloadScenes();
applyCardData();
setMusicState(false);

card.addEventListener("click", nextScene);
musicToggle.addEventListener("click", toggleMusic);
replayButton.addEventListener("click", resetCard);
music.addEventListener("pause", keepMusicStateInSync);
music.addEventListener("error", () => setMusicState(false));

window.addEventListener("pagehide", () => {
  if (finalPetalTimer) window.clearInterval(finalPetalTimer);
  clearCelebrationParticles();
});
