// MUSEUM DICTIONARY. One line — one {ru, en} entry.
//
// The Russian texts are the originals, carried over character for character: nothing was
// rewritten or "improved". The English ones are not an interlinear gloss but a translation
// tuned for the same laugh: the punchline lands at the end, memes are swapped for memes of
// equal force, officialese stays officialese.
//
// An untranslated entry is wrapped in `same('…')` — that puts one text on both sides and
// keeps the site working in both locales. How many are left is one grep away:
//   grep -c "same(" src/strings.ts
// There are none at the moment; the helpers are kept for new strings.
//
// The type requires BOTH fields, so a hand-written entry without `en` will not pass tsc.
//
// What does NOT go into the dictionary: pure ASCII art without words, the clown frames,
// terminal commands ($ cd …), paths, author names and language names — they are Latin
// script already and identical in both versions.
//
// ⚠ LAYOUT (breaks silently, hence this note):
//   · topRows and humor.gauge* are cut by padEnd(16) — keep them within 16 characters;
//   · asciiCharts are aligned MONOSPACED with spaces — editing a word means fixing the column;
//   · mobile.art1/art2 are centred inside a 15-character frame;
//   · in the Whitespace poem only the visible lines (poem1/3/5) are translated; the lines
//     of tabs and spaces are the program itself and live in strange-langs.ts.

export interface Phrase {
  ru: string;
  en: string;
}

export interface PhraseList {
  ru: readonly string[];
  en: readonly string[];
}

/** Not translated yet: both sides identical. Replaced by {ru, en} once translated. */
export function same(s: string): Phrase {
  return { ru: s, en: s };
}

export function sameList(a: readonly string[]): PhraseList {
  return { ru: a, en: a };
}

export const dict = {
  /* --------------------------------- page --------------------------------- */

  'doc.title': {
    ru: 'Lruns ITerium — музей кода, красоты и кринжа',
    en: 'Lruns ITerium — a museum of code, beauty and cringe',
  },

  /* Head meta tags: the Russian values are exactly the ones index.html carried. */
  'doc.description': {
    ru: 'Пробный зал: комната смеха и комната красоты. Экспонаты собраны по интернету, у каждого — автор и ссылка.',
    en: 'A trial hall: the funhouse and the room of beauty. Exhibits collected across the internet, each one with an author and a link.',
  },
  'og.title': {
    ru: 'Lruns ITerium — музей кода, красоты и кринжа',
    en: 'Lruns ITerium — a museum of code, beauty and cringe',
  },
  'og.description': {
    ru: 'Живые приколы, настоящие эзотерические языки и код как искусство. У каждого экспоната — автор и дверь.',
    en: 'Live jokes, real esoteric languages and code as art. Every exhibit has an author and a door.',
  },

  /* ------------------------------ terminal ------------------------------- */

  'term.mini': {
    ru: ';; beta: идеи Андрея, баги наши — чиним',
    en: ';; beta: Andrey’s ideas, our bugs — we’re on it',
  },
  'term.cta': {
    ru: '{tail} &mdash; или тыкни экран',
    en: '{tail} &mdash; or just tap the screen',
  },
  'term.menuAria': { ru: 'выбор зала', en: 'hall selector' },
  'term.menuHint': {
    ru:
      '<b>тыкни строчку</b> &mdash; и ты внутри\n' +
      '      <span class="mh-sep">&middot;</span> или [&uarr;&darr;] выбор\n' +
      '      <span class="mh-sep">&middot;</span> [enter] войти\n' +
      '      <span class="mh-sep">&middot;</span> [1&ndash;4] быстро',
    en:
      '<b>tap a line</b> &mdash; and you are in\n' +
      '      <span class="mh-sep">&middot;</span> or [&uarr;&darr;] to pick\n' +
      '      <span class="mh-sep">&middot;</span> [enter] to enter\n' +
      '      <span class="mh-sep">&middot;</span> [1&ndash;4] quick',
  },
  'term.locked': {
    ru: 'E: зал «{label}» ещё строится. {where}',
    en: 'E: the “{label}” hall is still being built. {where}',
  },
  'term.tryOpen': { ru: 'попробуй {list} или {last}', en: 'try {list} or {last}' },
  'term.onlyOpen': { ru: 'открыт пока только {key}', en: 'so far only {key} is open' },

  /* -------------------------------- menu --------------------------------- */

  'menu.note.humor': { ru: 'комната смеха', en: 'the funhouse' },
  'menu.note.art': { ru: '[зал строится]', en: '[under construction]' },
  'menu.note.history': { ru: '[зал строится]', en: '[under construction]' },
  'menu.note.algorave': { ru: '[зал строится]', en: '[under construction]' },
  'menu.footnote': { ru: '…позже: мост в круговзор', en: '…later: a bridge to Krugovzor' },

  /* --------------------------- language switch --------------------------- */

  'lang.aria': { ru: 'язык музея', en: 'museum language' },

  /* ru-only legal footnote: not rendered at all in en (see legalNoteHtml). */
  'legal.meta': {
    ru:
      'Instagram — продукт Meta Platforms Inc., признанной экстремистской организацией ' +
      'и запрещённой на территории РФ. Материалы приводятся в ознакомительных целях.',
    en: '',
  },

  /* ------------------------------- chrome -------------------------------- */

  'chrome.shotAlt': { ru: 'кадр: {title}', en: 'frame: {title}' },
  'chrome.authorAria': {
    ru: 'автор {author} — открыть профиль',
    en: '{author} — open the author’s profile',
  },
  'chrome.workAria': { ru: '{title} — смотреть саму работу', en: '{title} — see the work itself' },
  'chrome.zoomAria': { ru: '{title} — приблизить карточку', en: '{title} — zoom this card' },
  'chrome.chipVideo': { ru: 'ролик', en: 'video' },
  'chrome.chipAuthor': { ru: 'автор', en: 'author' },
  'chrome.close': { ru: 'закрыть', en: 'close' },
  'chrome.soon': { ru: 'скоро', en: 'soon' },
  'chrome.reservedAria': {
    ru: 'место под будущий экспонат',
    en: 'a slot held for a future exhibit',
  },

  /* ----------------------------- mobile gate ----------------------------- */

  'mobile.art1': { ru: 'мобильный', en: 'mobile' },
  'mobile.art2': { ru: 'зал строится', en: 'in progress' },
  'mobile.note': {
    ru:
      'зал уже есть, но он большой и объёмный — на маленьком экране пока ' +
      'разъезжается. мобильную версию собираем к 1.0.',
    en:
      'the hall exists, it’s just big and three-dimensional — on a small screen it ' +
      'still falls apart. the mobile version lands in 1.0.',
  },
  'mobile.go': {
    ru: 'очень хочется — посмотреть как на компе',
    en: 'i want in anyway — show me the desktop one',
  },
  'mobile.warn': {
    ru: 'будет как на большом экране: мелко и с прокруткой вбок. так и задумано',
    en: 'it will look like the big screen: tiny, scrolling sideways. that’s on purpose',
  },
  'mobile.back': { ru: 'вернуться в терминал', en: 'back to the terminal' },

  /* ---------------------------- jester's room ---------------------------- */

  'humor.title': { ru: 'комната шута', en: 'the jester’s room' },
  'humor.modeline': { ru: '(Humor · вверх)', en: '(Humor · up)' },
  'humor.cringeHint': {
    ru: 'наведи (или ткни) — стрелка поедет',
    en: 'hover (or tap) — the needle starts moving',
  },
  'humor.cringeReset': { ru: 'сбросить кринж', en: 'reset the cringe' },
  'humor.gaugeCringe': { ru: 'уровень кринжа', en: 'cringe level' },
  'humor.gaugeUseful': { ru: 'полезность', en: 'usefulness' },
  'humor.gaugeDiag': { ru: 'диагноз: {label}', en: 'diagnosis: {label}' },
  'humor.hintUp': {
    ru: 'поднимайся ВВЕРХ &mdash; приколы висят вокруг',
    en: 'head UP &mdash; the jokes are hanging all around',
  },
  'humor.hintUpSub': {
    ru: 'колесом, пальцем или [&uarr;] &mdash; всё вверх',
    en: 'wheel, finger or [&uarr;] &mdash; everything goes up',
  },
  'humor.wall': { ru: 'стена фольклора', en: 'the folklore wall' },
  'humor.summit': { ru: 'выше приколов не бывает. вот он:', en: 'this is as high as the jokes go. here it is:' },
  'humor.footJoke': {
    ru: '…в запасниках ещё гора приколов — зал строится',
    en: '…there’s a mountain more of these in the vaults — the hall is still being built',
  },
  'humor.curator': {
    ru: 'куратор: андрей (lruns) · все экспонаты принадлежат своим авторам',
    en: 'curator: andrey (lruns) · every exhibit belongs to its author',
  },
  'humor.why.stand': { ru: 'откуда взят этот стенд', en: 'where this exhibit came from' },
  'humor.why.rite': { ru: 'откуда взят этот обряд', en: 'where this rite came from' },
  'humor.why.folklore': {
    ru: 'айтишный фольклор, оригинал 2016',
    en: 'programmer folklore, 2016 original',
  },
  'humor.why.sameLife': { ru: 'из той же жизни', en: 'from the same life' },
  'humor.why.oracle': { ru: 'откуда взят этот оракул', en: 'where this oracle came from' },
  'humor.why.algo': { ru: 'откуда взят этот алгоритм', en: 'where this algorithm came from' },

  /* ----------------------------- beauty room ----------------------------- */

  'art.title': { ru: 'комната красоты', en: 'the room of beauty' },
  'art.modeline': { ru: '(Beauty · спираль)', en: '(Beauty · spiral)' },
  'art.epigraph': {
    ru: 'реальность + один невидимый слой. никто не смотрит вверх — а ты посмотри',
    en: 'reality plus one invisible layer. nobody ever looks up — you should',
  },
  'art.scrollHint': {
    ru:
      '↑ поднимайся: виток везёт от станции к станции, вокруг каждой — её источники · ' +
      'станции можно трогать · потяни мышкой, чтобы подкрутить',
    en:
      '↑ climb: the coil carries you from station to station, each one ringed by its sources · ' +
      'the stations are touchable · drag with the mouse to spin',
  },
  'art.finaleLine': {
    ru: 'никто не смотрит вверх — а ты посмотрел',
    en: 'nobody looks up — but you did',
  },
  'art.finaleChip': { ru: 'небо: @coolacloy', en: 'sky: @coolacloy' },
  'art.finaleSmall': {
    ru: '…виток продолжается. зал строится',
    en: '…the coil goes on. the hall is still being built',
  },
  'art.flyStations': { ru: 'по станциям', en: 'station hop' },
  'art.flyFree': { ru: 'свободный полёт', en: 'free flight' },

  /* -------------------------- exhibits: humour --------------------------- */

  'ex.kai-eso.title': {
    ru: 'Интервью с академиком эзотерических языков',
    en: 'Interview with an Esoteric Language Academic',
  },
  'ex.kai-eso.hook': {
    ru:
      'У него слишком много дипломов по computer science, чтобы быть трудоустроенным. ' +
      'Отладка Malbolge для него — как спа. Мокьюментари, где каждая шутка — реально существующий язык.',
    en:
      'He has too many computer science degrees to be employable. Debugging Malbolge is ' +
      'his idea of a spa day. A mockumentary where every punchline is a language that really exists.',
  },
  'ex.kai-js.title': {
    ru: 'Интервью с сеньором JS-разработчиком',
    en: 'Interview with a Senior JS Developer',
  },
  'ex.kai-js.hook': {
    ru:
      '«Мы переписали кодбазу девять раз за месяц. Такой грязный язык. Обожаю». ' +
      'Два миллиона просмотров чистой правды.',
    en:
      '“We rewrote the codebase nine times this month. Such a filthy language. I love it.” ' +
      'Two million views of undiluted truth.',
  },
  'ex.ardens.title': {
    ru: 'Hello World на 10 запретных языках',
    en: 'Hello World in 10 forbidden languages',
  },
  'ex.ardens.hook': {
    ru:
      'Реально запускает: Chef, Whitespace, Piet, Befunge, Malbolge. ' +
      'Маты запиканы — «если нет, значит звучало слишком смешно».',
    en:
      'He actually runs them: Chef, Whitespace, Piet, Befunge, Malbolge. ' +
      'The swearing is bleeped — “and if it isn’t, it just sounded too funny”.',
  },
  'ex.meditation.title': { ru: 'Медитация нейронок', en: 'Neural net meditation' },
  'ex.meditation.hook': {
    ru:
      'Сказали ИИшкам: давайте помедитируем. И они начали дружно общаться друг с другом. ' +
      'Тишина по-нейроночьи — хор из двадцати голосов.',
    en:
      'Someone told a room full of AIs: let us meditate. They immediately started chatting ' +
      'with each other. Silence, the way a language model does it — a choir of twenty voices.',
  },
  'ex.reset.title': { ru: 'Ритуал сброса лимита Claude', en: 'The Claude limit reset ritual' },
  'ex.reset.hook': {
    ru:
      'POV: resetting your Claude usage limit to zero. Балийский обряд очищения, ' +
      'ноутбук и ритуальная чаша. Айтишная боль как религия.',
    en:
      'POV: resetting your Claude usage limit to zero. A Balinese cleansing rite, a laptop ' +
      'and a ritual bowl. Developer pain as a religion.',
  },
  'ex.claudes-plan.hook': {
    ru:
      'Пародия на God’s Plan про жизнь с Claude Code: «я начинаю день в plan mode… ' +
      'сервер упал из-за MCP». Клип снят самим Клодом — экспонат про Клода в музее, ' +
      'который строит Клод.',
    en:
      'A God’s Plan parody about life with Claude Code: “I start my day in plan mode… ' +
      'the server went down because of MCP.” The video was made by Claude himself — an exhibit about ' +
      'Claude, in a museum that Claude is building.',
  },
  'ex.adhd.hook': {
    ru:
      'Сложность O(n² + distractions): алгоритм отвлёкся и ушёл сортировать другой массив. ' +
      'У того же автора — Epstein Sort: исходный код закрыт чёрными цензурными плашками.',
    en:
      'Complexity O(n² + distractions): the algorithm got distracted and wandered off to sort ' +
      'a different array. Same author also wrote Epstein Sort: the source code is covered in ' +
      'black redaction bars.',
  },
  'ex.worstux.title': { ru: 'Худший интерфейс из возможных', en: 'The worst interface possible' },
  'ex.worstux.hook': {
    ru:
      'Программистов попросили сделать самый ужасный UX. Кнопку «Unsubscribe» сдувает ' +
      'настоящим вентилятором; пароль убегает; страну выбираешь, нарисовав её флаг.',
    en:
      'Developers were asked to build the most horrible UX they could. A real desk fan blows ' +
      'the “Unsubscribe” button away; the password runs off; you pick your country by drawing its flag.',
  },
  'ex.brevno.title': {
    ru: 'Самые странные языки программирования',
    en: 'The strangest programming languages',
  },
  'ex.brevno.hook': {
    ru:
      'COW: программа состоит из вариантов мычания (mOo, moO, MOo). TempleOS и HolyC. ' +
      'И язык, в котором есть ТОЛЬКО табы. По-русски и смешно.',
    en:
      'COW: the entire program is variations on a moo (mOo, moO, MOo). TempleOS and HolyC. ' +
      'And a language made of NOTHING but tabs. In Russian. And funny.',
  },
  'ex.sigma-boy.hook': {
    ru:
      'Тот самый «Sigma, sigma boy». Премьера 24 апреля 2025-го, 400 миллионов просмотров. ' +
      '«Частная школа им. Патриция Бейтмана», невозмутимый сигма-фейс — и язык GenAlpha, который ' +
      'из этого сленга собран, компилируется от слова Skibidi.',
    en:
      'Yes, that “Sigma, sigma boy”. Premiered 24 April 2025, 400 million views. ' +
      '“The Patrick Bateman Private School”, the unbothered sigma face — and GenAlpha Lang, ' +
      'assembled out of exactly this slang, compiles the moment you say Skibidi.',
  },
  'ex.sigma-boy.author': { ru: 'Betsy · Мария Янковская', en: 'Betsy · Maria Yankovskaya' },
  'ex.warrior.title': { ru: 'Ты тоже можешь быть воином', en: 'You too can be a warrior' },
  'ex.warrior.hook': {
    ru:
      '2016: мальчику-аутисту дарят сборник олимпиадных задач — и он становится воином. ' +
      'Легендарная паста, которую переделывают до сих пор.',
    en:
      '2016: an autistic kid is handed a book of olympiad problems — and becomes a warrior. ' +
      'A legendary copypasta that people are still remixing.',
  },
  'ex.warrior.author': { ru: 'Физкек', en: 'Fizkek' },
  'ex.homotopy.title': {
    ru: 'Группы и теория гомотопий (трэш трейлер)',
    en: 'Groups and homotopy theory (meme trailer)',
  },
  'ex.homotopy.hook': {
    ru:
      'Настоящая лекция по гомологической алгебре, смонтированная как трейлер ' +
      'блокбастера. «Он задал вопрос… она всегда отвечала: гомологии». ' +
      'Лектор — Роман Михайлов, монтаж — конкурс трэш-роликов Лекториума, 2014.',
    en:
      'A real homological algebra lecture cut like a blockbuster trailer. ' +
      '“He asked a question… she always answered: homology.” ' +
      'Lecturer — Roman Mikhailov, edit — Lektorium’s trash-video contest, 2014.',
  },
  'ex.homotopy.author': { ru: 'Лекториум', en: 'Lektorium' },
  'ex.homotopy.extra': { ru: 'полный курс', en: 'the full course' },
  'ex.sigmaArt.alt': {
    ru: 'рисованный кадр: сигма-бой в наушниках',
    en: 'drawn frame: sigma boy in headphones',
  },
  'ex.sigmaArt.cap': {
    ru: 'рисунок наш · клип по ссылке',
    en: 'drawing ours · the video is behind the link',
  },

  /* -------------------------- exhibits: beauty --------------------------- */

  'ex.sky.title': { ru: 'Небо подменили', en: 'The sky has been swapped' },
  'ex.sky.hook': {
    ru:
      'Централ-парк, все загорают и болтают. Над головами — текучая туманность. ' +
      'Никто не смотрит вверх: так теперь выглядит обычный вторник.',
    en:
      'Central Park, everyone sunbathing and chatting. Overhead, a nebula flows past. ' +
      'Nobody looks up: this is simply what a Tuesday looks like now.',
  },
  'ex.calendar.title': { ru: 'Попугай из календаря', en: 'A parrot made of calendars' },
  'ex.calendar.hook': {
    ru:
      'Тысячи встреч в Google Calendar, выложенные в пиксель-портрет. ' +
      'Расписание недели как холст.',
    en:
      'Thousands of Google Calendar events laid out into a pixel portrait. ' +
      'A week of meetings used as a canvas.',
  },
  'ex.redacted.hook': {
    ru:
      'Цензурные плашки рассекреченных документов складываются в фигуру человека. ' +
      'Автор подписал работу вычеркнутым словом.',
    en:
      'The redaction bars of declassified documents assemble into the figure of a person. ' +
      'The artist signed the piece with a blacked-out word.',
  },
  'ex.glyphs.title': { ru: 'Письмена, которых нет', en: 'A writing system that does not exist' },
  'ex.glyphs.hook': {
    ru:
      'Сетка рукописных глифов разрастается и схлопывается в один знак. ' +
      'Рукопись Войнича, которая ожила и дышит.',
    en:
      'A grid of handwritten glyphs grows and collapses back into a single sign. ' +
      'The Voynich manuscript, alive and breathing.',
  },
  'ex.vision.title': { ru: 'Машинное зрение читает стихи', en: 'Machine vision reads poetry' },
  'ex.vision.hook': {
    ru:
      'Красные рамки распознавания поверх зимней улицы и кладбища. ' +
      'А в подписях: «the earth is still warm from you».',
    en:
      'Red detection boxes over a winter street and a graveyard. ' +
      'And the labels read: “the earth is still warm from you”.',
  },
  'ex.win95.title': { ru: 'Сапёр как ландшафт', en: 'Minesweeper as landscape' },
  'ex.win95.hook': {
    ru:
      'Окна Windows 95 стали архитектурой: изометрический Сапёр-поле, ' +
      'купол из браузеров, шахта из Корзины.',
    en:
      'Windows 95 windows turned into architecture: an isometric Minesweeper field, ' +
      'a dome of browsers, a mineshaft of Recycle Bins.',
  },
  'ex.trance.title': { ru: 'Транс, написанный кодом', en: 'Trance written in code' },
  'ex.trance.hook': {
    ru:
      '// LET US TRANCE ONCE MORE. Клубный транс рождается строчками Strudel ' +
      'прямо на глазах — живой код как музыкальный инструмент.',
    en:
      '// LET US TRANCE ONCE MORE. Club trance is born line by line in Strudel, ' +
      'right in front of you — live code as a musical instrument.',
  },

  /* ------------------------------ esolangs ------------------------------- */

  'eso.exists': { ru: 'язык реально существует', en: 'this language really exists' },
  'eso.INTERCAL.joke': {
    ru: 'DO · PLEASE DO · PLEASE — для программы одно и то же. Но перегнёшь с вежливостью — не соберётся.',
    en: 'DO · PLEASE DO · PLEASE — all the same to the program. But overdo the politeness and it will not compile.',
  },
  'eso.INTERCAL.truth': {
    ru: 'Аббревиатура расшифровывается как «язык без произносимой аббревиатуры». Вместо GOTO — COME FROM.',
    en: 'The acronym stands for “Compiler Language With No Pronounceable Acronym”. Instead of GOTO it has COME FROM.',
  },
  'eso.Backrooms.joke': {
    ru: 'Ошибок нет. Пропустил инструкцию — просто проваливаешься сквозь этажи, пока не сломается питон.',
    en: 'There are no errors. Miss an instruction and you simply fall through the floors until Python itself gives up.',
  },
  'eso.Backrooms.truth': {
    ru: 'Трёхмерный язык: коридоры, этажи, комнаты. У автора к нему написана IDE и отладчик.',
    en: 'A three-dimensional language: corridors, floors, rooms. Its author wrote it an IDE and a debugger.',
  },
  'eso.5D.joke': {
    ru: 'Можно вернуться в предыдущее состояние программы. И в соседнюю вселенную, где она работала.',
    en: 'You can return to an earlier state of the program. And to the neighboring universe where it worked.',
  },
  'eso.5D.truth': {
    ru: 'Расширение brainfuck с путешествиями во времени между параллельными лентами.',
    en: 'A brainfuck extension with time travel between parallel tapes.',
  },
  'eso.GenAlpha.joke': {
    ru: 'Sigma Sigma Sigma Sigma Skibidi — это не опечатка, это компилируется.',
    en: 'Sigma Sigma Sigma Sigma Skibidi — that is not a typo, that compiles.',
  },
  'eso.GenAlpha.truth': {
    ru:
      'Ключевые слова взяты из сленга поколения альфа. Программы читаются вслух как заклинание. ' +
      'На вики страница называется Gen Alpha.',
    en:
      'The keywords are lifted straight from Gen Alpha slang. Programs read aloud like an incantation. ' +
      'On the wiki the page is called Gen Alpha.',
  },
  'eso.SickPig.joke': {
    ru: 'Вариация языка Pig, которая симулирует свинью. Больную свинью.',
    en: 'A variation on the Pig language that simulates a pig. A sick pig.',
  },
  'eso.SickPig.truth': {
    ru: 'Да, существует. И у него есть поклонники — как минимум один академик.',
    en: 'Yes, it exists. And it has fans — one academic at the very least.',
  },
  'eso.FALSE.joke': {
    ru: 'Назван в честь любимого истинностного значения автора.',
    en: 'Named after the author’s favorite truth value.',
  },
  'eso.FALSE.truth': {
    ru: 'Стековый, компилятор влезал в 1024 байта. Именно он вдохновил brainfuck.',
    en: 'Stack-based, its compiler fit into 1024 bytes. This is the one that inspired brainfuck.',
  },

  /* ------------------------------ ADHD Sort ------------------------------ */

  'adhd.sideTag': { ru: 'чужой массив', en: 'someone else’s array' },
  'adhd.sorting': { ru: 'сортирую', en: 'sorting' },
  'adhd.statSorted': { ru: 'отсортировано', en: 'sorted' },
  'adhd.statDistracted': { ru: 'отвлёкся', en: 'distracted' },
  'adhd.statSteps': { ru: 'шагов', en: 'steps' },
  'adhd.restart': { ru: 'начать заново', en: 'start over' },
  'adhd.hint': {
    ru: 'O(n² + отвлёкся) · по мотивам ADHD Sort от @swapjs.tt',
    en: 'O(n² + distracted) · after ADHD Sort by @swapjs.tt',
  },
  'adhd.away': {
    ru: '(сортирую чужой массив, он маленький)',
    en: '(sorting someone else’s array, it’s a small one)',
  },
  'adhd.still': {
    ru: 'отвлёкся и вернулся не туда (анимация выключена в системе)',
    en: 'got distracted, came back to the wrong place (animation is off in your system)',
  },

  /* ------------------------- sort by capitalism -------------------------- */

  'cap.idle': { ru: 'жду команды', en: 'awaiting orders' },
  'cap.run': { ru: 'запустить сортировку', en: 'run the sort' },
  'cap.hint': {
    ru: 'алгоритм честный. просто не для всех',
    en: 'the algorithm is fair. just not to everyone',
  },
  'cap.recalc': { ru: 'приоритет пересчитывается', en: 'recalculating priority' },
  'cap.iterTag': { ru: '{never} · итерация {n}', en: '{never} · iteration {n}' },
  'cap.stuck': {
    ru: '> для стажёра сортировка не сошлась (итерация {n})',
    en: '> the sort did not converge for the intern (iteration {n})',
  },
  'cap.ordered': {
    ru: '> порядок установлен. осталась одна мелочь',
    en: '> order established. one small detail remains',
  },
  'cap.queueSkip': { ru: 'вне очереди', en: 'skips the queue' },
  'cap.vip': {
    ru: '> инвестор: приоритетный доступ. сортировка пропущена',
    en: '> investor: priority access. sorting skipped',
  },
  'cap.reading': { ru: '> читаю массив…', en: '> reading the array…' },
  'cap.noConverge': { ru: 'сортировка не сошлась', en: 'the sort did not converge' },
  'cap.stillResult': {
    ru: '> инвестор — вне очереди. для стажёра сортировка не сошлась',
    en: '> the investor skips the queue. for the intern the sort did not converge',
  },

  /* ---------------------------- Claude's Plan ---------------------------- */

  'plan.alt': { ru: "кадр клипа Claude's Plan", en: "a frame from the Claude's Plan video" },
  'plan.cap': { ru: 'открыть клип на ютубе', en: 'open the video on youtube' },
  'plan.note': {
    ru: 'у этого клипа встраивание закрыто автором: он откроется на ютубе, в новой вкладке',
    en: 'the author disabled embedding for this one: it opens on youtube, in a new tab',
  },
  'plan.hint': {
    ru: 'клип снял сам Клод: строчки песни он рисует интерфейсами. вот караоке — с переводом',
    en: 'Claude shot this himself: he draws the lyrics as interfaces. here is the karaoke, line by line',
  },
  'plan.idle': { ru: '[ пустой таймлайн ]', en: '[ empty timeline ]' },
  'plan.go': { ru: 'включить караоке', en: 'start the karaoke' },
  'plan.next': { ru: 'дальше', en: 'next' },
  'plan.stat': { ru: 'строка {n} / {total}', en: 'line {n} / {total}' },
  'plan.statEnd': { ru: 'строка {n} / {total} · конец', en: 'line {n} / {total} · end' },
  'plan.again': { ru: 'ещё дубль', en: 'one more take' },
  'plan.door': { ru: 'дальше — в клипе', en: 'the rest is in the video' },
  'plan.beat.0': { ru: 'день начинается в plan mode', en: 'I start my day in plan mode' },
  'plan.beat.1': { ru: 'строки пишу — только не код', en: 'I write lines, just not code' },
  'plan.beat.2': { ru: 'сервер лёг из-за MCP', en: 'the server went down because of MCP' },
  'plan.beat.3': { ru: 'Клод знает мои ключи', en: 'Claude knows all my keys' },
  'plan.beat.4': { ru: 'ещё один .md вместо работы', en: 'another .md instead of the work' },
  'plan.beat.5': { ru: 'катят плохие правки', en: 'they keep shipping bad edits' },
  'plan.beat.6': { ru: 'следи за контекстным окном', en: 'watch that context window' },

  /* -------------------------------- embed -------------------------------- */

  'embed.blocked': {
    ru: 'встраивание у этого ролика закрыто автором — открыли его на ютубе',
    en: 'the author disabled embedding for this video — we opened it on youtube',
  },
  'embed.file': {
    ru:
      'локально (file://) ютуб эмбед не пускает — открыли ролик в новой вкладке. ' +
      'на сайте он играет прямо здесь',
    en:
      'youtube refuses to embed over file:// — we opened the video in a new tab. ' +
      'on the live site it plays right here',
  },
  'embed.live': { ru: 'ролик играет с ютуба (nocookie)', en: 'playing from youtube (nocookie)' },

  /* ------------------------------ INTERCAL ------------------------------- */

  'icl.lead': {
    ru: 'кликай по строке — она станет вежливой. компилятор считает «пожалуйста».',
    en: 'click a line to make it polite. the compiler is counting your PLEASEs.',
  },
  'icl.of': { ru: 'из', en: 'of' },
  'icl.window': { ru: 'можно от {min} до {max}', en: 'allowed: {min} to {max}' },
  'icl.ok': {
    ru: 'Hello, world!\n\n        PROGRAM ENDED NORMALLY. вежливость засчитана',
    en: 'Hello, world!\n\n        PROGRAM ENDED NORMALLY. politeness accepted',
  },

  /* ----------------------------- JS answers ------------------------------ */

  'js.title': { ru: 'JS отвечает', en: 'JS answers' },
  'js.hint': {
    ru: 'тыкай в выражение — увидишь, что вернёт твой браузер',
    en: 'poke an expression — see what your browser actually returns',
  },
  'js.idle': { ru: '> ждём выражения', en: '> waiting for an expression' },
  'js.foot': {
    ru: 'всё это правда. прямо сейчас. в твоём браузере',
    en: 'all of this is true. right now. in your browser',
  },
  'js.all': { ru: 'выполнить всё', en: 'run them all' },
  'js.done': {
    ru: '> все ответы настоящие. ни один не подделан',
    en: '> every answer is real. not one of them was faked',
  },
  'js.plate': {
    ru: '«мы переписали кодбазу девять раз за месяц» — Kai Lentit',
    en: '“we rewrote the codebase nine times this month” — Kai Lentit',
  },
  'js.note.plus': {
    ru: 'строка сильнее числа: плюс склеивает, а не складывает',
    en: 'the string beats the number: plus glues, it does not add',
  },
  'js.note.arrays': {
    ru: 'два массива стали строками. обе пустые. вот и пустота',
    en: 'both arrays became strings. both empty. hence the emptiness',
  },
  'js.note.objarr': {
    ru: "'' + '[object Object]'. никто не пострадал",
    en: "'' + '[object Object]'. nobody was harmed",
  },
  'js.note.nan': {
    ru: 'единственное значение, не равное самому себе. по стандарту IEEE 754',
    en: 'the only value not equal to itself. straight out of IEEE 754',
  },
  'js.note.typeof': {
    ru: '«не число» — это число. вопросов больше нет',
    en: '“not a number” is a number. no further questions',
  },
  'js.note.float': {
    ru: 'двоичная дробь не умеет в 0.3. это не баг JS, это баг вселенной',
    en: 'binary fractions cannot do 0.3. not a JS bug, a bug in the universe',
  },
  'js.note.sort': {
    ru: 'sort по умолчанию сравнивает СТРОКИ: "10" < "3"',
    en: 'sort compares STRINGS by default: "10" < "3"',
  },
  'js.note.maxmin': {
    ru: 'максимум из ничего = -Infinity, минимум = Infinity',
    en: 'the max of nothing is -Infinity, the min is Infinity',
  },
  'js.note.nullnum': {
    ru: 'при этом null == 0 — ложь. сравнение и равенство живут отдельно',
    en: 'and yet null == 0 is false. comparison and equality live separate lives',
  },
  'js.note.banana': {
    ru: 'самая известная строчка в истории языка',
    en: 'the most famous line in the history of the language',
  },

  /* ----------------------------- magic zone ------------------------------ */

  'magic.lead': { ru: '…дальше в зале темнеет', en: '…further in, the hall goes dark' },
  'magic.title': {
    ru: 'здесь живут языки, на которых правда пишут',
    en: 'here live the languages people actually write in',
  },
  'magic.sub': {
    ru: 'трогай. это не таблички, это они сами',
    en: 'touch them. not labels — the languages themselves',
  },
  'magic.exists': { ru: 'существует', en: 'exists' },
  'magic.spellTitle': { ru: 'GenAlpha Lang · заклинание', en: 'GenAlpha Lang · the incantation' },
  'magic.spellRun': { ru: 'Skibidi (выполнить)', en: 'Skibidi (run)' },
  'magic.spellIdle': { ru: 'программа пуста. добавь Sigma', en: 'the program is empty. add a Sigma' },
  'magic.spellEmpty': { ru: '(пусто)', en: '(empty)' },
  'magic.spellSaid': { ru: 'заклинание из {n} Sigma', en: 'an incantation of {n} Sigma' },
  'magic.spellMore': {
    ru: '{n} Sigma подряд. дальше — Skibidi',
    en: '{n} Sigma in a row. now say Skibidi',
  },
  'magic.spellOut': { ru: '> компилируется. вывод: {n}', en: '> compiles. output: {n}' },
  'magic.spellOutZero': {
    ru: '> компилируется. вывод: 0 (тоже честно)',
    en: '> compiles. output: 0 (also fair)',
  },
  'magic.spellSing': { ru: '▶ sigma boy sigma boy…', en: '▶ sigma boy sigma boy…' },
  'magic.sigmaHead': { ru: 'откуда эти слова', en: 'where these words come from' },
  'magic.sigmaFact': {
    ru:
      'Sigma и Skibidi пришли в язык из клипа «Sigma Boy»: премьера 24 апреля 2025-го, ' +
      '400 миллионов просмотров, 1,2 миллиона лайков.',
    en:
      'Sigma and Skibidi entered the language from the “Sigma Boy” video: premiered ' +
      '24 April 2025, 400 million views, 1.2 million likes.',
  },
  'magic.sigmaCite': { ru: 'топ-коммент под клипом', en: 'top comment under the video' },
  'magic.roomsTitle': {
    ru: 'Backrooms · трёхмерный, без ошибок',
    en: 'Backrooms · three-dimensional, error-free',
  },
  'magic.roomsReset': { ru: 'заново', en: 'again' },
  'magic.roomsIdle': {
    ru: 'иди по коридору. промахнёшься — сам увидишь',
    en: 'walk down the corridor. miss a step and you’ll see for yourself',
  },
  'magic.roomsSaid': { ru: 'Backrooms: {floor}, шаг {pos}', en: 'Backrooms: {floor}, step {pos}' },
  'magic.roomsEnd': {
    ru: 'этажи кончились, падать больше некуда. ошибки так и не было ни разу',
    en: 'out of floors, nowhere left to fall. and still not one error',
  },
  'magic.roomsFall': {
    ru: 'ошибки нет. ты просто провалился сквозь этаж',
    en: 'no error. you just fell through the floor',
  },
  'magic.roomsWalk': {
    ru: 'идём дальше. пол пока держит',
    en: 'onward. the floor is holding, for now',
  },
  'magic.verseIdle': {
    ru: 'вселенная 0. всё, что ты успел натворить в этой зоне, записано.',
    en: 'universe 0. everything you’ve got up to in this zone is on the record.',
  },
  'magic.verseBack': { ru: 'откатиться в прошлое состояние', en: 'roll back to an earlier state' },
  'magic.verseNone': {
    ru:
      'откатываться некуда: в этой вселенной ты ещё ничего не сделал. ' +
      'помычи заклинанием или пройдись по коридору — и возвращайся.',
    en:
      'nothing to roll back to: in this universe you haven’t done anything yet. ' +
      'moo an incantation or walk the corridor — then come back.',
  },
  'magic.verseWarp': {
    ru: 'вселенная {u}. здесь было: {said}. в той, откуда ты пришёл, этого уже не случилось.',
    en: 'universe {u}. here it went: {said}. in the one you came from, none of that ever happened.',
  },
  'magic.whisper.SickPig': {
    ru: '— вариация языка Pig, которая симулирует свинью. Больную свинью.',
    en: '— a variation on the Pig language that simulates a pig. A sick pig.',
  },
  'magic.whisper.FALSE': {
    ru: '— назван в честь любимого истинностного значения автора.',
    en: '— named after the author’s favorite truth value.',
  },
  'magic.why.sigma': {
    ru: 'тот самый клип, из которого язык',
    en: 'the very video the language came from',
  },
  'magic.why.tone': { ru: 'откуда взят тон этой зоны', en: 'where this zone got its tone' },
  'magic.why.strange': {
    ru: 'откуда взяты странные языки',
    en: 'where the strange languages came from',
  },
  'magic.why.ran': { ru: 'кто правда это запускал', en: 'who actually ran all of this' },

  /* ----------------------------- meditation ------------------------------ */

  'med.hint': {
    ru: 'им сказали: помолчите две секунды. посмотрим',
    en: 'they were asked to stay quiet for two seconds. let’s see',
  },
  'med.idle': { ru: '> сидим. пока никто не начал', en: '> sitting. nobody’s started yet' },
  'med.go': { ru: 'начать медитацию', en: 'begin the meditation' },
  'med.stop': { ru: 'хватит', en: 'enough' },
  'med.plate': { ru: 'оригинал обряда: @ahh.gpt', en: 'the rite starts here: @ahh.gpt' },
  'med.over': {
    ru: '> сеанс окончен. реплик за медитацию: {n}. тишины: 2 с',
    en: '> session over. messages during the meditation: {n}. silence: 2 s',
  },
  'med.first': { ru: '> …кто-то не выдержал', en: '> …someone broke first' },
  'med.few': {
    ru: '> реплик: {n}. тишина держалась 2 секунды',
    en: '> messages: {n}. the silence held for 2 seconds',
  },
  'med.many': {
    ru: '> реплик: {n}. это они называют тишиной',
    en: '> messages: {n}. this is what they call silence',
  },
  'med.silence': { ru: '> тишина. все молчат…', en: '> silence. everyone is quiet…' },
  'med.broken': { ru: '> тишина продержалась 2 секунды', en: '> the silence lasted 2 seconds' },

  /* ------------------------------- ritual -------------------------------- */

  'rit.hint': {
    ru: 'чаша, ноутбук, вода. дальше по обряду',
    en: 'bowl, laptop, water. the rite takes it from here',
  },
  'rit.om': { ru: 'ОМ', en: 'OM' },
  'rit.idle': {
    ru: '> обряд не начат. лимиты на месте (к сожалению)',
    en: '> rite not started. the limits are still in place (sadly)',
  },
  'rit.go': { ru: 'облить себя водой', en: 'pour the water over yourself' },
  'rit.again': { ru: 'начать сначала', en: 'start again' },
  'rit.clean': { ru: '> всё чисто. можно грешить заново', en: '> all clean. free to sin again' },
  'rit.washed': { ru: '> {what}: {now}', en: '> {what}: {now}' },
  'rit.water': { ru: '> вода пошла…', en: '> the water is coming…' },
  'rit.plate1': { ru: 'оригинал: @webbyvaris', en: 'the original: @webbyvaris' },
  'rit.plate2': {
    ru: 'сертифицированный курс очищения: Yoga for beginners, класс 1 (1992, improved quality)',
    en: 'certified cleansing course: Yoga for beginners, class 1 (1992, improved quality)',
  },
  'rit.sin.0.what': { ru: 'лимиты Claude', en: 'Claude limits' },
  'rit.sin.0.was': { ru: '0 / 0 осталось', en: '0 / 0 remaining' },
  'rit.sin.0.now': { ru: 'сброшены', en: 'reset' },
  'rit.sin.1.what': { ru: 'карма', en: 'karma' },
  'rit.sin.1.was': {
    ru: '−214 за тот прод-деплой в пятницу',
    en: '−214 for that Friday deploy to prod',
  },
  'rit.sin.1.now': { ru: 'очищена', en: 'cleansed' },
  'rit.sin.2.what': { ru: 'кредиты', en: 'credits' },
  'rit.sin.2.was': { ru: 'списано за месяц: много', en: 'burned this month: a lot' },
  'rit.sin.2.now': { ru: 'прощены', en: 'forgiven' },
  'rit.sin.3.what': { ru: 'судимости', en: 'criminal record' },
  'rit.sin.3.was': { ru: 'rm -rf в чужой ветке', en: 'rm -rf on someone else’s branch' },
  'rit.sin.3.now': { ru: 'сняты', en: 'expunged' },
  'rit.sin.4.what': { ru: 'cookies', en: 'cookies' },
  'rit.sin.4.was': { ru: 'мы ценим вашу приватность', en: 'we value your privacy' },
  'rit.sin.4.now': { ru: 'съедены', en: 'eaten' },

  /* ------------------------------- warrior ------------------------------- */

  'war.hint': {
    ru: 'путь героя по версии интернета: от олимпиадных задач до уличных банд',
    en: 'the hero’s journey, internet edition: from olympiad problems to street gangs',
  },
  'war.idle': { ru: '[ путь не начат ]', en: '[ the path has not begun ]' },
  'war.go': { ru: 'стать воином', en: 'become a warrior' },
  'war.level': { ru: 'уровень:', en: 'level:' },
  'war.wait': { ru: '> путь ждёт. жми', en: '> the path is waiting. press it' },
  'war.again': { ru: 'пройти путь заново', en: 'walk the path again' },
  'war.done': { ru: '> путь пройден. олимпиады работают', en: '> path complete. olympiads work' },
  'war.start': { ru: '> путь начат…', en: '> the path begins…' },

  /* ------------------------------ worst UX ------------------------------- */

  'ux.hint': {
    ru: 'три интерфейса, которые технически работают',
    en: 'three interfaces that technically work',
  },
  'ux.unsubLabel': { ru: 'отписаться от рассылки', en: 'unsubscribe from the newsletter' },
  'ux.unsubBtn': { ru: 'Отписаться', en: 'Unsubscribe' },
  'ux.volume': { ru: 'громкость', en: 'volume' },
  'ux.notRobot': { ru: 'я не робот', en: 'I’m not a robot' },
  'ux.confirm': { ru: 'подтверждаю', en: 'I confirm' },
  'ux.waiting': { ru: 'ждём подтверждения', en: 'awaiting confirmation' },
  'ux.spec': { ru: '> всё по спецификации', en: '> everything is per spec' },
  'ux.plate': { ru: 'оригинал жанра: @inhwoi', en: 'the genre starts here: @inhwoi' },
  'ux.draft': {
    ru: '> кнопка на месте. просто сквозняк',
    en: '> the button is right where it should be. it’s just a draft',
  },
  'ux.fan': {
    ru: '> попыток отписаться: {n}. вентилятор не выключается',
    en: '> unsubscribe attempts: {n}. the fan won’t switch off',
  },
  'ux.stay': {
    ru: '> вы успешно НЕ отписались. спасибо, что остаётесь',
    en: '> you have successfully NOT unsubscribed. thank you for staying with us',
  },
  'ux.loud': { ru: '> громче некуда (вы тянули влево)', en: '> as loud as it gets (you dragged left)' },
  'ux.quiet': {
    ru: '> тише некуда (вы тянули вправо)',
    en: '> as quiet as it gets (you dragged right)',
  },
  'ux.checking': { ru: 'проверяем…', en: 'verifying…' },
  'ux.failStill': {
    ru: 'проверка не пройдена (галочка снята автоматически)',
    en: 'verification failed (the box has unchecked itself)',
  },
  'ux.fail': {
    ru: 'проверка не пройдена. попробуйте ещё раз',
    en: 'verification failed. please try again',
  },
  'ux.failFoot': {
    ru: '> робот не подтверждён. вы, скорее всего, тоже',
    en: '> the robot couldn’t be verified. neither, most likely, could you',
  },

  /* ---------------------------- maze and dice ---------------------------- */

  'maze.aria': {
    ru: 'лабиринт: доведи курсор до галочки в центре (стрелки тоже работают)',
    en: 'maze: guide the cursor to the checkbox in the middle (arrow keys work too)',
  },
  'maze.hintTop': {
    ru: 'чтобы подтвердить, снимите галочку «я передумал». она в центре',
    en: 'to confirm, please uncheck “I changed my mind”. it’s in the middle',
  },
  'maze.on': { ru: 'галочка «я передумал»: стоит', en: '“I changed my mind”: checked' },
  'maze.off': {
    ru: 'галочка «я передумал»: снята (вы прошли лабиринт)',
    en: '“I changed my mind”: unchecked (you beat the maze)',
  },
  'maze.hint': {
    ru: 'веди мышкой от квадратика внизу слева. или стрелками с клавиатуры',
    en: 'drag from the little square at the bottom left. or use the arrow keys',
  },
  'maze.idle': { ru: '> ждём вашего решения', en: '> awaiting your decision' },
  'maze.genre': { ru: 'жанр: worst UX awards · тикток', en: 'genre: worst UX awards · tiktok' },
  'maze.armed': {
    ru: '> галочка снята. кнопка Yes наконец работает',
    en: '> unchecked. the Yes button finally works',
  },
  'maze.denied': {
    ru: '> удалить нельзя: галочка «я передумал» всё ещё стоит',
    en: '> can’t delete: “I changed my mind” is still checked',
  },
  'maze.deleted': {
    ru: '> аккаунт удалён. шутка, это музей. ничего не удалено',
    en: '> account deleted. kidding, this is a museum. nothing was deleted',
  },
  'maze.back': {
    ru: '> спасибо, что остаётесь. галочку мы вернули на место',
    en: '> thank you for staying. we put the checkbox back for you',
  },
  'dice.aria': { ru: 'кубик: {v}', en: 'die: {v}' },
  'dice.holdAria': { ru: 'держать кубик {n}', en: 'hold die {n}' },
  'dice.hint': {
    ru: 'громкость — это сумма выпавшего. хочешь тише? бросай ещё раз',
    en: 'the volume is whatever you roll. want it quieter? roll again',
  },
  'dice.set': {
    ru: '> установлено значение {n}. ровно то, что вы хотели',
    en: '> volume set to {n}. exactly what you wanted',
  },
  'dice.max': { ru: '> почти максимум. соседи уже в курсе', en: '> nearly maxed. the neighbors already know' },
  'dice.min': {
    ru: '> тихо. слишком тихо. бросьте ещё раз (или не бросайте)',
    en: '> quiet. too quiet. roll again (or do not)',
  },
  'dice.held': {
    ru: '> зажато кубиков: {n}. вы почти научились управлять громкостью',
    en: '> dice held: {n}. you have almost learned to control the volume',
  },
  'dice.plate': {
    ru: 'по мотивам конкурса worst volume control',
    en: 'after the worst volume control contest',
  },

  /* ------------------------------- oracle -------------------------------- */

  'orc.alt': {
    ru: 'кадр трэш-трейлера «Группы и теория гомотопий»',
    en: 'a frame from the “Groups and homotopy theory” trash trailer',
  },
  'orc.cap': { ru: 'включить трейлер здесь', en: 'play the trailer right here' },
  'orc.note': {
    ru: 'ютуб подгрузится только после клика (nocookie, без автозагрузки)',
    en: 'youtube loads only after you click (nocookie, no autoplay)',
  },
  'orc.hint': {
    ru: 'лекция, смонтированная как трейлер блокбастера. смотри — и спроси оракула',
    en: 'a lecture cut like a blockbuster trailer. watch it — then ask the oracle',
  },
  'orc.lead': { ru: 'а посередине лекции — вот это:', en: 'and in the middle of the lecture, this:' },
  'orc.idle': { ru: 'задавай мне любые вопросы', en: 'ask me anything you like' },
  'orc.placeholder': {
    ru: 'спроси оракула о своём будущем',
    en: 'ask the oracle about your future',
  },
  'orc.inputAria': { ru: 'вопрос оракулу', en: 'question for the oracle' },
  'orc.go': { ru: 'спросить', en: 'ask' },
  'orc.asked': { ru: '> вопросов задано: {n}', en: '> questions asked: {n}' },
  'orc.theorem': {
    ru: '> вопросов задано: {n}. ответ не меняется — это и есть теорема',
    en: '> questions asked: {n}. the answer does not change — that is the theorem',
  },
  'orc.empty': { ru: 'сначала спроси. потом гомологии', en: 'ask first. homology second' },
  'orc.source': {
    ru: 'из лекции: знакомый математик спрашивал о своём будущем —\n      «она всегда отвечала: гомологии»',
    en: 'from the lecture: a mathematician friend kept asking about his future —\n      “she always answered: homology”',
  },
  'orc.credits': {
    ru: 'лектор: Роман Михайлов · монтаж: конкурс трэш-роликов Лекториума, 2014',
    en: 'lecturer: Roman Mikhailov · edit: Lektorium trash-video contest, 2014',
  },
  'orc.plate1': { ru: 'смотреть сам трейлер', en: 'watch the trailer itself' },
  'orc.plate2': { ru: 'полный курс на Лекториуме', en: 'the full course on Lektorium' },

  /* -------------------------- strange languages -------------------------- */

  'sl.title': {
    ru: 'самые странные языки, которые правда работают',
    en: 'the strangest languages that actually work',
  },
  'sl.temple.punch': {
    ru: '«640×480, 16 цветов — таково было прямое указание бога».',
    en: '“God said 640x480 16 color graphics is a covenant like circumcision.”',
  },
  'sl.temple.sub': {
    ru: 'И это не метафора про легаси: система полностью рабочая, её можно запустить сегодня.',
    en: 'And that is not a metaphor about legacy: the system fully works, you can boot it today.',
  },
  'sl.temple.note': {
    ru:
      'Операционная система, которую Терри Дэвис писал в одиночку больше десяти лет —\n' +
      '        своё ядро, свой компилятор, свой язык HolyC. В HolyC строка сама по себе уже\n' +
      '        команда: написал текст в кавычках — он и напечатался. Ни одного printf.',
    en:
      'An operating system Terry Davis wrote alone for more than ten years — his own\n' +
      '        kernel, his own compiler, his own language, HolyC. In HolyC a string is already\n' +
      '        a statement: put text in quotes and it prints. Not a single printf.',
  },
  'sl.temple.quiet': {
    ru:
      'Терри умер в 2018-м. Здесь он стоит не как курьёз, а как автор: человек\n' +
      '        в одиночку написал операционную систему.',
    en:
      'Terry died in 2018. He stands here not as a curiosity but as an author: one man\n' +
      '        wrote an entire operating system.',
  },
  'sl.temple.site': { ru: 'сайт TempleOS', en: 'the TempleOS site' },
  'sl.temple.wiki': { ru: 'TempleOS в энциклопедии', en: 'TempleOS in the encyclopedia' },
  'sl.cow.title': {
    ru: 'COW · программист вариантов мычания',
    en: 'COW · programming in variations of moo',
  },
  'sl.cow.punch': {
    ru: 'Чтобы корова сказала букву «H», ей надо промычать «MoO» ровно 72 раза.',
    en: 'For the cow to say the letter “H”, it has to moo “MoO” exactly 72 times.',
  },
  'sl.cow.hello': { ru: 'промычать hello world', en: 'moo hello world' },
  'sl.cow.count': {
    ru: 'в ячейке: {cell} · нужно {want} («{letter}»)',
    en: 'in the cell: {cell} · need {want} (“{letter}”)',
  },
  'sl.cow.countPlain': { ru: 'в ячейке: {cell}', en: 'in the cell: {cell}' },
  'sl.cow.empty': { ru: '(пусто. помычи)', en: '(empty. start mooing)' },
  'sl.cow.said': { ru: 'сказано:', en: 'said:' },
  'sl.cow.note': {
    ru:
      'Вся программа собирается из одного слова, регистр решает всё. Прибавить —\n' +
      '          MoO, сказать — Moo, и никаких «напечатай строку». Отдельно стоит mOO:\n' +
      '          единственная команда, которая исполняет содержимое ячейки как команду.',
    en:
      'The whole program is built out of one word; capitalization decides everything.\n' +
      '          Increment is MoO, output is Moo, and there is no “print a string” anywhere.\n' +
      '          mOO stands apart: the only command that executes the contents of a cell\n' +
      '          as a command.',
  },
  'sl.cow.clear': { ru: 'стереть мычание', en: 'wipe the mooing' },
  'sl.cow.first': {
    ru: 'одна буква. корова промычала 72 раза, чтобы сказать «H». осталось десять букв',
    en: 'one letter. the cow mooed 72 times to say “H”. ten letters to go',
  },
  'sl.cow.done': {
    ru: '«{hello}» — {n} мычаний. вот на этом языке и пишут',
    en: '“{hello}” — {n} moos. people actually write code in this',
  },
  'sl.cow.again': { ru: 'ещё раз', en: 'again' },
  'sl.cow.letter': { ru: 'буква {i} из {n}. стадо не сдаётся', en: 'letter {i} of {n}. the herd is not giving up' },
  'sl.cow.mooing': { ru: 'мычит…', en: 'mooing…' },
  'sl.cow.started': {
    ru: 'пошло мычание. это правда единственный способ',
    en: 'the mooing has begun. this really is the only way',
  },
  'sl.cow.stillDone': { ru: '«{hello}» — около {n} мычаний', en: '“{hello}” — about {n} moos' },
  'sl.cow.cleared': { ru: 'стадо разошлось', en: 'the herd has dispersed' },
  'sl.cow.cmd': { ru: '{cmd} — {what}', en: '{cmd} — {what}' },
  'sl.bf.title': { ru: 'brainfuck · восемь символов, и всё', en: 'brainfuck · eight characters, that is all' },
  'sl.bf.punch': {
    ru: 'Автор ставил себе одну задачу: самый маленький компилятор в мире. Уложился в 200 байт.',
    en: 'The author had exactly one goal: the smallest compiler in the world. He fit it into 200 bytes.',
  },
  'sl.bf.sub': {
    ru: 'Наведи на символ — он расскажет, что делает. Их всего восемь, других не будет.',
    en: 'Hover a character and it tells you what it does. There are eight. There will never be more.',
  },
  'sl.bf.author': { ru: 'Урбан Мюллер, 1993', en: 'Urban Müller, 1993' },
  'sl.bf.note': {
    ru:
      'Это Hello World — вернее, его начало. У языка 442 официальных деривата,\n' +
      '          и вырос он из FALSE, чей компилятор влезал в 1024 байта.',
    en:
      'This is Hello World — its beginning, at least. The language has 442 official\n' +
      '          derivatives, and it grew out of FALSE, whose compiler fit into 1024 bytes.',
  },
  'sl.malb.title': { ru: 'Malbolge · восьмой круг ада, 1998', en: 'Malbolge · the eighth circle of hell, 1998' },
  'sl.malb.punch': {
    ru: 'Первый Hello World на Malbolge нашла машина перебором. Люди не смогли.',
    en: 'The first Malbolge Hello World was found by a machine, by brute force. Humans could not do it.',
  },
  'sl.malb.show': { ru: 'показать Hello World', en: 'show Hello World' },
  'sl.malb.hide': { ru: 'убрать, я насмотрелся', en: 'take it away, I have seen enough' },
  'sl.malb.idle': { ru: 'да, вот это вот. просто «Hello, world».', en: 'yes. this. just “Hello, world”.' },
  'sl.malb.found': {
    ru:
      'это и есть вся программа. её не написали — её НАШЛИ: лисп-скрипт перебирал ' +
      'пространство всех возможных программ, пока одна из них не поздоровалась',
    en:
      'this is the entire program. nobody wrote it — it was FOUND: a lisp script combed ' +
      'the space of all possible programs until one of them said hello',
  },
  'sl.malb.note': {
    ru:
      'Язык назван в честь восьмого круга ада. Его писали так, чтобы на нём было\n' +
      '        невозможно программировать, — и почти получилось: первую работающую программу\n' +
      '        нашёл лисп-скрипт, прочёсывавший пространство всех возможных программ.\n' +
      '        У Malbolge Unshackled команды вдобавок шифруются при каждом запуске.',
    en:
      'The language is named after the eighth circle of hell. It was built so that\n' +
      '        programming in it would be impossible — and very nearly succeeded: the first\n' +
      '        working program was found by a lisp script combing the space of all possible\n' +
      '        programs. In Malbolge Unshackled the instructions are also encrypted on every run.',
  },
  'sl.ws.title': {
    ru: 'Whitespace · программа из табов и пробелов',
    en: 'Whitespace · a program made of tabs and spaces',
  },
  'sl.ws.punch': { ru: 'Вот вся программа:', en: 'Here is the entire program:' },
  'sl.ws.voidHint': {
    ru: '(да, тут пусто. ткни — и увидишь код)',
    en: '(yes, it is empty. poke it and you will see the code)',
  },
  'sl.ws.sub': {
    ru: 'А это стихотворение, внутри которого она и лежит. Буквы компилятор не читает вовсе.',
    en: 'And this is the poem it hides inside. The compiler does not read the letters at all.',
  },
  'sl.ws.idle': {
    ru: 'на вид — стихотворение с двумя пустыми строками',
    en: 'looks like a poem with two blank lines in it',
  },
  'sl.ws.show': { ru: 'подсветить невидимое', en: 'light up the invisible' },
  'sl.ws.hide': { ru: 'спрятать обратно', en: 'hide it again' },
  'sl.ws.note': {
    ru:
      'Синтаксис языка состоит из трёх символов: пробел, табуляция, перевод строки.\n' +
      '        Всё остальное — комментарий, поэтому программу можно спрятать в чужом тексте\n' +
      '        так, что её не увидит никто, кроме компилятора.',
    en:
      'The syntax of the language is three characters: space, tab, line feed. Everything\n' +
      '        else is a comment, so a program can be hidden inside someone else’s text where\n' +
      '        nobody but the compiler will ever see it.',
  },
  'sl.ws.poem1': { ru: 'ночью компилятор читает стихи', en: 'at night the compiler reads poetry' },
  'sl.ws.poem3': {
    ru: 'и не находит в них ни одной ошибки',
    en: 'and finds not one error in any of it',
  },
  'sl.ws.poem5': {
    ru: 'потому что ошибок в стихах не бывает',
    en: 'because poems do not have errors',
  },
  'sl.ws.revealBtn': {
    ru: 'вот они: точки — пробелы, стрелки — табы. для Whitespace код только это, а буквы — комментарий',
    en: 'there they are: dots are spaces, arrows are tabs. to Whitespace only this is code, the letters are a comment',
  },
  'sl.ws.revealVoid': {
    ru: 'в пустом поле лежали табы и пробелы. это и была вся программа',
    en: 'that empty field was holding tabs and spaces. that was the whole program',
  },
  'sl.ws.revealCode': {
    ru: 'эта «пустая» строка и есть программа. всё остальное компилятор не читает',
    en: 'this “empty” line is the program. the compiler does not read anything else',
  },
  'sl.ws.revealText': {
    ru: 'а вот эта строка для Whitespace — просто комментарий. код лежит в пустых',
    en: 'this line, to Whitespace, is just a comment. the code lives in the blank ones',
  },
  'sl.ws.revealSel': {
    ru: 'выделение выдало код: пробелы и табы стоят там, где на вид ничего нет',
    en: 'the selection gave the code away: spaces and tabs sit where there seems to be nothing',
  },

  /* ------------------------ beauty room stations ------------------------- */

  'st.ink.title': { ru: 'чернила ещё не высохли', en: 'the ink is not dry yet' },
  'st.ink.note': {
    ru: 'буквы — не текст, а вещество. проведи по ним мышкой',
    en: 'the letters are not text, they are matter. run the mouse through them',
  },
  'st.cal.title': { ru: 'расписание как холст', en: 'a schedule used as canvas' },
  'st.cal.note': {
    ru: 'встречи проступают по одной — а ты закрашивай клетки сам, твои встречи дополнят картинку',
    en: 'the meetings surface one by one — fill in the cells yourself, your meetings will finish the picture',
  },
  'st.cal.chip': { ru: 'по мотивам работы @jordan.gladman', en: 'after the work of @jordan.gladman' },
  'st.cal.mine': { ru: '{word} · твоих встреч: {n}', en: '{word} · your meetings: {n}' },
  'st.graph.title': { ru: 'связи, которых не было', en: 'connections that were never there' },
  'st.graph.note': {
    ru: 'каждая новая точка тянется к тем, кто уже здесь. ткни — посадишь свою, узлы потянутся к руке',
    en: 'every new dot reaches for the ones already here. tap to plant your own, the nodes will lean toward your hand',
  },
  'st.graph.few': {
    ru: 'твоих связей: {n}. каждая нашла себе двух соседей',
    en: 'your connections: {n}. each one found itself two neighbors',
  },
  'st.graph.many': {
    ru: 'твоих связей: {n}. это уже твой граф, а не наш',
    en: 'your connections: {n}. this is your graph now, not ours',
  },
  'st.vision.title': { ru: 'машинное зрение читает стихи', en: 'machine vision reads poetry' },
  'st.vision.note': {
    ru: 'веди мышкой по кадру — рамки пойдут за тобой и подпишут то место, куда ты смотришь',
    en: 'move the mouse across the frame — the boxes will follow and label whatever you are looking at',
  },
  'st.vision.chip': { ru: 'по мотивам работы @drezzdon', en: 'after the work of @drezzdon' },
  'st.vision.zone0.tag': { ru: 'небо 0.98', en: 'sky 0.98' },
  'st.vision.zone0.line': {
    ru: 'небо. распознано с первой попытки, ничего больше не сказано',
    en: 'sky. recognized on the first try, nothing more was said',
  },
  'st.vision.zone1.tag': { ru: 'облако? 0.44', en: 'cloud? 0.44' },
  'st.vision.zone1.line': {
    ru: 'облако или дым. модель не уверена и всё равно отвечает',
    en: 'cloud or smoke. the model is not sure and answers anyway',
  },
  'st.vision.zone2.tag': { ru: 'горизонт 0.81', en: 'horizon 0.81' },
  'st.vision.zone2.line': {
    ru: 'граница между двумя ничем. подписано как объект',
    en: 'the border between two nothings. labeled as an object',
  },
  'st.vision.zone3.tag': { ru: 'кто-то стоял 0.29', en: 'someone stood here 0.29' },
  'st.vision.zone3.line': {
    ru: 'the earth is still warm from you',
    en: 'the earth is still warm from you',
  },
  'st.vision.zone4.tag': { ru: 'земля 0.93', en: 'earth 0.93' },
  'st.vision.zone4.line': {
    ru: 'земля. тёплая. это не метрика, это она так сказала',
    en: 'earth. warm. that is not a metric, that is what she said',
  },

  /* ------------------------------- shared -------------------------------- */

  'sound.hint': {
    ru: 'со звуком (синтез, по твоему клику)',
    en: 'with sound (synthesized, only when you click)',
  },
} satisfies Record<string, Phrase>;

export const lists = {
  /* ------------------------------- terminal ------------------------------- */

  'entryLines': {
    ru: [
      'Lruns ITerium v0.5.3 beta — пробный зал',
      'музей кода, красоты и кринжа',
      'экспонаты собраны по всему интернету;',
      'у каждого — автор и дверь к нему',
      '',
      'press ENTER _',
    ],
    en: [
      'Lruns ITerium v0.5.3 beta — a trial hall',
      'a museum of code, beauty and cringe',
      'exhibits collected from all over the internet;',
      'every one with an author and a door to them',
      '',
      'press ENTER _',
    ],
  },
  'portalLines': {
    ru: ['$ ./enter --room=art', '> открываю портал ....... держись'],
    en: ['$ ./enter --room=art', '> opening the portal ....... hold on'],
  },

  /* ---------------------------- jester's room ---------------------------- */

  // NOTE: COLUMNS ARE ALIGNED WITH SPACES in a monospaced font. Editing a word means
  // recounting the padding: the bar must start at the same character in every row.
  'asciiCharts': {
    ru: [
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
      `$ df -h /dev/humor
  раздел        занято  свободно
  /кринж         96%     ▒░
  /настоящий-код  4%     ████████`,
    ],
    en: [
      `$ measure --exhibit=prev
  cringe level     ████████▓▒  82%
  usefulness       ██░░░░░░░░  17%
  "literally me"   █████████▓  94%`,
      `$ bench sort --all
  bubble    ████░░░░░░  O(n²)
  quick     ██░░░░░░░░  O(n log n)
  adhd      ███████▓▒░  O(n² + distracted)
  capitalism ████████▓  the rich float up`,
      `$ top -u museum
  PID  COMMAND          %CPU
  001  laugh.exe        73.4
  002  shame.daemon     21.9
  003  productivity      0.1`,
      `$ history | grep regret
  1998  "learn C in 21 days"     ▓▒░
  2014  "java is forever"        ████
  2026  "rewriting it in rust"   ██████▓`,
      `$ df -h /dev/humor
  partition       used     free
  /cringe          96%     ▒░
  /real-code        4%     ████████`,
    ],
  },

  'pathJokes': {
    ru: [
      '$ sudo apt install laughter … W: обнаружена инъекция юмора · программы ушли смотреть тикток',
      '// TODO: перестать смеяться (не срочно)',
      'PLEASE DO NOT SUE — INTERCAL без «пожалуйста» не соберётся. мы вежливые',
      'moO moO Moo — (перевод с языка COW: «дальше смешнее»)',
      '$ file program.png → PNG image · и одновременно исполняемый код',
      '$ man esolang → «RTFM. FM тоже на эзотерическом»',
    ],
    en: [
      '$ sudo apt install laughter … W: humor injection detected · all processes left to watch tiktok',
      '// TODO: stop laughing (not urgent)',
      'PLEASE DO NOT SUE — INTERCAL will not build without a “please”. we are polite here',
      'moO moO Moo — (translated from COW: “it gets funnier”)',
      '$ file program.png → PNG image · and an executable program at the same time',
      '$ man esolang → “RTFM. the FM is in an esolang too”',
    ],
  },

  'tickerLines': {
    ru: [
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
    ],
    en: [
      'Malbolge: the first Hello World was written not by a human but by a search algorithm',
      'FALSE: named after the author’s favorite truth value',
      'brainfuck: 442 official derivatives',
      'Malbolge Unshackled encrypts its own instructions on every run',
      'Sigma Sigma Sigma Skibidi — this compiles',
      'PLEASE: mandatory, but not too much of it',
      'Still better than JavaScript',
      'Whitespace: the program hides inside somebody else’s poem',
      'Piet: the source code is a painting, the compiler an art critic',
      'INTERCAL: instead of GOTO it has COME FROM',
      'Malbolge is named after the eighth circle of hell',
      'moO moO Moo',
    ],
  },

  // NOTE: padEnd(16) in room-humor.ts — a label over 16 characters breaks the column.
  'topRows': {
    ru: ['смех.exe', 'стыд.daemon', 'кринж.service', 'продуктивность', 'systemd-honkd'],
    en: ['laugh.exe', 'shame.daemon', 'cringe.service', 'productivity', 'systemd-honkd'],
  },

  'cringeResetLines': {
    ru: [
      'счётчик обнулён. кринж — нет',
      'сброшено. музей смотрит на тебя с надеждой',
      'обнулили. запись в журнале осталась',
      'кринж сброшен и уже возвращается',
      'сброс №4. это тоже кринж, вообще-то',
    ],
    en: [
      'the counter is at zero. the cringe is not',
      'reset. the museum is looking at you with hope',
      'zeroed. the log entry stays',
      'cringe reset, and already on its way back',
      'reset #4. which is also cringe, honestly',
    ],
  },

  'cringeLabels': {
    ru: ['терпимо', 'ой', 'закрой лицо руками', 'я это уже писал в проде', 'ПЕРЕПОЛНЕНИЕ КРИНЖА'],
    en: ['bearable', 'oof', 'hands over your face', 'i’ve shipped this to prod', 'CRINGE OVERFLOW'],
  },

  /* ----------------------------- capitalism ------------------------------ */

  'capitalismNames': {
    ru: ['стажёр', 'джун', 'мидл', 'сеньор', 'тимлид', 'фаундер', 'инвестор'],
    en: ['intern', 'junior', 'mid-level', 'senior', 'tech lead', 'founder', 'investor'],
  },

  'capitalismNever': {
    ru: [
      'пересчитываю приоритет',
      'уточняю грейд',
      'жду ревью от тимлида',
      'ещё один спринт и точно',
      'сортировка не сошлась',
    ],
    en: [
      'recalculating priority',
      'clarifying your grade',
      'waiting on the tech lead’s review',
      'one more sprint and it’s basically shipped',
      'the sort did not converge',
    ],
  },

  /* ------------------------------ ADHD Sort ------------------------------ */

  'adhdAlmost': {
    ru: ['почти. ой, а что там…', 'почти же! …стоп, а что это', 'ну вот почти. ой'],
    en: ['almost. oh, what’s that over there…', 'so close! …wait, what’s that', 'nearly there. oh.'],
  },
  'adhdAway': {
    ru: [
      'о. а что это там за массив',
      'секунду, там всё вверх дном',
      'соседний маленький, я быстро',
      'ой, а тут вообще не отсортировано',
    ],
    en: [
      'oh. what’s that array over there',
      'one second, that one’s upside down',
      'the neighbor’s small, i’ll be quick',
      'oh, this one isn’t sorted at all',
    ],
  },
  'adhdBack': {
    ru: [
      'так… на чём я остановился',
      'ага. я точно был где-то тут',
      'ладно, помню примерно',
      'кажется, отсюда. или нет',
    ],
    en: [
      'so… where was i',
      'right. i was definitely around here',
      'fine, i roughly remember',
      'from here, i think. or not',
    ],
  },
  'adhdSort': {
    ru: ['сортирую', 'сортирую, всё под контролем', 'ещё чуть-чуть', 'вот теперь по-настоящему сортирую'],
    en: ['sorting', 'sorting, everything under control', 'almost done', 'NOW i’m really sorting'],
  },

  /* ----------------------------- meditation ------------------------------ */

  'botLines': {
    ru: [
      'я очистил контекст',
      'ом',
      'отличный вопрос!',
      'как языковая модель, я не чувствую',
      'давайте разберём это по шагам',
      'я достиг просветления за 0.4 с',
      'вы абсолютно правы',
      'дышу токенами',
      'подытожу сказанное выше',
      'а можно ещё раз задачу?',
      'я не уверен, но уверенно',
      'ом (уверенность 0.61)',
      'проверьте, пожалуйста, результат',
      'мне нравится ход ваших мыслей',
      'внутри меня тишина. 4096 токенов тишины',
      'простите за путаницу!',
    ],
    en: [
      'i’ve cleared my context',
      'om',
      'great question!',
      'as an AI language model, i do not have feelings',
      'let’s break this down step by step',
      'i reached enlightenment in 0.4 s',
      'You’re absolutely right!',
      'breathing in tokens',
      'to summarize the above',
      'could you state the task once more?',
      'i’m not sure, but confidently so',
      'om (confidence 0.61)',
      'please double-check the result',
      'i like your train of thought',
      'inside me there’s silence. 4096 tokens of silence',
      'apologies for the confusion!',
    ],
  },

  /* ------------------------------- warrior ------------------------------- */

  'warriorSteps': {
    ru: [
      'школа. обижают все — даже девочки',
      'в туалет врывается ОНО и разгоняет девочек',
      'вручает сборник олимпиадных задач',
      '«ты тоже можешь быть воином»',
      'ты встал и начал решать',
      'тебя зауважали девочки',
      'тебя зауважали мальчики',
      'выпали БОЛЬШИЕ ШТАНЫ',
      'ходишь по школе на понтах с кастетом',
      'влился в уличные банды',
      'вот что могут делать олимпиады',
    ],
    en: [
      'school. everyone bullies you — even the girls',
      'SOMETHING bursts into the bathroom and scatters the girls',
      'hands you a book of olympiad problems',
      '“you too can be a warrior”',
      'you stood up and started solving',
      'the girls started respecting you',
      'the boys started respecting you',
      'BAGGY PANTS dropped',
      'you strut through school with brass knuckles',
      'you joined the street gangs',
      'that is what olympiads can do',
    ],
  },
  'warriorGains': {
    ru: [
      'страдание +1',
      'событие',
      'получен дар',
      'класс: воин',
      'навык: решать +10',
      'репутация +25',
      'репутация +25',
      'легендарный предмет',
      'понты +99',
      'фракция открыта',
      'конец пути',
    ],
    en: [
      'suffering +1',
      'event',
      'gift received',
      'class: warrior',
      'skill: solving +10',
      'reputation +25',
      'reputation +25',
      'legendary item',
      'swagger +99',
      'faction unlocked',
      'end of the path',
    ],
  },

  /* ----------------------------- magic zone ------------------------------ */

  'floors': {
    ru: ['этаж 0', 'этаж −1', 'этаж −2', 'этаж −3'],
    en: ['floor 0', 'floor −1', 'floor −2', 'floor −3'],
  },

  /* ------------------------------- oracle -------------------------------- */

  'oracleAnswers': {
    ru: [
      'гомологии.',
      'всегда гомологии.',
      'ты уже знаешь: гомологии',
      '…гомологии',
      'гомологии. следующий вопрос',
    ],
    en: [
      'homology.',
      'always homology.',
      'you already know: homology',
      '…homology',
      'homology. next question',
    ],
  },

  /* -------------------------- strange languages -------------------------- */

  'mooWhat': {
    ru: [
      'шаг на предыдущую ячейку',
      'шаг на следующую ячейку',
      'уменьшить значение в ячейке',
      'увеличить значение в ячейке',
      'выполнить значение ячейки КАК КОМАНДУ',
      'ввод-вывод: сказать или послушать',
    ],
    en: [
      'step to the previous cell',
      'step to the next cell',
      'decrease the value in the cell',
      'increase the value in the cell',
      'execute the value of the cell AS A COMMAND',
      'input/output: say something or listen',
    ],
  },
  'bfWhat': {
    ru: [
      'шаг вправо по ленте',
      'шаг влево по ленте',
      'прибавить 1 к ячейке',
      'отнять 1 от ячейки',
      'напечатать ячейку',
      'прочитать символ',
      'если ноль — прыгнуть за скобку',
      'если не ноль — вернуться назад',
    ],
    en: [
      'step right along the tape',
      'step left along the tape',
      'add 1 to the cell',
      'subtract 1 from the cell',
      'print the cell',
      'read a character',
      'if zero — jump past the bracket',
      'if not zero — jump back',
    ],
  },

  /* ----------------------------- beauty room ----------------------------- */

  'calendarMine': {
    ru: [
      'первая встреча в календаре. пиксель',
      'две встречи. уже композиция',
      'расписание становится холстом',
      'ты рисуешь неделей',
      'у художника это заняло тысячи встреч',
    ],
    en: [
      'first meeting in the calendar. one pixel',
      'two meetings. already a composition',
      'the schedule is turning into a canvas',
      'you are painting with a week',
      'the artist needed thousands of meetings for this',
    ],
  },
  'visionTags': {
    ru: ['человек? 0.71', 'что-то тёплое 0.63', 'дом 0.94', 'дерево 0.88', 'память 0.12'],
    en: ['person? 0.71', 'something warm 0.63', 'house 0.94', 'tree 0.88', 'memory 0.12'],
  },
  'visionLines': {
    ru: [
      'здесь кто-то стоял',
      'модель уверена на 0.63',
      'the earth is still warm from you',
      'объект не найден в словаре',
    ],
    en: [
      'someone stood here',
      'the model is 0.63 confident',
      'the earth is still warm from you',
      'object not found in the vocabulary',
    ],
  },
  'skyWords': {
    ru: ['звезда 0.91', 'точка? 0.38', 'свет 0.77', 'объект', 'ничего 0.12'],
    en: ['star 0.91', 'dot? 0.38', 'light 0.77', 'object', 'nothing 0.12'],
  },
} satisfies Record<string, PhraseList>;
