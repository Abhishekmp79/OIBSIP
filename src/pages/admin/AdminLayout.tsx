/**
 * AdminLayout — sidebar shell for all admin pages. Protects the area with the
 * ProtectedRoute guard (requireAdmin) and renders an <Outlet/> for nested
 * routes. Includes logout + low-stock badge indicator.
 */
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  LogOut,
  Pizza as PizzaIcon,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../api';
import { socket } from '../../socket';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export function AdminLayout() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminShell />
    </ProtectedRoute>
  );
}

function AdminShell() {
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [lowStockCount, setLowStockCount] = useState(0);

  const loadLowStock = async () => {
    try {
      const data = await api.inventory();
      setLowStockCount(
        data.items.filter((i: any) => i.quantity <= i.threshold).length
      );
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadLowStock();
    socket.on('inventoryUpdate', loadLowStock);
    return () => {
      socket.off('inventoryUpdate', loadLowStock);
    };
  }, []);

  const handleLogout = () => {
    logout();
    toast({ type: 'info', message: 'Logged out of admin' });
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-primary text-white' : 'text-charcoal/70 hover:bg-charcoal/5'
    }`;

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-charcoal/10 bg-white md:flex">
        <div className="flex items-center gap-2 border-b border-charcoal/10 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
            <PizzaIcon size={20} />
          </span>
          <div>
            <p className="font-serif text-lg font-bold leading-tight">Slice House</p>
            <p className="text-xs text-charcoal/50">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <NavLink to="/admin" end className={linkClass}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            <ClipboardList size={18} /> Orders
          </NavLink>
          <NavLink to="/admin/inventory" className={linkClass}>
            <Boxes size={18} /> Inventory
            {lowStockCount > 0 && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                <AlertTriangle size={12} /> {lowStockCount}
              </span>
            )}
          </NavLink>
        </nav>

        <div className="border-t border-charcoal/10 p-3">
          <div className="mb-2 px-3 text-xs text-charcoal/50">
            Signed in as<br />
            <span className="font-semibold text-charcoal/80">{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="btn-ghost w-full justify-start">
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-charcoal/10 bg-white px-4 py-3 md:hidden">
          <span className="flex items-center gap-2 font-serif font-bold">
            <PizzaIcon size={20} className="text-primary" /> Admin
          </span>
          <button onClick={handleLogout} aria-label="Log out" className="btn-ghost">
            <LogOut size={18} />
          </button>
        </div>

        {/* Mobile nav */}
        <div className="flex gap-1 border-b border-charcoal/10 bg-white px-2 py-2 md:hidden">
          <MobileTab to="/admin" end>Dashboard</MobileTab>
          <MobileTab to="/admin/orders">Orders</MobileTab>
          <MobileTab to="/admin/inventory">Inventory</MobileTab>
        </div>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function MobileTab({
  to,
  children,
  end,
}: {
  to: string;
  children: React.ReactNode;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium ${
          isActive ? 'bg-primary text-white' : 'text-charcoal/70'
        }`
      }
    >
      {children}
    </NavLink>
  );
}
