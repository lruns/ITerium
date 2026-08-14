// "Reset ritual": resetting a usage limit via a cleansing rite. The original clip
// is credited and linked on the exhibit.
// Click -> a water wave sweeps the exhibit -> rows are cleansed one by one -> OM.
// Audio is synthesized (splash plus a singing bowl with the syllable) and only
// starts from a click. The "certified cleansing course" link is captioned so it
// reads as part of the joke.

import { svgArrow } from '../chrome';
import { audioOnGesture, omBless, waterSplash } from '../audio';
import { t } from '../i18n';
import { reducedMotion, stepEngine } from '../runtime';

interface Sin {
  what: string;
  was: string;
  now: string;
}

const SINS: Sin[] = [
  { what: t('rit.sin.0.what'), was: t('rit.sin.0.was'), now: t('rit.sin.0.now') },
  { what: t('rit.sin.1.what'), was: t('rit.sin.1.was'), now: t('rit.sin.1.now') },
  { what: t('rit.sin.2.what'), was: t('rit.sin.2.was'), now: t('rit.sin.2.now') },
  { what: t('rit.sin.3.what'), was: t('rit.sin.3.was'), now: t('rit.sin.3.now') },
  { what: t('rit.sin.4.what'), was: t('rit.sin.4.was'), now: t('rit.sin.4.now') },
];

export function ritualHtml(): string {
  const rows = SINS.map(
    (s, i) => `<li class="rit-row" data-sin="${i}">
      <span class="rit-what">${s.what}</span>
      <span class="rit-was">${s.was}</span>
      <span class="rit-now">${s.now}</span>
    </li>`,
  ).join('');
  return `<div class="obj mid toy rit reveal" id="rit">
    <div class="obj-title">$ sudo ./ritual --reset=all</div>
    <p class="obj-hint top">${t('rit.hint')}</p>
    <div class="rit-altar" id="rit-altar">
      <div class="rit-wave" id="rit-wave" aria-hidden="true"></div>
      <pre class="rit-bowl" aria-hidden="true">     ___________
    \\  ~ ~ ~ ~ /
     \\_______/
       |   |</pre>
      <ul class="rit-list">${rows}</ul>
      <p class="rit-final" id="rit-final" aria-hidden="true">${t('rit.om')}</p>
    </div>
    <p class="rit-status" id="rit-status">${t('rit.idle')}</p>
    <div class="rit-row-btn">
      <button class="obj-btn" id="rit-go" type="button">${t('rit.go')}</button>
      <span class="med-hint">${t('sound.hint')}</span>
    </div>
    <a class="plate" href="https://www.instagram.com/reel/DaZpzZ4h7XM/" target="_blank" rel="noopener">
      ${t('rit.plate1')} ${svgArrow}</a>
    <a class="plate" href="https://www.youtube.com/watch?v=RXql3TQHMe8" target="_blank" rel="noopener">
      ${t('rit.plate2')} ${svgArrow}</a>
  </div>`;
}

export function mountRitual(root: HTMLElement): void {
  const host = root.querySelector('#rit') as HTMLElement | null;
  if (!host) return;
  const altar = host.querySelector('#rit-altar') as HTMLElement;
  const status = host.querySelector('#rit-status') as HTMLElement;
  const final = host.querySelector('#rit-final') as HTMLElement;
  const go = host.querySelector('#rit-go') as HTMLButtonElement;
  const rows = Array.from(host.querySelectorAll('.rit-row')) as HTMLElement[];
  const engine = stepEngine();
  const still = reducedMotion();
  let busy = false;

  const reset = (): void => {
    rows.forEach((r) => r.classList.remove('clean'));
    altar.classList.remove('wet', 'blessed');
    final.classList.remove('on');
    status.textContent = t('rit.idle');
  };

  const bless = (): void => {
    altar.classList.add('blessed');
    final.classList.add('on');
    status.textContent = t('rit.clean');
    const a = audioOnGesture();
    if (a) omBless(a);
    busy = false;
    go.textContent = t('rit.again');
  };

  const wash = (i: number): void => {
    if (i >= rows.length) {
      engine.next(bless, 420);
      return;
    }
    rows[i].classList.add('clean');
    status.textContent = t('rit.washed', { what: SINS[i].what, now: SINS[i].now });
    engine.next(() => wash(i + 1), 620);
  };

  go.addEventListener('click', () => {
    if (busy) return;
    if (final.classList.contains('on')) {
      reset();
      go.textContent = t('rit.go');
      return;
    }
    busy = true;
    const a = audioOnGesture();
    if (a) waterSplash(a);
    altar.classList.add('wet');
    status.textContent = t('rit.water');
    if (still) {
      rows.forEach((r) => r.classList.add('clean'));
      bless();
      return;
    }
    engine.next(() => wash(0), 900);
  });
}
