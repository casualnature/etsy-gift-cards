// ==============================
// お客さんの名前はここを書き換える
// 例: "Emily" → "Sarah"
// 長い名前でも自動で文字サイズを調整します
// ==============================
const cardData = {
  recipientName: "Emily" // ← お客さんの名前はここを書き換える
};

const scenes = Array.from(document.querySelectorAll(".scene"));
const scene1 = document.querySelector(".scene-1");
const scene2 = document.querySelector(".scene-2");
const scene3 = document.querySelector(".scene-3");
const scene4 = document.querySelector(".scene-4");
const noteCovers = Array.from(document.querySelectorAll(".note-cover"));
const music = document.getElementById("birthdayMusic");
const musicToggle = document.getElementById("musicToggle");
const finalName = document.getElementById("finalName");
const confettiLayer = document.getElementById("confettiLayer");
const replayButton = document.getElementById("replayButton");

let currentScene = 1;
let hasStarted = false;
let scene2Timer = null;
let finalTimer = null;
let musicEnabled = false;
const finalSceneDelay = 2000;
const openedNotes = new Set();

function renderFinalName() {
  const recipientName = cardData.recipientName.trim();
  const nameLength = recipientName.length;

  finalName.textContent = recipientName;
  finalName.classList.remove("name-short", "name-medium", "name-long", "name-extra-long");

  if (recipientName.includes("&") || nameLength > 14) {
    finalName.classList.add("name-extra-long");
  } else if (nameLength <= 6) {
    finalName.classList.add("name-short");
  } else if (nameLength <= 10) {
    finalName.classList.add("name-medium");
  } else if (nameLength <= 14) {
    finalName.classList.add("name-long");
  }
}

function showScene(sceneNumber) {
  currentScene = sceneNumber;
  scenes.forEach((scene) => {
    scene.classList.toggle("is-active", scene.dataset.scene === String(sceneNumber));
  });

  if (sceneNumber === 2) {
    scheduleScene3();
  }

  if (sceneNumber === 4) {
    launchConfetti();
  }
}

function playMusic() {
  musicEnabled = true;
  music.muted = false;
  const playAttempt = music.play();

  if (playAttempt) {
    playAttempt.catch((error) => {
      console.error("Music playback failed:", error);
    });
  }

  updateMusicButton();
}

function pauseMusic() {
  musicEnabled = false;
  music.pause();
  updateMusicButton();
}

function updateMusicButton() {
  musicToggle.textContent = musicEnabled ? "Music ON" : "Music OFF";
  musicToggle.setAttribute("aria-pressed", String(musicEnabled));
}

function scheduleScene3() {
  if (scene2Timer) return;

  scene2Timer = window.setTimeout(() => {
    showScene(3);
  }, 2000);
}

function scheduleFinale() {
  if (finalTimer || openedNotes.size < noteCovers.length) return;

  finalTimer = window.setTimeout(() => {
    showScene(4);
  }, finalSceneDelay);
}

function openNote(noteCover) {
  const noteIndex = noteCover.dataset.note;

  if (openedNotes.has(noteIndex) || currentScene !== 3) return;

  openedNotes.add(noteIndex);
  noteCover.classList.add("is-open");
  noteCover.setAttribute("aria-label", "Opened birthday note");
  scheduleFinale();
}

function launchConfetti() {
  if (!confettiLayer || confettiLayer.childElementCount > 0) return;

  const colors = ["#ff8fbb", "#ffd45f", "#72d7ff", "#b894ff", "#ffffff"];
  const amount = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 8 : 26;

  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.65}s`;
    piece.style.setProperty("--fall-duration", `${2.7 + Math.random() * 1.8}s`);
    piece.style.setProperty("--drift", `${Math.random() * 80 - 40}px`);
    confettiLayer.appendChild(piece);
  }
}

function resetCard() {
  window.clearTimeout(scene2Timer);
  window.clearTimeout(finalTimer);
  scene2Timer = null;
  finalTimer = null;
  currentScene = 1;
  hasStarted = false;
  openedNotes.clear();

  noteCovers.forEach((noteCover) => {
    noteCover.classList.remove("is-open");
    noteCover.setAttribute("aria-label", noteCover.dataset.originalLabel);
  });

  if (confettiLayer) {
    confettiLayer.innerHTML = "";
  }

  music.currentTime = 0;

  showScene(1);
}

scene1.addEventListener("click", () => {
  if (hasStarted) return;

  hasStarted = true;
  playMusic();

  window.setTimeout(() => {
    showScene(2);
  }, 380);
});

musicToggle.addEventListener("click", (event) => {
  event.stopPropagation();

  if (musicEnabled) {
    pauseMusic();
  } else {
    playMusic();
  }
});

noteCovers.forEach((noteCover) => {
  noteCover.dataset.originalLabel = noteCover.getAttribute("aria-label");
  noteCover.addEventListener("click", () => openNote(noteCover));
});

replayButton.addEventListener("click", (event) => {
  event.stopPropagation();
  resetCard();
});

renderFinalName();
updateMusicButton();
