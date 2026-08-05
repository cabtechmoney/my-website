import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "../hooks/useCart";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { syncGuestCartToBackend } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || "/";

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!username || !password) {
    toast.error('Please fill in all fields');
    return;
  }
  setLoading(true);
  try {
    await login(username, password);
    await syncGuestCartToBackend(); // <-- added
    toast.success('Welcome back!');
    navigate(redirectTo, { replace: true });
  } catch (err) {
    toast.error('Invalid username or password');
  } finally {
    setLoading(false);
  }
};
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-vh-100 d-flex align-items-center"
      style={{
        paddingTop: "80px",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="card border-0 shadow-lg"
              style={{ borderRadius: "20px", overflow: "hidden" }}
            >
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2
                    className="mb-1"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "2.2rem",
                    }}
                  >
                    Welcome Back
                  </h2>
                  <p className="text-muted">
                    Sign in to your Hera Palace account
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-medium">
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{ borderRadius: "12px", padding: "0.8rem 1rem" }}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-medium">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ borderRadius: "12px", padding: "0.8rem 1rem" }}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="btn btn-gold w-100 py-3 fw-bold"
                    style={{ borderRadius: "12px", fontSize: "1rem" }}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </motion.button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="fw-bold text-decoration-none"
                      style={{ color: "#c9a84c" }}
                    >
                      Create Account
                    </Link>
                  </p>
                </div>

                <div className="mt-4 p-3 bg-light rounded-3">
                  <p className="small text-muted mb-1 text-center fw-medium">
                    Demo Credentials
                  </p>
                  <p className="small text-muted mb-0 text-center">
                    Username: <strong>demo</strong> | Password:{" "}
                    <strong>demo123</strong>
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
