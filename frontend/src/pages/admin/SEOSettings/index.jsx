import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Globe,
  Save,
  AlertCircle,
  ExternalLink,
  Eye,
  BarChart3,
} from 'lucide-react';
import { settingsAPI, seoAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState } from '@/components/Modal';

const AdminSEOSettings = () => {
  const { settings: currentSettings } = useSettings();
  const businessName = currentSettings.business_name || 'Hemaprin Homes';
  const queryClient = useQueryClient();

  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('global');

  useEffect(() => {
    document.title = `SEO Settings | ${businessName} Admin`;
  }, [businessName]);

  const {
    data: settingsData,
    isLoading: settingsLoading,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ['admin.settings', 'seo'],
    queryFn: () => settingsAPI.getByGroup('seo'),
  });

  const {
    data: seoData,
    isLoading: seoLoading,
    refetch: refetchSeo,
  } = useQuery({
    queryKey: ['seo.metadata', 'global'],
    queryFn: () => seoAPI.getByType('global'),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (settingsData) => settingsAPI.update(settingsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin.settings'] });
      queryClient.invalidateQueries({ queryKey: ['settings.public'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const updateSeoMutation = useMutation({
    mutationFn: ({ type, data }) => seoAPI.update(type, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo.metadata'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const settings = settingsData?.success ? (settingsData.data || []) : [];
  const globalSeo = seoData?.success ? (seoData.data || {}) : {};

  const [settingsForm, setSettingsForm] = useState({});
  const [seoForm, setSeoForm] = useState({});

  useEffect(() => {
    if (settings) {
      const initial = {};
      settings.forEach((item) => {
        initial[item.key] = item.value;
      });
      setSettingsForm(initial);
    }
  }, [settings]);

  useEffect(() => {
    if (globalSeo) {
      setSeoForm({
        meta_title: globalSeo.meta_title || '',
        meta_description: globalSeo.meta_description || '',
        meta_keywords: globalSeo.meta_keywords || '',
        canonical_url: globalSeo.canonical_url || '',
        og_title: globalSeo.og_title || '',
        og_description: globalSeo.og_description || '',
        og_image: globalSeo.og_image || '',
        og_type: globalSeo.og_type || 'website',
        twitter_card: globalSeo.twitter_card || 'summary_large_image',
        is_indexed: globalSeo.is_indexed ? true : false,
      });
    }
  }, [globalSeo]);

  const handleSettingChange = (key, value) => {
    setSettingsForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSeoChange = (key, value) => {
    setSeoForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    const payload = {};
    settings.forEach((item) => {
      payload[item.key] = settingsForm[item.key] ?? item.value;
    });
    updateSettingsMutation.mutate(payload);
  };

  const handleSaveSeo = () => {
    updateSeoMutation.mutate({ type: 'global', data: seoForm });
  };

  const findSetting = (key) => settings.find((s) => s.key === key) || { value: '', label: key };

  const seoPageTypes = [
    { value: 'home', label: 'Home Page' },
    { value: 'properties', label: 'Properties Page' },
    { value: 'about', label: 'About Page' },
    { value: 'contact', label: 'Contact Page' },
    { value: 'global', label: 'Global Default' },
  ];

  if (settingsLoading || seoLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/20 rounded w-1/4 animate-pulse" />
        <LoadingSkeleton count={4} type="card" />
      </div>
    );
  }

  if (settingsData?.error || seoData?.error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">Failed to load SEO settings.</p>
        <button onClick={() => refetchSettings()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">
            SEO Settings
          </h1>
          <p className="text-muted mt-1">
            Manage search engine optimization for your website.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-success font-medium">
              Saved successfully
            </span>
          )}
          <button
            onClick={handleSaveSeo}
            disabled={updateSeoMutation.isPending}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateSeoMutation.isPending ? 'Saving...' : 'Save SEO'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-surface-hover rounded-lg p-1 overflow-x-auto">
        <button
          onClick={() => setActiveSection('seo')}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${activeSection === 'seo'
              ? 'bg-primary text-white'
              : 'text-muted hover:text-text hover:bg-surface'}
          `}
        >
          <Search className="w-4 h-4" />
          SEO Metadata
        </button>
        <button
          onClick={() => setActiveSection('global')}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${activeSection === 'global'
              ? 'bg-primary text-white'
              : 'text-muted hover:text-text hover:bg-surface'}
          `}
        >
          <Globe className="w-4 h-4" />
          Global Settings
        </button>
        <button
          onClick={() => setActiveSection('indexing')}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${activeSection === 'indexing'
              ? 'bg-primary text-white'
              : 'text-muted hover:text-text hover:bg-surface'}
          `}
        >
          <BarChart3 className="w-4 h-4" />
          Indexing
        </button>
      </div>

      {activeSection === 'seo' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Global SEO Metadata</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={seoForm.meta_title || ''}
                  onChange={(e) => handleSeoChange('meta_title', e.target.value)}
                  className="input"
                  placeholder="Page title for search engines"
                />
                <p className="text-xs text-muted mt-1">
                  Recommended length: 50-60 characters
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  Meta Description
                </label>
                <textarea
                  value={seoForm.meta_description || ''}
                  onChange={(e) => handleSeoChange('meta_description', e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Page description for search engines"
                />
                <p className="text-xs text-muted mt-1">
                  Recommended length: 150-160 characters
                </p>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={seoForm.meta_keywords || ''}
                  onChange={(e) => handleSeoChange('meta_keywords', e.target.value)}
                  className="input"
                  placeholder="Comma-separated keywords"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={seoForm.canonical_url || ''}
                  onChange={(e) => handleSeoChange('canonical_url', e.target.value)}
                  className="input"
                  placeholder="https://example.com/page"
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Open Graph (Social Media)</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  OG Title
                </label>
                <input
                  type="text"
                  value={seoForm.og_title || ''}
                  onChange={(e) => handleSeoChange('og_title', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  OG Description
                </label>
                <textarea
                  value={seoForm.og_description || ''}
                  onChange={(e) => handleSeoChange('og_description', e.target.value)}
                  className="input"
                  rows={2}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  OG Image
                </label>
                <input
                  type="url"
                  value={seoForm.og_image || ''}
                  onChange={(e) => handleSeoChange('og_image', e.target.value)}
                  className="input"
                  placeholder="https://example.com/og-image.jpg"
                />
                {seoForm.og_image && (
                  <a
                    href={seoForm.og_image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                  >
                    Preview image
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  OG Type
                </label>
                <select
                  value={seoForm.og_type || 'website'}
                  onChange={(e) => handleSeoChange('og_type', e.target.value)}
                  className="input"
                >
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                  <option value="product">Product</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Twitter Card</h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  Twitter Card Type
                </label>
                <select
                  value={seoForm.twitter_card || 'summary_large_image'}
                  onChange={(e) => handleSeoChange('twitter_card', e.target.value)}
                  className="input"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveSeo}
              disabled={updateSeoMutation.isPending}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updateSeoMutation.isPending ? 'Saving...' : 'Save All SEO Settings'}
            </button>
          </div>
        </div>
      )}

      {activeSection === 'global' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-text mb-4">SEO Global Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  {findSetting('seo_site_title').label || 'Site Title'}
                </label>
                <input
                  type="text"
                  value={settingsForm['seo_site_title'] || findSetting('seo_site_title').value || ''}
                  onChange={(e) => handleSettingChange('seo_site_title', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  {findSetting('seo_meta_description').label || 'Meta Description'}
                </label>
                <textarea
                  value={settingsForm['seo_meta_description'] || findSetting('seo_meta_description').value || ''}
                  onChange={(e) => handleSettingChange('seo_meta_description', e.target.value)}
                  className="input"
                  rows={3}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  Default OG Image
                </label>
                <input
                  type="url"
                  value={settingsForm['seo_default_og_image'] || findSetting('seo_default_og_image').value || ''}
                  onChange={(e) => handleSettingChange('seo_default_og_image', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  SEO Favicon
                </label>
                <input
                  type="url"
                  value={settingsForm['seo_favicon'] || findSetting('seo_favicon').value || ''}
                  onChange={(e) => handleSettingChange('seo_favicon', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  Google Verification Code
                </label>
                <input
                  type="text"
                  value={settingsForm['seo_google_verification'] || findSetting('seo_google_verification').value || ''}
                  onChange={(e) => handleSettingChange('seo_google_verification', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text mb-1">
                  Bing Verification Code
                </label>
                <input
                  type="text"
                  value={settingsForm['seo_bing_verification'] || findSetting('seo_bing_verification').value || ''}
                  onChange={(e) => handleSettingChange('seo_bing_verification', e.target.value)}
                  className="input"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Page-Specific SEO</h2>
            <p className="text-sm text-muted mb-4">
              Configure SEO metadata for specific page types. Select a page type from the list below to configure its SEO settings.
            </p>
            <div className="flex flex-wrap gap-2">
              {seoPageTypes.map((pageType) => (
                <button
                  key={pageType.value}
                  onClick={() => setActiveSection(pageType.value)}
                  className="px-4 py-2 text-sm font-medium text-text bg-surface-hover rounded-lg hover:bg-surface transition-colors"
                >
                  {pageType.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {seoPageTypes.some((p) => p.value === activeSection) && activeSection !== 'global' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text mb-4">
            {seoPageTypes.find((p) => p.value === activeSection)?.label || activeSection}{' '}
            SEO
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-muted" />
            <span className="text-sm text-muted">
              Preview how this page will appear in search engines and social media.
            </span>
          </div>
        </div>
      )}

      {activeSection === 'indexing' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-text mb-4">Indexing Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <label className="text-sm font-medium text-text">
                  Allow search engine indexing
                </label>
                <p className="text-xs text-muted">
                  Enable to allow search engines to index your website pages.
                </p>
              </div>
              <input
                type="checkbox"
                checked={seoForm.is_indexed !== false}
                onChange={(e) => handleSeoChange('is_indexed', e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSaveSeo}
                disabled={updateSeoMutation.isPending}
                className="btn btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateSeoMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSEOSettings;
