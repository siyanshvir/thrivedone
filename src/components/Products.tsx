import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const products = [
  {
    id: "iceberg",
    name: "Iceberg",
    tagline: "Mental Clarity Complex",
    description: "Enhance focus and cognitive performance with our premium nootropic blend.",
    price: "$49",
    rating: 4.9,
    reviews: 128,
    image: "https://images.squarespace-cdn.com/content/68e924749a69db6b5e066f12/a8e2ca41-c36e-4d04-8ff8-41db7b746a75/Iceberg_White.png?content-type=image%2Fpng",
    color: "from-sky-400 to-blue-600",
    bgColor: "bg-sky-500/10",
  },
  {
    id: "glacier",
    name: "Glacier",
    tagline: "Recovery & Rest",
    description: "Deep, restorative sleep and optimal recovery for your body and mind.",
    price: "$54",
    rating: 4.8,
    reviews: 95,
    image: "https://images.squarespace-cdn.com/content/68e924749a69db6b5e066f12/0c4548ac-479f-4b16-a7bd-7ea1531a1040/Glacier_White.png?content-type=image%2Fpng",
    color: "from-cyan-400 to-teal-600",
    bgColor: "bg-cyan-500/10",
  },
  {
    id: "peak-protein",
    name: "Peak Protein",
    tagline: "Performance Fuel",
    description: "Premium whey isolate for maximum muscle recovery and growth.",
    price: "$59",
    rating: 4.9,
    reviews: 203,
    image: "https://images.squarespace-cdn.com/content/68e924749a69db6b5e066f12/7732fbcb-3452-45bb-9688-30fb1bd7117a/Peak+Protein_Chocolate.png?content-type=image%2Fpng",
    color: "from-amber-400 to-orange-600",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "surge-iv",
    name: "Surge IV",
    tagline: "Hydration Boost",
    description: "Rapid electrolyte replenishment for peak hydration and endurance.",
    price: "$39",
    rating: 4.7,
    reviews: 87,
    image: "https://images.squarespace-cdn.com/content/v1/68e924749a69db6b5e066f12/66562531-2ab2-45b4-b957-24533414e478/Surge+IV_Lemonade.png",
    color: "from-lime-400 to-green-600",
    bgColor: "bg-lime-500/10",
  },
];

export function Products() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  return (
    <section id="products" className="py-24 bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Our Products
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Fuel Your <span className="text-gradient">Potential</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Premium supplements crafted with the finest ingredients for those who refuse to settle.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                "group relative rounded-2xl overflow-hidden transition-all duration-500 flex flex-col h-full",
                "bg-card border border-border hover:border-primary/30",
                "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2",
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Product Image Container */}
              <div className={cn("relative h-64 flex items-center justify-center p-6", product.bgColor)}>
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity",
                  product.color
                )} />
                <img
                  src={product.image}
                  alt={product.name}
                  className={cn(
                    "w-auto h-full object-contain transition-transform duration-500",
                    hoveredProduct === product.id && "scale-110"
                  )}
                />
              </div>

              {/* Product Info */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-foreground">{product.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                </div>

                <h3 className="font-display text-xl font-bold text-foreground mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-glacier font-medium mb-2">{product.tagline}</p>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-display font-bold text-foreground">{product.price}</span>
                  <Button
                    variant="default"
                    size="sm"
                    className={cn(
                      "rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                    )}
                  >
                    <ShoppingBag className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Button variant="hero-outline" size="lg" className="rounded-full" asChild>
            <Link to="/shop">
              View All Products
              <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
