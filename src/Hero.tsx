import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="hero-luxury">
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, letterSpacing: '0.15em' }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ color: '#c9a84c', textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: 300, marginBottom: '1rem' }}
          >
            The New Luxury Collection
          </motion.p>
          <h1>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="d-block"
            >
              Define Your
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="gold-accent d-block"
            >
              Elegance
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Discover curated luxury from the world's finest artisans
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="d-flex justify-content-center gap-3 flex-wrap"
          >
            <Link to="/products" className="btn btn-gold btn-lg px-5 py-3" style={{ borderRadius: '50px', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
              Explore Collection
            </Link>
            <Link to="/contact" className="btn btn-outline-light btn-lg px-5 py-3" style={{ borderRadius: '50px', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
              Get in Touch
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="position-absolute"
        style={{ top: '15%', right: '10%', width: '100px', height: '100px', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '50%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="position-absolute"
        style={{ bottom: '20%', left: '8%', width: '60px', height: '60px', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '50%' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
    </section>
  );
}

