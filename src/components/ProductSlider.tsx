import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../hooks/useCart';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

interface ProductSliderProps {
  products: Product[];
  itemsPerView?: number;
}

export default function ProductSlider({ products, itemsPerView = 4 }: ProductSliderProps) {
  const { addItem } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [visibleItems, setVisibleItems] = useState(itemsPerView);
  const totalPages = Math.ceil(products.length / visibleItems);

  useEffect(() => {
    const updateVisibleItems = () => {
      if (window.innerWidth < 576) {
        setVisibleItems(1);
      } else if (window.innerWidth < 992) {
        setVisibleItems(2);
      } else {
        setVisibleItems(itemsPerView);
      }
    };

    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, [itemsPerView]);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = totalPages - 1;
      if (next >= totalPages) next = 0;
      return next;
    });
  },[totalPages]);

  const startIndex = currentIndex * visibleItems;
  const visibleProducts = products.slice(startIndex, startIndex + visibleItems);

  return (
    <div className="product-slider position-relative">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction < 0 ? '100%' : '-100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="row g-4"
        >
          {visibleProducts.map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="col-12 col-md-6 col-lg-3">
              <div className="product-card">
                <Link to={`/product/${product.id}`} className="product-image d-block" aria-label={`View ${product.name}`}>
                  <img src={product.image} alt={product.name} />
                </Link>
                <div className="product-body">
                  <Link to={`/product/${product.id}`} className="product-title-link">
                    <h5 className="product-title">{product.name}</h5>
                  </Link>
                  <p className="text-muted small">{product.description}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <div className="d-flex gap-2">
                      <Link className="btn btn-outline-gold btn-sm px-3" to={`/product/${product.id}`}>View</Link>
                      <button className="btn btn-dark btn-sm rounded-pill px-3" onClick={() => addItem(product)} aria-label={`Add ${product.name} to cart`}>Add</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => paginate(-1)}
        aria-label="Show previous products"
        className="slider-btn prev-btn"
        style={{
          position: 'absolute',
          top: '50%',
          left: '-1rem',
          transform: 'translateY(-50%)',
          zIndex: 10,
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          fontSize: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        ‹
      </button>
      <button
        onClick={() => paginate(1)}
        aria-label="Show next products"
        className="slider-btn next-btn"
        style={{
          position: 'absolute',
          top: '50%',
          right: '-1rem',
          transform: 'translateY(-50%)',
          zIndex: 10,
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          fontSize: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}
      >
        ›
      </button>

      <div className="d-flex justify-content-center gap-2 mt-4">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            aria-label={`Show product page ${idx + 1}`}
            aria-current={idx === currentIndex ? 'true' : undefined}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: 'none',
              background: idx === currentIndex ? '#c9a84c' : 'rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>

      <style>{`
        .slider-btn:hover {
          background: #c9a84c !important;
          color: #fff;
          transform: translateY(-50%) scale(1.1);
        }
      `}</style>
    </div>
  );
}
