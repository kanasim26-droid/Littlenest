import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PopupCampaign, PopupLayout, PopupType, PopupDisplayFrequency } from '../../types';
import { Plus, Edit2, Trash2, Eye, Play, Pause, Sparkles, Check, AlertCircle } from 'lucide-react';
import { AnnouncementPopup } from '../../components/common/AnnouncementPopup';

export const AdminPopups: React.FC = () => {
  const [popups, setPopups] = useState<PopupCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<Partial<PopupCampaign> | null>(null);
  const [previewPopup, setPreviewPopup] = useState<PopupCampaign | null>(null);
  const [saving, setSaving] = useState(false);

  const loadPopups = async () => {
    try {
      const data = await api.getAllPopups();
      setPopups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopups();
  }, []);

  const handleOpenCreate = () => {
    setEditingPopup({
      name: 'New Promotion Campaign',
      type: 'coupon',
      headline: 'A Little Love Awaits You',
      description: 'Discover sweet newborn essentials made for life’s most precious moments. Enjoy 10% off selected products.',
      couponCode: 'LITTLE10',
      buttonText: 'Explore the Collection',
      buttonLink: '/shop',
      imageUrl: '/src/assets/images/hero_newborn_clothing_1793176730078.jpg',
      backgroundColor: '#FFF9F4',
      textColor: '#5A463C',
      buttonStyle: 'solid_brown',
      layout: 'image_text',
      delaySeconds: 3,
      displayFrequency: 'once_per_day',
      targetPages: 'all',
      deviceTarget: 'all',
      status: 'published',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (popup: PopupCampaign) => {
    setEditingPopup({ ...popup });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (popup: PopupCampaign) => {
    const nextStatus = popup.status === 'published' ? 'paused' : 'published';
    try {
      await api.updatePopup(popup.id, { status: nextStatus });
      await loadPopups();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this popup campaign?')) {
      try {
        await api.deletePopup(id);
        await loadPopups();
      } catch (err: any) {
        alert(err.message || 'Failed to delete popup');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPopup?.headline) return;

    setSaving(true);
    try {
      if (editingPopup.id) {
        await api.updatePopup(editingPopup.id, editingPopup);
      } else {
        await api.createPopup(editingPopup);
      }
      setIsModalOpen(false);
      setEditingPopup(null);
      await loadPopups();
    } catch (err: any) {
      alert(err.message || 'Failed to save popup campaign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCCB] pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
            Promotions & Announcements
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32]">
            Controllable Popup Campaigns ({popups.length})
          </h1>
          <p className="text-xs text-[#735F53] mt-1">
            Build welcome discounts, coupons, and seasonal banners with strict frequency rules.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#5A463C] text-white rounded-lg text-xs font-semibold hover:bg-[#43332B] transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {popups.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs p-6 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#4A3B32]">{campaign.name}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                  campaign.status === 'published' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                  campaign.status === 'paused' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {campaign.status}
                </span>
              </div>

              <h4 className="text-lg font-serif-luxury text-[#5A463C] mt-2">
                "{campaign.headline}"
              </h4>
              <p className="text-xs text-[#735F53] mt-1 line-clamp-2">
                {campaign.description}
              </p>

              {campaign.couponCode && (
                <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#FAF3EB] border border-[#E8DCCB] text-xs font-mono text-[#5A463C]">
                  <span>Coupon:</span>
                  <strong>{campaign.couponCode}</strong>
                </div>
              )}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#E8DCCB]/60 text-center text-xs">
              <div>
                <span className="block text-[11px] text-[#8A7569]">Impressions</span>
                <span className="font-mono font-bold text-[#4A3B32] tabular-nums">{campaign.impressions || 0}</span>
              </div>
              <div>
                <span className="block text-[11px] text-[#8A7569]">Clicks</span>
                <span className="font-mono font-bold text-[#4A3B32] tabular-nums">{campaign.clicks || 0}</span>
              </div>
              <div>
                <span className="block text-[11px] text-[#8A7569]">Conversions</span>
                <span className="font-mono font-bold text-emerald-700 tabular-nums">{campaign.conversions || 0}</span>
              </div>
            </div>

            {/* Configuration Rules Metadata */}
            <div className="text-[11px] text-[#8A7569] space-y-1">
              <p>• Layout: <span className="capitalize">{campaign.layout.replace('_', ' ')}</span> · Delay: {campaign.delaySeconds}s</p>
              <p>• Frequency: <span className="capitalize">{campaign.displayFrequency.replace(/_/g, ' ')}</span></p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPreviewPopup(campaign)}
                className="text-xs font-medium text-[#5A463C] hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(campaign)}
                  className={`p-1.5 rounded text-xs font-medium flex items-center gap-1 ${
                    campaign.status === 'published'
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {campaign.status === 'published' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{campaign.status === 'published' ? 'Pause' : 'Activate'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(campaign)}
                  className="p-1.5 text-[#5A463C] hover:bg-[#FAF3EB] rounded"
                  title="Edit Campaign"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(campaign.id)}
                  className="p-1.5 text-red-700 hover:bg-red-50 rounded"
                  title="Delete Campaign"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-[#E8DCCB] flex items-center justify-between bg-[#FAF3EB]">
              <h3 className="font-serif-luxury text-xl font-bold text-[#4A3B32]">
                {editingPopup.id ? 'Edit Popup Campaign' : 'Create Popup Campaign'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8A7569] hover:text-[#4A3B32]">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#4A3B32] mb-1">Campaign Internal Name *</label>
                  <input
                    type="text"
                    required
                    value={editingPopup.name || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#4A3B32] mb-1">Headline Text *</label>
                  <input
                    type="text"
                    required
                    value={editingPopup.headline || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, headline: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#4A3B32] mb-1">Description / Copy *</label>
                  <textarea
                    rows={2}
                    required
                    value={editingPopup.description || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Attached Coupon Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. LITTLE10"
                    value={editingPopup.couponCode || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, couponCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Popup Layout</label>
                  <select
                    value={editingPopup.layout || 'image_text'}
                    onChange={(e) => setEditingPopup({ ...editingPopup, layout: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  >
                    <option value="image_text">Image and Text Split (Recommended)</option>
                    <option value="centered_modal">Centered Classic Modal</option>
                    <option value="compact">Compact Corner Card</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Display Frequency Rule</label>
                  <select
                    value={editingPopup.displayFrequency || 'once_per_day'}
                    onChange={(e) => setEditingPopup({ ...editingPopup, displayFrequency: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  >
                    <option value="once_per_day">Once Per Day (Suppressed for 24h)</option>
                    <option value="once_per_session">Once Per Session</option>
                    <option value="every_visit">Every Visit (Testing only)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Appearance Delay (Seconds)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={editingPopup.delaySeconds || 3}
                    onChange={(e) => setEditingPopup({ ...editingPopup, delaySeconds: parseInt(e.target.value, 10) || 3 })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={editingPopup.buttonText || 'Explore the Collection'}
                    onChange={(e) => setEditingPopup({ ...editingPopup, buttonText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">CTA Button Link</label>
                  <input
                    type="text"
                    value={editingPopup.buttonLink || '/shop'}
                    onChange={(e) => setEditingPopup({ ...editingPopup, buttonLink: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#4A3B32] mb-1">Image URL</label>
                  <input
                    type="text"
                    value={editingPopup.imageUrl || ''}
                    onChange={(e) => setEditingPopup({ ...editingPopup, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Campaign Status</label>
                  <select
                    value={editingPopup.status || 'published'}
                    onChange={(e) => setEditingPopup({ ...editingPopup, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  >
                    <option value="published">Published & Active</option>
                    <option value="draft">Draft</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8DCCB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E8DCCB] text-[#665449] rounded-lg hover:bg-[#FAF3EB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#5A463C] text-white rounded-lg font-semibold hover:bg-[#43332B] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewPopup && (
        <AnnouncementPopup
          previewCampaign={previewPopup}
          onClosePreview={() => setPreviewPopup(null)}
        />
      )}

    </div>
  );
};
