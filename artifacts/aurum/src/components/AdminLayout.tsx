import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Package, Mail, ShoppingBag, LogOut, ChevronRight, Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('aurum_admin_token');
    if (!token) setLocation('/admin/login');
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('aurum_admin_token');
    setLocation('/admin/login');
  };

  const nav = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-8 border-b border-[#EAEAEA]">
        <div className="font-serif text-[14px] font-medium tracking-[0.22em] uppercase">Lowkey Wardrobe</div>
        <p className="text-[9px] uppercase tracking-[0.2em] text-[#999999] mt-1">Admin Portal</p>
      </div>
      <nav className="flex-1 px-3 py-6 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = location === href;
          return (
            <Link key={href} href={href}>
              <div className={`flex items-center gap-3 px-4 py-3 text-[12px] transition-colors cursor-pointer ${
                active ? 'bg-black text-white' : 'text-[#666666] hover:text-black hover:bg-[#F5F5F5]'
              }`}>
                <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                <span className="tracking-[0.05em] uppercase">{label}</span>
                {active && <ChevronRight size={12} className="ml-auto" />}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-6 border-t border-[#EAEAEA] space-y-1">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-3 text-[12px] text-[#999999] hover:text-black transition-colors">
          <Package size={15} strokeWidth={1.5} />
          <span className="tracking-[0.05em] uppercase">View Store</span>
        </a>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] text-[#999999] hover:text-black transition-colors">
          <LogOut size={15} strokeWidth={1.5} />
          <span className="tracking-[0.05em] uppercase">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-[220px] bg-white border-r border-[#EAEAEA] flex-col fixed top-0 left-0 h-full z-10">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-[220px] bg-white border-r border-[#EAEAEA] flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-[220px] flex flex-col min-h-screen">
        <header className="bg-white border-b border-[#EAEAEA] px-8 py-4 flex items-center gap-4">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu size={20} strokeWidth={1.5} />
          </button>
          <h1 className="font-serif text-[22px] italic font-light">{title}</h1>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function getAdminToken(): string | null {
  return localStorage.getItem('aurum_admin_token');
}

export async function adminFetch(path: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const BASE = (import.meta as any).env.BASE_URL.replace(/\/$/, '');
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}
