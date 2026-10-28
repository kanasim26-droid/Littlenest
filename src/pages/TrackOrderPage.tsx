import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Order } from '../types';
import { Search, Package, CheckCircle, Truck, Clock, AlertCircle } from 'lucide-react';

interface TrackOrderProps {
  initialOrderNumber?: string;
  onNavigate: (path: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderProps> = ({ initialOrderNumber, onNavigate }) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupOrder = async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOrder(num.trim());
      setOrder(data);
    } catch {
      setError(`No order found matching "${num}". Please verify your order number (e.g. LN-10821).`);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      lookupOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupOrder(orderNumber);
  };

  const steps = [
    { key: 'placed', label: 'Order Placed', desc: 'Received in system' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Customer details verified' },
    { key: 'supplier_ordered', label: 'Supplier Ordered', desc: 'Allocated for packing' },
    { key: 'shipped', label: 'Dispatched', desc: 'With courier rider' },
    { key: 'delivered', label: 'Delivered', desc: 'Handed over' },
  ];

  const getStepProgress = (status: string) => {
    switch (status) {
      case 'pending_confirmation': return 1;
      case 'confirmed': return 2;
      case 'processing':
      case 'supplier_ordered': return 3;
      case 'shipped': return 4;
      case 'delivered': return 5;
      default: return 1;
    }
  };

  const currentStepNum = order ? getStepProgress(order.fulfillmentStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
          Courier Tracking & Live Status
        </span>
        <h1 className="text-3xl font-serif-luxury font-medium text-[#4A3B32]">
          Track Your Little Nest Order
        </h1>
        <p className="text-xs sm:text-sm text-[#735F53]">
          Enter your 7-character order number (found on your order receipt or confirmation email).
        </p>
      </div>

      {/* Lookup Bar */}
      <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            required
            placeholder="e.g. LN-10821"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full px-4 py-2.5 text-xs bg-white border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] uppercase font-mono text-[#4A3B32]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-[#5A463C] text-white text-xs font-medium rounded-lg hover:bg-[#43332B] transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Searching...' : 'Track'}</span>
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 max-w-md mx-auto flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Details View */}
      {order && (
        <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs p-6 sm:p-8 space-y-8 animate-in fade-in">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCCB] pb-6">
            <div>
              <span className="text-xs text-[#8A7569]">Order Number</span>
              <h3 className="text-2xl font-serif-luxury font-bold text-[#5A463C]">
                {order.orderNumber}
              </h3>
              <p className="text-xs text-[#8A7569]">
                Customer: {order.customerName} · {order.deliveryAddress.city}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-[#8A7569] block">Fulfillment State</span>
              <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#FAF3EB] text-[#5A463C] border border-[#E8DCCB]">
                {order.fulfillmentStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Fulfillment Progress Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A7569]">
              Fulfillment Stage
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {steps.map((step, idx) => {
                const isComplete = idx + 1 <= currentStepNum;
                const isCurrent = idx + 1 === currentStepNum;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'border-[#5A463C] bg-[#FAF3EB]'
                        : isComplete
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-[#E8DCCB]/60 bg-white opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-xs">
                      {isComplete ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#8A7569]" />
                      )}
                      <span className="font-semibold text-[#4A3B32]">{step.label}</span>
                    </div>
                    <p className="text-[11px] text-[#8A7569] leading-tight">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier and Tracking Info */}
          {order.trackingNumber && (
            <div className="p-4 rounded-xl bg-[#FAF3EB] border border-[#E8DCCB] text-xs text-[#5A463C] flex items-center justify-between">
              <div>
                <span className="block text-[#8A7569] font-medium">Courier Partner:</span>
                <strong className="text-sm">{order.courierName || 'TCS Express'}</strong>
                <p className="font-mono text-[#5A463C] mt-0.5">Tracking Number: {order.trackingNumber}</p>
              </div>
              <a
                href={`https://www.tcsexpress.com/tracking?track=${order.trackingNumber}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#5A463C] text-white text-xs font-medium rounded-lg hover:bg-[#43332B] transition-colors"
              >
                Courier Portal
              </a>
            </div>
          )}

          {/* Audit History Log */}
          {order.auditLog && order.auditLog.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#E8DCCB]/60">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A7569]">
                Order Activity Trail
              </h4>
              <div className="space-y-2 text-xs">
                {order.auditLog.map((log, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4 py-1.5 border-b border-[#E8DCCB]/30 last:border-0">
                    <div>
                      <span className="font-semibold text-[#4A3B32]">{log.action}: </span>
                      <span className="text-[#665449]">{log.details}</span>
                    </div>
                    <span className="text-[#8A7569] text-[11px] shrink-0 font-mono">
                      {new Date(log.timestamp).toLocaleDateString('en-PK', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items Summary */}
          <div className="space-y-3 pt-4 border-t border-[#E8DCCB]/60">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A7569]">
              Items In This Parcel
            </h4>
            <div className="divide-y divide-[#E8DCCB]/50">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-10 h-10 rounded object-cover border border-[#E8DCCB]" />
                    <div>
                      <p className="font-medium text-[#4A3B32]">{item.productName}</p>
                      <p className="text-[#8A7569]">{item.variantColor} · {item.variantSize} · Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="tabular-nums font-semibold text-[#4A3B32]">
                    Rs. {item.totalPrice.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
