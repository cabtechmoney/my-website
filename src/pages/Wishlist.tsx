import { useWishlist } from '../hooks/useWishlist';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { HeartIcon } from '../components/Icons';

export default function Wishlist() {
  const { items, toggleItem } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="container py-5 text-center" style={{ marginTop: '80px' }}>
        <HeartIcon size={64} color="#ddd" />
        <h2 className="mt-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Your wishlist is empty</h2>
        <p className="text-muted">Start saving your favourite pieces.</p>
        <Link to="/products" className="btn btn-gold">Explore Collection</Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-5" style={{ marginTop: '80px' }}>
      <h2 className="mb-4 d-flex align-items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        <HeartIcon size={24} color="#c9a84c" /> Your Wishlist ({items.length})
      </h2>
      <div className="row g-4">
        {items.map(item => (
          <div key={item.id} className="col-12 col-md-6 col-lg-3">
            <div className="product-card">
              <div className="product-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="product-body">
                <h5 className="product-title">{item.name}</h5>
                <p className="product-price">${item.price.toFixed(2)}</p>
                <div className="d-flex gap-2">
                  <button className="btn btn-dark btn-sm flex-grow-1" onClick={() => addItem(item)} aria-label={`Add ${item.name} to cart`}>Add to Cart</button>
                  <button className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center" aria-label={`Remove ${item.name} from wishlist`} style={{ width: '36px', height: '36px' }} onClick={() => toggleItem(item)}>
                    <HeartIcon size={16} color="#dc3545" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

