// Mobile gate: the real mobile layout is not built yet.
// Until then a narrow screen gets a terminal plate instead of the room, with an
// honest offer to view the desktop layout. If the visitor agrees we swap the
// viewport to 1200px. Horizontal scrolling IS allowed in that mode — a deliberate
// choice by the visitor, the only exception to the no-hscroll rule.

const SMALL = 700;
let forced = false;

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
  |   мобильный   |
  |  зал строится |
  '---------------'
       /|     |\\</pre>
        <p class="cmd">$ cd /iterium/${room}</p>
        <h1>${title}</h1>
        <p class="gate-note">
          зал уже есть, но он большой и объёмный — на маленьком экране пока
          разъезжается. мобильную версию собираем к 1.0.
        </p>
        <button class="obj-btn" id="gate-go" type="button">очень хочется — посмотреть как на компе</button>
        <p class="gate-warn">будет как на большом экране: мелко и с прокруткой вбок. так и задумано</p>
        <a class="gate-back" href="#menu">&lt; cd .. вернуться в терминал</a>
      </div>
    </div>`;
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
