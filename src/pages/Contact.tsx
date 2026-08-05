import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { contact } from '../services/api';
import { ClockIcon, MailIcon, ShieldIcon } from '../components/Icons';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name.'),
  email: z.string().email('Please enter a valid email address.'),
  message: z.string().min(10, 'Please share a little more detail.'),
});

type ContactForm = z.infer<typeof schema>;

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      await contact.send(data);
      toast.success("Message sent. We'll reply within 24 hours.");
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to send your message.');
    }
  };

  return (
    <div className="container py-5 contact-page" style={{ marginTop: '80px' }}>
      <div className="row g-5 justify-content-center">
        <aside className="col-lg-4 contact-intro">
          <p className="eyebrow mb-2">Client care</p>
          <h1>Considered help, whenever you need it.</h1>
          <p className="text-muted">Our team is here to help with an order, a product question, or finding the right piece.</p>
          <div className="contact-promises">
            <div><ClockIcon size={19} color="#c9a84c" /><span><strong>Thoughtful replies</strong><small>We aim to respond within 24 hours.</small></span></div>
            <div><ShieldIcon size={19} color="#c9a84c" /><span><strong>Private by design</strong><small>Your message is handled securely.</small></span></div>
            <div><MailIcon size={19} color="#c9a84c" /><span><strong>Personal assistance</strong><small>For orders, product, and styling questions.</small></span></div>
          </div>
        </aside>
        <div className="col-lg-6">
          <form onSubmit={handleSubmit(onSubmit)} className="contact-form card-luxury p-4 p-md-5">
            <h2 className="mb-1">Send a message</h2>
            <p className="text-muted mb-4">Tell us how we can make your experience exceptional.</p>
            <div className="mb-3">
              <label htmlFor="contact-name" className="form-label">Name</label>
              <input id="contact-name" autoComplete="name" className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name')} />
              <div className="invalid-feedback">{errors.name?.message}</div>
            </div>
            <div className="mb-3">
              <label htmlFor="contact-email" className="form-label">Email</label>
              <input id="contact-email" type="email" autoComplete="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register('email')} />
              <div className="invalid-feedback">{errors.email?.message}</div>
            </div>
            <div className="mb-4">
              <label htmlFor="contact-message" className="form-label">Message</label>
              <textarea id="contact-message" rows={5} className={`form-control ${errors.message ? 'is-invalid' : ''}`} {...register('message')} />
              <div className="invalid-feedback">{errors.message?.message}</div>
            </div>
            <button type="submit" disabled={isSubmitting} className="btn btn-gold w-100 py-3">
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
