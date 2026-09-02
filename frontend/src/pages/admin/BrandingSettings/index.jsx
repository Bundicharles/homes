import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Palette,
  Save,
  Upload,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { settingsAPI, mediaAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState } from '@/components/Modal';

const AdminBrandingSettings = () => {
  const { settings: currentSettings } = useSettings();
  const businessName = currentSettings.business_name || 'Prime Realty Kenya';
  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.title = `Branding Settings | ${businessName} Admin`;
  }, [businessName]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin.settings', 'branding'],
    queryFn: () => settingsAPI.getByGroup('branding'),
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

  const settingsData = data?.success ? (data.data || []) : [];

  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (settingsData) {
      const initial = {};
      settingsData.forEach((item) => {
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

  const handleImageUpload = async (key, file) => {
    if (!file) return;

    setUploading(true);
    try {
      const result = await mediaAPI.upload(file, 'branding', {});
      if (result.success) {
        const basePath = result.data?.file_path || `uploads/branding/${result.data?.filename}`;
        handleChange(key, '/' + basePath);
      }
    } catch {
      // upload error
    } finally {
      setUploading(false);
    }
  };

  const brandingFields = [
    { key: 'branding_logo', label: 'Main Logo', type: 'image' },
    { key: 'branding_mobile_logo', label: 'Mobile Logo', type: 'image' },
    { key: 'branding_light_logo', label: 'Light Logo (for dark backgrounds)', type: 'image' },
    { key: 'branding_dark_logo', label: 'Dark Logo (for light backgrounds)', type: 'image' },
    { key: 'branding_favicon', label: 'Favicon', type: 'image' },
    { key: 'branding_primary_color', label: 'Primary Color', type: 'color' },
    { key: 'branding_secondary_color', label: 'Secondary Color', type: 'color' },
    { key: 'branding_accent_color', label: 'Accent Color', type: 'color' },
    { key: 'branding_background', label: 'Background Color', type: 'color' },
    { key: 'branding_surface', label: 'Surface Color', type: 'color' },
    { key: 'branding_text_color', label: 'Text Color', type: 'color' },
    { key: 'branding_muted_text', label: 'Muted Text Color', type: 'color' },
    { key: 'branding_heading_font', label: 'Heading Font', type: 'select' },
    { key: 'branding_body_font', label: 'Body Font', type: 'select' },
  ];

  const fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat',
    'Playfair Display', 'Merriweather', 'Source Sans Pro', 'Nunito', 'Oswald', 'Raleway',
  ];

  const findSetting = (key) => settingsData.find((s) => s.key === key) || { value: '' };

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
        <p className="text-error mb-4">Failed to load branding settings.</p>
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
            Branding Settings
          </h1>
          <p className="text-muted mt-1">
            Manage your brand colors, logos, and typography.
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
        <h2 className="text-lg font-semibold text-text mb-6">Brand Colors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brandingFields.filter((f) => f.type === 'color').map((field) => {
            const setting = findSetting(field.key);
            return (
              <div key={field.key}>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  {field.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData[field.key] || setting.value || '#000000'}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-10 h-8 rounded border border-border cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={formData[field.key] || setting.value || ''}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-text mb-6">Logos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {brandingFields.filter((f) => f.type === 'image').map((field) => {
            const setting = findSetting(field.key);
            const currentValue = formData[field.key] || setting.value;
            return (
              <div key={field.key} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-text">
                  {field.label}
                </label>
                {currentValue ? (
                  <div className="relative w-full h-24 border-2 border-border border-dashed rounded-lg overflow-hidden bg-surface-hover/50">
                    <img
                      src={currentValue}
                      alt={field.label}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <label className="cursor-pointer bg-surface rounded-lg p-1 shadow-sm hover:bg-surface-hover">
                        <Upload className="w-4 h-4 text-text" />
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => handleImageUpload(field.key, e.target.files[0])}
                          disabled={uploading}
                        />
                      </label>
                      <button
                        onClick={() => handleChange(field.key, '')}
                        className="bg-error/10 text-error rounded-lg p-1 hover:bg-error/20"
                        disabled={uploading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-24 border-2 border-border border-dashed rounded-lg cursor-pointer hover:bg-surface-hover">
                    <Upload className="w-6 h-6 text-muted mb-2" />
                    <span className="text-xs text-muted">Upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleImageUpload(field.key, e.target.files[0])}
                      disabled={uploading}
                    />
                  </label>
                )}
                {currentValue && (
                  <input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="input"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-text mb-6">Typography</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {brandingFields.filter((f) => f.type === 'select').map((field) => {
            const setting = findSetting(field.key);
            return (
              <div key={field.key}>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  {field.label}
                </label>
                <select
                  value={formData[field.key] || setting.value || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="input"
                >
                  {fontOptions.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {uploading && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center">
          <div className="bg-surface rounded-xl p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span className="text-text">Uploading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrandingSettings;
