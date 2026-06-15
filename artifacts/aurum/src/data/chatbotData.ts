export interface ChatEntry {
  id: string;
  topic: string;
  keywords: string[];
  question: string;
  answer: string;
  followUps: string[];
}

export const WHATSAPP_NUMBER = '923098080081';
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
// [PLACEHOLDER: email address]
export const CONTACT_EMAIL = 'hello@lowkeywardrobe.com';

export const chatbotData: ChatEntry[] = [
  {
    id: 'track_order',
    topic: 'Order Tracking',
    keywords: [
      'track', 'tracking', 'order', 'where', 'status', 'shipped', 'dispatch',
      'delivery status', 'my order', 'order number', 'check order', 'order history',
      'when', 'arrive', 'not received', 'still waiting', 'order id',
    ],
    question: 'TRACK MY ORDER',
    answer: `To track your order:\n\n1. Go to **Account → Order History** and enter your order number + email.\n\nOrder timeline:\n• **Processing** — 1–2 business days after you place your order\n• **Shipped** — tracking number sent via WhatsApp\n• **Delivered** — 3–5 business days (domestic Pakistan)\n\nNeed urgent help? WhatsApp us at [03098080081](https://wa.me/923098080081) with your order number and we'll update you right away.`,
    followUps: ['shipping', 'contact'],
  },
  {
    id: 'shipping',
    topic: 'Shipping & Delivery',
    keywords: [
      'shipping', 'delivery', 'deliver', 'ship', 'how long', 'days', 'free shipping',
      'shipping fee', 'shipping cost', 'domestic', 'pakistan', 'nationwide',
      'dispatch', 'processing time', 'international', 'abroad', 'outside pakistan',
      'courier', 'express', 'standard',
    ],
    question: 'SHIPPING & DELIVERY',
    answer: `**Shipping & Delivery**\n\n• **Domestic (Pakistan):** 3–5 business days after dispatch\n• **FREE shipping** on all orders over PKR 50,000\n• Standard shipping fee (under PKR 50,000): PKR 250 [PLACEHOLDER: confirm fee]\n• Order processing time before dispatch: 1–2 business days [PLACEHOLDER: confirm]\n• **International shipping:** [PLACEHOLDER: available / not available, timeframe and cost]\n\nAll orders include complimentary gift wrapping — no need to request it.`,
    followUps: ['track_order', 'payment', 'returns'],
  },
  {
    id: 'payment',
    topic: 'Payment Methods',
    keywords: [
      'payment', 'pay', 'how to pay', 'jazzcash', 'easypaisa', 'bank transfer',
      'cod', 'cash on delivery', 'card', 'visa', 'mastercard', 'transaction',
      'screenshot', 'methods', 'options', 'accepted', 'account number', 'iban',
      'online payment', 'debit', 'credit',
    ],
    question: 'PAYMENT METHODS',
    answer: `**We accept the following payment methods:**\n\n• **JazzCash** — send total to [PLACEHOLDER: JazzCash number], then share your transaction ID via WhatsApp [03098080081](https://wa.me/923098080081) or enter it at checkout\n• **EasyPaisa** — send total to [PLACEHOLDER: EasyPaisa number], same confirmation process\n• **Bank Transfer** — [PLACEHOLDER: Bank name, Account Title, Account No., IBAN]\n• **Cash on Delivery (COD)** — available for orders [PLACEHOLDER: under what amount, if any]; COD fee: [PLACEHOLDER: amount or "none"]\n• **Visa / Mastercard** — accepted via secure checkout\n\nNeed a step-by-step guide? Ask "How do I pay?"`,
    followUps: ['how_to_pay', 'track_order', 'contact'],
  },
  {
    id: 'how_to_pay',
    topic: 'How to Pay (Step by Step)',
    keywords: [
      'how to pay', 'steps', 'step by step', 'process', 'instructions',
      'checkout process', 'complete order', 'place order', 'confirm',
      'send money', 'transfer', 'send payment',
    ],
    question: 'HOW DO I PAY?',
    answer: `**Step-by-step payment guide:**\n\n1. Add items to your cart and proceed to **Checkout**\n2. Choose your payment method\n3. **JazzCash / EasyPaisa:** Transfer the order total to the number shown at checkout, then enter your transaction ID — or send a screenshot via WhatsApp to [03098080081](https://wa.me/923098080081)\n4. **COD:** Confirm your order and pay the courier on delivery\n5. You'll receive order confirmation via [PLACEHOLDER: email / WhatsApp]\n\nAny trouble? We're on WhatsApp at [03098080081](https://wa.me/923098080081).`,
    followUps: ['payment', 'track_order'],
  },
  {
    id: 'size_guide',
    topic: 'Size Guide',
    keywords: [
      'size', 'sizing', 'size guide', 'measurements', 'fit', 'chest', 'waist',
      'small', 'medium', 'large', 'xl', 's m l', 'uk size', 'eu size', 'us size',
      'shoe size', 'between sizes', 'which size', 'what size', 'true to size',
      'runs small', 'runs large', 'accessories size', 'belt size',
    ],
    question: 'SIZE GUIDE',
    answer: `**Clothing (Men's)**\n• S — Chest 36–38in / Waist 30–32in\n• M — Chest 39–41in / Waist 33–35in\n• L — Chest 42–44in / Waist 36–38in\n• XL — Chest 45–47in / Waist 39–41in\n\n**Shoes (UK / EU / US)**\n• UK 7 / EU 41 / US 8\n• UK 8 / EU 42 / US 9\n• UK 9 / EU 43 / US 10\n• UK 10 / EU 44 / US 11\n\n**Accessories:** [PLACEHOLDER: belt sizing, glove sizing notes]\n\n_Between sizes? We recommend sizing up for a relaxed fit, true to size for a tailored look._`,
    followUps: ['returns', 'contact'],
  },
  {
    id: 'returns',
    topic: 'Returns & Exchanges',
    keywords: [
      'return', 'returns', 'exchange', 'refund', 'send back', 'wrong size',
      'wrong item', 'damaged', 'defective', 'not as described', 'policy',
      'return policy', 'how to return', 'return window', '30 days', 'tags',
      'unworn', 'original packaging', 'sale items',
    ],
    question: 'RETURNS & EXCHANGES',
    answer: `**Returns & Exchanges**\n\n• **30-day return window** from the date of delivery\n• Items must be **unworn**, with tags attached, in original packaging\n• Sale / archive items: [PLACEHOLDER: final sale or returnable?]\n\n**To initiate a return:**\n[PLACEHOLDER: email us at contact email / WhatsApp / use account portal]\n\nWhatsApp: [03098080081](https://wa.me/923098080081)\n\nOnce we receive and inspect your return, we'll process your exchange or refund within [PLACEHOLDER: timeframe].`,
    followUps: ['shipping', 'size_guide', 'contact'],
  },
  {
    id: 'contact',
    topic: 'Contact Us',
    keywords: [
      'contact', 'help', 'support', 'reach', 'talk', 'speak', 'human', 'agent',
      'whatsapp', 'email', 'phone', 'call', 'message', 'instagram', 'social',
      'hours', 'open', 'available', 'customer service', 'customer care',
    ],
    question: 'CONTACT US',
    answer: `**Get in touch with us:**\n\n• **WhatsApp:** [03098080081](https://wa.me/923098080081) — fastest response\n• **Email:** [PLACEHOLDER: email address]\n• **Instagram:** [PLACEHOLDER: @handle]\n\n**Customer service hours:**\n[PLACEHOLDER: e.g. Mon–Sat, 10am–7pm PKT]\n\nWe typically respond within a few hours during business hours.`,
    followUps: ['track_order', 'returns'],
  },
  {
    id: 'about',
    topic: 'About Lowkey Wardrobe',
    keywords: [
      'about', 'brand', 'who are you', 'lowkey wardrobe', 'story', 'founded',
      'based', 'pakistan', 'luxury', 'what is', 'values', 'mission',
    ],
    question: 'ABOUT US',
    answer: `**About Lowkey Wardrobe**\n\n[PLACEHOLDER: 2–3 sentences about what the brand is and stands for — e.g. "Lowkey Wardrobe is a Pakistani luxury fashion label built around..."]\n\n• **Customer service:** [PLACEHOLDER: Mon–Sat, 10am–7pm PKT]\n• **WhatsApp:** [03098080081](https://wa.me/923098080081)\n• **Email:** [PLACEHOLDER: email]\n• **Instagram:** [PLACEHOLDER: @handle]`,
    followUps: ['contact', 'shipping'],
  },
  {
    id: 'gift_wrap',
    topic: 'Gift Wrapping',
    keywords: [
      'gift', 'gift wrap', 'wrapping', 'gift box', 'packaging', 'present',
      'gift message', 'complimentary',
    ],
    question: 'GIFT WRAPPING',
    answer: `**Complimentary Gift Wrapping**\n\nAll Lowkey Wardrobe orders come with complimentary gift wrapping automatically — no need to request it. Your order will arrive beautifully packaged.\n\nWant to include a personalised note? [PLACEHOLDER: confirm if gift messages are supported, and how to add them]`,
    followUps: ['shipping', 'contact'],
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
          if (kwClean.includes(w) || w.includes(kwClean)) score += 0.5;
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
