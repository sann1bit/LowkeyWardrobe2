import { useState, useEffect, useRef } from 'react';
import { useListProducts } from '@workspace/api-client-react';
import { products as hardcodedProducts } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, Search, X } from 'lucide-react';

const SUBCATEGORIES: Record<string, { id: string; label: string }[]> = {
  clothing: [
    { id: 'all', label: 'All Clothing' },
    { id: 'men', label: 'Menswear' },
    { id: 'women', label: 'Womenswear' },
    { id: 'unisex', label: 'Unisex' },
  ],
  shoes: [
    { id: 'all', label: 'All Shoes' },
    { id: 'men', label: 'Menswear' },
    { id: 'women', label: 'Womenswear' },
    { id: 'unisex', label: 'Unisex' },
  ],
  accessories: [
    { id: 'all', label: 'All Accessories' },
    { id: 'men', label: 'Menswear' },
    { id: 'women', label: 'Womenswear' },
    { id: 'unisex', label: 'Unisex' },
  ],
};

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [sortOpen, setSortOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setActiveCategory(cat);
  }, []);

  useEffect(() => {
    setActiveSubcategory('all');
  }, [activeCategory]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const apiCategory = (activeCategory === 'all' || activeCategory === 'new' || activeCategory === 'sale') ? undefined : activeCategory;
  const apiBadge = (activeCategory === 'new' || activeCategory === 'sale') ? activeCategory : undefined;

  const { data: apiProducts, isLoading } = useListProducts({
    category: apiCategory,
    badge: apiBadge,
    q: searchQuery || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 100000 ? priceRange[1] : undefined,
    sortBy: sortBy !== 'featured' ? (sortBy as any) : undefined,
  });

  const useApi = apiProducts !== undefined;
  let products = useApi ? (apiProducts as any[]) : (hardcodedProducts as any[]);

  if (!useApi) {
    products = products.filter(p => {
      if (activeCategory === 'sale') return p.badge === 'sale';
      if (activeCategory === 'new') return p.badge === 'new';
      if (activeCategory !== 'all') return p.category === activeCategory;
      return true;
    });
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(lower) || p.brand.toLowerCase().includes(lower));
    }
    products = products.filter(p => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]);
    products = [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'newest': return (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0);
        default: return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
  }

  // Client-side subcategory filter
  if (activeSubcategory !== 'all' && SUBCATEGORIES[activeCategory]) {
    products = products.filter((p: any) => p.subcategory === activeSubcategory);
  }

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'accessories', label: 'Accessories' },
    { id: 'new', label: 'New Arrivals' },
    { id: 'sale', label: 'Sale' },
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'New Arrivals' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Alphabetical' },
  ];

  const subcategoryOptions = SUBCATEGORIES[activeCategory];
  const hasActiveFilters = searchQuery || priceRange[0] > 0 || priceRange[1] < 100000;

  return (
    <div className="w-full min-h-[100dvh] pt-[100px] pb-24 bg-white text-black">
      <div className="max-w-[1600px] mx-auto px-8">

        {/* Header */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-[clamp(36px,4vw,56px)] italic font-light leading-[1.15] mb-3">Collection</h1>
            <p className="text-[13px] font-light text-[#666666]">
              {isLoading ? '—' : `${products.length} ${products.length === 1 ? 'piece' : 'pieces'}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {searchOpen && (
                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="relative">
                    <input ref={searchInputRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products…" className="w-full border border-black bg-white px-4 py-2.5 pr-8 text-[12px] placeholder:text-[#999] outline-none" />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-black"><X size={12} /></button>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => { if (searchOpen && searchQuery) setSearchQuery(''); setSearchOpen(!searchOpen); }} className={`flex items-center justify-center w-10 h-10 border transition-colors ${searchOpen ? 'bg-black text-white border-black' : 'border-[#EAEAEA] hover:border-black'}`}>
              <Search size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-0">
          <div className="flex gap-6 border-b border-[#EAEAEA] pb-0 overflow-x-auto no-scrollbar w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  const url = new URL(window.location.href);
                  if (cat.id === 'all') url.searchParams.delete('category');
                  else url.searchParams.set('category', cat.id);
                  window.history.replaceState({}, '', url.toString());
                }}
                className={`text-[11px] uppercase tracking-[0.15em] whitespace-nowrap transition-colors relative pb-4 ${activeCategory === cat.id ? 'text-black' : 'text-[#999999] hover:text-black'}`}
              >
                {cat.label}
                {activeCategory === cat.id && <motion.div layoutId="productTabs" className="absolute -bottom-[1px] left-0 right-0 h-[1px] bg-black" />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button onClick={() => setFiltersOpen(!filtersOpen)} className={`flex items-center gap-2 border px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors ${filtersOpen || hasActiveFilters ? 'bg-black text-white border-black' : 'border-[#EAEAEA] hover:border-black'}`}>
              <SlidersHorizontal size={13} strokeWidth={1.5} />
              Filter{hasActiveFilters ? ' •' : ''}
            </button>
            <div className="relative">
              <button onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-2 border border-[#EAEAEA] px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] hover:border-black transition-colors">
                <span>{sortOptions.find(s => s.value === sortBy)?.label}</span>
                <ChevronDown size={13} strokeWidth={1.5} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-[#EAEAEA] min-w-[180px] z-30 shadow-lg">
                  {sortOptions.map(opt => (
                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setSortOpen(false); }} className={`w-full text-left px-4 py-3 text-[12px] hover:bg-[#F5F5F5] transition-colors ${sortBy === opt.value ? 'font-medium' : ''}`}>{opt.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subcategory tabs — shown when a main category with subcategories is selected */}
        <AnimatePresence>
          {subcategoryOptions && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex gap-4 py-4 border-b border-[#F0F0F0] overflow-x-auto no-scrollbar">
                {subcategoryOptions.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubcategory(sub.id)}
                    className={`text-[10px] uppercase tracking-[0.2em] whitespace-nowrap px-3 py-1.5 transition-colors border ${activeSubcategory === sub.id ? 'bg-black text-white border-black' : 'border-[#EAEAEA] text-[#999] hover:border-black hover:text-black'}`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter panel */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-0 overflow-hidden">
              <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-6 mt-4">
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] mb-4">
                      Price Range: PKR {priceRange[0].toLocaleString()} – PKR {priceRange[1] >= 100000 ? '100,000+' : priceRange[1].toLocaleString()}
                    </p>
                    <div className="flex gap-3 items-center">
                      <input type="range" min={0} max={100000} step={1000} value={priceRange[0]} onChange={e => { const val = parseInt(e.target.value); if (val < priceRange[1]) setPriceRange([val, priceRange[1]]); }} className="w-full accent-black" />
                      <input type="range" min={0} max={100000} step={1000} value={priceRange[1]} onChange={e => { const val = parseInt(e.target.value); if (val > priceRange[0]) setPriceRange([priceRange[0], val]); }} className="w-full accent-black" />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#999999] mt-1"><span>PKR 0</span><span>PKR 100,000+</span></div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] mb-4">Quick Reset</p>
                    <button onClick={() => { setPriceRange([0, 100000]); setActiveCategory('all'); setSortBy('featured'); setSearchQuery(''); setActiveSubcategory('all'); }} className="border border-[#EAEAEA] px-4 py-2 text-[11px] uppercase tracking-[0.1em] hover:border-black transition-colors">Clear All Filters</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px] bg-[#EAEAEA] border border-[#EAEAEA]">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-white aspect-[3/4] animate-pulse bg-[#F5F5F5]" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="py-32 text-center">
              <h3 className="font-serif text-[28px] italic text-[#999999]">No products found</h3>
              {searchQuery && <p className="text-[13px] text-[#999] mt-2">No results for "{searchQuery}"</p>}
              <button onClick={() => { setActiveCategory('all'); setPriceRange([0, 100000]); setSearchQuery(''); setSortBy('featured'); setActiveSubcategory('all'); }} className="mt-6 border border-black px-8 py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-colors">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[2px] bg-[#EAEAEA] border border-[#EAEAEA]">
              {products.map((product: any, i: number) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.04 }} className="bg-white">
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      {sortOpen && <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />}
    </div>
  );
}
