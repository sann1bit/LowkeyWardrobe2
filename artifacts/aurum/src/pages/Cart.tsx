import { useCartStore } from '../stores/cartStore';
import { Link } from 'wouter';
import { FigureSVG } from '../components/FigureSVG';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Cart() {
  const { items, total, shipping, updateQty, removeItem } = useCartStore();

  return (
    <div className="w-full min-h-[100dvh] pt-[120px] pb-24 bg-white text-black">
      <div className="max-w-[1200px] mx-auto px-8">
        <h1 className="font-serif text-[clamp(36px,4vw,56px)] italic font-light mb-16 text-center">Your Bag</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 border-y border-[#EAEAEA]">
            <p className="text-[16px] text-[#666666] mb-8 font-light">Your shopping bag is empty.</p>
            <Link href="/products">
              <button className="bg-black text-white px-10 py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors">
                Continue Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            {/* Items List */}
            <div className="lg:col-span-2 flex flex-col gap-10">
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] text-[#999999]">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-[#EAEAEA] pb-10">
                  <div className="col-span-1 md:col-span-6 flex gap-6">
                    <Link href={`/products/${item.productId}`}>
                      <div className="w-[100px] h-[125px] bg-[#F5F5F5] relative overflow-hidden shrink-0 cursor-pointer group">
                        <div className="absolute inset-0" style={{ background: item.bgGradient }} />
                        <FigureSVG 
                          figType={item.figType} 
                          ca={item.figColorA} 
                          cb={item.figColorB} 
                          className="w-full h-full absolute inset-0 group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    </Link>
                    <div className="flex flex-col justify-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-1">{item.brand}</p>
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="text-[16px] mb-2 hover:opacity-70 transition-opacity cursor-pointer">{item.name}</h3>
                      </Link>
                      <p className="text-[13px] text-[#666666] font-light mb-1">Color: <span className="inline-block w-3 h-3 rounded-full border border-[#EAEAEA] ml-1 align-middle" style={{backgroundColor: item.colorHex}}></span></p>
                      <p className="text-[13px] text-[#666666] font-light mb-4">Size: {item.size}</p>
                      <button 
                        onClick={() => removeItem(item.productId, item.size)}
                        className="text-[11px] uppercase tracking-[0.1em] text-[#999999] hover:text-black underline-offset-4 hover:underline text-left self-start"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                    <div className="flex items-center border border-[#EAEAEA]">
                      <button 
                        onClick={() => updateQty(item.productId, item.size, -1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-[#F5F5F5]"
                      >
                        <Minus size={14} strokeWidth={1.5} />
                      </button>
                      <span className="w-10 text-center text-[14px]">{item.quantity}</span>
                      <button 
                        onClick={() => updateQty(item.productId, item.size, 1)}
                        className="w-10 h-10 flex items-center justify-center hover:bg-[#F5F5F5]"
                      >
                        <Plus size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 text-left md:text-right hidden md:block">
                    <span className="text-[15px] font-light">${item.price}</span>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-between md:block text-right">
                    <span className="md:hidden text-[13px] text-[#666666]">Total</span>
                    <span className="text-[16px] font-medium md:font-light">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#FAFAFA] p-8 border border-[#EAEAEA] sticky top-[100px]">
                <h3 className="font-serif text-[24px] italic mb-8">Order Summary</h3>
                
                <div className="flex flex-col gap-4 text-[14px] font-light text-[#333333] mb-8">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${total().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping() === 0 ? 'Free' : `$${shipping().toFixed(2)}`}</span>
                  </div>
                  {shipping() > 0 && (
                    <div className="text-[12px] text-[#999999] mt-[-8px]">
                      Spend ${(250 - total()).toFixed(2)} more for free shipping
                    </div>
                  )}
                </div>

                <div className="border-t border-[#EAEAEA] pt-6 flex justify-between text-[18px] font-medium mb-8">
                  <span>Total</span>
                  <span>${(total() + shipping()).toFixed(2)}</span>
                </div>

                <button className="w-full bg-black text-white py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors mb-4">
                  Proceed to Checkout
                </button>

                <div className="flex justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer mr-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_Pay_logo.svg" alt="Apple Pay" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
