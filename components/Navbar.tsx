import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-200 ease-out",
        isScrolled ? "py-1" : "py-3 sm:py-4"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 navbar-adaptive">
        <div
          className={cn(
            "relative mx-auto mt-2 navbar-adaptive transition-all duration-200 ease-out",
            isScrolled
              ? "max-w-[min(82vw,1100px)] bg-black/90 backdrop-blur-xl rounded-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-1.5"
              : "max-w-[min(96vw,1500px)] bg-transparent px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-2 md:py-3"
          )}
        >
          <div className="flex items-center justify-start relative">
            {/* Logo only — no nav links */}
            <a href="/" className="flex items-center gap-3 group flex-shrink-0">
              <img
                src="/Thrive.png"
                alt="Thrive"
                className={cn(
                  "w-auto object-contain drop-shadow navbar-adaptive origin-left transition-all duration-300 ease-in-out",
                  "h-12 sm:h-14 md:h-16 lg:h-20 xl:h-24",
                  isScrolled ? "scale-75" : "scale-100"
                )}
              />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
