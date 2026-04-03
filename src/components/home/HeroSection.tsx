import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Rocket, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

const HeroSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; pulse: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    canvas.parentElement?.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement?.addEventListener('mouseleave', handleMouseLeave);

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 25 : 80;
    const maxSpeed = isMobile ? 0.5 : 1.5;
    const baseSpeed = isMobile ? 0.2 : 0.8;
    const connectionDist = isMobile ? 100 : 150;
    const mouseDist = isMobile ? 0 : 200;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * maxSpeed + baseSpeed;
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * (isMobile ? 0.4 : 0.6) + 0.15,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const mouse = mouseRef.current;

      particles.forEach((p, i) => {
        const dxm = mouse.x - p.x;
        const dym = mouse.y - p.y;
        const distMouse = Math.sqrt(dxm * dxm + dym * dym);
        if (mouseDist > 0 && distMouse < mouseDist) {
          const force = (mouseDist - distMouse) / mouseDist * 0.015;
          p.vx += dxm * force;
          p.vy += dym * force;
        }
        p.vx *= 0.995;
        p.vy *= 0.995;
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const minSpeed = isMobile ? 0.2 : 0.6;
        if (currentSpeed < minSpeed) {
          const boost = minSpeed / (currentSpeed || 0.01);
          p.vx *= boost;
          p.vy *= boost;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        if (p.x < 0) p.x = canvas.offsetWidth;
        if (p.x > canvas.offsetWidth) p.x = 0;
        if (p.y < 0) p.y = canvas.offsetHeight;
        if (p.y > canvas.offsetHeight) p.y = 0;

        const glow = Math.sin(p.pulse) * 0.3 + 0.7;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        gradient.addColorStop(0, `hsla(43, 96%, 56%, ${p.opacity * glow * 0.4})`);
        gradient.addColorStop(1, `hsla(43, 96%, 56%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(43, 96%, 56%, ${p.opacity * glow})`;
        ctx.fill();

        if (distMouse < 200) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `hsla(43, 96%, 56%, ${0.2 * (1 - distMouse / 200)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        particles.forEach((p2, j) => {
          if (j <= i) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `hsla(43, 96%, 56%, ${0.18 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ pointerEvents: 'none' }}
      />

      {/* Bottom gradient fade for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background z-[5] pointer-events-none" />

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary/15 rounded-full filter blur-[100px] animate-float" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-primary/10 rounded-full filter blur-[80px] animate-float" style={{ animationDelay: '1s', animationDuration: '5s' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full filter blur-[100px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-24 md:pt-32 md:pb-32 relative z-10">
        <div className="flex flex-col items-center">
          {/* Accepting badge */}
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8 backdrop-blur-sm animate-fadeIn">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Now accepting new projects</span>
          </div>

          <div className="w-full max-w-3xl text-center mb-8 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Websites That Turn Visitors Into{' '}
              <span className="gradient-text relative">
                Customers
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full" />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 mx-auto max-w-2xl">
              Professional websites designed to achieve your goals. Custom-built, fast, and optimized for results.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button asChild className="px-8 py-6 text-lg shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.6)] transition-shadow duration-300">
                <Link to="/project-intake">Get Started</Link>
              </Button>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg backdrop-blur-sm">
                <a href="#portfolio">View Portfolio</a>
              </Button>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-12 grid grid-cols-3 gap-8 md:gap-16 text-center animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            {[
              { value: '15+', label: 'Projects Delivered' },
              { value: '100%', label: 'Client Satisfaction' },
              { value: '2-4wk', label: 'Avg. Delivery' },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <div className="text-3xl md:text-4xl font-bold text-primary transition-transform duration-200 group-hover:scale-110">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Benefit chips */}
          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl animate-fadeIn" style={{ animationDelay: '0.45s' }}>
            {[
              { icon: Rocket, text: 'Lightning-fast performance' },
              { icon: Search, text: 'SEO-ready foundation' },
              { icon: ShieldCheck, text: 'Reliable and secure' },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center justify-center gap-2 rounded-full border border-border bg-card/50 backdrop-blur-sm px-4 py-2 text-sm text-muted-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors duration-300"
              >
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
