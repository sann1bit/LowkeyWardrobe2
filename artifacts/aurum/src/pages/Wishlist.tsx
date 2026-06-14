import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Heart, X } from 'lucide-react';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import { useUIStore } from '../stores/uiStore';
import { products as hardcodedProducts } from '../data/products';
import { FigureSVG } from '../components/FigureSVG';
import { useState } from 'react';

export default function Wishlist() {
  const { items, toggle } = useWishlistStore();
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();
  const [sizeSelections, setSizeSelections] = useState<Record<number, string>>({});

  const wishlistProducts = hardcodedProducts.filter(p => items.includes(p.id));

  const handleMoveToCart = (product: typeof hardcodedProducts[0]) => {
    const size = sizeSelections[product.id] || product.sizes[0];
    addItem(product, size, product.colors[0]);
    toggle(product.id);
    showToast(`${product.name} added to bag`);
  };

  return (
    <div className="w-full min-h-[100dvh] pt-[120px] pb-24 bg-white text-black">
      <div className="max-w-[1400px] mx-auto px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h1 className="font-serif text-[clamp(36px,4vw,56px)] italic font-light leading-[1.15] mb-3">
            Wishlist
          </h1>
          <p className="text-[13px] text-[#999999]">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'piece' : 'pieces'} saved
          </p>
        </motion.div>

        {wishlistProducts.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center">
            <Heart size={40} strokeWidth={1} className="text-[#EAEAEA] mb-6" />
            <h3 className="font-serif text-[28px] italic text-[#999999] mb-4">Your wishlist is empty</h3>
            <p className="text-[13px] text-[#999999] mb-10 max-w-[320px] leading-[1.7]">
              Save pieces you love and come back to them whenever you're ready.
            </p>
            <Link href="/products">
              <button className="bg-black text-white px-10 py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors">
                Explore Collection
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] bg-[#EAEAEA] border border-[#EAEAEA] mb-12">
              {wishlistProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="bg-white group relative"
                >
                  <button
                    onClick={() => { toggle(product.id); showToast('Removed from wishlist'); }}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white"
                  >
                    <X size={14} />
                  </button>

                  <Link href={`/products/${product.slug}`}>
                    <div
                      className="aspect-[3/4] relative overflow-hidden cursor-pointer"
                      style={{ background: product.bgGradient }}
                    >
                      <FigureSVG
                        figType={product.figType}
                        ca={product.figColorA}
                        cb={product.figColorB}
                        className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700"
                      />
                      {product.badge && (
                        <div className="absolute top-4 left-4">
                          <span className={`px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-white ${product.badge === 'sale' ? 'bg-black' : 'bg-black'}`}>
                            {product.badge === 'new' ? 'New' : 'Sale'}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#999999] mb-1">{product.brand}</p>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-serif text-[17px] italic font-light mb-2 hover:opacity-70 cursor-pointer transition-opacity">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                      {product.originalPrice && (
                        <span className="text-[13px] text-[#999999] line-through">PKR {Number(product.originalPrice).toLocaleString()}</span>
                      )}
                      <span className="text-[15px] font-medium text-black">
                        PKR {Number(product.price).toLocaleString()}
                      </span>
                    </div>

                    {product.sizes.length > 1 && (
                      <select
                        value={sizeSelections[product.id] || ''}
                        onChange={e => setSizeSelections(prev => ({ ...prev, [product.id]: e.target.value }))}
                        className="w-full border border-[#EAEAEA] py-2 px-3 text-[12px] mb-3 focus:border-black outline-none"
                      >
                        <option value="">Select size</option>
                        {product.sizes.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}

                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="w-full border border-black text-black py-3 text-[11px] uppercase tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
                    >
                      Move to Bag
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center">
              <Link href="/products">
                <button className="border border-black px-10 py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-colors">
                  Continue Shopping
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
