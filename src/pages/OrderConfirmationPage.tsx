import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Order } from '../types';
import { CheckCircle2, Truck, Printer, ArrowRight, Package, Mail } from 'lucide-react';

interface OrderConfirmationProps {
  orderNumber: string;
  onNavigate: (path: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationProps> = ({
  orderNumber,
  onNavigate,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrder(orderNumber)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-[#5A463C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#8A7569]">Retrieving order receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-serif-luxury text-[#4A3B32]">Order Not Found</h2>
        <p className="text-xs text-[#8A7569]">We could not locate order {orderNumber}.</p>
        <button
          onClick={() => onNavigate('/')}
          className="px-6 py-2.5 bg-[#5A463C] text-white text-xs font-medium rounded-lg"
        >
          Return Home
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-700">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
          Order Confirmed
        </span>
        <h1 className="text-3xl font-serif-luxury font-medium text-[#4A3B32]">
          Thank you for choosing Little Nest!
        </h1>
        <p className="text-xs sm:text-sm text-[#735F53] max-w-lg mx-auto">
          An automated order confirmation has been dispatched to <strong>{order.email}</strong>. Our nursery team is preparing your package.
        </p>
      </div>

      {/* Payment Specific Guidance Banner */}
      <div className="p-4 rounded-xl border border-[#E8DCCB] bg-[#FAF3EB] text-xs text-[#5A463C] space-y-1">
        <strong className="block font-semibold">
          Payment Terms ({order.paymentMethod.toUpperCase()}):
        </strong>
        {order.paymentMethod === 'cod' && (
          <p>
            Your payment of <strong>Rs. {order.total.toLocaleString()}</strong> is due in cash upon delivery to the courier rider. Please have exact change ready.
          </p>
        )}
        {(order.paymentMethod === 'easypaisa' || order.paymentMethod === 'jazzcash') && (
          <p>
            Your payment reference (TRX ID: <strong className="font-mono">{order.paymentReference || 'Submitted'}</strong>) has been logged and is awaiting verification by our accounts team.
          </p>
        )}
      </div>

      {/* Printable Receipt Card */}
      <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs p-6 sm:p-8 space-y-6">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DCCB] pb-6">
          <div>
            <span className="text-xs text-[#8A7569]">Order Reference</span>
            <h3 className="text-2xl font-serif-luxury font-bold text-[#5A463C]">
              {order.orderNumber}
            </h3>
            <span className="text-xs text-[#8A7569]">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-PK', { dateStyle: 'long' })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white border border-[#E8DCCB] text-[#5A463C] rounded-lg text-xs font-medium hover:bg-[#FAF3EB] flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={() => onNavigate(`/track?orderNumber=${order.orderNumber}`)}
              className="px-3.5 py-1.5 bg-[#5A463C] text-white rounded-lg text-xs font-medium hover:bg-[#43332B] flex items-center gap-1.5 transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Parcel</span>
            </button>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A7569]">
            Purchased Items
          </h4>
          <div className="divide-y divide-[#E8DCCB]/60">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.productName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded object-cover border border-[#E8DCCB] shrink-0"
                  />
                  <div>
                    <h5 className="text-xs font-semibold text-[#4A3B32]">
                      {item.productName}
                    </h5>
                    <p className="text-[11px] text-[#8A7569]">
                      {item.variantColor} · {item.variantSize} · Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold tabular-nums text-[#4A3B32]">
                  Rs. {item.totalPrice.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Calculations breakdown */}
        <div className="border-t border-[#E8DCCB] pt-4 space-y-2 text-xs text-[#665449]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums font-medium">Rs. {order.subtotal.toLocaleString()}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount ({order.couponCode})</span>
              <span className="tabular-nums font-medium">-Rs. {order.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="tabular-nums font-medium">
              {order.shippingFee === 0 ? 'Free' : `Rs. ${order.shippingFee.toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between text-base font-semibold text-[#4A3B32] pt-3 border-t border-[#E8DCCB]">
            <span>Total Payable</span>
            <span className="tabular-nums font-mono text-lg text-[#5A463C]">
              Rs. {order.total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="border-t border-[#E8DCCB] pt-4 text-xs text-[#665449] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <strong className="block text-[#4A3B32] font-semibold mb-1">Delivering To:</strong>
            <p>{order.deliveryAddress.fullName}</p>
            <p>{order.deliveryAddress.streetAddress}</p>
            <p>{order.deliveryAddress.city}, {order.deliveryAddress.province}</p>
            <p>Phone: {order.deliveryAddress.phone}</p>
          </div>
          <div>
            <strong className="block text-[#4A3B32] font-semibold mb-1">Status Summary:</strong>
            <p>Payment: <span className="capitalize font-medium text-[#4A3B32]">{order.paymentStatus}</span></p>
            <p>Fulfillment: <span className="capitalize font-medium text-[#4A3B32]">{order.fulfillmentStatus.replace('_', ' ')}</span></p>
            {order.trackingNumber && (
              <p>Tracking #: <span className="font-mono font-medium text-[#5A463C]">{order.trackingNumber}</span> ({order.courierName})</p>
            )}
          </div>
        </div>

      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => onNavigate('/shop')}
          className="text-xs font-medium text-[#5A463C] hover:underline flex items-center justify-center gap-1.5 mx-auto"
        >
          <span>Continue Shopping More Newborn Outfits</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
