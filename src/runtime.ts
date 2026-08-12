// Shared helpers: teardown on screen change, reduced-motion check, scroll reveal,
// and a live status line (an Emacs-style modeline: Top / 42% / Bot).

const cleanups: Array<() => void> = [];

export function onCleanup(fn: () => void): void {
  cleanups.push(fn);
}

export function runCleanups(): void {
  while (cleanups.length) {
    const fn = cleanups.pop();
    if (fn) fn();
  }
}

export function reducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Timeout that cancels itself when the screen is torn down. */
export function later(fn: () => void, ms: number): number {
  const id = window.setTimeout(fn, ms);
  onCleanup(() => window.clearTimeout(id));
  return id;
}

/**
 * Step driver for interactive widgets that loop forever. It holds a single timer
 * slot, so restarting cannot leak stray timers, and screen teardown kills it for
 * good. While the tab is hidden it re-arms instead of stepping.
 */
export interface StepEngine {
  next(fn: () => void, ms: number): void;
  stop(): void;
}

export function stepEngine(): StepEngine {
  let id = 0;
  let dead = false;
  const stop = (): void => {
    if (id) window.clearTimeout(id);
    id = 0;
  };
  const next = (fn: () => void, ms: number): void => {
    if (dead) return;
    stop();
    id = window.setTimeout(() => {
      id = 0;
      if (dead) return;
      if (document.hidden) {
        next(fn, 240); // tab is hidden: wait for it to come back, skip the step
        return;
      }
      fn();
    }, ms);
  };
  onCleanup(() => {
    dead = true;
    stop();
  });
  return { next, stop };
}

/** Reveal elements as they scroll into view. With reduced motion, show at once. */
export function revealOnScroll(nodes: Element[], stepMs = 60): void {
  if (!nodes.length) return;
  if (reducedMotion() || typeof IntersectionObserver === 'undefined') {
    nodes.forEach((n) => n.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
  );
  nodes.forEach((n, i) => {
    (n as HTMLElement).style.setProperty('--d', `${(i % 3) * stepMs}ms`);
    io.observe(n);
  });
  onCleanup(() => io.disconnect());
}

/** Scroll subscription that unregisters itself on teardown. */
export function onScroll(fn: () => void): void {
  window.addEventListener('scroll', fn, { passive: true });
  onCleanup(() => window.removeEventListener('scroll', fn));
  fn();
}

/**
 * Modeline: buffer position plus a progress fill.
 * `invert` is for rooms read BOTTOM-UP: progress is complete at the top of the page.
 */
export function liveModeline(
  posEl: HTMLElement | null,
  progressEl?: HTMLElement | null,
  invert = false,
): void {
  if (!posEl) return;
  onScroll(() => {
    const se = document.scrollingElement as HTMLElement | null;
    if (!se) return;
    const max = se.scrollHeight - se.clientHeight;
    let label = 'All';
    let frac = 0;
    if (max > 4) {
      const raw = Math.min(1, Math.max(0, se.scrollTop / max));
      frac = invert ? 1 - raw : raw;
      const pct = Math.round(frac * 100);
      label = pct <= 1 ? 'Start' : pct >= 99 ? 'End' : `${pct}%`;
    }
    posEl.textContent = label;
    if (progressEl) progressEl.style.height = `${(frac * 100).toFixed(1)}%`;
  });
}

/** Dashed separator line, like the one between Emacs windows. */
export function ruleLine(): string {
  return `<div class="rule" aria-hidden="true">${'-'.repeat(400)}</div>`;
}
