import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  Bell,
  Database,
  AlertCircle,
} from 'lucide-react';
import { settingsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState } from '@/components/Modal';

const AdminSettings = () => {
  const { settings: currentSettings } = useSettings();
  const businessName = currentSettings.business_name || 'Prime Realty Kenya';
  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = `Settings | ${businessName} Admin`;
  }, [businessName]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin.settings'],
    queryFn: () => settingsAPI.getAdmin(),
  });

  const updateMutation = useMutation({
    mutationFn: (settingsData) => settingsAPI.update(settingsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings.public'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const settingsData = data?.success ? data.data : {};

  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (settingsData) {
      const initial = {};
      Object.values(settingsData).forEach((item) => {
        initial[item.key] = item.value;
      });
      setFormData(initial);
    }
  }, [settingsData]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const settingGroups = {
    general: {
      icon: Globe,
      title: 'General Settings',
      description: 'Core business and website information',
      keys: ['business_name', 'website_name', 'tagline', 'description', 'default_currency', 'country', 'timezone', 'language', 'admin_email', 'items_per_page'],
    },
    system: {
      icon: Shield,
      title: 'System Settings',
      description: 'Platform-wide system configuration',
      keys: ['maintenance_mode', 'customer_registration', 'property_inquiries', 'viewing_requests', 'whatsapp_enabled', 'floating_social', 'promotions_enabled', 'testimonials_enabled'],
    },
    contact: {
      icon: Phone,
      title: 'Contact Settings',
      description: 'Contact information and locations',
      keys: ['contact_phone', 'contact_whatsapp', 'contact_email', 'contact_secondary_email', 'contact_address', 'contact_county', 'contact_country', 'contact_opening_hours', 'contact_map_lat', 'contact_map_lng', 'contact_map_zoom'],
    },
    email: {
      icon: Mail,
      title: 'Email / SMTP Settings',
      description: 'Email server configuration',
      keys: ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_encryption', 'smtp_from_name', 'smtp_from_email'],
    },
  };

  const renderField = (item) => {
    const key = item.key;
    const value = formData[key] ?? '';
    const type = item.type;
    const label = item.label || key.replace(/_/g, ' ');
    const description = item.description;

    const commonInputClasses = "input";

    const renderInput = () => {
      switch (type) {
        case 'textarea':
          return (
            <textarea
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className={commonInputClasses}
              rows={3}
            />
          );
        case 'boolean':
          return (
            <select
              value={value ? '1' : '0'}
              onChange={(e) => handleChange(key, e.target.value === '1')}
              className={commonInputClasses}
            >
              <option value="1">Enabled</option>
              <option value="0">Disabled</option>
            </select>
          );
        case 'color':
          return (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-10 h-8 rounded border border-border cursor-pointer p-0"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className={commonInputClasses}
              />
            </div>
          );
        case 'select':
          if (key === 'default_currency') {
            return (
              <select
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className={commonInputClasses}
              >
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            );
          }
          if (key === 'language') {
            return (
              <select
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className={commonInputClasses}
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
                <option value="fr">French</option>
              </select>
            );
          }
          if (key === 'timezone') {
            return (
              <select
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className={commonInputClasses}
              >
                <option value="Africa/Nairobi">Africa/Nairobi</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            );
          }
          if (key === 'smtp_encryption') {
            return (
              <select
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                className={commonInputClasses}
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="">None</option>
              </select>
            );
          }
          return (
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className={commonInputClasses}
            />
          );
        case 'email':
          return (
            <input
              type="email"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className={commonInputClasses}
            />
          );
        case 'number':
          return (
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className={commonInputClasses}
            />
          );
        default:
          return (
            <input
              type={type === 'password' ? 'password' : 'text'}
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className={commonInputClasses}
            />
          );
      }
    };

    return (
      <div key={key} className="mb-4">
        <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
          {label}
        </label>
        {renderInput()}
        {description && (
          <p className="text-xs text-muted mt-1">{description}</p>
        )}
      </div>
    );
  };

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/20 rounded w-1/4 animate-pulse" />
        <LoadingSkeleton count={4} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">Failed to load settings.</p>
        <button onClick={() => refetch()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">
            Settings
          </h1>
          <p className="text-muted mt-1">
            Configure your platform settings and preferences.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-success font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Saved successfully
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {Object.entries(settingGroups).map(([groupKey, group]) => {
        const Icon = group.icon;
        const items = group.keys
          .map((k) => Object.values(settingsData).find((item) => item.key === k))
          .filter(Boolean);

        if (items.length === 0) return null;

        return (
          <div key={groupKey} className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text">{group.title}</h2>
                <p className="text-sm text-muted">{group.description}</p>
              </div>
            </div>

            <div>
              {items.map(renderField)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminSettings;
