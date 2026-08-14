// Magic zone: a dark section where esoteric languages are presented as playable
// exhibits instead of static reference cards. Every language shown here really
// exists; each stand carries a quiet link to its public reference page.

import { audioOnGesture, sigmaMotif, speakSigma } from '../audio';
import { plaqueHtml, svgArrow } from '../chrome';
import { esoLangs, humorExhibits } from '../data';
import { t, tl } from '../i18n';
import { reducedMotion, stepEngine } from '../runtime';
import { intercalHtml, mountIntercal } from './intercal';
import { mountStrangeLangs, strangeLangsHtml } from './strange-langs';

/** Look up an exhibit source by id and render its plaque next to its own stand. */
function plaque(id: string, why: string): string {
  const e = humorExhibits.find((x) => x.id === id);
  return e ? plaqueHtml(e, why) : '';
}

const FLOORS = tl('floors');

/**
 * Full snapshot of everything visible in the zone, not just a couple of counters.
 * IMPORTANT: the Backrooms corridor state lives in `pos` and `holes`. An earlier
 * version stored only `sigma` and `floor`, so restoring a previous state changed
 * nothing on screen — floor label, holes, spell text and output all stayed at
 * their current values and the rollback button looked dead.
 */
interface Snapshot {
  sigma: number;
  spell: string;
  spellOut: string;
  floor: number;
  pos: number;
  holes: boolean[];
  broken: boolean;
  roomsOut: string;
  said: string;
}

function langBy(name: string): { url: string; truth: string } {
  const l = esoLangs.find((x) => x.name.indexOf(name) === 0);
  return l ? { url: l.url, truth: l.truth } : { url: 'https://esolangs.org/', truth: '' };
}

function whisper(name: string, text: string): string {
  const l = langBy(name);
  return `<a class="whisper" href="${l.url}" target="_blank" rel="noopener">
    <b>${name}</b> ${text} <span class="whisper-link">${t('magic.exists')} ${svgArrow}</span></a>`;
}

export function magicZoneHtml(): string {
  const genalpha = langBy('GenAlpha');
  const backrooms = langBy('Backrooms');
  const five = langBy('5D');
  return `<section class="magic reveal" id="magic">
    <div class="magic-dark" aria-hidden="true"></div>
    <div class="magic-glyphs" aria-hidden="true"></div>
    <div class="magic-body">
      <p class="magic-lead">${t('magic.lead')}</p>
      <h2 class="magic-title">${t('magic.title')}<span class="cur"></span></h2>
      <p class="magic-sub">${t('magic.sub')}</p>

      <div class="magic-grid">
        <div class="spell toy" id="genalpha">
          <div class="obj-title">${t('magic.spellTitle')}</div>
          <pre class="spell-code" id="spell-code"></pre>
          <div class="spell-row">
            <button class="obj-btn small" id="spell-sigma" type="button">Sigma</button>
            <button class="obj-btn" id="spell-run" type="button">${t('magic.spellRun')}</button>
          </div>
          <p class="spell-out" id="spell-out">${t('magic.spellIdle')}</p>
          <p class="spell-sing" id="spell-sing" aria-live="polite"></p>
          <a class="whisper-link solo" href="${genalpha.url}" target="_blank" rel="noopener">
            ${t('eso.exists')} ${svgArrow}</a>

          <div class="sigma-plate" id="sigma-plate">
            <b class="sigma-plate-head">${t('magic.sigmaHead')}</b>
            <p class="sigma-fact">${t('magic.sigmaFact')}</p>
            <blockquote class="sigma-quote">
              Understanding: 0% / Vibing: 0% / Trauma: 100%
              <cite>${t('magic.sigmaCite')}</cite>
            </blockquote>
          </div>

          <div class="plaques">
            ${plaque('sigma-boy', t('magic.why.sigma'))}
          </div>
        </div>

        <div class="rooms toy" id="backrooms">
          <div class="obj-title">${t('magic.roomsTitle')}</div>
          <div class="rooms-floor" id="rooms-floor"></div>
          <div class="rooms-row">
            <span class="rooms-level" id="rooms-level">${FLOORS[0]}</span>
            <button class="obj-btn small" data-step="-1" type="button">←</button>
            <button class="obj-btn small" data-step="1" type="button">→</button>
            <button class="obj-btn small" id="rooms-reset" type="button">${t('magic.roomsReset')}</button>
          </div>
          <p class="rooms-out" id="rooms-out">${t('magic.roomsIdle')}</p>
          <a class="whisper-link solo" href="${backrooms.url}" target="_blank" rel="noopener">
            ${t('eso.exists')} ${svgArrow}</a>
        </div>
      </div>

      ${intercalHtml()}

      <div class="plaques">
        ${plaque('kai-eso', t('magic.why.tone'))}
      </div>

      <div class="verse toy" id="fived">
        <div class="obj-title">5D Brainfuck With Multiverse Time Travel</div>
        <p class="verse-text" id="verse-text">${t('magic.verseIdle')}</p>
        <button class="obj-btn" id="verse-back" type="button">${t('magic.verseBack')}</button>
        <a class="whisper-link solo" href="${five.url}" target="_blank" rel="noopener">
          ${t('eso.exists')} ${svgArrow}</a>
      </div>

      <div class="whispers">
        ${whisper('SickPig', t('magic.whisper.SickPig'))}
        ${whisper('FALSE', t('magic.whisper.FALSE'))}
      </div>

      ${strangeLangsHtml()}

      <div class="plaques wide">
        ${plaque('brevno', t('magic.why.strange'))}
        ${plaque('ardens', t('magic.why.ran'))}
      </div>
    </div>
  </section>`;
}

/** Drifting glyphs so the dark background reads as alive rather than flat black. */
function mountGlyphs(root: HTMLElement): void {
  const host = root.querySelector('.magic-glyphs') as HTMLElement | null;
  if (!host) return;
  const chars = '⊹∴◇∷⌁⌇⍚⎔⏣░▚▞◈✶+·';
  let html = '';
  for (let i = 0; i < 34; i += 1) {
    const x = Math.round(Math.random() * 100);
    const y = Math.round(Math.random() * 100);
    const s = (0.6 + Math.random() * 1.5).toFixed(2);
    const d = (Math.random() * 9).toFixed(1);
    html += `<i style="left:${x}%;top:${y}%;--s:${s};--d:${d}s">${chars[i % chars.length]}</i>`;
  }
  host.innerHTML = html;
  if (reducedMotion()) host.classList.add('still');
}

export function mountMagicZone(root: HTMLElement): void {
  const zone = root.querySelector('#magic') as HTMLElement | null;
  if (!zone) return;
  mountGlyphs(zone);
  mountIntercal(root);
  mountStrangeLangs(zone);

  const history: Snapshot[] = [];
  let sigma = 0;
  let floor = 0;
  let pos = 2;

  // ---------- GenAlpha Lang: a run of Sigma statements terminated by Skibidi ----------
  const code = zone.querySelector('#spell-code') as HTMLElement;
  const out = zone.querySelector('#spell-out') as HTMLElement;
  const sing = zone.querySelector('#spell-sing') as HTMLElement | null;
  const paintSpell = (): void => {
    code.textContent = sigma
      ? `${Array(sigma).fill('Sigma').join(' ')}${sigma ? ' …' : ''}`
      : t('magic.spellEmpty');
  };
  /**
   * Take a full snapshot BEFORE an action. Values are read from the DOM rather
   * than from local variables, so the snapshot cannot drift from what is on screen.
   */
  const snap = (said: string): void => {
    const t = (sel: string): string => {
      const n = zone.querySelector(sel) as HTMLElement | null;
      return n ? n.textContent || '' : '';
    };
    history.push({
      sigma,
      spell: t('#spell-code'),
      spellOut: t('#spell-out'),
      floor,
      pos,
      holes: holes.slice(),
      broken: zone.classList.contains('broken'),
      roomsOut: t('#rooms-out'),
      said,
    });
    if (history.length > 24) history.shift();
  };
  paintSpell();

  const sigmaBtn = zone.querySelector('#spell-sigma') as HTMLButtonElement | null;
  if (sigmaBtn) {
    sigmaBtn.addEventListener('click', () => {
      snap(t('magic.spellSaid', { n: sigma }));
      sigma += 1;
      paintSpell();
      out.textContent = t('magic.spellMore', { n: sigma });
    });
  }
  const runBtn = zone.querySelector('#spell-run') as HTMLButtonElement | null;
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      snap(t('magic.spellSaid', { n: sigma }));
      code.textContent = sigma
        ? `${Array(sigma).fill('Sigma').join(' ')} Skibidi`
        : 'Skibidi';
      out.textContent = sigma
        ? t('magic.spellOut', { n: sigma })
        : t('magic.spellOutZero');
      zone.classList.add('cast');
      window.setTimeout(() => zone.classList.remove('cast'), 700);
      sigma = 0;
      /**
       * When the program runs, the terminal sings it. The voice is the browser's
       * own speechSynthesis (local, no network); the fallback is a four-note
       * synthesized motif. No audio from the original track is used — it is only
       * linked. Sound is started inside the click handler, never on load.
       */
      // The motif always plays (synthesized locally), and the voice is layered on
      // top only if the system has speech voices, so the exhibit is never mute.
      if (sing) sing.textContent = t('magic.spellSing');
      const a = audioOnGesture();
      if (a) sigmaMotif(a);
      speakSigma();
    });
  }

  // ---------- Backrooms: no errors — stepping on a hole drops you a floor ----------
  const floorEl = zone.querySelector('#rooms-floor') as HTMLElement;
  const levelEl = zone.querySelector('#rooms-level') as HTMLElement;
  const roomsOut = zone.querySelector('#rooms-out') as HTMLElement;
  const engine = stepEngine();
  let holes: boolean[] = [];

  const makeFloor = (): void => {
    holes = [];
    for (let i = 0; i < 11; i += 1) holes.push(i > 1 && Math.random() < 0.34);
  };
  const paintRooms = (): void => {
    floorEl.innerHTML = holes
      .map((hole, i) => {
        const cls = ['cell', hole ? 'hole' : '', i === pos ? 'here' : ''].filter(Boolean).join(' ');
        return `<i class="${cls}">${i === pos ? '@' : hole ? ' ' : '·'}</i>`;
      })
      .join('');
    levelEl.textContent = FLOORS[Math.min(floor, FLOORS.length - 1)];
  };
  const resetRooms = (): void => {
    floor = 0;
    pos = 2;
    makeFloor();
    paintRooms();
    zone.classList.remove('broken');
    roomsOut.textContent = t('magic.roomsIdle');
  };
  const fall = (): void => {
    floor += 1;
    zone.classList.add('falling');
    engine.next(() => {
      zone.classList.remove('falling');
      if (floor >= FLOORS.length) {
        zone.classList.add('broken');
        roomsOut.textContent = t('magic.roomsEnd');
        paintRooms();
        return;
      }
      makeFloor();
      pos = Math.max(0, pos - 1);
      paintRooms();
      roomsOut.textContent = t('magic.roomsFall');
    }, 420);
  };
  const step = (d: number): void => {
    if (floor >= FLOORS.length) return;
    snap(t('magic.roomsSaid', { floor: FLOORS[Math.min(floor, FLOORS.length - 1)], pos }));
    pos = Math.max(0, Math.min(holes.length - 1, pos + d));
    paintRooms();
    if (holes[pos]) {
      fall();
      return;
    }
    roomsOut.textContent = t('magic.roomsWalk');
  };
  zone.querySelectorAll('[data-step]').forEach((b) => {
    b.addEventListener('click', () => step(Number((b as HTMLElement).dataset.step)));
  });
  const rreset = zone.querySelector('#rooms-reset') as HTMLButtonElement | null;
  if (rreset) rreset.addEventListener('click', resetRooms);
  resetRooms();

  // ---------- 5D: roll back to the previous recorded program state ----------
  const verse = zone.querySelector('#verse-text') as HTMLElement;
  let universe = 0;
  const back = zone.querySelector('#verse-back') as HTMLButtonElement | null;
  if (back) {
    back.addEventListener('click', () => {
      const prev = history.pop();
      if (!prev) {
        // NOTE: the copy must not point "to the left" — the zone is a single column.
        verse.textContent = t('magic.verseNone');
        return;
      }
      universe -= 1;
      // Restore everything that was captured: local state and the visible DOM.
      sigma = prev.sigma;
      floor = prev.floor;
      pos = prev.pos;
      holes = prev.holes.slice();
      code.textContent = prev.spell;
      out.textContent = prev.spellOut;
      roomsOut.textContent = prev.roomsOut;
      zone.classList.toggle('broken', prev.broken);
      engine.stop(); // cancel a fall animation still in flight from the old state
      zone.classList.remove('falling');
      paintRooms();
      zone.classList.add('warp');
      window.setTimeout(() => zone.classList.remove('warp'), 620);
      verse.textContent = t('magic.verseWarp', { u: universe, said: prev.said });
    });
  }
}
