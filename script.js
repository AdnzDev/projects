const panelButtons = [...document.querySelectorAll('[data-panel]')];
const navButtons = [...document.querySelectorAll('.screen-nav [data-panel]')];
const panelViews = [...document.querySelectorAll('[data-view]')];
const activeRoute = document.getElementById('activeRoute');
const monitor = document.querySelector('.monitor-shell');

function openPanel(panelName) {
  panelViews.forEach((view) => {
    view.hidden = view.dataset.view !== panelName;
  });

  navButtons.forEach((button) => {
    const isActive = button.dataset.panel === panelName;
    button.classList.toggle('active', isActive);
    if (isActive) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });

  activeRoute.textContent = panelName;

  if (window.innerWidth <= 900) {
    monitor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

panelButtons.forEach((button) => {
  button.addEventListener('click', () => openPanel(button.dataset.panel));
});

const audio = document.getElementById('backgroundMusic');
const audioPlayer = document.getElementById('audioPlayer');
const audioState = document.getElementById('audioState');
const audioName = document.getElementById('audioName');
const volumeOutput = document.getElementById('volumeOutput');
const playButton = document.getElementById('playMusic');
const muteButton = document.getElementById('muteMusic');
const volumeDown = document.getElementById('volumeDown');
const volumeUp = document.getElementById('volumeUp');
const speakers = [...document.querySelectorAll('.speaker')];
const musicFile = decodeURIComponent(audio.getAttribute('src') || 'musica.mp3').split('/').pop();

let audioMissing = false;
let needsInteraction = false;

audio.volume = 0.55;
audioName.textContent = musicFile;

function volumePercent() {
  return audio.muted ? 0 : Math.round(audio.volume * 100);
}

function updateAudioVisuals() {
  const active = !audio.paused && !audio.muted && audio.volume > 0 && !audioMissing;
  audioPlayer.classList.toggle('playing', active);
  speakers.forEach((speaker) => speaker.classList.toggle('playing', active));

  playButton.textContent = audio.paused ? '▶' : 'Ⅱ';
  playButton.setAttribute('aria-label', audio.paused ? 'Tocar música' : 'Pausar música');
  muteButton.textContent = audio.muted ? '×' : '♪';
  muteButton.setAttribute('aria-label', audio.muted ? 'Ativar som' : 'Mutar música');

  const currentVolume = volumePercent();
  volumeOutput.textContent = `${currentVolume}%`;
  volumeOutput.setAttribute('aria-label', `Volume ${currentVolume}%`);

  if (audioMissing) audioState.textContent = 'ARQUIVO NÃO ENCONTRADO';
  else if (needsInteraction && audio.paused) audioState.textContent = 'TOQUE PARA OUVIR';
  else if (active) audioState.textContent = 'TOCANDO AGORA';
  else audioState.textContent = 'MÚSICA PAUSADA';
}

function markAudioMissing() {
  audioMissing = true;
  needsInteraction = false;
  audioName.textContent = `adicione ${musicFile}`;
  [playButton, muteButton, volumeDown, volumeUp].forEach((button) => {
    button.disabled = true;
  });
  updateAudioVisuals();
}

function tryToPlay() {
  if (audioMissing || !audio.paused) return;
  audio.play()
    .then(() => {
      needsInteraction = false;
      updateAudioVisuals();
    })
    .catch(() => {
      needsInteraction = true;
      updateAudioVisuals();
    });
}

function changeVolume(amount) {
  if (audioMissing) return;
  audio.volume = Math.max(0, Math.min(1, audio.volume + amount));
  audio.muted = false;
  tryToPlay();
  updateAudioVisuals();
}

playButton.addEventListener('click', () => {
  if (audioMissing) return;
  if (audio.paused) tryToPlay();
  else audio.pause();
});

muteButton.addEventListener('click', () => {
  if (audioMissing) return;
  audio.muted = !audio.muted;
  updateAudioVisuals();
});

volumeDown.addEventListener('click', () => changeVolume(-0.1));
volumeUp.addEventListener('click', () => changeVolume(0.1));

audio.addEventListener('play', updateAudioVisuals);
audio.addEventListener('pause', updateAudioVisuals);
audio.addEventListener('volumechange', updateAudioVisuals);
audio.addEventListener('error', markAudioMissing);

function unlockOnFirstInteraction() {
  tryToPlay();
  document.removeEventListener('pointerdown', unlockOnFirstInteraction);
  document.removeEventListener('keydown', unlockOnFirstInteraction);
}

document.addEventListener('pointerdown', unlockOnFirstInteraction, { once: true });
document.addEventListener('keydown', unlockOnFirstInteraction, { once: true });

tryToPlay();
updateAudioVisuals();
