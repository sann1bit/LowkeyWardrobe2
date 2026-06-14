import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-black text-white pt-20 pb-10">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="font-serif text-[22px] tracking-[0.22em] mb-4 uppercase">Lowkey Wardrobe</div>
            <p className="text-[14px] text-white/40 font-light max-w-xs">
              Luxury fashion rooted in timeless craft.
            </p>
          </div>
          
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-6 text-white/40">Shop</h4>
            <ul className="flex flex-col gap-4">
              <li><Link href="/products?category=new"><span className="text-[13px] text-white/60 font-light hover:text-white transition-colors cursor-pointer">New Arrivals</span></Link></li>
              <li><Link href="/products?category=clothing"><span className="text-[13px] text-white/60 font-light hover:text-white transition-colors cursor-pointer">Clothing</span></Link></li>
              <li><Link href="/products?category=shoes"><span className="text-[13px] text-white/60 font-light hover:text-white transition-colors cursor-pointer">Shoes</span></Link></li>
              <li><Link href="/products?category=accessories"><span className="text-[13px] text-white/60 font-light hover:text-white transition-colors cursor-pointer">Accessories</span></Link></li>
              <li><Link href="/products?category=sale"><span className="text-[13px] text-white/60 font-light hover:text-white transition-colors cursor-pointer">Sale</span></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-6 text-white/40">Company</h4>
            <ul className="flex flex-col gap-4">
              <li><a href="#" className="text-[13px] text-white/60 font-light hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-[13px] text-white/60 font-light hover:text-white transition-colors">Sustainability</a></li>
              <li><a href="#" className="text-[13px] text-white/60 font-light hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-[13px] text-white/60 font-light hover:text-white transition-colors">Press</a></li>
              <li><a href="#" className="text-[13px] text-white/60 font-light hover:text-white transition-colors">Stores</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-6 text-white/40">Support</h4>
            <ul className="flex flex-col gap-4">
              <li><a href="#" className="text-[13px] text-white/60 font-light hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-[13px] text-white/60 font-light hover:text-white transition-colors">Size Guide</a></li>
              <li><a href="#" className="text-[13px] text-white/60 font-light hover:text-white transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-[13px] text-white/60 font-light hover:text-white transition-colors">Returns</a></li>
              <li><a href="#" className="text-[13px] text-white/60 font-light hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-white/40 font-light">
            &copy; 2026 Lowkey Wardrobe. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[12px] text-white/40 hover:text-white tracking-[0.1em] uppercase transition-colors">Instagram</a>
            <a href="#" className="text-[12px] text-white/40 hover:text-white tracking-[0.1em] uppercase transition-colors">Pinterest</a>
            <a href="#" className="text-[12px] text-white/40 hover:text-white tracking-[0.1em] uppercase transition-colors">TikTok</a>
            <a href="#" className="text-[12px] text-white/40 hover:text-white tracking-[0.1em] uppercase transition-colors">Twitter</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
