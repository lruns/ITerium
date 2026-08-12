// ADHD Sort, running live. The sort genuinely starts working and then gets
// DISTRACTED halfway: it abandons the array, tidies a small neighbouring one,
// comes back without remembering where it was, and reshuffles a window of what
// it had already ordered. The point is visible without any explanation — the
// "sorted" meter falls back. The exhibit NEVER terminates: right at the moment
// of success it gets distracted again. Author credit is on the exhibit itself.

import { reducedMotion, stepEngine } from '../runtime';

const N = 14;
const SIDE_N = 5;

interface Phase {
  id: 'sorting' | 'noticing' | 'away' | 'back' | 'lost';
  say: string;
}

// "almost there" lines: this is exactly where it gets distracted again. There is no terminal success state.
const SAY_ALMOST = [
  'почти. ой, а что там…',
  'почти же! …стоп, а что это',
  'ну вот почти. ой',
];

const SAY_AWAY = [
  'о. а что это там за массив',
  'секунду, там всё вверх дном',
  'соседний маленький, я быстро',
  'ой, а тут вообще не отсортировано',
];
const SAY_BACK = [
  'так… на чём я остановился',
  'ага. я точно был где-то тут',
  'ладно, помню примерно',
  'кажется, отсюда. или нет',
];
const SAY_SORT = [
  'сортирую',
  'сортирую, всё под контролем',
  'ещё чуть-чуть',
  'вот теперь по-настоящему сортирую',
];

function shuffled(n: number): number[] {
  const a: number[] = [];
  for (let i = 1; i <= n; i += 1) a.push(i);
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}

function pick<T>(a: T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

/** Share of adjacent pairs in the right order — the meter that falls back. */
function sortedness(a: number[]): number {
  let ok = 0;
  for (let i = 0; i < a.length - 1; i += 1) if (a[i] <= a[i + 1]) ok += 1;
  return Math.round((ok / (a.length - 1)) * 100);
}

export function adhdSortHtml(): string {
  const bars = (cls: string, n: number): string => {
    let s = '';
    for (let i = 0; i < n; i += 1) s += `<i class="${cls}" style="--h:20%"></i>`;
    return s;
  };
  return `<div class="obj mid toy reveal" id="adhd-toy">
    <div class="obj-title">$ ./adhd-sort --live</div>
    <div class="adhd">
      <div class="adhd-main">
        <div class="bars" id="adhd-bars">${bars('bar', N)}</div>
        <div class="adhd-cursor" id="adhd-cursor"><span></span></div>
      </div>
      <aside class="adhd-side" id="adhd-side">
        <div class="adhd-side-tag">чужой массив</div>
        <div class="bars small" id="adhd-side-bars">${bars('bar s', SIDE_N)}</div>
      </aside>
    </div>
    <p class="adhd-say" id="adhd-say">сортирую</p>
    <div class="adhd-stats">
      <span>отсортировано <b id="adhd-pct">0%</b></span>
      <span>отвлёкся <b id="adhd-dis">0</b></span>
      <span>шагов <b id="adhd-steps">0</b></span>
    </div>
    <div class="adhd-meter"><i id="adhd-fill"></i></div>
    <button class="obj-btn" id="adhd-restart" type="button">начать заново</button>
    <p class="obj-hint">O(n² + отвлёкся) · по мотивам ADHD Sort от @swapjs.tt</p>
  </div>`;
}

export function mountAdhdSort(root: HTMLElement): void {
  const host = root.querySelector('#adhd-toy') as HTMLElement | null;
  if (!host) return;
  const barsEl = root.querySelector('#adhd-bars') as HTMLElement;
  const sideEl = root.querySelector('#adhd-side') as HTMLElement;
  const sideBarsEl = root.querySelector('#adhd-side-bars') as HTMLElement;
  const cursorEl = root.querySelector('#adhd-cursor') as HTMLElement;
  const sayEl = root.querySelector('#adhd-say') as HTMLElement;
  const pctEl = root.querySelector('#adhd-pct') as HTMLElement;
  const disEl = root.querySelector('#adhd-dis') as HTMLElement;
  const stepsEl = root.querySelector('#adhd-steps') as HTMLElement;
  const fillEl = root.querySelector('#adhd-fill') as HTMLElement;
  const btn = root.querySelector('#adhd-restart') as HTMLButtonElement | null;
  if (!barsEl || !sayEl) return;

  const bars = Array.from(barsEl.children) as HTMLElement[];
  const sideBars = Array.from(sideBarsEl.children) as HTMLElement[];
  const engine = stepEngine();

  let main: number[] = [];
  let side: number[] = [];
  let j = 0;
  let pass = 0;
  let swaps = 0;
  let untilBored = 0;
  let sideIdx = 0;
  let phase: Phase = { id: 'sorting', say: 'сортирую' };
  let steps = 0;
  let distractions = 0;

  const paintMain = (): void => {
    for (let i = 0; i < bars.length; i += 1) {
      bars[i].style.setProperty('--h', `${(main[i] / N) * 100}%`);
      bars[i].classList.toggle('hot', phase.id === 'sorting' && (i === j || i === j + 1));
    }
    const p = sortedness(main);
    pctEl.textContent = `${p}%`;
    fillEl.style.width = `${p}%`;
  };
  const paintSide = (): void => {
    for (let i = 0; i < sideBars.length; i += 1) {
      sideBars[i].style.setProperty('--h', `${(side[i] / SIDE_N) * 100}%`);
      sideBars[i].classList.toggle('hot', phase.id === 'away' && i === sideIdx);
    }
  };
  const moveCursor = (idx: number): void => {
    const w = 100 / N;
    cursorEl.style.setProperty('--x', `${idx * w + w / 2}%`);
  };
  const say = (text: string): void => {
    phase.say = text;
    sayEl.textContent = text;
  };

  /**
   * While it was busy with the other array, the neighbours around the position it
   * returned to got swapped. This is where the "sorted" meter really drops: the
   * array itself is degraded, not just the counters.
   */
  const scramble = (at: number, size: number): void => {
    const from = Math.max(0, Math.min(main.length - size, at - 1));
    for (let i = from + size - 1; i > from; i -= 1) {
      const k = from + Math.floor(Math.random() * (i - from + 1));
      const t = main[i];
      main[i] = main[k];
      main[k] = t;
    }
    // If the shuffle happened to land back in order, force a swap: the dent must be visible.
    let ordered = true;
    for (let i = from; i < from + size - 1; i += 1) if (main[i] > main[i + 1]) ordered = false;
    if (ordered) {
      const t = main[from];
      main[from] = main[from + size - 1];
      main[from + size - 1] = t;
    }
  };

  const reset = (): void => {
    main = shuffled(N);
    side = shuffled(SIDE_N);
    j = 0;
    pass = 0;
    swaps = 0;
    steps = 0;
    distractions = 0;
    untilBored = 12 + Math.floor(Math.random() * 10);
    phase = { id: 'sorting', say: 'сортирую' };
    sideEl.classList.remove('on');
    say('сортирую');
    disEl.textContent = '0';
    stepsEl.textContent = '0';
    moveCursor(0);
    paintMain();
    paintSide();
  };

  const tick = (): void => {
    steps += 1;
    stepsEl.textContent = String(steps);

    if (phase.id === 'sorting') {
      if (j >= main.length - 1 - pass) {
        if (swaps === 0) {
          // At the finish line it does NOT finish: it enters another distraction.
          // The exhibit never terminates.
          pass = 0;
          j = 0;
          swaps = 1;
          phase = { id: 'noticing', say: '' };
          say(pick(SAY_ALMOST));
          paintMain();
          engine.next(tick, 620);
          return;
        }
        pass += 1;
        swaps = 0;
        j = 0;
      } else {
        if (main[j] > main[j + 1]) {
          const t = main[j];
          main[j] = main[j + 1];
          main[j + 1] = t;
          swaps += 1;
        }
        moveCursor(j);
        j += 1;
      }
      untilBored -= 1;
      paintMain();
      if (untilBored <= 0) {
        phase = { id: 'noticing', say: '' };
        say(pick(SAY_AWAY));
      }
      engine.next(tick, 80);
      return;
    }

    if (phase.id === 'noticing') {
      side = shuffled(SIDE_N);
      sideIdx = 0;
      sideEl.classList.add('on');
      phase = { id: 'away', say: '' };
      say('(сортирую чужой массив, он маленький)');
      distractions += 1;
      disEl.textContent = String(distractions);
      paintSide();
      engine.next(tick, 460);
      return;
    }

    if (phase.id === 'away') {
      // The other array is small, so it gets sorted quickly and on the first try.
      let moved = false;
      for (let k = 0; k < side.length - 1; k += 1) {
        if (side[k] > side[k + 1]) {
          const t = side[k];
          side[k] = side[k + 1];
          side[k + 1] = t;
          sideIdx = k;
          moved = true;
          break;
        }
      }
      paintSide();
      if (!moved) {
        phase = { id: 'back', say: '' };
        say(pick(SAY_BACK));
        engine.next(tick, 620);
        return;
      }
      engine.next(tick, 110);
      return;
    }

    if (phase.id === 'back') {
      sideEl.classList.remove('on');
      phase = { id: 'lost', say: '' };
      say(pick(SAY_BACK));
      engine.next(tick, 520);
      return;
    }

    if (phase.id === 'lost') {
      // The core of the joke: it resumes at the WRONG index, loses passes, and
      // scrambles the window of neighbours around the new position.
      j = Math.floor(Math.random() * Math.max(1, main.length - 3));
      pass = Math.max(0, pass - 1 - Math.floor(Math.random() * 2));
      swaps = 1; // keep it from concluding the array is already sorted
      scramble(j, 3 + Math.floor(Math.random() * 2));
      untilBored = 12 + Math.floor(Math.random() * 12);
      phase = { id: 'sorting', say: '' };
      say(pick(SAY_SORT));
      moveCursor(j);
      paintMain();
      engine.next(tick, 260);
      return;
    }
  };

  const start = (): void => {
    reset();
    if (reducedMotion()) {
      // Reduced motion: show the outcome as a single still frame, labelled as such.
      main = shuffled(N);
      j = 3;
      say('отвлёкся и вернулся не туда (анимация выключена в системе)');
      paintMain();
      return;
    }
    engine.next(tick, 500);
  };

  if (btn) btn.addEventListener('click', start);
  start();
}
