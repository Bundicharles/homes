import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Type,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { settingsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton } from '@/components/Modal';

const AdminFontSettings = () => {
  const { settings: currentSettings } = useSettings();
  const businessName = currentSettings.business_name || 'Prime Realty Kenya';
  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = `Font Settings | ${businessName} Admin`;
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

  const fontOptions = [
    { value: 'Inter', label: 'Inter', preview: 'Inter, Roboto, sans-serif' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' },
    { value: 'Nunito', label: 'Nunito' },
    { value: 'Oswald', label: 'Oswald' },
    { value: 'Raleway', label: 'Raleway' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Georgia', label: 'Georgia' },
  ];

  const fontFields = [
    {
      key: 'branding_heading_font',
      label: 'Heading Font',
      description: 'Font used for headings and titles across the site.',
    },
    {
      key: 'branding_body_font',
      label: 'Body Font',
      description: 'Font used for body text and paragraphs across the site.',
    },
  ];

  const findSetting = (key) => settingsData.find((s) => s.key === key) || { value: '', label: key };

  const applyFont = (fontName) => {
    const fontMap = {
      Inter: "'Inter', sans-serif",
      Roboto: "'Roboto', sans-serif",
      'Open Sans': "'Open Sans', sans-serif",
      Lato: "'Lato', sans-serif",
      Poppins: "'Poppins', sans-serif",
      Montserrat: "'Montserrat', sans-serif",
      'Playfair Display': "'Playfair Display', serif",
      Merriweather: "'Merriweather', serif",
      'Source Sans Pro': "'Source Sans Pro', sans-serif",
      Nunito: "'Nunito', sans-serif",
      Oswald: "'Oswald', sans-serif",
      Raleway: "'Raleway', sans-serif",
    };
    return fontMap[fontName] || 'sans-serif';
  };

  if (isLoading && !data) {
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
        <p className="text-error mb-4">Failed to load font settings.</p>
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
            Font Settings
          </h1>
          <p className="text-muted mt-1">
            Configure typography for your website.
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
        {fontFields.map((field) => {
          const setting = findSetting(field.key);
          const selectedValue = formData[field.key] || setting.value || '';

          return (
            <div key={field.key} className="mb-8 last:mb-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                    <Type className="w-4 h-4" />
                    {field.label}
                  </label>
                  <p className="text-xs text-muted">{field.description}</p>
                </div>
                <select
                  value={selectedValue}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="input w-auto min-w-[200px]"
                >
                  <option value="">Default (Inter)</option>
                  {fontOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="p-6 border border-border rounded-lg bg-surface-hover/30"
                style={{
                  fontFamily: selectedValue ? applyFont(selectedValue) : 'Inter, sans-serif',
                }}
              >
                <h3
                  className="text-2xl font-bold text-text mb-2"
                  style={{ fontFamily: selectedValue ? applyFont(selectedValue) : 'Inter, sans-serif' }}
                >
                  The Quick Brown Fox Jumps Over The Lazy Dog
                </h3>
                <p
                  style={{
                    fontFamily: selectedValue ? applyFont(selectedValue) : 'Inter, sans-serif',
                  }}
                  className="text-sm text-text"
                >
                  {selectedValue
                    ? `Current selection: ${selectedValue}`
                    : 'Default font will be applied (Inter)'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Google Fonts Integration</h2>
        <p className="text-sm text-muted mb-4">
          The selected fonts are loaded via Google Fonts. Ensure an internet connection for proper rendering.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted">
          <Eye className="w-4 h-4" />
          <span>Preview updates live as you select different fonts above.</span>
        </div>
      </div>
    </div>
  );
};

export default AdminFontSettings;
