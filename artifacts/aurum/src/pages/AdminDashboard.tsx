import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout, adminFetch } from '../components/AdminLayout';
import { Package, Mail, ShoppingBag, DollarSign, TrendingUp, Clock } from 'lucide-react';

interface Stats {
  products: number;
  subscribers: number;
  orders: number;
  revenue: number;
  recentOrders: any[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Products', value: stats?.products ?? '—', icon: Package, color: 'text-black' },
    { label: 'Newsletter Subscribers', value: stats?.subscribers ?? '—', icon: Mail, color: 'text-black' },
    { label: 'Total Orders', value: stats?.orders ?? '—', icon: ShoppingBag, color: 'text-black' },
    { label: 'Total Revenue', value: stats ? `$${stats.revenue.toLocaleString()}` : '—', icon: DollarSign, color: 'text-black' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white border border-[#EAEAEA] p-6"
              >
                <div className="flex items-start justify-between mb-6">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-[#999999]">{card.label}</p>
                  <card.icon size={18} strokeWidth={1.5} className="text-[#BDBDBD]" />
                </div>
                <p className="font-serif text-[32px] italic font-light">{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black text-white p-6 flex flex-col">
              <TrendingUp size={20} strokeWidth={1.5} className="mb-6 opacity-60" />
              <p className="text-[11px] uppercase tracking-[0.15em] opacity-60 mb-2">This Month</p>
              <p className="font-serif text-[24px] italic font-light">SS26 Collection</p>
              <p className="text-[12px] mt-2 opacity-60">5 new arrivals added</p>
            </div>
            <div className="bg-white border border-[#EAEAEA] p-6 flex flex-col">
              <Clock size={20} strokeWidth={1.5} className="mb-6 text-[#BDBDBD]" />
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#999999] mb-2">Pending Orders</p>
              <p className="font-serif text-[24px] italic font-light">
                {stats?.recentOrders?.filter(o => o.status === 'pending').length ?? 0}
              </p>
              <p className="text-[12px] mt-2 text-[#999999]">Need attention</p>
            </div>
            <div className="bg-white border border-[#EAEAEA] p-6 flex flex-col">
              <Mail size={20} strokeWidth={1.5} className="mb-6 text-[#BDBDBD]" />
              <p className="text-[11px] uppercase tracking-[0.15em] text-[#999999] mb-2">Inner Circle</p>
              <p className="font-serif text-[24px] italic font-light">{stats?.subscribers ?? 0}</p>
              <p className="text-[12px] mt-2 text-[#999999]">Active subscribers</p>
            </div>
          </div>

          {/* Recent orders */}
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="bg-white border border-[#EAEAEA]">
              <div className="px-6 py-4 border-b border-[#EAEAEA] flex items-center justify-between">
                <h2 className="font-serif text-[18px] italic font-light">Recent Orders</h2>
                <a href="/admin/orders" className="text-[11px] uppercase tracking-[0.1em] text-[#999999] hover:text-black transition-colors">
                  View all →
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#EAEAEA]">
                      {['Order', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.15em] text-[#999999] font-normal">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order: any) => (
                      <tr key={order.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-6 py-4 text-[12px] font-mono">{order.order_number}</td>
                        <td className="px-6 py-4 text-[13px]">{order.first_name} {order.last_name}</td>
                        <td className="px-6 py-4 text-[13px]">${parseFloat(order.total).toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-[10px] uppercase tracking-[0.1em] rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[12px] text-[#999999]">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#EAEAEA] p-12 text-center">
              <ShoppingBag size={32} strokeWidth={1} className="mx-auto mb-4 text-[#EAEAEA]" />
              <p className="font-serif text-[20px] italic text-[#999999]">No orders yet</p>
              <p className="text-[12px] text-[#BDBDBD] mt-2">Orders will appear here once customers complete checkout</p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
