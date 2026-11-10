import { useState, useEffect } from "react";
import { ShoppingCart, Trash2, Check, X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function FloatingCart() {
    const { cart, removeFromCart, clearCart, totalPrice, updateQuantity } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [isAnimating, setIsAnimating] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Only show cart on Shop pages (all products dropdown items) and Product Detail pages
    const shouldShowCart = location.pathname.startsWith('/shop') || location.pathname.startsWith('/product/');

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Don't render if we're on home page
    if (!shouldShowCart) {
        return null;
    }

    return (
        <>
            {/* Floating Cart Button */}
            <div className="fixed bottom-6 right-6 z-[60]">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-3 sm:px-4 sm:py-3 rounded-full shadow-lg flex items-center gap-2 sm:gap-3 transition-all hover:scale-105 active:scale-95 duration-300"
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-medium text-sm sm:text-base">{cart.length}</span>
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center font-bold animate-bounce">
                            {cart.length}
                        </span>
                    )}
                </button>

                {/* Cart Slide-in Panel */}
                {isVisible && (
                    <>
                        {/* Backdrop */}
                        <div
                            className={cn(
                                "fixed inset-0 bg-background/80 backdrop-blur-sm z-[65] transition-opacity duration-300",
                                isAnimating ? "opacity-100" : "opacity-0"
                            )}
                            onClick={() => setIsOpen(false)}
                        ></div>

                        {/* Cart Panel */}
                        <div
                            className={cn(
                                "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-card border-l border-border shadow-2xl z-[70] flex flex-col transition-transform duration-300 ease-out transform",
                                isAnimating ? "translate-x-0" : "translate-x-full"
                            )}
                        >
                            {/* Header */}
                            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between flex-shrink-0">
                                <h3 className="font-display text-xl sm:text-2xl font-bold">Your Cart</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted/20 rounded-full"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {cart.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center p-8">
                                    <div className="text-center animate-fade-in-up">
                                        <div className="w-20 h-20 mx-auto mb-6 bg-muted/30 rounded-full flex items-center justify-center">
                                            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
                                        </div>
                                        <p className="text-xl font-medium mb-2">Your cart is empty</p>
                                        <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
                                        <Button onClick={() => setIsOpen(false)} variant="outline">
                                            Continue Shopping
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Cart Items */}
                                    <div className="flex-1 overflow-auto p-4 sm:p-6 space-y-4">
                                        {cart.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 sm:gap-4 bg-muted/10 border border-border/50 rounded-xl p-3 sm:p-4 hover:border-glacier/30 transition-colors">
                                                {item.image && (
                                                    <div className="w-20 h-20 rounded-lg bg-background p-2 border border-border/50 flex-shrink-0">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm sm:text-base line-clamp-2 leading-tight mb-2">{item.name}</p>
                                                    <div className="flex items-center justify-between">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center h-8 bg-background border border-border rounded-lg">
                                                            <button
                                                                onClick={() => updateQuantity(i, (item.quantity || 1) - 1)}
                                                                className="w-8 h-full flex items-center justify-center hover:bg-muted/50 rounded-l-lg transition-colors"
                                                                disabled={(item.quantity || 1) <= 1}
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-medium">{item.quantity || 1}</span>
                                                            <button
                                                                onClick={() => updateQuantity(i, (item.quantity || 1) + 1)}
                                                                className="w-8 h-full flex items-center justify-center hover:bg-muted/50 rounded-r-lg transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>

                                                        {item.price && (
                                                            <p className="font-bold text-glacier">
                                                                ${((item.price) * (item.quantity || 1)).toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    className="text-muted-foreground hover:text-destructive transition-colors p-1.5 hover:bg-destructive/10 rounded-lg"
                                                    onClick={() => removeFromCart(i)}
                                                    aria-label="Remove"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="p-4 sm:p-6 border-t border-border space-y-4 flex-shrink-0 bg-card">
                                        {totalPrice > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-muted-foreground">
                                                    <span>Subtotal</span>
                                                    <span>${totalPrice.toFixed(2)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xl sm:text-2xl font-bold">
                                                    <span>Total</span>
                                                    <span className="text-glacier">${totalPrice.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button variant="outline" size="lg" onClick={clearCart}>
                                                Clear Cart
                                            </Button>
                                            <Button
                                                onClick={() => { setIsOpen(false); navigate("/cart"); }}
                                                className="rounded-lg font-bold"
                                                size="lg"
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                Checkout
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
