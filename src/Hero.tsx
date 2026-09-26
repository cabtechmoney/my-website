import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero-luxury">
      <img
        className="hero-image"
        src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=2200&q=88"
        alt="Fashion editorial featuring a sculptural evening look"
        fetchPriority="high"
      />
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0em' }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hero-kicker"
          >
            Considered style, lasting impression
          </motion.p>
          <h1>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="d-block"
            >
              Luxury, with
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="gold-accent d-block"
            >
              a point of view.
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            A study in expressive dressing, thoughtful details, and pieces worth keeping.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="d-flex justify-content-center gap-3 flex-wrap"
          >
            <Link to="/products" className="btn btn-gold btn-lg px-4 py-3">
              Shop the collection
            </Link>
            <Link to="/contact" className="btn btn-outline-light btn-lg px-4 py-3">
              Meet Hera Palace
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <span className="hero-index">New season / 01</span>
    </section>
  );
}

