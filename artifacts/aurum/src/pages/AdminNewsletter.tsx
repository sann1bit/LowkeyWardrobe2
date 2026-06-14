import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout, adminFetch } from '../components/AdminLayout';
import { Search, Download, Mail } from 'lucide-react';

interface Subscriber {
  id: number;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminFetch('/api/admin/newsletter')
      .then(r => r.json())
      .then(data => {
        setSubscribers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const csv = ['Email,Status,Joined', ...filtered.map(s =>
      `${s.email},${s.isActive ? 'Active' : 'Inactive'},${new Date(s.createdAt).toLocaleDateString()}`
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aurum-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Newsletter">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-[320px]">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BDBDBD]" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search subscribers..."
              className="w-full border border-[#EAEAEA] pl-10 pr-4 py-3 text-[13px] focus:border-black outline-none transition-colors bg-white"
            />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[12px] text-[#999999]">{filtered.length} subscribers</p>
            <button
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 border border-[#EAEAEA] px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] hover:border-black transition-colors disabled:opacity-40"
            >
              <Download size={13} strokeWidth={1.5} />
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#EAEAEA] p-16 text-center">
            <Mail size={32} strokeWidth={1} className="mx-auto mb-4 text-[#EAEAEA]" />
            <p className="font-serif text-[20px] italic text-[#999999]">No subscribers yet</p>
            <p className="text-[12px] text-[#BDBDBD] mt-2">Newsletter signups will appear here</p>
          </div>
        ) : (
          <div className="bg-white border border-[#EAEAEA]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
                  {['#', 'Email', 'Status', 'Joined'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[10px] uppercase tracking-[0.15em] text-[#999999] font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] transition-colors"
                  >
                    <td className="px-6 py-4 text-[12px] text-[#999999]">{i + 1}</td>
                    <td className="px-6 py-4 text-[13px]">{s.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-[#999999]">
                      {new Date(s.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
