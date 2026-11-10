import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

interface Product {
    category: string;
    name: string;
    price: string;
    link: string;
    sku: string;
}

const Featured = () => {
    const { addToCart } = useCart();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Parse CSV data - get featured products
        fetch('/products.csv')
            .then(res => res.text())
            .then(csv => {
                const lines = csv.split('\n').slice(1);
                const parsed = lines
                    .filter(line => line.trim() && line.includes('In Store'))
                    .slice(0, 8) // Get top 8 featured products
                    .map(line => {
                        const parts = line.split(',');
                        return {
                            category: parts[0]?.trim() || '',
                            name: parts[1]?.trim() || '',
                            price: parts[5]?.trim() || '',
                            link: parts[11]?.trim() || '',
                            sku: parts[3]?.trim() || '',
                        };
                    });
                setProducts(parsed);
            });
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
                            Featured <span className="text-gradient">Products</span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            Discover our hand-picked selection of premium wellness solutions designed to elevate your daily routine.
                        </p>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-16 relative">
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.map((product, i) => (
                            <div
                                key={i}
                                className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-2 duration-300"
                            >
                                {/* Product Image */}
                                <div className="aspect-square bg-muted flex items-center justify-center p-8 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-glacier/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <img
                                        src="/placeholder.svg"
                                        alt={product.name}
                                        className="w-full h-full object-contain relative z-10"
                                    />
                                    {/* Featured Badge */}
                                    <div className="absolute top-4 right-4 bg-glacier/20 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1">
                                        <Star className="w-4 h-4 text-glacier fill-glacier" />
                                        <span className="text-xs font-bold text-glacier">Featured</span>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-6">
                                    <p className="text-xs text-glacier font-medium mb-2 uppercase tracking-wide">
                                        {product.category}
                                    </p>
                                    <h3 className="font-display text-xl font-bold text-foreground mb-3 line-clamp-2 tracking-[0.02em]">
                                        {product.name}
                                    </h3>
                                    <p className="text-3xl font-bold text-glacier mb-4">
                                        {product.price}
                                    </p>

                                    {/* CTA Buttons */}
                                    <div className="flex flex-col gap-2">
                                        <Button
                                            className="w-full rounded-full group/btn"
                                            onClick={() => addToCart({
                                                name: product.name,
                                                link: product.link,
                                                price: parseFloat(product.price.replace('$', '')),
                                                image: "/placeholder.svg"
                                            })}
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                                            Add to Cart
                                        </Button>
                                        <Link
                                            to={`/product/${product.sku.toLowerCase()}`}
                                            state={{ from: "/featured", fromLabel: "Featured" }}
                                            className="text-sm text-muted-foreground hover:text-foreground text-center transition-colors"
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="mt-16 text-center">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Ready to explore more?
                        </h2>
                        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                            Browse our complete catalog of wellness products designed to help you thrive.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Button variant="hero" size="lg" className="rounded-full" asChild>
                                <Link to="/shop/water-bottles">Water Bottles</Link>
                            </Button>
                            <Button variant="hero" size="lg" className="rounded-full" asChild>
                                <Link to="/shop/electrolytes">Electrolytes</Link>
                            </Button>
                            <Button variant="hero-outline" size="lg" className="rounded-full" asChild>
                                <Link to="/shop/supplements">Supplements</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Featured;
