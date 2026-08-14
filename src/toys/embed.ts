// Click-to-load video facade.
//
// Before the click there is no YouTube at all: just a local poster image and a
// play button. The click swaps in a youtube-nocookie player with autoplay, so no
// cookies and no requests are made up front.
//
// Two cases where the player cannot load, detected up front instead of showing
// the visitor a third-party error:
//  1. file:// — the page has no origin and YouTube answers with error 153;
//  2. the video's author disabled embedding — the player says "Video unavailable".
// In both cases the click opens the video on YouTube in a new tab instead.

import { t } from '../i18n';

const playIcon =
  '<svg viewBox="0 0 64 64" class="play-ico" aria-hidden="true">' +
  '<circle cx="32" cy="32" r="27" fill="rgba(10,7,3,0.72)" stroke="currentColor" stroke-width="2"/>' +
  '<path d="M26 21 45 32 26 43z" fill="currentColor"/></svg>';

export interface EmbedOpts {
  id: string;
  videoId: string;
  poster: string;
  alt: string;
  cap: string;
  /** false: the author disabled embedding, so the player is not even attempted. */
  embeddable: boolean;
  note: string;
}

export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function embedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
}

export function embedHtml(o: EmbedOpts): string {
  const target = o.embeddable ? embedUrl(o.videoId) : watchUrl(o.videoId);
  return `<div class="embed" id="${o.id}-embed">
      <img class="embed-poster" src="${o.poster}" alt="${o.alt}" loading="lazy"/>
      <button class="embed-play" id="${o.id}-play" type="button" data-embed="${target}"
              aria-label="${o.cap}">${playIcon}
        <span class="embed-cap">${o.cap}</span>
      </button>
    </div>
    <p class="embed-note" id="${o.id}-note">${o.note}</p>`;
}

function canEmbed(): boolean {
  return window.location.protocol !== 'file:';
}

export function mountEmbed(root: HTMLElement, o: EmbedOpts): void {
  const box = root.querySelector(`#${o.id}-embed`) as HTMLElement | null;
  const play = root.querySelector(`#${o.id}-play`) as HTMLButtonElement | null;
  const note = root.querySelector(`#${o.id}-note`) as HTMLElement | null;
  if (!box || !play || !note) return;
  play.addEventListener('click', () => {
    if (box.classList.contains('live')) return;
    if (!o.embeddable) {
      window.open(watchUrl(o.videoId), '_blank', 'noopener');
      note.textContent = t('embed.blocked');
      return;
    }
    if (!canEmbed()) {
      window.open(watchUrl(o.videoId), '_blank', 'noopener');
      note.textContent = t('embed.file');
      return;
    }
    const frame = document.createElement('iframe');
    frame.className = 'embed-frame';
    frame.src = embedUrl(o.videoId);
    frame.title = o.alt;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    box.classList.add('live');
    box.appendChild(frame);
    note.textContent = t('embed.live');
  });
}
