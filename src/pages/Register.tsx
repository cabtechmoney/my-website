import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', first_name: '', last_name: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-vh-100 d-flex align-items-center" style={{ paddingTop: '80px', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
              className="card border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem' }}>
                    Join Hera Palace
                  </h2>
                  <p className="text-muted">Create your luxury shopping account</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-medium">First Name</label>
                      <input type="text" name="first_name" className="form-control" placeholder="First name"
                        value={formData.first_name} onChange={handleChange}
                        style={{ borderRadius: '12px', padding: '0.7rem 1rem' }} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-medium">Last Name</label>
                      <input type="text" name="last_name" className="form-control" placeholder="Last name"
                        value={formData.last_name} onChange={handleChange}
                        style={{ borderRadius: '12px', padding: '0.7rem 1rem' }} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium">Username *</label>
                      <input type="text" name="username" className="form-control" placeholder="Choose a username" required
                        value={formData.username} onChange={handleChange}
                        style={{ borderRadius: '12px', padding: '0.7rem 1rem' }} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-medium">Email *</label>
                      <input type="email" name="email" className="form-control" placeholder="your@email.com" required
                        value={formData.email} onChange={handleChange}
                        style={{ borderRadius: '12px', padding: '0.7rem 1rem' }} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-medium">Password *</label>
                      <input type="password" name="password" className="form-control" placeholder="Min 6 characters" required
                        value={formData.password} onChange={handleChange}
                        style={{ borderRadius: '12px', padding: '0.7rem 1rem' }} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-medium">Confirm Password *</label>
                      <input type="password" name="confirmPassword" className="form-control" placeholder="Repeat password" required
                        value={formData.confirmPassword} onChange={handleChange}
                        style={{ borderRadius: '12px', padding: '0.7rem 1rem' }} />
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading}
                    className="btn btn-gold w-100 py-3 fw-bold mt-4" style={{ borderRadius: '12px', fontSize: '1rem' }}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </motion.button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Already have an account? <Link to="/login" className="fw-bold text-decoration-none" style={{ color: '#c9a84c' }}>Sign In</Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

