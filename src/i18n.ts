// TWO VERSIONS OF THE MUSEUM: ru (the current audience) and en (going wider).
//
// The language is picked ONCE per page load and never changes afterwards: the switcher
// stores the choice and reloads the page. That lets every module unfold its strings right
// at import time — t() calls are not smeared across event handlers and the layout is
// assembled exactly as before.
//
// EVERY VISITOR GETS THE SAME URLS: there is no language segment in the address at all.
// The choice lives in a single domain-wide setting — the localStorage key `lruns-lang`,
// which the main lruns.one site and future projects read and write as well.
//
// Resolution order: stored choice → browser language (a Russian-speaking browser gets ru,
// everyone else gets en).

import { dict, lists, type Phrase, type PhraseList } from './strings';

export type Lang = 'ru' | 'en';
export type { Phrase, PhraseList };

export type Key = keyof typeof dict;
export type ListKey = keyof typeof lists;

/** SHARED key for the whole lruns.one domain — the name must not change. */
const STORE_KEY = 'lruns-lang';

function isLang(v: string | null): v is Lang {
  return v === 'ru' || v === 'en';
}

/** localStorage can throw SecurityError on file:// — always go through this. */
function readStore(): Lang | null {
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

function writeStore(v: Lang): void {
  try {
    window.localStorage.setItem(STORE_KEY, v);
  } catch {
    // private mode or storage denied — the language then comes from the browser
  }
}

function fromBrowser(): Lang {
  const nav = window.navigator;
  const tags: string[] = [];
  if (nav.languages && nav.languages.length) tags.push(...nav.languages);
  if (nav.language) tags.push(nav.language);
  return tags.some((tag) => tag.toLowerCase().indexOf('ru') === 0) ? 'ru' : 'en';
}

function detect(): Lang {
  return readStore() || fromBrowser();
}

/** The language of this page load. Changed only through setLang() plus a reload. */
export const lang: Lang = detect();

export function isRu(): boolean {
  return lang === 'ru';
}

/**
 * A string by key. `vars` are substituted into {name} placeholders, so a translator is
 * free to reorder the pieces instead of gluing a phrase together from stumps in the code.
 */
export function t(key: Key, vars?: Record<string, string | number>): string {
  const s = (dict[key] as Phrase)[lang];
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole,
  );
}

/** A list of strings by key (lines, ticker text, plates). */
export function tl(key: ListKey): readonly string[] {
  return (lists[key] as PhraseList)[lang];
}

/** Store the choice and redraw the page in the other language. The URL is left alone. */
export function setLang(next: Lang): void {
  if (next === lang) return;
  writeStore(next);
  window.location.reload();
}

/** An unobtrusive [ru] · [en] in the corner, in the same typeface as everything else. */
export function langSwitchHtml(): string {
  const btn = (v: Lang): string =>
    `<button class="langsw-b${v === lang ? ' on' : ''}" type="button" data-lang="${v}"` +
    ` aria-pressed="${v === lang ? 'true' : 'false'}">[${v}]</button>`;
  return `<div class="langsw" role="group" aria-label="${t('lang.aria')}">${btn('ru')}<span
    class="langsw-sep" aria-hidden="true">&middot;</span>${btn('en')}</div>`;
}

export function mountLangSwitch(root: ParentNode): void {
  root.querySelectorAll('.langsw-b').forEach((b) => {
    b.addEventListener('click', (ev) => {
      // on the boot screen the whole dark room is the "enter" button: keep this click
      ev.stopPropagation();
      const v = (b as HTMLElement).dataset.lang;
      if (isLang(v || null)) setLang(v as Lang);
    });
  });
}

/** ru-only legal footnote. */
export function legalNoteHtml(): string {
  if (lang !== 'ru') return '';
  return `<p class="legal-note">${t('legal.meta')}</p>`;
}

/** A head meta tag: if it is absent from the markup, silently skip it. */
function setMeta(selector: string, value: string): void {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', value);
}

// Page language, tab title and META TAGS come from the same dictionary: without this an
// English-language link on reddit or HN would unfurl with a Russian description.
document.documentElement.lang = lang;
document.title = t('doc.title');
setMeta('meta[name="description"]', t('doc.description'));
setMeta('meta[property="og:title"]', t('og.title'));
setMeta('meta[property="og:description"]', t('og.description'));
