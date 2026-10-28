import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Order, PaymentStatus, FulfillmentStatus } from '../../types';
import { Search, Download, Edit3, Truck, Check, AlertCircle, Eye, Printer, Shield } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Selected Order Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form states for active drawer
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus>('pending_confirmation');
  const [courierName, setCourierName] = useState('TCS Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [supplierOrderRef, setSupplierOrderRef] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenDrawer = (order: Order) => {
    setSelectedOrder(order);
    setPaymentStatus(order.paymentStatus);
    setFulfillmentStatus(order.fulfillmentStatus);
    setCourierName(order.courierName || 'TCS Express');
    setTrackingNumber(order.trackingNumber || '');
    setSupplierOrderRef(order.supplierOrderRef || '');
    setInternalNotes(order.internalNotes || '');
    setStatusMessage(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    setStatusMessage(null);
    try {
      const updated = await api.updateOrderStatus(selectedOrder.id, {
        paymentStatus,
        fulfillmentStatus,
        courierName,
        trackingNumber,
        supplierOrderRef,
        internalNotes,
        actorName: 'Admin (Store Owner)',
      });
      setSelectedOrder(updated);
      setStatusMessage('Order status, fulfillment, and audit trail updated successfully!');
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/orders/export/csv';
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.fulfillmentStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || o.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCCB] pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
            Order Fulfillment & Logistics
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32]">
            Orders ({orders.length})
          </h1>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 bg-white border border-[#E8DCCB] text-[#5A463C] rounded-lg text-xs font-semibold hover:bg-[#FAF3EB] transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Orders CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#8A7569]" />
          <input
            type="text"
            placeholder="Search by order # (LN-10821), customer name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] text-[#4A3B32]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-[#E8DCCB] rounded-lg text-[#5A463C] focus:outline-none"
        >
          <option value="all">All Fulfillment States</option>
          <option value="pending_confirmation">Pending Confirmation</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="supplier_ordered">Supplier Ordered</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-[#E8DCCB] rounded-lg text-[#5A463C] focus:outline-none"
        >
          <option value="all">All Payment Methods</option>
          <option value="cod">Cash on Delivery (COD)</option>
          <option value="easypaisa">Easypaisa</option>
          <option value="jazzcash">JazzCash</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF3EB] border-b border-[#E8DCCB] text-[#8A7569] font-medium">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer & City</th>
                <th className="py-3 px-4">Pay Method</th>
                <th className="py-3 px-4">Pay Status</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCB]/60 text-[#665449]">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-[#5A463C]">
                    {o.orderNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#8A7569]">
                    {o.createdAt.slice(0, 10)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#4A3B32] block">{o.customerName}</span>
                    <span className="text-[#8A7569] text-[11px]">{o.deliveryAddress?.city} · {o.phone}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold uppercase text-[#5A463C]">
                    {o.paymentMethod}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                      o.paymentStatus === 'verified' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      o.paymentStatus === 'pending' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-red-50 text-red-800'
                    }`}>
                      {o.paymentStatus}
                    </span>
                    {o.paymentReference && (
                      <span className="block text-[10px] font-mono text-[#8A7569] mt-0.5">
                        Ref: {o.paymentReference}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium capitalize bg-[#FAF3EB] text-[#4A3B32] border border-[#E8DCCB]">
                      {o.fulfillmentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#4A3B32] tabular-nums">
                    Rs. {o.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenDrawer(o)}
                      className="px-3 py-1.5 bg-[#FAF3EB] hover:bg-[#5A463C] text-[#5A463C] hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-[#E8DCCB] animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E8DCCB] flex items-center justify-between bg-[#FAF3EB]">
              <div>
                <span className="text-xs text-[#8A7569]">Order Management</span>
                <h3 className="font-serif-luxury text-xl font-bold text-[#5A463C]">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#8A7569] hover:text-[#4A3B32]"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {statusMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Status Controls */}
              <div className="bg-[#FAF3EB] p-4 rounded-xl border border-[#E8DCCB] space-y-3">
                <h4 className="font-semibold text-[#4A3B32] uppercase tracking-wider text-[11px]">
                  Update Status & Logistics
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#4A3B32] mb-1">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E8DCCB] rounded-lg text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified (Paid)</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#4A3B32] mb-1">Fulfillment Status</label>
                    <select
                      value={fulfillmentStatus}
                      onChange={(e) => setFulfillmentStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E8DCCB] rounded-lg text-xs"
                    >
                      <option value="pending_confirmation">Pending Confirmation</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="supplier_ordered">Supplier Ordered (AliExpress)</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-[#4A3B32] mb-1">Courier Service</label>
                    <input
                      type="text"
                      placeholder="e.g. TCS Express"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E8DCCB] rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#4A3B32] mb-1">Tracking Number</label>
                    <input
                      type="text"
                      placeholder="e.g. TCS-9842109"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E8DCCB] rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-medium text-[#4A3B32] mb-1">AliExpress Supplier Order Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. ALI-ORD-928172901"
                      value={supplierOrderRef}
                      onChange={(e) => setSupplierOrderRef(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E8DCCB] rounded-lg text-xs font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-medium text-[#4A3B32] mb-1">Internal Owner Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Notes on customer verification or special packing instructions..."
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E8DCCB] rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={updating}
                  onClick={handleUpdateStatus}
                  className="w-full py-2 bg-[#5A463C] text-white rounded-lg font-semibold hover:bg-[#43332B] transition-colors disabled:opacity-50"
                >
                  {updating ? 'Saving Changes...' : 'Save & Trigger Shipping Notification'}
                </button>
              </div>

              {/* Delivery Address & Customer */}
              <div className="space-y-1 p-3 bg-white border border-[#E8DCCB] rounded-xl">
                <span className="font-semibold text-[#4A3B32] uppercase tracking-wider text-[11px] block mb-1">
                  Customer & Delivery Details
                </span>
                <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                <p><strong>Email:</strong> {selectedOrder.email}</p>
                <p><strong>Address:</strong> {selectedOrder.deliveryAddress.streetAddress}, {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.province}</p>
                {selectedOrder.deliveryAddress.orderNotes && (
                  <p className="text-[#8A7569] italic">Notes: "{selectedOrder.deliveryAddress.orderNotes}"</p>
                )}
              </div>

              {/* Order Items Snapshot */}
              <div className="space-y-2">
                <span className="font-semibold text-[#4A3B32] uppercase tracking-wider text-[11px] block">
                  Purchased Items ({selectedOrder.items.length})
                </span>
                <div className="divide-y divide-[#E8DCCB]/60 border border-[#E8DCCB] rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img src={item.image} alt="" className="w-10 h-10 object-cover rounded border border-[#E8DCCB]" />
                        <div>
                          <p className="font-medium text-[#4A3B32]">{item.productName}</p>
                          <p className="text-[#8A7569] text-[11px]">{item.variantColor} · {item.variantSize} · Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-[#4A3B32] tabular-nums">
                        Rs. {item.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="p-3 bg-[#FAF3EB] rounded-xl border border-[#E8DCCB] space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">Rs. {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-mono">-Rs. {selectedOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="font-mono">Rs. {selectedOrder.shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-[#5A463C] text-sm pt-1 border-t border-[#E8DCCB]">
                  <span>Total:</span>
                  <span className="font-mono">Rs. {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Audit Log Trail */}
              {selectedOrder.auditLog && (
                <div className="space-y-1 pt-2">
                  <span className="font-semibold text-[#4A3B32] uppercase tracking-wider text-[11px] block">
                    Audit Log Trail
                  </span>
                  <div className="p-3 bg-[#FAF3EB] border border-[#E8DCCB] rounded-xl space-y-1.5 text-[11px]">
                    {selectedOrder.auditLog.map((log, i) => (
                      <div key={i} className="text-[#665449]">
                        <strong>{log.action}</strong> by {log.actor} ({log.details}) · <span className="font-mono text-[#8A7569]">{log.timestamp.slice(0, 16).replace('T', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
