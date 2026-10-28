import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { X, Plus, Minus, Trash2, ArrowRight, Tag, Check, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  onNavigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    finalTotal,
    appliedDiscount,
    applyCoupon,
    removeCoupon,
    couponError,
    isApplyingCoupon,
    amountNeededForFreeShipping,
    freeShippingThreshold,
  } = useCart();

  const { settings } = useStore();
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponSuccessMsg(null);
    const res = await applyCoupon(couponCodeInput);
    if (res.success) {
      setCouponSuccessMsg(res.message);
      setCouponCodeInput('');
      setTimeout(() => setCouponSuccessMsg(null), 3500);
    }
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onNavigate('/checkout');
  };

  const percentProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity"
    >
      <div className="w-full max-w-md bg-[#FFF9F4] h-full shadow-2xl flex flex-col border-l border-[#E8DCCB] animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DCCB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-serif-luxury text-xl font-medium text-[#4A3B32]">
              Shopping Bag
            </h3>
            <span className="text-xs text-[#8A7569] font-medium">
              ({items.reduce((acc, i) => acc + i.quantity, 0)} items)
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart drawer"
            className="p-1.5 rounded-full text-[#665449] hover:bg-[#E8DCCB]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="bg-[#FAF3EB] px-5 py-3 border-b border-[#E8DCCB]/70">
          {amountNeededForFreeShipping > 0 ? (
            <p className="text-xs text-[#665449] mb-1.5 flex items-center justify-between">
              <span>Add <strong className="text-[#5A463C]">Rs. {amountNeededForFreeShipping.toLocaleString()}</strong> more for FREE shipping</span>
              <span className="text-[11px] font-mono">{percentProgress}%</span>
            </p>
          ) : (
            <p className="text-xs text-emerald-800 font-medium mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>You've unlocked <strong>FREE nationwide delivery</strong>!</span>
            </p>
          )}
          <div className="w-full h-1.5 bg-[#E8DCCB] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#5A463C] transition-all duration-300 rounded-full"
              style={{ width: `${percentProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-[#E8DCCB]/50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF3EB] border border-[#E8DCCB] flex items-center justify-center mb-4 text-[#8A7569]">
                <Tag className="w-6 h-6" />
              </div>
              <p className="text-base font-serif-luxury text-[#4A3B32] mb-1">
                Your basket is empty
              </p>
              <p className="text-xs text-[#8A7569] mb-6 max-w-xs">
                Discover thoughtfully selected newborn essentials and gentle baby sets.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigate('/shop');
                }}
                className="px-5 py-2.5 rounded-lg bg-[#5A463C] text-white text-xs font-medium hover:bg-[#43332B] transition-colors"
              >
                Explore Essentials
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 object-cover rounded-lg bg-[#FAF3EB] border border-[#E8DCCB] shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-[#4A3B32] truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[#8A7569] mt-0.5">
                      <span>{item.color}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.size}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#E8DCCB] rounded-md bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="p-1 hover:bg-[#FAF3EB] text-[#665449] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-medium font-mono text-[#4A3B32]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="p-1 hover:bg-[#FAF3EB] text-[#665449] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price & Delete */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold tabular-nums text-[#5A463C]">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label="Remove item"
                        className="p-1 text-[#8A7569] hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Summary */}
        {items.length > 0 && (
          <div className="border-t border-[#E8DCCB] bg-[#FAF3EB] p-4 sm:p-5 space-y-3 shrink-0">
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Discount code (e.g. LITTLE10)"
                value={couponCodeInput}
                onChange={(e) => setCouponCodeInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] uppercase font-mono"
              />
              <button
                type="submit"
                disabled={isApplyingCoupon || !couponCodeInput.trim()}
                className="px-3.5 py-1.5 text-xs font-medium bg-[#5A463C] text-white rounded-lg hover:bg-[#43332B] disabled:opacity-50 transition-colors"
              >
                {isApplyingCoupon ? 'Verifying...' : 'Apply'}
              </button>
            </form>

            {couponError && (
              <p className="text-xs text-red-600 leading-tight">{couponError}</p>
            )}

            {couponSuccessMsg && (
              <p className="text-xs text-emerald-700 flex items-center gap-1 leading-tight">
                <Check className="w-3.5 h-3.5" /> {couponSuccessMsg}
              </p>
            )}

            {/* Active Coupon Tag */}
            {appliedDiscount && (
              <div className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md">
                <span className="font-mono font-medium">Coupon: {appliedDiscount.code} applied</span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs underline hover:text-red-600 ml-2"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-[#665449] pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium tabular-nums text-[#4A3B32]">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-medium tabular-nums">
                    -Rs. {discountAmount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-medium tabular-nums text-[#4A3B32]">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 uppercase font-semibold text-[11px]">Free</span>
                  ) : (
                    `Rs. ${shippingFee.toLocaleString()}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm font-semibold text-[#4A3B32] pt-2 border-t border-[#E8DCCB]">
                <span>Total Payable</span>
                <span className="tabular-nums font-mono text-base text-[#5A463C]">
                  Rs. {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleCheckoutClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#5A463C] text-white text-sm font-medium hover:bg-[#43332B] transition-colors shadow-xs"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
