import { motion, AnimatePresence } from 'framer-motion';
import { useListProducts, useSubscribeNewsletter } from '@workspace/api-client-react';
import { products as hardcodedProducts } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { useUIStore } from '../stores/uiStore';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';

const DEFAULT_ORDER = ['marquee','categories','sale_banner','new_arrivals','editorial','brands','features','newsletter'];

function TruckIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="8" width="18" height="14" rx="1"/>
      <path d="M19 12h5l4 5v5h-9V12z"/>
      <circle cx="7" cy="23" r="2.5"/>
      <circle cx="24" cy="23" r="2.5"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3L4 8v7c0 7 5.3 12.3 12 14 6.7-1.7 12-7 12-14V8L16 3z"/>
      <polyline points="11,16 14.5,19.5 21,13"/>
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7a11 11 0 1 1-9.5 5.5"/>
      <polyline points="21 3 21 8 16 8"/>
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="26" height="6" rx="1"/>
      <rect x="5" y="17" width="22" height="12" rx="1"/>
      <line x1="16" y1="11" x2="16" y2="29"/>
      <path d="M16 11c0-3 2-5 4-5s3 2 1 4c-1 1-4 1-5 1z"/>
      <path d="M16 11c0-3-2-5-4-5s-3 2-1 4c1 1 4 1 5 1z"/>
    </svg>
  );
}

function useCountdown(targetDate: Date) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Home() {
  const { data: apiProducts } = useListProducts();
  const { mutate: subscribe } = useSubscribeNewsletter();
  const { showToast } = useUIStore();
  const [email, setEmail] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [, setLocation] = useLocation();
  const [s, setS] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setS).catch(() => {});
  }, []);

  const displayProducts = apiProducts && apiProducts.length > 0 ? apiProducts : hardcodedProducts;
  const newArrivals = displayProducts.filter(p => p.badge === 'new').slice(0, 4);
  const filteredArrivals = activeTab === 'all'
    ? newArrivals
    : newArrivals.filter(p => p.category === activeTab);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribe({ data: { email } }, {
        onSuccess: () => { showToast('Welcome to the inner circle ✓'); setEmail(''); },
        onError: () => { showToast('Welcome to the inner circle ✓'); setEmail(''); }
      });
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'accessories', label: 'Accessories' }
  ];

  const slides = [
    { image: '/hero-1.png', eyebrow: s.hero_1_eyebrow || 'SS26 Collection', line1: s.hero_1_line1 || 'Be Seen', line2: s.hero_1_line2 || 'Be Remembered', primaryHref: '/products', secondaryHref: '/products?category=new' },
    { image: '/hero-2.png', eyebrow: s.hero_2_eyebrow || 'New Arrivals', line1: s.hero_2_line1 || 'Luxury is a Feeling', line2: s.hero_2_line2 || 'We Make it Real', primaryHref: '/products?category=shoes', secondaryHref: '/products?category=new' },
    { image: '/hero-3.png', eyebrow: s.hero_3_eyebrow || 'Heritage', line1: s.hero_3_line1 || 'Less Noise', line2: s.hero_3_line2 || 'Pure Class.', primaryHref: '/products?category=clothing', secondaryHref: '/products?category=new' },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 4800);
    return () => clearInterval(timer);
  }, []);

  const saleEndDate = new Date(s.sale_end_date || '2026-08-01T00:00:00');
  const countdown = useCountdown(saleEndDate);

  const sectionOrder: string[] = (() => {
    try { const arr = JSON.parse(s.home_section_order || '[]'); return Array.isArray(arr) && arr.length > 0 ? arr : DEFAULT_ORDER; }
    catch { return DEFAULT_ORDER; }
  })();

  const visible = (key: string) => s[`show_${key}`] !== 'false';

  const renderSection = (id: string) => {
    switch (id) {

      case 'marquee':
        if (!visible('marquee')) return null;
        return (
          <div key="marquee" className="bg-black text-white py-3.5 overflow-hidden flex whitespace-nowrap">
            <div className="animate-marquee inline-block">
              {[1, 2, 3].map(i => (
                <span key={i} style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[11px] tracking-[0.2em] uppercase mx-4">
                  {s.marquee_text || 'Free shipping on orders over PKR 15,000 · Complimentary gift wrapping · SS26 Collection — Now Available · 7-day returns · Exclusive member benefits ·'}
                </span>
              ))}
            </div>
          </div>
        );

      case 'categories':
        return (
          <section key="categories" className="grid grid-cols-1 md:grid-cols-4 gap-[1px] bg-[#EAEAEA]">
            {/* Clothing */}
            <div onClick={() => setLocation('/products?category=clothing')}
              className="group cursor-pointer relative md:col-span-2 min-h-[520px] bg-white flex flex-col p-10 lg:p-14 overflow-hidden">
              <img src="/category-clothing.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-60 group-hover:scale-[1.06] transition-transform duration-500 ease-in-out select-none pointer-events-none" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-white/10 pointer-events-none group-hover:from-white/70 transition-all duration-500" />
              <div className="absolute top-0 left-0 h-[1px] bg-black w-0 group-hover:w-full transition-all duration-700 ease-out z-10" />
              <div className="relative z-10 flex items-center justify-between mb-auto">
                <span style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[11px] italic text-black/20 tracking-[0.05em]">01</span>
                <span style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[9px] uppercase tracking-[0.4em] text-black/25">Clothing</span>
              </div>
              <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
                <div className="h-[1px] bg-black/8 mb-10 w-full" />
                <h2 style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[clamp(60px,7vw,108px)] italic font-light leading-[0.92] tracking-[-0.02em] text-black group-hover:translate-x-1.5 transition-transform duration-700 ease-out">Clothing</h2>
                <div className="h-[1px] bg-black/8 mt-10 w-full" />
              </div>
              <div className="relative z-10 flex items-end justify-between mt-auto">
                <div>
                  <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[9px] uppercase tracking-[0.3em] text-black/30 mb-3">Menswear · Womenswear · Unisex</p>
                  <div style={{ fontFamily: 'var(--font-body)' }} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-black font-[500]">
                    <span className="border-b border-black/20 pb-0.5 group-hover:border-black transition-colors duration-300">Explore Collection</span>
                    <span className="group-hover:translate-x-2 transition-transform duration-400">→</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-[1px] bg-black w-0 group-hover:w-full transition-all duration-700 ease-out delay-100 z-10" />
            </div>

            {/* Shoes */}
            <div onClick={() => setLocation('/products?category=shoes')}
              className="group cursor-pointer relative min-h-[520px] bg-[#0a0a0a] flex flex-col p-10 lg:p-12 overflow-hidden">
              <img src="/category-shoes.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-55 group-hover:scale-[1.06] transition-transform duration-500 ease-in-out select-none pointer-events-none" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 pointer-events-none" />
              <div className="absolute top-0 left-0 h-[1px] bg-white w-0 group-hover:w-full transition-all duration-700 ease-out z-10" />
              <div className="relative z-10 flex items-center justify-between mb-auto">
                <span style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[11px] italic text-white/20 tracking-[0.05em]">02</span>
                <span style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[9px] uppercase tracking-[0.4em] text-white/25">Shoes</span>
              </div>
              <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
                <div className="h-[1px] bg-white/8 mb-10 w-full" />
                <h2 style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[clamp(60px,5vw,90px)] italic font-light leading-[0.92] tracking-[-0.02em] text-white group-hover:translate-x-1.5 transition-transform duration-700 ease-out">Shoes</h2>
                <div className="h-[1px] bg-white/8 mt-10 w-full" />
              </div>
              <div className="relative z-10 flex items-end justify-between mt-auto">
                <div>
                  <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[9px] uppercase tracking-[0.3em] text-white/25 mb-3">Menswear · Womenswear · Unisex</p>
                  <div style={{ fontFamily: 'var(--font-body)' }} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white font-[500]">
                    <span className="border-b border-white/20 pb-0.5 group-hover:border-white transition-colors duration-300">Step Forward</span>
                    <span className="group-hover:translate-x-2 transition-transform duration-400">→</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-[1px] bg-white w-0 group-hover:w-full transition-all duration-700 ease-out delay-100 z-10" />
            </div>

            {/* Accessories */}
            <div onClick={() => setLocation('/products?category=accessories')}
              className="group cursor-pointer relative min-h-[520px] bg-[#F4F4F4] flex flex-col p-10 lg:p-12 overflow-hidden">
              <img src="/category-accessories.png" alt="" className="absolute inset-0 w-full h-full object-cover object-center opacity-60 group-hover:scale-[1.06] transition-transform duration-500 ease-in-out select-none pointer-events-none" draggable={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#F4F4F4]/95 via-[#F4F4F4]/30 to-[#F4F4F4]/10 pointer-events-none" />
              <div className="absolute top-0 left-0 h-[1px] bg-black w-0 group-hover:w-full transition-all duration-700 ease-out z-10" />
              <div className="relative z-10 flex items-center justify-between mb-auto">
                <span style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[11px] italic text-black/20 tracking-[0.05em]">03</span>
                <span style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[9px] uppercase tracking-[0.4em] text-black/25">Accessories</span>
              </div>
              <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
                <div className="h-[1px] bg-black/8 mb-10 w-full" />
                <h2 style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[clamp(40px,4vw,68px)] italic font-light leading-[0.92] tracking-[-0.02em] text-black group-hover:translate-x-1.5 transition-transform duration-700 ease-out">Acces&shy;sories</h2>
                <div className="h-[1px] bg-black/8 mt-10 w-full" />
              </div>
              <div className="relative z-10 flex items-end justify-between mt-auto">
                <div>
                  <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[9px] uppercase tracking-[0.3em] text-black/30 mb-3">Menswear · Womenswear · Unisex</p>
                  <div style={{ fontFamily: 'var(--font-body)' }} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-black font-[500]">
                    <span className="border-b border-black/20 pb-0.5 group-hover:border-black transition-colors duration-300">The Details</span>
                    <span className="group-hover:translate-x-2 transition-transform duration-400">→</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 h-[1px] bg-black w-0 group-hover:w-full transition-all duration-700 ease-out delay-100 z-10" />
            </div>
          </section>
        );

      case 'sale_banner':
        if (!visible('sale_banner')) return null;
        return (
          <section key="sale_banner" onClick={() => setLocation('/products?category=sale')}
            className="cursor-pointer group relative bg-black text-white py-16 flex items-center justify-center overflow-hidden mt-[1px]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span style={{ fontFamily: 'var(--font-display-upright)' }} className="text-[clamp(80px,14vw,200px)] font-[400] text-white/[0.04] select-none whitespace-nowrap tracking-[0.05em]">SALE SALE SALE</span>
            </div>
            <div className="relative z-10 text-center flex flex-col items-center">
              <h2 style={{ fontFamily: 'var(--font-display-italic)' }} className="italic font-light mb-6 text-[clamp(42px,6vw,88px)] tracking-[-0.02em]">
                {s.sale_banner_text || 'Up to 60% off'}
              </h2>
              {/* Countdown */}
              <div className="flex items-center gap-6 mb-8">
                {[
                  { label: 'Days', val: countdown.days },
                  { label: 'Hours', val: countdown.hours },
                  { label: 'Mins', val: countdown.minutes },
                  { label: 'Secs', val: countdown.seconds },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center gap-6">
                    <div className="text-center">
                      <div style={{ fontFamily: 'var(--font-display-upright)' }} className="text-[clamp(28px,3.5vw,48px)] font-[400] leading-none">
                        {String(item.val).padStart(2, '0')}
                      </div>
                      <div style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[9px] tracking-[0.2em] text-white/40 uppercase mt-1">{item.label}</div>
                    </div>
                    {i < 3 && <span className="text-white/30 text-[24px] font-light -mt-2">:</span>}
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-body)' }} className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] font-[500] group-hover:text-[#EAEAEA] transition-colors">
                <span>Shop Archive</span>
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </div>
            </div>
          </section>
        );

      case 'new_arrivals':
        if (!visible('new_arrivals')) return null;
        return (
          <section key="new_arrivals" className="py-24 px-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
              <h2 style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[clamp(36px,4vw,64px)] italic font-light leading-[1.1] tracking-[-0.01em]">
                {s.new_arrivals_title || 'New Arrivals'}
              </h2>
              <div className="flex gap-6 border-b border-[#EAEAEA] pb-4 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    style={{ fontFamily: 'var(--font-body)' }}
                    className={`text-[11px] uppercase tracking-[0.15em] font-[500] whitespace-nowrap transition-colors relative ${activeTab === tab.id ? 'text-black' : 'text-[#999999] hover:text-black'}`}>
                    {tab.label}
                    {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute -bottom-[17px] left-0 right-0 h-[1px] bg-black" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-[#EAEAEA] border border-[#EAEAEA]">
              {filteredArrivals.map(product => (
                <div key={product.id} className="bg-white"><ProductCard product={product as any} /></div>
              ))}
            </div>
            <div className="mt-16 flex justify-center">
              <Link href="/products">
                <button style={{ fontFamily: 'var(--font-body)' }} className="border border-black px-10 py-4 text-[11px] uppercase tracking-[0.18em] font-[400] hover:bg-black hover:text-white transition-colors duration-300">
                  {s.new_arrivals_cta || 'View All Products'}
                </button>
              </Link>
            </div>
          </section>
        );

      case 'editorial':
        if (!visible('editorial')) return null;
        return (
          <section key="editorial" className="my-20 mx-8 grid grid-cols-1 lg:grid-cols-2 gap-[2px] min-h-[600px] bg-white">
            <div className="relative p-12 lg:p-20 flex flex-col justify-end group cursor-pointer overflow-hidden min-h-[400px] bg-[#F0F0F0]">
              <span style={{ fontFamily: 'var(--font-smallcaps)' }} className="absolute top-10 left-12 text-[10px] uppercase tracking-[0.2em] font-medium border border-black/10 px-3 py-1 bg-white/50 backdrop-blur-sm">Editorial</span>
              <div className="relative z-10">
                <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[11px] uppercase tracking-[0.2em] text-[#666666] mb-4">The Edit</p>
                <h3 style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[38px] italic leading-[1.1] mb-6 max-w-[400px] font-light">Autumn Winter Collection 2026</h3>
                <div style={{ fontFamily: 'var(--font-body)' }} className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] font-[500]">
                  <span className="border-b border-black pb-1">Explore the look</span>
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </div>
            </div>
            <div className="grid grid-rows-2 gap-[2px]">
              <div className="bg-[#1A1A1A] text-white p-12 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent z-10" />
                <div className="relative z-20">
                  <h3 style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[28px] italic leading-[1.2] max-w-[300px] mb-4 text-[#F5F5F5] font-light">Sustainably sourced, meticulously made</h3>
                  <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] font-light text-white/60 max-w-[280px] leading-[1.85]">We believe true luxury honors both the craft and the environment.</p>
                </div>
              </div>
              <div className="bg-[#EAEAEA] p-12 flex flex-col justify-center relative overflow-hidden group cursor-pointer">
                <div className="relative z-20">
                  <h3 style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[28px] italic leading-[1.2] max-w-[300px] mb-6 font-light">Exclusive access to private sales</h3>
                  <div style={{ fontFamily: 'var(--font-body)' }} className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] font-[500]">
                    <span className="border-b border-black pb-1">Join Us</span>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'brands':
        if (!visible('brands')) return null;
        return (
          <section key="brands" className="py-20 border-y border-[#EAEAEA] overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-8 flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-4">
              {["Maison Noir", "Vesti Arte", "Luxe & Co", "Forma", "Atelier M", "Essence"].map(brand => (
                <span key={brand} style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[18px] md:text-[22px] font-light italic tracking-[0.05em] opacity-25 hover:opacity-60 transition-opacity cursor-pointer whitespace-nowrap">{brand}</span>
              ))}
            </div>
          </section>
        );

      case 'features':
        if (!visible('features')) return null;
        return (
          <section key="features" className="py-32 px-8 max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              {[
                { icon: <TruckIcon />, title: 'Free Shipping', desc: `Complimentary delivery on all orders over PKR ${Number(s.free_shipping_threshold || 15000).toLocaleString()}` },
                { icon: <ShieldIcon />, title: 'Authenticity Guaranteed', desc: 'Every piece is verified and certified before delivery' },
                { icon: <RefreshIcon />, title: '30-Day Returns', desc: 'Hassle-free returns within 30 days, no questions asked' },
                { icon: <GiftIcon />, title: 'Luxury Packaging', desc: 'Beautifully packaged in our signature gift boxes' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 border border-[#EAEAEA] flex items-center justify-center mb-6 text-black">{icon}</div>
                  <h4 style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[12px] tracking-[0.15em] uppercase font-[500] mb-3">{title}</h4>
                  <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-[#999999] font-light leading-[1.85] max-w-[240px]">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'newsletter':
        return (
          <section key="newsletter" className="bg-black text-white py-32 px-8 flex flex-col items-center text-center">
            <span style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-6">Stay Connected</span>
            <h2 style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[clamp(36px,4vw,64px)] italic font-light mb-6 tracking-[-0.01em]">The Inner Circle</h2>
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] font-light text-white/70 max-w-[420px] mb-10 leading-[1.85]">
              {s.newsletter_tagline || 'First access to new collections, exclusive events, and members-only offers.'}
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-[480px] border border-white/20 focus-within:border-white transition-colors">
              <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required style={{ fontFamily: 'var(--font-body)' }} className="flex-1 bg-transparent px-6 py-4 text-[13px] outline-none placeholder:text-white/30" />
              <button type="submit" style={{ fontFamily: 'var(--font-body)' }} className="bg-white text-black px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-[500] hover:bg-[#EAEAEA] transition-colors">Subscribe</button>
            </form>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white text-black min-h-[100dvh] pt-[64px]">

      {/* HERO SLIDESHOW */}
      <section className="relative h-[calc(100vh-64px)] min-h-[600px] overflow-hidden bg-black">
        <AnimatePresence mode="sync">
          <motion.div key={currentSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: 'easeInOut' }} className="absolute inset-0">
            <img src={slides[currentSlide].image} alt="" className="w-full h-full object-cover object-top" draggable={false} />
            <div className="absolute inset-0 bg-black/55" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6 z-10">
          <AnimatePresence mode="wait">
            <motion.div key={`txt-${currentSlide}`} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }} className="flex flex-col items-center">
              <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[clamp(10px,1.2vw,13px)] font-[500] tracking-[0.25em] uppercase mb-6 text-white/75">
                {slides[currentSlide].eyebrow}
              </p>
              <h1 className="leading-none mb-10">
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(50px,7.5vw,108px)', lineHeight: 0.95, letterSpacing: '-0.01em', color: '#FFFFFF', display: 'block', marginBottom: '4px' }}>
                  {slides[currentSlide].line1}
                </span>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'normal', fontWeight: 500, fontSize: 'clamp(52px,7.8vw,112px)', lineHeight: 1.0, letterSpacing: '0.01em', color: '#FFFFFF', display: 'block' }}>
                  {slides[currentSlide].line2}
                </span>
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={slides[currentSlide].primaryHref}>
                  <button style={{ fontFamily: 'var(--font-body)', fontWeight: 500, letterSpacing: '0.2em' }} className="relative overflow-hidden bg-white text-black border border-white px-10 py-3.5 text-[11px] uppercase transition-all duration-300 min-w-[180px] hover:bg-black hover:text-white group">
                    {s.hero_cta_primary || 'Shop Collection'}
                  </button>
                </Link>
                <Link href={slides[currentSlide].secondaryHref}>
                  <button style={{ fontFamily: 'var(--font-body)', fontWeight: 400, letterSpacing: '0.18em' }} className="border border-white text-white hover:bg-white hover:text-black px-10 py-3.5 text-[11px] uppercase transition-all duration-300 min-w-[180px]">
                    {s.hero_cta_secondary || 'New Arrivals'}
                  </button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thin horizontal progress bar indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="h-[2px] transition-all duration-400"
              style={{ width: i === currentSlide ? '40px' : '40px', backgroundColor: i === currentSlide ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.3)' }}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 z-10 flex flex-col items-center gap-2">
          <div className="w-[1px] h-[36px] bg-white/40 overflow-hidden">
            <div className="w-full h-full bg-white animate-scroll-indicator" />
          </div>
        </div>

        <button onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)} className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">←</button>
        <button onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)} className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors">→</button>
      </section>

      {/* DYNAMIC SECTIONS */}
      {sectionOrder.map(id => renderSection(id))}

    </div>
  );
}
