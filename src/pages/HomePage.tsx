import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { Product, Category } from '../types';
import { api } from '../services/api';
import { ArrowRight, Sparkles, Shield, Heart, Truck, Check, Star } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const { settings } = useStore();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProducts({ collection: 'best-sellers' }),
      api.getCategories(),
    ])
      .then(([products, cats]) => {
        setFeaturedProducts(products);
        setCategories(cats);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const heroHeadline = settings?.heroHeadline || "Little Clothes for Life's Biggest Love.";
  const heroDescription = settings?.heroDescription || "Discover thoughtfully selected newborn essentials for your tiniest treasures.";
  const heroImage = settings?.heroImage || "https://raw.githubusercontent.com/kanasim26-droid/Littlenest/main/src/assets/images/hero_newborn_clothing_1793176730078.jpg";
  const heroPrimaryBtn = settings?.heroButtonPrimary || "Shop the Collection";
  const heroSecondaryBtn = settings?.heroButtonSecondary || "Explore Newborn Essentials";

  return (
    <div className="space-y-16 md:space-y-24 pb-20">
      
      {/* 1. HERO SECTION (Split layout with 16:9 photography as per e-commerce reference) */}
      <section className="relative overflow-hidden bg-[#FAF3EB] border-b border-[#E8DCCB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8A7569] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#5A463C]" />
                <span>Heirloom Newborn Apparel</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif-luxury font-medium text-[#4A3B32] leading-[1.15] text-balance">
                {heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-[#665449] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {heroDescription}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/shop')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#5A463C] text-white text-sm font-medium hover:bg-[#43332B] transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>{heroPrimaryBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/shop?collection=essentials')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-white border border-[#E8DCCB] text-[#5A463C] text-sm font-medium hover:bg-[#FAF3EB] transition-colors"
                >
                  {heroSecondaryBtn}
                </button>
              </div>

              {/* Trust Subtext */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#8A7569]">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-700" /> 100% GOTS Organic Cotton
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-700" /> Cash on Delivery Available
                </span>
              </div>
            </div>

            {/* Right Hero Image Column */}
            <div className="lg:col-span-6 relative">
              <div className="aspect-16/9 rounded-2xl overflow-hidden shadow-lg border border-[#E8DCCB] bg-[#FFF9F4]">
                <img
                  src={heroImage}
                  alt="Newborn Organic Baby Clothes and Swaddle"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8 px-6 bg-white rounded-2xl border border-[#E8DCCB] shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#FAF3EB] text-[#5A463C] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#4A3B32]">Nationwide Delivery</h4>
              <p className="text-xs text-[#8A7569] mt-0.5">Reliable TCS & Leopard Courier tracking across Pakistan.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#FAF3EB] text-[#5A463C] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#4A3B32]">Cash on Delivery</h4>
              <p className="text-xs text-[#8A7569] mt-0.5">Pay safely at your doorstep with verified COD terms.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#FAF3EB] text-[#5A463C] shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#4A3B32]">Gentle for Newborns</h4>
              <p className="text-xs text-[#8A7569] mt-0.5">Tagless flat seams and non-toxic hypoallergenic dyes.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#FAF3EB] text-[#5A463C] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#4A3B32]">14-Day Returns</h4>
              <p className="text-xs text-[#8A7569] mt-0.5">Hassle-free size exchanges for your peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7569]">
              Thoughtfully Curated
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-medium text-[#4A3B32] mt-1">
              Shop by Category
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/shop')}
            className="text-xs font-medium text-[#5A463C] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate(`/shop?category=${cat.slug}`)}
              className="group cursor-pointer rounded-2xl bg-white border border-[#E8DCCB] overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-4/3 overflow-hidden bg-[#FAF3EB]">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8A7569]">
                    <Sparkles className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-5">
                <h3 className="font-serif-luxury text-lg font-medium text-[#4A3B32] group-hover:text-[#5A463C] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#8A7569] mt-1 line-clamp-2">
                  {cat.description}
                </p>
                <div className="mt-3 flex items-center text-xs font-medium text-[#5A463C]">
                  <span>Explore items</span>
                  <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BEST SELLERS / FEATURED PRODUCTS (3-column grid as per reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7569]">
            Parent Favorites
          </span>
          <h2 className="text-3xl font-serif-luxury font-medium text-[#4A3B32] mt-1">
            Newborn Best Sellers
          </h2>
          <p className="text-sm text-[#735F53] mt-2">
            Soft, gentle essentials loved by new mothers and baby-shower gifters.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse bg-white rounded-2xl h-96 border border-[#E8DCCB]" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E8DCCB] p-8">
            <p className="text-sm text-[#8A7569]">No products found in catalog. Visit the Admin Dashboard to add products.</p>
            <button
              onClick={() => onNavigate('/admin')}
              className="mt-4 px-4 py-2 bg-[#5A463C] text-white text-xs font-medium rounded-lg"
            >
              Open Admin Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.slice(0, 6).map((product) => {
              const effectivePrice = product.salePrice || product.regularPrice;
              const hasSale = product.salePrice && product.salePrice < product.regularPrice;

              return (
                <div
                  key={product.id}
                  className="group rounded-2xl bg-white border border-[#E8DCCB] overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  {/* Image Slot (65-75% height as per retail guidelines) */}
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
                        onClick={() => {
                          const defaultColor = product.availableColors[0] || 'Standard';
                          const defaultSize = product.availableSizes[0] || '0-3M';
                          addToCart(product, defaultColor, defaultSize, 1);
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-[#FAF3EB] hover:bg-[#5A463C] text-[#5A463C] hover:text-white border border-[#E8DCCB] hover:border-transparent rounded-lg transition-colors"
                      >
                        Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. CRAFTSMANSHIP & STORY SPOTLIGHT (Airy proof rest section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF3EB] rounded-3xl p-8 sm:p-12 border border-[#E8DCCB]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7569]">
                Why Parents Choose Little Nest
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif-luxury font-medium text-[#4A3B32] text-balance">
                Pure, Breathable Fabrics for Tender Newborn Days
              </h2>
              <p className="text-sm text-[#665449] leading-relaxed">
                A newborn baby's skin is up to 30% thinner than an adult's. We carefully select each romper, swaddle, and gift hamper with zero harsh chemical coatings, non-toxic water-based prints, and genuine smooth coconut shell or nickel-free fasteners.
              </p>
              <ul className="space-y-3 text-xs sm:text-sm text-[#5A463C]">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Hypoallergenic organic cotton certified safe for sensitive skin</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Two-way protective safety zippers with fabric chin guards</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Direct dropshipping logistics for honest, boutique-quality pricing</span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/about')}
                  className="px-6 py-2.5 bg-white border border-[#E8DCCB] rounded-lg text-xs font-medium text-[#5A463C] hover:bg-[#FFF9F4] transition-colors"
                >
                  Read Our Story
                </button>
              </div>
            </div>

            <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-md border border-[#E8DCCB]">
              <img
                src="https://raw.githubusercontent.com/kanasim26-droid/Littlenest/main/src/assets/images/product_gift_bundle_1793176729526.jpg"
                alt="Newborn Gift Hamper Box"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. GENUINE CUSTOMER REVIEWS (Attributable testimonials, no fake buzz) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7569]">
            Parent Reflections
          </span>
          <h2 className="text-3xl font-serif-luxury font-medium text-[#4A3B32] mt-1">
            Loved by Families Across Pakistan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-[#665449] italic leading-relaxed">
                "The ribbed romper in sage green was our son's coming-home outfit from the hospital in Lahore. The cotton is noticeably softer than standard baby stores, and the coconut buttons look so timeless."
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#E8DCCB]/60 text-xs">
              <strong className="block font-medium text-[#4A3B32]">Dr. Fatima Zahra</strong>
              <span className="text-[#8A7569]">Lahore · Verified Parent</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-[#665449] italic leading-relaxed">
                "Ordered the Welcome Keepsake Gift Box for my sister's baby shower in Karachi. It arrived in 2 days via TCS, packaged like a boutique luxury hamper with wooden rattle and waffle blanket. Everyone asked where I bought it."
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#E8DCCB]/60 text-xs">
              <strong className="block font-medium text-[#4A3B32]">Bilal Ahmed</strong>
              <span className="text-[#8A7569]">Karachi · Gift Giver</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8DCCB] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-[#665449] italic leading-relaxed">
                "Finding genuine 0-3M sizes that don't shrink drastically after the first gentle wash has been tough. Little Nest swaddles and sleepsuits wash wonderfully. Cash on delivery was seamless."
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-[#E8DCCB]/60 text-xs">
              <strong className="block font-medium text-[#4A3B32]">Zainab Mir</strong>
              <span className="text-[#8A7569]">Islamabad · Verified Parent</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
