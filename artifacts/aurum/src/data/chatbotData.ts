export interface ChatEntry {
  id: string;
  topic: string;
  keywords: string[];
  question: string;
  answer: string;
  followUps: string[];
}

export const WHATSAPP_NUMBER = '923098080081';
export const WHATSAPP_DISPLAY = '03098080081';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
export const CONTACT_EMAIL = 'support@lowkeywardrobe.com'; // [PLACEHOLDER: confirm email]

export const chatbotData: ChatEntry[] = [
  {
    id: 'track_order',
    topic: 'Order Tracking',
    keywords: [
      'track', 'tracking', 'order', 'where', 'status', 'shipped', 'dispatch',
      'my order', 'order number', 'check order', 'order history', 'when',
      'arrive', 'not received', 'still waiting', 'order id', 'delivery status',
      'courier', 'dispatched', 'out for delivery',
    ],
    question: 'TRACK MY ORDER',
    answer: `To track your order, go to **Account → Order History** and enter your order number.\n\n**Order timeline:**\n• 🟡 Pending — payment being verified\n• 🔵 Processing — confirmed, being packed (1–2 days)\n• 🚚 Shipped — tracking number sent via WhatsApp\n• ✅ Delivered — 2–4 days (major cities), 3–6 days (other cities)\n\nNeed urgent help? WhatsApp us at [${WHATSAPP_DISPLAY}](${WHATSAPP_LINK}) with your order number.`,
    followUps: ['shipping', 'contact'],
  },
  {
    id: 'shipping',
    topic: 'Shipping & Delivery',
    keywords: [
      'shipping', 'delivery', 'deliver', 'ship', 'how long', 'days', 'free shipping',
      'shipping fee', 'shipping cost', 'domestic', 'pakistan', 'nationwide',
      'dispatch', 'processing time', 'international', 'abroad', 'outside pakistan',
      'courier', 'express', 'standard', 'leopards', 'tcs', 'blueex', 'postex',
      'major cities', 'lahore', 'karachi', 'islamabad', 'remote', 'rural',
    ],
    question: 'SHIPPING & DELIVERY',
    answer: `**Shipping & Delivery**\n\n🎉 **FREE delivery on all orders over PKR 15,000**\nOrders below PKR 15,000: flat fee of PKR 150–200 (varies by location)\n\n**Delivery timelines:**\n• Major cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad): **2–4 business days**\n• Other cities: **3–6 business days**\n• Remote areas: **5–8 business days**\n\n**Courier partners:** Leopards, TCS, BlueEx, PostEx, M&P\n\n**Processing time:** Orders dispatched within 24 hours of payment confirmation. COD orders dispatched within 24–48 hours.\n\nCurrently shipping within **Pakistan only**. International shipping coming soon!`,
    followUps: ['track_order', 'payment', 'returns'],
  },
  {
    id: 'payment',
    topic: 'Payment Methods',
    keywords: [
      'payment', 'pay', 'how to pay', 'jazzcash', 'easypaisa', 'bank transfer',
      'cod', 'cash on delivery', 'card', 'visa', 'mastercard', 'transaction',
      'screenshot', 'methods', 'options', 'accepted', 'account number',
      'online payment', 'debit', 'credit', 'transfer', 'send money',
    ],
    question: 'PAYMENT METHODS',
    answer: `**We accept the following payment methods:**\n\n💚 **EasyPaisa** — send total to **0300-9650172**, then share your Transaction ID + screenshot on WhatsApp [${WHATSAPP_DISPLAY}](${WHATSAPP_LINK})\n\n🟠 **JazzCash** — send total to **0300-9650172**, same confirmation process\n\n🏦 **Bank Transfer** — contact us on WhatsApp [${WHATSAPP_DISPLAY}](${WHATSAPP_LINK}) to receive bank account details, then share payment proof\n\n🤝 **Cash on Delivery (COD)** — available across Pakistan for orders up to **PKR 15,000**. Pay when your package arrives.\n\n💳 **Visa / Mastercard** — accepted via secure checkout\n\n_Always send payment proof on WhatsApp after completing your transaction._`,
    followUps: ['how_to_pay', 'track_order', 'contact'],
  },
  {
    id: 'how_to_pay',
    topic: 'How to Pay (Step by Step)',
    keywords: [
      'how to pay', 'steps', 'step by step', 'process', 'instructions',
      'checkout process', 'complete order', 'place order', 'confirm',
      'send payment', 'transaction id', 'screenshot', 'proof',
    ],
    question: 'HOW DO I PAY?',
    answer: `**Step-by-step payment guide:**\n\n1. Add items to your cart and proceed to **Checkout**\n2. Choose your payment method\n3. **EasyPaisa / JazzCash:** Transfer the order total to **0300-9650172**, then share your Transaction ID or a screenshot via WhatsApp [${WHATSAPP_DISPLAY}](${WHATSAPP_LINK})\n4. **Bank Transfer:** WhatsApp us for account details, transfer, then send proof\n5. **COD:** Confirm your order — pay the courier on delivery\n6. You'll receive order confirmation via WhatsApp once payment is verified\n\n_Payment must be confirmed before order processing begins (except COD)._`,
    followUps: ['payment', 'track_order'],
  },
  {
    id: 'size_guide',
    topic: 'Size Guide',
    keywords: [
      'size', 'sizing', 'size guide', 'measurements', 'fit', 'chest', 'waist',
      'small', 'medium', 'large', 'xl', 'xxl', 'xs', 'uk size', 'eu size',
      'us size', 'shoe size', 'between sizes', 'which size', 'what size',
      'true to size', 'runs small', 'women size', 'men size', 'bust', 'hips',
      'foot', 'cm', 'inches',
    ],
    question: 'SIZE GUIDE',
    answer: `**Clothing — Men's**\n• XS: Chest 34–36in / Waist 28–30in\n• S: Chest 36–38in / Waist 30–32in\n• M: Chest 38–40in / Waist 32–34in\n• L: Chest 40–42in / Waist 34–36in\n• XL: Chest 42–44in / Waist 36–38in\n• XXL: Chest 44–46in / Waist 38–40in\n• XXXL: Chest 46–48in / Waist 40–42in\n\n**Clothing — Women's**\n• XS: Bust 32–33in / Waist 24–25in / Hips 34–35in\n• S: Bust 34–35in / Waist 26–27in / Hips 36–37in\n• M: Bust 36–37in / Waist 28–29in / Hips 38–39in\n• L: Bust 38–39in / Waist 30–31in / Hips 40–41in\n• XL: Bust 40–41in / Waist 32–33in / Hips 42–43in\n• XXL: Bust 42–44in / Waist 34–36in / Hips 44–46in\n\n**Shoes (PK·UK / EU / US Men / US Women)**\n• 5 / EU 38 / US 5.5 / US 7\n• 6 / EU 39 / US 6.5 / US 8\n• 7 / EU 40 / US 7.5 / US 9\n• 8 / EU 41 / US 8 / US 9.5\n• 9 / EU 42 / US 9 / US 10.5\n• 10 / EU 43 / US 10 / US 11.5\n• 11 / EU 44 / US 11 / US 12.5\n\n_Between sizes? Size up for comfort. You can also send your foot measurements in cm via WhatsApp and we'll help!_`,
    followUps: ['returns', 'contact'],
  },
  {
    id: 'returns',
    topic: 'Returns & Exchanges',
    keywords: [
      'return', 'returns', 'exchange', 'refund', 'send back', 'wrong size',
      'wrong item', 'damaged', 'defective', 'not as described', 'policy',
      'return policy', 'how to return', 'return window', '7 days', 'tags',
      'unworn', 'original packaging', 'sale items', 'replacement',
    ],
    question: 'RETURNS & EXCHANGES',
    answer: `**Returns & Exchanges**\n\n• **7-day return window** from delivery date\n• Items must be **unused, unwashed**, tags attached, in original packaging\n• **Sale items are not eligible** for return\n\n**Return process:**\n1. Contact us with your Order ID + photos via WhatsApp [${WHATSAPP_DISPLAY}](${WHATSAPP_LINK})\n2. We verify your claim within 24 hours\n3. Courier arranged for pickup (free for defective items)\n4. Replacement or refund processed within **3–5 business days**\n\n_Received a wrong or damaged item? Contact us within 24 hours of delivery — we'll arrange a free replacement or full refund._`,
    followUps: ['shipping', 'size_guide', 'contact'],
  },
  {
    id: 'contact',
    topic: 'Contact Us',
    keywords: [
      'contact', 'help', 'support', 'reach', 'talk', 'speak', 'human', 'agent',
      'whatsapp', 'email', 'phone', 'call', 'message', 'instagram', 'social',
      'hours', 'open', 'available', 'customer service', 'customer care',
      'team', 'representative',
    ],
    question: 'CONTACT US',
    answer: `**Get in touch:**\n\n📱 **WhatsApp:** [${WHATSAPP_DISPLAY}](${WHATSAPP_LINK}) — fastest response\n📧 **Email:** ${CONTACT_EMAIL}\n📸 **Instagram:** [PLACEHOLDER: @handle]\n\n**Business hours:** Monday–Saturday, 10 AM – 8 PM (PKT)\n\nWe typically respond within 1–2 hours during business hours. For urgent order issues, WhatsApp is the quickest way to reach us.`,
    followUps: ['track_order', 'returns'],
  },
  {
    id: 'cancel_modify',
    topic: 'Cancel or Modify Order',
    keywords: [
      'cancel', 'cancellation', 'modify', 'change order', 'edit order',
      'change address', 'wrong address', 'change size', 'change item',
      'cancel order', 'stop order',
    ],
    question: 'CANCEL / MODIFY ORDER',
    answer: `**Cancelling or modifying an order:**\n\nOrders can be **cancelled or modified within 2 hours** of placement. After that, the order enters processing and cannot be changed.\n\nTo cancel or modify quickly, WhatsApp us immediately at [${WHATSAPP_DISPLAY}](${WHATSAPP_LINK}) with your order number.\n\n**Business hours:** Mon–Sat, 10 AM – 8 PM (PKT)`,
    followUps: ['track_order', 'contact'],
  },
  {
    id: 'about',
    topic: 'About Lowkey Wardrobe',
    keywords: [
      'about', 'brand', 'who are you', 'lowkey wardrobe', 'story', 'founded',
      'based', 'pakistan', 'luxury', 'what is', 'values', 'mission', 'authentic',
      'original', 'quality', 'genuine',
    ],
    question: 'ABOUT US',
    answer: `**About Lowkey Wardrobe**\n\n[PLACEHOLDER: 2–3 sentences about the brand story and values]\n\nWe offer high-quality clothing, shoes, and accessories — all 100% authentic and quality-checked before dispatch.\n\n• **Customer service:** Mon–Sat, 10 AM – 8 PM (PKT)\n• **WhatsApp:** [${WHATSAPP_DISPLAY}](${WHATSAPP_LINK})\n• **Email:** ${CONTACT_EMAIL}\n• **Instagram:** [PLACEHOLDER: @handle]`,
    followUps: ['contact', 'shipping'],
  },
  {
    id: 'gift_wrap',
    topic: 'Gift Wrapping',
    keywords: [
      'gift', 'gift wrap', 'wrapping', 'gift box', 'packaging', 'present',
      'gift message', 'complimentary', 'box',
    ],
    question: 'GIFT WRAPPING',
    answer: `**Complimentary Gift Wrapping**\n\nAll Lowkey Wardrobe orders come with complimentary gift wrapping automatically — no need to request it. Your order arrives beautifully packaged.\n\n[PLACEHOLDER: confirm if personalised gift messages are supported and how to add them]`,
    followUps: ['shipping', 'contact'],
  },
  {
    id: 'cod',
    topic: 'Cash on Delivery',
    keywords: [
      'cod', 'cash on delivery', 'pay on delivery', 'pay cash', 'cash',
      'doorstep payment', 'pay when delivered', 'no advance', 'without payment',
    ],
    question: 'CASH ON DELIVERY',
    answer: `**Cash on Delivery (COD)**\n\nCOD is available **across Pakistan** for orders up to **PKR 15,000**.\n\nFor orders above PKR 15,000, partial advance payment may be required.\n\nCOD orders are dispatched within **24–48 hours**. Pay the courier when your package arrives at your door.\n\nQuestions? WhatsApp us at [${WHATSAPP_DISPLAY}](${WHATSAPP_LINK}).`,
    followUps: ['track_order', 'shipping'],
  },
];

export const MAIN_QUICK_REPLIES = [
  'track_order',
  'shipping',
  'payment',
  'size_guide',
  'returns',
  'contact',
];

export function matchEntry(input: string): ChatEntry | null {
  const clean = input.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ').filter(w => w.length > 1);

  let best: ChatEntry | null = null;
  let bestScore = 0;

  for (const entry of chatbotData) {
    let score = 0;
    for (const kw of entry.keywords) {
      const kwClean = kw.toLowerCase();
      if (clean.includes(kwClean)) {
        score += kwClean.includes(' ') ? 3 : 1;
      } else {
        for (const w of words) {
          if (kwClean === w || kwClean.startsWith(w) || w.startsWith(kwClean)) score += 0.5;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore >= 1.5 ? best : null;
}

export function getEntry(id: string): ChatEntry | undefined {
  return chatbotData.find(e => e.id === id);
}
