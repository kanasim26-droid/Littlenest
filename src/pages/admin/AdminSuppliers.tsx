import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { SupplierProduct, Order } from '../../types';
import { ExternalLink, Truck, Check, RefreshCw, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export const AdminSuppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [sList, oList] = await Promise.all([
        api.getSuppliers(),
        api.getOrders(),
      ]);
      setSuppliers(sList);
      setOrders(oList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter orders ready for supplier dispatch
  const pendingSupplierOrders = orders.filter(
    (o) => o.fulfillmentStatus === 'confirmed' || o.fulfillmentStatus === 'processing'
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="border-b border-[#E8DCCB] pb-5">
        <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
          Dropshipping Supply Chain
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32]">
          AliExpress Supplier Hub
        </h1>
        <p className="text-xs text-[#735F53] mt-1">
          Monitor product supplier links, profit margins, cost variances, and fulfill confirmed orders.
        </p>
      </div>

      {/* Orders Ready for AliExpress Fulfillment */}
      <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8DCCB] flex items-center justify-between bg-[#FAF3EB]">
          <div>
            <h3 className="font-serif-luxury text-lg font-medium text-[#4A3B32]">
              Orders Ready for Supplier Order Placement ({pendingSupplierOrders.length})
            </h3>
            <p className="text-xs text-[#8A7569]">
              Confirmed customer orders requiring fulfillment via AliExpress direct store
            </p>
          </div>
          <button onClick={loadData} className="p-1.5 text-[#5A463C] hover:bg-white rounded">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {pendingSupplierOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8A7569]">
            All confirmed customer orders have been placed with suppliers.
          </div>
        ) : (
          <div className="divide-y divide-[#E8DCCB]/60 text-xs">
            {pendingSupplierOrders.map((ord) => (
              <div key={ord.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF3EB]/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#5A463C]">{ord.orderNumber}</span>
                    <span className="text-xs font-semibold text-[#4A3B32]">{ord.customerName}</span>
                    <span className="text-[#8A7569]">· {ord.deliveryAddress.city}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {ord.items.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-[#FAF3EB] border border-[#E8DCCB] text-[11px] text-[#665449]">
                        {item.productName} ({item.variantColor}, {item.variantSize}) x{item.quantity}
                      </span>
                    ))}
                  </div>
                  {ord.supplierOrderRef && (
                    <span className="block font-mono text-[11px] text-emerald-800 mt-1">
                      Supplier Ref: {ord.supplierOrderRef}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ord.items[0]?.supplierUrl ? (
                    <a
                      href={ord.items[0].supplierUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-[#FAF3EB] hover:bg-[#5A463C] text-[#5A463C] hover:text-white rounded-lg text-xs font-medium border border-[#E8DCCB] flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open on AliExpress</span>
                    </a>
                  ) : (
                    <span className="text-[#8A7569] text-xs">No direct URL</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supplier Products Catalog & Margin Analysis */}
      <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8DCCB]">
          <h3 className="font-serif-luxury text-lg font-medium text-[#4A3B32]">
            Supplier Catalog & Gross Margin Analysis
          </h3>
          <p className="text-xs text-[#8A7569]">
            Real-time price comparisons between supplier cost and selling price
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF3EB] border-b border-[#E8DCCB] text-[#8A7569] font-medium">
              <tr>
                <th className="py-3 px-4">Supplier & SKU</th>
                <th className="py-3 px-4">Supplier Cost</th>
                <th className="py-3 px-4">Store Retail Price</th>
                <th className="py-3 px-4">Gross Margin</th>
                <th className="py-3 px-4">Shipping Line</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCB]/60 text-[#665449]">
              {suppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#4A3B32] block">{sup.supplierName}</span>
                    <span className="text-[#8A7569] text-[11px] font-mono">{sup.supplierSku}</span>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums font-medium text-[#4A3B32]">
                    Rs. {sup.supplierCost.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums font-semibold text-[#5A463C]">
                    Rs. {sup.ourSellingPrice.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      +{sup.marginPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-4">{sup.shippingMethod}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {sup.stockStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={sup.supplierProductUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FAF3EB] hover:bg-[#5A463C] text-[#5A463C] hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Supplier Link</span>
                    </a>
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
