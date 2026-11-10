import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export function FestiveBundleVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="bg-black py-16 md:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 items-center gap-12">

          {/* Left: Text */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <p className="text-glacier text-xs tracking-[0.3em] uppercase font-medium mb-4">
              See It In Action
            </p>
            <h2 className="font-display text-4xl md:text-5xl xl:text-6xl font-black text-white leading-tight mb-6">
              Festive<br />
              <span className="text-cyan-400">Bundle</span>
            </h2>
            <p className="text-white/50 text-base md:text-lg max-w-md mx-auto lg:mx-0">
              Everything you need for peak performance — all in one drop. Built for the festive season.
            </p>
          </div>

          {/* Right: Portrait video (TikTok style) */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div
              className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)] group cursor-pointer"
              style={{ width: "min(320px, 85vw)", aspectRatio: "9/16" }}
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                className="w-full h-full object-cover block"
                playsInline
                preload="metadata"
                onEnded={() => setPlaying(false)}
                onPause={() => setPlaying(false)}
                onPlay={() => setPlaying(true)}
              >
                <source
                  src={import.meta.env.VITE_FESTIVE_BUNDLE_VIDEO_URL || "/FestiveBundleVideo.mov"}
                  type="video/quicktime"
                />
                <source
                  src={import.meta.env.VITE_FESTIVE_BUNDLE_VIDEO_URL || "/FestiveBundleVideo.mov"}
                  type="video/mp4"
                />
              </video>

              {/* Centered play overlay when paused */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  playing ? "opacity-0 pointer-events-none" : "opacity-100 bg-black/35"
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:bg-white/25 transition-colors">
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                </div>
              </div>

              {/* Corner play/pause on hover */}
              <button
                type="button"
                aria-label={playing ? "Pause video" : "Play video"}
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="absolute bottom-4 right-4 rounded-full p-2.5 text-white bg-black/40 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
