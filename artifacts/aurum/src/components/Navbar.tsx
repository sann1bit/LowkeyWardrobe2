import { Link } from 'wouter';
import { Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useUIStore } from '../stores/uiStore';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { openCart, itemCount } = useCartStore();
  const { count: wishlistCount } = useWishlistStore();
  const { openSearch } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'New Arrivals', href: '/products?category=new' },
    { label: 'Clothing', href: '/products?category=clothing' },
    { label: 'Shoes', href: '/products?category=shoes' },
    { label: 'Accessories', href: '/products?category=accessories' },
    { label: 'Sale', href: '/products?category=sale', sale: true },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 h-[64px] z-[1000] transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-[12px] border-b border-[#EAEAEA]' : 'bg-white'
      }`}>
        <div className="h-full px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="font-serif text-[16px] font-medium tracking-[0.22em] cursor-pointer uppercase">Lowkey Wardrobe</div>
          </Link>

          {/* Center Links — desktop */}
          <div className="hidden md:flex items-center gap-9 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href}>
                <div className={`text-[11px] tracking-[0.15em] uppercase hover:opacity-70 transition-opacity cursor-pointer relative group ${link.sale ? 'font-medium' : ''}`}>
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
                </div>
              </Link>
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
                <div onClick={() => setMobileOpen(false)} className={`text-[13px] uppercase tracking-[0.15em] ${link.sale ? 'font-medium' : ''}`}>
                  {link.label}
                </div>
              </Link>
            ))}
            <div className="border-t border-[#EAEAEA] pt-4">
              <Link href="/admin">
                <div onClick={() => setMobileOpen(false)} className="text-[13px] uppercase tracking-[0.15em] text-[#999999]">
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
