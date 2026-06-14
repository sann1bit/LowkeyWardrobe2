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

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { SearchOverlay } from "./components/SearchOverlay";
import { Toast } from "./components/Toast";

const queryClient = new QueryClient();

const ADMIN_ROUTES = ['/admin', '/admin/login', '/admin/products', '/admin/newsletter', '/admin/orders'];

function isAdminRoute() {
  const path = window.location.pathname;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const rel = path.startsWith(base) ? path.slice(base.length) : path;
  return ADMIN_ROUTES.some(r => rel === r || rel.startsWith(r + '/'));
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
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        {adminRoute ? (
          <Router />
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
          </div>
        )}
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
