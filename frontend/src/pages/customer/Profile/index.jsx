import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { customersAPI, userProfileAPI } from '@/services/api';
import {
  Save,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { resolveAssetUrl } from '@/utils';

const PasswordField = ({
  name,
  label,
  placeholder,
  show,
  setShow,
  errors,
  register,
}) => (
  <div>
    <label className="block text-sm font-medium text-text mb-1">{label}</label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
      <input
        type={show ? 'text' : 'password'}
        className={`input pl-10 pr-12 ${errors[name] ? 'border-error' : ''}`}
        placeholder={placeholder}
        {...register}
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
    {errors[name] && (
      <p className="text-error text-xs mt-1">{errors[name].message}</p>
    )}
  </div>
);

const CustomerProfile = () => {
  const { settings } = useSettings();
  const { user, refetchUser } = useAuth();
  const queryClient = useQueryClient();

  const businessName = settings.business_name || 'Hemaprin Homes';

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState(null);

  useEffect(() => {
    document.title = `My Profile | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'View and edit your profile information, change your password, and manage your account settings.'
      );
    }
  }, [businessName]);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: {
      errors: profileErrors,
      isSubmitting: profileSubmitting,
    },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    control,
    formState: {
      errors: passwordErrors,
      isSubmitting: passwordSubmitting,
    },
    reset: resetPasswordForm,
  } = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const newPasswordValue = useWatch({ control, name: 'new_password' });

  const updateMutation = useMutation({
    mutationFn: (data) => userProfileAPI.updateProfile(data),
    onSuccess: () => {
      setSaveStatus('success');
      refetchUser();
      queryClient.invalidateQueries({ queryKey: ['auth.me'] });
      setTimeout(() => setSaveStatus(null), 3000);
    },
    onError: () => {
      setSaveStatus('error');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => userProfileAPI.updatePassword(data),
    onSuccess: () => {
      setPasswordStatus('success');
      resetPasswordForm();
      setTimeout(() => setPasswordStatus(null), 3000);
    },
    onError: () => {
      setPasswordStatus('error');
    },
  });

  const onProfileSubmit = async (data) => {
    setSaveStatus(null);
    try {
      await updateMutation.mutateAsync({
        name: data.name,
        phone: data.phone,
      });
    } catch (e) {
      setSaveStatus('error');
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordStatus(null);
    try {
      await passwordMutation.mutateAsync({
        current_password: data.current_password,
        password: data.new_password,
        password_confirmation: data.confirm_password,
      });
    } catch (e) {
      setPasswordStatus('error');
    }
  };

  const profileImage =
    resolveAssetUrl(user?.profile_image) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || 'Customer'
    )}&background=2563eb&color=fff`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-text">
          My Profile
        </h1>
        <p className="text-muted mt-1">
          Manage your account information and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="mb-4">
              <img
                src={profileImage}
                alt={user?.name}
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
            </div>
            <h3 className="font-bold text-text">{user?.name}</h3>
            <p className="text-sm text-muted">{user?.email}</p>
            <p className="text-xs text-muted mt-2">Member since</p>
            <p className="text-xs text-muted">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Personal Information
            </h2>

            {saveStatus === 'success' && (
              <div className="mb-4 p-3 bg-success/10 text-success rounded-lg text-sm flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Failed to update profile. Please try again.</span>
              </div>
            )}

            <form
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className={`input ${
                    profileErrors.name ? 'border-error' : ''
                  }`}
                  placeholder="John Doe"
                  {...registerProfile('name', {
                    required: 'Name is required',
                  })}
                />
                {profileErrors.name && (
                  <p className="text-error text-xs mt-1">
                    {profileErrors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className={`input ${
                    profileErrors.phone ? 'border-error' : ''
                  }`}
                  placeholder="+254 7XX XXX XXX"
                  {...registerProfile('phone', {
                    required: 'Phone number is required',
                  })}
                />
                {profileErrors.phone && (
                  <p className="text-error text-xs mt-1">
                    {profileErrors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Email Address (read-only)
                </label>
                <input
                  type="email"
                  className="input bg-surface-hover cursor-not-allowed"
                  readOnly
                  {...registerProfile('email')}
                />
                <p className="text-xs text-muted mt-1">
                  To change your email, please contact support.
                </p>
              </div>

              <button
                type="submit"
                disabled={profileSubmitting || updateMutation.isPending}
                className="btn btn-primary w-full"
              >
                {profileSubmitting || updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-text mb-4">
              Change Password
            </h2>

            {passwordStatus === 'success' && (
              <div className="mb-4 p-3 bg-success/10 text-success rounded-lg text-sm flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Password changed successfully!</span>
              </div>
            )}

            {passwordStatus === 'error' && (
              <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Failed to change password. Please check your current
                  password.
                </span>
              </div>
            )}

            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <PasswordField
                name="current_password"
                label="Current Password"
                placeholder="Enter current password"
                show={showPassword}
                setShow={setShowPassword}
                errors={passwordErrors}
                register={registerPassword('current_password', {
                  required: 'Current password is required',
                })}
              />

              <PasswordField
                name="new_password"
                label="New Password"
                placeholder="Enter new password"
                show={showNewPassword}
                setShow={setShowNewPassword}
                errors={passwordErrors}
                register={registerPassword('new_password', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
              />

              <PasswordField
                name="confirm_password"
                label="Confirm New Password"
                placeholder="Confirm new password"
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
                errors={passwordErrors}
                register={registerPassword('confirm_password', {
                  required: 'Please confirm your new password',
                  validate: (value) =>
                    value === newPasswordValue || 'Passwords do not match',
                })}
              />

              <button
                type="submit"
                disabled={passwordSubmitting || passwordMutation.isPending}
                className="btn btn-primary w-full"
              >
                {passwordSubmitting || passwordMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
