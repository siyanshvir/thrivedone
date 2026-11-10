// Google Analytics 4 utility functions

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

// Check if GA is enabled and loaded
export const isGAEnabled = (): boolean => {
  return !!(GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag);
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (!isGAEnabled()) return;

  window.gtag!('event', 'page_view', {
    page_path: url,
    page_title: title || document.title,
  });
};

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (!isGAEnabled()) return;

  window.gtag!('event', eventName, eventParams);
};

// E-commerce tracking
export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}) => {
  trackEvent('add_to_cart', {
    currency: 'USD',
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity,
        item_category: product.category,
      },
    ],
  });
};

export const trackRemoveFromCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}) => {
  trackEvent('remove_from_cart', {
    currency: 'USD',
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity,
        item_category: product.category,
      },
    ],
  });
};

export const trackViewItem = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) => {
  trackEvent('view_item', {
    currency: 'USD',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category,
      },
    ],
  });
};

export const trackBeginCheckout = (items: any[], value: number) => {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value,
    items,
  });
};

export const trackPurchase = (
  transactionId: string,
  items: any[],
  value: number,
  tax?: number,
  shipping?: number
) => {
  trackEvent('purchase', {
    transaction_id: transactionId,
    currency: 'USD',
    value,
    tax: tax || 0,
    shipping: shipping || 0,
    items,
  });
};

// User engagement
export const trackSearch = (searchTerm: string) => {
  trackEvent('search', {
    search_term: searchTerm,
  });
};

export const trackNewsletterSignup = () => {
  trackEvent('newsletter_signup');
};

export const trackContactFormSubmit = () => {
  trackEvent('contact_form_submit');
};
