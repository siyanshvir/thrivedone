import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

export default function CheckoutManual() {
  const { cart } = useCart();
  const companyCode = cart[0]?.link.match(/buybuttons\/([a-z0-9]+)\//i)?.[1] || "";
  const finalCartUrl = companyCode ? `https://portal.veinternational.org/buybuttons/${companyCode}/cart/` : "";

  const openItem = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openAll = () => {
    cart.forEach((item, i) => {
      const times = Math.max(1, item.quantity || 1);
      for (let k = 0; k < times; k++) {
        const url = `${item.link}?nocache=${Date.now() + i * 100 + k}`;
        openItem(url);
      }
    });
  };

  if (!cart.length || !companyCode) {
    return (
      <div className="min-h-screen bg-background">
        <section className="pt-48 pb-20">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Manual Checkout</h1>
            <p className="text-muted-foreground mb-6">No items found for manual checkout. Return to your cart.</p>
            <Link className="text-primary hover:underline" to="/cart">Go to Cart</Link>
          </div>
        </section>
        {/* Footer removed from checkout manual page */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="pt-48 pb-20 relative">
        <div className="absolute inset-0 matrix-dots opacity-10" aria-hidden="true" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Manual Checkout</h1>
          <p className="text-muted-foreground mb-8">Pop-ups were blocked or declined. Open each item to add it to your VE cart, then open the cart.</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <button onClick={openAll} className="rounded-full px-5 py-2 bg-foreground text-background hover:bg-foreground/90 transition">Open All Items</button>
            {finalCartUrl && (
              <a href={finalCartUrl} target="_blank" rel="noopener noreferrer" className="rounded-full px-5 py-2 border border-border hover:bg-white/10 transition">Open VE Cart</a>
            )}
            <Link to="/cart" className="rounded-full px-5 py-2 border border-border hover:bg-white/10 transition">Back to Cart</Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cart.map((item, i) => (
              <div key={`${item.link}-${i}`} className="rounded-xl border border-border p-4 bg-card">
                <div className="font-display font-bold mb-1">{item.name}{(item.quantity || 1) > 1 ? ` × ${item.quantity}` : ''}</div>
                <div className="text-sm text-muted-foreground break-all">{item.link}</div>
                <div className="mt-3">
                  <button onClick={() => {
                    const times = Math.max(1, item.quantity || 1);
                    for (let k = 0; k < times; k++) {
                      openItem(`${item.link}?nocache=${Date.now() + i * 100 + k}`);
                    }
                  }} className="rounded-full px-4 py-2 bg-ocean text-white hover:opacity-90">Open Add Page{(item.quantity || 1) > 1 ? 's' : ''}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer removed from checkout manual page */}
    </div>
  );
}
