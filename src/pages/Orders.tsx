import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orders } from '../services/api';
import type { Order } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClockIcon, CartIcon } from '../components/Icons';
import '../styles/LoadingSkeleton.css';

const statusBadges: Record<string, { class: string; icon: string }> = {
  pending: { class: 'bg-warning text-dark', icon: '⏳' },
  confirmed: { class: 'bg-info text-dark', icon: '✅' },
  shipped: { class: 'bg-primary text-white', icon: '🚚' },
  delivered: { class: 'bg-success text-white', icon: '📦' },
  cancelled: { class: 'bg-danger text-white', icon: '❌' },
};

export default function Orders() {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    orders.list()
      .then(setOrdersList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <div className="skeleton" style={{ width: '200px', height: '36px', marginBottom: '2rem' }}></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton skeleton-order mb-4"></div>
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-5" style={{ marginTop: '80px' }}>
      <motion.h2
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="mb-4 d-flex align-items-center gap-2"
        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem' }}
      >
        <ClockIcon size={24} color="#c9a84c" /> My Orders
      </motion.h2>

      {ordersList.length === 0 ? (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center py-5">
          <CartIcon size={80} color="#6b6b6b" />
          <h5 className="mt-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem' }}>No orders yet</h5>
          <p className="text-muted">Your luxury shopping journey awaits.</p>
          <Link to="/products" className="btn btn-gold px-5 py-2 mt-2">Explore Collection</Link>
        </motion.div>
      ) : (
        <div className="d-flex flex-column gap-3">
          <p className="text-muted mb-0">{ordersList.length} order{ordersList.length > 1 ? 's' : ''}</p>
          {ordersList.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -2 }}
              className="card border-0 shadow-sm"
              style={{ borderRadius: '16px', overflow: 'hidden', cursor: 'pointer' }}
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      Order #{order.id}
                    </h5>
                    <small className="text-muted">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </small>
                  </div>
                  <div className="text-end">
                    <span className={`badge rounded-pill px-3 py-2 ${statusBadges[order.status]?.class || 'bg-secondary'}`}>
                      {statusBadges[order.status]?.icon || ''} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <div className="fw-bold mt-2 h5 mb-0" style={{ color: '#c9a84c' }}>
                      ${Number(order.total).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 overflow-auto pb-1">
                  {order.items.slice(0, 5).map((item, i) => (
                    <div key={i} className="text-center" style={{ minWidth: '70px' }}>
                      <div className="bg-light rounded-3 d-flex align-items-center justify-content-center" style={{ width: '70px', height: '70px' }}>
                        <CartIcon size={28} color="#999" />
                      </div>
                      <small className="d-block text-muted mt-1" style={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
                        {item.product_name?.slice(0, 15)}...
                      </small>
                      <small className="d-block" style={{ fontSize: '0.65rem', color: '#c9a84c' }}>x{item.quantity}</small>
                    </div>
                  ))}
                  {order.items.length > 5 && (
                    <div className="d-flex align-items-center">
                      <small className="text-muted fw-medium">+{order.items.length - 5} more</small>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
