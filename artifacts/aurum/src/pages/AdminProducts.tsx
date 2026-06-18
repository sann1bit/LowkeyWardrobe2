import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout, adminFetch, getAdminToken } from '../components/AdminLayout';
import { apiUrl } from '../lib/api';
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, X, Check, Package, Star, ImagePlus, Upload, Link2 } from 'lucide-react';

interface AdminProduct {
  id: number;
  slug: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  category: string;
  subcategory?: string | null;
  badge: string | null;
  stock: number;
  description: string;
  isActive: boolean;
  sku: string;
  sizes: string[];
  colors: string[];
  imageUrl?: string | null;
  images?: string[];
  featured?: boolean;
}

const SIZE_OPTIONS: Record<string, string[]> = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
  accessories: ['One Size'],
};

const SUBCATEGORY_OPTIONS = [
  { value: '', label: 'No subcategory' },
  { value: 'men', label: 'Menswear' },
  { value: 'women', label: 'Womenswear' },
  { value: 'unisex', label: 'Unisex' },
];

const DEFAULT_FORM = {
  name: '',
  brand: '',
  category: 'clothing' as 'clothing' | 'shoes' | 'accessories',
  subcategory: '',
  price: '' as number | '',
  originalPrice: '' as number | '',
  badge: '' as string,
  stock: '' as number | '',
  sizes: [] as string[],
  colors: [] as string[],
  description: '',
  images: [] as string[],
  featured: false,
  isActive: true,
};

type FormState = typeof DEFAULT_FORM;

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadImageToSupabase(file: File, onProgress?: (pct: number) => void): Promise<string> {
  const token = getAdminToken();
  onProgress?.(10);
  const base64 = await fileToBase64(file);
  onProgress?.(40);
  const res = await fetch(apiUrl('/api/storage/uploads/file'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ data: base64, type: file.type }),
  });
  onProgress?.(90);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (${res.status}): ${text}`);
  }
  const { publicUrl } = await res.json() as { publicUrl: string };
  onProgress?.(100);
  return publicUrl;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; product?: AdminProduct }>({ open: false, mode: 'add' });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [newColor, setNewColor] = useState('#000000');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'url' | 'file'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = () => {
    setLoading(true);
    adminFetch('/api/admin/products')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ ...DEFAULT_FORM });
    setNewImageUrl('');
    setUploadError(null);
    setModal({ open: true, mode: 'add' });
  };

  const openEdit = (p: AdminProduct) => {
    setForm({
      name: p.name,
      brand: p.brand,
      category: p.category as 'clothing' | 'shoes' | 'accessories',
      subcategory: p.subcategory ?? '',
      price: p.price,
      originalPrice: p.originalPrice ?? '',
      badge: p.badge ?? '',
      stock: p.stock,
      sizes: p.sizes ?? [],
      colors: p.colors ?? [],
      description: p.description ?? '',
      images: p.images && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []),
      featured: p.featured ?? false,
      isActive: p.isActive,
    });
    setNewImageUrl('');
    setUploadError(null);
    setModal({ open: true, mode: 'edit', product: p });
  };

  const closeModal = () => { setModal({ open: false, mode: 'add' }); setSaving(false); setUploadError(null); };

  const updateForm = (key: keyof FormState, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleSize = (size: string) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size],
    }));
  };

  const addColor = () => {
    if (!form.colors.includes(newColor)) {
      setForm(prev => ({ ...prev, colors: [...prev.colors, newColor] }));
    }
  };

  const removeColor = (c: string) =>
    setForm(prev => ({ ...prev, colors: prev.colors.filter(x => x !== c) }));

  const addImage = () => {
    const url = newImageUrl.trim();
    if (url && !form.images.includes(url)) {
      setForm(prev => ({ ...prev, images: [...prev.images, url] }));
      setNewImageUrl('');
    }
  };

  const removeImage = (url: string) =>
    setForm(prev => ({ ...prev, images: prev.images.filter(img => img !== url) }));

  const handleFileUpload = async (files: File[]) => {
    setUploadError(null);
    for (const file of files) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const publicUrl = await uploadImageToSupabase(file, (pct) => setUploadProgress(pct));
        setForm(prev => ({ ...prev, images: [...prev.images, publicUrl] }));
      } catch (err: any) {
        setUploadError(err.message || 'Upload failed. Try adding via URL instead.');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const discountPct = form.originalPrice && form.price
    ? Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100)
    : null;

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const imagesList = form.images.filter(Boolean);
      const payload = {
        name: form.name,
        brand: form.brand || 'Lowkey Wardrobe',
        category: form.category,
        subcategory: form.subcategory || null,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        badge: form.badge || null,
        stock: Number(form.stock) || 0,
        sizes: form.sizes,
        colors: form.colors,
        description: form.description,
        imageUrl: imagesList[0] || null,
        images: imagesList,
        featured: form.featured,
        isActive: form.isActive,
      };

      if (modal.mode === 'add') {
        const res = await adminFetch('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
        if (res.ok) {
          const created = await res.json();
          setProducts(prev => [created, ...prev]);
        }
      } else if (modal.product) {
        const res = await adminFetch(`/api/admin/products/${modal.product.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        if (res.ok) {
          const updated = await res.json();
          setProducts(prev => prev.map(p => p.id === modal.product!.id ? { ...p, ...updated } : p));
        }
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await adminFetch(`/api/admin/products/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== deleteId));
      }
    } finally {
      setSaving(false);
      setDeleteId(null);
    }
  };

  const toggleActive = async (p: AdminProduct) => {
    const res = await adminFetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, isActive: !p.isActive } : pr));
    }
  };

  const toggleFeatured = async (p: AdminProduct) => {
    const res = await adminFetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      body: JSON.stringify({ featured: !p.featured }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, featured: !p.featured } : pr));
    }
  };

  const sizeOptions = SIZE_OPTIONS[form.category] || SIZE_OPTIONS.clothing;

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="relative flex-1 max-w-[400px]">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAAAAA]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search products, SKU, category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-[#EAEAEA] pl-10 pr-4 py-3 text-[13px] focus:border-black outline-none transition-colors bg-white"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors"
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-[1px] bg-[#EAEAEA]">
          {[
            { label: 'Total', value: products.length },
            { label: 'Active', value: products.filter(p => p.isActive).length },
            { label: 'Sold Out', value: products.filter(p => p.stock === 0).length },
            { label: 'Featured', value: products.filter(p => p.featured).length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white px-6 py-4">
              <div className="text-[24px] font-light mb-1">{value}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#999999]">{label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <span className="spinner spinner--lg" style={{ color: '#111' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-[#999999]">
            <Package size={36} strokeWidth={1} className="mx-auto mb-4 opacity-30" />
            <p className="text-[14px]">No products found</p>
          </div>
        ) : (
          <div className="border border-[#EAEAEA] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
                    <th className="text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-normal text-[#999999]">Product</th>
                    <th className="text-left px-4 py-4 text-[10px] uppercase tracking-[0.2em] font-normal text-[#999999]">Category</th>
                    <th className="text-left px-4 py-4 text-[10px] uppercase tracking-[0.2em] font-normal text-[#999999]">Price</th>
                    <th className="text-left px-4 py-4 text-[10px] uppercase tracking-[0.2em] font-normal text-[#999999]">Stock</th>
                    <th className="text-left px-4 py-4 text-[10px] uppercase tracking-[0.2em] font-normal text-[#999999]">Status</th>
                    <th className="px-4 py-4 text-[10px] uppercase tracking-[0.2em] font-normal text-[#999999] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-[#EAEAEA] hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-[#F5F5F5] overflow-hidden shrink-0">
                            {(p.images && p.images.length > 0 ? p.images[0] : p.imageUrl) ? (
                              <img src={p.images && p.images.length > 0 ? p.images[0] : p.imageUrl!} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            ) : (
                              <div className="w-full h-full bg-[#EAEAEA]" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-medium line-clamp-1">{p.name}</span>
                              {p.featured && <Star size={10} fill="currentColor" className="text-black shrink-0" />}
                            </div>
                            <span className="text-[11px] text-[#999999]">{p.sku}</span>
                            {p.subcategory && <span className="text-[10px] text-[#BBBBBB] ml-2 capitalize">{p.subcategory}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <span className="text-[12px] capitalize">{p.category}</span>
                          {p.badge && <span className="ml-2 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] bg-[#F0F0F0]">{p.badge}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <span className="text-[13px]">PKR {Number(p.price).toLocaleString()}</span>
                          {p.originalPrice && Number(p.originalPrice) > 0 && (
                            <span className="text-[11px] text-[#999999] line-through block">PKR {Number(p.originalPrice).toLocaleString()}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[13px] ${p.stock === 0 ? 'text-[#999999]' : 'text-black'}`}>
                          {p.stock === 0 ? 'Sold Out' : p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-[10px] uppercase tracking-[0.1em] ${p.isActive ? 'bg-black text-white' : 'bg-[#F0F0F0] text-[#999999]'}`}>
                          {p.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => toggleFeatured(p)} className={`w-8 h-8 flex items-center justify-center border transition-colors ${p.featured ? 'border-black bg-black text-white' : 'border-[#EAEAEA] hover:border-black'}`} title={p.featured ? 'Unfeature' : 'Feature'}>
                            <Star size={12} fill={p.featured ? 'currentColor' : 'none'} />
                          </button>
                          <button onClick={() => toggleActive(p)} className="w-8 h-8 flex items-center justify-center border border-[#EAEAEA] hover:border-black transition-colors" title={p.isActive ? 'Hide' : 'Show'}>
                            {p.isActive ? <EyeOff size={13} strokeWidth={1.5} /> : <Eye size={13} strokeWidth={1.5} />}
                          </button>
                          <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center border border-[#EAEAEA] hover:border-black transition-colors">
                            <Edit2 size={13} strokeWidth={1.5} />
                          </button>
                          <button onClick={() => setDeleteId(p.id)} className="w-8 h-8 flex items-center justify-center border border-[#EAEAEA] hover:border-red-400 hover:text-red-400 transition-colors">
                            <Trash2 size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal.open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/50 z-[1000]"
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 right-0 h-full w-full max-w-[600px] bg-white z-[1001] flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="border-b border-[#EAEAEA] px-8 py-6 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="font-serif text-[22px] italic">{modal.mode === 'add' ? 'New Product' : 'Edit Product'}</h2>
                  {modal.product && <p className="text-[11px] text-[#999999] mt-0.5">{modal.product.sku}</p>}
                </div>
                <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center hover:bg-[#F5F5F5] rounded-full transition-colors">
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">

                {/* Basic Info */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Product Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => updateForm('name', e.target.value)}
                        placeholder="e.g. Premium Oversized Jacket"
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Brand</label>
                      <input
                        type="text"
                        value={form.brand}
                        onChange={e => updateForm('brand', e.target.value)}
                        placeholder="Lowkey Wardrobe"
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Description</label>
                      <textarea
                        value={form.description}
                        onChange={e => updateForm('description', e.target.value)}
                        rows={3}
                        placeholder="Product description…"
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>
                </section>

                {/* Category & Subcategory */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Category</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Main Category</label>
                      <div className="flex gap-2">
                        {(['clothing', 'shoes', 'accessories'] as const).map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => { updateForm('category', cat); updateForm('sizes', []); }}
                            className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.1em] border transition-colors ${form.category === cat ? 'bg-black text-white border-black' : 'border-[#EAEAEA] hover:border-black'}`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Gender / Audience</label>
                      <select
                        value={form.subcategory}
                        onChange={e => updateForm('subcategory', e.target.value)}
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors bg-white"
                      >
                        {SUBCATEGORY_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                {/* Pricing */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Pricing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Sale Price (PKR) *</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={e => updateForm('price', e.target.value ? Number(e.target.value) : '')}
                        placeholder="24900"
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">
                        Original Price (PKR)
                        {discountPct && discountPct > 0 && (
                          <span className="ml-2 text-[9px] bg-black text-white px-1.5 py-0.5 rounded-none">–{discountPct}% OFF</span>
                        )}
                      </label>
                      <input
                        type="number"
                        value={form.originalPrice}
                        onChange={e => updateForm('originalPrice', e.target.value ? Number(e.target.value) : '')}
                        placeholder="32900 (optional)"
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors"
                      />
                    </div>
                  </div>
                </section>

                {/* Stock & Badges */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Inventory & Badges</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Stock Quantity</label>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={e => updateForm('stock', e.target.value ? Number(e.target.value) : '')}
                        placeholder="0"
                        className="w-full border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.15em] mb-1.5">Badge</label>
                      <div className="flex gap-2">
                        {['', 'new', 'sale'].map(b => (
                          <button
                            key={b || 'none'}
                            type="button"
                            onClick={() => updateForm('badge', b)}
                            className={`flex-1 py-3 text-[10px] uppercase tracking-[0.1em] border transition-colors ${form.badge === b ? 'bg-black text-white border-black' : 'border-[#EAEAEA] hover:border-black'}`}
                          >
                            {b || 'None'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Featured & Visibility */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Visibility</h3>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => updateForm('isActive', !form.isActive)}
                      className={`flex-1 flex items-center justify-center gap-2 border py-3 text-[11px] uppercase tracking-[0.12em] transition-colors ${form.isActive ? 'bg-black text-white border-black' : 'border-[#EAEAEA] hover:border-black'}`}
                    >
                      {form.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                      {form.isActive ? 'Visible in Store' : 'Hidden from Store'}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateForm('featured', !form.featured)}
                      className={`flex-1 flex items-center justify-center gap-2 border py-3 text-[11px] uppercase tracking-[0.12em] transition-colors ${form.featured ? 'bg-black text-white border-black' : 'border-[#EAEAEA] hover:border-black'}`}
                    >
                      <Star size={13} fill={form.featured ? 'currentColor' : 'none'} />
                      {form.featured ? 'Featured' : 'Not Featured'}
                    </button>
                  </div>
                </section>

                {/* Sizes */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Sizes</h3>
                  <div className="flex gap-2 flex-wrap">
                    {sizeOptions.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] border transition-colors ${form.sizes.includes(size) ? 'bg-black text-white border-black' : 'border-[#EAEAEA] hover:border-black'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Colors */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Colors</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    {form.colors.map(c => (
                      <div key={c} className="relative group/color">
                        <div
                          className="w-9 h-9 rounded-full border-2 border-[#EAEAEA] cursor-pointer"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                        <button
                          type="button"
                          onClick={() => removeColor(c)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white rounded-full hidden group-hover/color:flex items-center justify-center"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        ref={colorInputRef}
                        type="color"
                        value={newColor}
                        onChange={e => setNewColor(e.target.value)}
                        className="w-9 h-9 rounded-full border border-[#EAEAEA] cursor-pointer p-0 overflow-hidden"
                      />
                      <button
                        type="button"
                        onClick={addColor}
                        className="px-3 py-1.5 border border-[#EAEAEA] text-[11px] uppercase tracking-[0.1em] hover:border-black transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </section>

                {/* Images */}
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#999999] mb-4">Product Images</h3>
                  <p className="text-[11px] text-[#AAAAAA] mb-4">First image is the primary. Add multiple images for a product gallery.</p>

                  {/* Image previews */}
                  <div className="space-y-2 mb-5">
                    {form.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {form.images.map((imgUrl, idx) => (
                          <div key={idx} className="relative group/img aspect-[3/4] bg-[#F5F5F5] overflow-hidden border border-[#EAEAEA]">
                            <img
                              src={imgUrl}
                              alt={`Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.opacity = '0.2'; }}
                            />
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 right-1 text-center text-[8px] uppercase tracking-[0.1em] bg-black/70 text-white py-0.5">Primary</span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(imgUrl)}
                              className="absolute top-1 right-1 w-5 h-5 bg-black/80 text-white rounded-full hidden group-hover/img:flex items-center justify-center transition-all"
                            >
                              <X size={9} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {form.images.length === 0 && !isUploading && (
                      <div className="flex flex-col items-center justify-center h-24 border border-dashed border-[#DDDDDD] bg-[#FAFAFA] text-[#CCCCCC]">
                        <ImagePlus size={20} strokeWidth={1} className="mb-2" />
                        <span className="text-[11px]">No images yet</span>
                      </div>
                    )}
                    {isUploading && (
                      <div className="p-4 border border-[#EAEAEA] bg-[#FAFAFA]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] uppercase tracking-[0.1em] text-[#666]">Uploading…</span>
                          <span className="text-[11px] text-[#999]">{uploadProgress}%</span>
                        </div>
                        <div className="h-[2px] bg-[#EAEAEA] overflow-hidden">
                          <div className="h-full bg-black transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                    {uploadError && (
                      <p className="text-[11px] text-red-500 bg-red-50 border border-red-100 px-3 py-2">{uploadError}</p>
                    )}
                  </div>

                  {/* Input mode toggle */}
                  <div className="flex border border-[#EAEAEA] mb-3 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('file')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] uppercase tracking-[0.15em] transition-colors ${imageInputMode === 'file' ? 'bg-black text-white' : 'hover:bg-[#F5F5F5] text-[#666]'}`}
                    >
                      <Upload size={12} />
                      From Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] uppercase tracking-[0.15em] transition-colors ${imageInputMode === 'url' ? 'bg-black text-white' : 'hover:bg-[#F5F5F5] text-[#666]'}`}
                    >
                      <Link2 size={12} />
                      From URL
                    </button>
                  </div>

                  {/* File picker */}
                  {imageInputMode === 'file' && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) await handleFileUpload(files);
                        }}
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-[#DDDDDD] py-6 text-[12px] uppercase tracking-[0.15em] text-[#888] hover:border-black hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Upload size={16} strokeWidth={1.5} />
                        {isUploading ? `Uploading (${uploadProgress}%)…` : 'Click to choose image files'}
                      </button>
                      <p className="text-[10px] text-[#BBBBBB] mt-2 text-center">Supports JPG, PNG, WebP · Multiple files allowed</p>
                    </div>
                  )}

                  {/* URL input */}
                  {imageInputMode === 'url' && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1 border border-[#EAEAEA] px-4 py-3 text-[13px] focus:border-black outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={addImage}
                        className="flex items-center gap-2 px-4 py-3 border border-[#EAEAEA] text-[11px] uppercase tracking-[0.1em] hover:border-black transition-colors whitespace-nowrap"
                      >
                        <ImagePlus size={14} />
                        Add URL
                      </button>
                    </div>
                  )}
                </section>

              </div>

              {/* Modal Footer */}
              <div className="border-t border-[#EAEAEA] px-8 py-5 flex gap-3 bg-white shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-[#EAEAEA] py-3.5 text-[11px] uppercase tracking-[0.15em] hover:border-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.price}
                  className="flex-1 bg-black text-white py-3.5 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <span className="spinner" style={{ color: 'white' }} />
                  ) : (
                    <><Check size={14} /> {modal.mode === 'add' ? 'Create Product' : 'Save Changes'}</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
              className="fixed inset-0 bg-black/50 z-[1002]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-[1003] p-10 w-[380px] max-w-[95vw] text-center"
            >
              <h3 className="font-serif text-[22px] italic mb-3">Delete Product?</h3>
              <p className="text-[13px] text-[#666666] mb-8 leading-[1.6]">
                This will permanently remove the product from your store. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 border border-[#EAEAEA] py-3 text-[11px] uppercase tracking-[0.15em] hover:border-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 bg-black text-white py-3 text-[11px] uppercase tracking-[0.15em] hover:bg-[#333333] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <span className="spinner" style={{ color: 'white' }} /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
