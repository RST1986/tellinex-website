import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────
   Flowing fiber-optic / data-stream background
   Canvas draws:
   • Animated bezier "signal streams" (traveling glow dots)
   • Stars + subtle twinkling
   • Deep-space radial gradient base
───────────────────────────────────────────── */

interface StreamLine {
  // Control points for a cubic bezier
  x0: number; y0: number; // start
  cx1: number; cy1: number; // ctrl 1
  cx2: number; cy2: number; // ctrl 2
  x1: number; y1: number; // end
  color1: string;
  color2: string;
  width: number;     // stroke width
  speed: number;     // how fast the glow dot travels
  progress: number;  // 0 → 1 along the curve
  glowLen: number;   // tail length (0..1)
  delay: number;     // initial offset
  opacity: number;
}

interface Star {
  x: number; y: number; r: number;
  op: number; phase: number; speed: number;
}

// Evaluate cubic bezier at t → {x, y}
function bezierPt(t: number, x0: number, y0: number, cx1: number, cy1: number,
  cx2: number, cy2: number, x1: number, y1: number) {
  const mt = 1 - t;
  const mt2 = mt * mt, t2 = t * t;
  return {
    x: mt2 * mt * x0 + 3 * mt2 * t * cx1 + 3 * mt * t2 * cx2 + t2 * t * x1,
    y: mt2 * mt * y0 + 3 * mt2 * t * cy1 + 3 * mt * t2 * cy2 + t2 * t * y1,
  };
}

// Draw one static bezier line with a gradient stroke
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

// Draw the traveling glow dot + tail along a bezier
function drawTravelingGlow(
  ctx: CanvasRenderingContext2D,
  line: StreamLine
) {
  const { x0, y0, cx1, cy1, cx2, cy2, x1, y1,
    color1, color2, width, progress, glowLen, opacity } = line;

  // Tail: draw segments from (progress-glowLen) → progress
  const STEPS = 40;
  const tStart = Math.max(0, progress - glowLen);

  ctx.save();
  for (let i = 0; i < STEPS; i++) {
    const ta = tStart + (progress - tStart) * (i / STEPS);
    const tb = tStart + (progress - tStart) * ((i + 1) / STEPS);
    if (tb > 1 || ta < 0) continue;

    const pa = bezierPt(ta, x0, y0, cx1, cy1, cx2, cy2, x1, y1);
    const pb = bezierPt(tb, x0, y0, cx1, cy1, cx2, cy2, x1, y1);

    // Blend color1→color2 along the tail
    const frac = i / STEPS;
    const fadeAlpha = (frac * frac) * opacity; // bright at head, fade at tail

    // Interpolate hue between color1 and color2
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

  // Head bright dot glow
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

// Build a set of stream lines for a given canvas size
function buildStreams(W: number, H: number): StreamLine[] {
  const lines: StreamLine[] = [];

  // Brand palette: teal (#00C7B1) + lime (#A3E635) only
  const palettes = [
    ['#00c7b1', '#a3e635'],  // teal → lime
    ['#a3e635', '#00c7b1'],  // lime → teal
    ['#00e8cf', '#a3e635'],  // light teal → lime
    ['#00c7b1', '#c8f564'],  // teal → light lime
    ['#a3e635', '#00e8cf'],  // lime → light teal
    ['#7ed320', '#00c7b1'],  // dark lime → teal
  ];

  // ── Bundle 1: Connecting Globe to Globe (Left to Right High Arc)
  const BUNDLE1 = 8;
  for (let i = 0; i < BUNDLE1; i++) {
    const spread = (i - BUNDLE1 / 2) * (H * 0.04);
    const pal = palettes[i % palettes.length];
    
    // Start from left side of globe
    const startX = W * 0.2 + spread * 1.5;
    const startY = H; 
    
    // Land on right side of globe
    const endX = W * 0.85 + spread * 2;
    const endY = H;

    lines.push({
      x0: startX,
      y0: startY, 
      cx1: startX - W * 0.1,  // arc up and left
      cy1: H * 0.3,
      cx2: endX + W * 0.1,    // curve back down
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

  // ── Bundle 2: Connecting Globe to Globe (Right to Left Mid Arc)
  const BUNDLE2 = 5;
  for (let i = 0; i < BUNDLE2; i++) {
    const spread = (i - BUNDLE2 / 2) * (H * 0.05);
    const pal = palettes[(i + 2) % palettes.length];
    
    // Start from right side of globe
    const startX = W * 0.7 + spread;
    const startY = H;
    
    // Land on mid-left
    const endX = W * 0.3 - spread * 2;
    const endY = H;

    lines.push({
      x0: startX,
      y0: startY,
      cx1: startX + W * 0.15, // push right
      cy1: H * 0.45,
      cx2: endX - W * 0.05,   // curl in
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

  // ── Bundle 3: Globe equator wrapping tightly
  const BUNDLE3 = 4;
  for (let i = 0; i < BUNDLE3; i++) {
    const spread = (i - BUNDLE3 / 2) * (H * 0.03);
    const pal = palettes[(i + 1) % palettes.length];
    
    // Start bottom left curve
    const startX = W * 0.15;
    const startY = H;
    
    // End bottom right curve
    const endX = W * 0.95;
    const endY = H;

    lines.push({
      x0: startX,
      y0: startY,
      cx1: W * 0.25,
      cy1: H * 0.7 + spread, // low arc
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

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    // Stars
    const STARS: Star[] = Array.from({ length: 160 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      op: Math.random() * 0.6 + 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.018 + 0.005,
    }));

    let streams = buildStreams(W, H);

    function draw() {
      if (!ctx) return;
      // ── Background gradient
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(W * 0.4, H * 0.4, 0, W * 0.5, H * 0.5, Math.hypot(W, H) * 0.7);
      bg.addColorStop(0, '#0d1f35');
      bg.addColorStop(0.55, '#070f1c');
      bg.addColorStop(1, '#030710');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Brand glow — teal pool bottom-left
      const glow = ctx.createRadialGradient(W * 0.05, H * 0.85, 0, W * 0.05, H * 0.85, W * 0.55);
      glow.addColorStop(0, 'rgba(0,199,177,0.12)');
      glow.addColorStop(0.5, 'rgba(0,199,177,0.05)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Brand glow — lime pool top-right
      const glow2 = ctx.createRadialGradient(W * 0.92, H * 0.08, 0, W * 0.92, H * 0.08, W * 0.4);
      glow2.addColorStop(0, 'rgba(163,230,53,0.09)');
      glow2.addColorStop(0.5, 'rgba(163,230,53,0.03)');
      glow2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, W, H);

      // ── Stars
      for (const s of STARS) {
        s.phase += s.speed;
        const alpha = s.op * (0.5 + 0.5 * Math.sin(s.phase));
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#cfe8ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Globe (Bottom Center)
      const globeX = W * 0.5;
      const globeY = H + (W > 768 ? W * 0.4 : W * 0.6); // Center of globe is off-screen below
      const globeR = W > 768 ? W * 0.55 : W * 0.8;      // Radius to make top peek up

      // Inner globe atmosphere glow
      const atmosGrad = ctx.createRadialGradient(globeX, globeY, globeR * 0.8, globeX, globeY, globeR * 1.05);
      atmosGrad.addColorStop(0, 'rgba(0,199,177,0.15)');
      atmosGrad.addColorStop(0.7, 'rgba(0,199,177,0.4)');
      atmosGrad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.save();
      ctx.beginPath();
      ctx.arc(globeX, globeY, globeR * 1.05, 0, Math.PI * 2);
      ctx.fillStyle = atmosGrad;
      ctx.fill();
      
      // Solid globe body (Very dark space blue, blends mostly with background)
      const globeGrad = ctx.createRadialGradient(globeX, globeY - globeR, 0, globeX, globeY, globeR);
      globeGrad.addColorStop(0, '#041021'); // Top rim edge
      globeGrad.addColorStop(0.4, '#030710');  // Body
      globeGrad.addColorStop(1, '#000000');
      
      ctx.beginPath();
      ctx.arc(globeX, globeY, globeR, 0, Math.PI * 2);
      ctx.fillStyle = globeGrad;
      ctx.fill();

      // Globe wireframe outline/grid hint at top edge
      ctx.beginPath();
      ctx.arc(globeX, globeY, globeR, Math.PI, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0,199,177,0.3)';
      ctx.stroke();

      // Horizontal equators curving down the globe
      for(let i=0; i<3; i++) {
        const offset = globeR * 0.2 * (i+1);
        ctx.beginPath();
        ctx.ellipse(globeX, globeY + offset, globeR * 0.95, globeR * 0.2, 0, Math.PI, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,199,177,0.06)';
        ctx.stroke();
      }
      ctx.restore();

      // ── Fiber-optic stream lines
      for (const line of streams) {
        // Draw the faint static base trail
        drawStaticLine(ctx, line, line.opacity * 0.4);

        // Advance and draw the traveling glow
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
      streams = buildStreams(W, H);
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

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
