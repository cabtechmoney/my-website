import { motion } from 'framer-motion';
import { ShieldIcon, CartIcon, StarIcon } from './components/Icons';

export default function Features() {
  const features = [
    { title: 'Premium Quality', description: 'Handpicked from the world\'s finest artisans and designers', icon: StarIcon },
    { title: 'Secure Shopping', description: 'Enterprise-grade encryption for your peace of mind', icon: ShieldIcon },
    { title: 'Free Shipping', description: 'Complimentary worldwide shipping on orders over $500', icon: CartIcon },
  ];

  return (
    <section className="py-5 bg-cream">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-5 section-title"
        >
          Why <span>Hera Palace</span>
        </motion.h2>
        <div className="row g-4">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="col-md-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="card-luxury p-4 text-center h-100 d-flex align-items-center justify-content-center"
                  style={{ minHeight: '220px' }}
                >
                  <div>
                    <IconComponent size={48} color="#c9a84c" />
                    <h5 className="mt-3 fw-bold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem' }}>{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

