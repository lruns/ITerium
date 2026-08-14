// "Neural net meditation": models are told to meditate and immediately start
// talking over each other. The original clip is credited and linked on the exhibit.
//
// Audio is synthesized ONLY, and started ONLY from a user click (see audio.ts):
// first an om drone, then a cacophony of voices layered on top. No audio files,
// no autoplay.

import { svgArrow } from '../chrome';
import { audioOnGesture, botVoice, omDrone, type Drone } from '../audio';
import { t, tl } from '../i18n';
import { onCleanup, reducedMotion, stepEngine } from '../runtime';

// What the models say when asked to stay silent. Each line is a recognisable
// language-model turn of phrase; nothing is quoted from anyone else's text.
const BOT_LINES = tl('botLines');

const NAMES = ['mdl-01', 'mdl-02', 'mdl-03', 'mdl-04', 'mdl-05', 'mdl-06'];

export function meditationHtml(): string {
  const seats = NAMES.map(
    (n, i) => `<div class="med-seat" data-seat="${i}">
      <span class="med-body" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="med-name">${n}</span>
    </div>`,
  ).join('');
  return `<div class="obj mid toy med reveal" id="med">
    <div class="obj-title">$ ./meditate --models=6 --silence=true</div>
    <p class="obj-hint top">${t('med.hint')}</p>
    <div class="med-room" id="med-room">
      <div class="med-halo" aria-hidden="true"></div>
      <div class="med-seats">${seats}</div>
      <div class="med-bubbles" id="med-bubbles" aria-hidden="true"></div>
    </div>
    <p class="med-status" id="med-status">${t('med.idle')}</p>
    <div class="med-row">
      <button class="obj-btn" id="med-go" type="button">${t('med.go')}</button>
      <button class="obj-btn small" id="med-stop" type="button">${t('med.stop')}</button>
      <span class="med-hint">${t('sound.hint')}</span>
    </div>
    <a class="plate" href="https://www.instagram.com/reel/Dbj6mf-Rscq/" target="_blank" rel="noopener">
      ${t('med.plate')} ${svgArrow}</a>
  </div>`;
}

export function mountMeditation(root: HTMLElement): void {
  const host = root.querySelector('#med') as HTMLElement | null;
  if (!host) return;
  const room = host.querySelector('#med-room') as HTMLElement;
  const bubbles = host.querySelector('#med-bubbles') as HTMLElement;
  const status = host.querySelector('#med-status') as HTMLElement;
  const go = host.querySelector('#med-go') as HTMLButtonElement;
  const stopBtn = host.querySelector('#med-stop') as HTMLButtonElement;
  const engine = stepEngine();
  const still = reducedMotion();

  let drone: Drone | null = null;
  let timers: number[] = [];
  let chatter = 0;
  let said = 0;
  let running = false;

  const clearTimers = (): void => {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
    if (chatter) window.clearInterval(chatter);
    chatter = 0;
  };

  const stop = (): void => {
    running = false;
    clearTimers();
    engine.stop();
    if (drone) {
      drone.stop();
      drone = null;
    }
    room.classList.remove('silent', 'loud');
    bubbles.innerHTML = '';
    status.textContent = said > 0 ? t('med.over', { n: said }) : t('med.idle');
  };

  const bubble = (): void => {
    said += 1;
    const seat = Math.floor(Math.random() * NAMES.length);
    const el = document.createElement('span');
    el.className = 'med-bubble';
    el.textContent = BOT_LINES[Math.floor(Math.random() * BOT_LINES.length)];
    el.style.left = `${8 + Math.random() * 74}%`;
    el.style.top = `${10 + Math.random() * 66}%`;
    el.style.setProperty('--r', `${(Math.random() * 6 - 3).toFixed(1)}deg`);
    bubbles.appendChild(el);
    const a = audioOnGesture();
    if (a) botVoice(a, seat * 7 + said);
    timers.push(
      window.setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 2600),
    );
    if (bubbles.childElementCount > 14 && bubbles.firstChild) {
      bubbles.removeChild(bubbles.firstChild);
    }
    if (said === 1) status.textContent = t('med.first');
    else if (said < 8) status.textContent = t('med.few', { n: said });
    else status.textContent = t('med.many', { n: said });
  };

  const start = (): void => {
    if (running) return;
    running = true;
    said = 0;
    bubbles.innerHTML = '';
    room.classList.add('silent');
    room.classList.remove('loud');
    status.textContent = t('med.silence');

    const a = audioOnGesture();
    if (a) drone = omDrone(a);

    engine.next(() => {
      if (!running) return;
      room.classList.remove('silent');
      room.classList.add('loud');
      status.textContent = t('med.broken');
      bubble();
      if (still) {
        // reduced motion: show the result at once, without flicker
        for (let i = 0; i < 5; i += 1) bubble();
        return;
      }
      // the chatter accelerates: rare at first, then all at once
      let gap = 620;
      const tick = (): void => {
        if (!running) return;
        bubble();
        gap = Math.max(150, gap * 0.86);
        timers.push(window.setTimeout(tick, gap));
      };
      timers.push(window.setTimeout(tick, gap));
    }, 2000);
  };

  go.addEventListener('click', () => {
    if (running) {
      stop();
      return;
    }
    start();
  });
  stopBtn.addEventListener('click', stop);
  onCleanup(stop);
}
