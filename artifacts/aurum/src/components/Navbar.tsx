import { Link, useLocation } from 'wouter';
import { Search, Heart, ShoppingBag, User, X } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useUIStore } from '../stores/uiStore';
import { useState, useEffect, useCallback } from 'react';

const NAV_LINKS = [
  { label: 'New Arrivals', href: '/products?category=new' },
  { label: 'Clothing', href: '/products?category=clothing' },
  { label: 'Shoes', href: '/products?category=shoes' },
  { label: 'Accessories', href: '/products?category=accessories' },
  { label: 'Sale', href: '/products?category=sale', sale: true },
];

export function Navbar() {
  const [location] = useLocation();
  const { openCart, itemCount } = useCartStore();
  const { count: wishlistCount } = useWishlistStore();
  const { openSearch } = useUIStore();

  const isHome = location === '/';

  const getThreshold = useCallback(() => Math.round(window.innerHeight * 0.8), []);

  const [transparent, setTransparent] = useState(isHome && window.scrollY < getThreshold());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const update = () => {
      if (!isHome) { setTransparent(false); return; }
      setTransparent(window.scrollY < getThreshold());
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [isHome, getThreshold]);

  const textColor = transparent ? '#FAFAF8' : '#111111';
  const bgStyle: React.CSSProperties = {
    backgroundColor: transparent ? 'transparent' : '#FAFAF8',
    borderBottom: transparent ? '1px solid transparent' : '1px solid #EAEAEA',
    transition: 'background-color 280ms ease-in-out, border-color 280ms ease-in-out',
  };

  const iconStyle: React.CSSProperties = {
    color: textColor,
    transition: 'color 280ms ease-in-out',
  };

  const badgeStyle: React.CSSProperties = {
    color: transparent ? '#FAFAF8' : '#111111',
    borderColor: transparent ? '#FAFAF8' : '#111111',
    transition: 'color 280ms ease-in-out, border-color 280ms ease-in-out',
    background: 'transparent',
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 h-[64px] z-[1000]"
        style={bgStyle}
      >
        <div className="h-full px-6 md:px-8 flex items-center justify-between">

          {/* Logo */}
          <Link href="/">
            <div
              className="font-serif italic text-[15px] tracking-[0.28em] uppercase cursor-pointer select-none"
              style={iconStyle}
            >
              Lowkey Wardrobe
            </div>
          </Link>

          {/* Centre nav links — desktop */}
          <div className="hidden md:flex items-center gap-9 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => {
              const isActive = location === link.href || location.startsWith(link.href.split('?')[0]);
              return (
                <Link key={link.label} href={link.href}>
                  <div
                    className={`text-[11px] tracking-[0.15em] uppercase cursor-pointer relative group ${link.sale ? 'font-medium' : ''}`}
                    style={iconStyle}
                  >
                    {link.label}
                    <span
                      className="absolute -bottom-[3px] left-0 h-[1px] transition-all duration-[200ms] ease-out"
                      style={{
                        width: isActive ? '100%' : '0%',
                        background: textColor,
                        transition: 'width 200ms ease-out, background-color 280ms ease-in-out',
                      }}
                    />
                    <span
                      className="absolute -bottom-[3px] left-0 h-[1px] w-0 group-hover:w-full"
                      style={{
                        background: textColor,
                        transition: 'width 200ms ease-out, background-color 280ms ease-in-out',
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-5 md:gap-6">
            <button
              onClick={openSearch}
              className="hover:opacity-60 transition-opacity"
              style={iconStyle}
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            <Link href="/wishlist">
              <div
                className="relative hover:opacity-60 transition-opacity cursor-pointer"
                style={iconStyle}
              >
                <Heart size={18} strokeWidth={1.5} />
                {wishlistCount() > 0 && (
                  <span
                    className="absolute -top-[7px] -right-[9px] min-w-[16px] h-[16px] text-[9px] flex items-center justify-center border"
                    style={badgeStyle}
                  >
                    {wishlistCount()}
                  </span>
                )}
              </div>
            </Link>

            <button
              onClick={openCart}
              className="relative hover:opacity-60 transition-opacity"
              style={iconStyle}
              aria-label="Cart"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {itemCount() > 0 && (
                <span
                  className="absolute -top-[7px] -right-[9px] min-w-[16px] h-[16px] text-[9px] flex items-center justify-center border"
                  style={badgeStyle}
                >
                  {itemCount()}
                </span>
              )}
            </button>

            <Link href="/admin">
              <div
                className="hidden md:flex hover:opacity-60 transition-opacity cursor-pointer"
                style={iconStyle}
              >
                <User size={18} strokeWidth={1.5} />
              </div>
            </Link>

            {/* Hamburger — mobile */}
            <button
              className="md:hidden flex flex-col gap-[5px] justify-center items-center w-5 h-5"
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <span
                className="block w-5 h-[1px] origin-center"
                style={{
                  background: textColor,
                  transform: mobileOpen ? 'translateY(3px) rotate(45deg)' : 'none',
                  transition: 'transform 280ms ease-in-out, background-color 280ms ease-in-out',
                }}
              />
              <span
                className="block w-5 h-[1px]"
                style={{
                  background: textColor,
                  opacity: mobileOpen ? 0 : 1,
                  transition: 'opacity 200ms ease-in-out, background-color 280ms ease-in-out',
                }}
              />
              <span
                className="block w-5 h-[1px] origin-center"
                style={{
                  background: textColor,
                  transform: mobileOpen ? 'translateY(-9px) rotate(-45deg)' : 'none',
                  transition: 'transform 280ms ease-in-out, background-color 280ms ease-in-out',
                }}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className="fixed inset-0 z-[999] md:hidden flex flex-col pointer-events-none"
        style={{
          background: '#FAFAF8',
          opacity: mobileOpen ? 1 : 0,
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 280ms ease-in-out, transform 280ms ease-in-out',
          pointerEvents: mobileOpen ? 'auto' : 'none',
        }}
      >
        <div className="pt-[64px] flex flex-col flex-1 px-8 py-12">
          <nav className="flex flex-col gap-8 flex-1">
            {NAV_LINKS.map(link => {
              const isActive = location === link.href || location.startsWith(link.href.split('?')[0]);
              return (
                <Link key={link.label} href={link.href}>
                  <div
                    onClick={() => setMobileOpen(false)}
                    className="font-serif italic text-[28px] tracking-[0.04em] text-[#111111] cursor-pointer relative inline-block"
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute -bottom-[2px] left-0 w-full h-[1px] bg-[#111111]" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[#EAEAEA] pt-8 flex items-center justify-between">
            <Link href="/admin">
              <div
                onClick={() => setMobileOpen(false)}
                className="text-[11px] uppercase tracking-[0.15em] text-[#999999]"
              >
                Admin
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-[#999999] hover:text-[#111111] transition-colors"
              aria-label="Close menu"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
