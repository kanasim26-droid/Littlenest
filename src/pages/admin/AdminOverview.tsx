import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DashboardMetrics, Order } from '../../types';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  Tag,
  CreditCard
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigateTab: (tab: any) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab }) => {
  const [metrics, setMetrics] = useState<(DashboardMetrics & { recentOrders: Order[] }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardMetrics()
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-serif-luxury text-[#4A3B32]">Store Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-28 bg-white rounded-xl border border-[#E8DCCB]" />)}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-[#E8DCCB]">
        <p className="text-sm text-[#8A7569]">Unable to load store metrics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCCB] pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
            Store Performance
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32]">
            Dashboard Overview
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-3.5 py-1.5 bg-[#5A463C] text-white rounded-lg text-xs font-medium hover:bg-[#43332B] transition-colors"
          >
            Fulfill Orders
          </button>
          <button
            onClick={() => onNavigateTab('products')}
            className="px-3.5 py-1.5 bg-white border border-[#E8DCCB] text-[#5A463C] rounded-lg text-xs font-medium hover:bg-[#FAF3EB] transition-colors"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* KPI Cards: Revenue & Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Net Sales */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCB] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8A7569] text-xs">
            <span className="font-semibold uppercase tracking-wider">Net Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-[#5A463C] tabular-nums">
              Rs. {metrics.netSales.toLocaleString()}
            </span>
            <div className="text-[11px] text-[#8A7569] mt-1 space-x-1">
              <span>Gross: Rs. {metrics.grossSales.toLocaleString()}</span>
              <span aria-hidden="true">·</span>
              <span>Disc: Rs. {metrics.discountsGranted.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCB] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8A7569] text-xs">
            <span className="font-semibold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#5A463C]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-[#4A3B32] tabular-nums">
              {metrics.totalOrders}
            </span>
            <span className="block text-[11px] text-[#8A7569] mt-1">
              {metrics.ordersToday} received today
            </span>
          </div>
        </div>

        {/* Pending COD Payments */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCB] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8A7569] text-xs">
            <span className="font-semibold uppercase tracking-wider">Pending COD</span>
            <Truck className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-800 tabular-nums">
              Rs. {metrics.pendingCodPayments.toLocaleString()}
            </span>
            <span className="block text-[11px] text-[#8A7569] mt-1">
              Due upon courier doorstep delivery
            </span>
          </div>
        </div>

        {/* Payments Awaiting Verification */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCB] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#8A7569] text-xs">
            <span className="font-semibold uppercase tracking-wider">TRX Verification</span>
            <CreditCard className="w-4 h-4 text-blue-700" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-blue-800 tabular-nums">
              {metrics.paymentsAwaitingVerification}
            </span>
            <span className="block text-[11px] text-[#8A7569] mt-1">
              Easypaisa / JazzCash transactions
            </span>
          </div>
        </div>

      </div>

      {/* Operational Status Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Fulfillment Pipeline */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCB] space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A7569]">
            Fulfillment Pipeline
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#E8DCCB]/50">
              <span className="text-[#665449]">Awaiting Fulfillment</span>
              <span className="font-mono font-semibold text-amber-800 tabular-nums">
                {metrics.ordersAwaitingFulfillment}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#E8DCCB]/50">
              <span className="text-[#665449]">Shipped / In Transit</span>
              <span className="font-mono font-semibold text-blue-800 tabular-nums">
                {metrics.shippedOrders}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#665449]">Delivered</span>
              <span className="font-mono font-semibold text-emerald-800 tabular-nums">
                {metrics.deliveredOrders}
              </span>
            </div>
          </div>
        </div>

        {/* Catalog & Inventory Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DCCB] space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A7569]">
            Catalog & Inventory
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#E8DCCB]/50">
              <span className="text-[#665449]">Active Published Products</span>
              <span className="font-mono font-semibold text-emerald-800 tabular-nums">
                {metrics.activeProducts}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#E8DCCB]/50">
              <span className="text-[#665449]">Low Stock Warnings</span>
              <span className="font-mono font-semibold text-amber-700 tabular-nums">
                {metrics.lowStockWarnings}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#665449]">Out of Stock</span>
              <span className="font-mono font-semibold text-red-700 tabular-nums">
                {metrics.outOfStockProducts}
              </span>
            </div>
          </div>
        </div>

        {/* Dropshipping Automation Hub Shortcut */}
        <div className="bg-[#FAF3EB] p-5 rounded-2xl border border-[#E8DCCB] flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5A463C]">
              AliExpress Dropshipping
            </h4>
            <p className="text-xs text-[#665449] mt-1.5 leading-relaxed">
              Connect AliExpress supplier links, review cost vs selling price margins, and update supplier tracking references.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('suppliers')}
            className="mt-4 px-3 py-2 bg-white border border-[#E8DCCB] text-[#5A463C] text-xs font-medium rounded-lg hover:bg-[#FFF9F4] flex items-center justify-between"
          >
            <span>Open Supplier Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8DCCB] flex items-center justify-between">
          <div>
            <h3 className="font-serif-luxury text-xl font-medium text-[#4A3B32]">
              Recent Orders
            </h3>
            <p className="text-xs text-[#8A7569]">Live customer order records stored in persistent database</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-medium text-[#5A463C] hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF3EB] border-b border-[#E8DCCB] text-[#8A7569] font-medium">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCB]/60 text-[#665449]">
              {metrics.recentOrders?.map((o) => (
                <tr key={o.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-[#5A463C]">{o.orderNumber}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-[#4A3B32] block">{o.customerName}</span>
                    <span className="text-[#8A7569] text-[11px]">{o.deliveryAddress?.city}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium tabular-nums text-[#4A3B32]">
                    Rs. {o.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="uppercase text-[11px] font-semibold text-[#5A463C] block">{o.paymentMethod}</span>
                    <span className="capitalize text-[10px] text-[#8A7569]">{o.paymentStatus}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-xs font-medium text-[#4A3B32]">
                      {o.fulfillmentStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigateTab('orders')}
                      className="px-2.5 py-1 text-xs font-medium rounded bg-[#FAF3EB] hover:bg-[#5A463C] text-[#5A463C] hover:text-white transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
