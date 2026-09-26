import { motion } from 'framer-motion';

export default function Testimonials() {
  const testimonials = [
    { name: 'Victoria K.', text: 'Absolutely exquisite. The quality of the gold pendant exceeded my expectations. This is true luxury.', rating: 5, role: 'Fashion Influencer' },
    { name: 'Marcus W.', text: 'The customer service is impeccable. They helped me find the perfect anniversary gift. Will definitely return.', rating: 5, role: 'Loyal Customer' },
    { name: 'Sophie L.', text: 'I\'ve never experienced such attention to detail. The packaging alone is a work of art. Highly recommended.', rating: 5, role: 'Interior Designer' },
  ];

  return (
    <section className="home-testimonials">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-5 section-title"
        >
          A few kind words <span>from the fitting room</span>
        </motion.h2>
        <div className="row g-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="col-md-4">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="card-luxury p-4 h-100"
              >
                <div className="mb-3">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} style={{ color: '#c9a84c', fontSize: '1.2rem' }}>★</span>
                  ))}
                </div>
                <p className="testimonial-quote flex-grow-1">
                  "{testimonial.text}"
                </p>
                <div className="mt-3">
                  <h6 className="mb-0 fw-bold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem' }}>
                    {testimonial.name}
                  </h6>
                  <small className="text-muted">{testimonial.role}</small>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

