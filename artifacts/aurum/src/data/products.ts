export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  category: 'clothing' | 'shoes' | 'accessories';
  subcategory?: string | null;
  badge: 'new' | 'sale' | null;
  colors: string[];
  sizes: string[];
  description: string;
  figType: string;
  bgGradient: string;
  figColorA: string;
  figColorB: string;
  imageUrl?: string | null;
  images?: string[];
  featured?: boolean;
  sku: string;
  stock: number;
  tags: string[];
}

export const products: Product[] = [
  { id: 1, slug: 'premium-oversized-jacket', name: "Premium Oversized Jacket", brand: "LKW Essentials", price: 24900, category: "clothing", badge: "new", colors: ['#1a1a1a', '#888888', '#ffffff'], sizes: ['XS', 'S', 'M', 'L', 'XL'], description: "A meticulously tailored oversized jacket in premium wool blend. Featuring clean lines, subtle lapels, and an impeccable drape that defines effortless luxury.", figType: "coat", bgGradient: "linear-gradient(135deg, #f0f0f0, #e0e0e0)", figColorA: "#c0c0c0", figColorB: "#1e1e1e", sku: "LKW-0001", stock: 24, tags: ['jacket', 'outerwear', 'oversized', 'wool', 'luxury'] },
  { id: 2, slug: 'minimal-white-sneaker', name: "Minimal White Sneaker", brand: "LKW Sport", price: 17900, category: "shoes", badge: "new", colors: ['#ffffff', '#1a1a1a'], sizes: ['38', '39', '40', '41', '42', '43', '44'], description: "The perfect minimalist sneaker. Hand-finished Italian leather upper with a vulcanized sole. A wardrobe cornerstone that complements everything.", figType: "sneaker", bgGradient: "linear-gradient(135deg, #f5f5f5, #e8e8e8)", figColorA: "#eeeeee", figColorB: "#d0d0d0", sku: "LKW-0002", stock: 42, tags: ['sneaker', 'white', 'leather', 'minimal', 'sport'] },
  { id: 3, slug: 'cashmere-blend-hoodie', name: "Cashmere Blend Hoodie", brand: "LKW Essentials", price: 19900, category: "clothing", badge: null, colors: ['#888888', '#1a1a1a', '#ffffff'], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], description: "Pure luxury in casual form. Crafted from a superfine cashmere blend that becomes softer with every wear. An investment in everyday comfort.", figType: "hoodie", bgGradient: "linear-gradient(135deg, #e8e8e8, #d8d8d8)", figColorA: "#c0c0c0", figColorB: "#a0a0a0", sku: "LKW-0003", stock: 18, tags: ['hoodie', 'cashmere', 'luxury', 'essentials', 'comfort'] },
  { id: 4, slug: 'slim-leather-wallet', name: "Slim Leather Wallet", brand: "LKW Leather", price: 9900, category: "accessories", badge: "new", colors: ['#1a1a1a', '#444444'], sizes: ['One Size'], description: "Handcrafted from full-grain Italian leather. A slim profile holds everything you need with nothing you don't. Develops a rich patina over time.", figType: "wallet", bgGradient: "linear-gradient(135deg, #2a2a2a, #1a1a1a)", figColorA: "#555555", figColorB: "#333333", sku: "LKW-0004", stock: 56, tags: ['wallet', 'leather', 'slim', 'accessories', 'italian'] },
  { id: 5, slug: 'tailored-wool-trousers', name: "Tailored Wool Trousers", brand: "LKW Studio", price: 27900, category: "clothing", badge: null, colors: ['#1a1a1a', '#4a4a4a', '#888888'], sizes: ['28', '30', '32', '34', '36'], description: "Cut from 120s Italian wool, these trousers define understated elegance. The perfect break, the perfect rise — tailored to perfection.", figType: "pants", bgGradient: "linear-gradient(135deg, #d0d0d0, #b8b8b8)", figColorA: "#5a5a5a", figColorB: "#3a3a3a", sku: "LKW-0005", stock: 12, tags: ['trousers', 'wool', 'tailored', 'formal', 'studio'] },
  { id: 6, slug: 'premium-leather-boot', name: "Premium Leather Boot", brand: "LKW Footwear", price: 32900, category: "shoes", badge: null, colors: ['#333333', '#1a1a1a'], sizes: ['38', '39', '40', '41', '42', '43'], description: "Goodyear-welted construction meets contemporary design. Full-grain calf leather with a hand-polished finish. Built to last decades.", figType: "boot", bgGradient: "linear-gradient(135deg, #2a2a2a, #1a1a1a)", figColorA: "#3a3a3a", figColorB: "#2a2a2a", sku: "LKW-0006", stock: 9, tags: ['boot', 'leather', 'goodyear', 'premium', 'footwear'] },
  { id: 7, slug: 'stainless-steel-watch', name: "Stainless Steel Watch", brand: "LKW Time", price: 79900, category: "accessories", badge: "new", colors: ['#c0c0c0', '#1a1a1a'], sizes: ['One Size'], description: "Swiss-inspired precision in a 40mm case. Sapphire crystal, exhibition caseback, 200m water resistance. Worn by those who value time.", figType: "watch", bgGradient: "linear-gradient(135deg, #e8e8e8, #d8d8d8)", figColorA: "#c8c8c8", figColorB: "#a8a8a8", sku: "LKW-0007", stock: 7, tags: ['watch', 'steel', 'swiss', 'time', 'luxury'] },
  { id: 8, slug: 'silk-blend-dress-shirt', name: "Silk-Blend Dress Shirt", brand: "LKW Studio", price: 18500, originalPrice: 26500, category: "clothing", badge: "sale", colors: ['#ffffff', '#1a1a1a', '#e8e8e8'], sizes: ['XS', 'S', 'M', 'L', 'XL'], description: "A 70% silk, 30% cotton blend that drapes like nothing else. Mother-of-pearl buttons, single-needle stitching, French seams throughout.", figType: "shirt", bgGradient: "linear-gradient(135deg, #f5f5f5, #e8e8e8)", figColorA: "#f0f0f0", figColorB: "#d8d8d8", sku: "LKW-0008", stock: 31, tags: ['shirt', 'silk', 'dress', 'formal', 'studio'] },
  { id: 9, slug: 'messenger-leather-bag', name: "Messenger Leather Bag", brand: "LKW Leather", price: 42900, category: "accessories", badge: null, colors: ['#333333', '#1a1a1a', '#888888'], sizes: ['One Size'], description: "Structured full-grain leather with hand-stitched edges. Fits a 15\" laptop, padded interior, and aged brass hardware. Timeless utility.", figType: "bag", bgGradient: "linear-gradient(135deg, #2a2a2a, #1a1a1a)", figColorA: "#505050", figColorB: "#383838", sku: "LKW-0009", stock: 14, tags: ['bag', 'messenger', 'leather', 'laptop', 'accessories'] },
  { id: 10, slug: 'classic-loafer', name: "Classic Loafer", brand: "LKW Footwear", price: 23900, originalPrice: 30900, category: "shoes", badge: "sale", colors: ['#333333', '#1a1a1a'], sizes: ['38', '39', '40', '41', '42', '43', '44'], description: "The definitive penny loafer, updated for the modern wardrobe. Hand-burnished calfskin on a leather sole. Made in Naples.", figType: "loafer", bgGradient: "linear-gradient(135deg, #1a1a1a, #0a0a0a)", figColorA: "#3a3a3a", figColorB: "#252525", sku: "LKW-0010", stock: 22, tags: ['loafer', 'penny', 'naples', 'leather', 'footwear'] },
  { id: 11, slug: 'oversized-t-shirt', name: "Oversized T-Shirt", brand: "LKW Basics", price: 5900, category: "clothing", badge: null, colors: ['#ffffff', '#1a1a1a', '#888888'], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], description: "250gsm Supima cotton in an oversized boxy cut. Pre-washed for immediate softness. The essential foundation of any elevated wardrobe.", figType: "tshirt", bgGradient: "linear-gradient(135deg, #f5f5f5, #e8e8e8)", figColorA: "#e8e8e8", figColorB: "#d0d0d0", sku: "LKW-0011", stock: 88, tags: ['tshirt', 'supima', 'oversized', 'basics', 'cotton'] },
  { id: 12, slug: 'premium-sunglasses', name: "Premium Sunglasses", brand: "LKW Eyewear", price: 20900, category: "accessories", badge: "new", colors: ['#1a1a1a', '#888888'], sizes: ['One Size'], description: "Hand-finished Italian acetate frames with Carl Zeiss lenses. UV400 protection. Comes in a hand-stitched leather case.", figType: "sunglasses", bgGradient: "linear-gradient(135deg, #e0e0e0, #d0d0d0)", figColorA: "#d0d0d0", figColorB: "#b8b8b8", sku: "LKW-0012", stock: 19, tags: ['sunglasses', 'zeiss', 'acetate', 'italian', 'eyewear'] },
];
