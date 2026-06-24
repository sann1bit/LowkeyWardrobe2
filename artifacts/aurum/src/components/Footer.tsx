import { Link } from 'wouter';
import { useState, useEffect } from 'react';

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.9 6.4 9.4-.1-.8-.1-2.1.1-3 .2-.8 1.3-5.6 1.3-5.6s-.3-.7-.3-1.7c0-1.6.9-2.8 2.3-2.8 1.1 0 1.6.8 1.6 1.8 0 1.1-.7 2.7-1 4.2-.3 1.2.6 2.2 1.8 2.2 2.1 0 3.7-2.2 3.7-5.5 0-2.9-2.1-4.9-5-4.9-3.4 0-5.4 2.6-5.4 5.2 0 1 .4 2.1.9 2.7a.4.4 0 0 1 .1.4c-.1.4-.3 1.2-.3 1.4 0 .2-.1.3-.3.2C6.3 15.4 5.5 13.2 5.5 11.3c0-3.6 2.6-6.9 7.5-6.9 3.9 0 7 2.8 7 6.5 0 3.9-2.4 7-5.9 7-1.1 0-2.2-.6-2.6-1.3l-.7 2.6c-.3 1-.9 2.1-1.4 2.8.9.3 1.9.4 2.9.4 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
    </svg>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handle = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-6 z-[900] w-10 h-10 bg-black text-white flex items-center justify-center hover:bg-[#333] transition-colors"
      aria-label="Back to top"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 12V2M2 7l5-5 5 5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

export function Footer() {
  return (
    <>
      <BackToTop />
      <footer className="bg-black text-white pt-20 pb-10">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[18px] tracking-[0.22em] mb-4 uppercase font-[500]">Lowkey Wardrobe</div>
              <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-white/40 font-light max-w-xs leading-[1.85]">
                Luxury fashion rooted in timeless craft.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-5 mt-6">
                {[
                  { icon: <InstagramIcon />, href: '#', label: 'Instagram' },
                  { icon: <FacebookIcon />, href: '#', label: 'Facebook' },
                  { icon: <TikTokIcon />, href: '#', label: 'TikTok' },
                  { icon: <PinterestIcon />, href: '#', label: 'Pinterest' },
                ].map(s => (
                  <a key={s.label} href={s.href} aria-label={s.label} className="text-white hover:opacity-60 transition-opacity">
                    {s.icon}
                  </a>
                ))}
              </div>

              {/* Payment Methods */}
              <div className="mt-8">
                <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[10px] tracking-[0.2em] uppercase text-white/30 mb-3">Secure Payments</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {['JazzCash', 'Easypaisa', 'Visa', 'Mastercard'].map(pm => (
                    <span key={pm} style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[10px] tracking-[0.1em] uppercase border border-white/20 px-2 py-1 text-white/40">
                      {pm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[12px] tracking-[0.2em] uppercase mb-6 text-white/40 font-[500]">Quick Links</h4>
              <ul className="flex flex-col gap-3">
                {[
                  { label: 'New Arrivals', href: '/products?category=new' },
                  { label: 'Clothing', href: '/products?category=clothing' },
                  { label: 'Shoes', href: '/products?category=shoes' },
                  { label: 'Accessories', href: '/products?category=accessories' },
                  { label: 'Sale', href: '/products?category=sale' },
                ].map(l => (
                  <li key={l.label}><Link href={l.href}><span style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-white/60 font-light hover:text-white transition-colors cursor-pointer leading-[2.2] tracking-[0.08em]">{l.label}</span></Link></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[12px] tracking-[0.2em] uppercase mb-6 text-white/40 font-[500]">Customer Care</h4>
              <ul className="flex flex-col gap-3">
                {['Contact Us', 'Size Guide', 'Shipping Info', 'Returns', 'Track Order'].map(l => (
                  <li key={l}>
                    <a href={l === 'Track Order' ? '/track-order' : '#'} style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-white/60 font-light hover:text-white transition-colors leading-[2.2] tracking-[0.08em]">{l}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[12px] tracking-[0.2em] uppercase mb-6 text-white/40 font-[500]">Contact</h4>
              <ul className="flex flex-col gap-3">
                <li><span style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-white/60 font-light leading-[2.2] tracking-[0.08em]">Lahore, Pakistan</span></li>
                <li><a href="mailto:hello@lowkeywardrobe.com" style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-white/60 font-light hover:text-white transition-colors leading-[2.2] tracking-[0.08em]">hello@lowkeywardrobe.com</a></li>
                <li><a href="https://wa.me/923001234567" style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-white/60 font-light hover:text-white transition-colors leading-[2.2] tracking-[0.08em]">WhatsApp: +92 300 123 4567</a></li>
                <li><span style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-white/60 font-light leading-[2.2] tracking-[0.08em]">Mon–Sat: 10am–8pm PKT</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-white/40 font-light">
              &copy; 2026 Lowkey Wardrobe. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" style={{ fontFamily: 'var(--font-body)' }} className="text-[11px] text-white/40 hover:text-white tracking-[0.1em] uppercase transition-colors">Privacy Policy</a>
              <a href="#" style={{ fontFamily: 'var(--font-body)' }} className="text-[11px] text-white/40 hover:text-white tracking-[0.1em] uppercase transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
