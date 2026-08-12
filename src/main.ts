// Router. Three screens: terminal (boot -> menu), jokes room, beauty room.
// Path choice lives INSIDE the terminal — there is no separate door screen.
// On narrow screens the rooms are gated: a stub offers the desktop layout instead.

import { menuItems } from './data';
import { desktopForced, renderMobileGate, smallScreen } from './mobile';
import { renderArt } from './room-art';
import { renderHumor } from './room-humor';
import { runCleanups } from './runtime';
import { renderBoot, renderMenu } from './terminal';

const app = document.getElementById('app') as HTMLElement;

type Screen = 'boot' | 'menu' | 'humor' | 'art';

function currentScreen(): Screen {
  const h = location.hash;
  if (h === '#humor') return 'humor';
  if (h === '#art') return 'art';
  if (h === '#menu' || h === '#choose') return 'menu';
  return 'boot';
}

/** A room is open only if its menu item is open. The menu is the single source of truth. */
function roomOpen(id: string): boolean {
  const m = menuItems.find((x) => x.id === id);
  return !!m && m.ready;
}

function render(): void {
  runCleanups();
  window.scrollTo(0, 0);
  const s = currentScreen();
  // A locked room also blocks direct entry: a closed room's hash does not open it
  // even via a pasted link — we bounce back to the menu.
  // Changing the hash triggers render() again by itself, so we must NOT draw here a
  // second time, otherwise the menu mounts twice and registers duplicate listeners.
  if ((s === 'humor' || s === 'art') && !roomOpen(s)) {
    location.hash = '#menu';
    return;
  }
  if (s === 'boot') renderBoot(app);
  else if (s === 'menu') renderMenu(app);
  else if ((s === 'humor' || s === 'art') && smallScreen() && !desktopForced()) {
    renderMobileGate(app, s, render);
  } else if (s === 'humor') renderHumor(app);
  else renderArt(app);
}

window.addEventListener('hashchange', render);
render();
