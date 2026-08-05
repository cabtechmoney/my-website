import { useState, useEffect } from 'react';
import Hero from '../Hero';
import Features from '../Features';
import Testimonials from '../Testimonials';
import ProductSlider from '../components/ProductSlider';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
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

      {/* Featured Products Section */}
      <section className="py-5 bg-cream">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-5"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem' }}
          >
            Featured <span style={{ color: '#c9a84c' }}>Collection</span>
          </motion.h2>
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

      {/* Newsletter Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-white mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem' }}>
              Join the Hera Palace Circle
            </h2>
            <p className="text-white-50 mb-4 mx-auto" style={{ maxWidth: '500px' }}>
              Subscribe for exclusive updates, early access to new collections, and members-only offers.
            </p>
            <form className="d-flex justify-content-center gap-2 flex-wrap" onSubmit={subscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                className="form-control"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-label="Email address"
                style={{ maxWidth: '350px', borderRadius: '50px', padding: '0.8rem 1.5rem' }}
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubscribing}
                className="btn text-dark fw-bold px-4"
                style={{ borderRadius: '50px', background: '#c9a84c' }}
              >
                {isSubscribing ? 'Subscribing…' : 'Subscribe'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

      <Testimonials />
    </>
  );
}
