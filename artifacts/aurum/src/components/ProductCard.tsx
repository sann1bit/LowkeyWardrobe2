import { useState } from 'react';
import { Product } from '../data/products';
import { FigureSVG } from './FigureSVG';
import { Link } from 'wouter';
import { Heart, Star } from 'lucide-react';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import { useUIStore } from '../stores/uiStore';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggle, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();
  const isWishlisted = isInWishlist(product.id);
  const [activeColor, setActiveColor] = useState(product.colors[0]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.sizes[0], activeColor);
    showToast(`Added ${product.name} to bag`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    showToast(isWishlisted ? `Removed from wishlist` : `Added to wishlist`);
  };

  const isSoldOut = product.stock === 0;
  const discountPct = product.originalPrice && Number(product.originalPrice) > Number(product.price)
    ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)
    : null;

  const primaryImage = (product.images && product.images.length > 0)
    ? product.images[0]
    : product.imageUrl || undefined;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="group cursor-pointer block h-full flex flex-col relative" data-testid={`product-card-${product.id}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[#F0F0F0] w-full">
          {primaryImage ? (
            <img src={primaryImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: product.bgGradient }} />
              <motion.div className="absolute inset-0 w-full h-full" whileHover={{ scale: 1.06 }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}>
                <FigureSVG figType={product.figType} ca={product.figColorA} cb={product.figColorB} className="w-full h-full" />
              </motion.div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {isSoldOut && (
              <span className="px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-white bg-black">Sold Out</span>
            )}
            {!isSoldOut && product.badge === 'new' && (
              <span className="px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-white bg-black">New</span>
            )}
            {!isSoldOut && discountPct && discountPct > 0 && (
              <span className="px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-white bg-black">–{discountPct}%</span>
            )}
          </div>

          {/* Featured star */}
          {product.featured && (
            <div className="absolute top-3 right-3 z-10">
              <div className="w-7 h-7 bg-black/80 flex items-center justify-center" title="Featured">
                <Star size={12} className="text-white" fill="white" />
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          {!isSoldOut && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] flex z-20">
              <button onClick={handleAdd} className="flex-1 bg-black/85 backdrop-blur-sm text-white py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-black transition-colors">Add to Bag</button>
              <button onClick={handleWishlist} className={`w-[44px] flex items-center justify-center transition-colors ${isWishlisted ? 'bg-black text-white' : 'bg-white/90 text-black hover:bg-white'}`}>
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-4 mb-2">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#999999] mb-1">{product.brand}</p>
              <h3 className="text-[14px] font-normal line-clamp-1">{product.name}</h3>
            </div>
            <div className="text-right shrink-0">
              {product.originalPrice && Number(product.originalPrice) > 0 && (
                <span className="text-[12px] text-[#999999] line-through block mb-0.5">PKR {Number(product.originalPrice).toLocaleString()}</span>
              )}
              <span className={`text-[14px] ${discountPct ? 'text-black' : 'text-black'}`}>
                PKR {Number(product.price).toLocaleString()}
              </span>
            </div>
          </div>

          {product.subcategory && (
            <p className="text-[9px] uppercase tracking-[0.15em] text-[#BBBBBB] mb-1">{product.subcategory}</p>
          )}

          <div className="mt-auto flex items-center gap-1.5 pt-2">
            {product.colors.map(color => (
              <div
                key={color}
                onClick={e => { e.preventDefault(); e.stopPropagation(); setActiveColor(color); }}
                className={`w-3.5 h-3.5 rounded-full border border-[#EAEAEA] cursor-pointer transition-all ${activeColor === color ? 'ring-1 ring-black ring-offset-2' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
