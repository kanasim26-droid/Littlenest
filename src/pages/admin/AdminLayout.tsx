import React, { useState } from 'react';
import { clearAdminToken } from '../../services/api';
import { 
  LayoutDashboard, 
  Package, 
  Boxes,
  FolderTree, 
  ShoppingBag, 
  Tag, 
  CreditCard, 
  Megaphone, 
  MessageSquare, 
  Truck, 
  Mail, 
  Settings, 
  LogOut, 
  Store, 
  Menu, 
  X,
  ShieldCheck 
} from 'lucide-react';

export type AdminTab = 
  | 'overview'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'orders'
  | 'discounts'
  | 'payments'
  | 'announcements'
  | 'popups'
  | 'suppliers'
  | 'emails'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onViewStore: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  onViewStore,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'discounts', label: 'Discounts & Coupons', icon: Tag },
    { id: 'payments', label: 'Payment Settings', icon: CreditCard },
    { id: 'announcements', label: 'Announcement Bar', icon: Megaphone },
    { id: 'popups', label: 'Popup Campaigns', icon: MessageSquare },
    { id: 'suppliers', label: 'AliExpress Dropship', icon: Truck },
    { id: 'emails', label: 'Email Automation', icon: Mail },
    { id: 'settings', label: 'Store Settings', icon: Settings },
  ];

  const handleNavClick = (tab: AdminTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    clearAdminToken();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] flex flex-col md:flex-row text-[#4A3B32]">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-[#E8DCCB] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#5A463C]" />
          <span className="font-serif-luxury font-bold text-base text-[#4A3B32]">Little Nest Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-[#665449] hover:bg-[#FAF3EB] rounded"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-64 bg-white border-r border-[#E8DCCB] shrink-0 flex flex-col justify-between ${
          mobileMenuOpen ? 'block fixed inset-0 z-50 overflow-y-auto' : 'hidden md:flex'
        }`}
      >
        <div>
          {/* Brand Lockup */}
          <div className="p-6 border-b border-[#E8DCCB] flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-[#4A3B32]">
                Little Nest
              </h2>
              <span className="text-[11px] text-[#8A7569] block font-mono">Store Administrator</span>
            </div>
            {mobileMenuOpen && (
              <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-1 text-[#8A7569]">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-[#FAF3EB] text-[#5A463C] font-semibold border-l-2 border-[#5A463C]'
                      : 'text-[#665449] hover:bg-[#FAF3EB]/60 hover:text-[#4A3B32]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#5A463C]' : 'text-[#8A7569]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#E8DCCB] space-y-2">
          <button
            onClick={onViewStore}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#5A463C] hover:bg-[#FAF3EB] transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>View Storefront</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 max-w-7xl">
        {children}
      </main>

    </div>
  );
};
