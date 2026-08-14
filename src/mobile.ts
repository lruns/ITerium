// Mobile gate: the real mobile layout is not built yet.
// Until then a narrow screen gets a terminal plate instead of the room, with an
// honest offer to view the desktop layout. If the visitor agrees we swap the
// viewport to 1200px. Horizontal scrolling IS allowed in that mode — a deliberate
// choice by the visitor, the only exception to the no-hscroll rule.

import { langSwitchHtml, mountLangSwitch, t } from './i18n';

const SMALL = 700;
let forced = false;

/** The plate is drawn with characters and its words come from the dictionary, so each
    line is centred to the width of the frame. */
const PLATE = 15;

function plateLine(text: string): string {
  const s = text.length > PLATE ? text.slice(0, PLATE) : text;
  const left = Math.ceil((PLATE - s.length) / 2);
  return `|${' '.repeat(left)}${s}${' '.repeat(PLATE - s.length - left)}|`;
}

export function smallScreen(): boolean {
  return window.innerWidth < SMALL;
}

export function desktopForced(): boolean {
  return forced;
}

/** Plate instead of the room. `onGo` re-renders the screen in desktop mode. */
export function renderMobileGate(app: HTMLElement, room: 'humor' | 'art', onGo: () => void): void {
  const title = room === 'humor' ? 'jokes / humor' : 'art / beautiful';
  app.className = 'screen-gate';
  app.innerHTML = `
    <div class="void">
      <div class="void-stars" aria-hidden="true"></div>
      <div class="breath" aria-hidden="true"></div>
      <div class="gate">
        <pre class="gate-art" aria-hidden="true">  .---------------.
  |  []  []  []   |
  ${plateLine(t('mobile.art1'))}
  ${plateLine(t('mobile.art2'))}
  '---------------'
       /|     |\\</pre>
        <p class="cmd">$ cd /iterium/${room}</p>
        <h1>${title}</h1>
        <p class="gate-note">${t('mobile.note')}</p>
        <button class="obj-btn" id="gate-go" type="button">${t('mobile.go')}</button>
        <p class="gate-warn">${t('mobile.warn')}</p>
        <a class="gate-back" href="#menu">&lt; cd .. ${t('mobile.back')}</a>
      </div>
      ${langSwitchHtml()}
    </div>`;
  mountLangSwitch(app);
  const btn = app.querySelector('#gate-go') as HTMLButtonElement | null;
  if (btn) {
    btn.addEventListener('click', () => {
      forced = true;
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) meta.setAttribute('content', 'width=1200');
      onGo();
    });
  }
}
