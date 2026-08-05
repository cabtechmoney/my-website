import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { orders, payment } from '../services/api';
import { ArrowLeftIcon, ShieldIcon, TruckIcon } from '../components/Icons';

// Zod schema – only shipping info + terms
const schema = z.object({
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  zip: z.string().min(4, 'ZIP code is required'),
  phone: z.string().min(8, 'Phone number is required'),
  terms: z.boolean().refine(v => v === true, 'You must agree to the terms'),
});

type FormData = z.infer<typeof schema>;

// Declare Paystack global
declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="container py-5 text-center" style={{ marginTop: '80px' }}>
        <h2>Your cart is empty</h2>
        <Link to="/products" className="btn btn-gold mt-3">
          Shop now
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: FormData): Promise<void> => {
    if (!isAuthenticated) {
      toast.error('Please sign in to place an order.');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    try {
      // 1. Create order on backend
      const order = await orders.create({
        shipping_address: data.address,
        city: data.city,
        zip_code: data.zip,
        phone: data.phone,
        notes: '',
      });

      // 2. Initialize Paystack transaction
      const payInit = await payment.initialize(order.id);

      // 3. Ensure Paystack is available
      if (!window.PaystackPop) {
        toast.error('Payment gateway is not available.');
        return;
      }

      const email = user?.email ?? '';

      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email,
        amount: Math.round(((order as any).total ?? totalPrice) * 100), // in kobo
        ref: payInit?.reference ?? '',
        callback: () => {
          toast.success('Payment successful! Your order is confirmed.');
          clearCart();
          navigate('/orders');
        },
        onClose: () => {
          toast.info('Payment window closed. You can try again from your orders.');
        },
      });

      // Open the payment UI — account for variations in Paystack handlers
      if (typeof handler.openIframe === 'function') {
        handler.openIframe();
      } else if (typeof handler.open === 'function') {
        handler.open();
      } else {
        toast.error('Unable to open payment window.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Order or payment failed.');
    }
  };

  return (
    <div className="container py-5 checkout-page" style={{ marginTop: '80px' }}>
      <Link to="/products" className="back-link d-inline-flex align-items-center gap-2 mb-4"><ArrowLeftIcon size={16} /> Continue shopping</Link>
      <div className="checkout-heading mb-5">
        <p className="eyebrow mb-2">Secure checkout</p>
        <h1>Complete your order</h1>
        <p>Enter your delivery details. Payment is completed securely through Paystack.</p>
      </div>
      <div className="row g-5">
        <div className="col-md-7">
          <form onSubmit={handleSubmit(onSubmit)} className="checkout-form card-luxury p-4 p-md-5">
            <h2 className="mb-1">Delivery details</h2>
            <p className="text-muted mb-4">Where should we send your order?</p>
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="address" className="form-label small">Address</label>
                <input
                  id="address"
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                  {...register('address')}
                  placeholder="123 Luxury Lane"
                />
                <div className="invalid-feedback">{errors.address?.message}</div>
              </div>
              <div className="col-6">
                <label htmlFor="city" className="form-label small">City</label>
                <input
                  id="city"
                  className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                  {...register('city')}
                  placeholder="New York"
                />
                <div className="invalid-feedback">{errors.city?.message}</div>
              </div>
              <div className="col-6">
                <label htmlFor="zip" className="form-label small">ZIP / Postal</label>
                <input
                  id="zip"
                  className={`form-control ${errors.zip ? 'is-invalid' : ''}`}
                  {...register('zip')}
                  placeholder="10001"
                />
                <div className="invalid-feedback">{errors.zip?.message}</div>
              </div>
              <div className="col-12">
                <label htmlFor="phone" className="form-label small">Phone</label>
                <input
                  id="phone"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  {...register('phone')}
                  placeholder="+1 234 567 890"
                />
                <div className="invalid-feedback">{errors.phone?.message}</div>
              </div>

              <div className="col-12 form-check mt-2">
                <input
                  id="terms"
                  type="checkbox"
                  className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`}
                  {...register('terms')}
                />
                <label htmlFor="terms" className="form-check-label">
                  I agree to the terms and conditions and understand this is a demo payment.
                </label>
                <div className="invalid-feedback">{errors.terms?.message}</div>
              </div>

              <button
                type="submit"
                className="btn btn-gold py-3 mt-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing…' : `Pay with Paystack – $${totalPrice.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="col-md-5">
          <div className="card-luxury p-4 checkout-summary">
            <h5 className="border-bottom pb-3">Order Summary</h5>
            {items.map(item => (
              <div key={item.id} className="d-flex justify-content-between py-2 border-bottom">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="d-flex justify-content-between mt-3 fw-bold">
              <span>Total</span>
              <span className="h5 gold-text">${totalPrice.toFixed(2)}</span>
            </div>
            <p className="small text-muted mt-2">
              You will be redirected to Paystack for secure payment.
            </p>
            <div className="checkout-assurances">
              <span><ShieldIcon size={17} color="#c9a84c" /> Encrypted payment</span>
              <span><TruckIcon size={17} color="#c9a84c" /> Tracked delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
