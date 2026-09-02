import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';

const VerifyEmail = () => {
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Prime Realty Kenya';
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState(token ? 'verifying' : 'idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = `Verify Email | ${businessName}`;
  }, [businessName]);

  useEffect(() => {
    if (!token) return;
    authAPI.verifyEmail({ token })
      .then((res) => {
        setStatus('success');
        setMessage(res.message || 'Your email has been verified.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Verification link is invalid or expired.');
      });
  }, [token]);

  if (status === 'verifying') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Email Verified</h1>
          <p className="text-muted mb-6">{message}</p>
          <Link to="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <XCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
          <p className="text-muted mb-6">{message}</p>
          <Link to="/login" className="btn btn-primary">Back to Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <Mail className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
        <p className="text-muted">
          We've sent a verification link to your email address. Please click the link to activate your account.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
