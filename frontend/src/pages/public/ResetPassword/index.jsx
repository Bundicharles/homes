import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const businessName = settings.business_name || 'Hemaprin Homes';

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token') || searchParams.get('reset_token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      password: '',
      password_confirmation: '',
      token: token || '',
    },
  });

  const password = watch('password', '');

  useEffect(() => {
    document.title = `Reset Password | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Reset your password to your secure account.');
    }
  }, [businessName]);

  const onSubmit = async (data) => {
    setErrorMsg('');
    try {
      await authAPI.resetPassword({
        token: data.token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      setSubmitStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMsg(error.message || 'Failed to reset password. Please try again.');
    }
  };

  if (!token) {
    return (
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-error" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-4">Invalid Reset Link</h1>
            <p className="text-muted mb-6">
              The password reset link is missing or invalid.
            </p>
            <Link to="/forgot-password" className="btn btn-primary">
              Request a New Reset Link
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text mb-2">Reset Your Password</h1>
            <p className="text-muted">
              Enter a new password for your account.
            </p>
          </div>

          <div className="card p-8">
            {submitStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">Password Reset Successfully</h3>
                <p className="text-muted mb-4">
                  Your password has been updated. Redirecting to login...
                </p>
                <Link to="/login" className="btn btn-primary w-full">
                  Go to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {errorMsg && (
                  <div className="p-3 bg-error/10 text-error rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <input type="hidden" {...register('token')} />
                <input type="hidden" {...register('password_confirmation')} />

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    New Password
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
                    Confirm New Password
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}

            <div className="text-center mt-6">
              <p className="text-sm text-muted">
                <Link to="/login" className="text-primary hover:text-primary-hover">
                  Back to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
