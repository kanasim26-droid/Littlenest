import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Search, Menu, X, Shield, Truck } from 'lucide-react';
import { AnnouncementBar } from './AnnouncementBar';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const { settings } = useStore();
  const { totalItemCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandName = settings?.brandName || 'Little Nest';

  const navLinks = [
    { label: 'Shop All', path: '/shop' },
    { label: 'New Arrivals', path: '/shop?collection=new-arrivals' },
    { label: 'Gift Sets', path: '/shop?collection=gift-sets' },
    { label: 'Track Order', path: '/track' },
    { label: 'About Us', path: '/about' },
  ];

  const handleLinkClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F4]/95 backdrop-blur-md border-b border-[#E8DCCB] transition-all">
      <AnnouncementBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Zone 1: Brand Wordmark (Single text element, no attached pills) */}
          <a
            href="/"
            onClick={(e) => handleLinkClick('/', e)}
            className="text-2xl sm:text-3xl font-serif-luxury font-medium tracking-tight text-[#4A3B32] hover:text-[#5A463C] transition-colors whitespace-nowrap shrink-0"
          >
            {brandName}
          </a>

          {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#665449]">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path.split('?')[0]));
              return (
                <a
                  key={link.label}
                  href={link.path}
                  onClick={(e) => handleLinkClick(link.path, e)}
                  className={`hover:text-[#4A3B32] transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                    isActive ? 'border-[#5A463C] text-[#4A3B32]' : 'border-transparent text-[#665449]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions (Search, Admin Portal, Shopping Bag) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Search clothing catalog"
              className="p-2 text-[#665449] hover:text-[#4A3B32] rounded-full hover:bg-[#E8DCCB]/40 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Portal Shortcut */}
            <a
              href="/admin"
              onClick={(e) => handleLinkClick('/admin', e)}
              title="Admin Dashboard"
              className="p-2 text-[#665449] hover:text-[#4A3B32] rounded-full hover:bg-[#E8DCCB]/40 transition-colors"
            >
              <Shield className="w-5 h-5" />
            </a>

            {/* Shopping Bag Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Shopping Bag (${totalItemCount} items)`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#5A463C] text-white hover:bg-[#43332B] transition-colors shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-semibold tabular-nums">{totalItemCount}</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#665449] hover:text-[#4A3B32] rounded-lg hover:bg-[#E8DCCB]/40 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DCCB] bg-[#FFF9F4] px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-1">
            <a
              href="/"
              onClick={(e) => handleLinkClick('/', e)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#4A3B32] hover:bg-[#E8DCCB]/30"
            >
              Home
            </a>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.path}
                onClick={(e) => handleLinkClick(link.path, e)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#665449] hover:text-[#4A3B32] hover:bg-[#E8DCCB]/30"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-[#E8DCCB]/50 flex items-center justify-between text-xs text-[#8A7569] px-3">
              <a
                href="/track"
                onClick={(e) => handleLinkClick('/track', e)}
                className="flex items-center gap-1.5 hover:text-[#4A3B32]"
              >
                <Truck className="w-3.5 h-3.5" />
                Track Order
              </a>
              <a
                href="/admin"
                onClick={(e) => handleLinkClick('/admin', e)}
                className="flex items-center gap-1.5 hover:text-[#4A3B32]"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Login
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
