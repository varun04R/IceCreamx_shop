import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { QueryProvider } from '@/context/query-context';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { LandingPage } from '@/pages/landing/landing-page';
import { AuthPage } from '@/pages/auth/auth-page';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { DashboardPage } from '@/pages/dashboard/dashboard-page';
import { IceCreamsPage } from '@/pages/ice-creams/ice-creams-page';
import { POSPage } from '@/pages/pos/pos-page';
import { OrdersPage } from '@/pages/orders/orders-page';
import { InventoryPage } from '@/pages/inventory/inventory-page';
import { CustomersPage } from '@/pages/customers/customers-page';
import { ToppingsPage } from '@/pages/toppings/toppings-page';
import { CouponsPage } from '@/pages/coupons/coupons-page';
import { ReviewsPage } from '@/pages/reviews/reviews-page';
import { NotificationsPage } from '@/pages/notifications/notifications-page';
import { SettingsPage } from '@/pages/settings/settings-page';

export default function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/ice-creams" element={<IceCreamsPage />} />
                <Route path="/pos" element={<POSPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/toppings" element={<ToppingsPage />} />
                <Route path="/coupons" element={<CouponsPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
