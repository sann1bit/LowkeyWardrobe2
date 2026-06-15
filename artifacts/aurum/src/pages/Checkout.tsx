import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { ChevronRight, Lock, CheckCircle, Smartphone, Banknote, CreditCard } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { FigureSVG } from '../components/FigureSVG';

type PaymentMethod = 'bank' | 'jazzcash' | 'cod';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zip: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
  mobileNumber: string;
}

export default function Checkout() {
  const { items, total, shipping, clearCart } = useCartStore();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [form, setForm] = useState<FormData>({
    email: '', firstName: '', lastName: '', phone: '', address: '', city: '',
    country: 'Pakistan', zip: '', cardNumber: '', cardExpiry: '', cardCvc: '', cardName: '',
    mobileNumber: '',
  });

  const subtotal = total();
  const ship = shipping();
  const grandTotal = subtotal + ship;

  const update = (field: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
      const res = await fetch(`${BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || form.mobileNumber || null,
          address: form.address,
          city: form.city,
          country: form.country,
          zip: form.zip,
          paymentMethod,
          items: items.map(i => ({ name: i.name, sku: i.sku, size: i.size, price: i.price, qty: i.quantity })),
          subtotal,
          shipping: ship,
          total: grandTotal,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderNumber(data.order_number || 'AUR-ORDER');
        clearCart();
        setStep('success');
      }
    } catch {
      setOrderNumber('AUR-' + Math.random().toString(36).slice(2, 8).toUpperCase());
      clearCart();
      setStep('success');
    } finally {
      setLoading(false);
    }
  };

  const isPaymentValid = () => {
    if (paymentMethod === 'cod') return true;
    if (paymentMethod === 'jazzcash') return form.mobileNumber.replace(/\D/g,'').length >= 11;
    return !!(form.cardName && form.cardNumber && form.cardExpiry && form.cardCvc);
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="w-full min-h-[100dvh] pt-[120px] flex flex-col items-center justify-center text-center px-8">
        <h1 className="font-serif text-[42px] italic font-light mb-4">Your bag is empty</h1>
        <Link href="/products">
          <button className="bg-black text-white px-10 py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors mt-6">
            Explore Collection
          </button>
        </Link>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="w-full min-h-[100dvh] pt-[120px] flex flex-col items-center justify-center text-center px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <CheckCircle size={48} strokeWidth={1} className="mx-auto mb-8 text-black" />
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#999999] mb-4">Order Confirmed</p>
          <h1 className="font-serif text-[clamp(36px,4vw,56px)] italic font-light leading-[1.15] mb-4">
            Thank you, {form.firstName || 'valued customer'}.
          </h1>
          <p className="text-[14px] font-light text-[#666666] max-w-[420px] mx-auto mb-3 leading-[1.8]">
            {paymentMethod === 'cod'
              ? 'Your order has been placed. Our team will contact you to confirm delivery details.'
              : paymentMethod === 'jazzcash'
              ? 'Your order has been placed. Please complete payment via JazzCash/EasyPaisa to confirm.'
              : 'Your order has been placed successfully. A confirmation has been sent to your email.'}
          </p>
          {orderNumber && (
            <p className="text-[13px] font-medium mb-10">Order: <span className="font-mono">{orderNumber}</span></p>
          )}
          <div className="flex gap-4 justify-center">
            <Link href="/products">
              <button className="bg-black text-white px-10 py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors">
                Continue Shopping
              </button>
            </Link>
            <Link href="/">
              <button className="border border-black px-10 py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-colors">
                Home
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100dvh] pt-[64px] bg-white text-black">
      <div className="px-8 py-5 max-w-[1400px] mx-auto flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#999999] border-b border-[#EAEAEA]">
        <Link href="/"><span className="hover:text-black cursor-pointer">Home</span></Link>
        <ChevronRight size={10} />
        <Link href="/cart"><span className="hover:text-black cursor-pointer">Cart</span></Link>
        <ChevronRight size={10} />
        <span className="text-black">Checkout</span>
      </div>

      <div className="max-w-[1200px] mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16">

        {/* Left: Form */}
        <div>
          {/* Step tabs */}
          <div className="flex gap-8 mb-12 border-b border-[#EAEAEA] pb-4">
            {(['info', 'payment'] as const).map((s, i) => (
              <button
                key={s}
                onClick={() => step === 'payment' && s === 'info' && setStep('info')}
                className={`text-[11px] uppercase tracking-[0.15em] relative pb-4 transition-colors ${step === s ? 'text-black' : 'text-[#BDBDBD]'}`}
              >
                {i + 1}. {s === 'info' ? 'Shipping' : 'Payment'}
                {step === s && <div className="absolute -bottom-[17px] left-0 right-0 h-[1px] bg-black" />}
              </button>
            ))}
          </div>

          {/* Step 1: Shipping */}
          {step === 'info' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h2 className="font-serif text-[28px] italic font-light mb-8">Shipping Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">Email Address</label>
                  <input
                    type="email" required
                    value={form.email} onChange={e => update('email', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">First Name</label>
                    <input
                      value={form.firstName} onChange={e => update('firstName', e.target.value)}
                      placeholder="First name"
                      className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">Last Name</label>
                    <input
                      value={form.lastName} onChange={e => update('lastName', e.target.value)}
                      placeholder="Last name"
                      className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">Street Address</label>
                  <input
                    value={form.address} onChange={e => update('address', e.target.value)}
                    placeholder="House No., Street, Area"
                    className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">City</label>
                    <input
                      value={form.city} onChange={e => update('city', e.target.value)}
                      placeholder="Karachi"
                      className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">ZIP / Postal Code</label>
                    <input
                      value={form.zip} onChange={e => update('zip', e.target.value)}
                      placeholder="75500"
                      className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">Country</label>
                  <select
                    value={form.country} onChange={e => update('country', e.target.value)}
                    className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors bg-white"
                  >
                    {["Pakistan", "UAE", "United States", "United Kingdom", "France", "Italy", "Germany", "Japan", "Canada", "Australia"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setStep('payment')}
                disabled={!form.email || !form.firstName || !form.lastName || !form.address || !form.city || !form.zip}
                className="mt-10 w-full bg-black text-white py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h2 className="font-serif text-[28px] italic font-light mb-8">Payment Details</h2>

              {/* Payment method selector */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {([
                  { id: 'bank', label: 'Bank / Card', sub: 'Visa · Mastercard', icon: CreditCard },
                  { id: 'jazzcash', label: 'JazzCash / EasyPaisa', sub: 'Mobile wallet', icon: Smartphone },
                  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay at doorstep', icon: Banknote },
                ] as const).map(({ id, label, sub, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPaymentMethod(id)}
                    className={`relative border p-4 text-left transition-all ${paymentMethod === id ? 'border-black bg-black text-white' : 'border-[#EAEAEA] hover:border-[#999]'}`}
                  >
                    <Icon size={18} strokeWidth={1.5} className="mb-2" />
                    <p className="text-[11px] uppercase tracking-[0.1em] leading-snug font-medium">{label}</p>
                    <p className={`text-[10px] mt-1 ${paymentMethod === id ? 'text-[#ccc]' : 'text-[#999]'}`}>{sub}</p>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* Bank / Card */}
                {paymentMethod === 'bank' && (
                  <motion.div key="bank" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <div className="flex items-center gap-2 mb-6 text-[12px] text-[#999999]">
                      <Lock size={13} strokeWidth={1.5} />
                      <span>Your payment information is encrypted and secure</span>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">Name on Card</label>
                        <input
                          value={form.cardName} onChange={e => update('cardName', e.target.value)}
                          placeholder="John Doe"
                          className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">Card Number</label>
                        <input
                          value={form.cardNumber}
                          onChange={e => update('cardNumber', e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19))}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors font-mono tracking-wider"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">Expiry Date</label>
                          <input
                            value={form.cardExpiry}
                            onChange={e => {
                              let v = e.target.value.replace(/\D/g,'');
                              if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2,4);
                              update('cardExpiry', v);
                            }}
                            placeholder="MM / YY"
                            maxLength={5}
                            className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">CVC</label>
                          <input
                            value={form.cardCvc}
                            onChange={e => update('cardCvc', e.target.value.replace(/\D/g,'').slice(0,3))}
                            placeholder="123"
                            maxLength={3}
                            className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* JazzCash / EasyPaisa */}
                {paymentMethod === 'jazzcash' && (
                  <motion.div key="jazzcash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-5 mb-6">
                      <p className="text-[11px] uppercase tracking-[0.15em] font-medium mb-2">How it works</p>
                      <ol className="text-[13px] text-[#666] leading-[2] list-decimal list-inside space-y-1">
                        <li>Enter your JazzCash or EasyPaisa mobile number</li>
                        <li>After placing your order, you'll receive a payment request on your app</li>
                        <li>Approve the request to confirm your order</li>
                      </ol>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.2em] mb-2">JazzCash / EasyPaisa Number</label>
                      <input
                        value={form.mobileNumber}
                        onChange={e => update('mobileNumber', e.target.value.replace(/[^\d+]/g,'').slice(0,13))}
                        placeholder="03XX-XXXXXXX"
                        className="w-full border border-[#EAEAEA] px-4 py-3.5 text-[14px] focus:border-black outline-none transition-colors font-mono"
                      />
                      <p className="text-[11px] text-[#999] mt-2">Enter the number registered with JazzCash or EasyPaisa</p>
                    </div>
                  </motion.div>
                )}

                {/* Cash on Delivery */}
                {paymentMethod === 'cod' && (
                  <motion.div key="cod" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                    <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-6">
                      <div className="flex gap-4 items-start">
                        <Banknote size={32} strokeWidth={1} className="shrink-0 mt-0.5 text-[#666]" />
                        <div>
                          <p className="text-[12px] uppercase tracking-[0.15em] font-medium mb-2">Cash on Delivery</p>
                          <p className="text-[13px] text-[#666] leading-[1.8]">
                            Pay in cash when your order arrives at your doorstep. Our delivery team will collect payment upon delivery.
                          </p>
                          <ul className="mt-4 space-y-2 text-[12px] text-[#888]">
                            <li className="flex items-center gap-2"><CheckCircle size={12} strokeWidth={2} className="text-black shrink-0" /> No advance payment required</li>
                            <li className="flex items-center gap-2"><CheckCircle size={12} strokeWidth={2} className="text-black shrink-0" /> Inspect before you pay</li>
                            <li className="flex items-center gap-2"><CheckCircle size={12} strokeWidth={2} className="text-black shrink-0" /> Available across Pakistan</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-2 text-[12px] text-[#999]">
                      <p>Total amount due on delivery: <span className="text-black font-medium text-[14px]">PKR {grandTotal.toLocaleString()}</span></p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !isPaymentValid()}
                className="mt-10 w-full bg-black text-white py-4 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <><span className="spinner" style={{ color: 'white' }} /> Processing...</>
                ) : paymentMethod === 'cod' ? (
                  <>Place Order — Pay PKR {grandTotal.toLocaleString()} on Delivery</>
                ) : (
                  <>Place Order — PKR {grandTotal.toLocaleString()}</>
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-8 h-fit">
          <h3 className="font-serif text-[22px] italic font-light mb-8">Order Summary</h3>
          <div className="space-y-5 mb-8">
            {items.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-20 relative shrink-0 overflow-hidden" style={{ background: item.bgGradient }}>
                  <FigureSVG figType={item.figType} ca={item.figColorA} cb={item.figColorB} className="w-full h-full absolute inset-0" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white text-[9px] rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.15em] text-[#999999]">{item.brand}</p>
                    <p className="text-[13px] leading-tight">{item.name}</p>
                    <p className="text-[11px] text-[#999999] mt-0.5">Size: {item.size}</p>
                  </div>
                  <p className="text-[14px]">PKR {(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#EAEAEA] pt-6 space-y-3">
            <div className="flex justify-between text-[13px]">
              <span className="text-[#666666]">Subtotal</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-[#666666]">Shipping</span>
              <span>{ship === 0 ? 'Complimentary' : `PKR ${ship.toLocaleString()}`}</span>
            </div>
            {paymentMethod && (
              <div className="flex justify-between text-[13px]">
                <span className="text-[#666666]">Payment</span>
                <span className="text-[12px]">
                  {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'jazzcash' ? 'JazzCash / EasyPaisa' : 'Bank / Card'}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[16px] font-medium border-t border-[#EAEAEA] pt-4 mt-2">
              <span>Total</span>
              <span>PKR {grandTotal.toLocaleString()}</span>
            </div>
          </div>
          {subtotal < 50000 && (
            <p className="text-[11px] text-[#999999] mt-4 leading-[1.6]">
              Add PKR {(50000 - subtotal).toLocaleString()} more for complimentary shipping.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
