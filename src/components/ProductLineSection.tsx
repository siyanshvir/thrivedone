import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getContrastColor, isLightColor, isWhiteColor } from "@/lib/utils";
import type { Product } from "@/services/ProductService";
import { useInventoryMap, stockBadge } from "@/hooks/useInventoryMap";

type Variant = Product & Record<string, any>;

interface ProductLineSectionProps {
  variants: Variant[];
  index: number;
  addToCart: (item: { name: string; link: string; price: number; image?: string; sku?: string; baseSlug?: string }, quantity?: number) => void;
  sectionId: string;
  lineDescription: string;
}

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

export function ProductLineSection({
  variants,
  index,
  addToCart,
  sectionId,
  lineDescription,
}: ProductLineSectionProps) {
  const isEven = index % 2 === 0;

  const normalizedVariants = useMemo(() => {
    const mapped = variants
      .filter((v) => {
        // Filter out phased out and removal products
        const status = v.status;
        return status !== "Phased Out" &&
          status !== "Removal Requested" &&
          status !== "Removal Pending";
      })
      .map((v) => {
        const groupName = v.group_name ?? v.groupName ?? v.name;
        const buyLink = v.buy_link ?? v.buyLink ?? v.link;
        // Add cache-busting timestamp to image URLs
        const baseImage = v.image_url ?? v.image;
        const image = baseImage ? `${baseImage}?t=${Date.now()}` : baseImage;
        const baseSecondaryImage = v.secondary_image_url ?? (v as any).secondaryImage ?? null;
        const secondaryImage = baseSecondaryImage ? `${baseSecondaryImage}?t=${Date.now()}` : null;
        // Normalize hexColor - ensure it's a valid hex or null
        let rawHexColor = v.hex_color ?? v.hexColor ?? null;
        // Handle edge cases: empty string, "null", "undefined", whitespace
        if (!rawHexColor || rawHexColor === "null" || rawHexColor === "undefined" || (typeof rawHexColor === 'string' && !rawHexColor.trim())) {
          rawHexColor = null;
        }
        const hexColor = rawHexColor;
        const secondaryHexColor = v.secondary_hex_color ?? null;
        const variantOrder = v.variant_order ?? v.variantOrder ?? null;

        return {
          ...v,
          groupName,
          buyLink,
          image,
          secondaryImage,
          hexColor,
          secondary_hex_color: secondaryHexColor,
          variantOrder,
        };
      });

    return mapped.sort((a, b) => {
      const aOrder = a.variantOrder ?? Number.POSITIVE_INFINITY;
      const bOrder = b.variantOrder ?? Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return String(a.sku || "").localeCompare(String(b.sku || ""));
    });
  }, [variants]);

  const displayVariants = useMemo(() => {
    const filtered = normalizedVariants.filter((variant) => variant.hexColor && variant.color);
    if (filtered.length === 0) {
      return normalizedVariants;
    }
    return filtered;
  }, [normalizedVariants]);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const inventoryMap = useInventoryMap();
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  // Get the actual selected variant based on ID
  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return displayVariants[0];
    return displayVariants.find(v => v.id === selectedVariantId) || displayVariants[0];
  }, [selectedVariantId, displayVariants]);

  // Initialize selected variant ID when displayVariants first loads
  useEffect(() => {
    if (displayVariants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(displayVariants[0]?.id);
    }
  }, [displayVariants, selectedVariantId]);

  // Reset image slideshow when variant changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedVariantId]);

  // Preload all variant images immediately
  useEffect(() => {
    setIsLoading(true);
    let loadedCount = 0;
    const totalImages = displayVariants.filter(v => v.image).length;

    if (totalImages === 0) {
      setIsLoading(false);
      return;
    }

    displayVariants.forEach((variant) => {
      if (variant.image) {
        const img = new Image();
        img.src = variant.image;
        img.onload = () => {
          setImagesLoaded((prev) => new Set(prev).add(variant.image));
          loadedCount++;
          if (loadedCount === totalImages) {
            setIsLoading(false);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setIsLoading(false);
          }
        };
      }
    });
  }, [displayVariants]);

  const handleAddToCart = () => {
    addToCart({
      name: selectedVariant.name,
      link: selectedVariant.buyLink,
      price: selectedVariant.price,
      clearance_price: selectedVariant.clearance_price,
      image: selectedVariant.image,
      sku: selectedVariant.sku,
      baseSlug: slugify(selectedVariant.groupName || selectedVariant.name),
    }, quantity);
    setQuantity(1);
  };

  return (
    <section
      id={sectionId}
      className={cn(
        "relative flex items-center justify-center overflow-hidden py-20 md:py-32 bg-gradient-to-b from-slate-950 via-black to-slate-950"
      )}
      style={{ zIndex: 1 }}
    >


      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Product Image - ALWAYS ON LEFT */}
          <div className="flex items-center justify-center min-h-[350px] lg:min-h-[500px]">
            <div className="relative w-full max-w-md group">
              {/* Loading Skeleton */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 rounded-2xl animate-pulse flex items-center justify-center">
                    <div className="space-y-4 text-center">
                      <div className="w-16 h-16 border-2 border-glacier/30 border-t-glacier rounded-full animate-spin mx-auto" />
                      <p className="text-white/60 text-sm font-medium">Loading images...</p>
                    </div>
                  </div>
                </div>
              )}

              <div
                onClick={() => navigate(`/product/${slugify(selectedVariant.groupName || selectedVariant.name)}?sku=${selectedVariant.sku}`, { state: { from: location.pathname, fromLabel: document.title.split('|')[1]?.trim() || document.title.split('|')[0]?.trim() } })}
                className="block cursor-pointer"
                data-cursor="Click to view more details"
                data-cursor-color={selectedVariant.hexColor || '#0080ff'}
              >
                {/* Show the current slideshow image */}
                {(() => {
                  const displayImg = currentImageIndex === 1 && selectedVariant.secondaryImage
                    ? selectedVariant.secondaryImage
                    : selectedVariant.image;
                  return displayImg ? (
                    <img
                      key={displayImg}
                      src={displayImg}
                      alt={selectedVariant.name}
                      className="w-full h-auto object-contain drop-shadow-2xl transition-transform duration-200 group-hover:scale-105"
                      loading="eager"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null;
                })()}

                {/* Preload hidden images without rendering them visibly */}
                {displayVariants.map((variant) => (
                  variant.image && variant.id !== selectedVariant.id && (
                    <img
                      key={variant.image}
                      src={variant.image}
                      alt={variant.name}
                      className="hidden"
                      loading="eager"
                    />
                  )
                ))}
              </div>

              {/* Slideshow controls — only when secondary image exists */}
              {selectedVariant.secondaryImage && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(0); }}
                    aria-label="Previous image"
                    className={cn(
                      "absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                      currentImageIndex === 0
                        ? "bg-white/10 text-white/30 cursor-default"
                        : "bg-black/60 backdrop-blur-md text-white hover:bg-black/80 hover:scale-110"
                    )}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(1); }}
                    aria-label="Next image"
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                      currentImageIndex === 1
                        ? "bg-white/10 text-white/30 cursor-default"
                        : "bg-black/60 backdrop-blur-md text-white hover:bg-black/80 hover:scale-110"
                    )}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-none">
                    <div className={cn("w-2 h-2 rounded-full transition-all", currentImageIndex === 0 ? "bg-white" : "bg-white/40")} />
                    <div className={cn("w-2 h-2 rounded-full transition-all", currentImageIndex === 1 ? "bg-white" : "bg-white/40")} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Product Info - ALWAYS ON RIGHT */}
          <div className="flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                  {selectedVariant.groupName || selectedVariant.name}
                </h2>
                <p className="text-lg text-white/70 font-light leading-relaxed max-w-lg">
                  {selectedVariant.description || lineDescription}
                </p>
              </div>

              {/* Price + stock badge */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  {selectedVariant.clearance_price != null ? (
                    <>
                      <span className="text-4xl font-bold text-green-400">${Number(selectedVariant.clearance_price).toFixed(2)}</span>
                      <span className="text-2xl font-bold text-red-400 line-through">${selectedVariant.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold">${selectedVariant.price.toFixed(2)}</span>
                  )}
                </div>
                {(() => {
                  const badge = stockBadge(inventoryMap[selectedVariant.sku]);
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
              {displayVariants.length > 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-white/60 uppercase tracking-widest font-medium">
                    Available {selectedVariant.category === "Supplements" || selectedVariant.category === "Wellness" ? "Flavors" : "Colors"}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {displayVariants.map((variant) => {
                      const hasSecondary = variant.secondary_hex_color;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariantId(variant.id)}
                          data-cursor={variant.color}
                          data-cursor-color={variant.hexColor || '#7eb2e8'}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-glacier relative flex items-center justify-center overflow-hidden shadow-lg",
                            selectedVariant.id === variant.id
                              ? "border-glacier scale-110"
                              : "border-white opacity-80 hover:opacity-100"
                          )}
                          style={{
                            background: hasSecondary
                              ? `linear-gradient(135deg, ${variant.hexColor} 50%, ${hasSecondary} 50%)`
                              : variant.hexColor || '#333'
                          }}
                        >
                          {selectedVariant.id === variant.id && (
                            <svg className={cn(
                              "w-5 h-5 drop-shadow-lg",
                              getContrastColor(variant.hexColor)
                            )} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="flex flex-row gap-3 pt-2 justify-start items-center w-full sm:w-auto">
                <div className="flex items-center h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 px-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    data-cursor="Decrease quantity"
                    data-cursor-color={selectedVariant.hexColor || '#0080ff'}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold transition-all duration-200"
                    onMouseEnter={(e) => {
                      // For bundles (no color), use blue. Otherwise use product color if it exists
                      const hoverColor = selectedVariant.category === "Bundles" ? '#0080ff' : selectedVariant.hexColor;
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
                  <span className="w-8 text-center font-medium text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    data-cursor="Increase quantity"
                    data-cursor-color={selectedVariant.hexColor || '#0080ff'}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold transition-all duration-200"
                    onMouseEnter={(e) => {
                      // For bundles (no color), use blue. Otherwise use product color if it exists
                      const hoverColor = selectedVariant.category === "Bundles" ? '#0080ff' : selectedVariant.hexColor;
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

                <Button
                  size="lg"
                  className={cn(
                    "font-bold text-base sm:text-lg rounded-full px-6 sm:px-8 h-12 flex-1 sm:flex-initial sm:min-w-[180px] transition-all duration-300",
                    selectedVariant.hexColor ? "bg-white text-black" : "bg-[#0080ff] text-white"
                  )}
                  onClick={handleAddToCart}
                  data-cursor="Click to add to cart"
                  data-cursor-color={selectedVariant.hexColor || '#0080ff'}
                  onMouseEnter={(e) => {
                    const hexColor = selectedVariant.hexColor;
                    // Only apply hover color if product has a color and it's not white/near-white
                    if (hexColor && !isWhiteColor(hexColor)) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = hexColor;
                      (e.currentTarget as HTMLButtonElement).style.color = isLightColor(hexColor) ? '#000000' : '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const hexColor = selectedVariant.hexColor;
                    if (hexColor && !isWhiteColor(hexColor)) {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '';
                      (e.currentTarget as HTMLButtonElement).style.color = '';
                    }
                  }}
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add to Cart {quantity > 1 && `x ${quantity}`}
                </Button>
              </div>

              {/* Generic specs - Hidden on mobile */}
              <div className="hidden md:block pt-6 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1">
                      Category
                    </p>
                    <p className="text-lg font-semibold">{selectedVariant.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1">
                      Status
                    </p>
                    <p className="text-lg font-semibold">{selectedVariant.status || "In Stock"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1">
                      SKU
                    </p>
                    <p className="text-lg font-semibold">{selectedVariant.sku}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1">
                      Group
                    </p>
                    <p className="text-lg font-semibold">{selectedVariant.groupName || selectedVariant.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
