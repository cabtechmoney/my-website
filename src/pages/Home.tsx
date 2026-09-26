import { useState, useEffect } from 'react';
import Hero from '../Hero';
import Features from '../Features';
import Testimonials from '../Testimonials';
import ProductSlider from '../components/ProductSlider';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { newsletter } from '../services/api';
import { loadCatalog } from '../services/catalog';
import '../styles/LoadingSkeleton.css';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  badge?: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    loadCatalog().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const subscribe = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubscribing(true);
    try {
      await newsletter.subscribe(email);
      setEmail('');
      toast.success('You are now part of the Hera Palace Circle.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to subscribe right now.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <>
      <Hero />
      <Features />

      <section className="home-collection">
        <div className="container">
          <div className="home-section-heading">
            <div>
              <p className="eyebrow">Selected for this season</p>
              <h2 className="section-title">The considered collection</h2>
            </div>
            <Link to="/products">Discover all pieces <span aria-hidden="true">↗</span></Link>
          </div>
          {loading ? (
            <div className="row g-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="col-md-6 col-lg-3">
                  <div className="skeleton skeleton-card"></div>
                </div>
              ))}
            </div>
          ) : (
            products.length > 0 && <ProductSlider products={products.slice(0, 8)} />
          )}
        </div>
      </section>

      <section className="home-newsletter">
        <div className="container newsletter-layout">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="eyebrow">Notes from the house</p>
            <h2>Good things, delivered occasionally.</h2>
            <p>New arrivals, thoughtful edits, and little reasons to look forward to your inbox.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            viewport={{ once: true }}
          >
            <form className="newsletter-form" onSubmit={subscribe}>
              <input
                type="email"
                placeholder="Your email address"
                className="form-control"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-label="Email address"
                required
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="btn btn-dark"
              >
                {isSubscribing ? 'Joining…' : 'Sign me up'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <Testimonials />
    </>
  );
}
