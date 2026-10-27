import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = ts
  .transpileModule(
    await readFile(
      new URL('../../landing/src/scripts/background.ts', import.meta.url),
      'utf8',
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2023,
      },
    },
  )
  .outputText.replace(/^import .*;\n/, '');

function page({ search = '', reduced = false, scrollY = 0 } = {}) {
  const styles = new Map<string, string>();
  const frames = new Map<number, () => void>();
  const events = new Map<
    string,
    { callback: () => void; options?: AddEventListenerOptions }
  >();
  let nextFrame = 1;
  let motionChange: () => void;
  let graphMounts = 0;
  const motion = {
    matches: reduced,
    addEventListener(name: string, callback: () => void) {
      motionChange = callback;
    },
  };
  const surface = {
    dataset: {} as Record<string, string>,
    offsetTop: 94,
    offsetHeight: 700,
    style: {
      setProperty: (key: string, value: string) => styles.set(key, value),
      removeProperty: (key: string) => styles.delete(key),
    },
  };
  const links = [
    'waves',
    'cubes',
    'scaffold',
    'truss',
    'lattice',
    'clusters',
    'dag',
  ].map((geometry) => ({
    dataset: { geometry },
    current: false,
    setAttribute() {
      this.current = true;
    },
    removeAttribute() {
      this.current = false;
    },
  }));
  const preview = { hidden: true, querySelectorAll: () => links };
  const window = {
    location: { search },
    scrollY,
    matchMedia: () => motion,
    requestAnimationFrame(callback: () => void) {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id: number) {
      frames.delete(id);
    },
    addEventListener(
      name: string,
      callback: () => void,
      options?: AddEventListenerOptions,
    ) {
      events.set(name, { callback, options });
    },
  };
  const document = {
    querySelector: (selector: string) =>
      selector === '.hero-surface' ? surface : preview,
  };
  runInNewContext(source, {
    window,
    document,
    URLSearchParams,
    mountGraph() {
      graphMounts++;
    },
  });
  return {
    surface,
    preview,
    links,
    styles,
    frames,
    events,
    window,
    get graphMounts() {
      return graphMounts;
    },
    flush() {
      const queued = [...frames.values()];
      frames.clear();
      for (const callback of queued) callback();
    },
    reduce(value: boolean) {
      motion.matches = value;
      motionChange();
    },
  };
}

test('scroll motion coalesces frames, follows restored scroll and stops at the hero boundary', () => {
  const view = page({ search: '?geometry=waves', scrollY: 397 });
  assert.equal(view.frames.size, 1);
  view.events.get('scroll')!.callback();
  view.events.get('scroll')!.callback();
  assert.equal(view.frames.size, 1);
  assert.equal(view.events.get('scroll')!.options!.passive, true);
  view.flush();
  assert.equal(view.styles.get('--scene-shift'), '40.00px');
  assert.equal(view.styles.get('--scene-turn'), '0.800deg');
  assert.equal(view.frames.size, 0);
  view.window.scrollY = 10000;
  view.events.get('scroll')!.callback();
  view.flush();
  assert.equal(view.styles.get('--scene-shift'), '80.00px');
  view.window.scrollY = -20;
  view.events.get('scroll')!.callback();
  view.flush();
  assert.equal(view.styles.get('--scene-shift'), '0.00px');
  view.surface.offsetHeight = 1494;
  view.window.scrollY = 397;
  view.events.get('resize')!.callback();
  view.flush();
  assert.equal(view.styles.get('--scene-shift'), '20.00px');
});

test('reduced motion disables scheduling immediately, cancels pending work and supports live changes', () => {
  const view = page({ search: '?geometry=waves', reduced: true, scrollY: 397 });
  assert.equal(view.frames.size, 0);
  view.events.get('scroll')!.callback();
  assert.equal(view.frames.size, 0);
  view.reduce(false);
  view.flush();
  assert.equal(view.styles.get('--scene-shift'), '40.00px');
  view.events.get('scroll')!.callback();
  assert.equal(view.frames.size, 1);
  view.reduce(true);
  assert.equal(view.frames.size, 0);
  assert.equal(view.styles.size, 0);
  view.events.get('scroll')!.callback();
  assert.equal(view.frames.size, 0);
});

test('geometry uses only known choices and comparison controls are limited to preview mode', () => {
  const normal = page();
  assert.equal(normal.surface.dataset.geometry, 'truss');
  assert.equal(normal.preview.hidden, true);
  assert.equal(
    normal.graphMounts,
    1,
    'The main page must animate graph vertices without a preview URL.',
  );
  assert.equal(
    normal.frames.size,
    0,
    'The default graph must not use scroll-driven rotation.',
  );
  for (const geometry of [
    'waves',
    'cubes',
    'scaffold',
    'truss',
    'lattice',
    'clusters',
    'dag',
  ]) {
    const view = page({ search: `?preview=geometry&geometry=${geometry}` });
    assert.equal(view.surface.dataset.geometry, geometry);
    assert.equal(view.preview.hidden, false);
    assert.equal(view.graphMounts, geometry === 'truss' ? 1 : 0);
    if (geometry === 'truss') {
      view.events.get('scroll')!.callback();
      assert.equal(
        view.frames.size,
        0,
        'The flat graph must not rotate or drift as a whole on scroll.',
      );
    }
    assert.deepEqual(
      view.links
        .filter((link) => link.current)
        .map((link) => link.dataset.geometry),
      [geometry],
    );
  }
  const unknown = page({
    search: '?geometry=https://untrusted.example/asset&preview=other',
  });
  assert.equal(unknown.surface.dataset.geometry, 'truss');
  assert.equal(unknown.preview.hidden, true);
  assert.equal(
    page({ search: '?geometry=rings' }).surface.dataset.geometry,
    'truss',
  );
});
