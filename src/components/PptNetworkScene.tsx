import { useEffect, useRef } from 'react';

type NetworkNode = { x: number; y: number; vx: number; vy: number };

export function PptNetworkScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let lastDraw = 0;
    let visible = true;
    const pointer = { x: -1000, y: -1000 };
    const edge = 0.08;
    const nodes: NetworkNode[] = Array.from({ length: 30 }, () => ({
      x: edge + Math.random() * (1 - edge * 2),
      y: edge + Math.random() * (1 - edge * 2),
      vx: (Math.random() - 0.5) * 0.00022,
      vy: (Math.random() - 0.5) * 0.00022,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      if (
        event.clientX < bounds.left
        || event.clientX > bounds.right
        || event.clientY < bounds.top
        || event.clientY > bounds.bottom
      ) {
        pointer.x = -1000;
        pointer.y = -1000;
        return;
      }
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * width;
      pointer.y = ((event.clientY - bounds.top) / bounds.height) * height;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    const resizeObserver = new ResizeObserver(resize);

    resize();
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);

    const draw = (now: number) => {
      frame = window.requestAnimationFrame(draw);
      if (!visible || document.hidden || now - lastDraw < 32) return;
      lastDraw = now;
      context.clearRect(0, 0, width, height);

      const points = nodes.map((node) => {
        node.x += node.vx * 16;
        node.y += node.vy * 16;
        if (node.x < edge || node.x > 1 - edge) node.vx *= -1;
        if (node.y < edge || node.y > 1 - edge) node.vy *= -1;
        node.x = Math.max(edge, Math.min(1 - edge, node.x));
        node.y = Math.max(edge, Math.min(1 - edge, node.y));
        return { x: node.x * width, y: node.y * height };
      });

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const distance = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
          if (distance > 150) continue;
          context.strokeStyle = `rgba(34, 116, 112, ${(1 - distance / 150) * 0.42})`;
          context.lineWidth = 0.8;
          context.beginPath();
          context.moveTo(points[i].x, points[i].y);
          context.lineTo(points[j].x, points[j].y);
          context.stroke();
        }

        const cursorDistance = Math.hypot(points[i].x - pointer.x, points[i].y - pointer.y);
        if (cursorDistance < 145) {
          context.strokeStyle = `rgba(176, 128, 44, ${(1 - cursorDistance / 145) * 0.6})`;
          context.beginPath();
          context.moveTo(points[i].x, points[i].y);
          context.lineTo(pointer.x, pointer.y);
          context.stroke();
        }

        context.fillStyle = 'rgba(224, 195, 126, 0.86)';
        context.beginPath();
        context.arc(points[i].x, points[i].y, 1.35, 0, Math.PI * 2);
        context.fill();
      }
    };

    frame = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return <canvas className="ppt-network-scene" ref={canvasRef} aria-hidden="true" />;
}
