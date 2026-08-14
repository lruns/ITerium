// "Claude's Plan" exhibit.
//
// What is here:
// 1. Video facade: a local poster plus a play button.
//    VERIFIED IN A REAL BROWSER: embedding is disabled by the author for THIS
//    video — the player answers "Video unavailable" on both youtube.com/embed
//    and the nocookie host (another video embedded the same way plays fine, so
//    this is not a bug in our code). With no player there is also no timecode
//    sync (enablejsapi + postMessage): there is nothing to sync against. Hence
//    an explicit fallback mode:
// 2. KARAOKE. Lyric lines advance on their own (or via the "next" button), and
//    each is rendered in the UI the clip itself uses for it: git diff, terminal,
//    an .md file, a downed-server alert. Each line carries a short translation.
//    Only seven short quotes are used — the full lyrics are not reproduced; they
//    belong to the author, who is credited with a link to the clip next to this.

import { svgArrow } from '../chrome';
import { t } from '../i18n';
import { later, reducedMotion } from '../runtime';
import { embedHtml, mountEmbed, type EmbedOpts } from './embed';

const VIDEO = 'gFx-NjTw3sM';
const POSTER = 'assets/posters/claudes-plan.jpg';

const EMBED: EmbedOpts = {
  id: 'lyric',
  videoId: VIDEO,
  poster: POSTER,
  alt: t('plan.alt'),
  cap: t('plan.cap'),
  embeddable: false, // embedding disabled by the author — verified in a real browser
  note: t('plan.note'),
};

type Skin = 'term' | 'diff' | 'md' | 'alert' | 'gauge' | 'keys';

interface Beat {
  /** Short quote: exactly one line, never a whole verse. */
  en: string;
  /** Russian gloss so the meaning of the line is clear. */
  ru: string;
  at: string;
  skin: Skin;
}

const BEATS: Beat[] = [
  { en: 'I start my day in plan mode', ru: t('plan.beat.0'), at: '0:42', skin: 'term' },
  { en: 'I write lines, but not for code', ru: t('plan.beat.1'), at: '0:46', skin: 'md' },
  { en: 'Server down cuz MCP', ru: t('plan.beat.2'), at: '0:53', skin: 'alert' },
  { en: 'Claude knows my API keys', ru: t('plan.beat.3'), at: '0:56', skin: 'keys' },
  { en: 'Make another .md', ru: t('plan.beat.4'), at: '0:59', skin: 'md' },
  { en: 'bad changes they shipping', ru: t('plan.beat.5'), at: '1:04', skin: 'diff' },
  { en: 'Gotta watch context window', ru: t('plan.beat.6'), at: '1:38', skin: 'gauge' },
];

/** Each line gets its own UI skin, as in the clip. All markup is drawn by us. */
function skinHtml(b: Beat): string {
  if (b.skin === 'diff') {
    return `<div class="lv-diff">
      <div class="lv-diff-head">@@ they shipping @@</div>
      <div class="lv-diff-bad">✗ ${b.en}</div>
      <div class="lv-diff-line">- they shipping</div>
      <div class="lv-diff-line">- they shipping</div>
    </div>`;
  }
  if (b.skin === 'term') {
    return `<div class="lv-term">
      <div class="lv-term-cmd">$ claude</div>
      <div class="lv-term-out">${b.en}</div>
      <div class="lv-term-bar">plan mode on (shift+tab to cycle)</div>
    </div>`;
  }
  if (b.skin === 'md') {
    return `<div class="lv-md">
      <div class="lv-md-name">CLAUDE.md</div>
      <div class="lv-md-body"># ${b.en}</div>
    </div>`;
  }
  if (b.skin === 'alert') {
    return `<div class="lv-alert">
      <div class="lv-alert-head">500 · service unavailable</div>
      <div class="lv-alert-body">${b.en}</div>
    </div>`;
  }
  if (b.skin === 'keys') {
    return `<div class="lv-keys">
      <div class="lv-keys-row">ANTHROPIC_API_KEY <b>sk-••••••••••••</b></div>
      <div class="lv-keys-body">${b.en}</div>
    </div>`;
  }
  return `<div class="lv-gauge">
    <div class="lv-gauge-body">${b.en}</div>
    <div class="lv-gauge-bar"><i></i></div>
    <div class="lv-gauge-note">context: 187k / 200k</div>
  </div>`;
}

export function claudePlanHtml(): string {
  return `<div class="obj mid toy lyric reveal" id="lyric">
    <div class="obj-title">$ claude --make-lyric-video</div>
    <p class="obj-hint top">${t('plan.hint')}</p>

    ${embedHtml(EMBED)}

    <div class="lyric-screen" id="lyric-screen" aria-live="polite">
      <p class="lyric-idle" id="lyric-idle">${t('plan.idle')}</p>
    </div>
    <div class="lyric-row">
      <button class="obj-btn" id="lyric-go" type="button">${t('plan.go')}</button>
      <button class="obj-btn small" id="lyric-next" type="button">${t('plan.next')}</button>
      <span class="lyric-stat" id="lyric-stat">${t('plan.stat', { n: 0, total: BEATS.length })}</span>
    </div>
    <a class="plate lyric-door" id="lyric-door" href="https://www.youtube.com/watch?v=${VIDEO}"
       target="_blank" rel="noopener">${t('plan.door')} ${svgArrow}</a>
  </div>`;
}

export function mountClaudePlan(root: HTMLElement): void {
  const host = root.querySelector('#lyric') as HTMLElement | null;
  if (!host) return;
  const screen = host.querySelector('#lyric-screen') as HTMLElement;
  const stat = host.querySelector('#lyric-stat') as HTMLElement;
  const go = host.querySelector('#lyric-go') as HTMLButtonElement;
  const next = host.querySelector('#lyric-next') as HTMLButtonElement;
  let i = -1;
  let auto = false;

  mountEmbed(host, EMBED);

  const show = (n: number): void => {
    i = n;
    const b = BEATS[i];
    const card = document.createElement('div');
    card.className = `lv-card ${b.skin}`;
    card.innerHTML =
      `<span class="lv-at">${b.at}</span>${skinHtml(b)}<p class="lv-ru">${b.ru}</p>`;
    screen.innerHTML = '';
    screen.appendChild(card);
    window.requestAnimationFrame(() => card.classList.add('in'));
    if (!reducedMotion()) {
      card.classList.add('glitch');
      later(() => card.classList.remove('glitch'), 380);
    }
    stat.textContent = t('plan.stat', { n: i + 1, total: BEATS.length });
  };

  const step = (): void => {
    if (!auto) return;
    if (i + 1 >= BEATS.length) {
      auto = false;
      host.classList.add('done');
      go.textContent = t('plan.again');
      stat.textContent = t('plan.statEnd', { n: BEATS.length, total: BEATS.length });
      return;
    }
    show(i + 1);
    later(step, 2400);
  };

  go.addEventListener('click', () => {
    host.classList.remove('done');
    i = -1;
    auto = !reducedMotion();
    show(0);
    if (auto) later(step, 2400);
  });

  next.addEventListener('click', () => {
    auto = false;
    show((i + 1) % BEATS.length);
  });
}
