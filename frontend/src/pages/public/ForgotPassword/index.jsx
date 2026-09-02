import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const { settings } = useSettings();
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const businessName = settings.business_name || 'Prime Realty Kenya';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    document.title = `Forgot Password | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Reset your password. Enter your email to receive a password reset link.');
    }
  }, [businessName]);

  const mutation = useMutation({
    mutationFn: authAPI.forgotPassword,
    onSuccess: () => {
      setSubmitStatus('success');
    },
    onError: (error) => {
      setSubmitStatus('error');
      setErrorMsg(error.message || 'Failed to send reset email. Please try again.');
    },
  });

  const onSubmit = async (data) => {
    await mutation.mutateAsync(data);
  };

  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-text mb-2">Forgot Password?</h1>
            <p className="text-muted">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="card p-8">
            {submitStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-text mb-2">Reset Email Sent</h3>
                <p className="text-muted mb-4">
                  We've sent a password reset link to your email. Please check your inbox (and spam folder).
                </p>
                <Link to="/login" className="btn btn-primary w-full">
                  Back to Login
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

                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Email Address
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
                    'Send Reset Link'
                  )}
                </button>
              </form>
            )}
          </div>

          {submitStatus !== 'success' && (
            <div className="text-center mt-6">
              <p className="text-sm text-muted">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-hover font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
