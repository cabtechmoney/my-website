import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center text-center" style={{ paddingTop: '80px' }}>
      <div>
        <p className="text-uppercase small mb-2" style={{ color: '#c9a84c', letterSpacing: '0.12em' }}>Error 404</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>This page is not in the collection</h1>
        <p className="text-muted mb-4">The page may have moved, or the link may be incomplete.</p>
        <Link to="/products" className="btn btn-gold px-4">Explore the collection</Link>
      </div>
    </div>
  );
}
