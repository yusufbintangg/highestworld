import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useCart } from '../../../context/CartContext';
import { categories } from '../../../data/categories';
import { cn } from '../../../lib/utils';
import { CartDrawer } from '../shared/CartDrawer';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Produk', path: '/produk' },
    { name: 'Koleksi', path: '/koleksi', hasDropdown: true },
    { name: 'Tentang', path: '/tentang' },
    { name: 'Kontak', path: '/kontak' },
    { name: 'Konfirmasi Pembayaran', path: '/konfirmasi-pembayaran' },
  ];

  const cartCount = getCartCount();

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border-accent shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo-hw-kuning.png" 
              alt="Highest World" 
              className="h-10 md:h-12 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-display tracking-[0.15em] text-foreground group-hover:text-accent-gold transition-colors">
                HIGHEST WORLD
              </span>
              <span className="text-[8px] md:text-[10px] tracking-[0.25em] text-muted-foreground font-subheading uppercase">
                Big Size. Real Style.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.path} className="relative group">
                <Link
                  to={link.path}
                  className={cn(
                    'text-sm font-subheading uppercase tracking-wider transition-colors relative',
                    location.pathname === link.path
                      ? 'text-accent-gold'
                      : 'text-foreground hover:text-accent-gold'
                  )}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-accent-gold"></span>
                  )}
                </Link>

                {/* Koleksi Dropdown */}
                {link.hasDropdown && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="bg-card border border-border-accent rounded-lg shadow-2xl p-6 w-[600px]">
                      <div className="grid grid-cols-2 gap-4">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            to={`/koleksi/${category.slug}`}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group/item"
                          >
                            <div className="text-accent-gold mt-1">
                              {/* Icon placeholder */}
                              <div className="w-5 h-5 bg-accent-gold/20 rounded" />
                            </div>
                            <div>
                              <h4 className="font-subheading font-semibold text-foreground group-hover/item:text-accent-gold transition-colors">
                                {category.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {category.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <Button variant="ghost" size="icon" className="hidden md:flex w-9 h-9">
              <Search className="h-5 w-5" />
            </Button>

            <CartDrawer>
              <Button variant="ghost" size="icon" className="w-9 h-9 relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-red text-accent-gold text-xs w-5 h-5 rounded-full flex items-center justify-center font-mono">
                    {cartCount}
                  </span>
                )}
              </Button>
            </CartDrawer>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="w-9 h-9">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col m-5 h-full">
                  <div className="mb-8">
                    <h2 className="font-display text-2xl tracking-[0.15em] text-accent-gold">
                      HIGHEST WORLD
                    </h2>
                    <p className="text-xs text-muted-foreground font-subheading uppercase tracking-wider">
                      Big Size. Real Style.
                    </p>
                  </div>

                  <nav className="flex-1">
                    <div className="space-y-2">
                      {navLinks.map((link) =>
                        link.hasDropdown ? (
                          <Accordion key={link.path} type="single" collapsible>
                            <AccordionItem value="koleksi" className="border-none">
                              <AccordionTrigger className="text-foreground hover:text-accent-gold font-subheading uppercase tracking-wider py-3">
                                {link.name}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2 pl-4">
                                  {categories.map((category) => (
                                    <Link
                                      key={category.id}
                                      to={`/koleksi/${category.slug}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="block py-2 text-sm text-muted-foreground hover:text-accent-gold transition-colors"
                                    >
                                      {category.name}
                                    </Link>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        ) : (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'block py-3 font-subheading uppercase tracking-wider transition-colors',
                              location.pathname === link.path
                                ? 'text-accent-gold'
                                : 'text-foreground hover:text-accent-gold'
                            )}
                          >
                            {link.name}
                          </Link>
                        )
                      )}
                    </div>
                  </nav>

                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">
                      © 2026 Highest World
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};