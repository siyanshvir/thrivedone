import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/PageLoader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { FloatingCart } from "@/components/FloatingCart";
import { CustomCursor } from "@/components/CustomCursor";
import { GlobalPopup } from "@/components/GlobalPopup";
import { lazy, Suspense, useEffect } from "react";
import { ProductService } from "@/services/ProductService";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { usePageTracking } from "@/hooks/usePageTracking";

// Eager load critical pages
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for better performance
const About = lazy(() => import("./pages/About"));
const Stories = lazy(() => import("./pages/Stories"));
const Team = lazy(() => import("./pages/Team"));
const ProductManagement = lazy(() => import("./pages/ProductManagement"));
const Login = lazy(() => import("./pages/Login"));
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Featured = lazy(() => import("./pages/Featured"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Bundles = lazy(() => import("./pages/Bundles"));
const Cart = lazy(() => import("./pages/Cart"));
const CheckoutLoading = lazy(() => import("./pages/CheckoutLoading"));
const CheckoutManual = lazy(() => import("./pages/CheckoutManual"));
const CheckoutProcessing = lazy(() => import("./pages/CheckoutProcessing"));
const Newsletter = lazy(() => import("./pages/Newsletter"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const Shipping = lazy(() => import("./pages/Shipping"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideNavAndFooter = ["/login", "/checkout-processing", "/checkout-loading", "/product-management"].includes(location.pathname);

  // Track page views on route changes
  usePageTracking();

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      <GlobalPopup />
      {children}
      {!hideNavAndFooter && <Footer />}
    </>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // treat data as fresh for 5 minutes
      gcTime: 30 * 60 * 1000,         // keep unused cache for 30 minutes
      refetchOnWindowFocus: false,    // don't refetch just because user switches tabs
      retry: 1,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Prime the global cache on initial landing
    ProductService.initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner position="top-right" />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Layout>
                <CustomCursor />
                <ScrollToTop />
                <PageLoader />
                <FloatingCart />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/featured" element={<Featured />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/bundles" element={<Bundles />} />
                    <Route path="/shop/:slug" element={<CategoryPage />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout-loading" element={<CheckoutLoading />} />
                    <Route path="/checkout-manual" element={<CheckoutManual />} />
                    <Route path="/checkout-processing" element={<CheckoutProcessing />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/stories" element={<Stories />} />
                    <Route path="/newsletter" element={<Newsletter />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/shipping" element={<Shipping />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/product-management" element={
                      <ProtectedRoute>
                        <ProductManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="/login" element={<Login />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/changelog" element={<Changelog />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Layout>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
