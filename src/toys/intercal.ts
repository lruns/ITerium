// INTERCAL: politeness as a compile condition. The rule is real, not invented.
// Fewer than a fifth of the statements marked PLEASE and the compiler complains
// about rudeness; more than a third and it complains about grovelling. The
// ICL079I and ICL099I errors exist in C-INTERCAL. The reference is linked on the
// exhibit's plaque.

import { intercalProgram } from '../data';
import { svgArrow } from '../chrome';
import { t } from '../i18n';

const N = intercalProgram.length;
const MIN = Math.ceil(N / 5); // below a fifth: "insufficiently polite"
const MAX = Math.floor(N / 3); // above a third: "overly polite"

export function intercalHtml(): string {
  const lines = intercalProgram
    .map(
      (l, i) =>
        `<button class="icl-line" type="button" data-i="${i}" aria-pressed="false">` +
        `<span class="icl-n">${String(i + 1).padStart(2, '0')}</span>` +
        `<span class="icl-please"></span><span class="icl-code">${l}</span></button>`,
    )
    .join('');
  return `<div class="obj mid toy reveal" id="icl">
    <div class="obj-title">$ ick hello.i</div>
    <p class="icl-lead">${t('icl.lead')}</p>
    <div class="icl-code-box">${lines}</div>
    <div class="icl-bar">
      <span>PLEASE: <b id="icl-count">0</b> ${t('icl.of')} ${N}</span>
      <span class="icl-window">${t('icl.window', { min: MIN, max: MAX })}</span>
      <span class="icl-spacer"></span>
      <button class="obj-btn small" id="icl-minus" type="button">− PLEASE</button>
      <button class="obj-btn small" id="icl-plus" type="button">+ PLEASE</button>
      <button class="obj-btn" id="icl-run" type="button">run</button>
    </div>
    <pre class="icl-out" id="icl-out">$ _</pre>
    <a class="plate" href="https://esolangs.org/wiki/INTERCAL" target="_blank" rel="noopener">
      ${t('eso.exists')} ${svgArrow}</a>
  </div>`;
}

export function mountIntercal(root: HTMLElement): void {
  const host = root.querySelector('#icl') as HTMLElement | null;
  if (!host) return;
  const out = root.querySelector('#icl-out') as HTMLElement;
  const countEl = root.querySelector('#icl-count') as HTMLElement;
  const lines = Array.from(host.querySelectorAll('.icl-line')) as HTMLElement[];
  const polite: boolean[] = intercalProgram.map(() => false);

  const paint = (): void => {
    let n = 0;
    lines.forEach((el, i) => {
      const p = polite[i];
      if (p) n += 1;
      el.classList.toggle('on', p);
      el.setAttribute('aria-pressed', p ? 'true' : 'false');
      const slot = el.querySelector('.icl-please') as HTMLElement;
      slot.textContent = p ? 'PLEASE ' : '';
    });
    countEl.textContent = String(n);
    host.classList.toggle('rude', n < MIN);
    host.classList.toggle('smarmy', n > MAX);
  };

  const count = (): number => polite.filter(Boolean).length;

  const run = (): void => {
    const n = count();
    if (n < MIN) {
      out.textContent =
        'ICL079I PROGRAMMER IS INSUFFICIENTLY POLITE\n' +
        '        ON THE WAY TO STATEMENT 0001\n' +
        '        CORRECT SOURCE AND RESUBMIT';
      out.className = 'icl-out err';
      return;
    }
    if (n > MAX) {
      out.textContent =
        'ICL099I PROGRAMMER IS OVERLY POLITE\n' +
        '        ON THE WAY TO STATEMENT 0001\n' +
        '        CORRECT SOURCE AND RESUBMIT';
      out.className = 'icl-out err';
      return;
    }
    out.textContent = t('icl.ok');
    out.className = 'icl-out ok';
  };

  lines.forEach((el, i) => {
    el.addEventListener('click', () => {
      polite[i] = !polite[i];
      paint();
    });
  });

  const plus = root.querySelector('#icl-plus') as HTMLButtonElement | null;
  const minus = root.querySelector('#icl-minus') as HTMLButtonElement | null;
  const runBtn = root.querySelector('#icl-run') as HTMLButtonElement | null;
  if (plus) {
    plus.addEventListener('click', () => {
      const i = polite.indexOf(false);
      if (i >= 0) polite[i] = true;
      paint();
    });
  }
  if (minus) {
    minus.addEventListener('click', () => {
      const i = polite.lastIndexOf(true);
      if (i >= 0) polite[i] = false;
      paint();
    });
  }
  if (runBtn) runBtn.addEventListener('click', run);
  paint();
}
