import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Check, ExternalLink, Loader2, X, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CheckoutProcessing() {
    const { cart, clearCart } = useCart();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"processing" | "complete" | "error" | "manual">("processing");
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [progress, setProgress] = useState({ processed: 0, total: 0 });
    const [finalCartUrl, setFinalCartUrl] = useState<string | null>(null);
    const [clickedItems, setClickedItems] = useState<Set<string>>(new Set());
    const hasStarted = useRef(false);
    const [networkBannerVisible, setNetworkBannerVisible] = useState(false);
    const lastProgressRef = useRef(progress.processed);
    const lastProgressTimeRef = useRef(Date.now());

    // Cart server URL
    const CART_SERVER_URL = import.meta.env.VITE_CART_SERVER_URL || "http://localhost:3001";

    // Extract company code for manual flow
    const companyCode = cart[0]?.link.match(/buybuttons\/([a-z0-9]+)\//i)?.[1] || "";
    const manualFinalCartUrl = companyCode ? `https://portal.veinternational.org/buybuttons/${companyCode}/cart/` : "";

    const startPopupCheckout = async () => {
        try {
            const items = cart.flatMap(item =>
                Array((item.quantity || 1)).fill({ name: item.name, url: item.link })
            );

            if (items.length === 0) {
                navigate("/cart");
                return;
            }

            setProgress({ processed: 0, total: items.length });

            // Calculate adaptive popup dimensions based on screen size
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;

            // Base dimensions
            const baseWidth = 703;
            const baseHeight = 760;

            // Scale factors for different screen sizes
            let widthScale = 1;

            // Adjust for smaller screens
            if (screenWidth < 1366) {
                widthScale = 0.85;
            }
            if (screenWidth < 1024) {
                widthScale = 0.75;
            }
            if (screenWidth < 768) {
                widthScale = 0.9;
            }

            // Calculate final dimensions - height fits entire screen, width is adaptive
            const width = Math.floor(baseWidth * widthScale);
            const height = screenHeight; // Full screen height

            // Position popup on right side of screen
            const left = Math.floor(screenWidth - width - 20); // 20px margin from right edge
            const top = 0; // Start from top of screen

            const features = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=yes,status=no`;

            const firstUrl = `${items[0].url}?nocache=${Date.now()}`;
            const popup = window.open(firstUrl, "vei_checkout_window", features);

            if (!popup || popup.closed) {
                setStatus("manual");
                return;
            }

            for (let i = 0; i < items.length; i++) {
                if (i > 0) {
                    try {
                        popup.location.href = `${items[i].url}?nocache=${Date.now() + i}`;
                    } catch { }
                }
                await new Promise(r => setTimeout(r, 700));
                if (popup.closed) {
                    setStatus("manual");
                    return;
                }
                setProgress({ processed: i + 1, total: items.length });
            }

            if (manualFinalCartUrl) {
                try {
                    popup.location.href = manualFinalCartUrl;
                } catch {
                    window.open(manualFinalCartUrl, "_blank");
                }
                setFinalCartUrl(manualFinalCartUrl);
            }

            setStatus("complete");
            clearCart();
        } catch (error) {
            setStatus("error");
        }
    };

    const startCheckout = async () => {
        try {
            // Flatten cart items based on quantity
            const items = cart.flatMap(item =>
                Array((item.quantity || 1)).fill({ name: item.name, url: item.link })
            );

            if (items.length === 0) {
                navigate("/cart");
                return;
            }

            setProgress({ processed: 0, total: items.length });

            const response = await fetch(`${CART_SERVER_URL}/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items }),
            });

            if (!response.ok) throw new Error("Failed to start checkout");

            const data = await response.json();
            setSessionId(data.sessionId);
            pollStatus(data.sessionId);
        } catch (error) {
            console.error("Checkout error:", error);
            setStatus("error");
        }
    };

    useEffect(() => {
        // Prevent double execution
        if (hasStarted.current) return;
        hasStarted.current = true;

        if (cart.length === 0 && !sessionId) {
            navigate("/cart");
            return;
        }

        if (cart.length > 0 && !sessionId) {
            // Always use automated popup checkout
            startPopupCheckout();
        }
    }, [cart, navigate, sessionId, CART_SERVER_URL]);

    useEffect(() => {
        if (status !== "processing") {
            setNetworkBannerVisible(false);
            return; // Hide immediately on finish or error
        }
        if (progress.processed !== lastProgressRef.current) {
            lastProgressRef.current = progress.processed;
            lastProgressTimeRef.current = Date.now();
            setNetworkBannerVisible(false);
            return; // Hide on any processed increase
        }
        const stallTimeout = setTimeout(() => {
            if (
                status === "processing" &&
                progress.processed === lastProgressRef.current &&
                Date.now() - lastProgressTimeRef.current >= 6000
            ) {
                setNetworkBannerVisible(true);
            }
        }, 6000);
        return () => clearTimeout(stallTimeout);
    }, [progress.processed, status]);

    const pollStatus = async (sid: string) => {
        const checkStatus = async () => {
            try {
                const response = await fetch(`${CART_SERVER_URL}/checkout/status/${sid}`);
                if (response.ok) {
                    const data = await response.json();
                    setProgress({ processed: data.processedItems, total: data.totalItems });

                    if (data.status === "complete") {
                        setStatus("complete");
                        setFinalCartUrl(data.finalCartUrl);
                        clearCart();
                        return true; // Stop polling
                    } else if (data.status === "error") {
                        setStatus("error");
                        return true; // Stop polling
                    }
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
            return false;
        };

        const interval = setInterval(async () => {
            const done = await checkStatus();
            if (done) {
                clearInterval(interval);
            }
        }, 1000);

        // Initial check
        checkStatus();
    };

    const openManualItem = (url: string, itemKey: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
        setClickedItems(prev => new Set(prev).add(itemKey));
    };

    const isLeftPosition = status === "processing" || status === "complete";

    return (
        <div className="fixed inset-0 z-[50] bg-black overflow-auto flex items-center justify-center md:justify-start" style={{ paddingLeft: '0', paddingRight: '0' }}>
            {/* Close Button */}
            <button
                onClick={() => navigate("/cart")}
                className="absolute top-6 right-6 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="max-w-md w-full p-6 sm:p-8 mx-4 sm:mx-16 my-10 bg-card shadow-xl border border-border rounded-2xl flex flex-col items-center">
                <div className="flex flex-col items-center justify-center text-center w-full">
                    {status === "processing" && (
                        <>
                            {/* Animated Spinner */}
                            <div className="relative mb-8">
                                <div className="relative">
                                    <div className="h-28 w-28 animate-spin rounded-full border-4 border-glacier/20 border-t-glacier"></div>
                                    <div className="absolute inset-0 m-auto h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-glacier/20 blur-xl animate-pulse"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ShoppingCart className="w-12 h-12 text-glacier" />
                                    </div>
                                </div>
                            </div>

                            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-glacier bg-clip-text text-transparent">
                                Building Your Cart
                            </h1>

                            <p className="text-muted-foreground text-lg mb-6">
                                Adding items to the official VEI cart...
                            </p>

                            {/* Progress indicator */}
                            <div className="flex items-center justify-start gap-2 text-sm text-muted-foreground mb-6">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>
                                    Processing item {progress.processed} of {progress.total}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-muted rounded-full h-3 overflow-hidden mb-8">
                                <div
                                    className="h-full bg-gradient-to-r from-glacier to-primary transition-all duration-500"
                                    style={{ width: `${progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}%` }}
                                ></div>
                            </div>

                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">A browser window has opened.</span><br />
                                    Please keep it open while we add your items.
                                </p>
                            </div>
                        </>
                    )}

                    {status === "complete" && (
                        <div className="flex flex-col items-center justify-center w-full">
                            <div className="relative mb-8 flex items-center justify-center">
                                <div className="h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500 to-glacier flex items-center justify-center animate-in zoom-in duration-300">
                                    <Check className="w-14 h-14 text-white" />
                                </div>
                            </div>
                            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-emerald-500">
                                Your Cart is Ready!
                            </h1>
                            <p className="text-white text-xl font-bold mb-2">
                                Thank you for shopping with Thrive
                            </p>
                            <p className="text-muted-foreground text-lg mb-8 w-full">
                                All items have been added. Complete your purchase in the opened window.
                            </p>
                            <div className="space-y-4 w-full flex flex-col items-center">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/shop")}
                                    className="w-full rounded-full"
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === "error" && (
                        <>
                            <div className="h-28 w-28 mb-8 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                                <X className="w-12 h-12 text-red-500" />
                            </div>

                            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-red-500">
                                Something Went Wrong
                            </h1>

                            <p className="text-muted-foreground text-lg mb-6">
                                Something went wrong with your cart. Please use manual checkout to complete your purchase.
                            </p>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8">
                                <p className="text-sm text-amber-600 dark:text-amber-400">
                                    <strong>Tip:</strong> Ensure the automation helper app is running and pop-ups are allowed.
                                </p>
                            </div>

                            <div className="grid gap-3 w-full">
                                <Button
                                    onClick={() => setStatus("manual")}
                                    variant="hero"
                                    className="w-full rounded-full"
                                >
                                    Use Manual Checkout
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate("/cart")}
                                        className="rounded-full flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            hasStarted.current = false;
                                            setStatus("processing");
                                            startCheckout();
                                        }}
                                        className="rounded-full flex-1"
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {status === "manual" && (
                        <div className="w-full h-[80vh] flex flex-col items-center justify-center">
                            <div className="flex-shrink-0 w-full max-w-xl mx-auto">
                                <h1 className="font-display text-3xl font-bold mb-2 text-center">Manual Checkout</h1>
                                <p className="text-muted-foreground mb-6 text-center">
                                    <span className="hidden md:inline">Follow these steps to complete your purchase:</span>
                                    <span className="md:hidden">Click each product to add to your VEI cart, then complete your purchase:</span>
                                </p>
                            </div>
                            <div className="flex-grow overflow-y-auto pr-2 space-y-4 w-full max-w-xl mx-auto">
                                <div className="step">
                                    <p className="font-semibold mb-2 flex items-center">
                                        <span className="bg-primary/10 text-primary w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">1</span>
                                        Click each product once and come back to this page to add your other products:
                                    </p>
                                    <div className="space-y-3 pl-8">
                                        {cart.flatMap((item, i) => {
                                            const quantity = Math.max(1, item.quantity || 1);
                                            return Array.from({ length: quantity }, (_, k) => {
                                                const itemKey = `${item.link}-${i}-${k}`;
                                                const isClicked = clickedItems.has(itemKey);
                                                return (
                                                    <div key={itemKey} className={cn(
                                                        "bg-card border rounded-lg p-3 flex items-center justify-between transition-all",
                                                        isClicked ? "border-green-500 bg-green-500/10" : "border-border"
                                                    )}>
                                                        <div className="flex-1 min-w-0 mr-3 flex items-center gap-2">
                                                            {isClicked && (
                                                                <Check className="w-5 h-5 text-green-500 shrink-0" />
                                                            )}
                                                            <div>
                                                                <p className="font-medium truncate">{item.name}</p>
                                                                <p className="text-xs text-muted-foreground">Click to add</p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant={isClicked ? "default" : "outline"}
                                                            className={cn(
                                                                "shrink-0",
                                                                isClicked && "bg-green-500 hover:bg-green-600"
                                                            )}
                                                            onClick={() => {
                                                                openManualItem(`${item.link}?nocache=${Date.now() + i * 100 + k}`, itemKey);
                                                            }}
                                                        >
                                                            {isClicked ? "Added" : "Add"}
                                                        </Button>
                                                    </div>
                                                );
                                            });
                                        })}
                                    </div>
                                </div>

                                <div className="step pt-2">
                                    <p className="font-semibold mb-2 flex items-center">
                                        <span className="bg-primary/10 text-primary w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">2</span>
                                        Complete purchase:
                                    </p>
                                    <div className="pl-8">
                                        {manualFinalCartUrl && (
                                            <Button
                                                className="w-full rounded-full"
                                                onClick={() => window.open(manualFinalCartUrl, "_blank")}
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Open VEI Cart
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-shrink-0 pt-6">
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate("/cart")}
                                    className="w-full text-muted-foreground hover:text-foreground"
                                >
                                    Cancel and go back
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Network Access Banner - right corner */}
            {networkBannerVisible && status === "processing" && (
                <div className="fixed top-8 right-8 z-[100] animate-fade-in-up">
                    <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg border-2 border-red-700 flex items-center gap-3 text-base font-bold">
                        <AlertTriangle className="w-6 h-6 mr-2 text-white shrink-0" />
                        Allow local network activity if prompted — this lets us send your order to VE. Click <span className="underline font-extrabold ml-1">Allow</span> on any browser pop-up!
                    </div>
                </div>
            )}
        </div>
    );
}
