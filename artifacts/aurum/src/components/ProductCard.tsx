import { useState } from 'react';
import { Product } from '../data/products';
import { FigureSVG } from './FigureSVG';
import { Link } from 'wouter';
import { Heart, X } from 'lucide-react';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import { useUIStore } from '../stores/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from './Skeleton';

interface ProductCardProps {
  product: Product;
}

function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();
  const [activeSize, setActiveSize] = useState(product.sizes[0] || '');
  const [activeColor, setActiveColor] = useState(product.colors[0] || '');
  const primaryImage = (product.images && product.images.length > 0) ? product.images[0] : product.imageUrl || undefined;

  const handleAdd = () => {
    addItem(product, activeSize, activeColor);
    showToast(`Added ${product.name} to bag`);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] bg-black/60 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          className="bg-white w-full max-w-[800px] max-h-[90vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2"
          onClick={e => e.stopPropagation()}
        >
          {/* Image */}
          <div className="aspect-[3/4] bg-[#F0F0F0] relative">
            {primaryImage ? (
              <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
            ) : product.figType ? (
              <FigureSVG figType={product.figType} ca={product.figColorA || '#c0c0c0'} cb={product.figColorB || '#fff'} className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#F0F0F0]">
                <span style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[40px] italic text-[#ccc]">{product.name.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:opacity-60">
                <X size={18} strokeWidth={1.5} />
              </button>
              <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[10px] tracking-[0.2em] uppercase text-black/40 mb-2">{product.brand}</p>
              <h3 style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[24px] italic font-light leading-[1.2] mb-3">{product.name}</h3>
              <p style={{ fontFamily: 'var(--font-body)' }} className="text-[16px] mb-6">PKR {Number(product.price).toLocaleString()}</p>

              {/* Colors */}
              {product.colors.length > 0 && (
                <div className="mb-4">
                  <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[11px] uppercase tracking-[0.22em] text-black/50 mb-3">Color</p>
                  <div className="flex gap-2">
                    {product.colors.map(color => (
                      <button key={color} onClick={() => setActiveColor(color)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${activeColor === color ? 'border-black' : 'border-transparent'}`}
                        style={{ backgroundColor: color, boxShadow: '0 0 0 1px rgba(0,0,0,0.15)' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes.length > 0 && (
                <div className="mb-6">
                  <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[11px] uppercase tracking-[0.22em] text-black/50 mb-3">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button key={size} onClick={() => setActiveSize(size)}
                        className={`px-3 py-2 text-[11px] border transition-colors ${activeSize === size ? 'bg-black text-white border-black' : 'border-[#EAEAEA] hover:border-black'}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={handleAdd} style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.2em' }} className="w-full bg-black text-white py-4 text-[11px] uppercase font-[500] hover:bg-[#333] transition-colors">
                Add to Bag
              </button>
              <Link href={`/products/${product.slug}`}>
                <button onClick={onClose} style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.15em' }} className="w-full border border-[#EAEAEA] text-black py-3 text-[11px] uppercase font-[400] hover:border-black transition-colors">
                  View Full Details
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggle, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();
  const isWishlisted = isInWishlist(product.id);
  const [activeColor, setActiveColor] = useState(product.colors[0]);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);
  const [quickView, setQuickView] = useState(false);

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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickView(true);
  };

  const isSoldOut = product.stock === 0;
  const isLowStock = !isSoldOut && product.stock > 0 && product.stock <= 3;
  const discountPct = product.originalPrice && Number(product.originalPrice) > Number(product.price)
    ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)
    : null;

  const primaryImage = (product.images && product.images.length > 0)
    ? product.images[0]
    : product.imageUrl || undefined;
  const secondaryImage = (product.images && product.images.length > 1) ? product.images[1] : null;

  return (
    <>
      {quickView && <QuickViewModal product={product} onClose={() => setQuickView(false)} />}
      <Link href={`/products/${product.slug}`}>
        <div className="group cursor-pointer block h-full flex flex-col relative" data-testid={`product-card-${product.id}`}>
          <div
            className="relative aspect-[3/4] overflow-hidden bg-[#F0F0F0] w-full"
            onMouseEnter={() => setImgHovered(true)}
            onMouseLeave={() => setImgHovered(false)}
          >
            {primaryImage && !imgError ? (
              <>
                {!imgLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
                <img
                  src={primaryImage}
                  alt={`${product.name} — ${product.brand}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => { setImgError(true); setImgLoaded(true); }}
                  className="w-full h-full object-cover transition-all duration-700 ease-out"
                  style={{ opacity: imgLoaded ? (secondaryImage && imgHovered ? 0 : 1) : 0, transition: 'opacity 300ms ease, transform 700ms ease-out' }}
                />
                {secondaryImage && (
                  <img
                    src={secondaryImage}
                    alt={`${product.name} alternate view`}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-out"
                    style={{ opacity: imgHovered ? 1 : 0 }}
                  />
                )}
              </>
            ) : product.figType ? (
              <>
                <div className="absolute inset-0" style={{ background: product.bgGradient || 'linear-gradient(135deg, #1a1a1a, #2d2d2d)' }} />
                <motion.div className="absolute inset-0 w-full h-full" whileHover={{ scale: 1.06 }} transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}>
                  <FigureSVG figType={product.figType} ca={product.figColorA || '#c0c0c0'} cb={product.figColorB || '#ffffff'} className="w-full h-full" />
                </motion.div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F0F0F0] gap-3">
                <div className="w-16 h-16 rounded-full bg-[#E0E0E0] flex items-center justify-center">
                  <span style={{ fontFamily: 'var(--font-display-italic)' }} className="text-[22px] italic text-[#999]">
                    {product.name?.charAt(0) || '?'}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-[10px] uppercase tracking-[0.15em] text-[#BBBBBB] text-center px-4 line-clamp-2">{product.name}</p>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
              {isSoldOut && (
                <span style={{ fontFamily: 'var(--font-body)' }} className="px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-white bg-black">Sold Out</span>
              )}
              {!isSoldOut && isLowStock && (
                <span style={{ fontFamily: 'var(--font-body)' }} className="px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-white bg-black">Only {product.stock} left</span>
              )}
              {!isSoldOut && !isLowStock && product.badge === 'new' && (
                <span style={{ fontFamily: 'var(--font-body)' }} className="px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-white bg-black">New</span>
              )}
              {!isSoldOut && discountPct && discountPct > 0 && (
                <span style={{ fontFamily: 'var(--font-body)' }} className="px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-white bg-black">–{discountPct}%</span>
              )}
            </div>

            {/* Quick View button */}
            {!isSoldOut && (
              <div className="absolute bottom-12 left-0 right-0 flex justify-center z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={handleQuickView}
                  style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.15em' }}
                  className="bg-white text-black text-[10px] uppercase px-6 py-2.5 border border-[#EAEAEA] hover:bg-black hover:text-white hover:border-black transition-colors duration-200 shadow-sm"
                >
                  Quick View
                </button>
              </div>
            )}

            {/* Hover Overlay */}
            {!isSoldOut && (
              <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] flex z-20">
                <button onClick={handleAdd} style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.15em' }} className="flex-1 bg-black/85 backdrop-blur-sm text-white py-4 text-[11px] uppercase font-[500] hover:bg-black transition-colors">Add to Bag</button>
                <button onClick={handleWishlist} className={`w-[44px] flex items-center justify-center transition-colors ${isWishlisted ? 'bg-black text-white' : 'bg-white/90 text-black hover:bg-white'}`}>
                  <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex flex-col flex-1">
            <div className="flex justify-between items-start gap-4 mb-2">
              <div>
                <p style={{ fontFamily: 'var(--font-smallcaps)' }} className="text-[10px] uppercase tracking-[0.2em] text-black/45 mb-1">{product.brand}</p>
                <h3 style={{ fontFamily: 'var(--font-display-italic)', fontStyle: 'italic', fontWeight: 400 }} className="text-[17px] leading-[1.3] line-clamp-1">{product.name}</h3>
              </div>
              <div className="text-right shrink-0">
                {product.originalPrice && Number(product.originalPrice) > 0 && (
                  <span style={{ fontFamily: 'var(--font-body)' }} className="text-[12px] text-[#999999] line-through block mb-0.5">PKR {Number(product.originalPrice).toLocaleString()}</span>
                )}
                <span style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }} className="text-[13px] text-black">
                  PKR {Number(product.price).toLocaleString()}
                </span>
              </div>
            </div>

            {product.subcategory && (
              <p style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.18em' }} className="text-[10px] uppercase font-[500] text-black/45 mb-1">{product.subcategory}</p>
            )}

            <div className="mt-auto flex items-center gap-1.5 pt-2">
              {product.colors.map(color => (
                <div
                  key={color}
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setActiveColor(color); }}
                  className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-all ${activeColor === color ? 'ring-1 ring-black ring-offset-2' : 'border-black/20'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
