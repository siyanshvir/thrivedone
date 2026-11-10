import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import { isLightColor } from "@/lib/utils";

export function CustomCursor() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [tooltip, setTooltip] = useState<{ text: string; color: string } | null>(null);
  const [isMobileOrSmall, setIsMobileOrSmall] = useState(false);
  const rafRef = useRef<number | null>(null);
  const initializedRef = useRef(false);
  const lastMoveTime = useRef<number>(0);

  // Initialize with center of screen to avoid top-left spawn
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 0);

  const findDataCursorElement = useCallback((target: HTMLElement | null): { text: string; color: string } | null => {
    let element = target;
    let depth = 0;
    const maxDepth = 5; // Limit traversal depth for performance
    while (element && element !== document.body && element !== document.documentElement && depth < maxDepth) {
      const text = element.getAttribute("data-cursor");
      if (text) {
        const color = element.getAttribute("data-cursor-color") || "#0080ff";
        return { text, color };
      }
      element = element.parentElement;
      depth++;
    }
    return null;
  }, []);

  useEffect(() => {
    // Check if device is mobile or small screen (1100px and below)
    const checkDevice = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth <= 1245;
      setIsMobileOrSmall(isMobile || isSmallScreen);
    };

    checkDevice();

    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkDevice, 150);
    };

    window.addEventListener('resize', handleResize);

    // Don't apply custom cursor on mobile or small screens
    if (isMobileOrSmall) {
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
      };
    }

    // Hide default cursor
    const style = document.createElement("style");
    style.id = "custom-cursor-hide";
    style.textContent = "*, *::before, *::after { cursor: none !important; }";
    document.head.appendChild(style);

    // ZERO LAG - Direct updates with no throttling
    const onMouseMove = (e: MouseEvent) => {
      // On first mouse move, initialize position without animation
      if (!initializedRef.current) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
        initializedRef.current = true;
        setIsVisible(true);
        return;
      }

      // Direct instant updates - NO throttling for zero lag
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setIsVisible(true);

      // Throttle tooltip updates only (every 100ms)
      const now = performance.now();
      if (now - lastMoveTime.current < 100) {
        return;
      }
      lastMoveTime.current = now;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const result = findDataCursorElement(e.target as HTMLElement);
        setTooltip(result);
        rafRef.current = null;
      });
    };

    const onMouseLeave = () => {
      setIsVisible(false);
      setTooltip(null);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      initializedRef.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      const el = document.getElementById("custom-cursor-hide");
      if (el) el.remove();
    };
  }, [mouseX, mouseY, findDataCursorElement, isMobileOrSmall]);

  // Handle invalid color values like "None", "null", empty strings, etc.
  const rawColor = tooltip?.color;
  const isValidColor = rawColor &&
    rawColor !== "None" &&
    rawColor !== "null" &&
    rawColor !== "undefined" &&
    rawColor.trim() !== "" &&
    rawColor.startsWith("#");

  const bgColor = isValidColor ? rawColor : "#0080ff";
  const textColor = isLightColor(bgColor) ? "#000000" : "#ffffff";

  // Don't render cursor on mobile or small screens
  if (isMobileOrSmall) {
    return null;
  }

  return (
    <>
      {/* SVG Cursor - NO spring animation for zero lag */}
      <motion.div
        className="fixed pointer-events-none z-[99999]"
        style={{
          left: mouseX,
          top: mouseY,
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)' // Force GPU acceleration
        }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.1 }}
      >
        <svg
          className="w-6 h-6 -translate-x-[2px] -translate-y-[2px]"
          style={{ color: "#ffffff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
          viewBox="0 0 40 40"
        >
          <path
            fill="currentColor"
            d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
          />
        </svg>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {isVisible && tooltip && (
          <motion.div
            key="tooltip"
            className="fixed pointer-events-none z-[99998]"
            style={{
              left: mouseX,
              top: mouseY,
              willChange: 'transform'
            }}
            initial={{ scale: 0, opacity: 0, x: 20, y: 20 }}
            animate={{ scale: 1, opacity: 1, x: 20, y: 20 }}
            exit={{ scale: 0, opacity: 0, x: 20, y: 20 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="tooltip-box"
              style={{
                display: "inline-block",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                background: bgColor,
                color: textColor,
              }}
            >
              {tooltip.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
