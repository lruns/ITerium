// Beauty room. Layout rules:
// - scrolling CARRIES the viewer from station to station, rotating them around the
//   DNA rope (one snap stop = one station AND its sources in the same frame);
// - sources are CLUSTERED AROUND their own station instead of scattered along the spiral;
// - the scene changes thematically: graph links in the sky, detection boxes for the
//   vision station, a ruled grid for the calendar, ink tails for the ink station;
// - stations are INTERACTIVE, not just something to look at;
// - the summit is a pixel-art poster that resolves into a photograph;
// - a "by station / free flight" toggle;
// - the surrounding void is populated with drifting glyphs, distant shadow cards and
//   faint rope turns.
// Cards live in CSS3D, so they remain real links to their authors.

import { authorChipHtml, backBtn, cardHtml, modeline, mountAuthorChips, startAtBottom } from './chrome';
import { artExhibits, type Exhibit } from './data';
import { langSwitchHtml, mountLangSwitch, t } from './i18n';
import { liveModeline, onCleanup, onScroll, reducedMotion, revealOnScroll } from './runtime';
import { startSpiral3D, type RopeMood } from './spiral3d';
import { startStars, type SkyScene } from './stars';
import { startPixelSky } from './toys/pixel-sky';
import {
  calendarHtml,
  graphHtml,
  inkHtml,
  mountCalendar,
  mountGraph,
  mountInk,
  mountVision,
  visionHtml,
} from './toys/art-toys';

const STATIONS = [inkHtml(), calendarHtml(), visionHtml(), graphHtml()];

/** Which sky scene belongs to which station (see stars.ts). */
const SCENES: SkyScene[] = ['ink', 'cal', 'vision', 'graph'];

/**
 * ROPE MOOD PER STATION. The environment changes AS A WHOLE — sky, background and
 * the DNA rope share one mood — while the construction stays the same:
 *  - ink: the warm strand is thicker and softer, rungs breathe slowly like wet ink;
 *  - calendar: both strands yellow toward paper, rungs are even and frequent like a grid;
 *  - vision: the strand shifts to the red of a detection signal, rungs blink;
 *  - graph: the digital strand brightens, rungs pulse fast like active links.
 */
const MOODS: RopeMood[] = [
  { warm: '#ffb26c', cold: '#8df5e8', glow: 0.2, rung: 0.3, pulse: 0.07, rate: 0.0004 },
  { warm: '#ffd08a', cold: '#bfe6ff', glow: 0.13, rung: 0.5, pulse: 0.02, rate: 0.0002 },
  { warm: '#ff9a72', cold: '#9fdcff', glow: 0.16, rung: 0.24, pulse: 0.13, rate: 0.0016 },
  { warm: '#ffc48c', cold: '#7ff5e0', glow: 0.22, rung: 0.44, pulse: 0.1, rate: 0.0011 },
];

/**
 * WHICH SOURCE BELONGS TO WHICH STATION. No card is dropped — each one is assigned
 * to the stand it relates to:
 *  - ink      — the living-calligraphy piece (@manmothma);
 *  - calendar — @jordan.gladman's pieces (the meetings parrot and [redacted]);
 *  - vision   — @drezzdon (detection boxes reading poetry) and @archivsieben
 *               (an interface treated as landscape);
 *  - graph    — Switch Angel (live code spawning links) and @coolacloy (the summit sky).
 */
const CLUSTERS: string[][] = [
  ['glyphs'],
  ['calendar', 'redacted'],
  ['vision', 'win95'],
  ['trance', 'sky'],
];

const MOTES = ['·', '∴', '0', '1', '⌁', '+', '◇', '/', '*', '⍚', '·', '∷'];

function panel(html: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'card3d station3d';
  el.innerHTML = html;
  return el;
}

function satCard(e: Exhibit, i: number, total: number): HTMLElement {
  const el = document.createElement('div');
  el.className = `card3d sat o-${e.orient}`;
  el.innerHTML = cardHtml(e, i, total, 'art');
  return el;
}

/** Satellites grouped by station. Card order does not matter, assignment does. */
function clusters(): HTMLElement[][] {
  const total = artExhibits.length;
  return CLUSTERS.map((ids) =>
    ids
      .map((id) => {
        const e = artExhibits.find((x) => x.id === id);
        return e ? satCard(e, artExhibits.indexOf(e), total) : null;
      })
      .filter((x): x is HTMLElement => x !== null),
  );
}

/** Drifting motes: the darkness between stations should not read as flat black. */
function motesHtml(): string {
  let out = '';
  for (let i = 0; i < 40; i += 1) {
    const x = (7 + ((i * 37) % 86)).toFixed(1);
    const y = (4 + ((i * 53) % 92)).toFixed(1);
    const s = (0.6 + ((i * 17) % 9) / 7).toFixed(2);
    const d = ((i * 13) % 11).toFixed(1);
    out += `<i style="left:${x}%;top:${y}%;--s:${s};--d:${d}s">${MOTES[i % MOTES.length]}</i>`;
  }
  return `<div class="art-motes" aria-hidden="true">${out}</div>`;
}

export function renderArt(app: HTMLElement): void {
  app.className = 'screen-art';

  const stops = STATIONS.map(() => '<div class="stop"></div>').join('');
  const toggle = `<button class="ml-toggle" id="ml-fly" type="button" aria-pressed="false">
      <span class="ml-toggle-dot" aria-hidden="true"></span><span id="ml-fly-label">${t('art.flyStations')}</span>
    </button>`;

  app.innerHTML = `
    ${backBtn()}
    <canvas id="stars" aria-hidden="true"></canvas>
    <div class="nebula" aria-hidden="true"></div>
    <div class="haze" aria-hidden="true"></div>
    ${motesHtml()}
    <canvas id="rope" aria-hidden="true"></canvas>
    <div id="stage3d"></div>
    <div class="art-flow">
      <section class="finale" id="finale">
        <div class="finale-sky" aria-hidden="true"></div>
        <canvas class="finale-pix" id="finale-pix" aria-hidden="true"></canvas>
        <div class="finale-body">
          <p class="finale-line">${t('art.finaleLine')}</p>
          <span class="finale-chip">${authorChipHtml(
            t('art.finaleChip'),
            'instagram',
            'https://www.instagram.com/reel/CvaIWgJut5d/',
            'https://www.instagram.com/coolacloy/',
          )}</span>
          <p class="epigraph small">${t('art.finaleSmall')}</p>
          <p class="curator">${t('humor.curator')}</p>
        </div>
      </section>
      <div class="spiral-space" id="spiral-space">${stops}</div>
      <header class="room-head reveal">
        <p class="cmd">$ cd /iterium/art</p>
        <h1>${t('art.title')}</h1>
        <p class="epigraph">${t('art.epigraph')}</p>
        <p class="scroll-hint up">${t('art.scrollHint')}</p>
      </header>
    </div>
    ${langSwitchHtml()}
    ${modeline('art.room', t('art.modeline'), toggle)}`;

  const sky = startStars(app.querySelector('#stars') as HTMLCanvasElement);
  revealOnScroll(Array.from(app.querySelectorAll('.reveal')), 90);
  liveModeline(app.querySelector('#ml-pos') as HTMLElement, null, true);

  // soft scroll snapping to stations, only in this room; the humor room scrolls freely
  document.documentElement.classList.add('snap');
  onCleanup(() => document.documentElement.classList.remove('snap'));

  const panels = STATIONS.map(panel);
  const spiral = startSpiral3D(
    app,
    app.querySelector('#rope') as HTMLCanvasElement,
    app.querySelector('#stage3d') as HTMLElement,
    app.querySelector('#spiral-space') as HTMLElement,
    panels,
    clusters(),
  );

  // stations are already in the document (attached by the CSS3D renderer): mount them
  mountInk(panels[0]);
  mountCalendar(panels[1]);
  mountVision(panels[2]);
  mountGraph(panels[3]);

  // each station swaps the WHOLE scene: sky, background AND the DNA rope, one mood
  spiral.onStation((i) => {
    const at = Math.max(0, Math.min(SCENES.length - 1, i));
    sky.scene(SCENES[at]);
    app.dataset.scene = SCENES[at];
    spiral.setMood(MOODS[at]);
  });

  // CARD ZOOM: zoom first, navigate second. A click on a satellite does NOT leave the
  // page; the card moves toward the camera, and only the zoomed state exposes the
  // "clip" and "author" links.
  mountAuthorChips(app);
  mountLangSwitch(app);
  let openCard: HTMLElement | null = null;
  const unfocus = (): void => {
    if (!openCard) return;
    openCard.classList.remove('focused');
    const holder = openCard.closest('.card3d') as HTMLElement | null;
    if (holder) holder.classList.remove('focused');
    openCard = null;
    app.classList.remove('focus-on');
    spiral.focus(null);
  };
  app.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement | null;
    if (!t) return;
    // real links must behave as links: do not intercept their clicks
    if (t.closest('.sat-actions a')) return;
    if (t.closest('.sat-close')) {
      unfocus();
      return;
    }
    const cover = t.closest('.cover.zoom');
    if (!cover) {
      // click outside a card releases the currently zoomed one
      if (!t.closest('.card.slide.focused')) unfocus();
      return;
    }
    const card = cover.closest('.card.slide') as HTMLElement | null;
    const holder = cover.closest('.card3d') as HTMLElement | null;
    if (!card || !holder) return;
    if (openCard === card) {
      unfocus();
      return;
    }
    unfocus();
    openCard = card;
    card.classList.add('focused');
    holder.classList.add('focused');
    app.classList.add('focus-on');
    spiral.focus(holder);
  });

  // TOGGLE: "by station" (scroll snapping) vs "free flight" (unconstrained scroll)
  const fly = app.querySelector('#ml-fly') as HTMLButtonElement | null;
  const flyLabel = app.querySelector('#ml-fly-label') as HTMLElement | null;
  if (fly) {
    let free = false;
    fly.addEventListener('click', () => {
      free = !free;
      fly.setAttribute('aria-pressed', String(free));
      fly.classList.toggle('on', free);
      if (flyLabel) flyLabel.textContent = free ? t('art.flyFree') : t('art.flyStations');
      document.documentElement.classList.toggle('snap', !free);
      spiral.setFree(free);
    });
  }

  // payoff at the top: the sky fills the screen, resolving from pixels into a frame
  const finale = app.querySelector('#finale') as HTMLElement | null;
  const pix = startPixelSky(app.querySelector('#finale-pix') as HTMLCanvasElement);
  if (finale) {
    onScroll(() => {
      // NOTE: deriving this from spiral progress made the whole pixel resolve happen
      // while the summit was still OFF screen. Derive it from the summit element
      // itself instead: the more of it is visible, the more the frame has resolved.
      const h = finale.offsetHeight || window.innerHeight;
      const y = Math.max(0, (window.scrollY || 0) - finale.offsetTop);
      const k = Math.max(0, Math.min(1, 1 - y / h));
      finale.style.setProperty('--k', k.toFixed(3));
      pix.set(k);
    });
  }

  if (reducedMotion()) app.classList.add('still');
  startAtBottom();
}
