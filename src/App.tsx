import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './components/CartDrawer';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import NotFound from './pages/NotFound';
import { lazy, Suspense } from 'react';
import './App.css';

// Lazy load heavy pages
const LazyProducts = lazy(() => import('./pages/Products'));
const LazyProductDetail = lazy(() => import('./pages/ProductDetail'));
const LazyCheckout = lazy(() => import('./pages/Checkout'));

function App() {
  const location = useLocation();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <CartDrawer />
      <main className="flex-grow-1">
        <Suspense fallback={<div className="text-center py-5" role="status" aria-live="polite">Loading your collection…</div>}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<LazyProducts />} />
              <Route path="/product/:id" element={<LazyProductDetail />} />
              <Route path="/checkout" element={<LazyCheckout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
