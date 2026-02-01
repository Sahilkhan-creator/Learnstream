import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, Home, PlusCircle, BookMarked, User, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navigation = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Feed', path: '/', icon: Home },
    { name: 'Creator', path: '/creator', icon: PlusCircle },
    { name: 'Library', path: '/library', icon: BookMarked },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex sticky top-4 mx-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm z-50 px-6 py-4">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-heading font-bold text-xl">
              F
            </div>
            <span className="font-heading font-bold text-2xl text-foreground">Findhub</span>
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all',
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-muted hover:bg-white/60 hover:text-foreground'
                  )}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              data-testid="nav-logout"
              className="flex items-center space-x-2 px-4 py-2 rounded-full font-medium text-muted hover:bg-white/60 hover:text-foreground transition-all"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden sticky top-0 bg-white/70 backdrop-blur-xl border-b border-white/40 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-heading font-bold text-lg">
              F
            </div>
            <span className="font-heading font-bold text-xl text-foreground">Findhub</span>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            data-testid="mobile-menu-toggle"
            className="p-2 rounded-full hover:bg-white/60 transition-all"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-white/40 shadow-lg">
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-muted hover:bg-white/60 hover:text-foreground'
                    )}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                data-testid="mobile-nav-logout"
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-muted hover:bg-white/60 hover:text-foreground transition-all"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};