import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Heart, Mail, Phone, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const brandName = settings?.brandName || 'Little Nest';
  const contactEmail = settings?.contactEmail || 'care@littlenest.pk';
  const supportPhone = settings?.supportPhone || '+92 300 8765432';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const nav = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FAF3EB] border-t border-[#E8DCCB] text-[#5A463C] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand Story & Contact */}
          <div className="space-y-4">
            <h4 className="text-2xl font-serif-luxury font-medium text-[#4A3B32]">
              {brandName}
            </h4>
            <p className="text-sm text-[#735F53] leading-relaxed">
              Curated organic newborn apparel and nursery essentials. Made with pure combed cotton and gentle touches for life’s most precious moments.
            </p>
            <div className="pt-2 space-y-2 text-xs text-[#735F53]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8A7569]" />
                <a href={`mailto:${contactEmail}`} className="hover:text-[#4A3B32]">
                  {contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#8A7569]" />
                <a href={`tel:${supportPhone}`} className="hover:text-[#4A3B32]">
                  {supportPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Shop & Collections */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#8A7569] mb-4">
              Collections
            </h5>
            <ul className="space-y-2.5 text-sm text-[#665449]">
              <li>
                <a href="/shop" onClick={(e) => nav('/shop', e)} className="hover:text-[#4A3B32] transition-colors">
                  Shop All Newborn
                </a>
              </li>
              <li>
                <a href="/shop?collection=new-arrivals" onClick={(e) => nav('/shop?collection=new-arrivals', e)} className="hover:text-[#4A3B32] transition-colors">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="/shop?category=sleepsuits-and-rompers" onClick={(e) => nav('/shop?category=sleepsuits-and-rompers', e)} className="hover:text-[#4A3B32] transition-colors">
                  Sleepsuits & Rompers
                </a>
              </li>
              <li>
                <a href="/shop?category=blankets-and-swaddles" onClick={(e) => nav('/shop?category=blankets-and-swaddles', e)} className="hover:text-[#4A3B32] transition-colors">
                  Blankets & Swaddles
                </a>
              </li>
              <li>
                <a href="/shop?category=newborn-gift-sets" onClick={(e) => nav('/shop?category=newborn-gift-sets', e)} className="hover:text-[#4A3B32] transition-colors">
                  Newborn Gift Hampers
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#8A7569] mb-4">
              Customer Care
            </h5>
            <ul className="space-y-2.5 text-sm text-[#665449]">
              <li>
                <a href="/track" onClick={(e) => nav('/track', e)} className="hover:text-[#4A3B32] transition-colors">
                  Track My Order
                </a>
              </li>
              <li>
                <a href="/size-guide" onClick={(e) => nav('/size-guide', e)} className="hover:text-[#4A3B32] transition-colors">
                  Newborn Size Guide
                </a>
              </li>
              <li>
                <a href="/shipping-policy" onClick={(e) => nav('/shipping-policy', e)} className="hover:text-[#4A3B32] transition-colors">
                  Shipping & Delivery (TCS / Leopard)
                </a>
              </li>
              <li>
                <a href="/returns-policy" onClick={(e) => nav('/returns-policy', e)} className="hover:text-[#4A3B32] transition-colors">
                  14-Day Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="/faq" onClick={(e) => nav('/faq', e)} className="hover:text-[#4A3B32] transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a href="/privacy-policy" onClick={(e) => nav('/privacy-policy', e)} className="hover:text-[#4A3B32] transition-colors">
                  Privacy Policy & Terms
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Trust */}
          <div className="space-y-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#8A7569]">
              Gentle Letters & Offers
            </h5>
            <p className="text-xs text-[#735F53] leading-relaxed">
              Join our parent community for newborn care guides, restock alerts, and exclusive welcome perks.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter parent email address"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8DCCB] rounded-lg focus:outline-none focus:border-[#5A463C] text-[#4A3B32]"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="px-3.5 py-2 bg-[#5A463C] text-white rounded-lg hover:bg-[#43332B] transition-colors shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-emerald-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Welcome to Little Nest!
                </p>
              )}
            </form>

            <div className="pt-2">
              <span className="block text-[11px] font-medium text-[#8A7569] mb-2 uppercase tracking-wide">
                Supported Payment Options
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#5A463C]">
                <span className="px-2 py-1 bg-white border border-[#E8DCCB] rounded text-[11px]">
                  Cash on Delivery
                </span>
                <span className="px-2 py-1 bg-white border border-[#E8DCCB] rounded text-[11px]">
                  Easypaisa
                </span>
                <span className="px-2 py-1 bg-white border border-[#E8DCCB] rounded text-[11px]">
                  JazzCash
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E8DCCB]/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A7569]">
          <p>
            © {new Date().getFullYear()} {brandName} Store. All rights reserved. Designed for Little Ones.
          </p>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" onClick={(e) => nav('/privacy-policy', e)} className="hover:text-[#4A3B32]">
              Privacy Policy
            </a>
            <span aria-hidden="true">·</span>
            <a href="/terms" onClick={(e) => nav('/terms', e)} className="hover:text-[#4A3B32]">
              Terms of Service
            </a>
            <span aria-hidden="true">·</span>
            <a href="/admin" onClick={(e) => nav('/admin', e)} className="hover:text-[#4A3B32] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Console
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
