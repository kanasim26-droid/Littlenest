import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface ShopPageProps {
  initialCollection?: string;
  initialCategory?: string;
  onSelectProduct: (slug: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCollection,
  initialCategory,
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCollection, setActiveCollection] = useState(initialCollection || 'all');
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  // Sync prop changes
  useEffect(() => {
    if (initialCollection) setActiveCollection(initialCollection);
    if (initialCategory) setActiveCategory(initialCategory);
  }, [initialCollection, initialCategory]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: any = { sort: sortBy };
    if (activeCollection !== 'all') params.collection = activeCollection;
    if (activeCategory !== 'all') params.category = activeCategory;

    api.getProducts(params)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCollection, activeCategory, sortBy]);

  const collections = [
    { id: 'all', label: 'All Products' },
    { id: 'new-arrivals', label: 'New Arrivals' },
    { id: 'best-sellers', label: 'Best Sellers' },
    { id: 'essentials', label: 'Newborn Essentials' },
    { id: 'gift-sets', label: 'Gift Sets' },
    { id: 'baby-girl', label: 'Baby Girl' },
    { id: 'baby-boy', label: 'Baby Boy' },
    { id: 'unisex', label: 'Unisex' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-[#E8DCCB] pb-6">
        <span className="text-xs uppercase tracking-wider text-[#8A7569] font-medium block">
          Newborn Wardrobe & Nursery
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif-luxury font-medium text-[#4A3B32] mt-1">
          {collections.find(c => c.id === activeCollection)?.label || 'Shop the Collection'}
        </h1>
        <p className="text-sm text-[#735F53] mt-1">
          Organic cotton rompers, swaddle wraps, bonnet sets, and gift hampers in gentle earthy tones.
        </p>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        {/* Collection Filter Tabs (Interactive Segmented buttons as permitted by zero-pill guidelines) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => {
                setActiveCollection(col.id);
                if (col.id === 'gift-sets') setActiveCategory('newborn-gift-sets');
                else setActiveCategory('all');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeCollection === col.id
                  ? 'bg-[#5A463C] text-white shadow-xs'
                  : 'bg-white border border-[#E8DCCB] text-[#665449] hover:bg-[#FAF3EB]'
              }`}
            >
              {col.label}
            </button>
          ))}
        </div>

        {/* Sort and Category Dropdowns */}
        <div className="flex items-center gap-3 shrink-0">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-[#E8DCCB] rounded-lg text-[#5A463C] focus:outline-none focus:border-[#5A463C]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-[#E8DCCB] rounded-lg text-[#5A463C] focus:outline-none focus:border-[#5A463C]"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="animate-pulse bg-white rounded-2xl h-96 border border-[#E8DCCB]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DCCB] p-8">
          <p className="text-sm font-medium text-[#4A3B32]">No newborn items match your selected filter.</p>
          <p className="text-xs text-[#8A7569] mt-1">Try selecting "All Products" or resetting the category filter.</p>
          <button
            onClick={() => {
              setActiveCollection('all');
              setActiveCategory('all');
            }}
            className="mt-4 px-4 py-2 bg-[#5A463C] text-white text-xs font-medium rounded-lg hover:bg-[#43332B]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const effectivePrice = product.salePrice || product.regularPrice;
            const hasSale = product.salePrice && product.salePrice < product.regularPrice;

            return (
              <div
                key={product.id}
                className="group rounded-2xl bg-white border border-[#E8DCCB] overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col"
              >
                {/* Product Image */}
                <div
                  onClick={() => onSelectProduct(product.slug)}
                  className="relative aspect-4/3 overflow-hidden bg-[#FAF3EB] cursor-pointer"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  {hasSale && (
                    <span className="absolute top-3 left-3 bg-[#5A463C] text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-xs">
                      Special Price
                    </span>
                  )}
                  {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                    <span className="absolute top-3 right-3 bg-amber-800 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-xs">
                      Only {product.stockQuantity} left
                    </span>
                  )}
                  {product.stockQuantity <= 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#8A7569] font-medium block">
                      {product.categoryName}
                    </span>
                    <h3
                      onClick={() => onSelectProduct(product.slug)}
                      className="font-medium text-base text-[#4A3B32] mt-1 hover:text-[#5A463C] cursor-pointer transition-colors"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#8A7569] mt-1.5 line-clamp-2">
                      {product.shortDescription}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#E8DCCB]/60 flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-semibold tabular-nums text-[#5A463C]">
                        Rs. {effectivePrice.toLocaleString()}
                      </span>
                      {hasSale && (
                        <span className="text-xs text-[#8A7569] line-through tabular-nums">
                          Rs. {product.regularPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={product.stockQuantity <= 0}
                      onClick={() => {
                        const defaultColor = product.availableColors[0] || 'Standard';
                        const defaultSize = product.availableSizes[0] || '0-3M';
                        addToCart(product, defaultColor, defaultSize, 1);
                      }}
                      className="px-3.5 py-1.5 text-xs font-medium bg-[#FAF3EB] hover:bg-[#5A463C] text-[#5A463C] hover:text-white border border-[#E8DCCB] hover:border-transparent rounded-lg transition-colors disabled:opacity-50"
                    >
                      {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add to Bag'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
