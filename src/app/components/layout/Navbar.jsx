import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../context/AuthContext';
import { Link, useLocation } from 'react-router';
import { Search, ShoppingCart, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useCart } from '../../../context/CartContext';
import { categories } from '../../../data/categories';
import { cn } from '../../../lib/utils';
import { useProductSearch } from '../../hooks/useProductSearch';
import { CartDrawer } from '../shared/CartDrawer';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(false);
  const [redirectTo, setRedirectTo] = useState(null);
  
  const navigate = useNavigate();
  const { product, loading } = useProductSearch(searchQuery);
  const { getCartCount } = useCart();
  const { search } = useLocation();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(search).get('q');
    if (query) {
      setSearchQuery(decodeURIComponent(query));
    }
  }, [search]);

  // Auto redirect logic after search
  useEffect(() => {
    if (searchTrigger && !loading && searchQuery.trim()) {
      setSearchTrigger(false);
      
      if (product?.slug) {
        // Direct to product detail 🎉
        navigate(`/produk/${product.slug}`);
      } else {
        // Fallback to products list with query
        navigate(`/produk?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  }, [searchTrigger, product, loading, searchQuery, navigate]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Categories', path: '/produk' },
  //{ name: 'Collection', path: '/koleksi', hasDropdown: true },
    { name: 'Look', path: '/tentang' },
    { name: 'Dealers', path: '/kontak' },
  ];

  const cartCount = getCartCount();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center h-[52px] px-0">

          {/* Logo */}
          <Link to="/" className="flex items-center pl-4 pr-6 h-full border-r border-gray-200 shrink-0">
            <img src="/logo hw web 2.jpg" alt="Highest World" className="h-12 w-auto" />
          </Link>

          {/* Search bar — DESKTOP ONLY */}
          <div className="hidden lg:flex items-center flex-1 h-full border-r border-gray-200 px-4 gap-2">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="SEARCH"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  e.preventDefault();
                  setSearchTrigger(true);
                }
              }}
              className="w-full text-[11px] tracking-[0.2em] uppercase placeholder:text-gray-400 text-gray-800 bg-transparent outline-none font-medium"
            />
          </div>

          {/* Mobile spacer */}
          <div className="flex-1 lg:hidden" />

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center h-full">
            {navLinks.map((link) => (
              <div key={link.path} className="relative group h-full flex items-center">
                <Link
                  to={link.path}
                  className={cn(
                    'flex items-center px-5 h-full text-[11px] tracking-[0.18em] uppercase font-medium transition-colors border-r border-gray-200',
                    location.pathname === link.path ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  {link.name}
                </Link>
                {link.hasDropdown && (
                  <div className="absolute top-full left-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white border border-gray-200 shadow-sm w-64">
                      {categories.map((category, i) => (
                        <Link
                          key={category.id}
                          to={`/koleksi/${category.slug}`}
                          className={cn(
                            'flex items-center px-5 py-3 text-[11px] tracking-[0.15em] uppercase font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors',
                            i !== categories.length - 1 && 'border-b border-gray-100'
                          )}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Login — desktop */}
          <Link
              to={user ? "/account" : "/login"}
              className="hidden lg:flex items-center px-5 h-full text-[11px] tracking-[0.18em] uppercase font-medium text-gray-500 hover:text-gray-900 transition-colors border-l border-r border-gray-200">
              {user ? 'Akun' : 'Login'}
          </Link>

          {/* Cart — desktop text style */}
          <div className="hidden lg:block">
            <CartDrawer>
              <button className="flex items-center gap-1.5 px-5 h-[52px] text-[11px] tracking-[0.18em] uppercase font-medium text-gray-500 hover:text-gray-900 transition-colors border-r border-gray-200">
                <span>Cart</span>
                <span className="text-gray-900">({cartCount})</span>
              </button>
            </CartDrawer>
          </div>

          {/* Cart — mobile icon + badge */}
          <div className="lg:hidden">
            <CartDrawer>
              <button className="flex items-center justify-center w-11 h-[52px] relative">
                <ShoppingCart className="w-[18px] h-[18px] text-gray-800" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-2.5 right-1 min-w-[16px] h-4 bg-gray-900 text-white text-[9px] font-bold rounded-sm flex items-center justify-center px-0.5">
                    {cartCount}
                  </span>
                )}
              </button>
            </CartDrawer>
          </div>

          {/* Mobile Burger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button className="flex items-center justify-center w-11 h-[52px] border-l border-gray-200">
                <Menu className="w-[18px] h-[18px] text-gray-800" strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-0 bg-white border-l border-gray-200">
              <div className="flex flex-col h-full">
                {/* Search inside burger */}
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
                  <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <input
                    type="text"
                    placeholder="SEARCH"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        e.preventDefault();
                        setSearchTrigger(true);
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="w-full text-[11px] tracking-[0.2em] uppercase placeholder:text-gray-400 text-gray-800 bg-transparent outline-none font-medium"
                  />
                </div>

                <nav className="flex-1 overflow-y-auto">
                  {navLinks.map((link, i) =>
                    link.hasDropdown ? (
                      <Accordion key={link.path} type="single" collapsible>
                        <AccordionItem value="koleksi" className="border-none">
                          <AccordionTrigger className="px-5 py-4 text-[11px] tracking-[0.2em] uppercase font-medium text-gray-500 hover:text-gray-900 hover:no-underline border-t border-gray-100">
                            {link.name}
                          </AccordionTrigger>
                          <AccordionContent className="pb-0">
                            {categories.map((category) => (
                              <Link
                                key={category.id}
                                to={`/koleksi/${category.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-8 py-3 text-[11px] tracking-[0.15em] uppercase text-gray-400 hover:text-gray-900 transition-colors border-t border-gray-100"
                              >
                                {category.name}
                              </Link>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center px-5 py-4 text-[11px] tracking-[0.2em] uppercase font-medium transition-colors border-t border-gray-100',
                          location.pathname === link.path ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                        )}
                      >
                        {link.name}
                      </Link>
                    )
                  )}
                </nav>

                <div className="border-t border-gray-200 px-5 py-4 space-y-3">
                  <Link
                      to={user ? "/account" : "/login"}
                     onClick={() => setMobileMenuOpen(false)}
                     className="block text-[11px] tracking-[0.2em] uppercase font-medium text-gray-500 hover:text-gray-900 transition-colors"
                   >
                      {user ? 'Akun' : 'Login'}
                  </Link>
                  <p className="text-[10px] text-gray-300 tracking-widest uppercase">© 2026 Highest World</p>
                </div>

              </div>
            </SheetContent>
          </Sheet>

        </div>
      </nav>
      <div className="h-[52px]" />
    </>
  );
};