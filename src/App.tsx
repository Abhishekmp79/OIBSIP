/**
 * App — root layout + router.
 *
 * Splits the user-facing site (with navbar/footer/cart drawer) from the admin
 * area (which has its own chrome). A global socket listener surfaces order
 * status changes as toasts for logged-in users.
 */
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { socket } from './socket';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';

import { Home } from './pages/Home';
import { Menu } from './pages/Menu';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Builder } from './pages/Builder';
import { Dashboard } from './pages/Dashboard';
import { Checkout } from './pages/Checkout';
import { Orders } from './pages/Orders';

import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminOrders } from './pages/admin/AdminOrders';

function useIsAdminRoute() {
  const { pathname } = useLocation();
  return pathname.startsWith('/admin');
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const isAdminRoute = useIsAdminRoute();

  // Global order-update listener → toast for logged-in users.
  useEffect(() => {
    function onOrderUpdate({ orderId, status }: { orderId: string; status: string }) {
      if (isAuthenticated && user?.role === 'user') {
        toast({
          type: 'info',
          message: `Order #${String(orderId).slice(-6).toUpperCase()} is now "${status}" 🍕`,
        });
      }
    }
    socket.on('orderUpdate', onOrderUpdate);
    return () => {
      socket.off('orderUpdate', onOrderUpdate);
    };
  }, [isAuthenticated, user, toast]);

  // Admin routes render without the public navbar/footer.
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            // AdminLayout itself contains <Outlet/>; protected here.
            <AdminLayout />
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="inventory" element={<AdminInventory />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onCartClick={() => setCartOpen(true)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/builder" element={<Builder />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

/** Inline guard — redirect to login if not authenticated. */
import { Navigate } from 'react-router-dom';
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-charcoal/50">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
