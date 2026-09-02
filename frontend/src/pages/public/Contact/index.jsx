import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { contactAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import WhatsAppButton from '@/components/WhatsAppButton';

const Contact = () => {
  const { settings } = useSettings();
  const { isAuthenticated, user } = useAuth();
  const [submitStatus, setSubmitStatus] = useState(null);

  const businessName = settings.business_name || 'Prime Realty Kenya';
  const description = settings.description || 'Your trusted partner in Kenyan real estate.';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      subject: '',
      message: '',
      preferred_contact: 'email',
    },
  });

  useEffect(() => {
    document.title = `Contact Us | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Get in touch with our real estate team in Nairobi, Kenya. We are ready to assist you with all your property needs.');
    }
  }, [businessName, description]);

  const contactMutation = useMutation({
    mutationFn: contactAPI.submit,
    onSuccess: () => {
      setSubmitStatus('success');
    },
    onError: (error) => {
      setSubmitStatus('error');
    },
  });

  const onSubmit = async (data) => {
    try {
      await contactMutation.mutateAsync(data);
    } catch (e) {
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Office Address',
      value: settings.contact_address || 'Westlands, Nairobi, Kenya',
    },
    {
      icon: Phone,
      title: 'Phone Number',
      value: settings.contact_phone || '+254 700 000 001',
    },
    {
      icon: Mail,
      title: 'Email Address',
      value: settings.contact_email || 'info@realestate.co.ke',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: settings.contact_opening_hours || 'Mon-Fri: 8:00 AM - 6:00 PM',
    },
  ];

  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-text mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            We're here to help. Send us a message and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-text mb-4">Contact Information</h2>
              <div className="space-y-4">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-text">{info.title}</p>
                      <p className="text-muted">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-text mb-3">Need immediate assistance?</h3>
              <p className="text-sm text-muted mb-4">
                Use our WhatsApp chat for a faster response.
              </p>
              <WhatsAppButton className="w-full justify-center" />
            </div>
          </div>

          <div className="card p-6 lg:p-8">
            <h2 className="text-xl font-bold text-text mb-6">Send us a Message</h2>

            {submitStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">Message Sent Successfully!</h3>
                <p className="text-muted">
                  Thank you for contacting us. We will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className={`input ${errors.name ? 'border-error' : ''}`}
                      placeholder="John Doe"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                      <p className="text-error text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className={`input ${errors.phone ? 'border-error' : ''}`}
                      placeholder="+254 7XX XXX XXX"
                      {...register('phone', { required: 'Phone number is required' })}
                    />
                    {errors.phone && (
                      <p className="text-error text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className={`input ${errors.email ? 'border-error' : ''}`}
                    placeholder="john@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-error text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    className={`input ${errors.subject ? 'border-error' : ''}`}
                    placeholder="How can we help you?"
                    {...register('subject', { required: 'Subject is required' })}
                  />
                  {errors.subject && (
                    <p className="text-error text-xs mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Preferred Contact Method
                  </label>
                  <select
                    className="input"
                    {...register('preferred_contact')}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    className={`input resize-none ${errors.message ? 'border-error' : ''}`}
                    placeholder="Write your message here..."
                    {...register('message', {
                      required: 'Message is required',
                      minLength: {
                        value: 10,
                        message: 'Message must be at least 10 characters',
                      },
                    })}
                  />
                  {errors.message && (
                    <p className="text-error text-xs mt-1">{errors.message.message}</p>
                  )}
                </div>

                {submitStatus === 'error' && (
                  <div className="p-3 bg-error/10 text-error rounded-lg text-sm">
                    There was an error sending your message. Please try again.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
