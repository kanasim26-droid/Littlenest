import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AnnouncementSettings, AnnouncementMessage } from '../../types';
import { Plus, Trash2, Check, Sparkles, RefreshCw, Eye } from 'lucide-react';

export const AdminAnnouncements: React.FC = () => {
  const [settings, setSettings] = useState<AnnouncementSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await api.getAnnouncements();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMessage = () => {
    if (!settings) return;
    const newMessage: AnnouncementMessage = {
      id: `ann-${Date.now()}`,
      text: 'New promotional announcement message',
      link: '/shop',
      active: true,
    };
    setSettings({
      ...settings,
      messages: [...settings.messages, newMessage],
    });
  };

  const handleUpdateMessage = (id: string, updates: Partial<AnnouncementMessage>) => {
    if (!settings) return;
    setSettings({
      ...settings,
      messages: settings.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    });
  };

  const handleDeleteMessage = (id: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      messages: settings.messages.filter((m) => m.id !== id),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSuccessMessage(null);
    try {
      await api.updateAnnouncements(settings);
      setSuccessMessage('Announcement bar settings saved and published globally!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update announcements');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-[#8A7569]">Loading announcement settings...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="border-b border-[#E8DCCB] pb-5">
        <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
          Top Bar Banners
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32]">
          Announcement Bar Management
        </h1>
        <p className="text-xs text-[#735F53] mt-1">
          Configure banner notices, rotating promotions, free-shipping alerts, and color themes.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Live Preview Box */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-[#4A3B32] flex items-center gap-1.5 uppercase tracking-wide">
          <Eye className="w-3.5 h-3.5 text-[#5A463C]" />
          <span>Live Bar Visualizer</span>
        </span>
        <div
          className="w-full py-2 px-4 rounded-xl text-center text-xs font-medium transition-colors duration-300 shadow-xs"
          style={{
            backgroundColor: settings.backgroundColor || '#5A463C',
            color: settings.textColor || '#FFFFFF',
          }}
        >
          {settings.enabled ? (
            settings.messages.find(m => m.active)?.text || 'No active announcement messages'
          ) : (
            <span className="opacity-60 italic">(Announcement bar is currently disabled)</span>
          )}
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        
        {/* Global Bar Controls */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DCCB] pb-3">
            <h3 className="font-serif-luxury text-lg text-[#4A3B32]">Display Settings</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-4 h-4 text-[#5A463C] rounded"
              />
              <span className="font-semibold text-[#4A3B32]">Bar Enabled</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.backgroundColor || '#5A463C'}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border border-[#E8DCCB] cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.textColor || '#FFFFFF'}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  className="w-8 h-8 rounded border border-[#E8DCCB] cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.textColor}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Rotate Messages?</label>
              <label className="flex items-center gap-2 h-9 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.rotationEnabled}
                  onChange={(e) => setSettings({ ...settings, rotationEnabled: e.target.checked })}
                  className="w-4 h-4 text-[#5A463C] rounded"
                />
                <span>Auto-rotate multiple texts</span>
              </label>
            </div>

            <div>
              <label className="block font-semibold text-[#4A3B32] mb-1">Interval (Seconds)</label>
              <input
                type="number"
                min={2}
                max={30}
                value={settings.rotationIntervalSeconds || 5}
                onChange={(e) => setSettings({ ...settings, rotationIntervalSeconds: parseInt(e.target.value, 10) || 5 })}
                className="w-full px-2.5 py-1.5 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DCCB] pb-3">
            <div>
              <h3 className="font-serif-luxury text-lg text-[#4A3B32]">Announcement Messages</h3>
              <p className="text-xs text-[#8A7569]">Manage individual headlines and optional destination URLs</p>
            </div>
            <button
              type="button"
              onClick={handleAddMessage}
              className="px-3 py-1.5 bg-[#FAF3EB] hover:bg-[#5A463C] text-[#5A463C] hover:text-white rounded-lg text-xs font-medium border border-[#E8DCCB] flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Message</span>
            </button>
          </div>

          <div className="space-y-3">
            {settings.messages.map((msg, index) => (
              <div key={msg.id} className="p-3 bg-[#FAF3EB]/50 rounded-xl border border-[#E8DCCB] flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="font-mono text-xs text-[#8A7569]">{index + 1}.</span>
                
                <input
                  type="text"
                  placeholder="Announcement copy..."
                  value={msg.text}
                  onChange={(e) => handleUpdateMessage(msg.id, { text: e.target.value })}
                  className="flex-1 px-3 py-1.5 bg-white border border-[#E8DCCB] rounded-lg text-xs text-[#4A3B32]"
                />

                <input
                  type="text"
                  placeholder="Link URL e.g. /shop"
                  value={msg.link || ''}
                  onChange={(e) => handleUpdateMessage(msg.id, { link: e.target.value })}
                  className="w-40 px-3 py-1.5 bg-white border border-[#E8DCCB] rounded-lg text-xs font-mono text-[#4A3B32]"
                />

                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={msg.active}
                    onChange={(e) => handleUpdateMessage(msg.id, { active: e.target.checked })}
                    className="w-3.5 h-3.5 text-[#5A463C] rounded"
                  />
                  <span>Active</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="p-1.5 text-red-700 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#5A463C] text-white rounded-lg font-semibold hover:bg-[#43332B] transition-colors shadow-xs disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Publish Announcements'}
          </button>
        </div>

      </form>

    </div>
  );
};
