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
import { onCleanup, reducedMotion, stepEngine } from '../runtime';

/* ------------------------------- COW: mooing --------------------------------- */

interface Moo {
  cmd: string;
  what: string;
}

// The six instructions used by this station (the full COW set is twelve).
const MOOS: Moo[] = [
  { cmd: 'mOo', what: 'шаг на предыдущую ячейку' },
  { cmd: 'moO', what: 'шаг на следующую ячейку' },
  { cmd: 'MOo', what: 'уменьшить значение в ячейке' },
  { cmd: 'MoO', what: 'увеличить значение в ячейке' },
  { cmd: 'mOO', what: 'выполнить значение ячейки КАК КОМАНДУ' },
  { cmd: 'Moo', what: 'ввод-вывод: сказать или послушать' },
];

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
const POEM: string[] = [
  'ночью компилятор читает стихи',
  '\t  \t \t\t   \t \t',
  'и не находит в них ни одной ошибки',
  ' \t\t \t  \t\t \t ',
  'потому что ошибок в стихах не бывает',
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
    <h3 class="strange-title">самые странные языки, которые правда работают</h3>

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
      <p class="punch">«640×480, 16 цветов — таково было прямое указание бога».</p>
      <p class="punch-sub">И это не метафора про легаси: система полностью рабочая, её можно запустить сегодня.</p>
      <pre class="shrine-code">U0 Main()
{
  "Hello World!\\n";
}</pre>
      <p class="whisper-note">
        Операционная система, которую Терри Дэвис писал в одиночку больше десяти лет —
        своё ядро, свой компилятор, свой язык HolyC. В HolyC строка сама по себе уже
        команда: написал текст в кавычках — он и напечатался. Ни одного printf.
      </p>
      <p class="whisper-note quiet">
        Терри умер в 2018-м. Здесь он стоит не как курьёз, а как автор: человек
        в одиночку написал операционную систему.
      </p>
      <a class="whisper-link solo" href="https://templeos.org/" target="_blank" rel="noopener">
        сайт TempleOS ${svgArrow}</a>
      <a class="whisper-link solo" href="https://en.wikipedia.org/wiki/TempleOS" target="_blank" rel="noopener">
        TempleOS в энциклопедии ${svgArrow}</a>
    </div>

    <div class="magic-grid">
      <div class="cow toy" id="cow">
        <div class="obj-title">COW · программист вариантов мычания</div>
        <p class="punch">Чтобы корова сказала букву «H», ей надо промычать «MoO» ровно 72 раза.</p>
        <div class="moo-run">
          <button class="obj-btn" id="moo-hello" type="button">промычать hello world</button>
          <span class="moo-count" id="moo-count">в ячейке: 0 · нужно 72 («H»)</span>
        </div>
        <pre class="moo-code" id="moo-code">(пусто. помычи)</pre>
        <p class="moo-said" id="moo-said">сказано: <b id="moo-out-text"></b><span class="cur"></span></p>
        <p class="moo-out" id="moo-out">со звуком (синтез, по твоему клику)</p>
        <div class="moo-row">${moos}</div>
        <p class="whisper-note">
          Вся программа собирается из одного слова, регистр решает всё. Прибавить —
          MoO, сказать — Moo, и никаких «напечатай строку». Отдельно стоит mOO:
          единственная команда, которая исполняет содержимое ячейки как команду.
        </p>
        <button class="obj-btn small" id="moo-clear" type="button">стереть мычание</button>
        <a class="whisper-link solo" href="https://esolangs.org/wiki/COW" target="_blank" rel="noopener">
          язык реально существует ${svgArrow}</a>
      </div>

      <div class="bf toy" id="bf">
        <div class="obj-title">brainfuck · восемь символов, и всё</div>
        <p class="punch">Автор ставил себе одну задачу: самый маленький компилятор в мире. Уложился в 200 байт.</p>
        <p class="punch-sub">Наведи на символ — он расскажет, что делает. Их всего восемь, других не будет.</p>
        <pre class="bf-cmds" id="bf-cmds"></pre>
        <p class="bf-out" id="bf-out">Урбан Мюллер, 1993</p>
        <pre class="bf-hello">++++++++[&gt;++++[&gt;++&gt;+++&gt;+++&gt;+&lt;&lt;&lt;&lt;-]&gt;+&gt;+&gt;-&gt;&gt;+[&lt;]&lt;-]&gt;&gt;.&gt;---.+++++++..+++.</pre>
        <p class="whisper-note">
          Это Hello World — вернее, его начало. У языка 442 официальных деривата,
          и вырос он из FALSE, чей компилятор влезал в 1024 байта.
        </p>
        <a class="whisper-link solo" href="https://esolangs.org/wiki/Brainfuck" target="_blank" rel="noopener">
          язык реально существует ${svgArrow}</a>
      </div>
    </div>

    <div class="malb toy" id="malb">
      <div class="obj-title">Malbolge · восьмой круг ада, 1998</div>
      <p class="punch">Первый Hello World на Malbolge нашла машина перебором. Люди не смогли.</p>
      <button class="obj-btn" id="malb-show" type="button">показать Hello World</button>
      <pre class="malb-code" id="malb-code" hidden>${MALBOLGE.replace(/</g, '&lt;')}</pre>
      <p class="malb-out" id="malb-out">да, вот это вот. просто «Hello, world».</p>
      <p class="whisper-note">
        Язык назван в честь восьмого круга ада. Его писали так, чтобы на нём было
        невозможно программировать, — и почти получилось: первую работающую программу
        нашёл лисп-скрипт, прочёсывавший пространство всех возможных программ.
        У Malbolge Unshackled команды вдобавок шифруются при каждом запуске.
      </p>
      <a class="whisper-link solo" href="https://esolangs.org/wiki/Malbolge" target="_blank" rel="noopener">
        язык реально существует ${svgArrow}</a>
    </div>

    <div class="ws toy" id="ws">
      <div class="obj-title">Whitespace · программа из табов и пробелов</div>
      <p class="punch">Вот вся программа:</p>
      <div class="ws-void" id="ws-void">
        <pre class="ws-blank" id="ws-blank">${POEM[1].replace(/\t/g, '    ')}</pre>
        <span class="ws-void-hint">(да, тут пусто. ткни — и увидишь код)</span>
      </div>
      <p class="punch-sub">А это стихотворение, внутри которого она и лежит. Буквы компилятор не читает вовсе.</p>
      <div class="ws-poem" id="ws-poem">${poem}</div>
      <p class="ws-out" id="ws-out">на вид — стихотворение с двумя пустыми строками</p>
      <button class="obj-btn small" id="ws-show" type="button">подсветить невидимое</button>
      <p class="whisper-note">
        Синтаксис языка состоит из трёх символов: пробел, табуляция, перевод строки.
        Всё остальное — комментарий, поэтому программу можно спрятать в чужом тексте
        так, что её не увидит никто, кроме компилятора.
      </p>
      <a class="whisper-link solo" href="https://esolangs.org/wiki/Whitespace" target="_blank" rel="noopener">
        язык реально существует ${svgArrow}</a>
    </div>
  </div>`;
}

/* ---------------------------------- behaviour -------------------------------- */

const BF: Array<[string, string]> = [
  ['>', 'шаг вправо по ленте'],
  ['<', 'шаг влево по ленте'],
  ['+', 'прибавить 1 к ячейке'],
  ['-', 'отнять 1 от ячейки'],
  ['.', 'напечатать ячейку'],
  [',', 'прочитать символ'],
  ['[', 'если ноль — прыгнуть за скобку'],
  [']', 'если не ноль — вернуться назад'],
];

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
      : '(пусто. помычи)';
    mooCode.scrollTop = mooCode.scrollHeight;
  };
  const paintCount = (): void => {
    const want = letter < HELLO.length ? HELLO.charCodeAt(letter) : 0;
    mooCount.textContent = want
      ? `в ячейке: ${cell} · нужно ${want} («${HELLO[letter]}»)`
      : `в ячейке: ${cell}`;
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
      mooOut.textContent =
        'одна буква. корова промычала 72 раза, чтобы сказать «H». осталось десять букв';
    } else if (letter >= HELLO.length) {
      mooOut.textContent = `«${HELLO}» — ${program.length} мычаний. вот на этом языке и пишут`;
      mooing = false;
      if (helloBtn) helloBtn.textContent = 'ещё раз';
      return;
    } else {
      mooOut.textContent = `буква ${letter} из ${HELLO.length}. стадо не сдаётся`;
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
      helloBtn.textContent = 'мычит…';
      mooOut.textContent = 'пошло мычание. это правда единственный способ';
      if (still) {
        // reduced motion: jump straight to the result, same arithmetic, no animation
        let total = 0;
        for (let i = 0; i < HELLO.length; i += 1) total += HELLO.charCodeAt(i) + 2;
        said = HELLO;
        mooSaid.textContent = said;
        mooCode.textContent = `MoO ×${total} … Moo`;
        mooOut.textContent = `«${HELLO}» — около ${total} мычаний`;
        mooing = false;
        helloBtn.textContent = 'ещё раз';
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
      mooOut.textContent = m ? `${cmd} — ${m.what}` : cmd;
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
      mooOut.textContent = 'стадо разошлось';
      if (helloBtn) helloBtn.textContent = 'промычать hello world';
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
      bfOut.textContent = `${ch} — ${what}`;
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
        malbShow.textContent = 'показать Hello World';
        malbOut.textContent = 'да, вот это вот. просто «Hello, world».';
        return;
      }
      malbCode.removeAttribute('hidden');
      malbCode.classList.add('spill');
      malbShow.textContent = 'убрать, я насмотрелся';
      malbOut.textContent =
        'это и есть вся программа. её не написали — её НАШЛИ: лисп-скрипт перебирал ' +
        'пространство всех возможных программ, пока одна из них не поздоровалась';
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
    if (wsShow) wsShow.textContent = 'спрятать обратно';
  };
  const hide = (): void => {
    poem.classList.remove('lit');
    if (wsVoid) wsVoid.classList.remove('lit');
    if (wsBlank) wsBlank.textContent = POEM[1].replace(/\t/g, '    ');
    wsOut.textContent = 'на вид — стихотворение с двумя пустыми строками';
    if (wsShow) wsShow.textContent = 'подсветить невидимое';
  };
  if (wsShow) {
    wsShow.addEventListener('click', () => {
      if (poem.classList.contains('lit')) hide();
      else reveal('вот они: точки — пробелы, стрелки — табы. для Whitespace код только это, а буквы — комментарий');
    });
  }
  if (wsVoid) {
    wsVoid.addEventListener('click', () => {
      if (wsVoid.classList.contains('lit')) hide();
      else reveal('в пустом поле лежали табы и пробелы. это и была вся программа');
    });
  }
  poem.querySelectorAll('.ws-line').forEach((l) => {
    l.addEventListener('click', () => {
      if (l.classList.contains('ws-code')) {
        reveal('эта «пустая» строка и есть программа. всё остальное компилятор не читает');
        return;
      }
      reveal('а вот эта строка для Whitespace — просто комментарий. код лежит в пустых');
    });
  });
  // real text selection over the poem also reveals the invisible characters
  const onSelect = (): void => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.anchorNode) return;
    if (!poem.contains(sel.anchorNode)) return;
    reveal('выделение выдало код: пробелы и табы стоят там, где на вид ничего нет');
  };
  document.addEventListener('selectionchange', onSelect);
  onCleanup(() => document.removeEventListener('selectionchange', onSelect));
}
