import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PaymentSettings, Order } from '../../types';
import { CreditCard, Check, AlertCircle, RefreshCw, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

export const AdminPayments: React.FC = () => {
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [ps, allOrders] = await Promise.all([
        api.getAdminPaymentSettings(),
        api.getOrders(),
      ]);
      setSettings(ps);
      // Filter orders awaiting manual TRX verification
      const unverified = allOrders.filter(
        (o) => (o.paymentMethod === 'easypaisa' || o.paymentMethod === 'jazzcash') && o.paymentStatus === 'pending'
      );
      setPendingOrders(unverified);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSuccessMessage(null);
    try {
      await api.updatePaymentSettings(settings);
      setSuccessMessage('Payment configurations saved successfully. Checkout updated immediately.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyOrderPayment = async (orderId: string, verified: boolean) => {
    try {
      await api.updateOrderStatus(orderId, {
        paymentStatus: verified ? 'verified' : 'failed',
        fulfillmentStatus: verified ? 'confirmed' : 'pending_confirmation',
        actorName: 'Admin Payment Verification',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to verify transaction');
    }
  };

  if (loading || !settings) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-serif-luxury text-[#4A3B32]">Payment Gateway Settings</h2>
        <div className="h-48 bg-white rounded-xl border border-[#E8DCCB] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Page Header */}
      <div className="border-b border-[#E8DCCB] pb-5">
        <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
          Gateways & Verification
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32]">
          Payment Methods (COD, Easypaisa, JazzCash)
        </h1>
        <p className="text-xs text-[#735F53] mt-1">
          Configure independent payment rules for Pakistan customers and verify submitted TRX references.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Manual Verification Queue */}
      <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8DCCB] flex items-center justify-between bg-[#FAF3EB]">
          <div>
            <h3 className="font-serif-luxury text-lg font-medium text-[#4A3B32]">
              TRX Reference Verification Queue ({pendingOrders.length})
            </h3>
            <p className="text-xs text-[#8A7569]">
              Easypaisa & JazzCash transfers awaiting confirmation against merchant bank portal
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-1.5 text-[#5A463C] hover:bg-white rounded-lg transition-colors"
            title="Refresh queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8A7569]">
            All mobile wallet transactions are verified. Zero pending references in queue.
          </div>
        ) : (
          <div className="divide-y divide-[#E8DCCB]/60 text-xs">
            {pendingOrders.map((ord) => (
              <div key={ord.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF3EB]/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#5A463C]">{ord.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold uppercase text-[10px] border border-blue-200">
                      {ord.paymentMethod}
                    </span>
                  </div>
                  <p className="font-medium text-[#4A3B32] mt-0.5">
                    {ord.customerName} · {ord.phone} · Total: <span className="font-mono font-semibold">Rs. {ord.total.toLocaleString()}</span>
                  </p>
                  <p className="text-[#8A7569] font-mono text-[11px] mt-0.5">
                    Customer Submitted TRX ID: <strong className="text-[#5A463C]">{ord.paymentReference || 'None Provided'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerifyOrderPayment(ord.id, true)}
                    className="px-3.5 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-medium hover:bg-emerald-800 flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Payment</span>
                  </button>
                  <button
                    onClick={() => handleVerifyOrderPayment(ord.id, false)}
                    className="px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded-lg text-xs font-medium hover:bg-red-50 flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        
        {/* 1. Cash on Delivery (COD) Settings */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DCCB] pb-3">
            <div>
              <h3 className="font-serif-luxury text-lg font-medium text-[#4A3B32]">
                1. Cash on Delivery (COD)
              </h3>
              <p className="text-xs text-[#8A7569]">Collect cash at customer doorstep upon courier handover</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.cod.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  cod: { ...settings.cod, enabled: e.target.checked }
                })}
                className="w-4 h-4 text-[#5A463C] rounded"
              />
              <span className="font-semibold text-xs text-[#4A3B32]">Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">COD Fee (PKR)</label>
              <input
                type="number"
                value={settings.cod.fee}
                onChange={(e) => setSettings({
                  ...settings,
                  cod: { ...settings.cod, fee: parseInt(e.target.value, 10) || 0 }
                })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Min Order Total (PKR)</label>
              <input
                type="number"
                value={settings.cod.minOrder}
                onChange={(e) => setSettings({
                  ...settings,
                  cod: { ...settings.cod, minOrder: parseInt(e.target.value, 10) || 0 }
                })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Max Order Limit (PKR)</label>
              <input
                type="number"
                value={settings.cod.maxOrder}
                onChange={(e) => setSettings({
                  ...settings,
                  cod: { ...settings.cod, maxOrder: parseInt(e.target.value, 10) || 0 }
                })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-[#4A3B32] mb-1">Customer Checkout Instructions</label>
              <input
                type="text"
                value={settings.cod.instructions}
                onChange={(e) => setSettings({
                  ...settings,
                  cod: { ...settings.cod, instructions: e.target.value }
                })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* 2. Easypaisa Settings */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DCCB] pb-3">
            <div>
              <h3 className="font-serif-luxury text-lg font-medium text-[#4A3B32]">
                2. Easypaisa Mobile Account
              </h3>
              <p className="text-xs text-[#8A7569]">Manual and mobile wallet transfer with TRX submission</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.easypaisa.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  easypaisa: { ...settings.easypaisa, enabled: e.target.checked }
                })}
                className="w-4 h-4 text-[#5A463C] rounded"
              />
              <span className="font-semibold text-xs text-[#4A3B32]">Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Account Title *</label>
              <input
                type="text"
                value={settings.easypaisa.accountTitle}
                onChange={(e) => setSettings({
                  ...settings,
                  easypaisa: { ...settings.easypaisa, accountTitle: e.target.value }
                })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Easypaisa Mobile Number *</label>
              <input
                type="text"
                value={settings.easypaisa.accountNumber}
                onChange={(e) => setSettings({
                  ...settings,
                  easypaisa: { ...settings.easypaisa, accountNumber: e.target.value }
                })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#4A3B32] mb-1">Transfer Instructions for Customers</label>
              <textarea
                rows={2}
                value={settings.easypaisa.instructions}
                onChange={(e) => setSettings({
                  ...settings,
                  easypaisa: { ...settings.easypaisa, instructions: e.target.value }
                })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* 3. JazzCash Settings */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DCCB] pb-3">
            <div>
              <h3 className="font-serif-luxury text-lg font-medium text-[#4A3B32]">
                3. JazzCash Mobile Account
              </h3>
              <p className="text-xs text-[#8A7569]">Direct transfer via JazzCash App or USSD *786# with TID</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.jazzcash.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  jazzcash: { ...settings.jazzcash, enabled: e.target.checked }
                })}
                className="w-4 h-4 text-[#5A463C] rounded"
              />
              <span className="font-semibold text-xs text-[#4A3B32]">Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Account Title *</label>
              <input
                type="text"
                value={settings.jazzcash.accountTitle}
                onChange={(e) => setSettings({
                  ...settings,
                  jazzcash: { ...settings.jazzcash, accountTitle: e.target.value }
                })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">JazzCash Mobile Number *</label>
              <input
                type="text"
                value={settings.jazzcash.accountNumber}
                onChange={(e) => setSettings({
                  ...settings,
                  jazzcash: { ...settings.jazzcash, accountNumber: e.target.value }
                })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#4A3B32] mb-1">Transfer Instructions for Customers</label>
              <textarea
                rows={2}
                value={settings.jazzcash.instructions}
                onChange={(e) => setSettings({
                  ...settings,
                  jazzcash: { ...settings.jazzcash, instructions: e.target.value }
                })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#5A463C] text-white rounded-lg font-semibold hover:bg-[#43332B] transition-colors shadow-xs disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All Payment Settings'}
          </button>
        </div>

      </form>

    </div>
  );
};
