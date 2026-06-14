import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../stores/cartStore';
import { FigureSVG } from './FigureSVG';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';

const FREE_SHIPPING_THRESHOLD = 50000;

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQty, removeItem, total, shipping } = useCartStore();
  const subtotal = total();
  const ship = shipping();

  const fmt = (n: number) => `PKR ${n.toLocaleString()}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 z-[1001]"
          />
          <motion.div
            initial={{ x: 440 }}
            animate={{ x: 0 }}
            exit={{ x: 440 }}
            transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.4 }}
            className="fixed top-0 right-0 bottom-0 w-[400px] max-w-[95vw] bg-white z-[1002] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-[#EAEAEA]">
              <div className="flex items-center gap-3">
                <h2 className="font-serif text-[22px] italic font-light">Your Bag</h2>
                {items.length > 0 && (
                  <span className="text-[12px] text-[#999999]">({items.reduce((a, i) => a + i.quantity, 0)})</span>
                )}
              </div>
              <button onClick={closeCart} className="p-1.5 hover:bg-[#F5F5F5] rounded-full transition-colors">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Free shipping progress */}
            {subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 && (
              <div className="px-7 py-3 bg-[#F5F5F5] border-b border-[#EAEAEA]">
                <div className="w-full bg-[#EAEAEA] h-[2px] mb-2">
                  <div className="bg-black h-[2px] transition-all duration-700" style={{ width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }} />
                </div>
                <p className="text-[11px] text-[#666666]">
                  Add <strong>PKR {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()}</strong> for free shipping
                </p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-7 py-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={36} strokeWidth={1} className="text-[#EAEAEA] mb-5" />
                  <p className="font-serif text-[20px] italic text-[#999999]">Your bag is empty</p>
                  <p className="text-[12px] text-[#BDBDBD] mt-2 mb-8">Discover our curated collection</p>
                  <button
                    onClick={closeCart}
                    className="border border-black px-8 py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-colors duration-300"
                  >
                    Shop Collection
                  </button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-[#F5F5F5]">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 py-5">
                      <div className="w-[72px] h-[90px] relative overflow-hidden shrink-0 bg-[#F0F0F0]">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <div className="absolute inset-0" style={{ background: item.bgGradient }} />
                            <FigureSVG
                              figType={item.figType}
                              ca={item.figColorA}
                              cb={item.figColorB}
                              className="w-full h-full absolute inset-0"
                            />
                          </>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <p className="text-[9px] uppercase tracking-[0.2em] text-[#999999] mb-0.5">{item.brand}</p>
                              <p className="text-[13px] leading-tight truncate">{item.name}</p>
                            </div>
                            <p className="text-[13px] shrink-0">PKR {(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[11px] text-[#999999]">Size: {item.size}</p>
                            <span className="text-[#EAEAEA]">·</span>
                            <div
                              className="w-3 h-3 rounded-full border border-[#EAEAEA]"
                              style={{ backgroundColor: item.colorHex }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-[#EAEAEA]">
                            <button onClick={() => updateQty(item.productId, item.size, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors">
                              <Minus size={10} />
                            </button>
                            <span className="w-7 text-center text-[12px]">{item.quantity}</span>
                            <button onClick={() => updateQty(item.productId, item.size, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors">
                              <Plus size={10} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.size)}
                            className="text-[10px] uppercase tracking-[0.1em] text-[#999999] hover:text-black transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#EAEAEA] px-7 py-5 bg-white">
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-[13px] text-[#666666]">
                    <span>Subtotal</span>
                    <span className="text-black">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-[#666666]">
                    <span>Shipping</span>
                    <span className="text-black">
                      {ship === 0 ? 'Complimentary' : fmt(ship)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[15px] font-medium pt-3 border-t border-[#EAEAEA]">
                    <span>Total</span>
                    <span>{fmt(subtotal + ship)}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <Link href="/checkout" onClick={closeCart}>
                    <div className="w-full bg-black text-white text-center py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors cursor-pointer">
                      Checkout
                    </div>
                  </Link>
                  <button
                    onClick={closeCart}
                    className="w-full border border-[#EAEAEA] text-black py-3.5 text-[11px] uppercase tracking-[0.15em] hover:border-black transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
