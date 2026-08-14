// sort --by=capitalism. This is deliberately NOT a fair sort: the algorithm cheats
// in the open. The investor teleports to the top past the queue, the intern is
// actively pushed back down, and convergence for the intern never happens — the
// iteration counter just keeps ticking.

import { capitalismItems, type RichItem } from '../data';
import { t, tl } from '../i18n';
import { reducedMotion, stepEngine } from '../runtime';

interface Row {
  id: RichItem['id'];
  name: string;
  cash: number;
  tag: string;
}

const NEVER = tl('capitalismNever');

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
    <p class="rich-log" id="rich-log">${t('cap.idle')}</p>
    <button class="obj-btn" id="rich-run" type="button">${t('cap.run')}</button>
    <p class="obj-hint">${t('cap.hint')}</p>
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
          r.id === 'investor' ? 'vip' : '',
          r.id === 'intern' ? 'poor' : '',
        ]
          .filter(Boolean)
          .join(' ');
        const tag = r.tag ? `<em class="rich-tag">${r.tag}</em>` : '';
        return `<li class="${cls}"><span class="rich-name">${r.name}</span><span class="rich-cash">$${r.cash}</span><span class="rich-bar">${barOf(r.cash)}</span>${tag}</li>`;
      })
      .join('');
  };

  const reset = (): void => {
    list = capitalismItems.map((it) => ({ id: it.id, name: it.name, cash: it.cash, tag: '' }));
    hi = -1;
    iter = 0;
    paint();
    log.textContent = t('cap.idle');
  };

  /** A normal bubble-sort pass, applied only to the rows that queue honestly. */
  const bubbleStep = (): boolean => {
    for (let i = 1; i < list.length - 1; i += 1) {
      // the intern is never allowed up: if he floats, he is swapped back down
      if (list[i].id === 'intern') {
        const row = list[i];
        list[i] = list[i + 1];
        list[i + 1] = row;
        list[i + 1].tag = t('cap.recalc');
        hi = i + 1;
        return true;
      }
      if (list[i].cash < list[i + 1].cash) {
        const row = list[i];
        list[i] = list[i + 1];
        list[i + 1] = row;
        hi = i;
        return true;
      }
    }
    return false;
  };

  const spin = (): void => {
    iter += 1;
    const idx = list.findIndex((r) => r.id === 'intern');
    if (idx >= 0) list[idx].tag = t('cap.iterTag', { never: NEVER[iter % NEVER.length], n: iter });
    hi = idx;
    paint();
    log.textContent = t('cap.stuck', { n: iter });
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
    log.textContent = t('cap.ordered');
    engine.next(spin, 900);
  };

  const teleport = (): void => {
    const idx = list.findIndex((r) => r.id === 'investor');
    const vip = list.splice(idx, 1)[0];
    vip.tag = t('cap.queueSkip');
    list.unshift(vip);
    hi = 0;
    paint();
    const row = out.firstElementChild as HTMLElement | null;
    if (row && !reducedMotion()) row.classList.add('teleported');
    log.textContent = t('cap.vip');
    engine.next(sorting, 900);
  };

  const run = (): void => {
    engine.stop();
    reset();
    log.textContent = t('cap.reading');
    if (reducedMotion()) {
      const idx = list.findIndex((r) => r.id === 'investor');
      const vip = list.splice(idx, 1)[0];
      vip.tag = t('cap.queueSkip');
      list.unshift(vip);
      list.sort((a, b) => (a.id === 'intern' ? 1 : b.id === 'intern' ? -1 : 0));
      const poor = list.find((r) => r.id === 'intern');
      if (poor) poor.tag = t('cap.noConverge');
      paint();
      log.textContent = t('cap.stillResult');
      return;
    }
    engine.next(teleport, 700);
  };

  if (btn) btn.addEventListener('click', run);
  reset();
}
