import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { AdminLayout, adminFetch } from '../components/AdminLayout';
import { Save, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  label: string;
  updated_at: string;
}

const SECTION_LABELS: Record<string, string> = {
  marquee:      'Marquee Banner',
  categories:   'Category Cards',
  sale_banner:  'Sale Banner',
  new_arrivals: 'New Arrivals',
  editorial:    'Editorial Feature',
  brands:       'Brand Logos Strip',
  features:     'Features (Shipping/Returns)',
  newsletter:   'Newsletter Signup',
};

const FIXED_SECTIONS = new Set(['categories', 'newsletter']); // always shown, not togglable

const TEXT_GROUPS = [
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
    title: 'Hero CTA Buttons',
    keys: ['hero_cta_primary', 'hero_cta_secondary'],
  },
  {
    title: 'New Arrivals Section',
    keys: ['new_arrivals_title', 'new_arrivals_cta'],
  },
  {
    title: 'Marquee & Misc',
    keys: ['marquee_text', 'free_shipping_threshold', 'newsletter_tagline'],
  },
];

const DEFAULT_ORDER = ['marquee','categories','sale_banner','new_arrivals','editorial','brands','features','newsletter'];

export default function AdminSettings() {
  const [, setLocation] = useLocation();
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [saveError, setSaveError] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Section order state
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_ORDER);
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);

  useEffect(() => {
    adminFetch('/api/admin/settings')
      .then(r => r.json())
      .then((data: Setting[] | { error: string }) => {
        const rows: Setting[] = Array.isArray(data) ? data : [];
        const map: Record<string, Setting> = {};
        for (const row of rows) map[row.key] = row;
        setSettings(map);
        // Parse section order from DB
        try {
          const raw = rows.find(r => r.key === 'home_section_order')?.value;
          const arr = JSON.parse(raw || '[]');
          if (Array.isArray(arr) && arr.length > 0) setSectionOrder(arr);
        } catch (_) {}
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getValue = (key: string) =>
    edited[key] !== undefined ? edited[key] : (settings[key]?.value ?? '');

  const handleSave = async (key: string) => {
    const value = getValue(key);
    setSaving(s => ({ ...s, [key]: true }));
    setSaveError(s => { const n = { ...s }; delete n[key]; return n; });
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
      } else if (res.status === 401) {
        localStorage.removeItem('aurum_admin_token');
        setLocation('/admin/login');
      } else {
        setSaveError(s => ({ ...s, [key]: 'Save failed — try again' }));
        setTimeout(() => setSaveError(s => { const n = { ...s }; delete n[key]; return n; }), 3000);
      }
    } catch (e) {
      console.error(e);
      setSaveError(s => ({ ...s, [key]: 'Network error' }));
      setTimeout(() => setSaveError(s => { const n = { ...s }; delete n[key]; return n; }), 3000);
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  const isDirty = (key: string) => edited[key] !== undefined && edited[key] !== settings[key]?.value;

  // Toggle visibility setting
  const handleToggle = async (key: string) => {
    const current = settings[key]?.value ?? 'true';
    const next = current === 'true' ? 'false' : 'true';
    setSaving(s => ({ ...s, [key]: true }));
    try {
      const res = await adminFetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value: next }),
      });
      if (res.ok) {
        setSettings(prev => ({
          ...prev,
          [key]: { ...prev[key], key, value: next, label: prev[key]?.label ?? key, updated_at: new Date().toISOString() },
        }));
        setSaved(s => ({ ...s, [key]: true }));
        setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 1500);
      } else if (res.status === 401) {
        localStorage.removeItem('aurum_admin_token');
        setLocation('/admin/login');
      }
    } catch (e) { console.error(e); }
    finally { setSaving(s => ({ ...s, [key]: false })); }
  };

  // Move section up/down in order
  const moveSection = (idx: number, dir: -1 | 1) => {
    const next = [...sectionOrder];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setSectionOrder(next);
    setOrderSaved(false);
  };

  const saveOrder = async () => {
    setOrderSaving(true);
    try {
      const res = await adminFetch('/api/admin/settings/home_section_order', {
        method: 'PUT',
        body: JSON.stringify({ value: JSON.stringify(sectionOrder) }),
      });
      if (res.ok) {
        setSettings(prev => ({
          ...prev,
          home_section_order: { ...prev['home_section_order'], key: 'home_section_order', value: JSON.stringify(sectionOrder), label: 'Homepage Section Order', updated_at: new Date().toISOString() },
        }));
        setOrderSaved(true);
        setTimeout(() => setOrderSaved(false), 2000);
      } else if (res.status === 401) {
        localStorage.removeItem('aurum_admin_token');
        setLocation('/admin/login');
      }
    } catch (e) { console.error(e); }
    finally { setOrderSaving(false); }
  };

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

          {/* ── TEXT SETTINGS ─────────────────────────────────────────────── */}
          {TEXT_GROUPS.map(group => (
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
                      <label className="block text-[10px] uppercase tracking-[0.15em] text-[#999999] mb-2">{label}</label>
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
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <button
                            onClick={() => handleSave(key)}
                            disabled={!dirty || isSaving}
                            className={`flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors ${
                              isSaved ? 'bg-green-600 text-white'
                                : dirty ? 'bg-black text-white hover:bg-[#333]'
                                : 'bg-[#F5F5F5] text-[#BDBDBD] cursor-not-allowed'
                            }`}
                          >
                            {isSaving ? <RefreshCw size={13} className="animate-spin" />
                              : isSaved ? <span>Saved ✓</span>
                              : <><Save size={13} /><span>Save</span></>}
                          </button>
                          {saveError[key] && (
                            <span className="text-[10px] text-red-500">{saveError[key]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* ── SECTION VISIBILITY TOGGLES ────────────────────────────────── */}
          <div className="bg-white border border-[#EAEAEA]">
            <div className="px-6 py-4 border-b border-[#EAEAEA]">
              <h2 className="font-serif text-[18px] italic font-light">Section Visibility</h2>
              <p className="text-[11px] text-[#999] mt-1">Toggle homepage sections on or off. Categories and Newsletter are always shown.</p>
            </div>
            <div className="divide-y divide-[#F5F5F5]">
              {['marquee','sale_banner','new_arrivals','editorial','brands','features'].map(id => {
                const key = `show_${id}`;
                const isOn = (settings[key]?.value ?? 'true') === 'true';
                const isSaving = saving[key];
                const isSaved = saved[key];
                return (
                  <div key={id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-light">{SECTION_LABELS[id]}</p>
                      <p className="text-[11px] text-[#999]">{isOn ? 'Visible on storefront' : 'Hidden from storefront'}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(key)}
                      disabled={isSaving}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${isOn ? 'bg-black' : 'bg-[#EAEAEA]'} ${isSaving ? 'opacity-50' : ''}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isOn ? 'translate-x-7' : 'translate-x-1'}`} />
                      {isSaved && <span className="absolute -top-5 right-0 text-[10px] text-green-600 whitespace-nowrap">Saved ✓</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── HOMEPAGE LAYOUT ORDER ──────────────────────────────────────── */}
          <div className="bg-white border border-[#EAEAEA]">
            <div className="px-6 py-4 border-b border-[#EAEAEA]">
              <h2 className="font-serif text-[18px] italic font-light">Homepage Layout</h2>
              <p className="text-[11px] text-[#999] mt-1">Drag the sections into any order. Hero is always at the top.</p>
            </div>
            <div className="divide-y divide-[#F5F5F5]">
              {sectionOrder.map((id, idx) => (
                <div key={id} className="px-6 py-3.5 flex items-center gap-4">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveSection(idx, -1)}
                      disabled={idx === 0}
                      className={`p-0.5 transition-colors ${idx === 0 ? 'text-[#E0E0E0] cursor-not-allowed' : 'text-[#999] hover:text-black'}`}
                    ><ChevronUp size={16} /></button>
                    <button
                      onClick={() => moveSection(idx, 1)}
                      disabled={idx === sectionOrder.length - 1}
                      className={`p-0.5 transition-colors ${idx === sectionOrder.length - 1 ? 'text-[#E0E0E0] cursor-not-allowed' : 'text-[#999] hover:text-black'}`}
                    ><ChevronDown size={16} /></button>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-[11px] text-[#BDBDBD] font-mono w-5">{idx + 1}</span>
                    <span className="text-[13px] font-light">{SECTION_LABELS[id] ?? id}</span>
                    {FIXED_SECTIONS.has(id) && (
                      <span className="text-[10px] uppercase tracking-[0.1em] text-[#BDBDBD] border border-[#EAEAEA] px-2 py-0.5">Always shown</span>
                    )}
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    FIXED_SECTIONS.has(id) ? 'bg-black' :
                    (settings[`show_${id}`]?.value ?? 'true') === 'true' ? 'bg-green-500' : 'bg-[#E0E0E0]'
                  }`} />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-[#EAEAEA] flex items-center justify-between">
              <p className="text-[11px] text-[#999]">
                {orderSaved ? '✓ Order saved and live' : 'Click Save Layout to apply the new order'}
              </p>
              <button
                onClick={saveOrder}
                disabled={orderSaving}
                className={`flex items-center gap-2 px-6 py-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors ${
                  orderSaved ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-[#333]'
                }`}
              >
                {orderSaving ? <RefreshCw size={13} className="animate-spin" /> : orderSaved ? <span>Saved ✓</span> : <><Save size={13} /><span>Save Layout</span></>}
              </button>
            </div>
          </div>

        </div>
      )}
    </AdminLayout>
  );
}
