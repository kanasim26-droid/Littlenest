import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { Category, Product } from '../../types';
import { FolderTree, Plus, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [categoryList, productList] = await Promise.all([api.getCategories(), api.getAdminProducts()]);
      setCategories(categoryList);
      setProducts(productList);
    } catch (e: any) {
      setError(e.message || 'Could not load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((product) => map.set(product.category, (map.get(product.category) || 0) + 1));
    return map;
  }, [products]);

  const makeSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a category name.');
      return;
    }
    const slug = makeSlug(trimmedName);
    if (categories.some((category) => category.slug === slug)) {
      setError('A category with this name already exists. Please choose a different name.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.createCategory({
        name: trimmedName,
        slug,
        description: description.trim(),
        ...(image.trim() ? { image: image.trim() } : {}),
      });
      setName('');
      setDescription('');
      setImage('');
      setSuccess('Category added successfully. It is now available in the product category selector.');
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Could not save category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCCB] pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">Catalog Management</span>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32]">Categories ({categories.length})</h1>
          <p className="text-xs text-[#8A7569] mt-1">Create and organize the product categories shown in your store.</p>
        </div>
        <button onClick={() => void loadData()} disabled={loading} className="px-4 py-2.5 border border-[#E8DCCB] bg-white text-[#5A463C] rounded-lg text-xs font-semibold flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E8DCCB] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#5A463C]" />
          <h2 className="font-semibold text-[#4A3B32]">Add New Category</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5">Category name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={70} placeholder="e.g. Baby Gift Sets" className="w-full px-3 py-2.5 text-sm border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C]" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Category image URL (optional)</label>
            <input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 text-sm border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C]" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1.5">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={300} placeholder="A short description of this category" className="w-full px-3 py-2.5 text-sm border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C]" />
          </div>
        </div>
        {image.trim() && (
          <div className="flex items-center gap-3">
            <img src={image} alt="Category preview" className="w-16 h-16 rounded-lg border border-[#E8DCCB] object-cover" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
            <span className="text-xs text-[#8A7569]">Image preview</span>
          </div>
        )}
        {error && <p role="alert" className="flex items-center gap-2 text-xs text-red-700"><AlertCircle className="w-4 h-4 shrink-0" />{error}</p>}
        {success && <p role="status" className="text-xs text-emerald-700">{success}</p>}
        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#5A463C] hover:bg-[#43332B] disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />{saving ? 'Saving category…' : 'Save Category'}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="font-semibold text-[#4A3B32]">Existing Categories</h2>
        {loading ? <p className="text-sm text-[#8A7569]">Loading categories…</p> : categories.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E8DCCB] p-8 text-center text-sm text-[#8A7569]">No categories yet. Add your first category above.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {categories.map((category) => (
              <article key={category.id} className="bg-white rounded-xl border border-[#E8DCCB] overflow-hidden">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="w-full h-36 object-cover bg-[#FAF3EB]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-24 bg-[#FAF3EB] flex items-center justify-center"><ImageIcon className="w-7 h-7 text-[#B8A394]" /></div>
                )}
                <div className="p-4 space-y-1">
                  <h3 className="font-semibold text-[#4A3B32]">{category.name}</h3>
                  <p className="text-[11px] font-mono text-[#8A7569]">{category.slug}</p>
                  <p className="text-xs text-[#8A7569]">{category.description || 'No description added.'}</p>
                  <p className="text-xs font-semibold text-[#5A463C] pt-2">{counts.get(category.slug) || 0} products assigned</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
