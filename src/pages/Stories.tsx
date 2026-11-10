import { Footer } from "@/components/Footer";
import { ChevronDown } from "lucide-react";

export default function Stories() {
    return (
        <div className="min-h-screen bg-background">
            
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Image Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background"></div>
                    <div className="absolute inset-0 matrix-dots opacity-10" aria-hidden="true"></div>
                </div>
                
                {/* Darker overlay for text readability */}
                <div className="absolute inset-0 bg-black/40 z-10"></div>

                {/* Content */}
                <div className="container mx-auto px-4 lg:px-8 text-center relative z-20">
                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
                        Our <span className="text-gradient">Stories</span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                        Real stories from real people who have transformed their lives with Thrive.
                    </p>
                </div>
            </section>

            {/* Scroll Indicator */}
            <button
                type="button"
                aria-label="Scroll down"
                onClick={() => window.scrollTo({ behavior: 'smooth', top: window.innerHeight })}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce z-20 hover:opacity-90 focus:outline-none"
            >
                <ChevronDown className="w-8 h-8 text-white/80" />
            </button>

            {/* Content Section */}
            <section className="py-24 relative">
                <div className="container mx-auto px-4 lg:px-8">
                    {/* Add more content as needed */}
                </div>
            </section>
            
            <Footer />
        </div>
    );
}
