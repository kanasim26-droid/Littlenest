import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StoreSettings } from '../../types';
import { Settings, Save, CheckCircle2, Download, Lock, ExternalLink, ShieldCheck } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<string | null>(null);

  useEffect(() => {
    api.getStoreSettings()
      .then(setSettings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setFeedback(null);
    try {
      await api.updateStoreSettings(settings);
      setFeedback('Global store settings and branding updated in persistent database!');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update store settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    setChangingPass(true);
    setPassFeedback(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ln_admin_token')}`
        },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error('Failed to update password');
      setPassFeedback('Administrator password updated successfully.');
      setNewPassword('');
      setTimeout(() => setPassFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  const handleDownloadSql = () => {
    window.location.href = '/api/database/export-sql';
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-[#8A7569]">Loading store settings...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in max-w-5xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCCB] pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
            System & Brand Customization
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32]">
            Store Settings & Infrastructure
          </h1>
          <p className="text-xs text-[#735F53] mt-1">
            Global store attributes update the customer storefront without requiring code redeployment.
          </p>
        </div>

        {/* Supabase Schema Export */}
        <button
          type="button"
          onClick={handleDownloadSql}
          className="px-4 py-2 bg-white border border-[#E8DCCB] rounded-lg text-xs font-semibold text-[#5A463C] hover:bg-[#FAF3EB] flex items-center gap-2 shadow-xs shrink-0"
        >
          <Download className="w-4 h-4 text-[#5A463C]" />
          <span>Download Supabase SQL Schema</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        
        {/* Brand Identity & Contact */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-4">
          <h3 className="font-serif-luxury text-lg text-[#4A3B32]">1. Brand Identity & Customer Care</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Store Brand Name *</label>
              <input
                type="text"
                required
                value={settings.brandName}
                onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-serif-luxury font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Support Contact Email *</label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Support Phone & WhatsApp *</label>
              <input
                type="text"
                required
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Currency & Logistics Rates */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-4">
          <h3 className="font-serif-luxury text-lg text-[#4A3B32]">2. Currency & Shipping Calculations</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Store Currency</label>
              <input
                type="text"
                disabled
                value={settings.currency}
                className="w-full px-3 py-2 bg-[#FAF3EB] border border-[#E8DCCB] rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Currency Symbol</label>
              <input
                type="text"
                value={settings.currencySymbol}
                onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Free Delivery Threshold (PKR)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Standard Delivery Fee (PKR)</label>
              <input
                type="number"
                value={settings.defaultShippingFee}
                onChange={(e) => setSettings({ ...settings, defaultShippingFee: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Homepage Hero Customizer */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-4">
          <h3 className="font-serif-luxury text-lg text-[#4A3B32]">3. Homepage Hero Banner Customizer</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#4A3B32] mb-1">Hero Main Headline *</label>
              <input
                type="text"
                value={settings.heroHeadline}
                onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-serif-luxury text-sm font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#4A3B32] mb-1">Hero Description</label>
              <textarea
                rows={2}
                value={settings.heroDescription}
                onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Primary Button Text</label>
              <input
                type="text"
                value={settings.heroButtonPrimary}
                onChange={(e) => setSettings({ ...settings, heroButtonPrimary: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Secondary Button Text</label>
              <input
                type="text"
                value={settings.heroButtonSecondary}
                onChange={(e) => setSettings({ ...settings, heroButtonSecondary: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#4A3B32] mb-1">Hero Photography Asset Path</label>
              <input
                type="text"
                value={settings.heroImage}
                onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Save Global Settings Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#5A463C] text-white rounded-lg font-semibold hover:bg-[#43332B] transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Store Settings'}</span>
          </button>
        </div>

      </form>

      {/* Admin Security & Password Change */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-4">
        <h3 className="font-serif-luxury text-lg text-[#4A3B32] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#5A463C]" />
          <span>Administrator Password & Security</span>
        </h3>
        <p className="text-xs text-[#8A7569]">
          Change the administrator master password for accessing the store control panel.
        </p>

        {passFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
            {passFeedback}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="flex flex-col sm:flex-row gap-3 max-w-md text-xs">
          <input
            type="password"
            required
            placeholder="New admin password (min 6 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg text-[#4A3B32]"
          />
          <button
            type="submit"
            disabled={changingPass || !newPassword}
            className="px-4 py-2 bg-[#5A463C] text-white rounded-lg font-semibold hover:bg-[#43332B] transition-colors disabled:opacity-50"
          >
            {changingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

    </div>
  );
};
