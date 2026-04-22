import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useAuth } from '../../../context/AuthContext';
import { Search, ShoppingBag, X, ArrowRight, User } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { categories } from '../../../data/categories';
import { cn } from '../../../lib/utils';
import { useProductSearch } from '../../hooks/useProductSearch';
import { CartDrawer } from '../shared/CartDrawer';

export const Navbar = () => {
  const [isScrolled, setIsScrolled]     = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchTrigger, setSearchTrigger] = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { search } = useLocation();
  const { user }  = useAuth();
  const { getCartCount } = useCart();
  const { product, loading } = useProductSearch(searchQuery);
  const cartCount = getCartCount();

  // Sync search query from URL
  useEffect(() => {
    const q = new URLSearchParams(search).get('q');
    if (q) setSearchQuery(decodeURIComponent(q));
  }, [search]);

  // Auto redirect after search
  useEffect(() => {
    if (searchTrigger && !loading && searchQuery.trim()) {
      setSearchTrigger(false);
      setSearchOpen(false);
      setMobileOpen(false);
      if (product?.slug) {
        navigate(`/products/${product.slug}`);
      } else {
        navigate(`/products?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  }, [searchTrigger, product, loading, searchQuery, navigate]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Shop',    path: '/products' },
    { name: 'Look',    path: '/about' },
    { name: 'Dealers', path: '/contact' },
    { name: 'Collections', path: '/collections' },
  ];

  const triggerSearch = () => {
    if (searchQuery.trim()) setSearchTrigger(true);
  };

  return (
    <>
      {/* ─── NAVBAR ─────────────────────────────────────────────── */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-black/8 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]'
            : 'bg-white border-b border-black/10'
        )}
      >
        {/* Top announcement bar */}
        <div className="flex items-center justify-between h-14 px-5 lg:px-8 max-w-[1600px] mx-auto">

          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex items-center shrink-0 group"
          >
            <img
              src="/logo hw web 2.jpg"
              alt="Highest World"
              className="h-9 w-auto transition-opacity duration-200 group-hover:opacity-75"
            />
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'relative text-[11px] tracking-[0.22em] uppercase font-semibold transition-colors duration-200 py-1 group',
                  location.pathname === link.path
                    ? 'text-black'
                    : 'text-gray-400 hover:text-black'
                )}
              >
                {link.name}
                {/* Animated underline */}
                <span
                  className={cn(
                    'absolute -bottom-0.5 left-0 h-[1.5px] bg-black transition-all duration-300',
                    location.pathname === link.path
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  )}
                />
              </Link>
            ))}
          </div>

          {/* ── Right Icons ── */}
          <div className="flex items-center gap-1">

            {/* Search button */}
            <button
              onClick={() => setSearchOpen(prev => !prev)}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200',
                searchOpen ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'
              )}
              aria-label="Search"
            >
              {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Account — desktop only */}
            <Link
              to={user ? '/account' : '/login'}
              className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-all duration-200"
              aria-label="Account"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Cart */}
            <CartDrawer>
              <button
                className="relative flex items-center justify-center w-10 h-10 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 transition-all duration-200"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>
            </CartDrawer>

            {/* Mobile Burger */}
            <button
              onClick={() => setMobileOpen(prev => !prev)}
              className="lg:hidden flex flex-col items-center justify-center w-10 h-10 gap-[5px] rounded-full hover:bg-gray-100 transition-all duration-200"
              aria-label="Menu"
            >
              <span className={cn(
                'block h-[1.5px] bg-black transition-all duration-300 origin-center',
                mobileOpen ? 'w-5 rotate-45 translate-y-[6.5px]' : 'w-5'
              )} />
              <span className={cn(
                'block h-[1.5px] bg-black transition-all duration-300',
                mobileOpen ? 'w-0 opacity-0' : 'w-3.5'
              )} />
              <span className={cn(
                'block h-[1.5px] bg-black transition-all duration-300 origin-center',
                mobileOpen ? 'w-5 -rotate-45 -translate-y-[6.5px]' : 'w-5'
              )} />
            </button>
          </div>
        </div>

        {/* ── Search Dropdown ── */}
        <div className={cn(
          'overflow-hidden transition-all duration-300 border-t border-black/8',
          searchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="flex items-center gap-3 px-5 lg:px-8 h-16 max-w-[1600px] mx-auto">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              autoFocus={searchOpen}
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') triggerSearch();
                if (e.key === 'Escape') setSearchOpen(false);
              }}
              className="flex-1 text-[13px] tracking-wide bg-transparent outline-none text-black placeholder:text-gray-300 font-medium"
            />
            {searchQuery && (
              <button
                onClick={triggerSearch}
                className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase font-semibold text-black hover:opacity-60 transition-opacity"
              >
                Go <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── MOBILE FULL-SCREEN MENU ────────────────────────────── */}
      <div className={cn(
        'fixed inset-0 z-40 bg-white flex flex-col transition-all duration-500 lg:hidden',
        mobileOpen
          ? 'opacity-100 pointer-events-auto translate-y-0'
          : 'opacity-0 pointer-events-none -translate-y-4'
      )}>
        {/* Spacer for navbar height */}
        <div className="h-[89px] shrink-0" />

        <div className="flex-1 flex flex-col px-7 py-8 overflow-y-auto">
          {/* Nav links — big editorial style */}
          <nav className="flex-1 space-y-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group flex items-center justify-between py-4 border-b border-gray-100 transition-all duration-200',
                  'animate-in fade-in slide-in-from-left-4',
                )}
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <span className={cn(
                  'text-3xl font-bold tracking-tight uppercase transition-colors duration-200',
                  location.pathname === link.path ? 'text-black' : 'text-gray-300 group-hover:text-black'
                )}>
                  {link.name}
                </span>
                <ArrowRight className={cn(
                  'w-5 h-5 transition-all duration-200 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
                  location.pathname === link.path && 'translate-x-0 opacity-100 text-black'
                )} />
              </Link>
            ))}

            {/* Categories sub-list */}
            <div className="pt-6">
              <p className="text-[9px] tracking-[0.35em] uppercase text-gray-300 mb-3 font-semibold">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-[10px] tracking-[0.18em] uppercase font-medium px-3 py-1.5 border border-gray-200 text-gray-500 hover:border-black hover:text-black transition-all duration-200"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Bottom section */}
          <div className="pt-8 space-y-4 border-t border-gray-100 mt-8">
            <Link
              to={user ? '/account' : '/login'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase font-semibold text-gray-500 hover:text-black transition-colors"
            >
              <User className="w-4 h-4" />
              {user ? 'My Account' : 'Login'}
            </Link>
            <p className="text-[9px] text-gray-200 tracking-[0.3em] uppercase">© 2026 Highest World</p>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-[89px]" />
    </>
  );
};

