import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../stores/uiStore';
import { X, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { products } from '../data/products';
import { FigureSVG } from './FigureSVG';
import { Link } from 'wouter';

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeSearch();
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    } else {
      setQuery('');
    }
  }, [searchOpen, closeSearch]);

  const trending = ["Oversized Jacket", "Leather Boot", "Silk Shirt", "Cashmere", "Minimal Sneaker", "Wallet", "Tailored Trousers"];

  const results = query.length > 1 
    ? products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-white/95 backdrop-blur-[8px] z-[2000] flex flex-col"
          data-testid="search-overlay"
        >
          <div className="flex justify-end p-8">
            <button onClick={closeSearch} className="p-2 hover:bg-[#F5F5F5] rounded-full transition-colors">
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 max-w-4xl w-full mx-auto px-8 w-full">
            <div className="relative mb-12">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full bg-transparent border-b-2 border-black pb-4 text-[clamp(24px,3vw,40px)] font-serif italic outline-none placeholder:text-[#999999]"
              />
              <Search className="absolute right-0 bottom-6 text-[#999999]" size={28} strokeWidth={1.5} />
            </div>

            {query.length <= 1 ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#999999] mb-6">Trending Searches</p>
                <div className="flex flex-wrap gap-3">
                  {trending.map(term => (
                    <button 
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 border border-[#EAEAEA] text-[13px] hover:border-black transition-colors rounded-full"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#999999] mb-6">
                  {results.length > 0 ? 'Results' : 'No results found'}
                </p>
                <div className="flex flex-col gap-4">
                  {results.map(product => (
                    <Link key={product.id} href={`/products/${product.slug}`} onClick={closeSearch}>
                      <div className="flex items-center gap-6 p-4 hover:bg-[#F5F5F5] transition-colors rounded cursor-pointer group">
                        <div className="w-[56px] h-[70px] relative overflow-hidden bg-[#F5F5F5] shrink-0">
                          <div className="absolute inset-0" style={{ background: product.bgGradient }} />
                          <FigureSVG 
                            figType={product.figType} 
                            ca={product.figColorA} 
                            cb={product.figColorB} 
                            className="w-full h-full absolute inset-0 group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.2em] text-[#999999] mb-1">{product.brand}</p>
                            <p className="text-[16px]">{product.name}</p>
                          </div>
                          <p className="text-[16px]">${product.price}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
