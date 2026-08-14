// "JS answers": a set of well-known JavaScript coercion quirks.
//
// The joke only works if the results are real, so every answer is evaluated HERE
// AND NOW by the browser engine: the expression is written literally in the code
// and the result comes from running it, never from a canned string. User input
// never reaches this code — the expressions are a fixed allowlist, and no eval.

import { svgArrow } from '../chrome';
import { audioOnGesture, blip } from '../audio';
import { t } from '../i18n';

/**
 * Addition of operands the type checker refuses to add, which the engine happily
 * performs — that is the point of the exhibit. The operands are typed `any` so
 * the real operation can run past the compiler's checks.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loosePlus(a: any, b: any): unknown {
  return a + b;
}

interface Case {
  id: string;
  src: string;
  /** The actual evaluation. No pre-recorded answers anywhere. */
  run: () => unknown;
  note: string;
}

/** Format a value the way a console would print it. */
function show(v: unknown): string {
  if (typeof v === 'string') return `'${v}'`;
  if (Array.isArray(v)) return `[${v.map(show).join(', ')}]`;
  if (typeof v === 'number' && Number.isNaN(v)) return 'NaN';
  return String(v);
}

const CASES: Case[] = [
  {
    id: 'plus',
    src: "'1' + 1",
    run: () => '1' + 1,
    note: t('js.note.plus'),
  },
  {
    id: 'arrays',
    src: '[] + []',
    run: () => loosePlus([], []),
    note: t('js.note.arrays'),
  },
  {
    id: 'objarr',
    src: '[] + {}',
    run: () => loosePlus([], {}),
    note: t('js.note.objarr'),
  },
  {
    id: 'nan',
    src: 'NaN === NaN',
    run: () => Number.NaN === Number.NaN,
    note: t('js.note.nan'),
  },
  {
    id: 'typeof',
    src: 'typeof NaN',
    run: () => typeof Number.NaN,
    note: t('js.note.typeof'),
  },
  {
    id: 'float',
    src: '0.1 + 0.2',
    run: () => 0.1 + 0.2,
    note: t('js.note.float'),
  },
  {
    id: 'sort',
    src: '[10, 1, 3].sort()',
    run: () => [10, 1, 3].sort(),
    note: t('js.note.sort'),
  },
  {
    id: 'maxmin',
    src: 'Math.max() > Math.min()',
    run: () => Math.max() > Math.min(),
    note: t('js.note.maxmin'),
  },
  {
    id: 'nullnum',
    src: 'null >= 0',
    run: () => (null as unknown as number) >= 0,
    note: t('js.note.nullnum'),
  },
  {
    id: 'banana',
    src: "('b' + 'a' + +'a' + 'a').toLowerCase()",
    run: () => ('b' + 'a' + +'a' + 'a').toLowerCase(),
    note: t('js.note.banana'),
  },
];

export function jsTruthHtml(): string {
  const rows = CASES.map(
    (c) => `<li class="jst-row">
      <button class="jst-expr" type="button" data-case="${c.id}">${c.src}</button>
      <span class="jst-res" id="jst-res-${c.id}">?</span>
    </li>`,
  ).join('');
  return `<div class="obj mid toy jst reveal" id="jst">
    <div class="obj-title">$ node --interactive · ${t('js.title')}</div>
    <p class="obj-hint top">${t('js.hint')}</p>
    <ul class="jst-list">${rows}</ul>
    <p class="jst-note" id="jst-note">${t('js.idle')}</p>
    <p class="jst-foot">${t('js.foot')}</p>
    <div class="jst-row jst-all">
      <button class="obj-btn" id="jst-all" type="button">${t('js.all')}</button>
      <a class="plate" href="https://www.youtube.com/watch?v=Uo3cL4nrGOk" target="_blank" rel="noopener">
        ${t('js.plate')} ${svgArrow}</a>
    </div>
  </div>`;
}

export function mountJsTruth(root: HTMLElement): void {
  const host = root.querySelector('#jst') as HTMLElement | null;
  if (!host) return;
  const note = host.querySelector('#jst-note') as HTMLElement;
  let done = 0;

  const answer = (c: Case, sound: boolean): void => {
    const out = host.querySelector(`#jst-res-${c.id}`) as HTMLElement | null;
    if (!out) return;
    if (!out.classList.contains('on')) done += 1;
    out.textContent = show(c.run());
    out.classList.add('on');
    note.textContent = `> ${c.note}`;
    if (sound) {
      const a = audioOnGesture();
      if (a) blip(a, done % 2 === 0);
    }
    if (done >= CASES.length) note.textContent = t('js.done');
  };

  host.querySelectorAll('[data-case]').forEach((b) => {
    b.addEventListener('click', () => {
      const c = CASES.find((x) => x.id === (b as HTMLElement).dataset.case);
      if (c) answer(c, true);
    });
  });

  const all = host.querySelector('#jst-all') as HTMLButtonElement | null;
  if (all) {
    all.addEventListener('click', () => {
      CASES.forEach((c) => answer(c, false));
      const a = audioOnGesture();
      if (a) blip(a, true);
    });
  }
}
