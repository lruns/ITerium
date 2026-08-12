// "You too can be a warrior": the humour is built on ABSURD ESCALATION.
//
// The copypasta runs from "even the girls bullied me" to "joined street gangs",
// all supposedly caused by solving olympiad problems. We play it as a LEVELLING
// UP sequence: steps drop in one by one like achievements and loot, and the
// rewards get more absurd as it goes.
//
// The text is a close retelling in our own words; the original is not copied
// verbatim. IMPORTANT: attribution is to the source channel only — the author of
// the copypasta is not named. A card linking to the original stands next to this
// exhibit.

import { later, reducedMotion } from '../runtime';

interface Step {
  icon: string;
  text: string;
  gain: string;
  kind?: 'gift' | 'call' | 'loot' | 'final';
}

const STEPS: Step[] = [
  { icon: '[-]', text: 'школа. обижают все — даже девочки', gain: 'страдание +1' },
  { icon: '[!]', text: 'в туалет врывается ОНО и разгоняет девочек', gain: 'событие' , kind: 'call' },
  { icon: '[$]', text: 'вручает сборник олимпиадных задач', gain: 'получен дар', kind: 'gift' },
  { icon: '[»]', text: '«ты тоже можешь быть воином»', gain: 'класс: воин', kind: 'call' },
  { icon: '[+]', text: 'ты встал и начал решать', gain: 'навык: решать +10' },
  { icon: '[+]', text: 'тебя зауважали девочки', gain: 'репутация +25' },
  { icon: '[+]', text: 'тебя зауважали мальчики', gain: 'репутация +25' },
  { icon: '[$]', text: 'выпали БОЛЬШИЕ ШТАНЫ', gain: 'легендарный предмет', kind: 'loot' },
  { icon: '[+]', text: 'ходишь по школе на понтах с кастетом', gain: 'понты +99' },
  { icon: '[*]', text: 'влился в уличные банды', gain: 'фракция открыта', kind: 'loot' },
  { icon: '[=]', text: 'вот что могут делать олимпиады', gain: 'конец пути', kind: 'final' },
];

export function warriorHtml(): string {
  return `<div class="obj mid toy warrior reveal" id="warrior">
    <div class="obj-title">$ ./become --warrior</div>
    <p class="obj-hint top">путь героя по версии интернета: от олимпиадных задач до уличных банд</p>
    <div class="war-screen" id="war-screen" aria-live="polite">
      <p class="war-idle" id="war-idle">[ путь не начат ]</p>
    </div>
    <div class="war-row">
      <button class="obj-btn" id="war-go" type="button">стать воином</button>
      <span class="war-stamp">уровень: <b id="war-lvl">0</b> / ${STEPS.length}</span>
      <span class="war-bar" aria-hidden="true"><i id="war-fill"></i></span>
    </div>
    <p class="war-out" id="war-out">> путь ждёт. жми</p>
  </div>`;
}

export function mountWarrior(root: HTMLElement): void {
  const host = root.querySelector('#warrior') as HTMLElement | null;
  if (!host) return;
  const screen = host.querySelector('#war-screen') as HTMLElement;
  const lvl = host.querySelector('#war-lvl') as HTMLElement;
  const fill = host.querySelector('#war-fill') as HTMLElement;
  const out = host.querySelector('#war-out') as HTMLElement;
  const go = host.querySelector('#war-go') as HTMLButtonElement;
  let busy = false;

  const node = (s: Step): HTMLElement => {
    const row = document.createElement('p');
    row.className = `war-step${s.kind ? ` ${s.kind}` : ''}`;
    const ico = document.createElement('b');
    ico.textContent = s.icon;
    const txt = document.createElement('span');
    txt.textContent = s.text;
    const gain = document.createElement('i');
    gain.textContent = s.gain;
    row.appendChild(ico);
    row.appendChild(txt);
    row.appendChild(gain);
    return row;
  };

  const run = (): void => {
    screen.innerHTML = '';
    let i = 0;
    const step = (): void => {
      if (i >= STEPS.length) {
        busy = false;
        go.textContent = 'пройти путь заново';
        host.classList.add('done');
        out.textContent = '> путь пройден. олимпиады работают';
        return;
      }
      const el = node(STEPS[i]);
      screen.appendChild(el);
      window.requestAnimationFrame(() => el.classList.add('in'));
      i += 1;
      lvl.textContent = String(i);
      fill.style.width = `${((i / STEPS.length) * 100).toFixed(1)}%`;
      out.textContent = `> ${STEPS[i - 1].gain}`;
      screen.scrollTop = screen.scrollHeight;
      later(step, reducedMotion() ? 0 : 620);
    };
    step();
  };

  go.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    host.classList.remove('done');
    out.textContent = '> путь начат…';
    run();
  });
}
