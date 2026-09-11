import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { settingsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton } from '@/components/Modal';

const AdminContactSettings = () => {
  const { settings: currentSettings, refreshSettings } = useSettings();
  const businessName = currentSettings.business_name || 'Hemaprin Homes';
  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = `Contact Settings | ${businessName} Admin`;
  }, [businessName]);

  const {
    data: contactData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin.settings', 'contact'],
    queryFn: () => settingsAPI.getByGroup('contact'),
  });

  const {
    data: socialData,
  } = useQuery({
    queryKey: ['admin.social-links'],
    queryFn: () => settingsAPI.getSocialLinks(),
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

  const deleteSocialMutation = useMutation({
    mutationFn: (id) => settingsAPI.deleteSocialLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.social-links'] });
    },
  });

  const contactSettings = useMemo(() => {
    if (!contactData?.success) return [];
    return Array.isArray(contactData.data) ? contactData.data : [];
  }, [contactData]);

  const socialLinks = useMemo(() => {
    if (!socialData?.success) return [];
    return Array.isArray(socialData.data) ? socialData.data : [];
  }, [socialData]);

  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (contactSettings && contactSettings.length > 0) {
      const initial = {};
      contactSettings.forEach((item) => {
        initial[item.key] = item.value;
      });
      setFormData((prev) => ({ ...prev, ...initial }));
    }
  }, [contactSettings]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const payload = {};
    contactSettings.forEach((item) => {
      payload[item.key] = formData[item.key] ?? item.value;
    });
    updateMutation.mutate(payload);
  };

  const handleDeleteSocial = (id) => {
    if (window.confirm('Are you sure you want to delete this social link?')) {
      deleteSocialMutation.mutate(id);
    }
  };

  const findSetting = (key) => contactSettings.find((s) => s.key === key) || { value: '', label: key };

  const contactFields = [
    { key: 'contact_phone', label: 'Phone Number', icon: Phone, type: 'tel' },
    { key: 'contact_whatsapp', label: 'WhatsApp Number', icon: Phone, type: 'tel' },
    { key: 'contact_email', label: 'Email Address', icon: Mail, type: 'email' },
    { key: 'contact_secondary_email', label: 'Secondary Email', icon: Mail, type: 'email' },
    { key: 'contact_address', label: 'Physical Address', icon: MapPin, type: 'textarea' },
    { key: 'contact_county', label: 'County', icon: MapPin, type: 'text' },
    { key: 'contact_country', label: 'Country', icon: Globe, type: 'text' },
    { key: 'contact_opening_hours', label: 'Opening Hours', icon: Clock, type: 'textarea' },
    { key: 'contact_map_lat', label: 'Map Latitude', icon: MapPin, type: 'text' },
    { key: 'contact_map_lng', label: 'Map Longitude', icon: MapPin, type: 'text' },
    { key: 'contact_map_zoom', label: 'Map Zoom Level', icon: MapPin, type: 'number' },
  ];

  if (isLoading && !contactData) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/20 rounded w-1/4 animate-pulse" />
        <LoadingSkeleton count={3} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">Failed to load contact settings.</p>
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
            Contact Settings
          </h1>
          <p className="text-muted mt-1">
            Manage contact information, address, and social media links.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-success font-medium">
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

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-text mb-6">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contactFields.map((field) => {
            const Icon = field.icon;
            const setting = findSetting(field.key);
            const value = formData[field.key] ?? setting.value ?? '';
            return (
              <div key={field.key}>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  <Icon className="w-4 h-4 text-muted" />
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="input"
                    rows={field.key.includes('opening_hours') ? 4 : 3}
                  />
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="input"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="input"
                  />
                )}
                {setting.description && (
                  <p className="text-xs text-muted mt-1">{setting.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">Social Media Links</h2>
          <Link to="/admin/social" className="btn btn-ghost btn-sm text-primary flex items-center">
            <Plus className="w-4 h-4 mr-1" />
            Manage Social Links
          </Link>
        </div>
        {socialLinks.length === 0 ? (
          <div className="text-center py-8 text-muted">
            No social links configured.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">
                    Platform
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">
                    URL
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase">
                    Icon
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {socialLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-text">{link.platform}</span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {link.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted">{link.icon || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to="/admin/social"
                          className="btn btn-ghost btn-sm text-text hover:bg-surface-hover"
                          aria-label={`Edit ${link.platform}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteSocial(link.id)}
                          className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                          aria-label={`Delete ${link.platform}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Map Preview</h2>
        <div className="border border-border rounded-lg h-64 bg-surface-hover/30 flex items-center justify-center">
          <div className="text-center text-muted">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p>
              Map location: {formData['contact_map_lat'] || '-1.2864'},{' '}
              {formData['contact_map_lng'] || '36.8172'}
            </p>
            <p className="text-xs mt-1">
              Zoom: {formData['contact_map_zoom'] || '12'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContactSettings;
