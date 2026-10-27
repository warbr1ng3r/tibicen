type Point = [number, number];

const nodes: Point[] = [
  [-180, 241.7],
  [-4.4, 229.6],
  [99.4, 213.6],
  [286.3, 197.7],
  [401, 187.6],
  [587.2, 188],
  [715.7, 179],
  [823.8, 178.1],
  [983.4, 178.2],
  [1156.6, 187.9],
  [1308.6, 205.9],
  [1468.9, 219],
  [1567.5, 227.4],
  [1740, 244.9],
  [-180, 755.3],
  [-11.6, 739],
  [91.3, 732.5],
  [244.4, 721.2],
  [404.3, 722],
  [526.7, 716],
  [696.7, 703.2],
  [855.8, 708.1],
  [977.7, 711.8],
  [1117.5, 719.3],
  [1267.1, 727.9],
  [1426.7, 734.2],
  [1607.1, 743.8],
  [1740, 753.1],
  [1113.4, 648.6],
  [631.5, 291.6],
  [-112.2, 639.5],
  [716, 395.7],
  [1694.2, 464.2],
  [495.9, 625.3],
  [-109.8, 483],
  [278.4, 589.3],
  [94.6, 450.3],
  [1175.3, 381.3],
  [1179.2, 446.2],
  [123.6, 560.8],
  [883.8, 644.2],
  [1619, 354.4],
  [920.5, 437],
  [1475.4, 635],
  [841.4, 546.6],
  [265.7, 366.8],
  [799.9, 274.7],
  [1296.7, 364.7],
  [1214, 512.9],
  [1087.3, 433.4],
  [1699.4, 550.2],
  [1209.7, 674.4],
  [525.2, 534.4],
  [1483.5, 555],
  [44.9, 508.8],
  [1054.3, 322.5],
  [403.7, 510.6],
  [943.1, 360.2],
  [648.1, 472.2],
  [1552.2, 512.7],
  [1275.9, 289.4],
  [418.2, 256.4],
  [1004.8, 478.4],
  [885, 251.8],
  [-85.5, 359.2],
  [307.8, 304.3],
  [201.2, 322.6],
  [619.1, 640.2],
  [1301.1, 589.8],
  [1404.7, 375.5],
  [165.3, 665.7],
  [794.1, 622.7],
  [1410.8, 267.4],
  [1359.6, 499.5],
  [-110.8, 566.5],
  [987.2, 569.4],
  [238.1, 487.6],
];
const edges: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 2],
  [4, 5],
  [4, 6],
  [5, 6],
  [9, 10],
  [9, 11],
  [10, 11],
  [9, 12],
  [11, 12],
  [14, 15],
  [16, 17],
  [20, 21],
  [18, 19],
  [22, 23],
  [24, 25],
  [26, 27],
  [22, 28],
  [28, 23],
  [6, 29],
  [29, 5],
  [14, 30],
  [30, 15],
  [18, 33],
  [33, 19],
  [14, 0],
  [0, 34],
  [34, 14],
  [17, 35],
  [35, 18],
  [35, 33],
  [21, 40],
  [40, 22],
  [12, 13],
  [13, 41],
  [41, 12],
  [13, 32],
  [32, 41],
  [25, 43],
  [43, 26],
  [31, 42],
  [42, 44],
  [44, 31],
  [6, 7],
  [7, 46],
  [46, 6],
  [46, 29],
  [31, 29],
  [46, 31],
  [38, 37],
  [37, 47],
  [47, 38],
  [38, 49],
  [49, 37],
  [38, 48],
  [48, 49],
  [13, 27],
  [27, 50],
  [50, 13],
  [50, 32],
  [26, 50],
  [43, 50],
  [23, 51],
  [51, 24],
  [28, 51],
  [43, 53],
  [53, 50],
  [34, 36],
  [36, 54],
  [54, 34],
  [36, 39],
  [39, 54],
  [8, 9],
  [9, 55],
  [55, 8],
  [49, 55],
  [55, 37],
  [35, 56],
  [56, 33],
  [52, 33],
  [56, 52],
  [31, 57],
  [57, 42],
  [46, 57],
  [49, 42],
  [57, 49],
  [57, 55],
  [44, 58],
  [58, 31],
  [58, 29],
  [56, 58],
  [58, 52],
  [56, 29],
  [32, 59],
  [59, 41],
  [50, 59],
  [53, 59],
  [10, 60],
  [60, 9],
  [37, 60],
  [60, 47],
  [55, 60],
  [5, 61],
  [61, 4],
  [29, 61],
  [3, 4],
  [61, 3],
  [56, 61],
  [42, 62],
  [62, 44],
  [49, 62],
  [48, 62],
  [7, 8],
  [8, 63],
  [63, 7],
  [63, 46],
  [63, 57],
  [55, 63],
  [1, 64],
  [64, 0],
  [64, 34],
  [64, 36],
  [61, 65],
  [65, 3],
  [56, 45],
  [45, 65],
  [65, 56],
  [2, 66],
  [66, 1],
  [45, 36],
  [36, 66],
  [66, 45],
  [64, 66],
  [2, 3],
  [3, 66],
  [65, 66],
  [19, 67],
  [67, 20],
  [33, 67],
  [52, 67],
  [58, 67],
  [24, 68],
  [68, 25],
  [68, 43],
  [28, 48],
  [48, 68],
  [68, 28],
  [68, 51],
  [68, 53],
  [59, 69],
  [69, 41],
  [15, 70],
  [70, 16],
  [70, 17],
  [70, 35],
  [39, 35],
  [70, 39],
  [30, 39],
  [20, 71],
  [71, 21],
  [71, 40],
  [44, 40],
  [71, 44],
  [67, 71],
  [71, 58],
  [12, 72],
  [72, 11],
  [41, 72],
  [72, 10],
  [72, 60],
  [69, 72],
  [72, 47],
  [69, 47],
  [47, 73],
  [73, 38],
  [73, 48],
  [68, 73],
  [73, 53],
  [69, 73],
  [73, 59],
  [14, 74],
  [74, 30],
  [34, 74],
  [54, 74],
  [74, 39],
  [22, 75],
  [75, 28],
  [40, 75],
  [44, 75],
  [62, 75],
  [75, 48],
  [39, 76],
  [76, 35],
  [36, 76],
  [76, 56],
  [45, 76],
];

export function graphAt(seconds: number) {
  return {
    nodes: nodes.map(([x, y], index): Point => [
      x +
        18 * Math.sin(seconds * (0.34 + (index % 5) * 0.026) + index * 2.39996),
      y + 14 * Math.cos(seconds * (0.28 + (index % 7) * 0.018) + index * 1.618),
    ]),
    edges,
  };
}

export function mountGraph(surface: HTMLElement) {
  const canvas = document.createElement('canvas');
  const candidate = canvas.getContext('2d');
  if (!candidate) return;
  const context = candidate;
  canvas.className = 'graph-background';
  canvas.setAttribute('aria-hidden', 'true');
  surface.prepend(canvas);

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width: number, height: number, ratio: number;
  let visible = false;
  let frame = 0;
  let elapsed = 0;
  let previous: number | undefined;

  function paint() {
    const graph = graphAt(elapsed / 1000);
    const scale = Math.max(width / 1600, height / 850);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.setTransform(
      ratio * scale,
      0,
      0,
      ratio * scale,
      (ratio * (width - 1600 * scale)) / 2,
      (ratio * (height - 850 * scale)) / 2,
    );
    context.beginPath();
    for (const [a, b] of graph.edges) {
      context.moveTo(...graph.nodes[a]);
      context.lineTo(...graph.nodes[b]);
    }
    context.strokeStyle = 'rgba(147, 147, 147, .23)';
    context.lineWidth = 1.15;
    context.stroke();
    context.beginPath();
    for (const [x, y] of graph.nodes) {
      context.moveTo(x + 2.7, y);
      context.arc(x, y, 2.7, 0, Math.PI * 2);
    }
    context.fillStyle = '#1c1c1c';
    context.strokeStyle = 'rgba(170, 170, 170, .4)';
    context.lineWidth = 1;
    context.fill();
    context.stroke();
  }

  function resize() {
    width = Math.max(1, surface.clientWidth);
    height = Math.max(1, surface.clientHeight);
    ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    paint();
  }

  function tick(timestamp: number) {
    frame = 0;
    if (!visible || document.hidden || motion.matches) return;
    if (previous !== undefined)
      elapsed += Math.max(0, Math.min(100, timestamp - previous));
    previous = timestamp;
    paint();
    frame = window.requestAnimationFrame(tick);
  }

  function sync() {
    if (!visible || document.hidden || motion.matches) {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previous = undefined;
      if (motion.matches) {
        elapsed = 0;
        paint();
      }
    } else if (!frame) frame = window.requestAnimationFrame(tick);
  }

  resize();
  surface.classList.add('graph-ready');
  new window.ResizeObserver(resize).observe(surface);
  new window.IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(surface);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
}
