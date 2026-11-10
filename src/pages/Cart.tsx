import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Trash2, ShoppingBag, Truck, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function Cart() {
  usePageTitle("Cart");
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, addToCart } = useCart();
  const navigate = useNavigate();
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  const shippingOptions = [
    {
      value: 'standard',
      label: 'Standard Shipping',
      description: '5-7 business days',
      price: totalPrice < 150 ? 10 : 0,
      icon: Truck,
      badge: totalPrice < 150 ? '+$10.00' : 'Free'
    },
    {
      value: 'express',
      label: 'Express Shipping',
      description: '2-3 business days',
      price: 25,
      icon: Zap,
      badge: '+$25.00'
    }
  ];

  const selectedShipping = shippingOptions.find(option => option.value === shippingMethod);

  const handleCheckout = () => {
    // If express shipping is selected, add the express shipping "product" to the cart
    if (shippingMethod === 'express') {
      addToCart({
        name: "Express Shipping",
        link: "https://portal.veinternational.org/buybuttons/us019814/btn/express-shipping-expr/",
        price: 25.00,
        image: "", // No image for shipping
        quantity: 1
      }, 1);
    } else if (shippingMethod === 'standard' && totalPrice < 150) {
      // Add standard shipping fee if applicable
      addToCart({
        name: "Standard Shipping",
        link: "https://portal.veinternational.org/buybuttons/us019814/btn/standard-shipping-std/", // Note: This link might stay the same or need update, but price is key
        price: 10.00,
        image: "",
        quantity: 1
      }, 1);
    }

    // Proceed to checkout page
    navigate("/checkout-processing");
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">

      <main className="flex-1 pt-44 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8">
            {/* Continue Shopping button removed */}
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Your Cart</h1>

          {cart.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-6" />
              <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
              <Button variant="hero" asChild>
                <Link to="/shop">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item, index) => {
                  const qty = item.quantity || 1;
                  const unit = item.clearance_price != null ? item.clearance_price : (item.price || 0);
                  const originalUnit = item.price || 0;
                  const isClearance = item.clearance_price != null;
                  const line = unit * qty;

                  // Generate product URL from item info
                  const productSlug = item.baseSlug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                  const productUrl = `/product/${productSlug}${item.sku ? `?sku=${item.sku}` : ''}`;

                  return (
                    <div
                      key={index}
                      className="glass rounded-xl p-4 md:p-6 flex flex-col sm:flex-row gap-4"
                    >
                      {/* Product Image with better sizing - clickable */}
                      <Link
                        to={productUrl}
                        className="w-full sm:w-32 h-32 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                        ) : (
                          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div className="min-w-0" data-cursor="View Product">
                          <Link to={productUrl} className="hover:text-glacier transition-colors">
                            <h3 className="font-semibold text-lg truncate">{item.name}{qty > 1 ? ` × ${qty}` : ''}</h3>
                          </Link>
                          {isClearance ? (
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-green-400 text-sm font-bold uppercase tracking-wider">CLEARANCE: ${unit.toFixed(2)}</span>
                              <span className="text-muted-foreground text-xs line-through">${originalUnit.toFixed(2)}</span>
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm uppercase tracking-wider font-medium mt-1">Unit: ${unit.toFixed(2)}</p>
                          )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-center">
                          <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1" data-cursor="Adjust Quantity">
                            <button
                              onClick={() => updateQuantity(index, Math.max(0, qty - 1))}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-lg font-medium"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={qty}
                              onChange={(e) => updateQuantity(index, Math.max(0, parseInt(e.target.value || '0', 10)))}
                              className="w-10 text-center bg-transparent border-none focus:ring-0 text-sm font-bold"
                            />
                            <button
                              onClick={() => updateQuantity(index, qty + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-lg font-medium"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Line Price + Remove */}
                        <div className="flex items-center justify-end gap-6">
                          <div className="text-right">
                            <div className="text-glacier font-black text-xl">${line.toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="p-2.5 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                            aria-label="Remove item"
                            data-cursor="Remove Item"
                            data-cursor-color="#ef4444"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="glass rounded-xl p-6 sticky top-32">
                  <h2 className="font-display text-xl font-bold mb-6">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>

                    {/* Shipping Selection */}
                    <div className="space-y-3 pt-2">
                      <label className="text-sm font-medium">Shipping Method</label>

                      <div className="space-y-2">
                        {shippingOptions.map((option) => {
                          const Icon = option.icon;
                          const isSelected = shippingMethod === option.value;
                          return (
                            <button
                              key={option.value}
                              onClick={() => setShippingMethod(option.value as 'standard' | 'express')}
                              data-cursor={`Select ${option.label}`}
                              data-cursor-color="#2EB9DF"
                              className={cn(
                                "w-full p-4 rounded-xl border transition-all duration-200 text-left",
                                isSelected
                                  ? "border-glacier bg-glacier/5 shadow-sm"
                                  : "border-border hover:border-glacier/50 hover:bg-white/5"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <Icon className={cn(
                                  "w-5 h-5 mt-0.5 flex-shrink-0",
                                  isSelected ? "text-primary" : "text-muted-foreground"
                                )} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                      "font-medium",
                                      isSelected ? "text-primary" : ""
                                    )}>
                                      {option.label}
                                    </span>
                                    <Badge
                                      variant={option.price === 0 ? "secondary" : "outline"}
                                      className={cn(
                                        "text-xs font-medium",
                                        option.price === 0 ? "bg-green-100 text-green-800 border-green-200" : ""
                                      )}
                                    >
                                      {option.badge}
                                    </Badge>
                                  </div>
                                  <div className={cn(
                                    "text-sm",
                                    isSelected ? "text-primary/80" : "text-muted-foreground"
                                  )}>
                                    {option.description}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 mt-2">
                        <selectedShipping.icon className="w-4 h-4" />
                        <span>Estimated delivery: {selectedShipping.description}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-muted-foreground pt-2">
                      <span>Shipping Cost</span>
                      <span>{selectedShipping?.price === 0 ? 'Free' : `$${selectedShipping?.price.toFixed(2)}`}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">${(totalPrice + (selectedShipping?.price || 0)).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    variant="hero"
                    className="w-full rounded-full bg-glacier text-white font-black py-4 hover:scale-[1.02] transition-transform"
                    onClick={handleCheckout}
                    data-cursor="Proceed to Checkout"
                    data-cursor-color="#2EB9DF"
                  >
                    Proceed to Checkout
                  </Button>

                  <p className="text-center text-xs text-muted-foreground mt-4">
                    Taxes calculated at checkout
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer removed from cart page */}
    </div>
  );
}
