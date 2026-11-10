import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductService } from "@/services/ProductService";
import { Link } from "react-router-dom";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { cn, isLightColor, isWhiteColor } from "@/lib/utils";

export function HeroProductSlideshow() {
    // Fetch products from D1 with aggressive caching
    const { data: displayProducts = [] } = useQuery({
        queryKey: ['slideshow-products'],
        queryFn: async () => {
            const allProducts = await ProductService.getAllProducts();
            // All In Store products with images
            return allProducts.filter(p =>
                p.status === 'In Store' &&
                p.image_url
            );
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const { addToCart } = useCart();

    useEffect(() => {
        if (isHovered || displayProducts.length === 0) return; // Pause on hover

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
        }, 4000); // Increased from 3s to 4s for better performance

        return () => clearInterval(interval);
    }, [displayProducts.length, isHovered]);

    // Helper to get image path
    const getImagePath = (imageUrl: string | undefined) => {
        if (!imageUrl) return "/placeholder.svg";
        return imageUrl;
    };

    const goToIndex = (idx: number) => {
        setCurrentIndex((idx + displayProducts.length) % displayProducts.length);
    };

    const goNext = () => {
        setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
    };

    const goPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + displayProducts.length) % displayProducts.length);
    };

    return (
        <div
            className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/20 group animate-fade-in-up"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            tabIndex={0}
            onKeyDown={(e) => {
                if (!isHovered) return;
                if (e.key === "ArrowRight") {
                    e.preventDefault();
                    goNext();
                } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    goPrev();
                }
            }}
        >
            {displayProducts.map((product, index) => (
                <div
                    key={product.id}
                    className={cn(
                        "absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out",
                        index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                    {/* Full Frame Image */}
                    <Link
                        to={`/product/${(product.group_name || product.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}?sku=${product.sku}`}
                        state={{ from: "/", fromLabel: "Home" }}
                        className="absolute inset-0 bg-black"
                        data-cursor="Click to view more details"
                        data-cursor-color={product.hex_color || '#0080ff'}
                    >
                        <img
                            src={getImagePath(product.image_url)}
                            alt={product.name}
                            loading={index === 0 ? "eager" : "lazy"}
                            className="w-full h-full object-cover"
                        />
                    </Link>

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col z-20">
                        <h3 className="font-display text-2xl font-bold text-white mb-2 line-clamp-2 tracking-wide leading-tight">
                            <Link
                                to={`/product/${(product.group_name || product.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}?sku=${product.sku}`}
                                state={{ from: "/", fromLabel: "Home" }}
                                className="hover:underline"
                            >
                                {product.group_name || product.name}
                            </Link>
                        </h3>

                        <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                {product.clearance_price != null ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-display font-bold text-green-400">${Number(product.clearance_price).toFixed(2)}</span>
                                        <span className="text-lg font-display text-red-400 line-through">${product.price.toFixed(2)}</span>
                                    </div>
                                ) : (
                                    <span className="text-3xl font-display font-bold text-white">${product.price.toFixed(2)}</span>
                                )}

                                {/* Quantity Selector */}
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-2 py-1 border border-white/10 hidden sm:flex">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const qty = quantities[product.id] || 1;
                                            setQuantities({ ...quantities, [product.id]: Math.max(1, qty - 1) });
                                        }}
                                        data-cursor="Decrease quantity"
                                        data-cursor-color={product.hex_color || '#0080ff'}
                                        className="w-8 h-8 rounded-full bg-white/10 hover:scale-110 text-white flex items-center justify-center text-sm font-bold transition-all duration-200"
                                        onMouseEnter={(e) => {
                                            // Only apply hover if product has a color
                                            if (product.hex_color) {
                                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = product.hex_color;
                                                (e.currentTarget as HTMLButtonElement).style.color = isLightColor(product.hex_color) ? '#000000' : '#ffffff';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
                                            (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                                        }}
                                    >
                                        −
                                    </button>
                                    <span className="w-8 text-center font-medium text-white text-sm">{quantities[product.id] || 1}</span>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const qty = quantities[product.id] || 1;
                                            setQuantities({ ...quantities, [product.id]: Math.min(99, qty + 1) });
                                        }}
                                        data-cursor="Increase quantity"
                                        data-cursor-color={product.hex_color || '#0080ff'}
                                        className="w-8 h-8 rounded-full bg-white/10 hover:scale-110 text-white flex items-center justify-center text-sm font-bold transition-all duration-200"
                                        onMouseEnter={(e) => {
                                            // Only apply hover if product has a color
                                            if (product.hex_color) {
                                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = product.hex_color;
                                                (e.currentTarget as HTMLButtonElement).style.color = isLightColor(product.hex_color) ? '#000000' : '#ffffff';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
                                            (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <Button
                                onClick={() => {
                                    const qty = quantities[product.id] || 1;
                                    addToCart({
                                        name: product.name,
                                        link: product.buy_link || '',
                                        price: product.price,
                                        clearance_price: product.clearance_price,
                                        image: getImagePath(product.image_url),
                                        quantity: 1,
                                        sku: product.sku,
                                        baseSlug: (product.group_name || product.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
                                    }, qty);
                                }}
                                data-cursor="Click to add to cart"
                                data-cursor-color={product.hex_color || '#0080ff'}
                                className={cn(
                                    "w-full rounded-full font-bold h-12 text-base shadow-lg transition-all duration-300",
                                    product.hex_color ? "bg-white text-black" : "bg-[#0080ff] text-white"
                                )}
                                onMouseEnter={(e) => {
                                    const hexColor = product.hex_color;
                                    // Only apply hover color if product has a color and it's not white
                                    if (hexColor && !isWhiteColor(hexColor)) {
                                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = hexColor;
                                        (e.currentTarget as HTMLButtonElement).style.color = isLightColor(hexColor) ? '#000000' : '#ffffff';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    const hexColor = product.hex_color;
                                    if (hexColor && !isWhiteColor(hexColor)) {
                                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '';
                                        (e.currentTarget as HTMLButtonElement).style.color = '';
                                    }
                                }}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Add to Cart {(quantities[product.id] || 1) > 1 && `x ${quantities[product.id] || 1}`}
                            </Button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Slide Controls */}
            {/* Dots */}
            <div className="absolute top-4 right-4 flex gap-1.5 z-30">
                {displayProducts.map((_, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            goToIndex(idx);
                        }}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/60",
                            idx === currentIndex ? "bg-white w-6" : "bg-white/40 hover:bg-white/70"
                        )}
                    />
                ))}
            </div>

            {/* Arrows (show on hover) */}
            <button
                type="button"
                aria-label="Previous slide"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goPrev();
                }}
                data-cursor="Go back"
                data-cursor-color={displayProducts[currentIndex]?.hex_color || '#0080ff'}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 text-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button
                type="button"
                aria-label="Next slide"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goNext();
                }}
                data-cursor="Go next"
                data-cursor-color={displayProducts[currentIndex]?.hex_color || '#0080ff'}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 text-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
}
