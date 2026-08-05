import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { motion } from 'framer-motion';
import { MinusIcon, PlusIcon, HeartIcon, HeartOutlineIcon, ArrowLeftIcon, ShieldIcon, TruckIcon } from '../components/Icons';
import { products as apiProducts } from '../services/api';
import type { Product as ApiProduct, Review } from '../services/api';
import '../styles/LoadingSkeleton.css';

interface ProductDetailData {
  id: number;
  name: string;
  category_name: string;
  price: number;
  compare_price: number | null;
  image: string;
  image_extra: string | null;
  description: string;
  stock: number;
  badge: string | null;
  average_rating: number | null;
  reviews: Review[];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setQuantity(1);

      try {
        // 1. Get all products to find the slug by id
        const allProducts = await apiProducts.list();
        const found = allProducts.find((p: ApiProduct) => p.id === Number(id));
        if (!found) {
          setProduct(null);
          setLoading(false);
          return;
        }

        // 2. Fetch full detail with reviews and extra images
        const detail = await apiProducts.detail(found.slug);
        const mapped: ProductDetailData = {
          id: detail.id,
          name: detail.name,
          category_name: detail.category_name || '',
          price: Number(detail.price),
          compare_price: detail.compare_price ? Number(detail.compare_price) : null,
          image: detail.image,
          image_extra: detail.image_extra || null,
          description: detail.description,
          stock: detail.stock,
          badge: detail.badge || null,
          average_rating: detail.average_rating || null,
          reviews: Array.isArray((detail as any).reviews) ? (detail as any).reviews : [],
        };
        setProduct(mapped);
        setSelectedImage(detail.image);
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <div className="row g-5">
          <div className="col-md-6">
            <div className="skeleton skeleton-detail-img"></div>
          </div>
          <div className="col-md-6">
            <div className="skeleton skeleton-detail-text small mb-3"></div>
            <div className="skeleton skeleton-detail-text large mb-3"></div>
            <div className="skeleton skeleton-detail-text" style={{ width: '40%' }}></div>
            <div className="skeleton skeleton-detail-text long mt-4"></div>
            <div className="skeleton skeleton-detail-text long"></div>
            <div className="skeleton skeleton-detail-text long"></div>
            <div className="d-flex gap-3 mt-4">
              <div className="skeleton skeleton-btn"></div>
              <div className="skeleton skeleton-btn" style={{ width: '160px' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-5 text-center" style={{ marginTop: '80px' }}>
        <h2>Product not found</h2>
        <Link to="/products" className="btn btn-gold mt-3">Back to collection</Link>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < fullStars ? 'gold-text' : 'text-muted'} style={{ fontSize: '1.1rem' }}>
        ★
      </span>
    ));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-5 product-detail-page" style={{ marginTop: '80px' }}>
      <Link to="/products" className="back-link d-inline-flex align-items-center gap-2 mb-4"><ArrowLeftIcon size={16} /> Continue exploring</Link>
      <div className="row g-5">
        {/* Image Gallery */}
        <div className="col-md-6">
          <div className="position-relative">
            {product.badge && (
              <span className="position-absolute top-0 start-0 badge bg-gold text-dark m-3 px-3 py-2" style={{ zIndex: 2 }}>
                {product.badge}
              </span>
            )}
            <img
              src={selectedImage || product.image}
              alt={product.name}
              className="img-fluid rounded-4 shadow"
              style={{ width: '100%', maxHeight: '600px', objectFit: 'cover' }}
            />
          </div>
          {/* Extra images thumbnails */}
          {(product.image_extra || product.image) && (
            <div className="d-flex gap-2 mt-3">
              <button type="button" className={`gallery-thumb ${selectedImage === product.image ? 'is-selected' : ''}`} onClick={() => setSelectedImage(product.image)} aria-label={`Show primary image of ${product.name}`}>
                <img src={product.image} alt="" />
              </button>
              {product.image_extra && (
                <button type="button" className={`gallery-thumb ${selectedImage === product.image_extra ? 'is-selected' : ''}`} onClick={() => setSelectedImage(product.image_extra!)} aria-label={`Show alternate image of ${product.name}`}>
                  <img src={product.image_extra} alt="" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="col-md-6">
          <p className="eyebrow mb-2">{product.category_name}</p>
          <h1 className="display-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{product.name}</h1>

          {/* Rating */}
          {product.average_rating && (
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="d-flex">{renderStars(product.average_rating)}</div>
              <span className="small text-muted">
                {product.average_rating.toFixed(1)} ({product.reviews.length} {product.reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="d-flex align-items-center gap-3 mb-2">
            <span className="h2 gold-text">${product.price.toFixed(2)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-muted text-decoration-line-through h5">${product.compare_price.toFixed(2)}</span>
            )}
          </div>

          {/* Stock */}
          <p className={`small ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
            {product.stock > 0 ? `✓ In stock (${product.stock} available)` : '✗ Out of stock'}
          </p>

          <p className="lead product-description">{product.description}</p>

          {/* Add to cart controls */}
          {product.stock > 0 && (
            <div className="d-flex align-items-center gap-3 mt-4">
              <div className="d-flex align-items-center border rounded">
                <button
                  className="btn btn-sm px-3 d-flex align-items-center justify-content-center"
                  aria-label="Decrease quantity"
                  style={{ width: '36px', height: '36px' }}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <MinusIcon size={16} />
                </button>
                <span className="px-3 fw-bold" aria-live="polite">{quantity}</span>
                <button
                  className="btn btn-sm px-3 d-flex align-items-center justify-content-center"
                  aria-label="Increase quantity"
                  style={{ width: '36px', height: '36px' }}
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                >
                  <PlusIcon size={16} />
                </button>
              </div>
              <button
                className="btn btn-gold px-5 py-3 flex-grow-1 flex-sm-grow-0"
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
                  }
                }}
              >
                Add to Cart
              </button>
              <button
                className="btn btn-outline-dark rounded-circle p-3 d-flex align-items-center justify-content-center"
                style={{ width: '52px', height: '52px' }}
                onClick={() => toggleItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
                aria-label={isInWishlist(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              >
                {isInWishlist(product.id) ? <HeartIcon size={22} color="#c9a84c" /> : <HeartOutlineIcon size={22} color="#333" />}
              </button>
            </div>
          )}

          <div className="product-assurances mt-4">
            <div><TruckIcon size={20} color="#c9a84c" /><span><strong>Complimentary delivery</strong><small>On orders over $500</small></span></div>
            <div><ShieldIcon size={20} color="#c9a84c" /><span><strong>Secure payment</strong><small>Protected checkout with Paystack</small></span></div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews.length > 0 && (
        <section className="mt-5 pt-4 border-top">
          <h3 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Customer Reviews</h3>
          {product.reviews.map((review) => (
            <div key={review.id} className="mb-3 pb-3 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <strong>{review.user_name || 'Anonymous'}</strong>
                <div className="d-flex">{renderStars(review.rating)}</div>
                <span className="small text-muted">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              {review.comment && <p className="mt-1 mb-0">{review.comment}</p>}
            </div>
          ))}
        </section>
      )}
    </motion.div>
  );
}
