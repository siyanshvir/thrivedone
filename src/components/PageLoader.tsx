import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    // Reduced timeout for faster transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-none">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    </div>
  );
}
