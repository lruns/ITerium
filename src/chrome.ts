// Shared room chrome: exhibit card, back button, modeline, start-at-bottom helper.
// Every exhibit must carry an author and a link to the original source.

import type { Exhibit } from './data';
import { isRu, t } from './i18n';
import { onCleanup } from './runtime';

export const svgArrow =
  '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M6 4h6v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const svgBack =
  '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/** Platform icons are inline SVG only; emoji glyphs are not used anywhere. */
function platformGlyph(p: string): string {
  const o = '<svg class="pico" viewBox="0 0 16 16" aria-hidden="true">';
  if (p === 'youtube') {
    return `${o}<rect x="1" y="3.5" width="14" height="9" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M6.6 6.2 10.4 8l-3.8 1.8z" fill="currentColor"/></svg>`;
  }
  if (p === 'instagram') {
    return `${o}<rect x="2" y="2" width="12" height="12" rx="3.4" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="8" cy="8" r="2.9" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="11.6" cy="4.4" r="0.9" fill="currentColor"/></svg>`;
  }
  if (p === 'tiktok') {
    return `${o}<circle cx="6" cy="11.4" r="2.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8.6 11.4V2.6c.7 1.9 2 2.8 3.8 2.9" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
  }
  return `${o}<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
}

/**
 * Neutral "external video" mark: a circle with a play triangle. Same size and
 * stroke as the platform icons, just without any brand shape.
 */
const svgVideoMark =
  '<svg class="pico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M6.6 5.6 10.6 8l-4 2.4z" fill="currentColor"/></svg>';

function attr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * Platform mark on a card. In the ru locale Instagram cards get the neutral mark
 * instead of the brand icon, and hovering it shows the ru-only legal footnote.
 * Touch has no hover — that case is covered by the same footnote in the hall
 * footer. The en locale is untouched.
 */
function platformIcon(p: string): string {
  if (p !== 'instagram' || !isRu()) return platformGlyph(p);
  const note = t('legal.meta');
  return `<span class="pnote" title="${attr(note)}">${svgVideoMark}<span
    class="pnote-tip" role="tooltip">${note}</span></span>`;
}

/**
 * Card image. When no frame of the original exists locally (third-party video is
 * never downloaded, for rights reasons), the exhibit supplies its own inline SVG
 * drawing, which is rendered instead.
 */
function shotHtml(e: Exhibit): string {
  if (e.art) return `<div class="shot own">${e.art}</div>`;
  return `<div class="shot"><img src="${e.poster}" alt="${t('chrome.shotAlt', { title: e.title })}" loading="lazy"/></div>`;
}

export function num(i: number): string {
  return String(i + 1).padStart(2, '0');
}

/**
 * TWO DISTINCT LINK TARGETS. The poster and the title open the WORK itself, while
 * the name chip opens the author's profile. One must never stand in for the other.
 */
function metaHtml(e: Exhibit): string {
  const extra = e.extra
    ? `<a class="chip link" href="${e.extra.url}" target="_blank" rel="noopener">+ ${e.extra.label} ${svgArrow}</a>`
    : '';
  return `
      <div class="meta">
        <a class="chip link author" href="${e.authorUrl}" target="_blank" rel="noopener"
           aria-label="${t('chrome.authorAria', { author: e.author })}">${platformIcon(e.platform)}${e.author} ${svgArrow}</a>
        ${extra}
      </div>`;
}

/**
 * An exhibit renders as a physical object rather than a web card: a tilted polaroid
 * in the humor room, a film frame in the art room. The image dominates; the caption
 * is small and the author is a tiny chip.
 *
 * In the humor room the poster is covered by a link to the work, and the author chip
 * sits ON TOP of it (.meta has a higher z-index), so both targets stay clickable and
 * do not fight each other. The art room has no cover link at all: a click there
 * zooms the card first (see sat-actions).
 */
export function cardHtml(e: Exhibit, i: number, total: number, room: 'humor' | 'art'): string {
  const meta = metaHtml(e);

  if (room === 'humor') {
    return `
  <article class="card polaroid o-${e.orient} reveal" id="ex-${e.id}">
    <div class="card-cmd">$ open exhibit --id=${e.id}<span class="cur"></span></div>
    <div class="frame">
      ${shotHtml(e)}
      <div class="caption">
        <h3>${e.title}</h3>
        <p class="hook">${e.hook}</p>
        ${meta}
      </div>
      <a class="cover" href="${e.url}" target="_blank" rel="noopener" aria-label="${t('chrome.workAria', { title: e.title })}"></a>
    </div>
  </article>`;
  }

  // Art room: satellite card. A click does NOT navigate away — it pulls the card
  // toward the camera, and only the zoomed state exposes the two outbound links.
  return `
  <article class="card slide o-${e.orient}" id="ex-${e.id}">
    <div class="frame">
      <div class="sprocket left" aria-hidden="true"></div>
      <div class="sprocket right" aria-hidden="true"></div>
      ${shotHtml(e)}
      <div class="caption">
        <span class="card-num">${num(i)}/${num(total - 1)}</span>
        <h3>${e.title}</h3>
        <p class="hook">${e.hook}</p>
        ${meta}
      </div>
      <button class="cover zoom" type="button" aria-label="${t('chrome.zoomAria', { title: e.title })}"></button>
      <div class="sat-actions">
        <a class="chip link" href="${e.url}" target="_blank" rel="noopener">${t('chrome.chipVideo')} ${svgArrow}</a>
        <a class="chip link" href="${e.authorUrl}" target="_blank" rel="noopener">${t('chrome.chipAuthor')} ${svgArrow}</a>
        <button class="chip sat-close" type="button">${t('chrome.close')}</button>
      </div>
    </div>
  </article>`;
}

/**
 * Source polaroid placed next to its stand. Same polaroid as a regular exhibit card,
 * plus a "why it is here" line so the visitor can see what the neighbouring
 * interactive piece grew out of.
 */
export function plaqueHtml(e: Exhibit, why: string): string {
  const meta = metaHtml(e);
  return `
  <article class="card polaroid source o-${e.orient} reveal" id="pl-${e.id}">
    <div class="card-cmd">$ open exhibit --id=${e.id}<span class="cur"></span></div>
    <div class="frame">
      ${shotHtml(e)}
      <div class="caption">
        <p class="plaque-why">${why}</p>
        <h3>${e.title}</h3>
        <p class="hook">${e.hook}</p>
        ${meta}
      </div>
      <a class="cover" href="${e.url}" target="_blank" rel="noopener" aria-label="${t('chrome.workAria', { title: e.title })}"></a>
    </div>
  </article>`;
}

/**
 * Reserved slot: an empty frame standing next to an exhibit.
 * IMPORTANT: it deliberately explains nothing. A dashed frame and a short
 * "coming soon" label, nothing else — no name, no link, no quote.
 */
export function reservedHtml(label = t('chrome.soon')): string {
  return `
  <article class="card polaroid reserved o-wide reveal" aria-label="${t('chrome.reservedAria')}">
    <div class="frame">
      <div class="shot empty" aria-hidden="true">
        <svg viewBox="0 0 320 180" class="own-shot">
          <path d="M8 8h304v164H8z" fill="none" stroke="currentColor" stroke-width="1.4"
                stroke-dasharray="7 7" opacity="0.5"/>
          <path d="M150 90h20M160 80v20" stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" opacity="0.55"/>
        </svg>
      </div>
      <div class="caption">
        <p class="reserved-label">${label}</p>
      </div>
    </div>
  </article>`;
}

/** Stand: an interactive piece and its source polaroids grouped in ONE block. */
export function stand(toy: string, plaques: string[]): string {
  const labels = plaques.length ? `<div class="plaques">${plaques.join('')}</div>` : '';
  return `<div class="stand">${toy}${labels}</div>`;
}

/**
 * Author chip next to a station. Two-step as well: the chip first expands in place
 * and reveals two links, and only those navigate away.
 */
export function authorChipHtml(
  label: string,
  platform: string,
  videoUrl: string,
  authorUrl: string,
): string {
  return `<span class="achip">
    <button class="chip link achip-btn" type="button" aria-expanded="false">${platformIcon(platform)}${label}</button>
    <span class="achip-pop" hidden>
      <a class="chip link" href="${videoUrl}" target="_blank" rel="noopener">${t('chrome.chipVideo')} ${svgArrow}</a>
      <a class="chip link" href="${authorUrl}" target="_blank" rel="noopener">${t('chrome.chipAuthor')} ${svgArrow}</a>
    </span>
  </span>`;
}

/** Wire up every two-step chip inside the given node. */
export function mountAuthorChips(root: ParentNode): void {
  root.querySelectorAll('.achip').forEach((box) => {
    const btn = box.querySelector('.achip-btn') as HTMLButtonElement | null;
    const pop = box.querySelector('.achip-pop') as HTMLElement | null;
    if (!btn || !pop) return;
    btn.addEventListener('click', () => {
      const open = !pop.hasAttribute('hidden');
      if (open) pop.setAttribute('hidden', '');
      else pop.removeAttribute('hidden');
      btn.setAttribute('aria-expanded', String(!open));
      box.classList.toggle('open', !open);
    });
  });
}

export function backBtn(): string {
  return `<a class="back" href="#menu">${svgBack} cd ..</a>`;
}

/**
 * Emacs-style modeline. `extra` is a slot for real controls (e.g. the flight-mode
 * toggle): when present the line is no longer purely decorative, so aria-hidden
 * moves from the whole line down onto its decorative parts.
 */
export function modeline(buffer: string, mode: string, extra = ''): string {
  const hide = extra ? '' : ' aria-hidden="true"';
  const dec = extra ? ' aria-hidden="true"' : '';
  return `
  <div class="modeline room-modeline"${hide}>
    <span class="ml-flags"${dec}>-UUU:**-</span>
    <span class="ml-buf"${dec}>F1&nbsp; ${buffer}</span>
    <span class="ml-pos" id="ml-pos"${dec}>Start</span>
    <span class="ml-mode"${dec}>${mode}</span>
    ${extra}
    <span class="ml-tail"${dec}>${'-'.repeat(200)}</span>
  </div>`;
}

/** Both rooms read bottom-up, so they must open scrolled to the bottom. */
export function startAtBottom(): void {
  const jump = (): void => {
    const se = document.scrollingElement as HTMLElement | null;
    if (se) window.scrollTo(0, se.scrollHeight);
  };
  jump();
  const t = window.setTimeout(jump, 60);
  window.addEventListener('load', jump);
  onCleanup(() => {
    window.clearTimeout(t);
    window.removeEventListener('load', jump);
  });
}
