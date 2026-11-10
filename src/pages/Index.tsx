import { Hero } from "@/components/Hero";
import { usePageTitle } from "@/hooks/usePageTitle";

const Index = () => {
  usePageTitle("Wellness That Works");

  return (
    <div className="min-h-screen bg-black font-sans">
      <Hero />

      {/* ── Section Divider ── */}
      <div className="w-full relative h-px overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent blur-sm" />
      </div>

      {/* Thank You Note */}
      <section className="bg-black py-20 md:py-28 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#31C2F4] text-xs uppercase tracking-[0.3em] font-medium mb-6">A message from us</p>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
            Thank You
          </h2>
          <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-6">
            As we wrap up this chapter of Thrive, we want to thank you for being part of our journey and for believing in our mission of Wellness That Works.
          </p>
          <p className="text-white/60 text-base md:text-lg leading-relaxed mb-6">
            Your support, energy, and engagement made this experience truly unforgettable. From day one, you helped bring Thrive to life and made everything we created more meaningful.
          </p>
          <p className="text-white/70 text-base md:text-lg leading-relaxed">
            We are so grateful to have shared this with you. Thank you for being part of Thrive this year. 🌊
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-white/20" />
            <span className="text-white/30 text-sm font-medium tracking-widest uppercase">THRIVE Wellness</span>
            <div className="h-px w-12 bg-white/20" />
          </div>
        </div>
      </section>

    </div>
  );
};

export default Index;
