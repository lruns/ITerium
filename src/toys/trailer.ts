// Exhibit for the "Groups and homotopy theory (trash trailer)" video.
//
// A real university lecture on homological algebra, edited as a blockbuster
// trailer. The bit reproduced here is the ORACLE from the middle of the lecture:
// a mathematician could ask it anything, and to every question about the future
// it answered the same thing — "homology".
//
// This is our own oracle in trailer grade: ask anything, the answer is known.
// Not a second of the source video is embedded — only links to the original and
// to the course. The oracle lines follow the lecture transcript.
// IMPORTANT: about a real person, state only their work and confirmed facts.

import { svgArrow } from '../chrome';
import { t, tl } from '../i18n';
import { later, reducedMotion } from '../runtime';
import { embedHtml, mountEmbed, type EmbedOpts } from './embed';

/** Embedding is allowed for this video — verified in a real browser. */
const FILM: EmbedOpts = {
  id: 'trl',
  videoId: 'mqAf5lOJZew',
  poster: 'assets/posters/homotopy.jpg',
  alt: t('orc.alt'),
  cap: t('orc.cap'),
  embeddable: true,
  note: t('orc.note'),
};

const ANSWERS = tl('oracleAnswers');

export function oracleHtml(): string {
  return `<div class="obj mid toy oracle reveal" id="oracle">
    <div class="obj-title">$ ./oracle --ask=future</div>
    <p class="obj-hint top">${t('orc.hint')}</p>

    ${embedHtml(FILM)}

    <p class="orc-lead">${t('orc.lead')}</p>
    <div class="orc-frame">
      <div class="orc-vign" aria-hidden="true"></div>
      <p class="orc-answer" id="orc-answer" aria-live="polite">${t('orc.idle')}</p>
    </div>
    <div class="orc-row">
      <input class="orc-input" id="orc-input" type="text" maxlength="90"
             placeholder="${t('orc.placeholder')}" aria-label="${t('orc.inputAria')}"/>
      <button class="obj-btn" id="orc-go" type="button">${t('orc.go')}</button>
    </div>
    <p class="orc-out" id="orc-out">${t('orc.asked', { n: 0 })}</p>
    <p class="orc-source">${t('orc.source')}</p>
    <p class="trl-credits">${t('orc.credits')}</p>
    <a class="plate" href="https://www.youtube.com/watch?v=mqAf5lOJZew" target="_blank" rel="noopener">
      ${t('orc.plate1')} ${svgArrow}</a>
    <a class="plate" href="https://www.lektorium.tv/course/22939" target="_blank" rel="noopener">
      ${t('orc.plate2')} ${svgArrow}</a>
  </div>`;
}

export function mountOracle(root: HTMLElement): void {
  const host = root.querySelector('#oracle') as HTMLElement | null;
  if (!host) return;
  const answer = host.querySelector('#orc-answer') as HTMLElement;
  const input = host.querySelector('#orc-input') as HTMLInputElement;
  const out = host.querySelector('#orc-out') as HTMLElement;
  const go = host.querySelector('#orc-go') as HTMLButtonElement;
  let asked = 0;

  mountEmbed(host, FILM);

  const hit = (): void => {
    if (reducedMotion()) return;
    host.classList.add('cut');
    later(() => host.classList.remove('cut'), 220);
  };

  const ask = (): void => {
    const q = input.value.trim();
    if (!q) {
      answer.textContent = t('orc.empty');
      hit();
      return;
    }
    asked += 1;
    answer.textContent = ANSWERS[(asked - 1) % ANSWERS.length];
    hit();
    out.textContent = asked < 3 ? t('orc.asked', { n: asked }) : t('orc.theorem', { n: asked });
    input.value = '';
  };

  go.addEventListener('click', ask);
  input.addEventListener('keydown', (ev) => {
    if ((ev as KeyboardEvent).key === 'Enter') ask();
  });
}
