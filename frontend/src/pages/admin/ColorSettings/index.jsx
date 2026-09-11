import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Palette,
  Save,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { settingsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton } from '@/components/Modal';

const AdminColorSettings = () => {
  const { settings: currentSettings, refreshSettings } = useSettings();
  const businessName = currentSettings.business_name || 'Hemaprin Homes';
  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(false);
  const [copiedColor, setCopiedColor] = useState('');

  useEffect(() => {
    document.title = `Color Settings | ${businessName} Admin`;
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
      refreshSettings?.();
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

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(''), 1500);
  };

  const colorFields = [
    {
      key: 'branding_primary_color',
      label: 'Primary Color',
      description: 'Used for primary buttons, links, and accents.',
    },
    {
      key: 'branding_secondary_color',
      label: 'Secondary Color',
      description: 'Used for secondary actions and highlights.',
    },
    {
      key: 'branding_accent_color',
      label: 'Accent Color',
      description: 'Used for special highlights and notifications.',
    },
    {
      key: 'branding_background',
      label: 'Background Color',
      description: 'Main page background color.',
    },
    {
      key: 'branding_surface',
      label: 'Surface Color',
      description: 'Card and surface background color.',
    },
    {
      key: 'branding_text_color',
      label: 'Text Color',
      description: 'Primary text color for the site.',
    },
    {
      key: 'branding_muted_text',
      label: 'Muted Text Color',
      description: 'Secondary/muted text color.',
    },
  ];

  const findSetting = (key) => settingsData.find((s) => s.key === key) || { value: '' };

  const colorPresets = [
    ['#2563eb', '#7c3aed', '#ea580c'],
    ['#0ea5e1', '#8e44fd', '#f97316'],
    ['#05966d', '#6d2848', '#d97706'],
    ['#7c2d12', '#dc2626', '#f59e0b'],
    ['#1e3a8a', '#4c1d95', '#92400e'],
  ];

  const applyPreset = (preset) => {
    const keys = [
      'branding_primary_color',
      'branding_secondary_color',
      'branding_accent_color',
    ];
    keys.forEach((key, idx) => {
      handleChange(key, preset[idx]);
    });
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
        <p className="text-error mb-4">Failed to load color settings.</p>
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
            Color Settings
          </h1>
          <p className="text-muted mt-1">
            Customize the color palette for your website.
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
        <h2 className="text-lg font-semibold text-text mb-4">Color Presets</h2>
        <p className="text-sm text-muted mb-4">
          Apply a pre-designed color palette to your site.
        </p>
        <div className="flex flex-wrap gap-3">
          {colorPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(preset)}
              className="flex items-center gap-1 p-2 border border-border rounded-lg hover:bg-surface-hover transition-colors"
              title={`Apply preset ${idx + 1}`}
            >
              {preset.map((color, cIdx) => (
                <div
                  key={cIdx}
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: color }}
                />
              ))}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {colorFields.map((field) => {
          const setting = findSetting(field.key);
          const currentValue = formData[field.key] || setting.value || '#000000';
          return (
            <div key={field.key} className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text">{field.label}</label>
                <div className="flex items-center gap-2">
                  {copiedColor === currentValue ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <button
                      onClick={() => copyToClipboard(currentValue)}
                      className="p-1 text-muted hover:text-text rounded hover:bg-surface-hover"
                      title="Copy hex code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted mb-3">{field.description}</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border border-border overflow-hidden"
                  style={{ backgroundColor: currentValue }}
                />
                <input
                  type="color"
                  value={currentValue}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-10 h-8 rounded border border-border cursor-pointer p-0 flex-shrink-0"
                />
                <input
                  type="text"
                  value={currentValue}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="input flex-1 font-mono text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Live Preview</h2>
        <div className="border border-border rounded-lg p-6" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-center gap-4 mb-4">
            <button
              className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
              style={{
                backgroundColor: formData['branding_primary_color'] || '#2563eb',
              }}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium text-white transition-colors"
              style={{
                backgroundColor: formData['branding_secondary_color'] || '#7c3aed',
              }}
            >
              Secondary Button
            </button>
          </div>
          <p
            className="text-lg"
            style={{
              color: formData['branding_text_color'] || '#1e293b',
            }}
          >
            Sample text with current text color settings.
          </p>
          <p
            className="text-sm mt-1"
            style={{
              color: formData['branding_muted_text'] || '#64748b',
            }}
          >
            Muted text example for secondary information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminColorSettings;
