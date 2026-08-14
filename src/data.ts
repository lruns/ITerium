// Exhibit data. House rule: every exhibit carries an author and a link to the original.
// Texts are read from the dictionary (src/strings.ts) once, at import time: the page
// language does not change during the lifetime of a tab.

import { t, tl } from './i18n';

/** Poster shape. Every frame was cropped by hand to the sensible one — no blind cover(). */
export type Orient = 'wide' | 'square' | 'tall';

export interface Exhibit {
  id: string;
  title: string;
  hook: string;
  author: string;
  platform: string;
  /** Link to the video or post itself. */
  url: string;
  /**
   * Link to the AUTHOR, not to the work: clicking the author name must open their profile.
   * YouTube channels come from YouTube's official oEmbed response (author_url); Instagram
   * and TikTok profiles are derived from the author's handle.
   */
  authorUrl: string;
  /** Still frame from the work. Empty means we have no frame and the card draws its own (see art). */
  poster: string;
  /**
   * Our OWN artwork (inline SVG) instead of a third-party frame. Used where no frame of the
   * original is available: nothing of someone else's is embedded, and the link to the
   * original still sits alongside it.
   */
  art?: string;
  orient: Orient;
  extra?: { label: string; url: string };
}

/**
 * Stand-in frame for the Sigma Boy clip: we hold no frame of it (third-party video is not
 * downloaded, for rights reasons), so we draw our own in the museum's style: dark screen,
 * silhouette in headphones, visor stripe, and the clip's pink/green palette.
 */
const sigmaArt = `<svg class="own-shot" viewBox="0 0 320 180" role="img" aria-label="${t('ex.sigmaArt.alt')}">
  <defs>
    <linearGradient id="sg-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#180a20"/><stop offset="1" stop-color="#07110d"/>
    </linearGradient>
  </defs>
  <rect width="320" height="180" fill="url(#sg-bg)"/>
  <g fill="none" stroke="#3af08a" stroke-width="1" opacity="0.28">
    <path d="M0 44h320M0 92h320M0 140h320"/>
  </g>
  <g transform="translate(160 96)">
    <circle r="40" fill="none" stroke="#ff56b0" stroke-width="2.4"/>
    <path d="M-46 -4a46 46 0 0 1 92 0" fill="none" stroke="#3af08a" stroke-width="4" stroke-linecap="round"/>
    <rect x="-52" y="-6" width="13" height="26" rx="5" fill="#3af08a"/>
    <rect x="39" y="-6" width="13" height="26" rx="5" fill="#3af08a"/>
    <rect x="-26" y="-12" width="52" height="9" rx="2" fill="#0a0a0f" stroke="#ff56b0" stroke-width="1.6"/>
    <path d="M-13 20h26" stroke="#ff56b0" stroke-width="2.2" stroke-linecap="round"/>
  </g>
  <text x="160" y="164" text-anchor="middle" font-family="ui-monospace, monospace" font-size="15"
        letter-spacing="4" fill="#ffd166">SIGMA BOY</text>
  <text x="10" y="20" font-family="ui-monospace, monospace" font-size="9" fill="#6f6288">${t('ex.sigmaArt.cap')}</text>
</svg>`;

export const humorExhibits: Exhibit[] = [
  {
    id: 'kai-eso',
    title: t('ex.kai-eso.title'),
    hook: t('ex.kai-eso.hook'),
    author: 'Kai Lentit',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=ieqsL5NkS6I',
    authorUrl: 'https://www.youtube.com/@programmersarealsohuman5909',
    poster: 'assets/posters/kai-eso.jpg',
    orient: 'wide',
  },
  {
    id: 'kai-js',
    title: t('ex.kai-js.title'),
    hook: t('ex.kai-js.hook'),
    author: 'Kai Lentit',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=Uo3cL4nrGOk',
    authorUrl: 'https://www.youtube.com/@programmersarealsohuman5909',
    poster: 'assets/posters/kai-js.jpg',
    orient: 'wide',
  },
  {
    id: 'ardens',
    title: t('ex.ardens.title'),
    hook: t('ex.ardens.hook'),
    author: 'Ardens',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=Ysled8GvKuk',
    authorUrl: 'https://www.youtube.com/@Ardens.',
    poster: 'assets/posters/ardens.jpg',
    orient: 'wide',
  },
  {
    id: 'meditation',
    title: t('ex.meditation.title'),
    hook: t('ex.meditation.hook'),
    author: '@ahh.gpt',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/Dbj6mf-Rscq/',
    authorUrl: 'https://www.instagram.com/ahh.gpt/',
    poster: 'assets/posters/meditation.jpg',
    orient: 'tall',
  },
  {
    id: 'reset',
    title: t('ex.reset.title'),
    hook: t('ex.reset.hook'),
    author: '@webbyvaris',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DaZpzZ4h7XM/',
    authorUrl: 'https://www.instagram.com/webbyvaris/',
    poster: 'assets/posters/reset.jpg',
    orient: 'tall',
  },
  {
    // Placed in the "Claude pain" cluster, next to the usage-limit reset ritual.
    id: 'claudes-plan',
    title: "Claude's Plan",
    hook: t('ex.claudes-plan.hook'),
    author: 'Jeff Guo',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=gFx-NjTw3sM',
    authorUrl: 'https://www.youtube.com/@JeffGwoah',
    poster: 'assets/posters/claudes-plan.jpg',
    orient: 'wide',
  },
  {
    id: 'adhd',
    title: 'ADHD Sort',
    hook: t('ex.adhd.hook'),
    author: '@swapjs.tt',
    platform: 'tiktok',
    url: 'https://vm.tiktok.com/ZN8RnPrMw/',
    authorUrl: 'https://www.tiktok.com/@swapjs.tt',
    poster: 'assets/posters/adhd.jpg',
    orient: 'tall',
    extra: { label: 'Epstein Sort', url: 'https://vm.tiktok.com/ZN8Rnh3S6/' },
  },
  {
    id: 'worstux',
    title: t('ex.worstux.title'),
    hook: t('ex.worstux.hook'),
    author: '@inhwoi',
    platform: 'tiktok',
    url: 'https://vm.tiktok.com/ZN8Rnkbw5/',
    authorUrl: 'https://www.tiktok.com/@inhwoi',
    poster: 'assets/posters/worstux.jpg',
    orient: 'wide',
  },
  {
    id: 'brevno',
    title: t('ex.brevno.title'),
    hook: t('ex.brevno.hook'),
    author: '@brevnocodescript',
    platform: 'tiktok',
    url: 'https://vm.tiktok.com/ZN8RnD8L7/',
    authorUrl: 'https://www.tiktok.com/@brevnocodescript',
    poster: 'assets/posters/brevno.jpg',
    orient: 'tall',
  },
  {
    // Sits next to GenAlpha Lang: that language is built from slang, and this clip is the
    // slang itself. The author's channel was verified separately.
    id: 'sigma-boy',
    title: 'Sigma Boy (Official Music Video)',
    hook: t('ex.sigma-boy.hook'),
    author: t('ex.sigma-boy.author'),
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=ueNY30Cs8Lk',
    authorUrl: 'https://www.youtube.com/@betsyofficial',
    poster: '',
    art: sigmaArt,
    orient: 'wide',
  },
  {
    // Attribution note: credit the channel only — the author of the original text is not
    // named. Channel and title were verified against YouTube's official oEmbed response.
    id: 'warrior',
    title: t('ex.warrior.title'),
    hook: t('ex.warrior.hook'),
    author: t('ex.warrior.author'),
    platform: 'youtube',
    url: 'https://youtu.be/YQQHFUvyL4o',
    authorUrl: 'https://www.youtube.com/@%D0%A4%D0%B8%D0%B7%D0%BA%D0%B5%D0%BA-%D1%886%D1%87',
    poster: 'assets/posters/warrior.jpg',
    orient: 'wide',
  },
  {
    // Poster is a frame from the video itself (at 0:32), extracted with ffmpeg. Title and
    // channel were verified against YouTube's official oEmbed response.
    // Attribution note: mention the lecturer's work and confirmed facts only.
    id: 'homotopy',
    title: t('ex.homotopy.title'),
    hook: t('ex.homotopy.hook'),
    author: t('ex.homotopy.author'),
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=mqAf5lOJZew',
    authorUrl: 'https://www.youtube.com/@OpenLektorium',
    poster: 'assets/posters/homotopy.jpg',
    orient: 'wide',
    extra: { label: t('ex.homotopy.extra'), url: 'https://www.lektorium.tv/course/22939' },
  },
];

export const artExhibits: Exhibit[] = [
  {
    id: 'sky',
    title: t('ex.sky.title'),
    hook: t('ex.sky.hook'),
    author: '@coolacloy',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/CvaIWgJut5d/',
    authorUrl: 'https://www.instagram.com/coolacloy/',
    poster: 'assets/posters/sky.jpg',
    orient: 'tall',
  },
  {
    id: 'calendar',
    title: t('ex.calendar.title'),
    hook: t('ex.calendar.hook'),
    author: '@jordan.gladman',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DbBZDozOtz-/',
    authorUrl: 'https://www.instagram.com/jordan.gladman/',
    poster: 'assets/posters/calendar.jpg',
    orient: 'wide',
  },
  {
    id: 'redacted',
    title: '[redacted]',
    hook: t('ex.redacted.hook'),
    author: '@jordan.gladman',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DbPHC4qprsY/',
    authorUrl: 'https://www.instagram.com/jordan.gladman/',
    poster: 'assets/posters/redacted.jpg',
    orient: 'square',
  },
  {
    id: 'glyphs',
    title: t('ex.glyphs.title'),
    hook: t('ex.glyphs.hook'),
    author: '@manmothma',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DbVrfc1vGay/',
    authorUrl: 'https://www.instagram.com/manmothma/',
    poster: 'assets/posters/glyphs.jpg',
    orient: 'tall',
  },
  {
    id: 'vision',
    title: t('ex.vision.title'),
    hook: t('ex.vision.hook'),
    author: '@drezzdon',
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@drezzdon/video/7494013737150450990',
    authorUrl: 'https://www.tiktok.com/@drezzdon',
    poster: 'assets/posters/vision.jpg',
    orient: 'tall',
  },
  {
    id: 'win95',
    title: t('ex.win95.title'),
    hook: t('ex.win95.hook'),
    author: '@archivsieben',
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@archivsieben/video/7541121731533065494',
    authorUrl: 'https://www.tiktok.com/@archivsieben',
    poster: 'assets/posters/win95.jpg',
    orient: 'square',
  },
  {
    id: 'trance',
    title: t('ex.trance.title'),
    hook: t('ex.trance.hook'),
    author: 'Switch Angel',
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@switch.angel',
    authorUrl: 'https://www.tiktok.com/@switch.angel',
    poster: 'assets/posters/trance.jpg',
    orient: 'tall',
  },
];

// ASCII charts placed between exhibits: made-up museum metrics, drawn purely with block
// characters (no libraries, no emoji).
// NOTE: this array is indexed by position in room-humor.ts — adding or removing an entry
// means the indices there must be updated too.
export const asciiCharts: readonly string[] = tl('asciiCharts');

// Thin constellation dividers for the art room (no emoji, plain characters only).
export const artDividers: string[] = [
  '·      *       ·        ·     *',
  '*        ·      ·    *        ·',
  '·    ·        *      ·      ·',
  '·      *      ·        *     ·',
  '*      ·        ·   *      ·',
  '·   *      ·      ·      *',
];

// One-liners placed between the humour room's exhibits, forming the path through it.
export const pathJokes: readonly string[] = tl('pathJokes');

export const entryLines: readonly string[] = tl('entryLines');

// ---------- path selection menu (rendered inside the terminal) ----------

export interface MenuItem {
  key: string;
  id: string;
  label: string;
  note: string;
  ready: boolean;
}

export const menuItems: MenuItem[] = [
  { key: '1', id: 'humor', label: 'jokes / humor', note: t('menu.note.humor'), ready: true },
  // NOTE: this door is intentionally locked for now. The art room itself is fully intact —
  // room-art.ts, spiral3d.ts and toys/art-toys.ts are untouched; only the entrance is
  // closed. To reopen it, set ready: true here and enable the ART_OPEN flag.
  { key: '2', id: 'art', label: 'art / beautiful', note: t('menu.note.art'), ready: false },
  { key: '3', id: 'history', label: 'history of IT', note: t('menu.note.history'), ready: false },
  { key: '4', id: 'algorave', label: 'algorave', note: t('menu.note.algorave'), ready: false },
];

export const menuFootnote = t('menu.footnote');

// ---------- ASCII clown: transition frames into the humour room ----------
// The geometry stays identical and only the face changes, so frames do not jump.

export const clownFrames: string[] = [
  String.raw`
        \  |  /
       .--'-'--.
      /  o   o  \
     |     @     |
     |   \___/   |
      '---------'
       /|     |\
`,
  String.raw`
        \  |  /
       .--'-'--.
      /  -   o  \
     |     @     |
     |   \___/   |
      '---------'
       /|     |\
`,
  String.raw`
    *   \  |  /   *
       .--'-'--.
      /  O   O  \
     |    (@)    |
     |   \ o /   |
      '---------'
       /|     |\
          HONK!
`,
  String.raw`
 ha *   \  |  /   * ha
       .--'-'--.
      /  ^   ^  \
     |     @     |
     |  \ooooo/  |
      '---------'
    ha /|     |\ ha
`,
  String.raw`
   .   *    '   *    .
  *    \o/   .    *
   '    |    *    '   .
   .   / \       *
        *   .   '   *
`,
];

// Lines the terminal prints over the clown.
export const clownLines: string[] = [
  '$ ./enter --room=jokes',
  '> injecting humor.dll ....... ok',
  '> HONK',
];

// Portal lines (art room).
export const portalLines: readonly string[] = tl('portalLines');

// Clown header inside the humour room itself (static, calm).
export const clownStill: string = clownFrames[0];

// What is visible THROUGH the hole in the broken glass: the jester's room beyond.
export const holeArt: string = String.raw`      \  |  /
     .--'-'--.
    /  O   O  \
   |    (@)    |     H O N K
   |   \___/   |
    '---------'`;

// ---------- jester's room: objects placed IN SPACE ----------

// Ticker text running as a band across the room. Code only: joke-shaped facts from the
// world of esoteric languages, each one true.
export const tickerLines: readonly string[] = tl('tickerLines');

// The "sort by capitalism" toy: the algorithm CHEATS. The investor teleports to the top
// bypassing the sort, the intern is pushed down, and for the intern the sort never
// converges.
export interface RichItem {
  /** The role is identified by id, not by the label: the label is translated, the behaviour is not. */
  id: 'intern' | 'junior' | 'middle' | 'senior' | 'lead' | 'founder' | 'investor';
  name: string;
  cash: number;
}

const RICH_IDS: RichItem['id'][] = [
  'intern',
  'junior',
  'middle',
  'senior',
  'lead',
  'founder',
  'investor',
];
const RICH_CASH = [1, 3, 12, 40, 55, 900, 9000];

export const capitalismItems: RichItem[] = RICH_IDS.map((id, i) => ({
  id,
  name: tl('capitalismNames')[i],
  cash: RICH_CASH[i],
}));

// ---------- esolang plaques: "the joke is the truth" ----------
// Each entry is a language that really exists, with a link to its wiki page.

export interface EsoLang {
  name: string;
  year: string;
  joke: string;
  truth: string;
  url: string;
}

export const esoLangs: EsoLang[] = [
  {
    name: 'INTERCAL',
    year: '1972',
    joke: t('eso.INTERCAL.joke'),
    truth: t('eso.INTERCAL.truth'),
    url: 'https://esolangs.org/wiki/INTERCAL',
  },
  {
    name: 'Backrooms',
    year: '2024',
    joke: t('eso.Backrooms.joke'),
    truth: t('eso.Backrooms.truth'),
    url: 'https://esolangs.org/wiki/Backrooms',
  },
  {
    name: '5D Brainfuck With Multiverse Time Travel',
    year: '2022',
    joke: t('eso.5D.joke'),
    truth: t('eso.5D.truth'),
    url: 'https://esolangs.org/wiki/5D_Brainfuck_With_Multiverse_Time_Travel',
  },
  {
    name: 'GenAlpha Lang',
    year: '2024',
    joke: t('eso.GenAlpha.joke'),
    truth: t('eso.GenAlpha.truth'),
    // NOTE: /wiki/GenAlpha_Lang returns 404; the live page for this language is
    // /wiki/Gen_Alpha (verified, 200).
    url: 'https://esolangs.org/wiki/Gen_Alpha',
  },
  {
    name: 'SickPig',
    year: '2019',
    joke: t('eso.SickPig.joke'),
    truth: t('eso.SickPig.truth'),
    url: 'https://esolangs.org/wiki/SickPig',
  },
  {
    name: 'FALSE',
    year: '1993',
    joke: t('eso.FALSE.joke'),
    truth: t('eso.FALSE.truth'),
    url: 'https://esolangs.org/wiki/FALSE',
  },
];

// ---------- INTERCAL: politeness as a compilation requirement ----------
// Real behaviour: fewer than 1/5 of statements using PLEASE is "not polite enough",
// more than 1/3 is "too polite". The ICL079I / ICL099I errors are genuine.

export const intercalProgram: string[] = [
  'DO ,1 <- #13',
  'DO ,1 SUB #1 <- #238',
  'DO ,1 SUB #2 <- #108',
  'DO ,1 SUB #3 <- #112',
  'DO ,1 SUB #4 <- #0',
  'DO ,1 SUB #5 <- #64',
  'DO ,1 SUB #6 <- #194',
  'DO ,1 SUB #7 <- #48',
  'DO ,1 SUB #8 <- #22',
  'DO ,1 SUB #9 <- #248',
  'DO READ OUT ,1',
  'DO GIVE UP',
];

// Live `top` widget: the percentages fluctuate on their own.
export const topRows: Array<[string, string]> = tl('topRows').map(
  (cmd, i) => [String(i + 1).padStart(3, '0'), cmd] as [string, string],
);
