import { mountGraph } from './graph.ts';

const surface = document.querySelector<HTMLElement>('.hero-surface')!;
const params = new URLSearchParams(window.location.search);
const requested = params.get('geometry') ?? '';
const geometry = [
  'waves',
  'cubes',
  'scaffold',
  'truss',
  'lattice',
  'clusters',
  'dag',
].includes(requested ?? '')
  ? requested
  : 'truss';
surface.dataset.geometry = geometry;

const preview = document.querySelector<HTMLElement>('.geometry-preview')!;
preview.hidden = params.get('preview') !== 'geometry';
for (const link of preview.querySelectorAll<HTMLAnchorElement>(
  '[data-geometry]',
)) {
  if (link.dataset.geometry === geometry)
    link.setAttribute('aria-current', 'true');
  else link.removeAttribute('aria-current');
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let frame = 0;
let lastProgress = -1;

function draw() {
  frame = 0;
  if (reducedMotion.matches) return;
  const end = Math.max(1, surface.offsetTop + surface.offsetHeight);
  const progress = Math.max(0, Math.min(1, window.scrollY / end));
  if (progress === lastProgress) return;
  lastProgress = progress;
  surface.style.setProperty('--scene-shift', `${(progress * 80).toFixed(2)}px`);
  surface.style.setProperty(
    '--scene-turn',
    `${(progress * 1.6).toFixed(3)}deg`,
  );
}

function schedule() {
  if (geometry !== 'truss' && !frame && !reducedMotion.matches)
    frame = window.requestAnimationFrame(draw);
}

function syncMotion() {
  if (reducedMotion.matches) {
    window.cancelAnimationFrame(frame);
    frame = 0;
    lastProgress = -1;
    surface.style.removeProperty('--scene-shift');
    surface.style.removeProperty('--scene-turn');
  } else schedule();
}

window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule);
reducedMotion.addEventListener('change', syncMotion);
if (geometry === 'truss') mountGraph(surface);
syncMotion();
