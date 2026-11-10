import { useEffect, useMemo, useRef, useState } from "react";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

export default function CheckoutLoading() {
  const { cart } = useCart();
  const [status, setStatus] = useState<"preparing" | "adding" | "redirecting" | "manual">("preparing");
  const navigate = useNavigate();
  const attemptedRef = useRef(false);

  const companyCode = useMemo(() => cart[0]?.link.match(/buybuttons\/([a-z0-9]+)\//i)?.[1] || "", [cart]);
  const finalCartUrl = useMemo(
    () => (companyCode ? `https://portal.veinternational.org/buybuttons/${companyCode}/cart/` : ""),
    [companyCode]
  );

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    // If there is no cart or company code, send back to cart
    if (!cart.length || !companyCode) {
      navigate("/cart", { replace: true });
      return;
    }

    // Try to open popups for each item
    const popups: (Window | null)[] = [];

    const openAll = () => {
      setStatus("adding");
      
      // Calculate adaptive popup dimensions based on screen size
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      
      // For small popups (background processing), use minimal size but ensure visibility
      let width = 1;
      let height = 1;
      let left = -10000;
      let top = -10000;
      
      // On very small screens, make popups slightly larger to ensure they work
      if (screenWidth < 768) {
        width = 100;
        height = 100;
        left = screenWidth - width - 10;
        top = screenHeight - height - 10;
      }
      
      for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const url = `${item.link}?nocache=${Date.now() + i}`;
        const popup = window.open(
          url,
          `vei_add_${i}`,
          `width=${width},height=${height},left=${left},top=${top},scrollbars=no,resizable=no,menubar=no,toolbar=no,location=no,status=no`
        );
        popups.push(popup);
      }

      // If any popup is null (blocked), go manual immediately
      if (popups.some((p) => !p || p.closed)) {
        setStatus("manual");
        navigate("/checkout-manual", { replace: true });
        return;
      }

      // After a short delay, close popups and redirect to cart
      setTimeout(() => {
        try {
          popups.forEach((p) => {
            if (p && !p.closed) p.close();
          });
        } catch {}
        setStatus("redirecting");

        // Open final cart in a new tab
        if (finalCartUrl) {
          window.open(finalCartUrl, "_blank");
        }
        // Stay on loading screen briefly so users see state, then go back to cart
        setTimeout(() => {
          navigate("/cart", { replace: true });
        }, 800);
      }, 1400);
    };

    // Kick off immediately
    openAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, companyCode]);

  return (
    <div className="min-h-screen bg-background">
      <section className="pt-48 pb-20 relative">
        <div className="absolute inset-0 matrix-dots opacity-20" aria-hidden="true" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-3">Checking out…</h1>
          <p className="text-muted-foreground mb-8">
            {status === "preparing" && "Preparing your items"}
            {status === "adding" && "Adding items to your VE cart"}
            {status === "redirecting" && "Redirecting to your VE cart"}
            {status === "manual" && "Pop-ups were blocked. Switching to manual checkout…"}
          </p>
          <div className="mx-auto h-1.5 w-full max-w-xl overflow-hidden rounded bg-muted">
            <div className="h-full w-1/3 animate-[gradient-x_1.4s_ease_infinite] bg-gradient-to-r from-ocean via-glacier to-ocean" />
          </div>
          <div className="mt-10 text-sm text-muted-foreground">
            If you blocked pop-ups, we will send you to manual checkout.
          </div>
        </div>
      </section>
      {/* Footer removed from checkout loading page */}
    </div>
  );
}
