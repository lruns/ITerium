// Exhibit data. House rule: every exhibit carries an author and a link to the original.

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
const sigmaArt = `<svg class="own-shot" viewBox="0 0 320 180" role="img" aria-label="рисованный кадр: сигма-бой в наушниках">
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
  <text x="10" y="20" font-family="ui-monospace, monospace" font-size="9" fill="#6f6288">рисунок наш · клип по ссылке</text>
</svg>`;

export const humorExhibits: Exhibit[] = [
  {
    id: 'kai-eso',
    title: 'Интервью с академиком эзотерических языков',
    hook:
      'У него слишком много дипломов по computer science, чтобы быть трудоустроенным. ' +
      'Отладка Malbolge для него — как спа. Мокьюментари, где каждая шутка — реально существующий язык.',
    author: 'Kai Lentit',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=ieqsL5NkS6I',
    authorUrl: 'https://www.youtube.com/@programmersarealsohuman5909',
    poster: 'assets/posters/kai-eso.jpg',
    orient: 'wide',
  },
  {
    id: 'kai-js',
    title: 'Интервью с сеньором JS-разработчиком',
    hook:
      '«Мы переписали кодбазу девять раз за месяц. Такой грязный язык. Обожаю». ' +
      'Два миллиона просмотров чистой правды.',
    author: 'Kai Lentit',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=Uo3cL4nrGOk',
    authorUrl: 'https://www.youtube.com/@programmersarealsohuman5909',
    poster: 'assets/posters/kai-js.jpg',
    orient: 'wide',
  },
  {
    id: 'ardens',
    title: 'Hello World на 10 запретных языках',
    hook:
      'Реально запускает: Chef, Whitespace, Piet, Befunge, Malbolge. ' +
      'Маты запиканы — «если нет, значит звучало слишком смешно».',
    author: 'Ardens',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=Ysled8GvKuk',
    authorUrl: 'https://www.youtube.com/@Ardens.',
    poster: 'assets/posters/ardens.jpg',
    orient: 'wide',
  },
  {
    id: 'meditation',
    title: 'Медитация нейронок',
    hook:
      'Сказали ИИшкам: давайте помедитируем. И они начали дружно общаться друг с другом. ' +
      'Тишина по-нейроночьи — хор из двадцати голосов.',
    author: '@ahh.gpt',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/Dbj6mf-Rscq/',
    authorUrl: 'https://www.instagram.com/ahh.gpt/',
    poster: 'assets/posters/meditation.jpg',
    orient: 'tall',
  },
  {
    id: 'reset',
    title: 'Ритуал сброса лимита Claude',
    hook:
      'POV: resetting your Claude usage limit to zero. Балийский обряд очищения, ' +
      'ноутбук и ритуальная чаша. Айтишная боль как религия.',
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
    hook:
      'Пародия на God’s Plan про жизнь с Claude Code: «я начинаю день в plan mode… ' +
      'сервер упал из-за MCP». Клип снят самим Клодом — экспонат про Клода в музее, ' +
      'который строит Клод.',
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
    hook:
      'Сложность O(n² + distractions): алгоритм отвлёкся и ушёл сортировать другой массив. ' +
      'У того же автора — Epstein Sort: исходный код закрыт чёрными цензурными плашками.',
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
    title: 'Худший интерфейс из возможных',
    hook:
      'Программистов попросили сделать самый ужасный UX. Кнопку «Unsubscribe» сдувает ' +
      'настоящим вентилятором; пароль убегает; страну выбираешь, нарисовав её флаг.',
    author: '@inhwoi',
    platform: 'tiktok',
    url: 'https://vm.tiktok.com/ZN8Rnkbw5/',
    authorUrl: 'https://www.tiktok.com/@inhwoi',
    poster: 'assets/posters/worstux.jpg',
    orient: 'wide',
  },
  {
    id: 'brevno',
    title: 'Самые странные языки программирования',
    hook:
      'COW: программа состоит из вариантов мычания (mOo, moO, MOo). TempleOS и HolyC. ' +
      'И язык, в котором есть ТОЛЬКО табы. По-русски и смешно.',
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
    hook:
      'Тот самый «Sigma, sigma boy». Премьера 24 апреля 2025-го, 400 миллионов просмотров. ' +
      '«Частная школа им. Патриция Бейтмана», невозмутимый сигма-фейс — и язык GenAlpha, который ' +
      'из этого сленга собран, компилируется от слова Skibidi.',
    author: 'Betsy · Мария Янковская',
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
    title: 'Ты тоже можешь быть воином',
    hook:
      '2016: мальчику-аутисту дарят сборник олимпиадных задач — и он становится воином. ' +
      'Легендарная паста, которую переделывают до сих пор.',
    author: 'Физкек',
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
    title: 'Группы и теория гомотопий (трэш трейлер)',
    hook:
      'Настоящая лекция по гомологической алгебре, смонтированная как трейлер ' +
      'блокбастера. «Он задал вопрос… она всегда отвечала: гомологии». ' +
      'Лектор — Роман Михайлов, монтаж — конкурс трэш-роликов Лекториума, 2014.',
    author: 'Лекториум',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=mqAf5lOJZew',
    authorUrl: 'https://www.youtube.com/@OpenLektorium',
    poster: 'assets/posters/homotopy.jpg',
    orient: 'wide',
    extra: { label: 'полный курс', url: 'https://www.lektorium.tv/course/22939' },
  },
];

export const artExhibits: Exhibit[] = [
  {
    id: 'sky',
    title: 'Небо подменили',
    hook:
      'Централ-парк, все загорают и болтают. Над головами — текучая туманность. ' +
      'Никто не смотрит вверх: так теперь выглядит обычный вторник.',
    author: '@coolacloy',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/CvaIWgJut5d/',
    authorUrl: 'https://www.instagram.com/coolacloy/',
    poster: 'assets/posters/sky.jpg',
    orient: 'tall',
  },
  {
    id: 'calendar',
    title: 'Попугай из календаря',
    hook:
      'Тысячи встреч в Google Calendar, выложенные в пиксель-портрет. ' +
      'Расписание недели как холст.',
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
    hook:
      'Цензурные плашки рассекреченных документов складываются в фигуру человека. ' +
      'Автор подписал работу вычеркнутым словом.',
    author: '@jordan.gladman',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DbPHC4qprsY/',
    authorUrl: 'https://www.instagram.com/jordan.gladman/',
    poster: 'assets/posters/redacted.jpg',
    orient: 'square',
  },
  {
    id: 'glyphs',
    title: 'Письмена, которых нет',
    hook:
      'Сетка рукописных глифов разрастается и схлопывается в один знак. ' +
      'Рукопись Войнича, которая ожила и дышит.',
    author: '@manmothma',
    platform: 'instagram',
    url: 'https://www.instagram.com/reel/DbVrfc1vGay/',
    authorUrl: 'https://www.instagram.com/manmothma/',
    poster: 'assets/posters/glyphs.jpg',
    orient: 'tall',
  },
  {
    id: 'vision',
    title: 'Машинное зрение читает стихи',
    hook:
      'Красные рамки распознавания поверх зимней улицы и кладбища. ' +
      'А в подписях: «the earth is still warm from you».',
    author: '@drezzdon',
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@drezzdon/video/7494013737150450990',
    authorUrl: 'https://www.tiktok.com/@drezzdon',
    poster: 'assets/posters/vision.jpg',
    orient: 'tall',
  },
  {
    id: 'win95',
    title: 'Сапёр как ландшафт',
    hook:
      'Окна Windows 95 стали архитектурой: изометрический Сапёр-поле, ' +
      'купол из браузеров, шахта из Корзины.',
    author: '@archivsieben',
    platform: 'tiktok',
    url: 'https://www.tiktok.com/@archivsieben/video/7541121731533065494',
    authorUrl: 'https://www.tiktok.com/@archivsieben',
    poster: 'assets/posters/win95.jpg',
    orient: 'square',
  },
  {
    id: 'trance',
    title: 'Транс, написанный кодом',
    hook:
      '// LET US TRANCE ONCE MORE. Клубный транс рождается строчками Strudel ' +
      'прямо на глазах — живой код как музыкальный инструмент.',
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
export const asciiCharts: string[] = [
  `$ measure --exhibit=prev
  уровень кринжа   ████████▓▒  82%
  полезность       ██░░░░░░░░  17%
  «я так же»       █████████▓  94%`,
  `$ bench sort --all
  bubble    ████░░░░░░  O(n²)
  quick     ██░░░░░░░░  O(n log n)
  adhd      ███████▓▒░  O(n² + отвлёкся)
  капитализм ████████▓  богатые всплывают`,
  `$ top -u museum
  PID  COMMAND          %CPU
  001  смех.exe         73.4
  002  стыд.daemon      21.9
  003  продуктивность    0.1`,
  `$ history | grep жалею
  1998  «выучу си за 21 день»    ▓▒░
  2014  «джава — это навсегда»   ████
  2026  «перепишу на расте»      ██████▓`,
  // NOTE: this array is indexed by position in room-humor.ts — adding or removing an entry
  // means the indices there must be updated too.
  `$ df -h /dev/humor
  раздел        занято  свободно
  /кринж         96%     ▒░
  /настоящий-код  4%     ████████`,
];

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
export const pathJokes: string[] = [
  '$ sudo apt install laughter … W: обнаружена инъекция юмора · программы ушли смотреть тикток',
  '// TODO: перестать смеяться (не срочно)',
  'PLEASE DO NOT SUE — INTERCAL без «пожалуйста» не соберётся. мы вежливые',
  'moO moO Moo — (перевод с языка COW: «дальше смешнее»)',
  '$ file program.png → PNG image · и одновременно исполняемый код',
  '$ man esolang → «RTFM. FM тоже на эзотерическом»',
];

export const entryLines: string[] = [
  'Lruns ITerium v0.5.3 beta — пробный зал',
  'музей кода, красоты и кринжа',
  'экспонаты собраны по всему интернету;',
  'у каждого — автор и дверь к нему',
  '',
  'press ENTER _',
];

// ---------- path selection menu (rendered inside the terminal) ----------

export interface MenuItem {
  key: string;
  id: string;
  label: string;
  note: string;
  ready: boolean;
}

export const menuItems: MenuItem[] = [
  { key: '1', id: 'humor', label: 'jokes / humor', note: 'комната смеха', ready: true },
  // NOTE: this door is intentionally locked for now. The art room itself is fully intact —
  // room-art.ts, spiral3d.ts and toys/art-toys.ts are untouched; only the entrance is
  // closed. To reopen it, set ready: true here and enable the ART_OPEN flag.
  { key: '2', id: 'art', label: 'art / beautiful', note: '[зал строится]', ready: false },
  { key: '3', id: 'history', label: 'history of IT', note: '[зал строится]', ready: false },
  { key: '4', id: 'algorave', label: 'algorave', note: '[зал строится]', ready: false },
];

export const menuFootnote = '…позже: мост в круговзор';

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
export const portalLines: string[] = [
  '$ ./enter --room=art',
  '> открываю портал ....... держись',
];

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
export const tickerLines: string[] = [
  'Malbolge: первый Hello World написала не человек, а поисковый алгоритм',
  'FALSE: назван в честь любимого истинностного значения автора',
  'brainfuck: 442 официальных деривата',
  'Malbolge Unshackled шифрует свои команды при каждом запуске',
  'Sigma Sigma Sigma Skibidi — это компилируется',
  'PLEASE: обязательно, но не слишком',
  'Still better than JavaScript',
  'Whitespace: программа прячется внутри чужого стихотворения',
  'Piet: исходник — картина, компилятор — искусствовед',
  'INTERCAL: вместо GOTO здесь COME FROM',
  'Malbolge назван в честь восьмого круга ада',
  'moO moO Moo',
];

// The "sort by capitalism" toy: the algorithm CHEATS. The investor teleports to the top
// bypassing the sort, the intern is pushed down, and for the intern the sort never
// converges.
export interface RichItem {
  name: string;
  cash: number;
}

export const capitalismItems: RichItem[] = [
  { name: 'стажёр', cash: 1 },
  { name: 'джун', cash: 3 },
  { name: 'мидл', cash: 12 },
  { name: 'сеньор', cash: 40 },
  { name: 'тимлид', cash: 55 },
  { name: 'фаундер', cash: 900 },
  { name: 'инвестор', cash: 9000 },
];

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
    joke: 'DO · PLEASE DO · PLEASE — для программы одно и то же. Но перегнёшь с вежливостью — не соберётся.',
    truth: 'Аббревиатура расшифровывается как «язык без произносимой аббревиатуры». Вместо GOTO — COME FROM.',
    url: 'https://esolangs.org/wiki/INTERCAL',
  },
  {
    name: 'Backrooms',
    year: '2024',
    joke: 'Ошибок нет. Пропустил инструкцию — просто проваливаешься сквозь этажи, пока не сломается питон.',
    truth: 'Трёхмерный язык: коридоры, этажи, комнаты. У автора к нему написана IDE и отладчик.',
    url: 'https://esolangs.org/wiki/Backrooms',
  },
  {
    name: '5D Brainfuck With Multiverse Time Travel',
    year: '2022',
    joke: 'Можно вернуться в предыдущее состояние программы. И в соседнюю вселенную, где она работала.',
    truth: 'Расширение brainfuck с путешествиями во времени между параллельными лентами.',
    url: 'https://esolangs.org/wiki/5D_Brainfuck_With_Multiverse_Time_Travel',
  },
  {
    name: 'GenAlpha Lang',
    year: '2024',
    joke: 'Sigma Sigma Sigma Sigma Skibidi — это не опечатка, это компилируется.',
    truth:
      'Ключевые слова взяты из сленга поколения альфа. Программы читаются вслух как заклинание. ' +
      'На вики страница называется Gen Alpha.',
    // NOTE: /wiki/GenAlpha_Lang returns 404; the live page for this language is
    // /wiki/Gen_Alpha (verified, 200).
    url: 'https://esolangs.org/wiki/Gen_Alpha',
  },
  {
    name: 'SickPig',
    year: '2019',
    joke: 'Вариация языка Pig, которая симулирует свинью. Больную свинью.',
    truth: 'Да, существует. И у него есть поклонники — как минимум один академик.',
    url: 'https://esolangs.org/wiki/SickPig',
  },
  {
    name: 'FALSE',
    year: '1993',
    joke: 'Назван в честь любимого истинностного значения автора.',
    truth: 'Стековый, компилятор влезал в 1024 байта. Именно он вдохновил brainfuck.',
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
export const topRows: Array<[string, string]> = [
  ['001', 'смех.exe'],
  ['002', 'стыд.daemon'],
  ['003', 'кринж.service'],
  ['004', 'продуктивность'],
  ['005', 'systemd-honkd'],
];
