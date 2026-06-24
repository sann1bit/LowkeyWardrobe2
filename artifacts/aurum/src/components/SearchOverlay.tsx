import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../stores/uiStore';
import { X, Search } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { products as hardcodedProducts } from '../data/products';
import { useListProducts } from '@workspace/api-client-react';
import { FigureSVG } from './FigureSVG';
import { Link } from 'wouter';

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: apiProducts } = useListProducts();
  const allProducts = useMemo(
    () => (apiProducts && (apiProducts as any[]).length > 0 ? (apiProducts as any[]) : hardcodedProducts),
    [apiProducts]
  );

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
    ? allProducts.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(query.toLowerCase()) ||
        (p.tags || []).some((t: string) => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6)
    : [];

  const primaryImage = (p: any) =>
    (p.images && p.images.length > 0) ? p.images[0] : p.imageUrl || null;

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-white/97 backdrop-blur-[8px] z-[2000] flex flex-col"
          data-testid="search-overlay"
        >
          <div className="flex justify-end p-8">
            <button onClick={closeSearch} className="p-2 hover:opacity-60 transition-opacity">
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 max-w-4xl w-full mx-auto px-8">
            <div className="relative mb-12">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories…"
                style={{ fontFamily: 'var(--font-display-italic)', fontStyle: 'italic' }}
                className="w-full bg-transparent border-b border-black pb-4 text-[clamp(22px,3vw,38px)] font-light outline-none placeholder:text-[#BBBBBB]"
              />
              <Search className="absolute right-0 bottom-5 text-[#BBBBBB]" size={22} strokeWidth={1.5} />
            </div>

            {query.length <= 1 ? (
              <div>
                <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-5">Trending Searches</p>
                <div className="flex flex-wrap gap-2">
                  {trending.map(term => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      style={{ fontFamily: 'var(--font-body)' }}
                      className="px-4 py-2 border border-[#EAEAEA] text-[12px] hover:border-black transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-5">
                  {results.length > 0 ? `${results.length} Result${results.length !== 1 ? 's' : ''}` : 'No results found'}
                </p>
                <div className="flex flex-col gap-1">
                  {results.map(product => {
                    const img = primaryImage(product);
                    return (
                      <Link key={product.id} href={`/products/${product.slug}`} onClick={closeSearch}>
                        <div className="flex items-center gap-6 p-4 hover:bg-[#F5F5F5] transition-colors cursor-pointer group">
                          <div className="w-[52px] h-[66px] relative overflow-hidden bg-[#F0F0F0] shrink-0">
                            {img ? (
                              <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <>
                                <div className="absolute inset-0" style={{ background: product.bgGradient }} />
                                <FigureSVG
                                  figType={product.figType}
                                  ca={product.figColorA}
                                  cb={product.figColorB}
                                  className="w-full h-full absolute inset-0"
                                />
                              </>
                            )}
                          </div>
                          <div className="flex-1 flex justify-between items-center min-w-0">
                            <div className="min-w-0">
                              <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[9px] uppercase tracking-[0.2em] text-[#999999] mb-0.5">{product.brand}</p>
                              <p style={{ fontFamily: 'var(--font-display-italic)', fontStyle: 'italic' }} className="text-[17px] font-light truncate">{product.name}</p>
                              <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[9px] uppercase tracking-[0.15em] text-[#BBBBBB] capitalize">{product.category}</p>
                            </div>
                            <p style={{ fontFamily: 'var(--font-body)' }} className="text-[14px] shrink-0 ml-4">
                              PKR {Number(product.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {results.length === 0 && (
                    <p style={{ fontFamily: 'var(--font-body)' }} className="text-[13px] text-[#BBBBBB] py-4">
                      Try searching for a product name, brand, or category.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
