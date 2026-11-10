import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductService, Product } from "@/services/ProductService";
import { ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { ProductLineSection } from "@/components/ProductLineSection";
import { HeroTubesCursor } from "@/components/HeroTubesCursor";
import { usePageTitle } from "@/hooks/usePageTitle";
import { CustomCursor } from "@/components/CustomCursor";

export default function BundlesPage() {
    usePageTitle("Bundles");
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const allProducts = await ProductService.getAllProducts();
                setProducts(allProducts);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const bundlesProducts = useMemo(() => {
        return products.filter((product) => 
            product.category === "Bundles" &&
            product.status !== "Phased Out" && 
            product.status !== "Removal Requested" && 
            product.status !== "Removal Pending"
        );
    }, [products]);

    const groupedProducts = useMemo(() => {
        const groups: { [key: string]: Product[] } = {};
        bundlesProducts.forEach(product => {
            const groupName = product.group_name || product.name;
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(product);
        });
        // Filter out groups that have no valid variants after filtering
        return Object.values(groups).filter(group => group.length > 0);
    }, [bundlesProducts]);

    return (
        <div className="min-h-screen bg-black text-white">
            <CustomCursor />
            {/* Hero Section - Apple Style */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
                <HeroTubesCursor theme="orange" />
                <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 via-black/40 to-black z-[1]"></div>

                <div className="relative z-10 text-center px-4">
                    <h1 className="font-display text-6xl md:text-8xl font-bold mb-6 tracking-tight">
                        Bundles
                    </h1>
                    <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-light mb-8">
                        Curated wellness bundles designed to save you money while maximizing your health journey.
                    </p>
                </div>

                {/* Scroll Indicator at Bottom */}
                <button
                    type="button"
                    aria-label="Scroll down"
                    onClick={() => window.scrollTo({ behavior: 'smooth', top: window.innerHeight })}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-30 hover:opacity-90 focus:outline-none"
                >
                    <ChevronDown className="w-8 h-8 text-white/60" />
                </button>
            </section>

            {/* Overview / quick navigation divider */}
            <section className="border-y border-white/10 bg-gradient-to-r from-slate-950/60 via-black to-slate-950/60 py-10">
                <div className="container mx-auto px-4 lg:px-8 flex flex-col gap-6 items-center">
                    <p className="text-sm uppercase tracking-[0.25em] text-white/50">
                        Explore the bundles
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {groupedProducts.map((group) => {
                            const label = group[0].group_name || group[0].name;
                            const sectionId = label.toLowerCase().replace(/\s+/g, "-");
                            return (
                                <a
                                    key={label}
                                    href={`#${sectionId}`}
                                    className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm text-white/80 hover:bg-white/15 hover:border-white/40 transition-colors"
                                >
                                    {label}
                                </a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Product Showcase Sections */}
            <div className="relative">
                {groupedProducts.map((group, index) => {
                    const sectionId = (group[0].group_name || group[0].name).toLowerCase().replace(/\s+/g, "-");
                    const isLast = index === groupedProducts.length - 1;
                    return (
                        <div key={group[0].id}>
                            <ProductLineSection
                                variants={group}
                                index={index}
                                addToCart={addToCart}
                                sectionId={sectionId}
                                lineDescription="Premium wellness bundle combining essential products for complete health optimization. Save money while getting everything you need."
                            />
                            {!isLast && (
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
