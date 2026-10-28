import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { api } from '../services/api';
import { ShieldCheck, Truck, RotateCcw, Check, Heart, Ruler, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface ProductDetailProps {
  slug: string;
  onNavigate: (path: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailProps> = ({
  slug,
  onNavigate,
  onSelectProduct,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Variants
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<'materials' | 'washing' | 'shipping' | null>('materials');

  useEffect(() => {
    setLoading(true);
    api.getProduct(slug)
      .then((data) => {
        setProduct(data);
        setSelectedColor(data.availableColors[0] || 'Standard');
        setSelectedSize(data.availableSizes[0] || '0-3M');
        setSelectedImageIndex(0);
        setQuantity(1);

        // Fetch related products
        api.getProducts({ category: data.category }).then((list) => {
          setRelatedProducts(list.filter((p) => p.id !== data.id).slice(0, 3));
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
          <div className="lg:col-span-7 aspect-4/3 bg-white rounded-2xl border border-[#E8DCCB]" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-6 bg-[#E8DCCB] rounded w-1/3" />
            <div className="h-10 bg-[#E8DCCB] rounded w-3/4" />
            <div className="h-8 bg-[#E8DCCB] rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-serif-luxury text-[#4A3B32]">Item Not Found</h2>
        <p className="text-xs text-[#8A7569] mt-2">The newborn garment you are looking for is unavailable.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="mt-4 px-5 py-2.5 bg-[#5A463C] text-white text-xs font-medium rounded-lg"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const effectivePrice = product.salePrice || product.regularPrice;
  const hasSale = product.salePrice && product.salePrice < product.regularPrice;
  const inStock = product.stockQuantity > 0;

  const handleBuyNow = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    setIsCartOpen(false);
    onNavigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Contiguous Purchase Module Split (PDP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Gallery Column (Sticky left) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-4/3 rounded-2xl overflow-hidden bg-[#FAF3EB] border border-[#E8DCCB] shadow-xs">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Gallery Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-[#FAF3EB] ${
                    selectedImageIndex === idx ? 'border-[#5A463C]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Module Column (Sticky right) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DCCB] shadow-xs space-y-6">
          
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between text-xs text-[#8A7569] mb-1.5">
              <span className="uppercase tracking-wider font-medium">{product.categoryName}</span>
              <span className="font-mono">SKU: {product.sku}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32] leading-snug">
              {product.name}
            </h1>
            <p className="text-xs text-[#735F53] mt-2 leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-[#E8DCCB]/60">
            <span className="text-2xl font-semibold tabular-nums text-[#5A463C]">
              Rs. {effectivePrice.toLocaleString()}
            </span>
            {hasSale && (
              <span className="text-sm text-[#8A7569] line-through tabular-nums">
                Rs. {product.regularPrice.toLocaleString()}
              </span>
            )}
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Tax Included
            </span>
          </div>

          {/* Stock Availability */}
          <div className="text-xs flex items-center gap-2">
            {inStock ? (
              <span className="text-emerald-700 flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>In Stock ({product.stockQuantity} ready for immediate dispatch)</span>
              </span>
            ) : (
              <span className="text-red-600 font-medium">Out of stock at supplier warehouse</span>
            )}
          </div>

          {/* Color Selection */}
          {product.availableColors?.length > 0 && (
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[#4A3B32]">
                Color: <span className="font-normal text-[#665449]">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {product.availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      selectedColor === color
                        ? 'border-[#5A463C] bg-[#FAF3EB] text-[#4A3B32] font-medium'
                        : 'border-[#E8DCCB] bg-white text-[#665449] hover:bg-[#FAF3EB]'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.availableSizes?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#4A3B32]">
                  Size: <span className="font-normal text-[#665449]">{selectedSize}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-[#5A463C] hover:underline flex items-center gap-1"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Chart</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 text-xs rounded-lg border transition-colors ${
                      selectedSize === size
                        ? 'border-[#5A463C] bg-[#5A463C] text-white font-medium'
                        : 'border-[#E8DCCB] bg-white text-[#665449] hover:bg-[#FAF3EB]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#E8DCCB] rounded-lg bg-white h-11 px-2">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2 text-[#665449] hover:text-[#4A3B32] disabled:opacity-30"
                >
                  -
                </button>
                <span className="px-3 text-xs font-semibold font-mono text-[#4A3B32]">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stockQuantity}
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  className="px-2 text-[#665449] hover:text-[#4A3B32] disabled:opacity-30"
                >
                  +
                </button>
              </div>

              {/* Add to Bag CTA */}
              <button
                type="button"
                disabled={!inStock}
                onClick={() => addToCart(product, selectedColor, selectedSize, quantity)}
                className="flex-1 h-11 rounded-lg bg-[#FAF3EB] border border-[#5A463C] text-[#5A463C] hover:bg-[#5A463C] hover:text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Add to Bag
              </button>
            </div>

            {/* Direct Order Button (COD) */}
            <button
              type="button"
              disabled={!inStock}
              onClick={handleBuyNow}
              className="w-full h-11 rounded-lg bg-[#5A463C] text-white text-xs font-semibold hover:bg-[#43332B] transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Order via Cash on Delivery (COD)</span>
            </button>
          </div>

          {/* Micro Trust Indicators */}
          <div className="pt-4 border-t border-[#E8DCCB]/60 space-y-2 text-xs text-[#735F53]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#8A7569]" />
              <span>Dispatched via TCS / Leopard Express (2-3 business days)</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#8A7569]" />
              <span>14-day unworn exchange policy for newborn peace of mind</span>
            </div>
          </div>

          {/* Accordions */}
          <div className="pt-2 border-t border-[#E8DCCB]/60 space-y-2 text-xs">
            <div className="border border-[#E8DCCB] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'materials' ? null : 'materials')}
                className="w-full p-3 bg-[#FAF3EB] text-left font-medium text-[#4A3B32] flex items-center justify-between"
              >
                <span>Organic Materials & Fasteners</span>
                {activeAccordion === 'materials' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {activeAccordion === 'materials' && (
                <div className="p-3 bg-white text-[#665449] leading-relaxed">
                  {product.materialDetails || '100% GOTS certified pure combed cotton with natural shell buttons.'}
                </div>
              )}
            </div>

            <div className="border border-[#E8DCCB] rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === 'washing' ? null : 'washing')}
                className="w-full p-3 bg-[#FAF3EB] text-left font-medium text-[#4A3B32] flex items-center justify-between"
              >
                <span>Washing & Fabric Care</span>
                {activeAccordion === 'washing' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {activeAccordion === 'washing' && (
                <div className="p-3 bg-white text-[#665449] leading-relaxed">
                  {product.washingInstructions || 'Machine wash gentle cold (30°C) with baby safe detergent. Lay flat to dry.'}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Description Section */}
      <div className="bg-white p-8 rounded-2xl border border-[#E8DCCB] space-y-4">
        <h3 className="font-serif-luxury text-2xl text-[#4A3B32]">Product Story & Design Details</h3>
        <p className="text-sm text-[#665449] leading-relaxed whitespace-pre-line">
          {product.fullDescription}
        </p>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-[#E8DCCB]">
          <h3 className="font-serif-luxury text-2xl text-[#4A3B32]">Coordinating Newborn Essentials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectProduct(rel.slug)}
                className="group cursor-pointer rounded-2xl bg-white border border-[#E8DCCB] overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-4/3 overflow-hidden bg-[#FAF3EB]">
                  <img
                    src={rel.images[0]}
                    alt={rel.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-[#4A3B32] group-hover:text-[#5A463C] transition-colors truncate">
                    {rel.name}
                  </h4>
                  <p className="text-xs font-semibold tabular-nums text-[#5A463C] mt-1">
                    Rs. {(rel.salePrice || rel.regularPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FFF9F4] rounded-2xl p-6 border border-[#E8DCCB] shadow-2xl relative">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-[#8A7569] hover:text-[#4A3B32]"
            >
              ✕
            </button>
            <h3 className="text-xl font-serif-luxury text-[#4A3B32] mb-3">
              Newborn Clothing Size Guide
            </h3>
            <p className="text-xs text-[#735F53] mb-4">
              All Little Nest garments are crafted with gentle ease allowance for diapers and natural baby movement.
            </p>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8DCCB] text-[#8A7569] font-medium">
                  <th className="py-2">Size</th>
                  <th className="py-2">Baby Length</th>
                  <th className="py-2">Weight</th>
                  <th className="py-2">Typical Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/50 text-[#665449]">
                <tr>
                  <td className="py-2 font-medium text-[#4A3B32]">Newborn (NB)</td>
                  <td className="py-2">Up to 52 cm</td>
                  <td className="py-2">2.5 – 3.8 kg</td>
                  <td className="py-2">0 – 4 Weeks</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-[#4A3B32]">0-3 Months</td>
                  <td className="py-2">52 – 60 cm</td>
                  <td className="py-2">3.8 – 5.5 kg</td>
                  <td className="py-2">1 – 3 Months</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-[#4A3B32]">3-6 Months</td>
                  <td className="py-2">60 – 68 cm</td>
                  <td className="py-2">5.5 – 7.5 kg</td>
                  <td className="py-2">3 – 6 Months</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-[#4A3B32]">6-12 Months</td>
                  <td className="py-2">68 – 76 cm</td>
                  <td className="py-2">7.5 – 9.8 kg</td>
                  <td className="py-2">6 – 12 Months</td>
                </tr>
              </tbody>
            </table>
            <div className="mt-5 text-center">
              <button
                onClick={() => setShowSizeGuide(false)}
                className="px-5 py-2 bg-[#5A463C] text-white text-xs font-medium rounded-lg"
              >
                Close Size Chart
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
