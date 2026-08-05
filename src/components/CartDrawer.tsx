import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CloseIcon, BagIcon, MinusIcon, PlusIcon } from './Icons';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, isOpen, closeCart, clearCart } = useCart();
  const drawerRef = useFocusTrap(isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="position-fixed inset-0 bg-black bg-opacity-50"
            style={{ zIndex: 1040, top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Drawer */}
          <motion.div
          ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="position-fixed top-0 end-0 h-100 bg-white shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            style={{ zIndex: 1050, width: '420px', maxWidth: '90vw' }}
          >
            <div className="d-flex flex-column h-100">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
                <h5 className="mb-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Your Cart <span className="text-muted small">({items.reduce((s,i) => s + i.quantity, 0)})</span>
                </h5>
                <button onClick={closeCart} aria-label="Close shopping cart" className="btn btn-sm btn-outline-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <CloseIcon size={14} />
                </button>
              </div>

              {/* Items */}
              <div className="flex-grow-1 overflow-auto p-4">
                {items.length === 0 ? (
                  <div className="text-center py-5">
                    <BagIcon size={64} color="#6b6b6b" />
                    <p className="text-muted mt-3">Your cart is awaiting luxury...</p>
                    <Link to="/products" className="btn btn-gold mt-2" onClick={closeCart}>
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {items.map(item => (
                      <div key={item.id} className="d-flex gap-3 align-items-center border-bottom pb-3">
                        <img src={item.image} alt={item.name} width="64" height="64" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                        <div className="flex-grow-1">
                          <h6 className="mb-0">{item.name}</h6>
                          <span className="text-muted small">${item.price.toFixed(2)}</span>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <button aria-label={`Decrease ${item.name} quantity`} className="btn btn-sm btn-outline-dark rounded-circle px-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                              <MinusIcon size={14} />
                            </button>
                            <span className="fw-bold">{item.quantity}</span>
                            <button aria-label={`Increase ${item.name} quantity`} className="btn btn-sm btn-outline-dark rounded-circle px-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              <PlusIcon size={14} />
                            </button>
                            <button aria-label={`Remove ${item.name} from cart`} className="btn btn-sm text-danger ms-2 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }} onClick={() => removeItem(item.id)}>
                              <CloseIcon size={14} color="currentColor" />
                            </button>
                          </div>
                        </div>
                        <div className="fw-bold">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-4 border-top bg-light">
                  <div className="d-flex justify-content-between mb-3">
                    <span>Subtotal</span>
                    <span className="fw-bold h5">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="d-grid gap-2">
                    <Link to="/checkout" className="btn btn-gold py-2" onClick={closeCart}>
                      Proceed to Checkout
                    </Link>
                    <button className="btn btn-outline-dark py-1" onClick={clearCart}>
                      Clear Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
