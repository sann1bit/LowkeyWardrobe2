import { Component, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminNewsletter from "./pages/AdminNewsletter";
import AdminOrders from "./pages/AdminOrders";
import AdminSettings from "./pages/AdminSettings";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { SearchOverlay } from "./components/SearchOverlay";
import { Toast } from "./components/Toast";
import { PageLoader } from "./components/PageLoader";
import { RouteProgress } from "./components/RouteProgress";
import { ChatWidget } from "./components/ChatWidget";

const queryClient = new QueryClient();

const ADMIN_ROUTES = ['/admin', '/admin/login', '/admin/products', '/admin/newsletter', '/admin/orders', '/admin/settings'];

function isAdminRoute() {
  const path = window.location.pathname;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const rel = path.startsWith(base) ? path.slice(base.length) : path;
  return ADMIN_ROUTES.some(r => rel === r || rel.startsWith(r + '/'));
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] px-8">
          <p className="font-serif text-[28px] italic mb-4">Something went wrong</p>
          <p className="text-[13px] text-[#999] mb-6 text-center max-w-md">
            {(this.state.error as Error).message}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            className="px-6 py-3 bg-black text-white text-[12px] uppercase tracking-[0.15em] hover:bg-[#333]"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/newsletter" component={AdminNewsletter} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin" component={AdminDashboard} />
      <Route>
        <div className="min-h-screen flex items-center justify-center pt-[64px]">
          <h1 className="font-serif text-[42px] italic">Page not found</h1>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  const adminRoute = isAdminRoute();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <PageLoader />
          <RouteProgress />
          {adminRoute ? (
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
          ) : (
            <div className="flex flex-col min-h-screen bg-white">
              <Navbar />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
              <CartDrawer />
              <SearchOverlay />
              <Toast />
              <ChatWidget />
            </div>
          )}
        </WouterRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
