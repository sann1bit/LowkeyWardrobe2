import { Link } from 'wouter';
import { Search, Heart, ShoppingBag, User, ChevronDown } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useUIStore } from '../stores/uiStore';
import { useState, useEffect, useRef } from 'react';

const MEGA_MENUS: Record<string, { label: string; href: string }[]> = {
  Clothing: [
    { label: 'All Clothing', href: '/products?category=clothing' },
    { label: 'Menswear', href: '/products?category=clothing&sub=men' },
    { label: 'Womenswear', href: '/products?category=clothing&sub=women' },
    { label: 'Unisex', href: '/products?category=clothing&sub=unisex' },
    { label: 'New Arrivals', href: '/products?category=new' },
    { label: 'Sale', href: '/products?category=sale' },
  ],
  Shoes: [
    { label: 'All Shoes', href: '/products?category=shoes' },
    { label: 'Menswear', href: '/products?category=shoes&sub=men' },
    { label: 'Womenswear', href: '/products?category=shoes&sub=women' },
    { label: 'Unisex', href: '/products?category=shoes&sub=unisex' },
    { label: 'Sneakers', href: '/products?category=shoes&sub=sneakers' },
    { label: 'Formal', href: '/products?category=shoes&sub=formal' },
    { label: 'Sale', href: '/products?category=sale' },
  ],
  Accessories: [
    { label: 'All Accessories', href: '/products?category=accessories' },
    { label: 'Watches', href: '/products?category=accessories&sub=watches' },
    { label: 'Wallets', href: '/products?category=accessories&sub=wallets' },
    { label: 'Belts', href: '/products?category=accessories&sub=belts' },
    { label: 'Bags', href: '/products?category=accessories&sub=bags' },
    { label: 'Jewellery', href: '/products?category=accessories&sub=jewellery' },
  ],
};

export function Navbar() {
  const { openCart, itemCount } = useCartStore();
  const { count: wishlistCount } = useWishlistStore();
  const { openSearch } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openMega = (label: string) => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(label);
  };
  const closeMega = () => {
    megaTimeout.current = setTimeout(() => setMegaOpen(null), 120);
  };

  const navLinks = [
    { label: 'New Arrivals', href: '/products?category=new' },
    { label: 'Clothing', href: '/products?category=clothing', mega: 'Clothing' },
    { label: 'Shoes', href: '/products?category=shoes', mega: 'Shoes' },
    { label: 'Accessories', href: '/products?category=accessories', mega: 'Accessories' },
    { label: 'Sale', href: '/products?category=sale', sale: true },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 h-[64px] z-[1000] transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-[12px] border-b border-black/[0.08]' : 'bg-white'
      }`}>
        <div className="h-full px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[14px] font-medium tracking-[0.28em] cursor-pointer uppercase text-black">
              Lowkey Wardrobe
            </div>
          </Link>

          {/* Center Links — desktop */}
          <div className="hidden md:flex items-center gap-9 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.mega ? openMega(link.mega) : undefined}
                onMouseLeave={link.mega ? closeMega : undefined}
              >
                <Link href={link.href}>
                  <div style={{ fontFamily: 'var(--font-body)' }} className={`flex items-center gap-1 text-[11px] font-[500] tracking-[0.15em] uppercase hover:opacity-70 transition-opacity cursor-pointer relative group ${link.sale ? 'font-[600]' : ''}`}>
                    {link.label}
                    {link.mega && <ChevronDown size={10} strokeWidth={2} className="opacity-40" />}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
                  </div>
                </Link>

                {/* Mega dropdown */}
                {link.mega && megaOpen === link.mega && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-white border border-[#EAEAEA] shadow-sm min-w-[200px] py-6 px-6 z-50 animate-in fade-in duration-150"
                    onMouseEnter={() => openMega(link.mega!)}
                    onMouseLeave={closeMega}
                  >
                    <div className="flex flex-col gap-3">
                      {MEGA_MENUS[link.mega].map(item => (
                        <Link key={item.label} href={item.href}>
                          <span
                            style={{ fontFamily: 'var(--font-smallcaps)' }}
                            className="block text-[11px] tracking-[0.18em] uppercase text-black/70 hover:text-black transition-colors cursor-pointer"
                          >
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-5 md:gap-6">
            <button onClick={openSearch} className="hover:opacity-60 transition-opacity">
              <Search size={18} strokeWidth={1.5} />
            </button>

            <Link href="/wishlist">
              <div className="relative hover:opacity-60 transition-opacity cursor-pointer flex items-center gap-1">
                <Heart size={18} strokeWidth={1.5} />
                {wishlistCount() > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-black text-white text-[9px] flex items-center justify-center rounded-full">
                    {wishlistCount()}
                  </span>
                )}
              </div>
            </Link>

            <button onClick={openCart} className="relative hover:opacity-60 transition-opacity">
              <ShoppingBag size={18} strokeWidth={1.5} />
              {itemCount() > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-black text-white text-[9px] flex items-center justify-center rounded-full">
                  {itemCount()}
                </span>
              )}
            </button>

            <Link href="/admin">
              <div className="hidden md:flex hover:opacity-60 transition-opacity cursor-pointer">
                <User size={18} strokeWidth={1.5} />
              </div>
            </Link>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              <div className="flex flex-col gap-1.5">
                <span className={`block w-5 h-[1px] bg-black transition-transform duration-300 ${mobileOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
                <span className={`block w-5 h-[1px] bg-black transition-opacity duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-[1px] bg-black transition-transform duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed top-[64px] left-0 right-0 bg-white border-b border-[#EAEAEA] z-[999] px-8 py-6 md:hidden">
          <nav className="flex flex-col gap-5">
            {navLinks.map(link => (
              <Link key={link.label} href={link.href}>
                <div onClick={() => setMobileOpen(false)} style={{ fontFamily: 'var(--font-body)' }} className={`text-[12px] uppercase tracking-[0.15em] font-[500] ${link.sale ? 'font-[600]' : ''}`}>
                  {link.label}
                </div>
              </Link>
            ))}
            <div className="border-t border-[#EAEAEA] pt-4">
              <Link href="/admin">
                <div onClick={() => setMobileOpen(false)} style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] uppercase tracking-[0.15em] text-[#999999]">
                  Admin
                </div>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
