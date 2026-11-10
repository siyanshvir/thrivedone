import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
    name: string;
    link: string;
    price?: number;
    clearance_price?: number | null;
    image?: string;
    quantity?: number; // default 1
    sku?: string;
    baseSlug?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem, quantity?: number) => void;
    removeFromCart: (index: number) => void;
    updateQuantity: (index: number, quantity: number) => void;
    clearCart: () => void;
    isCheckingOut: boolean;
    checkout: () => Promise<void>;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "veCart";

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Load cart from localStorage on mount and merge duplicates into quantities
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            const arr: CartItem[] = Array.isArray(saved) ? saved : [];
            // Normalize: convert legacy repeated items into aggregated by link
            const map = new Map<string, CartItem>();
            for (const it of arr) {
                const key = it.link;
                const existing = map.get(key);
                if (existing) {
                    existing.quantity = (existing.quantity || 1) + (it.quantity || 1);
                } else {
                    map.set(key, { ...it, quantity: it.quantity || 1 });
                }
            }
            setCart(Array.from(map.values()));
        } catch {
            setCart([]);
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: CartItem, quantity: number = 1) => {
        setCart((prev) => {
            const idx = prev.findIndex((p) => p.link === item.link);
            if (idx !== -1) {
                const next = [...prev];
                next[idx] = { ...next[idx], quantity: (next[idx].quantity || 1) + quantity };
                return next;
            }
            return [...prev, { ...item, quantity }];
        });

        // Add toast notification
        import("sonner").then(({ toast }) => {
            if (quantity === 1) {
                toast.success(`You added one ${item.name} to your cart`);
            } else {
                toast.success(`You added ${quantity} ${item.name}s to your cart`);
            }
        });
    };

    const removeFromCart = (index: number) => {
        setCart((prev) => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => {
        setCart([]);
    };

    const updateQuantity = (index: number, quantity: number) => {
        setCart((prev) => {
            const next = [...prev];
            if (quantity <= 0) {
                return next.filter((_, i) => i !== index);
            }
            if (next[index]) next[index] = { ...next[index], quantity };
            return next;
        });
    };

    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const totalPrice = cart.reduce((sum, item) => {
        const effectivePrice = item.clearance_price != null ? item.clearance_price : (item.price || 0);
        return sum + effectivePrice * (item.quantity || 1);
    }, 0);

    const checkout = async () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        setIsCheckingOut(true);

        // Navigate to checkout processing page
        window.location.href = "/checkout-processing";
    };

    return (
        <CartContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, isCheckingOut, checkout, totalItems, totalPrice }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
