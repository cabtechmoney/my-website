import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { HeartIcon, HeartOutlineIcon } from "../components/Icons";
import { loadCatalog } from '../services/catalog';
import '../styles/LoadingSkeleton.css';
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  // Load products from backend
  useEffect(() => {
    loadCatalog()
      .then(data => {
        setProducts(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Sync search query from URL
  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // Apply filters and sorting
  useEffect(() => {
    let r = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (category !== "all") r = r.filter(p => p.category === category);
    r = r.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sort === "low-high") r.sort((a, b) => a.price - b.price);
    else if (sort === "high-low") r.sort((a, b) => b.price - a.price);
    else if (sort === "name") r.sort((a, b) => a.name.localeCompare(b.name));
    setFiltered(r);
  }, [products, category, sort, priceRange, searchQuery]);

  const categories = ["all", ...new Set(products.map(p => p.category))];
  const maxPrice = Math.max(...products.map(p => p.price), 1000);

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-cream py-5 min-vh-100" style={{ paddingTop: "100px" }}>
        <div className="container">
          <div className="skeleton" style={{ width: '250px', height: '48px', margin: '0 auto 3rem' }}></div>
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="skeleton skeleton-card"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-cream py-5 min-vh-100" style={{ paddingTop: "100px" }}>
      <div className="container">
        <h1 className="section-title">Our <span>Collection</span></h1>

        {/* Filters */}
        <div className="row g-3 mb-5 align-items-end">
          <div className="col-md-3">
            <label className="form-label small">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small">Sort by</label>
            <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="default">Default</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small">Max Price</label>
            <input
              type="range"
              className="form-range"
              min="0"
              max={maxPrice}
              step="10"
              value={priceRange[1]}
              onChange={e => setPriceRange([0, Number(e.target.value)])}
            />
            <span className="small text-muted">${priceRange[1]}</span>
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-outline-dark w-100"
              onClick={() => { setCategory("all"); setSort("default"); setPriceRange([0, maxPrice]); setSearchQuery(""); }}
            >
              Reset
            </button>
          </div>
        </div>

        <p className="text-muted mb-4">{filtered.length} products</p>

        {/* Product Grid */}
        <div className="row g-4 product-grid">
          <AnimatePresence>
            {filtered.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.04 }}
                className="col-md-6 col-lg-3"
              >
                <div className="product-card">
                  <Link to={`/product/${product.id}`}>
                    <div className="product-image">
                      <LazyLoadImage src={product.image} alt={product.name} effect="blur" height="280" />
                    </div>
                  </Link>
                  <button
                    className="wishlist-btn"
                    onClick={() => toggleItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
                    aria-label={isInWishlist(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                  >
                    {isInWishlist(product.id) ? <HeartIcon size={18} color="#c9a84c" /> : <HeartOutlineIcon size={18} color="#333" />}
                  </button>
                  <div className="product-body">
                    <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                      <h5 className="product-title">{product.name}</h5>
                    </Link>
                    <p className="text-muted small">{product.description}</p>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="product-price">${product.price.toFixed(2)}</span>
                      <button
                        className="btn btn-dark btn-sm rounded-pill px-4"
                        onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-5">
            <h5>No products match your filters</h5>
            <button
              className="btn btn-gold mt-3"
              onClick={() => { setCategory("all"); setSort("default"); setPriceRange([0, maxPrice]); setSearchQuery(""); }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}