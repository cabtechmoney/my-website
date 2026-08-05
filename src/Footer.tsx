import { Link } from 'react-router-dom';
import { ShieldIcon, TruckIcon } from './components/Icons';

export default function Footer() {
  return (
    <footer className="footer-luxury">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 mb-4">
            <h5>Hera Palace</h5>
            <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>
              Discover the epitome of luxury. Curated collections of the finest fashion,
              jewelry, and accessories from around the world.
            </p>
            <Link className="footer-contact-link" to="/contact">Speak with a client advisor <span aria-hidden="true">→</span></Link>
          </div>

          <div className="col-6 col-lg-2">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/">Home</Link></li>
              <li className="mb-2"><Link to="/products">Shop</Link></li>
              <li className="mb-2"><Link to="/wishlist">Wishlist</Link></li>
              <li className="mb-2"><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h5>Categories</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/products?category=jewelry">Jewelry</Link></li>
              <li className="mb-2"><Link to="/products?category=clothing">Clothing</Link></li>
              <li className="mb-2"><Link to="/products?category=shoes">Shoes</Link></li>
              <li className="mb-2"><Link to="/products?category=accessories">Accessories</Link></li>
            </ul>
          </div>

          <div className="col-lg-4">
            <h5>Client Care</h5>
            <div className="footer-assurance">
              <ShieldIcon size={22} color="#c9a84c" />
              <span>Secure payment and protected checkout</span>
            </div>
            <div className="footer-assurance">
              <TruckIcon size={22} color="#c9a84c" />
              <span>Complimentary worldwide shipping over $500</span>
            </div>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0 small">© {new Date().getFullYear()} Hera Palace. All rights reserved. Luxury redefined.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <span className="small me-3"><Link to="/contact">Privacy Policy</Link></span>
            <span className="small"><Link to="/contact">Terms of Service</Link></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

