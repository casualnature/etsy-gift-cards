/* =========================================================
   ORDER CUSTOMIZATION — change values in this section only
   ========================================================= */

const cardData = {
  // Change this for each order. Examples: "Emily" or "Emily & Michael"
  signatureName: "Emily",

  // Local music file (keep it inside the assets folder).
  musicFile: "assets/music.mp3",

  // Scene 4 message. Each array item appears on its own line.
  scene4Text: [
    "Because of you,",
    "I found the courage",
    "to become who I am."
  ],

  // Timing values are in milliseconds.
  timing: {
    sceneTransition: 850,
    scene4TextDelay: 2000,
    scene4FallbackContinueDelay: 9000,
    scene3ContinueDelay: 900,
    finalSignatureDelay: 850
  },

  // Background music volume: 0 is silent, 1 is full volume.
  musicVolume: 0.28
};

/* =========================================================
   File names used by the visual scenes
   Edit these only if your asset file names change.
   ========================================================= */

const sceneFiles = {
  scene1: "assets/scene1.png",
  scene2: "assets/scene2.png",
  scene3States: {
    "000": "assets/scene3_state_000.png",
    "001": "assets/scene3_state_001.png",
    "010": "assets/scene3_state_010.png",
    "011": "assets/scene3_state_011.png",
    "100": "assets/scene3_state_100.png",
    "101": "assets/scene3_state_101.png",
    "110": "assets/scene3_state_110.png",
    "111": "assets/scene3_state_111.png"
  },
  scene4: "assets/scene4.mp4",
  final: "assets/final.png"
};

/* =========================================================
   Card behavior
   ========================================================= */

const scenes = Array.from(document.querySelectorAll(".scene"));
const music = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
const video = document.getElementById("scene4Video");
const scene4Message = document.getElementById("scene4Message");
const scene4Continue = document.getElementById("scene4Continue");
const scene3Continue = document.getElementById("scene3Continue");
const scene3StateImage = document.getElementById("scene3StateImage");
const scene3Element = document.querySelector(".scene-3");
const signature = document.getElementById("signatureName");
const replayButton = document.getElementById("replayButton");
const liveStatus = document.getElementById("liveStatus");
const buds = Array.from(document.querySelectorAll(".bud"));

let currentScene = 1;
let revealedBudCount = 0;
let flowerState = { left: false, right: false, bottom: false };
let scene3Ready = false;
let scene4Ready = false;
let isTransitioning = false;
let musicHasStarted = false;
let scene4TextTimer;
let scene4FallbackTimer;
let scene3ImageTimer;

initializeCard();

function initializeCard() {
  // Apply all customizable text and file paths.
  document.documentElement.style.setProperty(
    "--transition-time",
    `${cardData.timing.sceneTransition}ms`
  );
  document.documentElement.style.setProperty(
    "--signature-delay",
    `${cardData.timing.finalSignatureDelay}ms`
  );

  music.src = cardData.musicFile;
  music.volume = cardData.musicVolume;
  music.loop = true;

  document.querySelector(".scene-1 .scene-media").src = sceneFiles.scene1;
  document.querySelector(".scene-2 .scene-media").src = sceneFiles.scene2;
  scene3StateImage.src = sceneFiles.scene3States["000"];
  Object.values(sceneFiles.scene3States).forEach((file) => {
    const preloadImage = new Image();
    preloadImage.src = file;
  });
  document.querySelector(".scene-final .scene-media").src = sceneFiles.final;
  video.src = sceneFiles.scene4;

  signature.textContent = cardData.signatureName;
  fitSignatureText();

  scene4Message.replaceChildren(
    ...cardData.scene4Text.map((line) => {
      const lineElement = document.createElement("span");
      lineElement.textContent = line;
      return lineElement;
    })
  );

  // Whole-scene tap controls.
  scenes.forEach((scene) => {
    scene.addEventListener("click", handleSceneTap);
  });

  buds.forEach((bud) => {
    bud.addEventListener("click", revealBudMessage);
  });

  musicToggle.addEventListener("click", toggleMusic);
  replayButton.addEventListener("click", replayCard);
  video.addEventListener("ended", makeScene4Ready);

  // If playback cannot reach "ended" on a particular mobile browser,
  // this event also provides a safe final-frame state.
  video.addEventListener("error", () => {
    window.clearTimeout(scene4TextTimer);
    scene4Message.classList.add("is-visible");
    scene4Message.setAttribute("aria-hidden", "false");
    makeScene4Ready();
  });

  window.addEventListener("resize", fitSignatureText);
}

async function startMusicFromUserGesture() {
  if (musicHasStarted) return;

  try {
    await music.play();
    musicHasStarted = true;
    updateMusicButton(true);
  } catch (error) {
    // The card still works if a browser blocks or cannot load local audio.
    updateMusicButton(false);
  }
}

async function toggleMusic(event) {
  event.stopPropagation();

  if (music.paused) {
    try {
      await music.play();
      musicHasStarted = true;
      updateMusicButton(true);
    } catch (error) {
      updateMusicButton(false);
    }
  } else {
    music.pause();
    updateMusicButton(false);
  }
}

function updateMusicButton(isOn) {
  musicToggle.textContent = isOn ? "Music: On" : "Music: Off";
  musicToggle.setAttribute("aria-pressed", String(isOn));
}

function handleSceneTap(event) {
  // Buttons have their own behavior and must never advance a scene.
  if (event.target.closest("button")) return;

  if (currentScene === 1) {
    startMusicFromUserGesture();
    document.querySelector(".scene-1").classList.add("is-opening");
    goToScene(2);
  } else if (currentScene === 2) {
    goToScene(3);
  } else if (currentScene === 3 && scene3Ready) {
    goToScene(4);
  } else if (currentScene === 4 && scene4Ready) {
    goToScene(5);
  }
}

function goToScene(nextSceneNumber) {
  if (isTransitioning || nextSceneNumber === currentScene) return;
  isTransitioning = true;

  const oldScene = document.querySelector(`[data-scene="${currentScene}"]`);
  const nextScene = document.querySelector(`[data-scene="${nextSceneNumber}"]`);

  oldScene.classList.remove("is-active");
  nextScene.classList.add("is-active");
  currentScene = nextSceneNumber;
  liveStatus.textContent = `Scene ${currentScene} of 5`;

  if (currentScene === 4) {
    beginScene4();
  }

  window.setTimeout(() => {
    isTransitioning = false;
  }, cardData.timing.sceneTransition);
}

function revealBudMessage(event) {
  event.stopPropagation();
  const bud = event.currentTarget;

  if (bud.classList.contains("is-revealed")) return;

  flowerState[bud.dataset.flower] = true;
  bud.classList.add("is-revealed");
  bud.setAttribute("aria-pressed", "true");
  revealedBudCount += 1;
  updateScene3StateImage();
  liveStatus.textContent = `${bud.dataset.word} revealed. ${revealedBudCount} of 3.`;

  if (revealedBudCount === buds.length) {
    window.setTimeout(() => {
      scene3Ready = true;
      scene3Continue.classList.add("is-visible");
      scene3Continue.setAttribute("aria-hidden", "false");
      liveStatus.textContent = "All three messages revealed. Tap to continue.";
    }, cardData.timing.scene3ContinueDelay);
  }
}

function getScene3StateKey() {
  // State order: left, right, bottom.
  return `${Number(flowerState.left)}${Number(flowerState.right)}${Number(flowerState.bottom)}`;
}

function updateScene3StateImage({ immediate = false } = {}) {
  const stateKey = getScene3StateKey();
  const nextFile = sceneFiles.scene3States[stateKey];

  window.clearTimeout(scene3ImageTimer);

  if (immediate) {
    scene3StateImage.classList.remove("is-changing");
    scene3StateImage.src = nextFile;
    scene3Element.style.setProperty("--scene-background", `url("${nextFile}")`);
    return;
  }

  scene3StateImage.classList.add("is-changing");
  scene3ImageTimer = window.setTimeout(() => {
    scene3StateImage.src = nextFile;
    scene3Element.style.setProperty("--scene-background", `url("${nextFile}")`);
    requestAnimationFrame(() => {
      scene3StateImage.classList.remove("is-changing");
    });
  }, 110);
}

function beginScene4() {
  scene4Ready = false;
  scene4Message.classList.remove("is-visible");
  scene4Continue.classList.remove("is-visible");
  scene4Message.setAttribute("aria-hidden", "true");
  scene4Continue.setAttribute("aria-hidden", "true");

  window.clearTimeout(scene4TextTimer);
  window.clearTimeout(scene4FallbackTimer);

  video.currentTime = 0;
  video.muted = true;

  // Muted + playsinline makes playback dependable on modern mobile browsers.
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      // Show a still/video frame and continue gracefully if playback is blocked.
      scene4Message.classList.add("is-visible");
      scene4Message.setAttribute("aria-hidden", "false");
      makeScene4Ready();
    });
  }

  scene4TextTimer = window.setTimeout(() => {
    scene4Message.classList.add("is-visible");
    scene4Message.setAttribute("aria-hidden", "false");
  }, cardData.timing.scene4TextDelay);

  // A fallback protects against a missing "ended" event in local-file playback.
  scene4FallbackTimer = window.setTimeout(() => {
    makeScene4Ready();
  }, cardData.timing.scene4FallbackContinueDelay);
}

function makeScene4Ready() {
  if (scene4Ready || currentScene !== 4) return;

  scene4Ready = true;
  scene4Message.classList.add("is-visible");
  scene4Message.setAttribute("aria-hidden", "false");
  scene4Continue.classList.add("is-visible");
  scene4Continue.setAttribute("aria-hidden", "false");
  liveStatus.textContent = "Tap to continue to the final message.";
}

function replayCard(event) {
  event.stopPropagation();

  // Stop video and clear temporary timers.
  video.pause();
  video.currentTime = 0;
  window.clearTimeout(scene4TextTimer);
  window.clearTimeout(scene4FallbackTimer);

  // Reset all interactive Scene 3 states.
  revealedBudCount = 0;
  flowerState = { left: false, right: false, bottom: false };
  scene3Ready = false;
  scene4Ready = false;
  buds.forEach((bud) => {
    bud.classList.remove("is-revealed");
    bud.removeAttribute("aria-pressed");
  });
  updateScene3StateImage({ immediate: true });
  scene3Continue.classList.remove("is-visible");
  scene3Continue.setAttribute("aria-hidden", "true");
  scene4Message.classList.remove("is-visible");
  scene4Continue.classList.remove("is-visible");
  document.querySelector(".scene-1").classList.remove("is-opening");

  goToScene(1);

  // Music continues across Replay if the viewer left it switched on.
  liveStatus.textContent = "The card has restarted.";
}

function fitSignatureText() {
  /*
    Long names are reduced until they fit the printable area of the card.
    This supports both one name and two-name signatures.
  */
  const cardWidth = document.getElementById("card").clientWidth;
  const maximumSize = Math.min(31, cardWidth * 0.064);
  const minimumSize = 17;
  let size = maximumSize;

  signature.style.fontSize = `${size}px`;

  while (signature.scrollWidth > signature.clientWidth && size > minimumSize) {
    size -= 1;
    signature.style.fontSize = `${size}px`;
  }
}
