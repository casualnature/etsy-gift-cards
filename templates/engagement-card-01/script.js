const cardData = {
  coupleNames: "Michael & Michelle",
  headline: "Congratulations on Your Engagement",
  message: "Wishing you a lifetime of love and happiness.",
  date: "June 15, 2026"
};

const coverScene = document.getElementById("coverScene");
const candleScene = document.getElementById("candleScene");
const finalScene = document.getElementById("finalScene");

const leftHit = document.querySelector(".candle-hit-left");
const rightHit = document.querySelector(".candle-hit-right");
const leftFlame = document.getElementById("leftFlame");
const rightFlame = document.getElementById("rightFlame");
const leftHint = document.getElementById("leftHint");
const rightHint = document.getElementById("rightHint");

const music = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const replayButton = document.getElementById("replayButton");

let currentScene = "cover";
let leftCandleLit = false;
let rightCandleLit = false;
let musicStarted = false;
let finalTimer = null;

function applyCardData() {
  document.getElementById("coupleNames").textContent = cardData.coupleNames;
  document.getElementById("headline").textContent = cardData.headline;
  document.getElementById("message").textContent = cardData.message;
  document.getElementById("date").textContent = cardData.date;
}

function setActiveScene(sceneName) {
  currentScene = sceneName;
  coverScene.classList.toggle("active", sceneName === "cover");
  candleScene.classList.toggle("active", sceneName === "candles");
  finalScene.classList.toggle("active", sceneName === "final");
}

function updateMusicButton() {
  const isPlaying = musicStarted && !music.paused && !music.muted;
  musicToggle.textContent = isPlaying ? "♪ On" : "♪ Off";
  musicToggle.classList.toggle("on", isPlaying);
  musicToggle.setAttribute("aria-label", isPlaying ? "Turn music off" : "Turn music on");
}

function startMusic() {
  if (musicStarted) {
    updateMusicButton();
    return;
  }

  musicStarted = true;
  music.muted = false;
  music.volume = 0.68;

  const playAttempt = music.play();
  if (playAttempt !== undefined) {
    playAttempt
      .then(updateMusicButton)
      .catch(() => {
        musicStarted = false;
        updateMusicButton();
      });
  } else {
    updateMusicButton();
  }
}

function lightCandle(side) {
  if (currentScene !== "candles") return;

  if (side === "left" && !leftCandleLit) {
    leftCandleLit = true;
    leftFlame.classList.add("visible");
    leftHint.classList.add("hidden");
    leftHit.classList.add("hidden");
    startMusic();
  }

  if (side === "right" && !rightCandleLit) {
    rightCandleLit = true;
    rightFlame.classList.add("visible");
    rightHint.classList.add("hidden");
    rightHit.classList.add("hidden");
    startMusic();
  }

  if (leftCandleLit && rightCandleLit && !finalTimer) {
    finalTimer = window.setTimeout(() => {
      finalTimer = null;
      setActiveScene("final");
    }, 1000);
  }
}

function replayCard() {
  if (finalTimer) {
    window.clearTimeout(finalTimer);
    finalTimer = null;
  }

  leftCandleLit = false;
  rightCandleLit = false;
  leftFlame.classList.remove("visible");
  rightFlame.classList.remove("visible");
  leftHint.classList.remove("hidden");
  rightHint.classList.remove("hidden");
  leftHit.classList.remove("hidden");
  rightHit.classList.remove("hidden");

  setActiveScene("cover");
  updateMusicButton();
}

coverScene.addEventListener("click", () => {
  setActiveScene("candles");
});

coverScene.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    setActiveScene("candles");
  }
});

leftHit.addEventListener("click", (event) => {
  event.stopPropagation();
  lightCandle("left");
});

rightHit.addEventListener("click", (event) => {
  event.stopPropagation();
  lightCandle("right");
});

replayButton.addEventListener("click", (event) => {
  event.stopPropagation();
  replayCard();
});

musicToggle.addEventListener("click", (event) => {
  event.stopPropagation();

  if (!musicStarted) {
    startMusic();
    return;
  }

  if (music.paused || music.muted) {
    music.muted = false;
    music.play().finally(updateMusicButton);
  } else {
    music.muted = true;
    updateMusicButton();
  }
});

music.addEventListener("play", updateMusicButton);
music.addEventListener("pause", updateMusicButton);
music.addEventListener("volumechange", updateMusicButton);

applyCardData();
updateMusicButton();
