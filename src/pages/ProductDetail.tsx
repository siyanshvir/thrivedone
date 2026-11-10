import { useMemo, useState, useEffect } from "react";
import { useParams, Link, useSearchParams, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useInventoryMap, stockBadge } from "@/hooks/useInventoryMap";
import { Button } from "@/components/ui/button";
import { ProductService, Product } from "@/services/ProductService";
import { cn, getContrastColor, isLightColor, isWhiteColor } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { CustomCursor } from "@/components/CustomCursor";

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

// Helper to parse specifications - handles both string and object
const parseSpecifications = (specs: any): Record<string, any> => {
  if (!specs) return {};
  if (typeof specs === 'object' && !Array.isArray(specs)) return specs;
  if (typeof specs === 'string') {
    try {
      const parsed = JSON.parse(specs);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error('Failed to parse specifications:', e);
    }
  }
  return {};
};

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialSku = searchParams.get("sku");

  const fromPath = location.state?.from;
  const fromLabel = location.state?.fromLabel;

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getAllProducts();
        setProducts(data as Product[]);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const variants = useMemo(() => {
    const group = products.filter(p => {
      const isVisible = p.status !== "Phased Out" && p.status !== "Removal Requested" && p.status !== "Removal Pending";
      const matchesSlug = slugify(p.group_name || p.name) === slug;
      return isVisible && matchesSlug;
    });
    return group.sort((a, b) => {
      const aOrder = a.variant_order ?? Number.POSITIVE_INFINITY;
      const bOrder = b.variant_order ?? Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return String(a.sku || '').localeCompare(String(b.sku || ''));
    });
  }, [slug, products]);

  const [selected, setSelected] = useState<Product | null>(null);
  const inventoryMap = useInventoryMap();

  useEffect(() => {
    if (variants.length > 0) {
      if (initialSku) {
        const found = variants.find(v => v.sku === initialSku);
        setSelected(found || variants[0]);
      } else {
        setSelected(variants[0]);
      }
    }
  }, [variants, initialSku]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-blue-400 hover:text-blue-300 underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const isSupplement = selected.category === "Wellness" || selected.category === "Supplements";

  const handleAddToCart = () => {
    addToCart(
      {
        name: selected.name,
        link: selected.buy_link,
        price: selected.price,
        clearance_price: selected.clearance_price,
        image: selected.image_url,
        sku: selected.sku,
        baseSlug: slugify(selected.group_name || selected.name),
      },
      quantity
    );
  };

  const displayDescription = selected.description || `Discover ${selected.group_name || selected.name} — premium quality designed to elevate your routine.`;

  // Get all other products in the same category for explore more
  // Get all other products in the same category for explore more
  const exploreMoreProducts = products
    .filter(p =>
      p.category === selected.category &&
      p.group_name !== selected.group_name && // Must differ by group name
      p.id !== selected.id && // Must differ by ID (safety check)
      p.status !== "Phased Out" &&
      p.status !== "Removal Requested" &&
      p.status !== "Removal Pending"
    )
    .filter((p, index, self) =>
      index === self.findIndex((t) => t.group_name === p.group_name)
    );

  return (
    <div className="min-h-screen bg-black text-white">
      <CustomCursor />

      {/* Hero Section */}
      <section className="relative pt-64 md:pt-56 lg:pt-52 pb-16 bg-gradient-to-b from-slate-900 via-black to-black">
        <div className="container mx-auto px-4 lg:px-8 xl:px-12">
          <div className="grid lg:grid-cols-2 gap-8 xl:gap-16 items-start max-w-7xl mx-auto">

            {/* Left Column - Image */}
            <div className="flex flex-col items-center lg:sticky lg:top-32">
              <div className="w-full max-w-md xl:max-w-lg">
                {selected.image_url ? (
                  <img
                    src={selected.image_url}
                    alt={selected.name}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="aspect-square flex items-center justify-center text-9xl font-display text-white/10 bg-slate-900/50 rounded-2xl">
                    {selected.group_name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Vertical Divider Line - Desktop */}
            <div className="hidden lg:block absolute left-[49%] top-52 bottom-16 w-px bg-white/30" />


            {/* Right Column - Product Info */}
            <div className="flex flex-col space-y-8">

              {/* Breadcrumbs */}
              <div className="text-sm text-white/50">
                <Link to={fromPath || "/shop"} className="hover:text-white transition">
                  {fromLabel || (selected.category === "Water Bottles" ? "Water Bottles" : selected.category === "Wellness" || selected.category === "Supplements" ? "Wellness" : "Shop")}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-white/70">{selected.group_name}</span>
              </div>

              {/* Title & Description */}
              <div className="space-y-4">
                <h1 className="font-display text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight">
                  {selected.group_name}
                </h1>
                <p className="text-lg xl:text-xl text-white/60 font-light leading-relaxed max-w-lg">
                  {displayDescription}
                </p>
              </div>

              {/* Price + stock badge */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  {selected.clearance_price != null ? (
                    <>
                      <span className="text-4xl xl:text-5xl font-bold text-green-400">${Number(selected.clearance_price).toFixed(2)}</span>
                      <span className="text-2xl xl:text-3xl font-bold text-red-400 line-through">${selected.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-4xl xl:text-5xl font-bold text-white">${selected.price.toFixed(2)}</span>
                  )}
                </div>
                {(() => {
                  const badge = stockBadge(inventoryMap[selected.sku]);
                  if (!badge) return null;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${badge.bg} ${badge.text}`}>
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  );
                })()}
              </div>

              {/* Variants */}
              {variants.length > 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-white/50 uppercase tracking-widest font-medium">
                    {isSupplement ? "Flavor" : "Color"}: <span className="text-white">{selected.color}</span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {variants.map((variant) => {
                      const hasSecondary = variant.secondary_hex_color;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelected(variant)}
                          data-cursor={variant.color}
                          data-cursor-color={variant.hex_color || '#0080ff'}
                          className={cn(
                            "w-10 h-10 xl:w-12 xl:h-12 rounded-full border-[3px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-glacier overflow-hidden relative flex items-center justify-center",
                            selected.id === variant.id
                              ? "border-glacier scale-110 shadow-lg"
                              : "border-white hover:scale-105"
                          )}
                          style={{
                            background: hasSecondary
                              ? `linear-gradient(135deg, ${variant.hex_color} 50%, ${variant.secondary_hex_color} 50%)`
                              : variant.hex_color || '#333'
                          }}
                        >
                          {selected.id === variant.id && (
                            <svg className={cn("w-5 h-5 xl:w-6 xl:h-6 drop-shadow-lg", getContrastColor(hasSecondary ? variant.hex_color : variant.hex_color))} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {/* Quantity Selector */}
                <div className="flex items-center h-12 sm:h-14 xl:h-16 bg-white/5 backdrop-blur-md rounded-full border border-white/10 px-2 w-fit mx-auto sm:mx-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-cursor="Decrease quantity"
                    data-cursor-color={selected.hex_color || '#0080ff'}
                    className="w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12 rounded-full bg-white/10 flex items-center justify-center transition-all duration-200"
                    onMouseEnter={(e) => {
                      // For bundles (no color), use blue. Otherwise use product color if it exists
                      const hoverColor = selected.category === "Bundles" ? '#0080ff' : selected.hex_color;
                      if (hoverColor) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverColor;
                        const icon = (e.currentTarget as HTMLButtonElement).querySelector('svg') as SVGElement;
                        if (icon) {
                          icon.style.color = isLightColor(hoverColor) ? '#000000' : '#ffffff';
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
                      const icon = (e.currentTarget as HTMLButtonElement).querySelector('svg') as SVGElement;
                      if (icon) {
                        icon.style.color = '#ffffff';
                      }
                    }}
                  >
                    <Minus className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#ffffff' }} />
                  </button>
                  <span className="w-10 sm:w-12 xl:w-14 text-center font-semibold text-base sm:text-lg xl:text-xl">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    data-cursor="Increase quantity"
                    data-cursor-color={selected.hex_color || '#0080ff'}
                    className="w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12 rounded-full bg-white/10 flex items-center justify-center transition-all duration-200"
                    onMouseEnter={(e) => {
                      // For bundles (no color), use blue. Otherwise use product color if it exists
                      const hoverColor = selected.category === "Bundles" ? '#0080ff' : selected.hex_color;
                      if (hoverColor) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverColor;
                        const icon = (e.currentTarget as HTMLButtonElement).querySelector('svg') as SVGElement;
                        if (icon) {
                          icon.style.color = isLightColor(hoverColor) ? '#000000' : '#ffffff';
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
                      const icon = (e.currentTarget as HTMLButtonElement).querySelector('svg') as SVGElement;
                      if (icon) {
                        icon.style.color = '#ffffff';
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#ffffff' }} />
                  </button>
                </div>

                <Button
                  size="lg"
                  className="font-bold text-base sm:text-lg xl:text-xl rounded-full px-6 sm:px-10 h-12 sm:h-14 xl:h-16 w-full sm:flex-1 transition-all duration-300 shadow-lg hover:shadow-xl bg-white text-black hover:bg-white"
                  onClick={handleAddToCart}
                  data-cursor="Click to add to cart"
                  data-cursor-color={selected.hex_color || '#0080ff'}
                  onMouseEnter={(e) => {
                    const hexColor = selected.hex_color;
                    // For single color or no color products, use blue on hover
                    if (!hexColor || hexColor === 'None') {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0080ff';
                      (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                    } else if (!isWhiteColor(hexColor)) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = hexColor;
                      (e.currentTarget as HTMLButtonElement).style.color = isLightColor(hexColor) ? '#000000' : '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#ffffff';
                    (e.currentTarget as HTMLButtonElement).style.color = '#000000';
                  }}
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 xl:w-6 xl:h-6 mr-2 sm:mr-3" />
                  Add to Cart {quantity > 1 && `x ${quantity}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      {(() => {
        const parsedSpecs = parseSpecifications(selected.specifications);
        const hasValidSpecs = Object.keys(parsedSpecs).length > 0 && Object.values(parsedSpecs).some(v => v !== null && v !== undefined && v !== '');

        return hasValidSpecs && (
          <section className="py-20 bg-gradient-to-b from-black to-slate-950">
            <div className="container mx-auto px-4 lg:px-8 xl:px-12 max-w-7xl">
              <h2 className="font-display text-3xl md:text-4xl xl:text-5xl font-bold mb-12 tracking-tight text-center">
                Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(parsedSpecs).map(([key, value]) => (
                  <div
                    key={key}
                    className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-6 xl:p-8 border border-white/5 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-glacier/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                    <div className="relative">
                      <p className="text-xs xl:text-sm text-glacier uppercase tracking-widest mb-3 font-semibold">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xl xl:text-2xl font-bold text-white">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Explore More Section */}
      {exploreMoreProducts.length > 0 && (
        <section className="py-20 bg-slate-950 border-t border-white/10">
          <div className="container mx-auto px-4 lg:px-8 xl:px-12 max-w-7xl">
            <h2 className="font-display text-3xl md:text-4xl xl:text-5xl font-bold mb-12 tracking-tight">
              Explore More {selected.category === "Wellness" || selected.category === "Supplements" ? "Wellness" : selected.category}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {exploreMoreProducts.map((p) => (
                <ProductCardExplore key={p.id} product={p} allProducts={products} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

function ProductCardExplore({ product, allProducts }: { product: Product, allProducts: Product[] }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get all variants for this product group
  const variants = allProducts.filter(p =>
    p.group_name === product.group_name &&
    p.status !== "Phased Out" &&
    p.status !== "Removal Requested" &&
    p.status !== "Removal Pending"
  ).sort((a, b) => {
    const aOrder = a.variant_order ?? Number.POSITIVE_INFINITY;
    const bOrder = b.variant_order ?? Number.POSITIVE_INFINITY;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return String(a.sku || '').localeCompare(String(b.sku || ''));
  });

  const [selectedVariant, setSelectedVariant] = useState(variants[0] || product);

  // Preload all variant images on mount
  useEffect(() => {
    variants.forEach(variant => {
      if (variant.image_url) {
        const img = new Image();
        img.src = variant.image_url;
      }
    });
  }, [variants]);

  const handleAddToCart = () => {
    addToCart(
      {
        name: selectedVariant.name,
        link: selectedVariant.buy_link,
        price: selectedVariant.price,
        image: selectedVariant.image_url,
        sku: selectedVariant.sku,
        baseSlug: slugify(selectedVariant.group_name || selectedVariant.name),
      },
      quantity
    );
    setQuantity(1);
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden transition-all duration-300 aspect-[3/4] shadow-xl border border-white/10">
      {/* Clickable Image Background */}
      <Link
        to={`/product/${slugify(selectedVariant.group_name || selectedVariant.name)}?sku=${selectedVariant.sku}`}
        state={{ from: location.pathname, fromLabel: product.category }}
        className="absolute inset-0 bg-white z-[1]"
      >
        {!imageLoaded && selectedVariant.image_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-glacier border-t-transparent"></div>
          </div>
        )}

        {selectedVariant.image_url ? (
          <img
            src={selectedVariant.image_url}
            alt={selectedVariant.name}
            loading="eager"
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-6xl font-display font-bold text-gray-300">
              {selectedVariant.group_name.charAt(0)}
            </div>
          </div>
        )}
      </Link>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-[2]" />

      <div className="absolute top-4 left-4 z-[40] pointer-events-none">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md bg-white/90",
          selectedVariant.category === "Wellness" ? "text-purple-500" :
            selectedVariant.category === "Water Bottles" ? "text-glacier" :
              selectedVariant.category === "Bundles" ? "text-[#FF88A1]" :
                "text-[#22406d]"
        )}>
          {selectedVariant.category}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col z-[40] text-white">
        {/* Color Swatches */}
        {variants.length > 1 && (
          <div className="flex flex-wrap gap-3 mb-3 pointer-events-none">
            {variants.slice(0, 6).map((variant) => {
              const hasSecondary = variant.secondary_hex_color;
              return (
                <button
                  key={variant.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariant(variant);
                    setImageLoaded(false);
                  }}
                  data-cursor={variant.color}
                  data-cursor-color={variant.hex_color || '#0080ff'}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all duration-200 focus:outline-none overflow-hidden pointer-events-auto cursor-pointer flex-shrink-0 relative flex items-center justify-center",
                    selectedVariant.id === variant.id
                      ? "border-glacier ring-2 ring-glacier ring-offset-1 ring-offset-black"
                      : "border-white/50 hover:border-white/70"
                  )}
                  style={{
                    background: hasSecondary
                      ? `linear-gradient(135deg, ${variant.hex_color} 50%, ${variant.secondary_hex_color} 50%)`
                      : variant.hex_color || '#333',
                  }}
                >
                  {selectedVariant.id === variant.id && (
                    <svg className={cn("w-4 h-4 drop-shadow-lg", getContrastColor(hasSecondary ? variant.hex_color : variant.hex_color))} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
            {variants.length > 6 && (
              <span className="text-xs text-white/60 self-center ml-1 pointer-events-none">+{variants.length - 6}</span>
            )}
          </div>
        )}

        <h3 className="font-display text-2xl font-bold mb-2 line-clamp-2 tracking-wide leading-tight drop-shadow-md">
          <Link
            to={`/product/${slugify(selectedVariant.group_name || selectedVariant.name)}?sku=${selectedVariant.sku}`}
            state={{ from: location.pathname, fromLabel: product.category }}
            className="hover:underline"
          >
            {selectedVariant.group_name || selectedVariant.name}
          </Link>
        </h3>

        <div className="mt-2 space-y-4 pointer-events-auto">
          <div className="flex items-center justify-between pointer-events-auto">
            <span className="text-3xl font-display font-bold">${selectedVariant.price.toFixed(2)}</span>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-full px-2 py-1 border-2 border-white/20 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuantity(Math.max(1, quantity - 1));
                }}
                data-cursor="Decrease quantity"
                data-cursor-color={selectedVariant.hex_color || '#0080ff'}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all duration-200 pointer-events-auto cursor-pointer"
                onMouseEnter={(e) => {
                  // For bundles (no color), use blue. Otherwise use product color if it exists
                  const hoverColor = selectedVariant.category === "Bundles" ? '#0080ff' : selectedVariant.hex_color;
                  if (hoverColor) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverColor;
                    const icon = (e.currentTarget as HTMLButtonElement).querySelector('svg') as SVGElement;
                    if (icon) {
                      icon.style.color = isLightColor(hoverColor) ? '#000000' : '#ffffff';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
                  const icon = (e.currentTarget as HTMLButtonElement).querySelector('svg') as SVGElement;
                  if (icon) {
                    icon.style.color = '#ffffff';
                  }
                }}
              >
                <Minus className="w-4 h-4" style={{ color: '#ffffff' }} />
              </button>
              <span className="w-8 text-center font-medium text-sm">{quantity}</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuantity(Math.min(99, quantity + 1));
                }}
                data-cursor="Increase quantity"
                data-cursor-color={selectedVariant.hex_color || '#0080ff'}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all duration-200 pointer-events-auto cursor-pointer"
                onMouseEnter={(e) => {
                  // For bundles (no color), use blue. Otherwise use product color if it exists
                  const hoverColor = selectedVariant.category === "Bundles" ? '#0080ff' : selectedVariant.hex_color;
                  if (hoverColor) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverColor;
                    const icon = (e.currentTarget as HTMLButtonElement).querySelector('svg') as SVGElement;
                    if (icon) {
                      icon.style.color = isLightColor(hoverColor) ? '#000000' : '#ffffff';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
                  const icon = (e.currentTarget as HTMLButtonElement).querySelector('svg') as SVGElement;
                  if (icon) {
                    icon.style.color = '#ffffff';
                  }
                }}
              >
                <Plus className="w-4 h-4" style={{ color: '#ffffff' }} />
              </button>
            </div>
          </div>

          <Button
            size="lg"
            className={cn(
              "w-full rounded-full font-bold h-11 text-base shadow-lg transition-all duration-300 pointer-events-auto cursor-pointer",
              selectedVariant.hex_color ? "bg-white text-black" : "bg-[#0080ff] text-white"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            data-cursor="Click to add to cart"
            data-cursor-color={selectedVariant.hex_color || '#0080ff'}
            onMouseEnter={(e) => {
              const hexColor = selectedVariant.hex_color;
              // Only apply hover color if product has a color and it's not white
              if (hexColor && !isWhiteColor(hexColor)) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = hexColor;
                (e.currentTarget as HTMLButtonElement).style.color = isLightColor(hexColor) ? '#000000' : '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              const hexColor = selectedVariant.hex_color;
              if (hexColor && !isWhiteColor(hexColor)) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '';
                (e.currentTarget as HTMLButtonElement).style.color = '';
              }
            }}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart {quantity > 1 && `x ${quantity}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
