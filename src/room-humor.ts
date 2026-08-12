// Jester room. Motion carries the meaning: this is a CLIMB along a path.
// The hall is a NARROW column (objects hug the trail) and the rhythm is uneven on
// purpose — a dense cluster, then a breath, then a dense cluster again. It also
// holds exhibits of its OWN: a living ADHD Sort, a sort that cheats, INTERCAL
// politeness and plates of real esoteric languages.

import { backBtn, modeline, plaqueHtml, reservedHtml, stand, startAtBottom } from './chrome';
import { asciiCharts, clownStill, humorExhibits, pathJokes, tickerLines, topRows } from './data';
import { liveModeline, onCleanup, onScroll, reducedMotion, revealOnScroll } from './runtime';
import { adhdSortHtml, mountAdhdSort } from './toys/adhd-sort';
import { capitalismHtml, mountCapitalism } from './toys/capitalism';
import { jsTruthHtml, mountJsTruth } from './toys/js-truth';
import { magicZoneHtml, mountMagicZone } from './toys/magic-zone';
import { meditationHtml, mountMeditation } from './toys/meditation';
import { mountRitual, ritualHtml } from './toys/ritual';
import { claudePlanHtml, mountClaudePlan } from './toys/claude-plan';
import { mountOracle, oracleHtml } from './toys/trailer';
import { mountWarrior, warriorHtml } from './toys/warrior';
import { diceVolumeHtml, mazeCaptchaHtml, mountDiceVolume, mountMazeCaptcha } from './toys/ux-more';
import { mountWorstUx, worstUxHtml } from './toys/worst-ux';

type Side = 'l' | 'c' | 'r';

interface Slot {
  html: string;
  side: Side;
  gap: number; // space BEFORE the object along the climb, in px
  pair?: boolean; // two items on one row, so small pieces do not leave gaps
}

/** Dense, dense, pause — the breathing of the hall. No interval here is uniform. */
function slot(html: string, side: Side, gap: number): Slot {
  return { html, side, gap };
}

/** Pair: a small item sits next to its neighbour instead of alone on its own row. */
function pairSlot(left: string, right: string, gap: number): Slot {
  return { html: left + right, side: 'c', gap, pair: true };
}

function sideObj(body: string, i: number, tw: number): string {
  return `<div class="obj side reveal" style="--tw:${tw}deg">
    <pre class="ascii-chart big">${body}</pre>
    <span class="obj-tag">exhibit_${String(i).padStart(2, '0')}.log</span>
  </div>`;
}

function cringeHtml(): string {
  return `<div class="obj mid toy reveal" id="cringe">
    <div class="obj-title">$ ./cringe-o-meter --live</div>
    <pre class="gauge" id="gauge"></pre>
    <p class="obj-hint">наведи (или ткни) — стрелка поедет</p>
    <div class="cringe-row">
      <button class="obj-btn small" id="cringe-reset" type="button">сбросить кринж</button>
      <span class="cringe-said" id="cringe-said" aria-live="polite"></span>
    </div>
  </div>`;
}

/** Lines shown on reset: the exhibit does not believe the reset, and rightly so. */
const CRINGE_RESET_LINES = [
  'счётчик обнулён. кринж — нет',
  'сброшено. музей смотрит на тебя с надеждой',
  'обнулили. запись в журнале осталась',
  'кринж сброшен и уже возвращается',
  'сброс №4. это тоже кринж, вообще-то',
];

function topHtml(): string {
  return `<div class="obj side reveal" style="--tw:9deg">
    <pre class="ascii-chart big" id="toplist"></pre>
    <span class="obj-tag">top -u museum</span>
  </div>`;
}

/** ASCII cringe gauge. */
function bar(p: number, width = 22): string {
  const full = Math.round((p / 100) * width);
  return '█'.repeat(full) + '░'.repeat(Math.max(0, width - full));
}

function mountCringe(root: HTMLElement): void {
  const host = root.querySelector('#cringe') as HTMLElement | null;
  const out = root.querySelector('#gauge') as HTMLPreElement | null;
  if (!host || !out) return;
  let v = 34;
  let want = 34;
  const label = (p: number): string => {
    if (p < 25) return 'терпимо';
    if (p < 55) return 'ой';
    if (p < 80) return 'закрой лицо руками';
    if (p < 99) return 'я это уже писал в проде';
    return 'ПЕРЕПОЛНЕНИЕ КРИНЖА';
  };
  const paint = (): void => {
    out.textContent =
      `уровень кринжа  ${bar(v)}  ${String(Math.round(v)).padStart(3)}%\n` +
      `полезность      ${bar(Math.max(4, 100 - v), 22)}  ${String(Math.round(Math.max(4, 100 - v))).padStart(3)}%\n` +
      `диагноз: ${label(v)}`;
  };
  paint();
  const bump = (): void => {
    want = Math.min(100, want + 11);
  };
  host.addEventListener('pointerenter', bump);
  host.addEventListener('click', bump);

  // RESET: zeroes the counter, and the exhibit comments on it.
  const reset = root.querySelector('#cringe-reset') as HTMLButtonElement | null;
  const said = root.querySelector('#cringe-said') as HTMLElement | null;
  let resets = 0;
  if (reset && said) {
    reset.addEventListener('click', (ev) => {
      ev.stopPropagation(); // the button click must NOT also bump the gauge
      v = 0;
      want = 0;
      paint();
      said.textContent = CRINGE_RESET_LINES[resets % CRINGE_RESET_LINES.length];
      resets += 1;
    });
  }

  if (reducedMotion()) return;
  let raf = 0;
  const tick = (): void => {
    if (!document.hidden) {
      want += (Math.random() - 0.48) * 0.6;
      want = Math.max(18, Math.min(100, want));
      v += (want - v) * 0.06;
      paint();
    }
    raf = window.requestAnimationFrame(tick);
  };
  raf = window.requestAnimationFrame(tick);
  onCleanup(() => window.cancelAnimationFrame(raf));
}

function mountTop(root: HTMLElement): void {
  const out = root.querySelector('#toplist') as HTMLPreElement | null;
  if (!out) return;
  const vals = [73.4, 21.9, 64.2, 0.1, 12.7];
  const paint = (): void => {
    const head = 'PID  COMMAND          %CPU';
    const rows = topRows
      .map(([pid, cmd], i) => `${pid}  ${cmd.padEnd(16)}${vals[i].toFixed(1).padStart(5)}`)
      .join('\n');
    out.textContent = `${head}\n${rows}`;
  };
  paint();
  if (reducedMotion()) return;
  const id = window.setInterval(() => {
    if (document.hidden) return;
    for (let i = 0; i < vals.length; i += 1) {
      if (i === 3) continue; // productivity never grows
      vals[i] = Math.max(0.2, Math.min(99.9, vals[i] + (Math.random() - 0.5) * 9));
    }
    paint();
  }, 900);
  onCleanup(() => window.clearInterval(id));
}

const MOTES = ['0x2A', 'NaN', ';;', '<<<', 'PLEASE', 'moO', '>_', '+++.', '▓▒░', 'E:', '?!', '~/', '0.1%', '[]', '//', '>>=', '\\o/', 'rm -rf'];

/** Small motes in the air: texture rather than content, so the dark is not empty. */
function motesHtml(): string {
  let out = '';
  for (let i = 0; i < 26; i += 1) {
    const side = i % 2 ? 'right' : 'left';
    const off = (2 + ((i * 7) % 16)).toFixed(1);
    const top = ((i + 0.5) / 26) * 100;
    const s = (0.75 + ((i * 13) % 7) / 8).toFixed(2);
    out += `<i class="mote" style="${side}:${off}%;top:${top.toFixed(2)}%;--s:${s}">${MOTES[i % MOTES.length]}</i>`;
  }
  return `<div class="motes" aria-hidden="true">${out}</div>`;
}

function mountTicker(root: HTMLElement): void {
  if (!reducedMotion()) return;
  root.querySelectorAll('.ticker-run').forEach((n) => {
    (n as HTMLElement).style.animation = 'none';
  });
}

/** Far layer: moves slower than the hall and provides depth. */
function mountParallax(root: HTMLElement): void {
  const far = root.querySelector('.far') as HTMLElement | null;
  if (!far || reducedMotion()) return;
  onScroll(() => {
    far.style.transform = `translate3d(0, ${((window.scrollY || 0) * 0.14).toFixed(1)}px, 0)`;
  });
}

export function renderHumor(app: HTMLElement): void {
  app.className = 'screen-humor';
  /**
   * Wall-label helper for a stand. No card is dropped: each one is placed next to
   * the interactive piece it grew out of.
   */
  const P = (id: string, why: string): string => {
    const e = humorExhibits.find((x) => x.id === id);
    return e ? plaqueHtml(e, why) : '';
  };

  // Order = climb order (the hall reads bottom-up).
  // Numbers are gaps: 24-36 is "dense", 116-132 is "a pause before the next cluster".
  const slots: Slot[] = [
    slot(cringeHtml(), 'c', 0),

    // the JS interview piece is paired with an interactive where the language answers
    slot(stand(jsTruthHtml(), [P('kai-js', 'откуда взят этот стенд')]), 'c', 44),
    pairSlot(sideObj(asciiCharts[0], 1, -9), `<p class="path-joke reveal">${pathJokes[0]}</p>`, 34),

    // NOTE: the caption line that used to sit here was removed on purpose; the
    // "sort by capitalism" interactive itself stays.
    slot(capitalismHtml(), 'c', 70),
    slot(sideObj(asciiCharts[3], 2, 10), 'r', 34),

    slot(stand(worstUxHtml(), [P('worstux', 'откуда взят этот стенд')]), 'c', 74),

    // two more of the same genre: a maze captcha and dice-based volume control
    slot(mazeCaptchaHtml(), 'c', 40),
    slot(diceVolumeHtml(), 'c', 40),
    slot(sideObj(asciiCharts[4], 3, -9), 'r', 34),

    slot(stand(meditationHtml(), [P('meditation', 'откуда взят этот обряд')]), 'c', 70),
    slot(topHtml(), 'l', 34),

    /**
     * FOLKLORE WALL. A legendary 2016 copypasta, with an empty frame beside it for
     * whatever comes next. The frame explains nothing on purpose: it just waits.
     */
    slot(
      `<div class="wall"><p class="wall-lead reveal">стена фольклора</p>` +
        // the copypasta is EXPANDED: the walkthrough runs next to the original, and
        // the empty frame for a remake stands right beside it
        stand(warriorHtml(), [
          P('warrior', 'айтишный фольклор, оригинал 2016'),
          reservedHtml(),
        ]) +
        `</div>`,
      'c',
      76,
    ),

    // cluster on coding-assistant pains: a limit-reset ritual and a song about it
    slot(stand(ritualHtml(), [P('reset', 'откуда взят этот обряд')]), 'c', 70),
    slot(stand(claudePlanHtml(), [P('claudes-plan', 'из той же жизни')]), 'c', 44),
    slot(`<p class="path-joke reveal">${pathJokes[4]}</p>`, 'r', 30),

    // trash trailer: an oracle that answers any question with "homology"
    slot(stand(oracleHtml(), [P('homotopy', 'откуда взят этот оракул')]), 'c', 72),

    // the hall darkens here: live esoteric languages (their sources are inside the zone)
    slot(magicZoneHtml(), 'c', 78),

    // NOTE: an ASCII chart that used to stand here was removed on purpose.

    // the summit of the hall is a payoff, not a "work in progress" note
    slot(
      `<div class="summit"><p class="summit-lead reveal">выше приколов не бывает. вот он:</p>` +
        stand(adhdSortHtml(), [P('adhd', 'откуда взят этот алгоритм')]) +
        `</div>`,
      'c',
      88,
    ),
  ];

  const hall = slots
    .map(
      (s) =>
        `<div class="slot ${s.side}${s.pair ? ' pair' : ''}" style="--gap:${s.gap}px">${s.html}</div>`,
    )
    .join('\n');

  const ticker = (extra: string, from: number): string => {
    const line = tickerLines.concat(tickerLines).join('   ///   ');
    return `<div class="ticker ${extra}" aria-hidden="true"><div class="ticker-run" style="--from:${from}s">${line}   ///   </div></div>`;
  };

  app.innerHTML = `
    ${backBtn()}
    <div class="far" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>
    <div class="horizon warm" aria-hidden="true"><div class="grid"></div></div>
    ${ticker('top', 0)}
    ${ticker('bot', -18)}
    <header class="room-head reveal">
      <pre class="clown still" aria-hidden="true">${clownStill}</pre>
      <p class="cmd">$ cd /iterium/jokes &amp;&amp; ls -la</p>
      <h1>комната шута<span class="cur"></span></h1>
      <p class="scroll-hint up">↑ поднимайся, приколы висят вокруг</p>
    </header>
    <main class="hall">
      <div class="trail" aria-hidden="true"><i id="trail-fill"></i></div>
      ${motesHtml()}
      ${hall}
    </main>
    <footer class="room-foot reveal">
      <p class="path-joke">…в запасниках ещё гора приколов — зал строится</p>
      <p class="curator">куратор: андрей (lruns) · все экспонаты принадлежат своим авторам</p>
    </footer>
    ${modeline('jokes.room', '(Humor · вверх)')}`;

  revealOnScroll(Array.from(app.querySelectorAll('.reveal')));
  liveModeline(
    app.querySelector('#ml-pos') as HTMLElement,
    app.querySelector('#trail-fill') as HTMLElement,
    true,
  );
  mountCringe(app);
  mountJsTruth(app);
  mountCapitalism(app);
  mountMagicZone(app);
  mountWorstUx(app);
  mountMazeCaptcha(app);
  mountDiceVolume(app);
  mountWarrior(app);
  mountClaudePlan(app);
  mountOracle(app);
  mountMeditation(app);
  mountRitual(app);
  mountAdhdSort(app);
  mountTop(app);
  mountTicker(app);
  mountParallax(app);
  startAtBottom();
}
