import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Product, Category } from '../../types';
import { Plus, Edit2, Copy, Archive, Search, Check, AlertCircle, ArrowUpDown } from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [pList, cList] = await Promise.all([
        api.getAdminProducts(),
        api.getCategories(),
      ]);
      setProducts(pList);
      setCategories(cList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct({
      name: '',
      slug: '',
      shortDescription: '',
      fullDescription: '',
      category: categories[0]?.slug || 'sleepsuits-and-rompers',
      categoryName: categories[0]?.name || 'Sleepsuits & Rompers',
      regularPrice: 2500,
      salePrice: 2200,
      costPrice: 900,
      currency: 'PKR',
      sku: `LN-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: 'AliExpress Direct Store',
      supplierProductUrl: 'https://aliexpress.com',
      supplierSku: 'ALI-NEW-ITEM',
      materialDetails: '100% GOTS Organic Cotton',
      washingInstructions: 'Machine wash cold 30°C. Lay flat to dry.',
      sizeGuide: '0-3M (Up to 60cm / 5.5kg), 3-6M (60-68cm / 7.5kg)',
      availableColors: ['Oat Beige', 'Sage Green', 'Warm Ivory'],
      availableSizes: ['0-3M', '3-6M', '6-12M'],
      images: ['https://raw.githubusercontent.com/kanasim26-droid/Littlenest/main/src/assets/images/hero_newborn_clothing_1793176730078.jpg'],
      weightGrams: 150,
      status: 'published',
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isNewbornEssential: true,
      genderCollection: 'unisex',
      stockQuantity: 25,
      lowStockThreshold: 5,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.duplicateProduct(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate product');
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm('Archive this product? It will be safely hidden from customer storefront while preserving past order records.')) {
      try {
        await api.archiveProduct(id);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to archive product');
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.regularPrice) {
      setModalError('Product Name and Regular Price are required.');
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      const selectedCatObj = categories.find(c => c.slug === editingProduct.category);
      const payload = {
        ...editingProduct,
        categoryName: selectedCatObj ? selectedCatObj.name : editingProduct.categoryName,
      };

      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      await loadData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCCB] pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
            Catalog Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32]">
            Products ({products.length})
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#5A463C] text-white rounded-lg text-xs font-semibold hover:bg-[#43332B] transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#8A7569]" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] text-[#4A3B32]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-[#E8DCCB] rounded-lg text-[#5A463C] focus:outline-none focus:border-[#5A463C]"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF3EB] border-b border-[#E8DCCB] text-[#8A7569] font-medium">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price (PKR)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Supplier SKU</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DCCB]/60 text-[#665449]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF3EB]/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded object-cover border border-[#E8DCCB] shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-[#4A3B32] block">{p.name}</span>
                        <span className="text-[#8A7569] text-[11px] font-mono">SKU: {p.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{p.categoryName || p.category}</td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    <span className="font-semibold text-[#4A3B32]">
                      Rs. {(p.salePrice || p.regularPrice).toLocaleString()}
                    </span>
                    {p.salePrice && p.salePrice < p.regularPrice && (
                      <span className="block text-[11px] text-[#8A7569] line-through">
                        Rs. {p.regularPrice.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    <span className={`font-semibold ${p.stockQuantity <= p.lowStockThreshold ? 'text-amber-700' : 'text-[#4A3B32]'}`}>
                      {p.stockQuantity} units
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#8A7569]">
                    {p.supplierSku}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                      p.status === 'published' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      p.status === 'draft' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      title="Edit Product"
                      className="p-1.5 text-[#5A463C] hover:bg-[#FAF3EB] rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(p.id)}
                      title="Duplicate"
                      className="p-1.5 text-[#5A463C] hover:bg-[#FAF3EB] rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {p.status !== 'archived' && (
                      <button
                        onClick={() => handleArchive(p.id)}
                        title="Archive Product"
                        className="p-1.5 text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal Drawer */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E8DCCB] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            
            <div className="p-5 border-b border-[#E8DCCB] flex items-center justify-between bg-[#FAF3EB]">
              <h3 className="font-serif-luxury text-xl font-bold text-[#4A3B32]">
                {editingProduct.id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8A7569] hover:text-[#4A3B32] p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#4A3B32] mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Category</label>
                  <select
                    value={editingProduct.category || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Regular Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.regularPrice || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, regularPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Sale Price (PKR, Optional)</label>
                  <input
                    type="number"
                    value={editingProduct.salePrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: parseFloat(e.target.value) || undefined })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">AliExpress Cost Price (PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.costPrice || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stockQuantity || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#4A3B32] mb-1">Short Description</label>
                  <input
                    type="text"
                    value={editingProduct.shortDescription || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#4A3B32] mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    value={editingProduct.fullDescription || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, fullDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  />
                </div>

                <div className="sm:col-span-2 rounded-xl border border-[#E8DCCB] bg-[#FFF9F4] p-4">
                  <label className="block font-semibold text-[#4A3B32] mb-2">Product Image URL</label>
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-lg border border-[#E8DCCB] bg-white overflow-hidden shrink-0 flex items-center justify-center">
                      {editingProduct.images?.[0] ? <img src={editingProduct.images[0]} alt="Product preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <span className="text-[11px] text-[#8A7569] text-center px-2">No image</span>}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="url"
                        placeholder="Paste a direct image URL (https://...)"
                        value={editingProduct.images?.[0] || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, images: e.target.value.trim() ? [e.target.value.trim()] : [] })}
                        className="w-full px-3 py-2 bg-white border border-[#E8DCCB] rounded-lg font-mono text-[11px]"
                      />
                      <p className="text-[11px] text-[#8A7569]">Use a direct JPG, PNG, or WebP image link. The URL is saved with the product and reused in Inventory and the storefront.</p>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#4A3B32] mb-1">AliExpress Supplier URL</label>
                  <input
                    type="url"
                    value={editingProduct.supplierProductUrl || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, supplierProductUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Supplier SKU</label>
                  <input
                    type="text"
                    value={editingProduct.supplierSku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, supplierSku: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#4A3B32] mb-1">Status</label>
                  <select
                    value={editingProduct.status || 'published'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#FFF9F4] border border-[#E8DCCB] rounded-lg"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8DCCB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E8DCCB] text-[#665449] rounded-lg hover:bg-[#FAF3EB]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#5A463C] text-white rounded-lg font-semibold hover:bg-[#43332B] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
