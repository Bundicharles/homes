import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Save, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, User } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { userProfileAPI } from '@/services/api';
import { resolveAssetUrl } from '@/utils';

const PasswordField = ({
  name,
  label,
  placeholder,
  show,
  setShow,
  errors,
  registerProps,
}) => (
  <div>
    <label className="block text-sm font-medium text-text mb-1">{label}</label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
      <input
        type={show ? 'text' : 'password'}
        className={`input pl-10 pr-12 ${errors[name] ? 'border-error' : ''}`}
        placeholder={placeholder}
        {...registerProps}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
    {errors[name] && <p className="text-error text-xs mt-1">{errors[name].message}</p>}
  </div>
);

const AdminProfile = () => {
  const { settings } = useSettings();
  const { user, refetchUser } = useAuth();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);

  useEffect(() => {
    document.title = `My Profile | ${businessName} Admin`;
  }, [businessName]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isSavingProfile },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSavingPassword },
  } = useForm();

  const profileMutation = useMutation({
    mutationFn: (data) => userProfileAPI.updateProfile(data),
    onSuccess: (response) => {
      if (response.success) {
        setProfileStatus({ type: 'success', message: 'Profile updated successfully' });
        refetchUser?.();
      } else {
        setProfileStatus({ type: 'error', message: response.message || 'Update failed' });
      }
      setTimeout(() => setProfileStatus(null), 4000);
    },
    onError: (err) => {
      setProfileStatus({ type: 'error', message: err.message || 'Update failed' });
      setTimeout(() => setProfileStatus(null), 4000);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => userProfileAPI.updatePassword(data),
    onSuccess: (response) => {
      if (response.success) {
        setPasswordStatus({ type: 'success', message: 'Password updated successfully' });
        resetPassword();
      } else {
        setPasswordStatus({ type: 'error', message: response.message || 'Update failed' });
      }
      setTimeout(() => setPasswordStatus(null), 4000);
    },
    onError: (err) => {
      setPasswordStatus({ type: 'error', message: err.message || 'Update failed' });
      setTimeout(() => setPasswordStatus(null), 4000);
    },
  });

  const onProfileSubmit = (values) => profileMutation.mutate(values);

  const onPasswordSubmit = (values) =>
    passwordMutation.mutate({
      current_password: values.current_password,
      new_password: values.new_password,
    });

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          My Profile
        </h1>
        <p className="text-muted text-sm mt-1">Manage your account details and password</p>
      </div>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={
              resolveAssetUrl(user?.profile_image) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=2563eb&color=fff`
            }
            alt={user?.name}
            className="w-16 h-16 rounded-full object-cover border border-border"
          />
          <div>
            <p className="font-semibold text-text">{user?.name}</p>
            <p className="text-sm text-muted">{user?.email}</p>
            {user?.role_slug && (
              <span className="badge badge-primary mt-1 capitalize">{user.role_slug}</span>
            )}
          </div>
        </div>

        {profileStatus && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
              profileStatus.type === 'success'
                ? 'bg-success/10 text-success'
                : 'bg-error/10 text-error'
            }`}
          >
            {profileStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {profileStatus.message}
          </div>
        )}

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Full Name</label>
            <input
              type="text"
              className={`input ${profileErrors.name ? 'border-error' : ''}`}
              placeholder="Your full name"
              {...registerProfile('name', { required: 'Name is required' })}
            />
            {profileErrors.name && (
              <p className="text-error text-xs mt-1">{profileErrors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Phone Number</label>
            <input
              type="tel"
              className="input"
              placeholder="+254 700 000 000"
              {...registerProfile('phone')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Email (read-only)</label>
            <input type="email" className="input bg-surface" value={user?.email || ''} disabled />
          </div>

          <button type="submit" className="btn btn-primary gap-2" disabled={isSavingProfile}>
            {isSavingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </form>
      </div>

      {/* Password Card */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Change Password
        </h2>

        {passwordStatus && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
              passwordStatus.type === 'success'
                ? 'bg-success/10 text-success'
                : 'bg-error/10 text-error'
            }`}
          >
            {passwordStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {passwordStatus.message}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
          <PasswordField
            name="current_password"
            label="Current Password"
            placeholder="••••••••"
            show={showCurrent}
            setShow={setShowCurrent}
            errors={passwordErrors}
            registerProps={registerPassword('current_password', {
              required: 'Current password is required',
            })}
          />

          <PasswordField
            name="new_password"
            label="New Password"
            placeholder="At least 8 characters"
            show={showNew}
            setShow={setShowNew}
            errors={passwordErrors}
            registerProps={registerPassword('new_password', {
              required: 'New password is required',
              minLength: { value: 8, message: 'Must be at least 8 characters' },
            })}
          />

          <PasswordField
            name="confirm_password"
            label="Confirm New Password"
            placeholder="Repeat new password"
            show={showConfirm}
            setShow={setShowConfirm}
            errors={passwordErrors}
            registerProps={registerPassword('confirm_password', {
              required: 'Please confirm the new password',
              validate: (value, values) =>
                value === values.new_password || 'Passwords do not match',
            })}
          />

          <button type="submit" className="btn btn-primary gap-2" disabled={isSavingPassword}>
            {isSavingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;