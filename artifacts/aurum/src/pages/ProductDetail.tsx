import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useGetProduct } from '@workspace/api-client-react';
import { products as hardcodedProducts, Product } from '../data/products';
import { FigureSVG } from '../components/FigureSVG';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useUIStore } from '../stores/uiStore';
import { Heart, ChevronRight, ZoomIn, X } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetail() {
  const [, params] = useRoute('/products/:slug');
  const slug = params?.slug;

  const { data: apiProduct, isLoading } = useGetProduct(slug || '', { query: { enabled: !!slug } });
  const product: Product | undefined = (apiProduct as any) || hardcodedProducts.find(p => p.slug === slug);

  const [activeSize, setActiveSize] = useState<string>('');
  const [activeColor, setActiveColor] = useState<string>('');
  const [zoomed, setZoomed] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { addItem } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    if (product) {
      setActiveSize('');
      setActiveColor(product.colors[0]);
      setActiveImageIndex(0);
      window.scrollTo(0, 0);
    }
  }, [product]);

  // Build the full images array: use product.images if available, else fall back to imageUrl
  const allImages: string[] = product
    ? (product.images && product.images.length > 0
        ? product.images
        : product.imageUrl
        ? [product.imageUrl]
        : [])
    : [];
  const activeImage = allImages[activeImageIndex] ?? null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && setZoomed(false);
    if (zoomed) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [zoomed]);

  if (isLoading && !product) {
    return (
      <div className="w-full min-h-[100dvh] pt-[120px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full min-h-[100dvh] pt-[120px] flex flex-col items-center justify-center bg-white text-black">
        <h1 className="font-serif text-[42px] italic mb-6">Product not found</h1>
        <Link href="/products">
          <button className="border border-black px-8 py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-colors">
            Back to Collection
          </button>
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const isSoldOut = product.stock === 0;

  const handleAdd = () => {
    if (!activeSize) { showToast("Please select a size"); return; }
    if (isSoldOut) { showToast("This product is sold out"); return; }
    addItem(product, activeSize, activeColor);
  };

  const handleWishlist = () => {
    toggle(product.id);
    showToast(isWishlisted ? `Removed from wishlist` : `Added to wishlist`);
  };

  const discountPct = product.originalPrice
    ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)
    : null;

  const MainImage = () => (
    <div
      className="w-full aspect-[3/4] relative cursor-zoom-in group/img overflow-hidden"
      onClick={() => setZoomed(true)}
    >
      {activeImage ? (
        <motion.img
          key={activeImage}
          src={activeImage}
          alt={product.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full h-full object-cover"
        />
      ) : (
        <FigureSVG
          figType={product.figType}
          ca={product.figColorA}
          cb={product.figColorB}
          className="w-full h-full"
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 bg-black/5">
        <div className="w-10 h-10 bg-white/80 backdrop-blur flex items-center justify-center">
          <ZoomIn size={18} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-[100dvh] pt-[64px] bg-white text-black">

      {/* Zoom Lightbox */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomed(false)}
            className="fixed inset-0 bg-black/90 z-[3000] flex items-center justify-center p-8 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="relative max-w-[600px] w-full max-h-[85vh] flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain max-h-[85vh]"
                />
              ) : (
                <div className="w-full aspect-[3/4]">
                  <FigureSVG figType={product.figType} ca={product.figColorA} cb={product.figColorB} className="w-full h-full" />
                </div>
              )}
            </motion.div>

            {/* Lightbox thumbnail nav (if multiple images) */}
            {allImages.length > 1 && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setActiveImageIndex(i); }}
                    className={`w-12 h-14 overflow-hidden border-2 transition-all ${i === activeImageIndex ? 'border-white' : 'border-white/30 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setZoomed(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={20} strokeWidth={1.5} className="text-white" />
            </button>
            <p className="absolute top-6 left-1/2 -translate-x-1/2 text-white/40 text-[11px] uppercase tracking-[0.2em]">
              Click or press Esc to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Guide Modal */}
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} category={product.category} />

      {/* Breadcrumb */}
      <div className="px-8 py-6 max-w-[1600px] mx-auto flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#999999]">
        <Link href="/"><span className="hover:text-black transition-colors cursor-pointer">Home</span></Link>
        <ChevronRight size={10} />
        <Link href={`/products?category=${product.category}`}>
          <span className="hover:text-black transition-colors cursor-pointer capitalize">{product.category}</span>
        </Link>
        <ChevronRight size={10} />
        <span className="text-black">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 max-w-[1600px] mx-auto min-h-[calc(100vh-140px)]">

        {/* Left: Visuals — thumbnail strip + main image */}
        <div className="flex bg-[#F5F5F5] relative overflow-hidden min-h-[500px]">
          {!activeImage && (
            <div className="absolute inset-0" style={{ background: product.bgGradient, opacity: 0.6 }} />
          )}

          {/* Thumbnail strip (only shown when 2+ images) */}
          {allImages.length > 1 && (
            <div className="flex flex-col gap-2 p-4 z-10 shrink-0 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-hide">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`w-[72px] h-[88px] overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                    i === activeImageIndex ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1 flex items-center justify-center p-8 md:p-10 lg:p-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-[480px]"
            >
              <MainImage />
            </motion.div>
          </div>

          {/* Badges */}
          <div className={`absolute top-8 z-20 flex flex-col gap-2 ${allImages.length > 1 ? 'left-[96px]' : 'left-8'}`}>
            {isSoldOut && (
              <span className="px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-white bg-black">Sold Out</span>
            )}
            {!isSoldOut && product.badge && (
              <span className="px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-white bg-black">
                {product.badge === 'new' ? 'New Arrival' : 'Sale'}
              </span>
            )}
            {discountPct && (
              <span className="px-3 py-1.5 text-[10px] uppercase tracking-[0.15em] text-white bg-black">
                -{discountPct}%
              </span>
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div className="p-8 md:p-12 lg:p-24 flex flex-col justify-center max-w-[600px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#999999] mb-4">{product.brand}</p>
            <h1 className="font-serif text-[clamp(32px,3.5vw,48px)] leading-[1.1] font-light italic mb-6">{product.name}</h1>

            <div className="flex items-center gap-4 mb-10">
              {product.originalPrice && (
                <span className="text-[18px] text-[#999999] line-through">PKR {Number(product.originalPrice).toLocaleString()}</span>
              )}
              <span className="text-[20px] font-medium text-black">
                PKR {Number(product.price).toLocaleString()}
              </span>
              {discountPct && (
                <span className="text-[12px] border border-black px-2 py-0.5 uppercase tracking-[0.1em]">Save {discountPct}%</span>
              )}
            </div>

            <p className="text-[14px] font-light leading-[1.8] text-[#333333] mb-12">
              {product.description}
            </p>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div className="mb-10">
                <p className="text-[11px] uppercase tracking-[0.2em] mb-4">Color</p>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setActiveColor(color)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        activeColor === color ? 'border-black' : 'border-transparent hover:border-[#EAEAEA]'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-[#EAEAEA]"
                        style={{ backgroundColor: color }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div className="mb-12">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[11px] uppercase tracking-[0.2em]">Size</p>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-[10px] text-[#999999] underline underline-offset-4 hover:text-black transition-colors"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setActiveSize(size)}
                      disabled={isSoldOut}
                      className={`py-3 text-[12px] border transition-colors ${
                        isSoldOut
                          ? 'border-[#EAEAEA] text-[#EAEAEA] cursor-not-allowed line-through'
                          : activeSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-[#EAEAEA] text-black hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mb-10">
              <button
                onClick={handleAdd}
                disabled={isSoldOut}
                className={`flex-1 py-4 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                  isSoldOut
                    ? 'bg-[#EAEAEA] text-[#999999] cursor-not-allowed'
                    : 'bg-black text-white hover:bg-[#333333]'
                }`}
              >
                {isSoldOut ? 'Sold Out' : 'Add to Bag'}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 flex items-center justify-center border transition-colors ${
                  isWishlisted ? 'border-black bg-black text-white' : 'border-[#EAEAEA] hover:border-black'
                }`}
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-4 border-t border-[#EAEAEA] pt-8 text-[12px] font-light text-[#666666]">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                <p>Free complimentary shipping on orders over PKR 50,000</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                <p>Free returns within 30 days</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                <p>SKU: {product.sku}</p>
              </div>
              {product.stock > 0 && product.stock <= 5 && (
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                  <p className="font-medium">Only {product.stock} left in stock</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
