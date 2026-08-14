// Terminal entry. One buffer, modeline at the bottom, and the path menu right
// HERE, like in a CLI game: arrows, digits, mouse.

import { entryLines, menuFootnote, menuItems } from './data';
import { langSwitchHtml, mountLangSwitch, t } from './i18n';
import { later, onCleanup, reducedMotion, ruleLine } from './runtime';
import { clownTransition, portalTransition } from './transitions';

// ASCII banner shown at the top of the terminal buffer.
const BANNER = String.raw`
  _  _____ ___ ___ ___ _   _ __  __
 | ||_   _| __| _ \_ _| | | |  \/  |
 | |  | | | _||   /| || |_| | |\/| |
 |_|  |_| |___|_|_\___|\___/|_|  |_|
        L r u n s   ·   I T e r i u m
`;

// Museum facade with the guide animal at the door. Drawn line by line, the way
// terminal AIs render ASCII art.
const MUSEUM = String.raw`                 ________________
                /                \
               /__________________\
               |  ||  ||  ||  ||  |
    /\_/\      |  ||  ||  ||  ||  |
   ( o.o )     |__||__||__||__||__|
    > ^ <     '===================='
   /(   )\      L r u n s · ITerium
  (__)_(__)`;

// Top mini-window, modelled on the file-local-variables line in Emacs.
const MINI = (): string =>
  ';; -*- mode: iterium; coding: utf-8 -*-\n' + `${t('term.mini')}\n` + '> M-x iterium RET';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Line-by-line ASCII art reveal — the way terminal AIs draw. */
function drawArt(host: HTMLElement, art: string, onDone?: () => void): () => void {
  const lines = art.split('\n');
  if (reducedMotion()) {
    host.innerHTML = lines.map((l) => `<span class="ln">${esc(l)}\n</span>`).join('');
    if (onDone) onDone();
    return () => undefined;
  }
  host.innerHTML = '';
  let i = 0;
  let finished = false;
  const finish = (): void => {
    if (finished) return;
    finished = true;
    host.innerHTML = lines.map((l) => `<span class="ln shown">${esc(l)}\n</span>`).join('');
    if (onDone) onDone();
  };
  const step = (): void => {
    if (i >= lines.length) {
      finish();
      return;
    }
    host.insertAdjacentHTML('beforeend', `<span class="ln">${esc(lines[i])}\n</span>`);
    i += 1;
    later(step, 70);
  };
  step();
  return finish;
}

function modeline(buffer: string, right: string): string {
  return `
  <div class="modeline" aria-hidden="true">
    <span class="ml-flags">-UUU:**-</span>
    <span class="ml-buf">F1&nbsp; ${buffer}</span>
    <span class="ml-pos" id="ml-pos">All</span>
    <span class="ml-mode">${right}</span>
    <span class="ml-tail">${'-'.repeat(200)}</span>
  </div>`;
}

function menuHtml(): string {
  const rows = menuItems
    .map(
      (m, i) => `
      <li class="mi${m.ready ? '' : ' locked'}" data-i="${i}" data-id="${m.id}" role="option"
          aria-selected="false" aria-disabled="${m.ready ? 'false' : 'true'}" tabindex="-1">
        <span class="mi-cur">&gt;</span><span class="mi-key">${m.key}</span><span
        class="mi-label">${m.label}</span><span class="mi-note">${m.note}</span>
      </li>`,
    )
    .join('');
  const head = entryLines.slice(0, 4).join('\n');
  const art = MUSEUM.split('\n')
    .map((l) => `<span class="ln shown">${esc(l)}\n</span>`)
    .join('');
  return `
    <pre class="boot done">${head}</pre>
    <pre class="museum" aria-hidden="true">${art}</pre>
    <p class="menu-title">$ choose path:<span class="cur"></span></p>
    <ul class="menu" id="menu" role="listbox" aria-label="${t('term.menuAria')}" tabindex="0">${rows}</ul>
    <p class="menu-foot">${menuFootnote}</p>
    <pre class="term-log" id="term-log"></pre>
    <p class="menu-hint">${t('term.menuHint')}</p>`;
}

/**
 * The terminal is not a window on a page but an OBJECT: a CRT monitor on a stand
 * in the middle of an endless dark room — chamfered case, curved glass, glare,
 * reflection on the floor. The screen inside is the same buffer.
 */
function shell(inner: string, right: string, cta = '', foot = ''): string {
  return `
    <div class="void" id="void">
      <div class="void-stars" aria-hidden="true"></div>
      <div class="void-glow" aria-hidden="true"></div>
      <div class="horizon" aria-hidden="true"><div class="grid"></div></div>
      <div class="breath" aria-hidden="true"></div>
      <div class="crt-scene">
        <div class="crt" id="crt">
          <div class="crt-case">
            <div class="crt-glass">
              <div class="editor" id="editor">
                <div class="scanlines" aria-hidden="true"></div>
                <pre class="banner" aria-hidden="true">${BANNER}</pre>
                <pre class="mini" aria-hidden="true">${MINI()}</pre>
                ${ruleLine()}
                <div class="buffer">
                  <div class="stage" id="stage">${inner}</div>
                </div>
                ${cta}
                ${modeline('iterium.term', right)}
              </div>
              <div class="glass-curve" aria-hidden="true"></div>
              <div class="glass-glare" aria-hidden="true"></div>
            </div>
            <div class="crt-plate" aria-hidden="true">
              <span class="crt-brand">L r u n s &middot; ITerium</span>
              <span class="crt-led"></span>
            </div>
          </div>
          <div class="crt-neck" aria-hidden="true"></div>
          <div class="crt-foot" aria-hidden="true"></div>
        </div>
        <div class="crt-pool" aria-hidden="true"></div>
        <div class="crt-mirror" aria-hidden="true"></div>
      </div>
      <div class="vignette" aria-hidden="true"></div>
      ${langSwitchHtml()}
      ${foot}
    </div>`;
}

/** The monitor is slightly alive: it tilts after the mouse (still under reduced motion). */
function liveTilt(scene: HTMLElement | null, crt: HTMLElement | null): void {
  if (!scene || !crt || reducedMotion()) return;
  const onMove = (ev: PointerEvent): void => {
    const nx = (ev.clientX / window.innerWidth - 0.5) * 2;
    const ny = (ev.clientY / window.innerHeight - 0.5) * 2;
    crt.style.setProperty('--ry', `${(nx * 3.4).toFixed(2)}deg`);
    crt.style.setProperty('--rx', `${(2.6 - ny * 2.2).toFixed(2)}deg`);
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  onCleanup(() => window.removeEventListener('pointermove', onMove));
}

/** Boot screen: greeting types itself, but the door is open from the first frame. */
export function renderBoot(app: HTMLElement): void {
  // The invitation must not wait for the animation: the first live visitors could
  // not tell there was anything to press.
  const tail = entryLines[entryLines.length - 1].replace(/_\s*$/, '').trim();
  app.className = 'screen-term screen-boot';
  app.innerHTML = shell(
    `<pre class="boot" id="boot"></pre>
     <pre class="museum" id="museum" aria-hidden="true"></pre>`,
    '(Museum · Boot)',
    `<p class="term-cta" id="cta">${t('term.cta', { tail: esc(tail) })}<span class="cur"></span></p>`,
  );
  const out = app.querySelector('#boot') as HTMLPreElement;
  const art = app.querySelector('#museum') as HTMLPreElement;
  const cta = app.querySelector('#cta') as HTMLElement;

  const text = entryLines.slice(0, 4);
  let li = 0;
  let ci = 0;
  let done = false;
  let skipArt: (() => void) | null = null;

  const showPrompt = (): void => {
    done = true;
    cta.classList.add('ready');
  };
  const finish = (): void => {
    if (done) return;
    out.textContent = text.join('\n');
    if (skipArt) skipArt();
    else art.innerHTML = MUSEUM.split('\n').map((l) => `<span class="ln shown">${esc(l)}\n</span>`).join('');
    showPrompt();
  };
  const tick = (): void => {
    if (li >= text.length) {
      skipArt = drawArt(art, MUSEUM, showPrompt);
      return;
    }
    const line = text[li];
    if (ci <= line.length) {
      const before = text.slice(0, li).join('\n');
      out.textContent = (before ? `${before}\n` : '') + line.slice(0, ci);
      ci += 1;
      later(tick, 10);
    } else {
      li += 1;
      ci = 0;
      later(tick, 60);
    }
  };
  if (reducedMotion()) finish();
  else tick();

  // ONE action moves you forward. Before, the first press only skipped the
  // animation and a second one was needed to enter — visitors never guessed that.
  // Whoever wants to watch the boot simply does not touch anything.
  let left = false;
  const enter = (): void => {
    if (left) return;
    left = true;
    finish();
    location.hash = '#menu';
  };
  const onKey = (ev: KeyboardEvent): void => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      enter();
    }
  };
  document.addEventListener('keydown', onKey);
  // The whole dark room is the button, not just the glass: on a phone the screen
  // is small and the void around the monitor is most of what the thumb can reach.
  const room = app.querySelector('#void') as HTMLElement;
  room.addEventListener('click', enter);
  onCleanup(() => document.removeEventListener('keydown', onKey));
  liveTilt(app.querySelector('.crt-scene'), app.querySelector('#crt'));
  mountLangSwitch(app);
}

/** Same terminal — but the buffer now holds the hall menu. */
export function renderMenu(app: HTMLElement): void {
  app.className = 'screen-term';
  // The menu screen carries no footnote: it lives in the hall footer, next to the
  // cards it is about.
  app.innerHTML = shell(menuHtml(), '(Museum · Menu)');
  const editor = app.querySelector('#editor') as HTMLElement;
  const stage = app.querySelector('#stage') as HTMLElement;
  const list = app.querySelector('#menu') as HTMLElement;
  const log = app.querySelector('#term-log') as HTMLPreElement;
  const rows = Array.from(list.querySelectorAll('.mi')) as HTMLElement[];

  let cur = 0;
  let busy = false;

  const paint = (): void => {
    rows.forEach((r, i) => {
      r.classList.toggle('on', i === cur);
      r.setAttribute('aria-selected', i === cur ? 'true' : 'false');
    });
  };
  const move = (d: number): void => {
    cur = (cur + d + rows.length) % rows.length;
    paint();
  };
  const choose = (i: number): void => {
    if (busy) return;
    cur = i;
    paint();
    const item = menuItems[i];
    if (!item.ready) {
      // NOTE: the hint is derived from the MENU rather than hard-coded, so when a
      // locked room opens the message starts listing it automatically.
      const open = menuItems.filter((m) => m.ready).map((m) => m.key);
      const where =
        open.length > 1
          ? t('term.tryOpen', { list: open.slice(0, -1).join(', '), last: open[open.length - 1] })
          : t('term.onlyOpen', { key: open[0] });
      log.textContent = t('term.locked', { label: item.label, where });
      list.classList.remove('shake');
      void list.offsetWidth;
      list.classList.add('shake');
      return;
    }
    busy = true;
    log.textContent = `$ cd /iterium/${item.id}`;
    if (item.id === 'humor') {
      clownTransition(stage, app, () => {
        location.hash = '#humor';
      });
    } else {
      portalTransition(app, editor, () => {
        location.hash = '#art';
      });
    }
  };

  const onKey = (ev: KeyboardEvent): void => {
    if (busy) return;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight' || ev.key === 'j') {
      ev.preventDefault();
      move(1);
    } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft' || ev.key === 'k') {
      ev.preventDefault();
      move(-1);
    } else if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      choose(cur);
    } else if (ev.key === 'Escape') {
      location.hash = '';
    } else {
      const n = menuItems.findIndex((m) => m.key === ev.key);
      if (n >= 0) {
        ev.preventDefault();
        choose(n);
      }
    }
  };
  document.addEventListener('keydown', onKey);
  onCleanup(() => document.removeEventListener('keydown', onKey));

  rows.forEach((r, i) => {
    r.addEventListener('mouseenter', () => {
      if (!busy) {
        cur = i;
        paint();
      }
    });
    r.addEventListener('click', () => choose(i));
  });
  paint();
  list.focus({ preventScroll: true });
  liveTilt(app.querySelector('.crt-scene'), app.querySelector('#crt'));
  mountLangSwitch(app);

  if (!reducedMotion()) {
    rows.forEach((r, i) => {
      r.style.setProperty('--d', `${i * 70}ms`);
      r.classList.add('fade-in');
    });
  }
}
