/**
 * Navbar — top navigation for the user-facing site.
 */
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Pizza as PizzaIcon, LogOut, LayoutGrid, Package, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export function Navbar({ onCartClick }: { onCartClick: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast({ type: 'info', message: 'Logged out. See you soon! 👋' });
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition hover:text-primary ${isActive ? 'text-primary' : 'text-charcoal/80'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
            <PizzaIcon size={20} />
          </span>
          <span className="font-serif text-xl font-bold text-primary">Slice House</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/menu" className={linkClass}>Menu</NavLink>
          <NavLink to="/builder" className={linkClass}>Build Your Own</NavLink>
          {isAuthenticated && <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>}
          {isAuthenticated && <NavLink to="/orders" className={linkClass}>My Orders</NavLink>}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/login"
            aria-label="Admin login"
            title="Staff / Admin login"
            className="hidden rounded-full p-2 text-charcoal/40 transition hover:bg-charcoal/5 hover:text-primary md:inline-flex"
          >
            <Shield size={19} />
          </Link>
          <button
            onClick={onCartClick}
            aria-label="Open cart"
            className="relative rounded-full p-2 text-charcoal transition hover:bg-charcoal/5"
          >
            <ShoppingBag size={22} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="hidden text-sm text-charcoal/70 lg:inline">
                Hi, {user?.fullName.split(' ')[0]}
              </span>
              <button onClick={handleLogout} className="btn-ghost" aria-label="Log out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary">Sign up</Link>
            </div>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg p-2 text-charcoal hover:bg-charcoal/5 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-charcoal/10 bg-cream px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <MobileLink to="/menu" icon={LayoutGrid} label="Menu" onGo={() => setOpen(false)} />
            <MobileLink to="/builder" icon={PizzaIcon} label="Build Your Own" onGo={() => setOpen(false)} />
            {isAuthenticated ? (
              <>
                <MobileLink to="/dashboard" icon={LayoutGrid} label="Dashboard" onGo={() => setOpen(false)} />
                <MobileLink to="/orders" icon={Package} label="My Orders" onGo={() => setOpen(false)} />
                <button onClick={handleLogout} className="btn-outline mt-2">
                  <LogOut size={18} /> Log out
                </button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Link to="/login" className="btn-outline" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary" onClick={() => setOpen(false)}>Sign up</Link>
              </div>
            )}
            <div className="my-1 border-t border-charcoal/10" />
            <MobileLink to="/admin/login" icon={Shield} label="Admin Login" onGo={() => setOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  to,
  icon: Icon,
  label,
  onGo,
}: {
  to: string;
  icon: React.ComponentType<{ size?: number | string }>;
  label: string;
  onGo: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onGo}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-charcoal hover:bg-charcoal/5"
    >
      <Icon size={18} /> {label}
    </NavLink>
  );
}