import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const { settings } = useSettings();
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const businessName = settings.business_name || 'Prime Realty Kenya';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
      agree_terms: true,
    },
  });

  const password = watch('password', '');

  useEffect(() => {
    document.title = `Register | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Create an account to save properties and manage your real estate inquiries.');
    }
  }, [businessName]);

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      await registerAuth(data);
      navigate('/login');
    } catch (error) {
      setErrorMsg(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text mb-2">Create an Account</h1>
            <p className="text-muted">
              Join our platform to save properties, get personalized alerts, and manage your real estate journey.
            </p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="text"
                      className={`input pl-10 ${errors.name ? 'border-error' : ''}`}
                      placeholder="John Doe"
                      {...register('name', { required: 'Full name is required' })}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-error text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="tel"
                      className={`input pl-10 ${errors.phone ? 'border-error' : ''}`}
                      placeholder="+254 7XX XXX XXX"
                      {...register('phone', { required: 'Phone number is required' })}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-error text-xs mt-1">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="email"
                    className={`input pl-10 ${errors.email ? 'border-error' : ''}`}
                    placeholder="you@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Please enter a valid email address',
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-error text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`input pl-10 pr-12 ${errors.password ? 'border-error' : ''}`}
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must include upper, lower, and a number',
                      },
                    })}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error text-xs mt-1">{errors.password.message}</p>
                )}
                {password && !errors.password && (
                  <div className="mt-1">
                    <div className={`text-xs ${password.length >= 8 ? 'text-success' : 'text-muted'} flex items-center gap-1`}>
                      <CheckCircle className={`w-3 h-3 ${password.length >= 8 ? 'text-success' : 'text-muted'}`} />
                      At least 8 characters
                    </div>
                    <div className={`text-xs ${/^(?=.*[a-z])(?=.*[A-Z])/.test(password) ? 'text-success' : 'text-muted'} flex items-center gap-1`}>
                      <CheckCircle className={`w-3 h-3 ${/^(?=.*[a-z])(?=.*[A-Z])/.test(password) ? 'text-success' : 'text-muted'}`} />
                      Mixed case letters
                    </div>
                    <div className={`text-xs ${/\d/.test(password) ? 'text-success' : 'text-muted'} flex items-center gap-1`}>
                      <CheckCircle className={`w-3 h-3 ${/\d/.test(password) ? 'text-success' : 'text-muted'}`} />
                      At least one number
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`input pl-10 pr-12 ${errors.password_confirmation ? 'border-error' : ''}`}
                    placeholder="••••••••"
                    {...register('password_confirmation', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match',
                    })}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-error text-xs mt-1">{errors.password_confirmation.message}</p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agree_terms"
                  className="mt-1 rounded border-border text-primary focus:ring-primary"
                  {...register('agree_terms', { required: 'You must agree to the terms' })}
                />
                <label htmlFor="agree_terms" className="text-sm text-muted">
                  I agree to the <Link to="/terms" className="text-primary hover:text-primary-hover">Terms of Service</Link>{' '}
                  and <Link to="/privacy" className="text-primary hover:text-primary-hover">Privacy Policy</Link>.
                </label>
              </div>
              {errors.agree_terms && (
                <p className="text-error text-xs -mt-2">{errors.agree_terms.message}</p>
              )}

              {errorMsg && (
                <div className="p-3 bg-error/10 text-error rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary-hover font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
