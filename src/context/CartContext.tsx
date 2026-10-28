import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { api } from '../services/api';

interface AppliedDiscount {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  discountAmount: number;
  freeShipping: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, color: string, size: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  appliedDiscount: AppliedDiscount | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  couponError: string | null;
  isApplyingCoupon: boolean;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  finalTotal: number;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ln_cart_items';
const COUPON_STORAGE_KEY = 'ln_applied_coupon';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3500);
  const [defaultShippingFee, setDefaultShippingFee] = useState(250);

  // Sync cart items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to local storage', e);
    }
  }, [items]);

  // Sync applied discount to localStorage
  useEffect(() => {
    try {
      if (appliedDiscount) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedDiscount));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save coupon to local storage', e);
    }
  }, [appliedDiscount]);

  // Fetch store settings for shipping threshold
  useEffect(() => {
    api.getStoreSettings()
      .then(settings => {
        if (settings.freeShippingThreshold) setFreeShippingThreshold(settings.freeShippingThreshold);
        if (settings.defaultShippingFee) setDefaultShippingFee(settings.defaultShippingFee);
      })
      .catch(() => {});
  }, []);

  const addToCart = (product: Product, color: string, size: string, quantity = 1) => {
    const itemId = `${product.id}-${color}-${size}`;
    const effectivePrice = product.salePrice || product.regularPrice;

    setItems(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stockQuantity);
        return prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i);
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: effectivePrice,
          regularPrice: product.regularPrice,
          image: product.images[0] || '',
          color,
          size,
          quantity: Math.min(quantity, product.stockQuantity),
          maxStock: product.stockQuantity,
          sku: product.sku
        }
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems(prev => prev.map(i => {
      if (i.id === itemId) {
        return { ...i, quantity: Math.min(quantity, i.maxStock) };
      }
      return i;
    }));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedDiscount(null);
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Recalculate discount if cart changes
  const discountAmount = appliedDiscount
    ? appliedDiscount.discountType === 'percentage'
      ? Math.round((subtotal * appliedDiscount.value) / 100)
      : Math.min(appliedDiscount.value, subtotal)
    : 0;

  const isFreeShipping = (appliedDiscount?.freeShipping) || (subtotal >= freeShippingThreshold);
  const shippingFee = items.length === 0 ? 0 : (isFreeShipping ? 0 : defaultShippingFee);
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const totalItemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const applyCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponError('Please enter a coupon code');
      return { success: false, message: 'Please enter a coupon code' };
    }
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid) {
        setAppliedDiscount({
          code: res.coupon.code,
          discountType: res.coupon.discountType,
          value: res.coupon.value,
          discountAmount: res.coupon.discountAmount,
          freeShipping: res.coupon.freeShipping
        });
        setIsApplyingCoupon(false);
        return { success: true, message: `Coupon "${res.coupon.code}" applied successfully!` };
      } else {
        setCouponError(res.error || 'Invalid coupon');
        setIsApplyingCoupon(false);
        return { success: false, message: res.error || 'Invalid coupon' };
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to apply coupon';
      setCouponError(msg);
      setIsApplyingCoupon(false);
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedDiscount(null);
    setCouponError(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        appliedDiscount,
        applyCoupon,
        removeCoupon,
        couponError,
        isApplyingCoupon,
        subtotal,
        discountAmount,
        shippingFee,
        finalTotal,
        freeShippingThreshold,
        amountNeededForFreeShipping,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
