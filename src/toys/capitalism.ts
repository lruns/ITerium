// sort --by=capitalism. This is deliberately NOT a fair sort: the algorithm cheats
// in the open. The investor teleports to the top past the queue, the intern is
// actively pushed back down, and convergence for the intern never happens — the
// iteration counter just keeps ticking.

import { capitalismItems } from '../data';
import { reducedMotion, stepEngine } from '../runtime';

interface Row {
  name: string;
  cash: number;
  tag: string;
}

const NEVER = [
  'пересчитываю приоритет',
  'уточняю грейд',
  'жду ревью от тимлида',
  'ещё один спринт и точно',
  'сортировка не сошлась',
];

// The bar scale is LINEAR, not logarithmic: a log scale politely hid the gap, and
// the gap is the joke. The intern gets a single-character stub, the investor a bar
// spanning the whole exhibit.
const MAX_BAR = 40;
const TOP_CASH = capitalismItems.reduce((m, it) => Math.max(m, it.cash), 1);

function barOf(cash: number): string {
  return '▓'.repeat(Math.max(1, Math.round((cash / TOP_CASH) * MAX_BAR)));
}

export function capitalismHtml(): string {
  return `<div class="obj mid toy reveal" id="capital">
    <div class="obj-title">$ sort --by=capitalism</div>
    <ol class="rich" id="rich"></ol>
    <p class="rich-log" id="rich-log">жду команды</p>
    <button class="obj-btn" id="rich-run" type="button">запустить сортировку</button>
    <p class="obj-hint">алгоритм честный. просто не для всех</p>
  </div>`;
}

export function mountCapitalism(root: HTMLElement): void {
  const out = root.querySelector('#rich') as HTMLElement | null;
  const log = root.querySelector('#rich-log') as HTMLElement | null;
  const btn = root.querySelector('#rich-run') as HTMLButtonElement | null;
  if (!out || !log) return;

  const engine = stepEngine();
  let list: Row[] = [];
  let hi = -1;
  let iter = 0;

  const paint = (): void => {
    out.innerHTML = list
      .map((r, i) => {
        const cls = [
          'rich-row',
          i === hi ? 'hi' : '',
          r.name === 'инвестор' ? 'vip' : '',
          r.name === 'стажёр' ? 'poor' : '',
        ]
          .filter(Boolean)
          .join(' ');
        const tag = r.tag ? `<em class="rich-tag">${r.tag}</em>` : '';
        return `<li class="${cls}"><span class="rich-name">${r.name}</span><span class="rich-cash">$${r.cash}</span><span class="rich-bar">${barOf(r.cash)}</span>${tag}</li>`;
      })
      .join('');
  };

  const reset = (): void => {
    list = capitalismItems.map((it) => ({ name: it.name, cash: it.cash, tag: '' }));
    hi = -1;
    iter = 0;
    paint();
    log.textContent = 'жду команды';
  };

  /** A normal bubble-sort pass, applied only to the rows that queue honestly. */
  const bubbleStep = (): boolean => {
    for (let i = 1; i < list.length - 1; i += 1) {
      // the intern is never allowed up: if he floats, he is swapped back down
      if (list[i].name === 'стажёр') {
        const t = list[i];
        list[i] = list[i + 1];
        list[i + 1] = t;
        list[i + 1].tag = 'приоритет пересчитывается';
        hi = i + 1;
        return true;
      }
      if (list[i].cash < list[i + 1].cash) {
        const t = list[i];
        list[i] = list[i + 1];
        list[i + 1] = t;
        hi = i;
        return true;
      }
    }
    return false;
  };

  const spin = (): void => {
    iter += 1;
    const idx = list.findIndex((r) => r.name === 'стажёр');
    if (idx >= 0) list[idx].tag = `${NEVER[iter % NEVER.length]} · итерация ${iter}`;
    hi = idx;
    paint();
    log.textContent = `> для стажёра сортировка не сошлась (итерация ${iter})`;
    engine.next(spin, 1500);
  };

  const sorting = (): void => {
    if (bubbleStep()) {
      paint();
      engine.next(sorting, 220);
      return;
    }
    hi = -1;
    paint();
    log.textContent = '> порядок установлен. осталась одна мелочь';
    engine.next(spin, 900);
  };

  const teleport = (): void => {
    const idx = list.findIndex((r) => r.name === 'инвестор');
    const vip = list.splice(idx, 1)[0];
    vip.tag = 'вне очереди';
    list.unshift(vip);
    hi = 0;
    paint();
    const row = out.firstElementChild as HTMLElement | null;
    if (row && !reducedMotion()) row.classList.add('teleported');
    log.textContent = '> инвестор: приоритетный доступ. сортировка пропущена';
    engine.next(sorting, 900);
  };

  const run = (): void => {
    engine.stop();
    reset();
    log.textContent = '> читаю массив…';
    if (reducedMotion()) {
      const idx = list.findIndex((r) => r.name === 'инвестор');
      const vip = list.splice(idx, 1)[0];
      vip.tag = 'вне очереди';
      list.unshift(vip);
      list.sort((a, b) => (a.name === 'стажёр' ? 1 : b.name === 'стажёр' ? -1 : 0));
      const poor = list.find((r) => r.name === 'стажёр');
      if (poor) poor.tag = 'сортировка не сошлась';
      paint();
      log.textContent = '> инвестор — вне очереди. для стажёра сортировка не сошлась';
      return;
    }
    engine.next(teleport, 700);
  };

  if (btn) btn.addEventListener('click', run);
  reset();
}
