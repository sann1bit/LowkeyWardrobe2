import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useGetProduct } from '@workspace/api-client-react';
import { products as hardcodedProducts, Product } from '../data/products';
import { FigureSVG } from '../components/FigureSVG';
import { SizeGuideModal } from '../components/SizeGuideModal';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useUIStore } from '../stores/uiStore';
import { Heart, ChevronRight, X, ChevronLeft, ChevronRight as ChevronRightIcon, Expand } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetail() {
  const [, params] = useRoute('/products/:slug');
  const slug = params?.slug;

  const { data: apiProduct, isLoading } = useGetProduct(slug || '', { query: { enabled: !!slug } });
  const product: Product | undefined = (apiProduct as any) || hardcodedProducts.find(p => p.slug === slug);

  const [activeSize, setActiveSize] = useState<string>('');
  const [activeColor, setActiveColor] = useState<string>('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
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

  const allImages: string[] = product
    ? (product.images && product.images.length > 0
        ? product.images
        : product.imageUrl
        ? [product.imageUrl]
        : [])
    : [];
  const activeImage = allImages[activeImageIndex] ?? null;

  // Keyboard listeners for lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setActiveImageIndex(i => (i + 1) % allImages.length);
      if (e.key === 'ArrowLeft') setActiveImageIndex(i => (i - 1 + allImages.length) % allImages.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, allImages.length]);

  if (isLoading && !product) {
    return (
      <div className="w-full min-h-[100dvh] pt-[120px] pb-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="flex gap-4">
              <div className="hidden lg:flex flex-col gap-3 w-[72px] shrink-0 pt-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton w-[56px] h-[72px] rounded-[1px]" />
                ))}
              </div>
              <div className="skeleton flex-1 min-h-[70vh] rounded-[1px]" />
            </div>
            <div className="pt-4 flex flex-col gap-5">
              <div className="skeleton h-[10px] w-[35%] rounded-[2px]" />
              <div className="skeleton h-[38px] w-[80%] rounded-[2px]" />
              <div className="skeleton h-[20px] w-[22%] rounded-[2px]" />
              <div className="h-[1px] bg-[#EAEAEA] my-2" />
              <div className="flex flex-col gap-2">
                <div className="skeleton h-[11px] w-full rounded-[2px]" />
                <div className="skeleton h-[11px] w-[90%] rounded-[2px]" />
                <div className="skeleton h-[11px] w-[75%] rounded-[2px]" />
              </div>
              <div className="h-[1px] bg-[#EAEAEA] my-2" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-[36px] w-[48px] rounded-[2px]" />
                ))}
              </div>
              <div className="skeleton h-[52px] w-full rounded-[2px] mt-4" />
            </div>
          </div>
        </div>
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

  const thumbnailButton = (img: string, i: number, size: 'mobile' | 'desktop') => {
    const isActive = i === activeImageIndex;
    const sizeClasses =
      size === 'desktop'
        ? 'w-[56px] h-[72px]'
        : 'w-[52px] h-[68px]';

    return (
      <button
        key={`${img}-${i}`}
        type="button"
        onClick={() => setActiveImageIndex(i)}
        aria-label={`View image ${i + 1}`}
        aria-current={isActive}
        className={`${sizeClasses} shrink-0 overflow-hidden bg-white border transition-all duration-200 ${isActive ? 'border-black' : 'border-[#E0E0E0] hover:border-[#999999]'}`}
      >
        <img src={img} alt="" className="w-full h-full object-cover" />
      </button>
    );
  };

  return (
    <div className="w-full min-h-[100dvh] pt-[64px] bg-white text-black">

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 bg-black/95 z-[3000] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="relative max-h-[90vh] flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  className="max-h-[85vh] max-w-[90vw] object-contain select-none"
                  draggable={false}
                />
              ) : (
                <div className="w-[480px] aspect-[3/4]">
                  <FigureSVG figType={product.figType} ca={product.figColorA} cb={product.figColorB} className="w-full h-full" />
                </div>
              )}
            </motion.div>

            {/* Prev / Next */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); setActiveImageIndex(i => (i - 1 + allImages.length) % allImages.length); }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={22} className="text-white" strokeWidth={1.5} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setActiveImageIndex(i => (i + 1) % allImages.length); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <ChevronRightIcon size={22} className="text-white" strokeWidth={1.5} />
                </button>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={e => { e.stopPropagation(); setActiveImageIndex(i); }}
                      className={`w-12 h-14 overflow-hidden border-2 transition-all ${i === activeImageIndex ? 'border-white' : 'border-white/25 opacity-50 hover:opacity-90'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={20} strokeWidth={1.5} className="text-white" />
            </button>
            <p className="absolute top-7 left-1/2 -translate-x-1/2 text-white/30 text-[10px] uppercase tracking-[0.25em] pointer-events-none">
              {allImages.length > 1 ? `${activeImageIndex + 1} / ${allImages.length}` : 'Click or Esc to close'}
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

      <div className="grid grid-cols-1 md:grid-cols-2 max-w-[1600px] mx-auto min-h-[calc(100vh-64px)]">

        {/* Left: Image gallery — SSENSE / Zara style */}
        <div className="flex flex-col bg-white md:sticky md:top-[64px] md:h-[calc(100vh-64px)] md:border-r border-[#EAEAEA]">

          {/* Mobile thumbnail strip */}
          {allImages.length > 1 && (
            <div className="md:hidden flex gap-2.5 px-4 pt-4 pb-3 overflow-x-auto scrollbar-hide border-b border-[#EAEAEA]">
              {allImages.map((img, i) => thumbnailButton(img, i, 'mobile'))}
            </div>
          )}

          <div className="flex flex-1 min-h-[65vh] md:min-h-0">
            {/* Desktop thumbnail rail */}
            {allImages.length > 1 && (
              <nav
                className="hidden md:flex flex-col items-center gap-3 shrink-0 w-[88px] py-10 px-4 border-r border-[#EAEAEA] overflow-y-auto scrollbar-hide"
                aria-label="Product images"
              >
                {allImages.map((img, i) => thumbnailButton(img, i, 'desktop'))}
              </nav>
            )}

            {/* Main image viewer */}
            <div className="relative flex-1 min-h-0 bg-[#FAFAFA] md:bg-white">
              {!activeImage && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: product.bgGradient, opacity: 0.35 }}
                />
              )}

              {/* Badges */}
              <div className="absolute top-5 left-5 z-10 flex flex-col gap-1.5">
                {isSoldOut && (
                  <span className="px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-white bg-black">
                    Sold Out
                  </span>
                )}
                {!isSoldOut && product.badge && (
                  <span className="px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-white bg-black">
                    {product.badge === 'new' ? 'New Arrival' : 'Sale'}
                  </span>
                )}
                {discountPct && (
                  <span className="px-2.5 py-1 text-[9px] uppercase tracking-[0.15em] text-white bg-black">
                    -{discountPct}%
                  </span>
                )}
              </div>

              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                onClick={() => activeImage && setLightboxOpen(true)}
                disabled={!activeImage}
                className={`group absolute inset-0 flex items-center justify-center p-6 md:p-10 lg:p-12 w-full h-full ${activeImage ? 'cursor-zoom-in' : 'cursor-default'}`}
                aria-label="View fullscreen image"
              >
                {activeImage ? (
                  <motion.img
                    key={activeImage}
                    src={activeImage}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="max-h-full max-w-full w-auto h-auto object-contain select-none"
                    draggable={false}
                  />
                ) : (
                  <FigureSVG
                    figType={product.figType}
                    ca={product.figColorA}
                    cb={product.figColorB}
                    className="w-full h-full max-h-[min(80vh,900px)]"
                  />
                )}

                {activeImage && (
                  <span className="absolute bottom-5 right-5 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 border border-[#EAEAEA] text-[9px] uppercase tracking-[0.15em] text-[#666666] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <Expand size={12} strokeWidth={1.5} />
                    Fullscreen
                  </span>
                )}
              </motion.button>

              {activeImage && allImages.length > 1 && (
                <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.2em] text-[#AAAAAA] pointer-events-none select-none md:hidden">
                  {activeImageIndex + 1} / {allImages.length}
                </p>
              )}
            </div>
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
                <p>Free shipping on orders over PKR 15,000</p>
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
