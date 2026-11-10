import { useEffect, useRef } from 'react';

type ColorTheme = 'blue' | 'purple' | 'orange' | 'rainbow' | 'red' | 'green' | 'cyan';

interface HeroTubesCursorProps {
  theme: ColorTheme;
}

const themeColors: Record<ColorTheme, { tubes: string[]; lights: string[] }> = {
  blue: {
    tubes: ['#3b82f6', '#60a5fa', '#1e40af'],
    lights: ['#38bdf8', '#0ea5e9', '#2563eb', '#7dd3fc']
  },
  purple: {
    tubes: ['#8b5cf6', '#a78bfa', '#6d28d9'],
    lights: ['#c084fc', '#a855f7', '#7c3aed', '#d8b4fe']
  },
  orange: {
    tubes: ['#f97316', '#fb923c', '#ea580c'],
    lights: ['#fdba74', '#f97316', '#ff88a1', '#fbbf24']
  },
  rainbow: {
    tubes: ['#f967fb', '#53bc28', '#6958d5'],
    lights: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5']
  },
  red: {
    tubes: ['#ef4444', '#f87171', '#b91c1c'],
    lights: ['#fca5a5', '#ef4444', '#fee2e2', '#991b1b']
  },
  green: {
    tubes: ['#22c55e', '#4ade80', '#15803d'],
    lights: ['#86efac', '#22c55e', '#dcfce7', '#166534']
  },
  cyan: {
    tubes: ['#06b6d4', '#22d3ee', '#0e7490'],
    lights: ['#67e8f9', '#06b6d4', '#cffafe', '#155e75']
  }
};

// Dynamic import helper to avoid TS errors with CDN imports
const loadTubesCursor = async () => {
  // @ts-expect-error - CDN dynamic import
  const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
  return module.default;
};

export function HeroTubesCursor({ theme }: HeroTubesCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<{ dispose: () => void } | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on mobile or small screens (revert to default cursor)
    const isMobileOrSmall = window.innerWidth <= 1245;
    if (isMobileOrSmall) return;

    let mounted = true;

    const initTubes = async () => {
      if (!canvasRef.current || !mounted) return;

      try {
        const TubesCursor = await loadTubesCursor();

        if (!mounted || !canvasRef.current) return;

        // Prevent re-initialization if already initialized
        if (appRef.current) return;

        const colors = themeColors[theme];

        appRef.current = TubesCursor(canvasRef.current, {
          tubes: {
            colors: colors.tubes,
            lights: {
              intensity: 120, // Toned down from 200
              colors: colors.lights
            }
          }
        });
      } catch (error) {
        console.error('Failed to load TubesCursor:', error);
      }
    };

    initTubes();

    return () => {
      mounted = false;
      try {
        if (appRef.current?.dispose) {
          appRef.current.dispose();
        }
      } catch (e) {
        console.warn('Error disposing TubesCursor:', e);
      }
      appRef.current = null;
    };
  }, [theme]);

  // Track mouse only within hero section
  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = heroElement.getBoundingClientRect();
      const isInHero = (
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right
      );

      if (canvasRef.current) {
        canvasRef.current.style.pointerEvents = isInHero ? 'auto' : 'none';
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={heroRef} className="absolute inset-0 z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}