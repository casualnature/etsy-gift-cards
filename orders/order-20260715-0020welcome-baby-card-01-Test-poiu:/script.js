const cardData = {
  babyName: "Emma",
  headline: "",
  message: "May your life be filled with love, joy, and gentle dreams."
};

const sceneTiming = {
  storyDuration: 2000,
  cradleVideoDuration: 4300,
  fadeDuration: 900
};

const scenes = {
  cover: document.getElementById("coverScene"),
  story: document.getElementById("storyScene"),
  cradleStill: document.getElementById("cradleStillScene"),
  cradleVideo: document.getElementById("cradleVideoScene"),
  final: document.getElementById("finalScene")
};

const cradleVideo = document.getElementById("cradleVideo");
const finalHeadline = document.getElementById("finalHeadline");
const finalMessage = document.getElementById("finalMessage");
const soundToggle = document.getElementById("soundToggle");
const watchAgainButton = document.getElementById("watchAgainButton");
const music = new Audio("assets/music.mp3");

let soundEnabled = true;
let musicStarted = false;
let currentScene = "cover";
let isTransitioning = false;
let hasStartedCradle = false;
let transitionTimer = 0;
let storyTimer = 0;
let finalTimer = 0;

music.preload = "auto";
music.volume = 0.8;

finalHeadline.textContent = cardData.headline || `Welcome, Baby ${cardData.babyName}`;
finalMessage.textContent = cardData.message;

function setSceneAccessibility(nextSceneName) {
  Object.entries(scenes).forEach(([name, scene]) => {
    scene.setAttribute("aria-hidden", name === nextSceneName ? "false" : "true");
  });
}

function showScene(nextSceneName, afterTransition) {
  if (isTransitioning || nextSceneName === currentScene) {
    return;
  }

  window.clearTimeout(transitionTimer);
  isTransitioning = true;
  const previousScene = scenes[currentScene];
  const nextScene = scenes[nextSceneName];

  setSceneAccessibility(nextSceneName);
  previousScene.classList.remove("is-active");
  nextScene.classList.add("is-active");
  currentScene = nextSceneName;

  transitionTimer = window.setTimeout(() => {
    isTransitioning = false;
    if (typeof afterTransition === "function") {
      afterTransition();
    }
  }, sceneTiming.fadeDuration);
}

function addTapHandler(element, handler) {
  const eventName = window.PointerEvent ? "pointerup" : "click";
  element.addEventListener(eventName, handler, { passive: true });
}

function addButtonHandler(element, handler) {
  const eventName = window.PointerEvent ? "pointerup" : "click";
  element.addEventListener(eventName, (event) => {
    event.stopPropagation();
    handler();
  });
}

function updateSoundToggle() {
  soundToggle.textContent = soundEnabled ? "♪ On" : "♪ Off";
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundToggle.setAttribute("aria-label", soundEnabled ? "Turn sound off" : "Turn sound on");
}

function playMusicFromStart() {
  if (!soundEnabled) {
    return;
  }

  music.currentTime = 0;
  musicStarted = true;

  const musicPlay = music.play();
  if (musicPlay && typeof musicPlay.catch === "function") {
    musicPlay.catch((error) => {
      console.warn("Music playback could not start.", error);
    });
  }
}

function resumeMusic() {
  if (!soundEnabled || currentScene === "cover" || currentScene === "story" || currentScene === "cradleStill") {
    return;
  }

  if (!musicStarted) {
    music.currentTime = 0;
    musicStarted = true;
  }

  const musicPlay = music.play();
  if (musicPlay && typeof musicPlay.catch === "function") {
    musicPlay.catch((error) => {
      console.warn("Music playback could not resume.", error);
    });
  }
}

function stopMusic(resetPosition) {
  music.pause();
  if (resetPosition) {
    music.currentTime = 0;
    musicStarted = false;
  }
}

function clearSceneTimers() {
  window.clearTimeout(transitionTimer);
  window.clearTimeout(storyTimer);
  window.clearTimeout(finalTimer);
  transitionTimer = 0;
  storyTimer = 0;
  finalTimer = 0;
}

function openStory() {
  showScene("story", () => {
    storyTimer = window.setTimeout(() => {
      showScene("cradleStill");
    }, sceneTiming.storyDuration);
  });
}

function startCradleMoment() {
  if (hasStartedCradle || isTransitioning) {
    return;
  }

  hasStartedCradle = true;
  playMusicFromStart();

  cradleVideo.currentTime = 0;
  const videoPlay = cradleVideo.play();
  if (videoPlay && typeof videoPlay.catch === "function") {
    videoPlay.catch((error) => {
      console.warn("Cradle video playback could not start.", error);
    });
  }

  showScene("cradleVideo", () => {
    finalTimer = window.setTimeout(() => {
      showScene("final");
    }, sceneTiming.cradleVideoDuration);
  });
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  updateSoundToggle();

  if (!soundEnabled) {
    stopMusic(false);
    return;
  }

  resumeMusic();
}

function watchAgain() {
  if (isTransitioning && currentScene !== "final") {
    return;
  }

  clearSceneTimers();
  isTransitioning = false;
  hasStartedCradle = false;
  stopMusic(true);
  cradleVideo.pause();
  cradleVideo.currentTime = 0;
  showScene("cover");
}

updateSoundToggle();
addTapHandler(scenes.cover, openStory);
addTapHandler(scenes.cradleStill, startCradleMoment);
addButtonHandler(soundToggle, toggleSound);
addButtonHandler(watchAgainButton, watchAgain);
