import { CSSProperties, useMemo } from "react";

interface WaveMarqueeProps {
  speedSeconds?: number;
  amplitudePx?: number;
  tightnessSeconds?: number;
  repeats?: number;
  className?: string;
}

const TEXT_SEQUENCE = [
  "SIMPLE",
  "ELEGANT",
  "BEAUTIFUL",
  "INNOVATIVE",
  "SUSTAINABLE",

];

export function WaveMarquee({
  speedSeconds = 15, // faster default
  amplitudePx = 15,
  tightnessSeconds = -0.0001,
  repeats = 100,
  className = "",
}: WaveMarqueeProps) {
  const styleVars = useMemo(() => ({
    "--scroll-speed": `${speedSeconds}s`,
    "--amplitude": `${amplitudePx}px`,
    "--tightness": `${tightnessSeconds}s`,
  }) as CSSProperties, [speedSeconds, amplitudePx, tightnessSeconds]);

  let charIndex = 0;
  const blocks = [] as JSX.Element[];
  for (let r = 0; r < repeats; r++) {
    TEXT_SEQUENCE.forEach((word) => {
      for (let i = 0; i < word.length; i++) {
        blocks.push(
          <span
            key={`${r}-${word}-${i}-${charIndex}`}
            className="wave-char font-display text-white text-2xl md:text-3xl font-extrabold"
            style={{ ["--i" as any]: charIndex } as CSSProperties}
          >
            {word[i]}
          </span>
        );
        charIndex++;
      }
      blocks.push(
        <span key={`${r}-${word}-space-a-${charIndex}`} className="wave-space" style={{ ["--i" as any]: charIndex } as CSSProperties}>&nbsp;</span>
      );
      charIndex++;
      blocks.push(
        <span
          key={`${r}-${word}-divider-${charIndex}`}
          className="wave-char divider text-glacier text-2xl md:text-3xl font-extrabold"
          style={{ ["--i" as any]: charIndex } as CSSProperties}
        >
          〰
        </span>
      );
      charIndex++;
      blocks.push(
        <span key={`${r}-${word}-space-b-${charIndex}`} className="wave-space" style={{ ["--i" as any]: charIndex } as CSSProperties}>&nbsp;</span>
      );
      charIndex++;
    });
  }

  return (
    <div className={`wave-container ${className}`} style={styleVars}>
      <style>{`
        .wave-container {
          position: relative;
          width: 100vw;
          max-width: 100vw;
          min-width: 100vw;
          overflow: hidden;
          padding: calc(var(--amplitude) + 20px) 0;
          margin: 0;
        }
        .wave-track {
          display: flex;
          width: max-content;
          min-width: 200vw;
          white-space: nowrap;
          will-change: transform;
          animation: wave-scroll-l2r var(--scroll-speed) linear infinite;
        }
        .wave-char {
          display: inline-block;
          animation: wave-float 2s ease-in-out infinite;
          animation-delay: calc(var(--i) * var(--tightness));
        }
        .wave-space {
          display: inline-block;
          width: 0.75rem;
          animation: wave-float 2s ease-in-out infinite;
          animation-delay: calc(var(--i) * var(--tightness));
        }
        @keyframes wave-scroll-l2r {
          0% { transform: translateX(-50vw); }
          100% { transform: translateX(0); }
        }
        @keyframes wave-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(calc(var(--amplitude) * -1)); }
        }
      `}</style>
      <div className="wave-track">
        {blocks}
        {blocks}
      </div>
    </div>
  );
}

export default WaveMarquee;
