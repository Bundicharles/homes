import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Save, AlertCircle, Lock, Clock, KeyRound } from 'lucide-react';
import { settingsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton } from '@/components/Modal';

const SecuritySettings = () => {
  const { settings: currentSettings, refreshSettings } = useSettings();
  const businessName = currentSettings.business_name || 'Hemaprin Homes';
  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = `Security Settings | ${businessName} Admin`;
  }, [businessName]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin.settings', 'security'],
    queryFn: () => settingsAPI.getByGroup('security'),
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (settingsData) => settingsAPI.update(settingsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings.public'] });
      refreshSettings?.();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const settingsData = data?.success ? (data.data || []) : [];

  const [formData, setFormData] = useState({
    session_timeout_minutes: 60,
    max_login_attempts: 5,
    lockout_duration_minutes: 15,
    require_strong_passwords: true,
    enable_two_factor: false,
    password_min_length: 8,
    force_password_reset_days: 0,
  });

  useEffect(() => {
    if (settingsData.length) {
      const initial = { ...formData };
      settingsData.forEach((item) => {
        if (item.key in initial) {
          initial[item.key] = typeof initial[item.key] === 'boolean'
            ? item.value === 'true' || item.value === true
            : item.value;
        }
      });
      setFormData(initial);
    }
  }, [settingsData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {};
    Object.entries(formData).forEach(([key, value]) => {
      payload[key] = String(value);
    });
    updateMutation.mutate(payload);
  };

  if (isLoading) return <LoadingSkeleton count={4} type="card" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Security Settings
          </h1>
          <p className="text-muted mt-1">Configure authentication, sessions, and password policies.</p>
        </div>
      </div>

      {saved && (
        <div className="bg-success/10 text-success px-4 py-2 rounded-lg text-sm">Settings saved.</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-text flex items-center gap-2">
            <Clock className="w-4 h-4" /> Sessions
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1">Session timeout (minutes)</label>
            <input
              type="number"
              min="5"
              max="1440"
              value={formData.session_timeout_minutes}
              onChange={(e) => setFormData({ ...formData, session_timeout_minutes: Number(e.target.value) })}
              className="input"
            />
            <p className="text-xs text-muted mt-1">Users will be logged out after this period of inactivity.</p>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-text flex items-center gap-2">
            <Lock className="w-4 h-4" /> Login Protection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Max login attempts</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.max_login_attempts}
                onChange={(e) => setFormData({ ...formData, max_login_attempts: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Lockout duration (minutes)</label>
              <input
                type="number"
                min="1"
                max="1440"
                value={formData.lockout_duration_minutes}
                onChange={(e) => setFormData({ ...formData, lockout_duration_minutes: Number(e.target.value) })}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-text flex items-center gap-2">
            <KeyRound className="w-4 h-4" /> Password Policy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Minimum length</label>
              <input
                type="number"
                min="6"
                max="32"
                value={formData.password_min_length}
                onChange={(e) => setFormData({ ...formData, password_min_length: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Force password reset (days, 0 = never)</label>
              <input
                type="number"
                min="0"
                max="365"
                value={formData.force_password_reset_days}
                onChange={(e) => setFormData({ ...formData, force_password_reset_days: Number(e.target.value) })}
                className="input"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.require_strong_passwords}
              onChange={(e) => setFormData({ ...formData, require_strong_passwords: e.target.checked })}
              className="rounded"
            />
            Require strong passwords (uppercase, lowercase, number, special character)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.enable_two_factor}
              onChange={(e) => setFormData({ ...formData, enable_two_factor: e.target.checked })}
              className="rounded"
            />
            Enable two-factor authentication (2FA)
          </label>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={updateMutation.isPending} className="btn btn-primary inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettings;
