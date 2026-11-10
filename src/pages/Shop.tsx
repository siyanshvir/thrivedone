import { usePageTitle } from "@/hooks/usePageTitle";

interface ShopProps {
  category?: string;
}

export default function Shop(_props: ShopProps = {}) {
  usePageTitle("Shop");

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-4 font-medium">THRIVE Wellness</p>
        <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-4">Shop Closed</h1>
        <p className="text-white/60 text-lg max-w-md mx-auto">
          Our store is no longer accepting orders. Thank you for your support.
        </p>
      </div>
    </div>
  );
}
