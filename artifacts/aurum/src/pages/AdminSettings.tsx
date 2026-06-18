import { useEffect, useState } from 'react';
import { AdminLayout, adminFetch } from '../components/AdminLayout';
import { Save, RefreshCw } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  label: string;
  updated_at: string;
}

const GROUPS = [
  {
    title: 'Sale Banner',
    keys: ['sale_banner_text'],
  },
  {
    title: 'Hero Slide 1',
    keys: ['hero_1_eyebrow', 'hero_1_line1', 'hero_1_line2'],
  },
  {
    title: 'Hero Slide 2',
    keys: ['hero_2_eyebrow', 'hero_2_line1', 'hero_2_line2'],
  },
  {
    title: 'Hero Slide 3',
    keys: ['hero_3_eyebrow', 'hero_3_line1', 'hero_3_line2'],
  },
  {
    title: 'Marquee & Misc',
    keys: ['marquee_text', 'free_shipping_threshold', 'newsletter_tagline'],
  },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/settings')
      .then(r => r.json())
      .then((rows: Setting[]) => {
        const map: Record<string, Setting> = {};
        for (const row of rows) map[row.key] = row;
        setSettings(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getValue = (key: string) =>
    edited[key] !== undefined ? edited[key] : (settings[key]?.value ?? '');

  const handleSave = async (key: string) => {
    const value = getValue(key);
    setSaving(s => ({ ...s, [key]: true }));
    try {
      const res = await adminFetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
      });
      if (res.ok) {
        setSettings(prev => ({
          ...prev,
          [key]: { ...prev[key], key, value, label: prev[key]?.label ?? key, updated_at: new Date().toISOString() },
        }));
        setEdited(prev => { const n = { ...prev }; delete n[key]; return n; });
        setSaved(s => ({ ...s, [key]: true }));
        setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  const isDirty = (key: string) => edited[key] !== undefined && edited[key] !== settings[key]?.value;

  return (
    <AdminLayout title="Site Settings">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="spinner spinner--lg" style={{ color: '#111' }} />
        </div>
      ) : (
        <div className="space-y-8 max-w-3xl">
          <p className="text-[13px] text-[#999999]">
            Changes here update the live storefront immediately after saving.
          </p>
          {GROUPS.map(group => (
            <div key={group.title} className="bg-white border border-[#EAEAEA]">
              <div className="px-6 py-4 border-b border-[#EAEAEA]">
                <h2 className="font-serif text-[18px] italic font-light">{group.title}</h2>
              </div>
              <div className="divide-y divide-[#F5F5F5]">
                {group.keys.map(key => {
                  const label = settings[key]?.label ?? key;
                  const value = getValue(key);
                  const dirty = isDirty(key);
                  const isSaving = saving[key];
                  const isSaved = saved[key];
                  const isLong = key === 'marquee_text' || key === 'newsletter_tagline';
                  return (
                    <div key={key} className="px-6 py-5">
                      <label className="block text-[10px] uppercase tracking-[0.15em] text-[#999999] mb-2">
                        {label}
                      </label>
                      <div className="flex gap-3 items-start">
                        {isLong ? (
                          <textarea
                            value={value}
                            onChange={e => setEdited(prev => ({ ...prev, [key]: e.target.value }))}
                            rows={3}
                            className="flex-1 border border-[#EAEAEA] px-4 py-2.5 text-[13px] outline-none focus:border-black transition-colors resize-none font-light"
                          />
                        ) : (
                          <input
                            type="text"
                            value={value}
                            onChange={e => setEdited(prev => ({ ...prev, [key]: e.target.value }))}
                            className="flex-1 border border-[#EAEAEA] px-4 py-2.5 text-[13px] outline-none focus:border-black transition-colors font-light"
                          />
                        )}
                        <button
                          onClick={() => handleSave(key)}
                          disabled={!dirty || isSaving}
                          className={`shrink-0 flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors ${
                            isSaved
                              ? 'bg-green-600 text-white'
                              : dirty
                              ? 'bg-black text-white hover:bg-[#333]'
                              : 'bg-[#F5F5F5] text-[#BDBDBD] cursor-not-allowed'
                          }`}
                        >
                          {isSaving ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : isSaved ? (
                            <span>Saved ✓</span>
                          ) : (
                            <>
                              <Save size={13} />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
