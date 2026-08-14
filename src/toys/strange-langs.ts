// "The strangest programming languages" station: TempleOS/HolyC, COW, brainfuck,
// Malbolge and Whitespace. It lives inside the magic zone.
//
// Layout rule for every card: PUNCHLINE first, then a small interaction, and only
// then the explanation as a quiet note underneath. Keep that order when editing.
//
// Language facts are sourced from esolangs.org (linked from each card) and
// templeos.org / Wikipedia for TempleOS.
//
// IMPORTANT — tone around TempleOS: keep it respectful. Terry Davis had a hard life
// and died in 2018; the jokes here are about the language and about us, never about
// his illness. "640x480, 16 colours" are his own words about the resolution he said
// he was told to use.

import { svgArrow } from '../chrome';
import { audioOnGesture, moo } from '../audio';
import { t, tl } from '../i18n';
import { onCleanup, reducedMotion, stepEngine } from '../runtime';

/* ------------------------------- COW: mooing --------------------------------- */

interface Moo {
  cmd: string;
  what: string;
}

// The six instructions used by this station (the full COW set is twelve).
const MOOS: Moo[] = ['mOo', 'moO', 'MOo', 'MoO', 'mOO', 'Moo'].map((cmd, i) => ({
  cmd,
  what: tl('mooWhat')[i],
}));

// Naive "hello world": COW only offers increment (MoO) and output (Moo), so printing
// H (char code 72) means emitting MoO exactly seventy-two times.
const HELLO = 'Hello world';

/* --------------------------- Malbolge: Hello World ---------------------------- */

// The first known Malbolge Hello World. It was not written by a human: a Lisp script
// searched the space of possible programs until one of them said hello.
const MALBOLGE = String.raw`(=BA#9"=<;:3y7x54-21q/p-,+*)"!h%B0/.
~P<
<:(8&
66#"!~}|{zyxwvu
gJ%`;

/* ------------------------ Whitespace: invisible program ----------------------- */

// A poem carrying a real program inside it: the line made of tabs and spaces.
// For Whitespace everything else is a comment.
// NOTE: lines 1 and 3 ARE the program (tabs and spaces). They are never translated —
// that is code, not text. Only the visible lines of the poem are translated.
const POEM: string[] = [
  t('sl.ws.poem1'),
  '\t  \t \t\t   \t \t',
  t('sl.ws.poem3'),
  ' \t\t \t  \t\t \t ',
  t('sl.ws.poem5'),
];

/**
 * Render a line as visible glyphs.
 * IMPORTANT: this must go CHARACTER BY CHARACTER, not via two chained .replace() calls.
 * The second pass would rewrite the spaces INSIDE the tags emitted by the first one and
 * dump raw markup onto the page.
 */
function wsChars(src: string): string {
  return Array.from(src)
    .map((ch) => {
      if (ch === '\t') return '<i class="ws-tab" data-ch="tab">→ </i>';
      if (ch === ' ') return '<i class="ws-sp" data-ch="sp">·</i>';
      return `<i class="ws-txt">${ch}</i>`;
    })
    .join('');
}

function wsLine(src: string, i: number): string {
  const blank = src.trim().length === 0;
  return `<div class="ws-line${blank ? ' ws-code' : ''}" data-line="${i}">${wsChars(src)}</div>`;
}

/* ----------------------------------- markup ---------------------------------- */

export function strangeLangsHtml(): string {
  const moos = MOOS.map(
    (m) => `<button class="moo-cmd" type="button" data-moo="${m.cmd}">${m.cmd}</button>`,
  ).join('');
  const poem = POEM.map(wsLine).join('');

  return `<div class="strange" id="strange">
    <h3 class="strange-title">${t('sl.title')}</h3>

    <div class="shrine" id="shrine">
      <div class="shrine-halo" aria-hidden="true"></div>
      <div class="shrine-head">
        <span class="shrine-mark" aria-hidden="true">
          <svg viewBox="0 0 24 34" class="ico-temple"><path d="M12 1 22 9v3H2V9zM4 12v16M9 12v16M15 12v16M20 12v16M1 30h22v3H1z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
        </span>
        <div>
          <b>TempleOS · HolyC</b>
          <span class="shrine-year">1993 → 2018</span>
        </div>
      </div>
      <p class="punch">${t('sl.temple.punch')}</p>
      <p class="punch-sub">${t('sl.temple.sub')}</p>
      <pre class="shrine-code">U0 Main()
{
  "Hello World!\\n";
}</pre>
      <p class="whisper-note">${t('sl.temple.note')}</p>
      <p class="whisper-note quiet">${t('sl.temple.quiet')}</p>
      <a class="whisper-link solo" href="https://templeos.org/" target="_blank" rel="noopener">
        ${t('sl.temple.site')} ${svgArrow}</a>
      <a class="whisper-link solo" href="https://en.wikipedia.org/wiki/TempleOS" target="_blank" rel="noopener">
        ${t('sl.temple.wiki')} ${svgArrow}</a>
    </div>

    <div class="magic-grid">
      <div class="cow toy" id="cow">
        <div class="obj-title">${t('sl.cow.title')}</div>
        <p class="punch">${t('sl.cow.punch')}</p>
        <div class="moo-run">
          <button class="obj-btn" id="moo-hello" type="button">${t('sl.cow.hello')}</button>
          <span class="moo-count" id="moo-count">${t('sl.cow.count', {
            cell: 0,
            want: HELLO.charCodeAt(0),
            letter: HELLO[0],
          })}</span>
        </div>
        <pre class="moo-code" id="moo-code">${t('sl.cow.empty')}</pre>
        <p class="moo-said" id="moo-said">${t('sl.cow.said')} <b id="moo-out-text"></b><span class="cur"></span></p>
        <p class="moo-out" id="moo-out">${t('sound.hint')}</p>
        <div class="moo-row">${moos}</div>
        <p class="whisper-note">${t('sl.cow.note')}</p>
        <button class="obj-btn small" id="moo-clear" type="button">${t('sl.cow.clear')}</button>
        <a class="whisper-link solo" href="https://esolangs.org/wiki/COW" target="_blank" rel="noopener">
          ${t('eso.exists')} ${svgArrow}</a>
      </div>

      <div class="bf toy" id="bf">
        <div class="obj-title">${t('sl.bf.title')}</div>
        <p class="punch">${t('sl.bf.punch')}</p>
        <p class="punch-sub">${t('sl.bf.sub')}</p>
        <pre class="bf-cmds" id="bf-cmds"></pre>
        <p class="bf-out" id="bf-out">${t('sl.bf.author')}</p>
        <pre class="bf-hello">++++++++[&gt;++++[&gt;++&gt;+++&gt;+++&gt;+&lt;&lt;&lt;&lt;-]&gt;+&gt;+&gt;-&gt;&gt;+[&lt;]&lt;-]&gt;&gt;.&gt;---.+++++++..+++.</pre>
        <p class="whisper-note">${t('sl.bf.note')}</p>
        <a class="whisper-link solo" href="https://esolangs.org/wiki/Brainfuck" target="_blank" rel="noopener">
          ${t('eso.exists')} ${svgArrow}</a>
      </div>
    </div>

    <div class="malb toy" id="malb">
      <div class="obj-title">${t('sl.malb.title')}</div>
      <p class="punch">${t('sl.malb.punch')}</p>
      <button class="obj-btn" id="malb-show" type="button">${t('sl.malb.show')}</button>
      <pre class="malb-code" id="malb-code" hidden>${MALBOLGE.replace(/</g, '&lt;')}</pre>
      <p class="malb-out" id="malb-out">${t('sl.malb.idle')}</p>
      <p class="whisper-note">${t('sl.malb.note')}</p>
      <a class="whisper-link solo" href="https://esolangs.org/wiki/Malbolge" target="_blank" rel="noopener">
        ${t('eso.exists')} ${svgArrow}</a>
    </div>

    <div class="ws toy" id="ws">
      <div class="obj-title">${t('sl.ws.title')}</div>
      <p class="punch">${t('sl.ws.punch')}</p>
      <div class="ws-void" id="ws-void">
        <pre class="ws-blank" id="ws-blank">${POEM[1].replace(/\t/g, '    ')}</pre>
        <span class="ws-void-hint">${t('sl.ws.voidHint')}</span>
      </div>
      <p class="punch-sub">${t('sl.ws.sub')}</p>
      <div class="ws-poem" id="ws-poem">${poem}</div>
      <p class="ws-out" id="ws-out">${t('sl.ws.idle')}</p>
      <button class="obj-btn small" id="ws-show" type="button">${t('sl.ws.show')}</button>
      <p class="whisper-note">${t('sl.ws.note')}</p>
      <a class="whisper-link solo" href="https://esolangs.org/wiki/Whitespace" target="_blank" rel="noopener">
        ${t('eso.exists')} ${svgArrow}</a>
    </div>
  </div>`;
}

/* ---------------------------------- behaviour -------------------------------- */

const BF: Array<[string, string]> = ['>', '<', '+', '-', '.', ',', '[', ']'].map(
  (ch, i) => [ch, tl('bfWhat')[i]] as [string, string],
);

export function mountStrangeLangs(root: HTMLElement): void {
  const host = root.querySelector('#strange') as HTMLElement | null;
  if (!host) return;

  // ---------- COW: actually moo out hello world ----------
  const mooCode = host.querySelector('#moo-code') as HTMLElement;
  const mooOut = host.querySelector('#moo-out') as HTMLElement;
  const mooCount = host.querySelector('#moo-count') as HTMLElement;
  const mooSaid = host.querySelector('#moo-out-text') as HTMLElement;
  const helloBtn = host.querySelector('#moo-hello') as HTMLButtonElement | null;
  const engine = stepEngine();
  const still = reducedMotion();

  let program: string[] = [];
  let cell = 0; // current value of the tape cell
  let letter = 0; // index of the hello world letter being built up
  let said = '';
  let mooing = false;

  const paintMoo = (): void => {
    // keep only the tail: seventy-two MoO in a row must not blow up the layout
    const tail = program.slice(-40);
    mooCode.textContent = tail.length
      ? (program.length > tail.length ? '… ' : '') + tail.join(' ')
      : t('sl.cow.empty');
    mooCode.scrollTop = mooCode.scrollHeight;
  };
  const paintCount = (): void => {
    const want = letter < HELLO.length ? HELLO.charCodeAt(letter) : 0;
    mooCount.textContent = want
      ? t('sl.cow.count', { cell, want, letter: HELLO[letter] })
      : t('sl.cow.countPlain', { cell });
  };
  paintMoo();
  paintCount();

  const push = (cmd: string): void => {
    program.push(cmd);
    if (program.length > 400) program.shift();
  };

  /** One step: emit MoO until the cell holds the char code of the current letter. */
  const step = (): void => {
    if (letter >= HELLO.length) return;
    const want = HELLO.charCodeAt(letter);
    if (cell < want) {
      // emit in chunks: one per frame would be more literal but far too slow to watch
      const chunk = Math.min(want - cell, letter === 0 ? 4 : 12);
      for (let i = 0; i < chunk; i += 1) push('MoO');
      cell += chunk;
      paintMoo();
      paintCount();
      const a = audioOnGesture();
      if (a) moo(a, cell);
      engine.next(step, letter === 0 ? 120 : 55);
      return;
    }
    // target reached: output the letter and reset the cell for the next one
    push('Moo');
    said += HELLO[letter];
    mooSaid.textContent = said;
    letter += 1;
    cell = 0;
    if (letter < HELLO.length) push('OOO'); // OOO zeroes the cell; a real COW instruction
    paintMoo();
    paintCount();
    if (letter === 1) {
      mooOut.textContent = t('sl.cow.first');
    } else if (letter >= HELLO.length) {
      mooOut.textContent = t('sl.cow.done', { hello: HELLO, n: program.length });
      mooing = false;
      if (helloBtn) helloBtn.textContent = t('sl.cow.again');
      return;
    } else {
      mooOut.textContent = t('sl.cow.letter', { i: letter, n: HELLO.length });
    }
    engine.next(step, 240);
  };

  if (helloBtn) {
    helloBtn.addEventListener('click', () => {
      if (mooing) return;
      program = [];
      cell = 0;
      letter = 0;
      said = '';
      mooSaid.textContent = '';
      mooing = true;
      helloBtn.textContent = t('sl.cow.mooing');
      mooOut.textContent = t('sl.cow.started');
      if (still) {
        // reduced motion: jump straight to the result, same arithmetic, no animation
        let total = 0;
        for (let i = 0; i < HELLO.length; i += 1) total += HELLO.charCodeAt(i) + 2;
        said = HELLO;
        mooSaid.textContent = said;
        mooCode.textContent = `MoO ×${total} … Moo`;
        mooOut.textContent = t('sl.cow.stillDone', { hello: HELLO, n: total });
        mooing = false;
        helloBtn.textContent = t('sl.cow.again');
        return;
      }
      const a = audioOnGesture();
      if (a) moo(a, 0);
      engine.next(step, 200);
    });
  }

  // instruction table: clicking an entry appends it and explains what it does
  host.querySelectorAll('[data-moo]').forEach((b) => {
    b.addEventListener('click', () => {
      const cmd = (b as HTMLElement).dataset.moo || '';
      const m = MOOS.find((x) => x.cmd === cmd);
      push(cmd);
      paintMoo();
      mooOut.textContent = m ? t('sl.cow.cmd', { cmd, what: m.what }) : cmd;
      const a = audioOnGesture();
      if (a) moo(a, program.length);
    });
  });

  const mooClear = host.querySelector('#moo-clear') as HTMLButtonElement | null;
  if (mooClear) {
    mooClear.addEventListener('click', () => {
      engine.stop();
      mooing = false;
      program = [];
      cell = 0;
      letter = 0;
      said = '';
      mooSaid.textContent = '';
      paintMoo();
      paintCount();
      mooOut.textContent = t('sl.cow.cleared');
      if (helloBtn) helloBtn.textContent = t('sl.cow.hello');
    });
  }

  // ---------- brainfuck: eight symbols ----------
  const cmds = host.querySelector('#bf-cmds') as HTMLElement;
  const bfOut = host.querySelector('#bf-out') as HTMLElement;
  cmds.textContent = '';
  BF.forEach(([ch, what]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bf-cmd';
    b.textContent = ch;
    const tell = (): void => {
      bfOut.textContent = t('sl.cow.cmd', { cmd: ch, what });
    };
    b.addEventListener('pointerenter', tell);
    b.addEventListener('click', tell);
    cmds.appendChild(b);
  });

  // ---------- Malbolge: reveal the noise ----------
  const malbOut = host.querySelector('#malb-out') as HTMLElement;
  const malbCode = host.querySelector('#malb-code') as HTMLElement;
  const malbShow = host.querySelector('#malb-show') as HTMLButtonElement | null;
  if (malbShow) {
    malbShow.addEventListener('click', () => {
      const open = !malbCode.hasAttribute('hidden');
      if (open) {
        malbCode.setAttribute('hidden', '');
        malbShow.textContent = t('sl.malb.show');
        malbOut.textContent = t('sl.malb.idle');
        return;
      }
      malbCode.removeAttribute('hidden');
      malbCode.classList.add('spill');
      malbShow.textContent = t('sl.malb.hide');
      malbOut.textContent = t('sl.malb.found');
    });
  }

  // ---------- Whitespace: highlight the emptiness ----------
  const poem = host.querySelector('#ws-poem') as HTMLElement;
  const wsOut = host.querySelector('#ws-out') as HTMLElement;
  const wsShow = host.querySelector('#ws-show') as HTMLButtonElement | null;
  const wsVoid = host.querySelector('#ws-void') as HTMLElement | null;
  const wsBlank = host.querySelector('#ws-blank') as HTMLElement | null;
  const reveal = (why: string): void => {
    poem.classList.add('lit');
    if (wsVoid) wsVoid.classList.add('lit');
    if (wsBlank) wsBlank.innerHTML = wsChars(POEM[1]);
    wsOut.textContent = why;
    if (wsShow) wsShow.textContent = t('sl.ws.hide');
  };
  const hide = (): void => {
    poem.classList.remove('lit');
    if (wsVoid) wsVoid.classList.remove('lit');
    if (wsBlank) wsBlank.textContent = POEM[1].replace(/\t/g, '    ');
    wsOut.textContent = t('sl.ws.idle');
    if (wsShow) wsShow.textContent = t('sl.ws.show');
  };
  if (wsShow) {
    wsShow.addEventListener('click', () => {
      if (poem.classList.contains('lit')) hide();
      else reveal(t('sl.ws.revealBtn'));
    });
  }
  if (wsVoid) {
    wsVoid.addEventListener('click', () => {
      if (wsVoid.classList.contains('lit')) hide();
      else reveal(t('sl.ws.revealVoid'));
    });
  }
  poem.querySelectorAll('.ws-line').forEach((l) => {
    l.addEventListener('click', () => {
      if (l.classList.contains('ws-code')) {
        reveal(t('sl.ws.revealCode'));
        return;
      }
      reveal(t('sl.ws.revealText'));
    });
  });
  // real text selection over the poem also reveals the invisible characters
  const onSelect = (): void => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.anchorNode) return;
    if (!poem.contains(sel.anchorNode)) return;
    reveal(t('sl.ws.revealSel'));
  };
  document.addEventListener('selectionchange', onSelect);
  onCleanup(() => document.removeEventListener('selectionchange', onSelect));
}
