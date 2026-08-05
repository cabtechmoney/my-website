import { useAuth } from '../context/AuthContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartIcon, CartIcon } from '../components/Icons';

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-5" style={{ marginTop: '80px' }}>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="card border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div className="card-body p-5">
              <div className="d-flex align-items-center gap-4 mb-4">
                <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="mb-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {user?.first_name} {user?.last_name}
                  </h2>
                  <p className="text-muted mb-0">@{user?.username}</p>
                  <p className="text-muted small mb-0">{user?.email}</p>
                </div>
              </div>

              <hr />

              <div className="row g-4 mt-2">
                <div className="col-6">
                  <Link to="/orders" className="text-decoration-none">
                    <div className="card-luxury p-4 text-center">
                      <CartIcon size={32} color="#c9a84c" />
                      <h6 className="mt-2 mb-0">My Orders</h6>
                      <small className="text-muted">View order history</small>
                    </div>
                  </Link>
                </div>
                <div className="col-6">
                  <Link to="/wishlist" className="text-decoration-none">
                    <div className="card-luxury p-4 text-center">
                      <HeartIcon size={32} color="#c9a84c" />
                      <h6 className="mt-2 mb-0">Wishlist</h6>
                      <small className="text-muted">Saved items</small>
                    </div>
                  </Link>
                </div>
              </div>

              <div className="mt-4">
                <button onClick={() => { logout(); navigate('/'); }}
                  className="btn btn-outline-dark w-100 py-2" style={{ borderRadius: '12px' }}>
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

