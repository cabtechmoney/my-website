import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from "./hooks/useCart";
import { useWishlist } from "./hooks/useWishlist";
import { useAuth } from "./context/AuthContext";
import { HeartOutlineIcon, CartIcon, SearchIcon, MenuIcon } from './components/Icons';

export default function Navbar() {
  const location = useLocation();
  const { totalItems, openCart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top navbar-luxury" style={{ zIndex: 1030 }}>
      <div className="container-fluid px-4">
        <Link className="navbar-brand" to="/" aria-label="Hera Palace home">
          <span className="brand-lockup">
            <span className="brand-name">Hera Palace</span>
            <span className="brand-note">Objects of desire</span>
          </span>
        </Link>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <MenuIcon size={24} color="#173d34" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <form className="mx-auto d-none d-lg-block" onSubmit={handleSearch} style={{ maxWidth: '280px', width: '100%' }}>
            <div className="input-group input-group-sm">
              <input type="text" className="form-control bg-transparent text-white border-secondary" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ borderRadius: '50px 0 0 50px', fontSize: '0.85rem' }} />
              <button type="submit" aria-label="Search products" className="btn btn-outline-secondary" style={{ borderRadius: '0 50px 50px 0' }}>
                <SearchIcon size={14} color="currentColor" />
              </button>
            </div>
          </form>
          <ul className="navbar-nav ms-auto align-items-lg-center gap-3">
            <li className="d-lg-none">
              <form className="mobile-search" onSubmit={handleSearch}>
                <label className="visually-hidden" htmlFor="mobile-product-search">Search products</label>
                <div className="input-group">
                  <input id="mobile-product-search" type="search" className="form-control" placeholder="Search the collection" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <button type="submit" aria-label="Search products" className="btn btn-gold"><SearchIcon size={16} color="currentColor" /></button>
                </div>
              </form>
            </li>
            <li><Link className={`nav-link text-white-50 hover-gold${location.pathname === '/' ? ' active' : ''}`} to="/">Home</Link></li>
            <li><Link className={`nav-link text-white-50 hover-gold${location.pathname.startsWith('/products') ? ' active' : ''}`} to="/products">Shop</Link></li>
            <li><Link className={`nav-link text-white-50 hover-gold${location.pathname === '/contact' ? ' active' : ''}`} to="/contact">Contact</Link></li>
            <li>
              <Link aria-label={`Wishlist, ${wishlistItems.length} items`} className="nav-link text-white-50 hover-gold d-flex align-items-center gap-1" to="/wishlist">
                <HeartOutlineIcon size={18} color="currentColor" />
                <span className="badge bg-gold text-dark rounded-pill">{wishlistItems.length}</span>
              </Link>
            </li>
            <li>
              <button aria-label={`Open cart with ${totalItems} items`} className="nav-link text-white-50 hover-gold position-relative bg-transparent border-0" onClick={openCart}>
                <CartIcon size={20} color="currentColor" />
                {totalItems > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-gold text-dark" style={{ fontSize: '0.6rem' }}>{totalItems}</span>
                )}
              </button>
            </li>
            {isAuthenticated ? (
              <li className="dropdown">
                <button aria-label="Open account menu" className="nav-link text-white-50 hover-gold dropdown-toggle bg-transparent border-0 d-flex align-items-center gap-1" data-bs-toggle="dropdown">
                  <span className="rounded-circle bg-gold text-dark d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ borderRadius: '12px', border: 'none', minWidth: '180px' }}>
                  <li><Link className="dropdown-item py-2" to="/profile">My Profile</Link></li>
                  <li><Link className="dropdown-item py-2" to="/orders">My Orders</Link></li>
                  <li><Link className="dropdown-item py-2" to="/wishlist">Wishlist</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item py-2 text-danger" onClick={() => { logout(); navigate('/'); }}>Sign Out</button></li>
                </ul>
              </li>
            ) : (
              <li><Link className="nav-link text-white-50 hover-gold" to="/login">Sign In</Link></li>
            )}
          </ul>
        </div>
      </div>
      <style>{`
        .hover-gold:hover { color: #c9a84c !important; }
        .bg-gold { background-color: #d95d42; }
        .dropdown-menu .dropdown-item:hover { background-color: #f4f1e9; color: #a83e2d; }
      `}</style>
    </nav>
  );
}

