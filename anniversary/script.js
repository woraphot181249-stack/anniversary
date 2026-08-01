const lockScreen = document.getElementById('lock-screen');
const heartCardScreen = document.getElementById('heart-card-screen');
const messageScreen = document.getElementById('message-screen');
const galleryScreen = document.getElementById('gallery-screen');
const answerInput = document.getElementById('answer-input');
const unlockBtn = document.getElementById('unlock-btn');
const warningText = document.getElementById('warning-text');
const heartCard = document.getElementById('heart-card');
const revealCards = document.querySelectorAll('.reveal-card');
const floatingNavBtn = document.getElementById('floating-nav-btn');

const correctAnswers = ['วันนี้เป็นวันครบรอบ', 'วันครบรอบ', 'ครบรอบ', 'ครบรอบไง', 'ครบรอบ1ปี5เดือน', 'วันนี้เป็นวันครบรอบไง', 'วันครบรอบไง'];
let isUnlocked = false;
let hasAutoGalleryMove = false;
let messageAutoTimer = null;
let messageFadeTimer = null;

const stageMap = {
  lock: lockScreen,
  heart: heartCardScreen,
  message: messageScreen,
  gallery: galleryScreen,
};

function cancelAutoMessageSwitch() {
  clearTimeout(messageAutoTimer);
  clearTimeout(messageFadeTimer);
  messageScreen.classList.remove('message-fading');
}

function queueFirstMessageAutoSwitch() {
  if (hasAutoGalleryMove) return;

  cancelAutoMessageSwitch();
  messageAutoTimer = setTimeout(() => {
    messageScreen.classList.add('message-fading');

    messageFadeTimer = setTimeout(() => {
      hasAutoGalleryMove = true;
      cancelAutoMessageSwitch();
      goToStage('gallery');
      replayGalleryAnimation();
    }, 700);
  }, 5000);
}

function showScreen(screen, options = {}) {
  document.querySelectorAll('.stage').forEach((stage) => {
    stage.classList.add('hidden');
    stage.classList.remove('active');
  });

  screen.classList.remove('hidden');
  screen.classList.add('active');
  updateFloatingNavButton(screen);

  if (screen === messageScreen) {
    queueFirstMessageAutoSwitch();
  } else {
    cancelAutoMessageSwitch();
  }

  if (options.pushState !== false) {
    const stageName = Object.keys(stageMap).find((key) => stageMap[key] === screen);
    if (stageName) {
      history.pushState({ screen: stageName }, '', location.href);
    }
  }
}

function goToStage(stageName, options = {}) {
  const nextScreen = stageMap[stageName];
  if (nextScreen) {
    showScreen(nextScreen, options);
  }
}

function updateFloatingNavButton(screen) {
  if (screen === messageScreen) {
    floatingNavBtn.classList.remove('hidden');
    floatingNavBtn.textContent = '🩵🩵🩵';
  } else if (screen === galleryScreen) {
    floatingNavBtn.classList.remove('hidden');
    floatingNavBtn.textContent = 'ย้อนกลับไปดูข้อความ';
  } else {
    floatingNavBtn.classList.add('hidden');
  }
}

function unlockPage() {
  const answer = answerInput.value.trim().toLowerCase();
  const isCorrect = correctAnswers.some((item) => item.toLowerCase() === answer);

  if (!isCorrect) {
    warningText.classList.remove('hidden');
    answerInput.classList.add('border-rose-400');
    return;
  }

  warningText.classList.add('hidden');
  answerInput.classList.remove('border-rose-400');
  lockScreen.classList.add('hidden');
  lockScreen.classList.remove('active');
  isUnlocked = true;

  setTimeout(() => {
    goToStage('heart');
  }, 300);
}

unlockBtn.addEventListener('click', unlockPage);
answerInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') unlockPage();
});

heartCard.addEventListener('click', () => {
  if (!isUnlocked) return;
  heartCard.classList.toggle('open');

  if (heartCard.classList.contains('open')) {
    setTimeout(() => {
      goToStage('message');
    }, 700);
  }
});

heartCard.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    heartCard.click();
  }
});

let touchStartY = 0;
let touchEndY = 0;

heartCard.addEventListener('touchstart', (event) => {
  touchStartY = event.changedTouches[0].screenY;
}, { passive: true });

heartCard.addEventListener('touchend', (event) => {
  touchEndY = event.changedTouches[0].screenY;
  const diff = touchStartY - touchEndY;

  if (diff > 50) {
    heartCard.classList.add('open');
    setTimeout(() => {
      goToStage('message');
    }, 700);
  }
}, { passive: true });

function replayGalleryAnimation() {
  revealCards.forEach((card) => card.classList.remove('visible'));

  revealCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('visible');
    }, index * 180);
  });
}

floatingNavBtn.addEventListener('click', () => {
  if (messageScreen.classList.contains('active')) {
    hasAutoGalleryMove = true;
    cancelAutoMessageSwitch();
    goToStage('gallery');
    replayGalleryAnimation();
  } else if (galleryScreen.classList.contains('active')) {
    hasAutoGalleryMove = true;
    cancelAutoMessageSwitch();
    goToStage('message');
  }
});

window.addEventListener('popstate', (event) => {
  const nextStage = event.state?.screen || 'lock';
  goToStage(nextStage, { pushState: false });

  if (nextStage === 'gallery') {
    replayGalleryAnimation();
  }
});

window.addEventListener('load', () => {
  history.replaceState({ screen: 'lock' }, '', location.href);
  setTimeout(() => {
    goToStage('lock', { pushState: false });
  }, 200);
});
