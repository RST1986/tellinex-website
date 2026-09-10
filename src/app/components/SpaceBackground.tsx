import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   Flowing fiber-optic / data-stream background
   Canvas draws:
   • Animated bezier "signal streams" (traveling glow dots)
   • Stars + subtle twinkling
   • Deep-space radial gradient base
───────────────────────────────────────────── */

interface StreamLine {
  x0: number; y0: number;
  cx1: number; cy1: number;
  cx2: number; cy2: number;
  x1: number; y1: number;
  color1: string;
  color2: string;
  width: number;
  speed: number;
  progress: number;
  glowLen: number;
  delay: number;
  opacity: number;
}

interface Star {
  x: number; y: number; r: number;
  op: number; phase: number; speed: number;
}

interface CanvasPalette {
  streamPrimary: string;
  streamAccent: string;
  streamPrimaryLight: string;
  streamAccentLight: string;
  streamAccentDark: string;
  bgNear: string;
  bgMid: string;
  bgFar: string;
  transparent: string;
  primaryGlow: string;
  primaryGlowSoft: string;
  accentGlow: string;
  accentGlowSoft: string;
  star: string;
  atmosphereInner: string;
  atmosphereEdge: string;
  globeRim: string;
  globeBody: string;
  globeCore: string;
  wireframe: string;
  grid: string;
}

function readCanvasPalette(): CanvasPalette | null {
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  const palette: CanvasPalette = {
    streamPrimary: token('--tlx-canvas-stream-primary'),
    streamAccent: token('--tlx-canvas-stream-accent'),
    streamPrimaryLight: token('--tlx-canvas-stream-primary-light'),
    streamAccentLight: token('--tlx-canvas-stream-accent-light'),
    streamAccentDark: token('--tlx-canvas-stream-accent-dark'),
    bgNear: token('--tlx-canvas-bg-near'),
    bgMid: token('--tlx-canvas-bg-mid'),
    bgFar: token('--tlx-canvas-bg-far'),
    transparent: token('--tlx-canvas-transparent'),
    primaryGlow: token('--tlx-canvas-primary-glow'),
    primaryGlowSoft: token('--tlx-canvas-primary-glow-soft'),
    accentGlow: token('--tlx-canvas-accent-glow'),
    accentGlowSoft: token('--tlx-canvas-accent-glow-soft'),
    star: token('--tlx-canvas-star'),
    atmosphereInner: token('--tlx-canvas-atmosphere-inner'),
    atmosphereEdge: token('--tlx-canvas-atmosphere-edge'),
    globeRim: token('--tlx-canvas-globe-rim'),
    globeBody: token('--tlx-canvas-globe-body'),
    globeCore: token('--tlx-canvas-globe-core'),
    wireframe: token('--tlx-canvas-wireframe'),
    grid: token('--tlx-canvas-grid'),
  };

  return Object.values(palette).every(Boolean) ? palette : null;
}

function bezierPt(t: number, x0: number, y0: number, cx1: number, cy1: number,
  cx2: number, cy2: number, x1: number, y1: number) {
  const mt = 1 - t;
  const mt2 = mt * mt, t2 = t * t;
  return {
    x: mt2 * mt * x0 + 3 * mt2 * t * cx1 + 3 * mt * t2 * cx2 + t2 * t * x1,
    y: mt2 * mt * y0 + 3 * mt2 * t * cy1 + 3 * mt * t2 * cy2 + t2 * t * y1,
  };
}

function drawStaticLine(
  ctx: CanvasRenderingContext2D,
  line: StreamLine,
  alpha: number
) {
  const { x0, y0, cx1, cy1, cx2, cy2, x1, y1, color1, color2, width } = line;
  const grad = ctx.createLinearGradient(x0, y0, x1, y1);
  grad.addColorStop(0, color1 + '00');
  grad.addColorStop(0.15, color1 + hexAlpha(alpha * 0.25));
  grad.addColorStop(0.5, color2 + hexAlpha(alpha * 0.55));
  grad.addColorStop(0.85, color1 + hexAlpha(alpha * 0.25));
  grad.addColorStop(1, color1 + '00');

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x1, y1);
  ctx.strokeStyle = grad;
  ctx.lineWidth = width * 0.5;
  ctx.globalAlpha = alpha * 0.35;
  ctx.stroke();
  ctx.restore();
}

function drawTravelingGlow(
  ctx: CanvasRenderingContext2D,
  line: StreamLine
) {
  const { x0, y0, cx1, cy1, cx2, cy2, x1, y1,
    color1, color2, width, progress, glowLen, opacity } = line;

  const STEPS = 40;
  const tStart = Math.max(0, progress - glowLen);

  ctx.save();
  for (let i = 0; i < STEPS; i++) {
    const ta = tStart + (progress - tStart) * (i / STEPS);
    const tb = tStart + (progress - tStart) * ((i + 1) / STEPS);
    if (tb > 1 || ta < 0) continue;

    const pa = bezierPt(ta, x0, y0, cx1, cy1, cx2, cy2, x1, y1);
    const pb = bezierPt(tb, x0, y0, cx1, cy1, cx2, cy2, x1, y1);
    const frac = i / STEPS;
    const fadeAlpha = (frac * frac) * opacity;

    const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
    grad.addColorStop(0, color1 + hexAlpha(fadeAlpha * 0.6));
    grad.addColorStop(1, color2 + hexAlpha(fadeAlpha));

    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = width * (0.4 + 0.6 * frac);
    ctx.lineCap = 'round';
    ctx.globalAlpha = 1;
    ctx.stroke();
  }

  if (progress > 0 && progress <= 1) {
    const head = bezierPt(progress, x0, y0, cx1, cy1, cx2, cy2, x1, y1);
    const glowR = width * 4;
    const grd = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, glowR);
    grd.addColorStop(0, color2 + 'ff');
    grd.addColorStop(0.3, color2 + 'aa');
    grd.addColorStop(1, color2 + '00');
    ctx.globalAlpha = opacity;
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(head.x, head.y, glowR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function hexAlpha(a: number): string {
  return Math.round(Math.max(0, Math.min(1, a)) * 255)
    .toString(16).padStart(2, '0');
}

function buildStreams(W: number, H: number, palette: CanvasPalette): StreamLine[] {
  const lines: StreamLine[] = [];
  const palettes = [
    [palette.streamPrimary, palette.streamAccent],
    [palette.streamAccent, palette.streamPrimary],
    [palette.streamPrimaryLight, palette.streamAccent],
    [palette.streamPrimary, palette.streamAccentLight],
    [palette.streamAccent, palette.streamPrimaryLight],
    [palette.streamAccentDark, palette.streamPrimary],
  ];

  const BUNDLE1 = 8;
  for (let i = 0; i < BUNDLE1; i++) {
    const spread = (i - BUNDLE1 / 2) * (H * 0.04);
    const pal = palettes[i % palettes.length];
    const startX = W * 0.2 + spread * 1.5;
    const startY = H;
    const endX = W * 0.85 + spread * 2;
    const endY = H;

    lines.push({
      x0: startX,
      y0: startY,
      cx1: startX - W * 0.1,
      cy1: H * 0.3,
      cx2: endX + W * 0.1,
      cy2: H * 0.2 + spread,
      x1: endX,
      y1: endY,
      color1: pal[0],
      color2: pal[1],
      width: 1.2 + Math.random() * 1.8,
      speed: 0.0018 + Math.random() * 0.0014,
      progress: Math.random(),
      glowLen: 0.18 + Math.random() * 0.14,
      delay: i * 0.09,
      opacity: 0.65 + Math.random() * 0.3,
    });
  }

  const BUNDLE2 = 5;
  for (let i = 0; i < BUNDLE2; i++) {
    const spread = (i - BUNDLE2 / 2) * (H * 0.05);
    const pal = palettes[(i + 2) % palettes.length];
    const startX = W * 0.7 + spread;
    const startY = H;
    const endX = W * 0.3 - spread * 2;
    const endY = H;

    lines.push({
      x0: startX,
      y0: startY,
      cx1: startX + W * 0.15,
      cy1: H * 0.45,
      cx2: endX - W * 0.05,
      cy2: H * 0.4 + spread,
      x1: endX,
      y1: endY,
      color1: pal[0],
      color2: pal[1],
      width: 0.8 + Math.random() * 1.4,
      speed: 0.0012 + Math.random() * 0.001,
      progress: Math.random(),
      glowLen: 0.14 + Math.random() * 0.1,
      delay: i * 0.13,
      opacity: 0.4 + Math.random() * 0.35,
    });
  }

  const BUNDLE3 = 4;
  for (let i = 0; i < BUNDLE3; i++) {
    const spread = (i - BUNDLE3 / 2) * (H * 0.03);
    const pal = palettes[(i + 1) % palettes.length];
    const startX = W * 0.15;
    const startY = H;
    const endX = W * 0.95;
    const endY = H;

    lines.push({
      x0: startX,
      y0: startY,
      cx1: W * 0.25,
      cy1: H * 0.7 + spread,
      cx2: W * 0.75,
      cy2: H * 0.7 + spread,
      x1: endX,
      y1: endY,
      color1: pal[1],
      color2: pal[0],
      width: 0.7 + Math.random() * 1.2,
      speed: 0.0010 + Math.random() * 0.0009,
      progress: Math.random(),
      glowLen: 0.12 + Math.random() * 0.1,
      delay: i * 0.2,
      opacity: 0.35 + Math.random() * 0.3,
    });
  }

  return lines;
}

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const palette = readCanvasPalette();
    if (!palette) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const STARS: Star[] = Array.from({ length: 160 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      op: Math.random() * 0.6 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.018 + 0.005,
    }));

    let streams = buildStreams(W, H, palette);

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(W * 0.4, H * 0.4, 0, W * 0.5, H * 0.5, Math.hypot(W, H) * 0.7);
      bg.addColorStop(0, palette.bgNear);
      bg.addColorStop(0.55, palette.bgMid);
      bg.addColorStop(1, palette.bgFar);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const glow = ctx.createRadialGradient(W * 0.05, H * 0.85, 0, W * 0.05, H * 0.85, W * 0.55);
      glow.addColorStop(0, palette.primaryGlow);
      glow.addColorStop(0.5, palette.primaryGlowSoft);
      glow.addColorStop(1, palette.transparent);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      const glow2 = ctx.createRadialGradient(W * 0.92, H * 0.08, 0, W * 0.92, H * 0.08, W * 0.4);
      glow2.addColorStop(0, palette.accentGlow);
      glow2.addColorStop(0.5, palette.accentGlowSoft);
      glow2.addColorStop(1, palette.transparent);
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, W, H);

      for (const s of STARS) {
        s.phase += s.speed;
        const alpha = s.op * (0.5 + 0.5 * Math.sin(s.phase));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = palette.star;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const globeX = W * 0.5;
      const globeY = H + (W > 768 ? W * 0.4 : W * 0.6);
      const globeR = W > 768 ? W * 0.55 : W * 0.8;

      const atmosGrad = ctx.createRadialGradient(globeX, globeY, globeR * 0.8, globeX, globeY, globeR * 1.05);
      atmosGrad.addColorStop(0, palette.atmosphereInner);
      atmosGrad.addColorStop(0.7, palette.atmosphereEdge);
      atmosGrad.addColorStop(1, palette.transparent);

      ctx.save();
      ctx.beginPath();
      ctx.arc(globeX, globeY, globeR * 1.05, 0, Math.PI * 2);
      ctx.fillStyle = atmosGrad;
      ctx.fill();

      const globeGrad = ctx.createRadialGradient(globeX, globeY - globeR, 0, globeX, globeY, globeR);
      globeGrad.addColorStop(0, palette.globeRim);
      globeGrad.addColorStop(0.4, palette.globeBody);
      globeGrad.addColorStop(1, palette.globeCore);

      ctx.beginPath();
      ctx.arc(globeX, globeY, globeR, 0, Math.PI * 2);
      ctx.fillStyle = globeGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(globeX, globeY, globeR, Math.PI, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = palette.wireframe;
      ctx.stroke();

      for (let i = 0; i < 3; i++) {
        const offset = globeR * 0.2 * (i + 1);
        ctx.beginPath();
        ctx.ellipse(globeX, globeY + offset, globeR * 0.95, globeR * 0.2, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = palette.grid;
        ctx.stroke();
      }
      ctx.restore();

      for (const line of streams) {
        drawStaticLine(ctx, line, line.opacity * 0.4);
        line.progress += line.speed;
        if (line.progress > 1 + line.glowLen) {
          line.progress = -line.glowLen * 0.5;
        }
        drawTravelingGlow(ctx, line);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
      streams = buildStreams(W, H, palette);
      for (const s of STARS) {
        s.x = Math.random() * W;
        s.y = Math.random() * H;
      }
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
