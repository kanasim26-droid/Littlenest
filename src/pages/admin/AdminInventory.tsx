import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Boxes, AlertTriangle, Check, RefreshCw, Edit2 } from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadInventory = async () => {
    try {
      const data = await api.getInventory();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setUpdating(true);
    try {
      await api.adjustInventory({
        productId: editingItem.id,
        stockQuantity: parseInt(editingItem.stockQuantity, 10),
        lowStockThreshold: parseInt(editingItem.lowStockThreshold, 10),
        supplierStockStatus: editingItem.supplierStockStatus,
      });
      setEditingItem(null);
      await loadInventory();
    } catch (err: any) {
      alert(err.message || 'Failed to adjust inventory');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCCB] pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
            Warehouse & Dropship Stock
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32]">
            Inventory & Availability ({items.length})
          </h1>
          <p className="text-xs text-[#735F53] mt-1">
            Track physical warehouse buffer and supplier availability from AliExpress.
          </p>
        </div>

        <button onClick={loadInventory} className="p-2 bg-white border border-[#E8DCCB] rounded-lg text-[#5A463C] hover:bg-[#FAF3EB] text-xs font-medium flex items-center gap-1.5 shadow-xs">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Stock</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF3EB] border-b border-[#E8DCCB] text-[#8A7569] font-medium">
              <tr>
                <th className="py-3 px-4">Product Name & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Tracked Stock</th>
                <th className="py-3 px-4">Low-Stock Alert</th>
                <th className="py-3 px-4">Supplier Stock Status</th>
                <th className="py-3 px-4">Last Checked</th>
                <th className="py-3 px-4 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCB]/60 text-[#665449]">
              {items.map((item) => {
                const isLow = item.stockQuantity <= item.lowStockThreshold;
                const isOut = item.stockQuantity <= 0;

                return (
                  <tr key={item.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#4A3B32] block">{item.name}</span>
                      <span className="text-[#8A7569] text-[11px] font-mono">SKU: {item.sku}</span>
                    </td>
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      <span className={`font-bold ${isOut ? 'text-red-700' : isLow ? 'text-amber-700' : 'text-emerald-800'}`}>
                        {item.stockQuantity} units
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-[#8A7569]">
                      ≤ {item.lowStockThreshold} units
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium uppercase bg-[#FAF3EB] text-[#5A463C] border border-[#E8DCCB]">
                        {item.supplierStockStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] font-mono text-[#8A7569]">
                      {new Date(item.supplierLastChecked).toLocaleDateString('en-PK')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingItem({ ...item })}
                        className="px-2.5 py-1 rounded bg-[#FAF3EB] hover:bg-[#5A463C] text-[#5A463C] hover:text-white transition-colors"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 text-xs">
            <h3 className="font-serif-luxury text-lg font-bold text-[#4A3B32]">
              Adjust Stock: {editingItem.name}
            </h3>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div>
                <label className="block font-semibold text-[#4A3B32] mb-1">Tracked Stock Quantity</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={editingItem.stockQuantity}
                  onChange={(e) => setEditingItem({ ...editingItem, stockQuantity: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4A3B32] mb-1">Low-Stock Alert Threshold</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={editingItem.lowStockThreshold}
                  onChange={(e) => setEditingItem({ ...editingItem, lowStockThreshold: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4A3B32] mb-1">Supplier Stock Status</label>
                <select
                  value={editingItem.supplierStockStatus}
                  onChange={(e) => setEditingItem({ ...editingItem, supplierStockStatus: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg text-xs"
                >
                  <option value="in_stock">In Stock (Normal Supply)</option>
                  <option value="low">Low Supplier Stock</option>
                  <option value="out_of_stock">Supplier Out of Stock</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#E8DCCB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 border border-[#E8DCCB] rounded-lg text-[#665449]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-1.5 bg-[#5A463C] text-white rounded-lg font-semibold hover:bg-[#43332B] disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
