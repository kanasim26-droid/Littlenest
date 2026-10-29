import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { SearchModal } from './components/common/SearchModal';
import { AnnouncementPopup } from './components/common/AnnouncementPopup';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { StaticPages } from './pages/StaticPages';

// Admin Pages
import { AdminLayout, AdminTab } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminDiscounts } from './pages/admin/AdminDiscounts';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminPopups } from './pages/admin/AdminPopups';
import { AdminSuppliers } from './pages/admin/AdminSuppliers';
import { AdminEmails } from './pages/admin/AdminEmails';
import { AdminSettings } from './pages/admin/AdminSettings';
import { getAdminToken } from './services/api';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [currentSearch, setCurrentSearch] = useState(window.location.search || '');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => !!getAdminToken());
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  // Handle browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setCurrentSearch(window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (pathWithSearch: string) => {
    const [path, search = ''] = pathWithSearch.split('?');
    window.history.pushState({}, '', pathWithSearch);
    setCurrentPath(path);
    setCurrentSearch(search ? `?${search}` : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to extract query parameters
  const queryParams = new URLSearchParams(currentSearch);

  // Determine current route view
  const renderCurrentView = () => {
    // 1. Admin Portal
    if (currentPath.startsWith('/admin')) {
      if (!isAdminAuthenticated) {
        return (
          <AdminLogin
            onLoginSuccess={() => setIsAdminAuthenticated(true)}
            onBackToStore={() => navigate('/')}
          />
        );
      }

      return (
        <AdminLayout
          currentTab={adminTab}
          onSelectTab={setAdminTab}
          onLogout={() => {
            setIsAdminAuthenticated(false);
            navigate('/');
          }}
          onViewStore={() => navigate('/')}
        >
          {adminTab === 'overview' && <AdminOverview onNavigateTab={setAdminTab} />}
          {adminTab === 'products' && <AdminProducts />}
          {adminTab === 'categories' && <AdminCategories />}
          {adminTab === 'inventory' && <AdminInventory />}
          {adminTab === 'orders' && <AdminOrders />}
          {adminTab === 'discounts' && <AdminDiscounts />}
          {adminTab === 'payments' && <AdminPayments />}
          {adminTab === 'announcements' && <AdminAnnouncements />}
          {adminTab === 'popups' && <AdminPopups />}
          {adminTab === 'suppliers' && <AdminSuppliers />}
          {adminTab === 'emails' && <AdminEmails />}
          {adminTab === 'settings' && <AdminSettings />}
        </AdminLayout>
      );
    }

    // 2. Customer Storefront
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#FFF9F4]">
        <Header
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="flex-1">
          {/* Homepage */}
          {currentPath === '/' && (
            <HomePage
              onNavigate={navigate}
              onSelectProduct={(slug) => navigate(`/product/${slug}`)}
            />
          )}

          {/* Shop All / Category / Collection */}
          {currentPath === '/shop' && (
            <ShopPage
              initialCollection={queryParams.get('collection') || undefined}
              initialCategory={queryParams.get('category') || undefined}
              onSelectProduct={(slug) => navigate(`/product/${slug}`)}
            />
          )}

          {/* Product Detail Page */}
          {currentPath.startsWith('/product/') && (
            <ProductDetailPage
              slug={currentPath.replace('/product/', '')}
              onNavigate={navigate}
              onSelectProduct={(slug) => navigate(`/product/${slug}`)}
            />
          )}

          {/* Checkout Page */}
          {currentPath === '/checkout' && (
            <CheckoutPage
              onNavigate={navigate}
              onOrderSuccess={(orderNum) => navigate(`/order-confirmation?orderNumber=${orderNum}`)}
            />
          )}

          {/* Order Confirmation Receipt */}
          {currentPath === '/order-confirmation' && (
            <OrderConfirmationPage
              orderNumber={queryParams.get('orderNumber') || 'LN-10821'}
              onNavigate={navigate}
            />
          )}

          {/* Track My Order */}
          {currentPath === '/track' && (
            <TrackOrderPage
              initialOrderNumber={queryParams.get('orderNumber') || undefined}
              onNavigate={navigate}
            />
          )}

          {/* Static Pages */}
          {currentPath === '/about' && <StaticPages pageType="about" onNavigate={navigate} />}
          {currentPath === '/contact' && <StaticPages pageType="contact" onNavigate={navigate} />}
          {currentPath === '/size-guide' && <StaticPages pageType="size-guide" onNavigate={navigate} />}
          {currentPath === '/shipping-policy' && <StaticPages pageType="shipping-policy" onNavigate={navigate} />}
          {currentPath === '/returns-policy' && <StaticPages pageType="returns-policy" onNavigate={navigate} />}
          {currentPath === '/faq' && <StaticPages pageType="faq" onNavigate={navigate} />}
          {currentPath === '/privacy-policy' && <StaticPages pageType="privacy-policy" onNavigate={navigate} />}
          {currentPath === '/terms' && <StaticPages pageType="terms" onNavigate={navigate} />}
          {currentPath === '/blog' && <StaticPages pageType="blog" onNavigate={navigate} />}
        </main>

        <Footer onNavigate={navigate} />

        {/* Global Slide-over Cart Drawer */}
        <CartDrawer onNavigate={navigate} />

        {/* Global Catalog Search Modal */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(slug) => navigate(`/product/${slug}`)}
        />

        {/* Global Controllable Promotional Announcement Popup */}
        <AnnouncementPopup />
      </div>
    );
  };

  return (
    <StoreProvider>
      <CartProvider>
        {renderCurrentView()}
      </CartProvider>
    </StoreProvider>
  );
}
