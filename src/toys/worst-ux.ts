// "The best user UX": the worst-interfaces genre. Inspired by a clip where an
// Unsubscribe button is blown away by a real desk fan. The source clip sits next
// to this as its own card with author credit; this is only our reimplementation.

import { svgArrow } from '../chrome';
import { reducedMotion, stepEngine } from '../runtime';

export function worstUxHtml(): string {
  return `<div class="obj mid toy ux reveal" id="ux">
    <div class="obj-title">$ ./the-best-user-ux --award=2026</div>
    <p class="obj-hint top">три интерфейса, которые технически работают</p>

    <div class="ux-row">
      <span class="ux-label">отписаться от рассылки</span>
      <div class="ux-field" id="ux-field">
        <button class="ux-run" id="ux-run" type="button">Отписаться</button>
        <span class="ux-fan" id="ux-fan" aria-hidden="true">≋≋≋</span>
      </div>
    </div>

    <div class="ux-row">
      <span class="ux-label">громкость</span>
      <div class="ux-field">
        <input class="ux-slider" id="ux-vol" type="range" min="0" max="100" value="50"
               aria-label="громкость"/>
        <span class="ux-val" id="ux-volval">50</span>
      </div>
    </div>

    <div class="ux-row">
      <span class="ux-label">я не робот</span>
      <div class="ux-field">
        <label class="ux-check"><input type="checkbox" id="ux-bot"/> подтверждаю</label>
        <span class="ux-val" id="ux-botval">ждём подтверждения</span>
      </div>
    </div>

    <p class="ux-foot" id="ux-foot">> всё по спецификации</p>
    <a class="plate" href="https://vm.tiktok.com/ZN8Rnkbw5/" target="_blank" rel="noopener">
      оригинал жанра: @inhwoi ${svgArrow}</a>
  </div>`;
}

export function mountWorstUx(root: HTMLElement): void {
  const host = root.querySelector('#ux') as HTMLElement | null;
  if (!host) return;
  const field = root.querySelector('#ux-field') as HTMLElement;
  const run = root.querySelector('#ux-run') as HTMLButtonElement;
  const fan = root.querySelector('#ux-fan') as HTMLElement;
  const vol = root.querySelector('#ux-vol') as HTMLInputElement;
  const volval = root.querySelector('#ux-volval') as HTMLElement;
  const bot = root.querySelector('#ux-bot') as HTMLInputElement;
  const botval = root.querySelector('#ux-botval') as HTMLElement;
  const foot = root.querySelector('#ux-foot') as HTMLElement;
  const engine = stepEngine();
  let dodges = 0;

  // 1. the button is blown away: bring the cursor close and it flies off
  const blow = (ev: PointerEvent): void => {
    if (reducedMotion()) return;
    const r = field.getBoundingClientRect();
    const b = run.getBoundingClientRect();
    const near = Math.abs(ev.clientX - (b.left + b.width / 2)) < 90 &&
      Math.abs(ev.clientY - (b.top + b.height / 2)) < 60;
    if (!near) return;
    dodges += 1;
    // blown AWAY from the cursor: approach from the left and it flies right, and vice versa
    const room = Math.max(40, r.width - b.width - 90);
    const fromLeft = ev.clientX - r.left < r.width / 2;
    const x = fromLeft
      ? room * (0.6 + Math.random() * 0.4)
      : room * (Math.random() * 0.34);
    run.style.transform = `translate3d(${x.toFixed(0)}px, ${((Math.random() - 0.5) * 18).toFixed(0)}px, 0)`;
    // the fan appears on the side the cursor came from, so the cause is visible
    fan.classList.toggle('right', !fromLeft);
    fan.classList.add('on');
    engine.next(() => fan.classList.remove('on'), 500);
    foot.textContent =
      dodges < 3
        ? '> кнопка на месте. просто сквозняк'
        : `> попыток отписаться: ${dodges}. вентилятор не выключается`;
  };
  field.addEventListener('pointermove', blow);
  run.addEventListener('click', () => {
    foot.textContent = '> вы успешно НЕ отписались. спасибо, что остаётесь';
  });

  // 2. the volume slider runs the wrong way
  const paintVol = (): void => {
    const v = 100 - Number(vol.value);
    volval.textContent = String(v);
    foot.textContent =
      v > 80 ? '> громче некуда (вы тянули влево)' : v < 20 ? '> тише некуда (вы тянули вправо)' : '> всё по спецификации';
  };
  vol.addEventListener('input', paintVol);
  paintVol();

  // 3. the checkbox that unchecks itself
  bot.addEventListener('change', () => {
    if (!bot.checked) {
      botval.textContent = 'ждём подтверждения';
      return;
    }
    botval.textContent = 'проверяем…';
    if (reducedMotion()) {
      botval.textContent = 'проверка не пройдена (галочка снята автоматически)';
      bot.checked = false;
      return;
    }
    engine.next(() => {
      bot.checked = false;
      botval.textContent = 'проверка не пройдена. попробуйте ещё раз';
      foot.textContent = '> робот не подтверждён. вы, скорее всего, тоже';
    }, 1200);
  });
}
