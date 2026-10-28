import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Coupon } from '../../types';
import { Plus, Edit2, Trash2, Tag, Check, AlertCircle } from 'lucide-react';

export const AdminDiscounts: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCoupons = async () => {
    try {
      const data = await api.getDiscounts();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon({
      code: '',
      description: '',
      discountType: 'percentage',
      value: 10,
      minCartTotal: 1500,
      freeShipping: false,
      usageLimit: 500,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon({ ...coupon });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this coupon code?')) {
      try {
        await api.deleteCoupon(id);
        await loadCoupons();
      } catch (err: any) {
        alert(err.message || 'Failed to delete coupon');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon?.code) return;

    setSaving(true);
    try {
      if (editingCoupon.id) {
        await api.updateCoupon(editingCoupon.id, editingCoupon);
      } else {
        await api.createCoupon(editingCoupon);
      }
      setIsModalOpen(false);
      setEditingCoupon(null);
      await loadCoupons();
    } catch (err: any) {
      alert(err.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCCB] pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
            Promotions & Sales
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32]">
            Discounts & Coupons ({coupons.length})
          </h1>
          <p className="text-xs text-[#735F53] mt-1">
            Server-validated promotional codes, percentage discounts, and free delivery perks.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#5A463C] text-white rounded-lg text-xs font-semibold hover:bg-[#43332B] transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF3EB] border-b border-[#E8DCCB] text-[#8A7569] font-medium">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount Value</th>
                <th className="py-3 px-4">Min Order</th>
                <th className="py-3 px-4">Free Shipping</th>
                <th className="py-3 px-4">Redemptions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCB]/60 text-[#665449]">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-sm text-[#5A463C] block">{c.code}</span>
                    <span className="text-[#8A7569] text-[11px]">{c.description}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-[#4A3B32] tabular-nums">
                    {c.discountType === 'percentage' ? `${c.value}% OFF` : `Rs. ${c.value.toLocaleString()} FLAT`}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    {c.minCartTotal ? `Rs. ${c.minCartTotal.toLocaleString()}` : 'None'}
                  </td>
                  <td className="py-3 px-4">
                    {c.freeShipping ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                        Included
                      </span>
                    ) : (
                      <span className="text-[#8A7569]">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    {c.usageCount} {c.usageLimit ? `/ ${c.usageLimit}` : 'uses'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      c.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-[#5A463C] hover:bg-[#FAF3EB] rounded"
                      title="Edit Coupon"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 text-red-700 hover:bg-red-50 rounded"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Modal */}
      {isModalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-[#E8DCCB] flex items-center justify-between bg-[#FAF3EB]">
              <h3 className="font-serif-luxury text-xl font-bold text-[#4A3B32]">
                {editingCoupon.id ? 'Edit Coupon' : 'Create Coupon'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8A7569] hover:text-[#4A3B32]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#4A3B32] mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME20"
                  value={editingCoupon.code || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono uppercase font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#4A3B32] mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 20% off for welcome week"
                  value={editingCoupon.description || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.discountType || 'percentage'}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={editingCoupon.value || 0}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Min Cart Total (PKR)</label>
                  <input
                    type="number"
                    value={editingCoupon.minCartTotal || 0}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, minCartTotal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={editingCoupon.usageLimit || ''}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: parseInt(e.target.value, 10) || undefined })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E8DCCB]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCoupon.freeShipping || false}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, freeShipping: e.target.checked })}
                    className="w-4 h-4 text-[#5A463C] rounded"
                  />
                  <span>Grants Free Shipping on applicable orders</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCoupon.isActive ?? true}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#5A463C] rounded"
                  />
                  <span>Coupon is Active & Eligible for Redemption</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E8DCCB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E8DCCB] rounded-lg text-[#665449] hover:bg-[#FAF3EB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#5A463C] text-white rounded-lg font-semibold hover:bg-[#43332B] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
