import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building,
  MapPin,
  FileText,
  DollarSign,
  CheckCircle,
  Image as ImageIcon,
  User,
  Globe,
  Save,
  ArrowLeft,
  Upload,
  Trash2,
  Star,
  Plus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { adminPropertiesAPI, propertyTypesAPI, featuresAPI, agentsAPI, mediaAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { generateSlug } from '@/utils';

const COUNTIES = [
  'Nairobi', 'Kiambu', 'Mombasa', 'Nakuru', 'Machakos', 'Kajiado', 'Kisumu', 'Kilifi',
  'Uasin Gishu', 'Nyeri', 'Laikipia', 'Murang\'a', 'Eldoret', 'Meru', 'Kakamega', 'Other'
];

const CURRENCIES = ['KES', 'USD', 'EUR', 'GBP'];

const AddProperty = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Prime Realty Kenya';

  const [activeTab, setActiveTab] = useState('basic');
  const [formError, setFormError] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    property_type_id: '',
    price: '',
    currency: 'KES',
    description: '',
    location: '',
    county: 'Nairobi',
    town: '',
    area: '',
    estate: '',
    address: '',
    latitude: '',
    longitude: '',
    bedrooms: 3,
    bathrooms: 2,
    parking_spaces: 1,
    house_size: '',
    land_size: '',
    floors: 1,
    year_built: new Date().getFullYear(),
    furnishing_status: 'Unfurnished',
    status: 'Available',
    verification_status: 'Pending',
    featured: false,
    features: [],
    agent_id: '',
    seo_title: '',
    seo_description: '',
    canonical_url: '',
    images: [],
  });

  useEffect(() => {
    document.title = `Add Property | ${businessName} Admin`;
  }, [businessName]);

  // Fetch Types, Features, Agents
  const { data: typesData } = useQuery({
    queryKey: ['property-types'],
    queryFn: () => propertyTypesAPI.getAll(),
  });

  const { data: featuresData } = useQuery({
    queryKey: ['features'],
    queryFn: () => featuresAPI.getAll(),
  });

  const { data: agentsData } = useQuery({
    queryKey: ['admin.agents'],
    queryFn: () => agentsAPI.getAll(),
  });

  const propertyTypes = typesData?.success ? typesData.data : [];
  const allFeatures = featuresData?.success ? featuresData.data : [];
  const agents = agentsData?.success ? (agentsData.data.data || agentsData.data) : [];

  // Set default property type
  useEffect(() => {
    if (propertyTypes.length > 0 && !formData.property_type_id) {
      setFormData((prev) => ({ ...prev, property_type_id: propertyTypes[0].id }));
    }
  }, [propertyTypes]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      if (name === 'name' && !slugManual) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  // Toggle Feature
  const handleFeatureToggle = (featureId) => {
    setFormData((prev) => {
      const exists = prev.features.includes(featureId);
      const newFeatures = exists
        ? prev.features.filter((id) => id !== featureId)
        : [...prev.features, featureId];
      return { ...prev, features: newFeatures };
    });
  };

  // Image Upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingImage(true);
    try {
      for (const file of files) {
        const response = await mediaAPI.upload(file, 'properties', {
          title: formData.name || file.name,
          alt_text: formData.name || file.name,
        });

        if (response?.success && response?.data) {
          const newImg = {
            filename: response.data.filename,
            file_path: response.data.file_path,
            url: response.data.url,
            is_primary: formData.images.length === 0,
            alt_text: formData.name || '',
            caption: '',
            sort_order: formData.images.length,
          };
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, newImg],
          }));
        }
      }
    } catch (err) {
      console.error('Image upload failed', err);
      setFormError('Failed to upload one or more images');
    } finally {
      setUploadingImage(false);
    }
  };

  // Set Primary Image
  const setPrimaryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        is_primary: i === index,
      })),
    }));
  };

  // Remove Image
  const removeImage = (index) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
        updated[0].is_primary = true;
      }
      return { ...prev, images: updated };
    });
  };

  // Submit Mutation
  const createMutation = useMutation({
    mutationFn: (payload) => adminPropertiesAPI.create(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin.properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin.dashboard'] });
      navigate('/admin/properties');
    },
    onError: (err) => {
      setFormError(err.message || 'Failed to create property listing');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Property title/name is required');
      setActiveTab('basic');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError('Please enter a valid property price');
      setActiveTab('basic');
      return;
    }
    if (!formData.location.trim()) {
      setFormError('Location is required');
      setActiveTab('location');
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms) || 0,
      bathrooms: Number(formData.bathrooms) || 0,
      parking_spaces: Number(formData.parking_spaces) || 0,
      house_size: formData.house_size ? Number(formData.house_size) : null,
      land_size: formData.land_size ? Number(formData.land_size) : null,
      floors: Number(formData.floors) || 1,
      year_built: formData.year_built ? Number(formData.year_built) : null,
      property_type_id: Number(formData.property_type_id),
      featured: formData.featured ? 1 : 0,
      agents: formData.agent_id ? [{ agent_id: Number(formData.agent_id), is_primary: 1 }] : [],
    };

    createMutation.mutate(payload);
  };

  // Group Features by Category
  const featuresByCategory = allFeatures.reduce((acc, feat) => {
    const cat = feat.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(feat);
    return acc;
  }, {});

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'specs', label: 'Specifications', icon: FileText },
    { id: 'features', label: 'Features & Amenities', icon: CheckCircle },
    { id: 'media', label: 'Images & Media', icon: ImageIcon },
    { id: 'seo', label: 'SEO & Agent', icon: Globe },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/properties"
            className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-muted hover:text-text transition-smooth border border-border"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text">Add New Property</h1>
            <p className="text-sm text-muted">Create and publish a new property listing</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/properties" className="btn btn-outline">
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="btn btn-primary flex items-center gap-2"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{createMutation.isPending ? 'Saving...' : 'Save Property'}</span>
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{formError}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-smooth whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-text hover:bg-surface-hover'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: BASIC INFO */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface p-6 rounded-2xl border border-border">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">
                Property Title / Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Luxurious 4-Bedroom Villa in Karen"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                URL Slug <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={(e) => {
                  setSlugManual(true);
                  handleChange(e);
                }}
                placeholder="luxurious-4-bedroom-villa-karen"
                className="input"
                required
              />
              <p className="text-xs text-muted mt-1">Unique identifier used in the property URL</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Property Type <span className="text-error">*</span>
              </label>
              <select
                name="property_type_id"
                value={formData.property_type_id}
                onChange={handleChange}
                className="input"
                required
              >
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Price <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="25000000"
                  className="input pl-16"
                  required
                  min="0"
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-transparent text-sm font-semibold text-text focus:outline-none border-r border-border pr-2"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr} value={curr}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Listing Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                <option value="Draft">Draft</option>
                <option value="Available">Available (Published)</option>
                <option value="Reserved">Reserved</option>
                <option value="Under Offer">Under Offer</option>
                <option value="Sold">Sold</option>
                <option value="Coming Soon">Coming Soon</option>
                <option value="Hidden">Hidden</option>
              </select>
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="checkbox"
                />
                <span className="text-sm font-medium text-text">Mark as Featured Property</span>
              </label>

              <div>
                <label className="text-sm font-medium text-text mr-3">Verification Status:</label>
                <select
                  name="verification_status"
                  value={formData.verification_status}
                  onChange={handleChange}
                  className="input inline-block w-auto py-1 px-3"
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Verified">Verified Listing</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">Description</label>
              <textarea
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed overview of the property, highlights, neighborhood details..."
                className="input"
              />
            </div>
          </div>
        )}

        {/* TAB 2: LOCATION */}
        {activeTab === 'location' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Location / Neighborhood <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Karen, Miotoni Road"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">County</label>
              <select
                name="county"
                value={formData.county}
                onChange={handleChange}
                className="input"
              >
                {COUNTIES.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Town / City</label>
              <input
                type="text"
                name="town"
                value={formData.town}
                onChange={handleChange}
                placeholder="e.g. Nairobi"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Area / Suburb</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="e.g. Karen South"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Estate / Community</label>
              <input
                type="text"
                name="estate"
                value={formData.estate}
                onChange={handleChange}
                placeholder="e.g. Miotoni Ridge"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Full Physical Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. House No. 14, Miotoni Close"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Latitude</label>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="-1.3197"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Longitude</label>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="36.7065"
                className="input"
              />
            </div>
          </div>
        )}

        {/* TAB 3: SPECIFICATIONS */}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface p-6 rounded-2xl border border-border">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="input"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="input"
                min="0"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Parking Spaces</label>
              <input
                type="number"
                name="parking_spaces"
                value={formData.parking_spaces}
                onChange={handleChange}
                className="input"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">House Size (m²)</label>
              <input
                type="number"
                name="house_size"
                value={formData.house_size}
                onChange={handleChange}
                placeholder="450"
                className="input"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Land Size (m² / Acres)</label>
              <input
                type="number"
                name="land_size"
                value={formData.land_size}
                onChange={handleChange}
                placeholder="2023 (0.5 acre)"
                className="input"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Floors / Storeys</label>
              <input
                type="number"
                name="floors"
                value={formData.floors}
                onChange={handleChange}
                className="input"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Year Built</label>
              <input
                type="number"
                name="year_built"
                value={formData.year_built}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Furnishing Status</label>
              <select
                name="furnishing_status"
                value={formData.furnishing_status}
                onChange={handleChange}
                className="input"
              >
                <option value="Unfurnished">Unfurnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Fully Furnished">Fully Furnished</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 4: FEATURES & AMENITIES */}
        {activeTab === 'features' && (
          <div className="bg-surface p-6 rounded-2xl border border-border space-y-6">
            <div>
              <h3 className="text-base font-semibold text-text">Select Features & Amenities</h3>
              <p className="text-sm text-muted">Check all features that apply to this property</p>
            </div>

            {Object.keys(featuresByCategory).length === 0 ? (
              <p className="text-sm text-muted">No features registered in system.</p>
            ) : (
              Object.entries(featuresByCategory).map(([category, features]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted border-b border-border pb-1">
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {features.map((feat) => {
                      const isChecked = formData.features.includes(feat.id);
                      return (
                        <label
                          key={feat.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-smooth cursor-pointer ${
                            isChecked
                              ? 'bg-primary/10 border-primary text-primary font-medium'
                              : 'bg-background border-border text-text hover:bg-surface-hover'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleFeatureToggle(feat.id)}
                            className="checkbox"
                          />
                          <span className="text-sm">{feat.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: IMAGES & MEDIA */}
        {activeTab === 'media' && (
          <div className="bg-surface p-6 rounded-2xl border border-border space-y-6">
            <div>
              <h3 className="text-base font-semibold text-text">Property Image Gallery</h3>
              <p className="text-sm text-muted">Upload high quality photos. Star an image to set it as the primary cover photo.</p>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-8 text-center transition-smooth">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                id="prop-image-upload"
                className="hidden"
                disabled={uploadingImage}
              />
              <label
                htmlFor="prop-image-upload"
                className="flex flex-col items-center justify-center cursor-pointer gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <span className="text-sm font-semibold text-text">
                  {uploadingImage ? 'Uploading Photos...' : 'Click to Upload Photos'}
                </span>
                <span className="text-xs text-muted">PNG, JPG, WEBP up to 10MB each</span>
              </label>
            </div>

            {/* Gallery Previews */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4">
                {formData.images.map((img, index) => (
                  <div
                    key={index}
                    className="relative group rounded-xl overflow-hidden border border-border aspect-[4/3] bg-background"
                  >
                    <img
                      src={img.url || `${import.meta.env.VITE_UPLOAD_BASE || '/'}uploads/properties/${img.filename}`}
                      alt={img.alt_text || 'Property image'}
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge */}
                    {img.is_primary && (
                      <span className="absolute top-2 left-2 px-2 py-1 rounded bg-primary text-white text-xs font-semibold shadow">
                        Primary Cover
                      </span>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        title="Set as Primary"
                        className={`p-2 rounded-lg ${
                          img.is_primary ? 'bg-primary text-white' : 'bg-white/80 hover:bg-white text-text'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        title="Remove Photo"
                        className="p-2 rounded-lg bg-error text-white hover:bg-error/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SEO & AGENT */}
        {activeTab === 'seo' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface p-6 rounded-2xl border border-border">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">Assign Listing Agent</label>
              <select
                name="agent_id"
                value={formData.agent_id}
                onChange={handleChange}
                className="input"
              >
                <option value="">-- No Agent Assigned --</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} {agent.phone ? `(${agent.phone})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-base font-semibold text-text mb-2">Search Engine Optimization (SEO)</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">SEO Meta Title</label>
              <input
                type="text"
                name="seo_title"
                value={formData.seo_title}
                onChange={handleChange}
                placeholder="4 Bedroom Villa for Sale in Karen | Prime Realty Kenya"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">Canonical URL</label>
              <input
                type="text"
                name="canonical_url"
                value={formData.canonical_url}
                onChange={handleChange}
                placeholder="https://primerealty.co.ke/properties/villa-karen"
                className="input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text mb-1">Meta Description</label>
              <textarea
                name="seo_description"
                rows={3}
                value={formData.seo_description}
                onChange={handleChange}
                placeholder="Discover this exquisite 4 bedroom villa in Karen featuring mature gardens, swimming pool, and 24/7 security."
                className="input"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => {
              const idx = tabs.findIndex((t) => t.id === activeTab);
              if (idx > 0) setActiveTab(tabs[idx - 1].id);
            }}
            disabled={activeTab === tabs[0].id}
            className="btn btn-outline disabled:opacity-40"
          >
            Previous Section
          </button>

          <div className="flex items-center gap-3">
            {activeTab !== tabs[tabs.length - 1].id ? (
              <button
                type="button"
                onClick={() => {
                  const idx = tabs.findIndex((t) => t.id === activeTab);
                  if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
                }}
                className="btn btn-primary"
              >
                Next Section
              </button>
            ) : (
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="btn btn-primary flex items-center gap-2"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{createMutation.isPending ? 'Publishing...' : 'Save & Publish Property'}</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
