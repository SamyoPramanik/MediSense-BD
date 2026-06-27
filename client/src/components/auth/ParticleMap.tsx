'use client';
import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number; opacity: number; connected: boolean;
}

export default function ParticleMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 120;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    // Bangladesh approximate boundary nodes
    const bdNodes = [
      { x: 0.48, y: 0.25 }, { x: 0.52, y: 0.3 }, { x: 0.55, y: 0.35 },
      { x: 0.5, y: 0.4 }, { x: 0.53, y: 0.45 }, { x: 0.48, y: 0.5 },
      { x: 0.45, y: 0.55 }, { x: 0.5, y: 0.6 }, { x: 0.52, y: 0.65 },
      { x: 0.47, y: 0.7 }, { x: 0.5, y: 0.75 },
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const useNode = i < bdNodes.length;
      particles.push({
        x: useNode ? bdNodes[i].x * canvas.width + (Math.random() - 0.5) * 60 : Math.random() * canvas.width,
        y: useNode ? bdNodes[i].y * canvas.height + (Math.random() - 0.5) * 60 : Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        connected: useNode,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(20, 184, 166, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw & update particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = p.connected ? `rgba(20, 184, 166, ${p.opacity})` : `rgba(153, 246, 228, ${p.opacity * 0.5})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.connected) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(20, 184, 166, ${p.opacity * 0.2})`;
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animId = requestAnimationFrame(animate);
    };

    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ background: 'radial-gradient(ellipse at center, #0a2e2e 0%, #031c1c 70%)' }}
    />
  );
}
