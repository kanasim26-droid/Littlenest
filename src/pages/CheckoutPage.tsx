import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import { CustomerAddress, PaymentSettings } from '../types';
import { Truck, ShieldCheck, CreditCard, AlertCircle, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
  onOrderSuccess: (orderNumber: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderSuccess }) => {
  const { items, subtotal, discountAmount, shippingFee, finalTotal, appliedDiscount, clearCart } = useCart();
  const { settings } = useStore();

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'easypaisa' | 'jazzcash'>('cod');
  const [paymentReference, setPaymentReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Address form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('Punjab');
  const [postalCode, setPostalCode] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const pakistanCities = [
    'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 
    'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha', 'Other City'
  ];

  const provinces = settings?.provinces || [
    'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 
    'Islamabad Capital Territory', 'Azad Jammu & Kashmir', 'Gilgit-Baltistan'
  ];

  useEffect(() => {
    api.getPaymentSettings()
      .then(setPaymentSettings)
      .catch(console.error);
  }, []);

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif-luxury text-[#4A3B32]">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-[#8A7569]">Please select newborn garments before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="px-6 py-2.5 bg-[#5A463C] text-white text-xs font-medium rounded-lg hover:bg-[#43332B] transition-colors"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!fullName.trim() || !phone.trim() || !streetAddress.trim() || !city.trim()) {
      setSubmitError('Please complete all required delivery address fields.');
      return;
    }

    if ((selectedPaymentMethod === 'easypaisa' || selectedPaymentMethod === 'jazzcash') && !paymentReference.trim()) {
      setSubmitError(`Please provide the transaction reference ID (TRX ID) from your ${selectedPaymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} transfer.`);
      return;
    }

    setSubmitting(true);

    try {
      const addressPayload: CustomerAddress = {
        fullName: fullName.trim(),
        email: email.trim() || 'guest@littlenest.pk',
        phone: phone.trim(),
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        province,
        postalCode: postalCode.trim() || undefined,
        orderNotes: orderNotes.trim() || undefined,
      };

      const orderPayload = {
        customerAddress: addressPayload,
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          image: i.image,
        })),
        couponCode: appliedDiscount?.code,
        paymentMethod: selectedPaymentMethod,
        paymentReference: paymentReference.trim() || undefined,
      };

      const createdOrder = await api.createOrder(orderPayload);
      clearCart();
      onOrderSuccess(createdOrder.orderNumber);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to place order. Please check item stock.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back button and page title */}
      <div className="mb-8 flex items-center justify-between border-b border-[#E8DCCB] pb-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="text-xs text-[#8A7569] hover:text-[#4A3B32] flex items-center gap-1.5 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="text-3xl font-serif-luxury font-medium text-[#4A3B32]">
            Secure Checkout
          </h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#8A7569]">
          <Lock className="w-4 h-4 text-emerald-700" />
          <span>Encrypted 256-Bit Order</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Delivery & Payment Details */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Delivery Address Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-5">
              <h3 className="font-serif-luxury text-xl text-[#4A3B32]">
                1. Delivery Information (Pakistan)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayesha Malik"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] text-[#4A3B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
                    Phone Number (for Courier SMS & COD) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0300-1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] text-[#4A3B32]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
                    Email Address (for order tracking & confirmation)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. ayesha@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] text-[#4A3B32]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
                    Complete Street Address (House/Apartment #, Sector/Street) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. House 42-B, Street 7, Phase 5, DHA"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] text-[#4A3B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    list="city-options"
                    required
                    placeholder="Select or type city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] text-[#4A3B32]"
                  />
                  <datalist id="city-options">
                    {pakistanCities.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
                    Province / Region *
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] text-[#4A3B32]"
                  >
                    {provinces.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
                    Postal Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 54000"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] text-[#4A3B32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3B32] mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Leave with security guard"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] text-[#4A3B32]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-5">
              <h3 className="font-serif-luxury text-xl text-[#4A3B32]">
                2. Select Payment Method
              </h3>

              <div className="space-y-3">
                
                {/* Cash on Delivery (COD) */}
                {paymentSettings?.cod?.enabled !== false && (
                  <label
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'cod'
                        ? 'border-[#5A463C] bg-[#FAF3EB]'
                        : 'border-[#E8DCCB] hover:border-[#8A7569] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={selectedPaymentMethod === 'cod'}
                          onChange={() => setSelectedPaymentMethod('cod')}
                          className="text-[#5A463C] focus:ring-[#5A463C]"
                        />
                        <div>
                          <span className="block text-sm font-semibold text-[#4A3B32]">
                            Cash on Delivery (COD)
                          </span>
                          <span className="block text-xs text-[#8A7569]">
                            Pay cash to courier upon physical delivery at your doorstep
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Most Popular
                      </span>
                    </div>

                    {selectedPaymentMethod === 'cod' && (
                      <div className="mt-3 pt-3 border-t border-[#E8DCCB]/60 text-xs text-[#665449] space-y-1">
                        <p>{paymentSettings?.cod?.instructions || 'Pay the exact payable amount in cash to the delivery rider upon receiving your parcel.'}</p>
                        <p className="font-medium text-[#5A463C]">Amount due on delivery: Rs. {finalTotal.toLocaleString()}</p>
                      </div>
                    )}
                  </label>
                )}

                {/* Easypaisa */}
                {paymentSettings?.easypaisa?.enabled !== false && (
                  <label
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'easypaisa'
                        ? 'border-[#5A463C] bg-[#FAF3EB]'
                        : 'border-[#E8DCCB] hover:border-[#8A7569] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="easypaisa"
                        checked={selectedPaymentMethod === 'easypaisa'}
                        onChange={() => setSelectedPaymentMethod('easypaisa')}
                        className="text-[#5A463C] focus:ring-[#5A463C]"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-[#4A3B32]">
                          Easypaisa Mobile Account Transfer
                        </span>
                        <span className="block text-xs text-[#8A7569]">
                          Direct transfer to our merchant wallet with instant verification
                        </span>
                      </div>
                    </div>

                    {selectedPaymentMethod === 'easypaisa' && (
                      <div className="mt-3 pt-3 border-t border-[#E8DCCB]/60 text-xs space-y-2 text-[#665449]">
                        <div className="p-3 bg-white rounded-lg border border-[#E8DCCB] space-y-1">
                          <p><strong>Account Title:</strong> {paymentSettings?.easypaisa?.accountTitle || 'Little Nest Baby Store'}</p>
                          <p><strong>Easypaisa Account #:</strong> <span className="font-mono font-semibold text-[#5A463C]">{paymentSettings?.easypaisa?.accountNumber || '0300 8765432'}</span></p>
                          <p className="text-[#8A7569]">{paymentSettings?.easypaisa?.instructions}</p>
                        </div>
                        <div>
                          <label className="block font-semibold text-[#4A3B32] mb-1">
                            Enter 11-digit Transaction ID (TRX ID) *
                          </label>
                          <input
                            type="text"
                            required={selectedPaymentMethod === 'easypaisa'}
                            placeholder="e.g. EP-88392109281 or 12345678901"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8DCCB] rounded-lg font-mono text-[#4A3B32]"
                          />
                        </div>
                      </div>
                    )}
                  </label>
                )}

                {/* JazzCash */}
                {paymentSettings?.jazzcash?.enabled !== false && (
                  <label
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'jazzcash'
                        ? 'border-[#5A463C] bg-[#FAF3EB]'
                        : 'border-[#E8DCCB] hover:border-[#8A7569] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="jazzcash"
                        checked={selectedPaymentMethod === 'jazzcash'}
                        onChange={() => setSelectedPaymentMethod('jazzcash')}
                        className="text-[#5A463C] focus:ring-[#5A463C]"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-[#4A3B32]">
                          JazzCash Mobile Account Transfer
                        </span>
                        <span className="block text-xs text-[#8A7569]">
                          Fast transfer from JazzCash App or *786#
                        </span>
                      </div>
                    </div>

                    {selectedPaymentMethod === 'jazzcash' && (
                      <div className="mt-3 pt-3 border-t border-[#E8DCCB]/60 text-xs space-y-2 text-[#665449]">
                        <div className="p-3 bg-white rounded-lg border border-[#E8DCCB] space-y-1">
                          <p><strong>Account Title:</strong> {paymentSettings?.jazzcash?.accountTitle || 'Little Nest Baby Store'}</p>
                          <p><strong>JazzCash Account #:</strong> <span className="font-mono font-semibold text-[#5A463C]">{paymentSettings?.jazzcash?.accountNumber || '0321 9876543'}</span></p>
                          <p className="text-[#8A7569]">{paymentSettings?.jazzcash?.instructions}</p>
                        </div>
                        <div>
                          <label className="block font-semibold text-[#4A3B32] mb-1">
                            Enter 12-digit TID from JazzCash SMS *
                          </label>
                          <input
                            type="text"
                            required={selectedPaymentMethod === 'jazzcash'}
                            placeholder="e.g. 102938475612"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8DCCB] rounded-lg font-mono text-[#4A3B32]"
                          />
                        </div>
                      </div>
                    )}
                  </label>
                )}

              </div>
            </div>

          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-5 sticky top-28">
            <h3 className="font-serif-luxury text-xl text-[#4A3B32]">
              Order Summary
            </h3>

            {/* Item list */}
            <div className="divide-y divide-[#E8DCCB]/60 max-h-72 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded object-cover border border-[#E8DCCB] shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#4A3B32] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#8A7569]">
                        {item.color} · {item.size} · Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium tabular-nums text-[#4A3B32] shrink-0">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="border-t border-[#E8DCCB] pt-4 space-y-2 text-xs text-[#665449]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium tabular-nums text-[#4A3B32]">
                  Rs. {subtotal.toLocaleString()}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount ({appliedDiscount?.code})</span>
                  <span className="font-medium tabular-nums">
                    -Rs. {discountAmount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Nationwide Courier Delivery</span>
                <span className="font-medium tabular-nums text-[#4A3B32]">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 uppercase font-semibold text-[11px]">Free</span>
                  ) : (
                    `Rs. ${shippingFee.toLocaleString()}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base font-semibold text-[#4A3B32] pt-3 border-t border-[#E8DCCB]">
                <span>Total Amount Due</span>
                <span className="tabular-nums font-mono text-lg text-[#5A463C]">
                  Rs. {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Place Order CTA (Guarded against duplicate clicks) */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-lg bg-[#5A463C] text-white text-sm font-semibold hover:bg-[#43332B] transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Securing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Order (Rs. {finalTotal.toLocaleString()})</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-[#8A7569] text-center leading-normal">
              By confirming your order, you agree to Little Nest's 14-day return policy and terms of service. An automatic confirmation email will be generated.
            </p>
          </div>

        </div>
      </form>

    </div>
  );
};
