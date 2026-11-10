import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setPlaying(true))
        .catch(() => {
          setPlaying(false);
          const playOnInteraction = () => {
            v.play().then(() => setPlaying(true)).catch(() => {});
          };
          document.addEventListener('click', playOnInteraction, { once: true });
          document.addEventListener('touchstart', playOnInteraction, { once: true });
        });
    }
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden pt-12 md:pt-24">
      {/* Matrix Dots Background */}
      <div className="absolute inset-0 z-0">
        <div className="matrix-dots"></div>
      </div>

      {/* Video Background */}
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <video
            ref={videoRef}
            className="absolute top-1/2 left-1/2 w-full h-full min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source
              src={import.meta.env.VITE_HERO_VIDEO_URL || "/HeroVideo.mp4"}
              type="video/mp4"
            />
          </video>
        </div>
        {/* Darker overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Ending Banner — centered over video, full width, contained */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <img
          src="/logistic-header.png"
          alt="Say GOODBYE to THRIVE"
          className="w-full object-contain"
        />
      </div>

      {/* Play/Pause control - Hidden on mobile */}
      <button
        type="button"
        aria-label="Play or pause background video"
        onClick={togglePlay}
        className="hidden md:block absolute bottom-4 right-4 z-30 glass-light rounded-full p-3 text-white hover:bg-white/20 transition"
      >
        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
    </section>
  );
}
