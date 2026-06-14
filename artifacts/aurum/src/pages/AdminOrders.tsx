import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminLayout, adminFetch } from '../components/AdminLayout';
import { Search, ShoppingBag, MapPin, Mail, Phone, CreditCard, Globe, ChevronDown, ChevronUp } from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  country: string;
  zip: string;
  phone?: string;
  payment_method: string;
  items: any[];
  subtotal: string;
  shipping: string;
  total: string;
  notes?: string;
  status: string;
  customer_ip?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const paymentLabels: Record<string, string> = {
  cod: 'Cash on Delivery',
  bank: 'Bank / Card',
  jazzcash: 'JazzCash / EasyPaisa',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    adminFetch('/api/admin/orders')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase()) ||
    `${o.first_name} ${o.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (o.phone || '').includes(search)
  );

  const updateStatus = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await adminFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total || '0'), 0);

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-[1px] bg-[#EAEAEA]">
          {[
            { label: 'Total Orders', value: orders.length },
            { label: 'Pending', value: orders.filter(o => o.status === 'pending').length },
            { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
            { label: 'Revenue', value: `PKR ${totalRevenue.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white px-6 py-4">
              <div className="text-[22px] font-light mb-1">{value}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#999999]">{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-[360px]">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BDBDBD]" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order #, name, email, phone..."
              className="w-full border border-[#EAEAEA] pl-10 pr-4 py-3 text-[13px] focus:border-black outline-none transition-colors bg-white"
            />
          </div>
          <p className="text-[12px] text-[#999999]">{filtered.length} orders</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#EAEAEA] p-16 text-center">
            <ShoppingBag size={32} strokeWidth={1} className="mx-auto mb-4 text-[#EAEAEA]" />
            <p className="font-serif text-[20px] italic text-[#999999]">No orders yet</p>
            <p className="text-[12px] text-[#BDBDBD] mt-2">Customer orders will appear here</p>
          </div>
        ) : (
          <div className="bg-white border border-[#EAEAEA] divide-y divide-[#F5F5F5]">
            {filtered.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>

                {/* Row */}
                <div
                  className="px-6 py-4 hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-5 flex-wrap">
                      <span className="text-[12px] font-mono font-medium text-black">{order.order_number}</span>
                      <span className="text-[13px]">{order.first_name} {order.last_name}</span>
                      <span className="text-[12px] text-[#999999] hidden md:block">{order.email}</span>
                      {order.phone && <span className="text-[12px] text-[#999999] hidden lg:block">{order.phone}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-medium text-black">PKR {parseFloat(order.total).toLocaleString()}</span>
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] border rounded-sm ${statusColors[order.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {order.status}
                      </span>
                      <span className="text-[11px] text-[#999999]">
                        {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {expandedId === order.id
                        ? <ChevronUp size={14} className="text-[#999]" />
                        : <ChevronDown size={14} className="text-[#999]" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === order.id && (
                  <div className="px-6 pb-6 bg-[#FAFAFA] border-t border-[#EAEAEA]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">

                      {/* Customer Info */}
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-3 font-medium">Customer Details</p>
                        <div className="flex items-start gap-2 text-[13px]">
                          <Mail size={13} className="text-[#999] mt-0.5 shrink-0" strokeWidth={1.5} />
                          <span>{order.email}</span>
                        </div>
                        {order.phone && (
                          <div className="flex items-center gap-2 text-[13px]">
                            <Phone size={13} className="text-[#999] shrink-0" strokeWidth={1.5} />
                            <span>{order.phone}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2 text-[13px]">
                          <MapPin size={13} className="text-[#999] mt-0.5 shrink-0" strokeWidth={1.5} />
                          <span className="leading-[1.7]">
                            {order.first_name} {order.last_name}<br />
                            {order.address}<br />
                            {order.city}, {order.zip}<br />
                            {order.country}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px]">
                          <CreditCard size={13} className="text-[#999] shrink-0" strokeWidth={1.5} />
                          <span>{paymentLabels[order.payment_method] || order.payment_method}</span>
                        </div>
                        {order.customer_ip && (
                          <div className="flex items-center gap-2 text-[12px] text-[#999]">
                            <Globe size={12} className="shrink-0" strokeWidth={1.5} />
                            <span>IP: {order.customer_ip}</span>
                          </div>
                        )}
                        {order.notes && (
                          <div className="mt-2 p-3 bg-amber-50 border border-amber-100 text-[12px] text-amber-800 rounded">
                            <span className="font-medium">Note: </span>{order.notes}
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-3 font-medium">Items Ordered</p>
                        <div className="space-y-2.5">
                          {(Array.isArray(order.items) ? order.items : []).map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-[13px]">
                              <div>
                                <span className="text-black">{item.name}</span>
                                <span className="text-[#999] ml-2">· {item.sku} · Size {item.size} × {item.qty}</span>
                              </div>
                              <span className="font-medium shrink-0 ml-4">PKR {(item.price * item.qty).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-[#EAEAEA] space-y-1.5">
                          <div className="flex justify-between text-[12px] text-[#666]">
                            <span>Subtotal</span>
                            <span>PKR {parseFloat(order.subtotal).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[12px] text-[#666]">
                            <span>Shipping</span>
                            <span>{parseFloat(order.shipping) === 0 ? 'Complimentary' : `PKR ${parseFloat(order.shipping).toLocaleString()}`}</span>
                          </div>
                          <div className="flex justify-between text-[14px] font-medium pt-1">
                            <span>Total</span>
                            <span>PKR {parseFloat(order.total).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Update */}
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-3 font-medium">Update Status</p>
                        <div className="flex flex-col gap-2">
                          {statuses.map(s => (
                            <button
                              key={s}
                              onClick={(e) => { e.stopPropagation(); updateStatus(order.id, s); }}
                              disabled={updatingId === order.id}
                              className={`px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors text-left ${
                                order.status === s
                                  ? 'bg-black text-white'
                                  : 'border border-[#EAEAEA] hover:border-black hover:bg-white'
                              } disabled:opacity-50`}
                            >
                              {updatingId === order.id && order.status !== s ? '...' : s}
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-[#BDBDBD] mt-3">
                          Last updated: {new Date(order.updated_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
