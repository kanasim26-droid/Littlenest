import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { api } from '../../services/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.getProducts({ search: searchTerm });
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search catalog"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs"
    >
      <div className="w-full max-w-2xl bg-[#FFF9F4] rounded-2xl shadow-2xl border border-[#E8DCCB] overflow-hidden animate-in fade-in duration-200">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8DCCB] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#8A7569] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search rompers, swaddles, gift sets, sizes (0-3M)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-[#4A3B32] placeholder-[#8A7569] focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-[#8A7569] hover:text-[#4A3B32]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-medium text-[#665449] hover:text-[#4A3B32] px-2 py-1 rounded bg-[#E8DCCB]/40"
          >
            Esc
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-4 sm:p-5">
          {loading ? (
            <div className="py-8 text-center text-xs text-[#8A7569]">
              Searching newborn essentials...
            </div>
          ) : searchTerm && results.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8A7569]">
              No clothing found matching "{searchTerm}". Try "romper", "swaddle", or "gift".
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-[#E8DCCB]/50 space-y-2">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product.slug);
                    onClose();
                  }}
                  className="pt-2 first:pt-0 flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-[#FAF3EB] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded object-cover border border-[#E8DCCB] shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium text-[#4A3B32] truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-[#8A7569]">
                        {product.categoryName} · SKU: {product.sku}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold tabular-nums text-[#5A463C]">
                      Rs. {(product.salePrice || product.regularPrice).toLocaleString()}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#8A7569]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#8A7569] space-y-3">
              <span className="font-medium uppercase tracking-wider block">Popular Searches:</span>
              <div className="flex flex-wrap gap-2">
                {['Ribbed Romper', 'Swaddle Set', 'Welcome Gift Box', 'Knit Booties', '0-3M', 'Sage Green'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchTerm(tag)}
                    className="px-2.5 py-1 rounded bg-[#FAF3EB] border border-[#E8DCCB] hover:border-[#5A463C] text-[#665449] transition-colors text-xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
