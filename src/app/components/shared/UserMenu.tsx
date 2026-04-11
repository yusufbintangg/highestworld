import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, LogOut, Package, MapPin, Settings } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export const UserMenu = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors text-sm"
      >
        <User className="w-4 h-4" />
        <span className="hidden md:inline">Login</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] hover:border-[var(--accent-gold)] transition-colors"
      >
        <User className="w-4 h-4 text-[var(--accent-gold)]" />
        <span className="hidden md:inline text-sm text-[var(--text-primary)]">
          {user?.name || 'Account'}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 border border-[var(--border)] bg-[var(--bg-card)] shadow-lg z-50">
            <div className="p-4 border-b border-[var(--border)]">
              <p className="text-sm text-[var(--text-primary)] mb-1">{user?.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
            </div>

            <div className="py-2">
              <Link to="/account" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors">
                <User className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-primary)]">My Account</span>
              </Link>
              <Link to="/account/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors">
                <Package className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-primary)]">Orders</span>
              </Link>
              <Link to="/account/addresses" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors">
                <MapPin className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-primary)]">Addresses</span>
              </Link>
              <Link to="/account/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors">
                <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-primary)]">Settings</span>
              </Link>
            </div>

            <div className="border-t border-[var(--border)] p-2">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors text-left">
                <LogOut className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm text-[var(--text-primary)]">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};