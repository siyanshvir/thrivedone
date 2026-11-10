import { useMemo, useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { ProductService, Product } from "@/services/ProductService";
import { ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { ProductLineSection } from "@/components/ProductLineSection";
import { HeroTubesCursor } from "@/components/HeroTubesCursor";
import { usePageTitle } from "@/hooks/usePageTitle";
import { CustomCursor } from "@/components/CustomCursor";

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

export default function CategoryPage() {
    const { slug } = useParams<{ slug: string }>();
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

    // Find the actual category name based on the slug
    const categoryName = useMemo(() => {
        if (!slug || products.length === 0) return "";

        // Try to find a product with a matching category slug
        const match = products.find(p => p.category && slugify(p.category) === slug);
        if (match) return match.category;

        // Fallback: try to match against known categories if no products exist yet (unlikely)
        // or just format the slug title-case
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }, [slug, products]);

    usePageTitle(categoryName || "Category");

    const categoryProducts = useMemo(() => {
        if (!categoryName) return [];
        return products.filter((product) =>
            product.category === categoryName &&
            product.status !== "Phased Out" &&
            product.status !== "Removal Requested" &&
            product.status !== "Removal Pending"
        );
    }, [products, categoryName]);

    // Group products by groupName
    const groupedProducts = useMemo(() => {
        const groups: { [key: string]: Product[] } = {};

        categoryProducts.forEach(product => {
            const groupName = product.group_name || product.name;
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(product);
        });

        return Object.values(groups).filter(group => group.length > 0);
    }, [categoryProducts]);

    if (!isLoading && (!slug || (categoryProducts.length === 0 && products.length > 0))) {
        // If loaded and no products found for this slug, maybe 404 or redirect to shop
        // For now, let's just render the page but empty, or redirect
        // Ideally we redirect, but let's keep it robust
        // return <Navigate to="/shop" replace />;
    }

    const [categoryMetadata, setCategoryMetadata] = useState<any>(null);

    useEffect(() => {
        if (categoryName) {
            ProductService.getCategoryMetadata(categoryName)
                .then(setCategoryMetadata)
                .catch(console.error);
        }
    }, [categoryName]);

    return (
        <div className="min-h-screen bg-black text-white">
            <CustomCursor />

            {/* Hero Section - Generic Style */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
                <HeroTubesCursor theme={categoryMetadata?.hero_color || 'blue'} />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-black/40 to-black z-[1]"></div>

                <div className="relative z-10 text-center px-4">
                    <h1 className="font-display text-6xl md:text-8xl font-bold mb-6 tracking-tight capitalize">
                        {categoryName}
                    </h1>
                    <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-light mb-8">
                        {categoryMetadata?.description || `Explore our ${categoryName} collection.`}
                    </p>
                </div>

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
            {groupedProducts.length > 0 && (
                <section className="border-y border-white/10 bg-gradient-to-r from-slate-950/60 via-black to-slate-950/60 py-10">
                    <div className="container mx-auto px-4 lg:px-8 flex flex-col gap-6 items-center">
                        <p className="text-sm uppercase tracking-[0.25em] text-white/50">
                            Explore the collection
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
            )}

            {/* Product Showcase Sections */}
            <div className="relative">
                {groupedProducts.length > 0 ? (
                    groupedProducts.map((group, index) => {
                        const sectionId = (group[0].group_name || group[0].name).toLowerCase().replace(/\s+/g, "-");
                        const isLast = index === groupedProducts.length - 1;
                        return (
                            <div key={group[0].id}>
                                <ProductLineSection
                                    variants={group}
                                    index={index}
                                    addToCart={addToCart}
                                    sectionId={sectionId}
                                    lineDescription={group[0].description || `Premium ${categoryName} designed for your lifestyle.`}
                                />
                                {!isLast && (
                                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                )}
                            </div>
                        );
                    })
                ) : (
                    !isLoading && (
                        <div className="py-20 text-center">
                            <p className="text-white/60 text-xl">No products found in this category.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
