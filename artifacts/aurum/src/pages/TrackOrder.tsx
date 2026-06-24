import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type OrderStatus = 'confirmed' | 'processing' | 'dispatched' | 'delivered';

interface OrderResult {
  id: string;
  customer: string;
  date: string;
  status: OrderStatus;
  items: { name: string; qty: number; image?: string }[];
  estimated: string;
}

const STATUS_STAGES: { key: OrderStatus; label: string }[] = [
  { key: 'confirmed', label: 'Order Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'dispatched', label: 'Dispatched' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_ORDER: OrderStatus[] = ['confirmed', 'processing', 'dispatched', 'delivered'];

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setNotFound(false);
    setResult(null);

    try {
      const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
      const res = await fetch(`${BASE}/api/orders/${orderId.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setResult({
          id: data.order_number || orderId,
          customer: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Customer',
          date: data.created_at ? new Date(data.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }) : '—',
          status: (data.status as OrderStatus) || 'confirmed',
          items: (data.items || []).map((i: any) => ({ name: i.name, qty: i.qty || 1 })),
          estimated: '3–5 business days',
        });
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const currentStageIndex = result ? STATUS_ORDER.indexOf(result.status) : -1;

  return (
    <div className="w-full min-h-[100dvh] pt-[120px] pb-24 bg-white text-black">
      <div className="max-w-[700px] mx-auto px-8">

        <div className="text-center mb-16">
          <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[11px] tracking-[0.3em] uppercase text-black/40 mb-4">Order Status</p>
          <h1 style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[clamp(36px,5vw,64px)] italic font-light leading-[1.1] tracking-[-0.01em]">Track Your Order</h1>
          <div className="w-12 h-[1px] bg-black/20 mx-auto mt-6" />
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-0 mb-16 border border-black/10 focus-within:border-black transition-colors">
          <input
            type="text"
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            placeholder="Enter your Order ID (e.g. LKW-XXXXXX)"
            style={{ fontFamily: 'var(--font-body)' }}
            className="flex-1 px-6 py-4 text-[13px] outline-none placeholder:text-black/30 bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.2em' }}
            className="bg-black text-white px-8 py-4 text-[11px] uppercase font-[500] hover:bg-[#333] transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {loading ? 'Searching…' : 'Track'}
          </button>
        </form>

        <AnimatePresence>
          {notFound && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-12 border border-[#EAEAEA]">
              <p style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[22px] italic font-light text-black/50 mb-3">Order not found</p>
              <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-black/40">No order found with this ID. Please check and try again.</p>
            </motion.div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

              {/* Timeline */}
              <div>
                <div className="flex items-start justify-between relative">
                  <div className="absolute top-4 left-4 right-4 h-[1px] bg-[#EAEAEA] z-0" />
                  {STATUS_STAGES.map((stage, i) => {
                    const isCompleted = i <= currentStageIndex;
                    const isCurrent = i === currentStageIndex;
                    return (
                      <div key={stage.key} className="flex flex-col items-center relative z-10 flex-1">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all mb-3 ${
                          isCompleted ? 'bg-black border-black' : 'bg-white border-[#EAEAEA]'
                        } ${isCurrent ? 'ring-2 ring-black ring-offset-2' : ''}`}>
                          {isCompleted && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="2,6 5,9 10,3"/>
                            </svg>
                          )}
                        </div>
                        <p style={{ fontFamily: 'var(--font-smallcaps)' }} className={`text-[9px] tracking-[0.15em] uppercase text-center leading-snug ${isCompleted ? 'text-black' : 'text-black/30'}`}>
                          {stage.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Details */}
              <div className="border border-[#EAEAEA] p-8">
                <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-[#EAEAEA]">
                  {[
                    { label: 'Order ID', val: result.id },
                    { label: 'Customer', val: result.customer },
                    { label: 'Order Date', val: result.date },
                    { label: 'Estimated Delivery', val: result.estimated },
                  ].map(row => (
                    <div key={row.label}>
                      <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[10px] tracking-[0.2em] uppercase text-black/40 mb-1">{row.label}</p>
                      <p style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] font-light">{row.val}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[10px] tracking-[0.2em] uppercase text-black/40 mb-4">Items Ordered</p>
                  <div className="flex flex-col gap-3">
                    {result.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b border-[#F5F5F5] last:border-0">
                        <p style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] font-light">{item.name}</p>
                        <p style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-black/40">Qty: {item.qty}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
