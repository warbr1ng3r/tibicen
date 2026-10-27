import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { graphAt } from '../../landing/src/scripts/graph.ts';

test('the flat graph has one connected set of two-dimensional nodes and valid unique edges', () => {
  const { nodes, edges } = graphAt(0);
  assert.equal(nodes.length, 77);
  assert(
    nodes.every((point) => point.length === 2 && point.every(Number.isFinite)),
  );
  assert.equal(
    new Set(edges.map((edge) => [...edge].sort((a, b) => a - b).join(':')))
      .size,
    edges.length,
  );
  const neighbors = nodes.map((): number[] => []);
  for (const [a, b] of edges) {
    assert(
      a !== b &&
        Number.isInteger(a) &&
        Number.isInteger(b) &&
        nodes[a] &&
        nodes[b],
    );
    neighbors[a].push(b);
    neighbors[b].push(a);
  }
  const seen = new Set([0]),
    queue = [0];
  for (const node of queue)
    for (const next of neighbors[node])
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
  assert.equal(seen.size, nodes.length);
});

test('nodes move independently within bounded paths while their edge endpoints remain attached', () => {
  const initial = graphAt(0);
  const later = graphAt(3);
  assert(
    later.nodes.filter(
      (point, i) =>
        Math.hypot(
          point[0] - initial.nodes[i][0],
          point[1] - initial.nodes[i][1],
        ) > 1,
    ).length > 60,
  );
  const displacements = later.nodes.map((point, i) =>
    point.map((n, axis) => (n - initial.nodes[i][axis]).toFixed(2)).join(':'),
  );
  assert(new Set(displacements).size > 60);
  for (const seconds of [0, 1, 5, 30, 1000]) {
    const graph = graphAt(seconds);
    assert.deepEqual(graph.edges, initial.edges);
    graph.nodes.forEach(([x, y], i) => {
      assert(Number.isFinite(x) && Number.isFinite(y));
      assert(Math.abs(x - initial.nodes[i][0]) <= 36.001);
      assert(Math.abs(y - initial.nodes[i][1]) <= 28.001);
    });
    assert(graph.edges.every(([a, b]) => graph.nodes[a] && graph.nodes[b]));
  }
  assert.deepEqual(graphAt(0), initial);
});

const source = ts
  .transpileModule(
    await readFile(
      new URL('../../landing/src/scripts/graph.ts', import.meta.url),
      'utf8',
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2023,
      },
    },
  )
  .outputText.replace(/^export /gm, '');

function view({ reduced = false, available = true } = {}) {
  const frames = new Map<number, (timestamp: number) => void>(),
    events = new Map<string, () => void>(),
    classes = new Set<string>();
  let intersection: (entries: { isIntersecting: boolean }[]) => void,
    resize: () => void,
    preference: () => void;
  let id = 1,
    paints = 0,
    moves: number[][] = [];
  const context = {
    setTransform() {},
    clearRect() {
      paints++;
      moves = [];
    },
    beginPath() {},
    moveTo(...point: number[]) {
      moves.push(point);
    },
    lineTo() {},
    stroke() {},
    arc() {},
    fill() {},
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => (available ? context : null),
    setAttribute() {},
  };
  const surface = {
    canvas: undefined as typeof canvas | undefined,
    clientWidth: 1440,
    clientHeight: 700,
    classList: { add: (name: string) => classes.add(name) },
    prepend: (child: typeof canvas) => {
      surface.canvas = child;
    },
  };
  const motion = {
    matches: reduced,
    addEventListener(name: string, callback: () => void) {
      preference = callback;
    },
  };
  const window = {
    devicePixelRatio: 3,
    matchMedia: () => motion,
    requestAnimationFrame(callback: (timestamp: number) => void) {
      const next = id++;
      frames.set(next, callback);
      return next;
    },
    cancelAnimationFrame: (frame: number) => frames.delete(frame),
    ResizeObserver: class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
    },
    IntersectionObserver: class {
      constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
        intersection = callback;
      }
      observe() {}
    },
  };
  const document = {
    hidden: false,
    createElement: () => canvas,
    addEventListener: (name: string, callback: () => void) =>
      events.set(name, callback),
  };
  const runtime: {
    window: typeof window;
    document: typeof document;
    mountGraph?: (target: typeof surface) => void;
  } = { window, document };
  runInNewContext(source, runtime);
  runtime.mountGraph!(surface);
  return {
    surface,
    canvas,
    classes,
    frames,
    get paints() {
      return paints;
    },
    get firstNode() {
      return [...moves[0]];
    },
    flush(timestamp: number) {
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) callback(timestamp);
    },
    intersect(value: boolean) {
      intersection([{ isIntersecting: value }]);
    },
    hide(value: boolean) {
      document.hidden = value;
      events.get('visibilitychange')!();
    },
    reduce(value: boolean) {
      motion.matches = value;
      preference();
    },
    resize() {
      resize();
    },
  };
}

test('animation pauses offscreen, in hidden tabs and for reduced motion, and resumes without a time jump', () => {
  const page = view();
  assert.equal(page.frames.size, 0);
  assert.equal(page.paints, 1);
  assert(page.classes.has('graph-ready'));
  assert.equal(
    page.canvas.width,
    2880,
    'Canvas resolution is capped at twice the CSS size.',
  );
  page.intersect(true);
  assert.equal(page.frames.size, 1);
  page.flush(1000);
  const initial = page.firstNode;
  page.flush(1050);
  assert.notDeepEqual(page.firstNode, initial);
  const paused = page.firstNode;
  page.intersect(false);
  assert.equal(page.frames.size, 0);
  page.hide(true);
  page.intersect(true);
  assert.equal(page.frames.size, 0);
  page.hide(false);
  assert.equal(page.frames.size, 1);
  page.flush(5000);
  assert.deepEqual(page.firstNode, paused);
  page.reduce(true);
  assert.equal(page.frames.size, 0);
  assert.deepEqual(page.firstNode, initial);
  page.reduce(false);
  assert.equal(page.frames.size, 1);
  page.surface.clientWidth = 390;
  page.resize();
  assert.equal(page.canvas.width, 780);

  const still = view({ reduced: true });
  still.intersect(true);
  assert.equal(still.frames.size, 0);
  still.reduce(false);
  assert.equal(still.frames.size, 1);
});

test('an unavailable canvas leaves the static SVG fallback intact', () => {
  const page = view({ available: false });
  assert.equal(page.surface.canvas, undefined);
  assert.equal(page.frames.size, 0);
  assert.equal(page.classes.size, 0);
});
