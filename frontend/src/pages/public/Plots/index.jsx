import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Phone,
  FileCheck,
  Compass,
  Layers,
  Sparkles,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { propertiesAPI } from '@/services/api';
import PropertyCard from '@/components/PropertyCard';
import { useSettings } from '@/context/SettingsContext';
import { formatPrice } from '@/utils';

const COUNTIES = ['All Counties', 'Kajiado', 'Kiambu', 'Nairobi', 'Machakos', 'Nakuru', 'Mombasa'];
const SIZE_OPTIONS = [
  { label: 'All Sizes', value: 'all' },
  { label: '1/8 Acre (50x100 ft)', value: 'eighth' },
  { label: '1/4 Acre (100x100 ft)', value: 'quarter' },
  { label: '1/2 Acre & Above', value: 'half_plus' },
  { label: '1 Acre & Above', value: 'acre_plus' },
];

const Plots = () => {
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const [search, setSearch] = useState('');
  const [selectedCounty, setSelectedCounty] = useState('All Counties');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    document.title = `Plots & Land for Sale in Kenya | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Discover verified plots and land for sale across Kenya. Gated estates, ready title deeds, residential and commercial parcels in Kitengela, Ruiru, Juja, Karen, and more.'
      );
    }
  }, [businessName]);

  // Fetch plots from backend API
  const { data: plotsData, isLoading } = useQuery({
    queryKey: ['properties.plots', selectedCounty, selectedSort],
    queryFn: () =>
      propertiesAPI.getAll({
        type: 'plot,land',
        county: selectedCounty === 'All Counties' ? undefined : selectedCounty,
        sort: selectedSort,
        limit: 30,
      }),
  });

  const rawPlots = plotsData?.data?.data || plotsData?.data || [];
  const plots = Array.isArray(rawPlots) ? rawPlots : [];

  // Client-side filtering for size, search text & price
  const filteredPlots = useMemo(() => {
    return plots.filter((plot) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = plot.name?.toLowerCase().includes(query);
        const matchesLoc = plot.location?.toLowerCase().includes(query);
        const matchesDesc = plot.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesLoc && !matchesDesc) return false;
      }

      // Max price
      if (maxPrice && Number(maxPrice) > 0) {
        if (Number(plot.price) > Number(maxPrice)) return false;
      }

      // Size
      const landSqm = Number(plot.land_size) || 0;
      if (selectedSize === 'eighth') {
        if (landSqm > 600 || landSqm <= 0) return false;
      } else if (selectedSize === 'quarter') {
        if (landSqm < 800 || landSqm > 1500) return false;
      } else if (selectedSize === 'half_plus') {
        if (landSqm < 1800) return false;
      } else if (selectedSize === 'acre_plus') {
        if (landSqm < 4000) return false;
      }

      return true;
    });
  }, [plots, search, maxPrice, selectedSize]);

  const whatsappPhone = settings.contact_whatsapp || settings.contact_phone || '+254700000001';

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-primary/90 text-white py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold mb-4 text-emerald-300">
              <Sparkles size={14} />
              <span>Verified Title Deeds & Gated Communities</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              Prime Plots & Land for Sale in Kenya
            </h1>
            <p className="text-base sm:text-lg text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Explore hand-picked residential, commercial, and agricultural land parcels with clean
              title deeds, water, electricity, and verified beacon beacons.
            </p>

            {/* Quick Filter Bar inside Hero */}
            <div className="bg-surface text-text rounded-2xl p-4 sm:p-5 shadow-2xl border border-border text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Search Keywords</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-muted" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Kitengela, Ruiru, 50x100..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">County / Region</label>
                  <select
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {COUNTIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Plot Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {SIZE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Sort By</label>
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="featured">Featured First</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-surface border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center justify-center p-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                <FileCheck size={20} />
              </div>
              <span className="text-sm font-bold text-text">Ready Title Deeds</span>
              <span className="text-xs text-muted">Freehold & Leasehold</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <ShieldCheck size={20} />
              </div>
              <span className="text-sm font-bold text-text">100% Due Diligence</span>
              <span className="text-xs text-muted">Verified Ownership</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
                <Compass size={20} />
              </div>
              <span className="text-sm font-bold text-text">Beacons in Place</span>
              <span className="text-xs text-muted">Clearly Marked Plots</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
                <TrendingUp size={20} />
              </div>
              <span className="text-sm font-bold text-text">High Capital Growth</span>
              <span className="text-xs text-muted">Rapidly Developing Areas</span>
            </div>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text">Available Plots & Parcels</h2>
            <p className="text-sm text-muted">
              Showing <span className="font-semibold text-text">{filteredPlots.length}</span> verified plot listings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">Filter by Max Price:</span>
            <input
              type="number"
              placeholder="e.g. 5000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-36 px-2.5 py-1.5 text-xs bg-surface border border-border rounded-lg focus:ring-1 focus:ring-primary focus:outline-none"
            />
            {maxPrice && (
              <button
                onClick={() => setMaxPrice('')}
                className="text-xs text-primary hover:underline font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface rounded-xl border border-border overflow-hidden animate-pulse">
                <div className="h-48 bg-muted/20"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-muted/20 rounded w-3/4"></div>
                  <div className="h-4 bg-muted/20 rounded w-1/2"></div>
                  <div className="h-6 bg-muted/20 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPlots.length === 0 && (
          <div className="bg-surface rounded-2xl border border-border p-12 text-center max-w-lg mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <Compass size={32} />
            </div>
            <h3 className="text-lg font-bold text-text mb-2">No matching plots found</h3>
            <p className="text-sm text-muted mb-6">
              We couldn't find any plots matching your current criteria. Try adjusting your county, size, or price filter.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCounty('All Counties');
                setSelectedSize('all');
                setMaxPrice('');
              }}
              className="btn btn-primary"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Plot Cards Grid */}
        {!isLoading && filteredPlots.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlots.map((plot) => (
              <PropertyCard key={plot.id} property={plot} />
            ))}
          </div>
        )}
      </section>

      {/* Guide Section */}
      <section className="container mx-auto px-4 mt-8">
        <div className="bg-gradient-to-br from-primary/5 via-surface to-surface border border-primary/20 rounded-2xl p-6 sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 size={16} />
              <span>Buyer Protection & Transparency</span>
            </div>
            <h3 className="text-2xl font-bold text-text mb-4">
              Why Invest in Plots with {businessName}?
            </h3>
            <p className="text-sm sm:text-base text-muted leading-relaxed mb-6">
              Buying land in Kenya requires thorough due diligence. Every plot listed on our platform
              undergoes strict physical site inspection, beacon identification, and official Ministry
              of Lands registry verification before being made available to the public.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface p-4 rounded-xl border border-border">
                <h4 className="font-bold text-sm text-text mb-1">Free Site Visits</h4>
                <p className="text-xs text-muted">Weekly scheduled site viewings led by licensed real estate agents.</p>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-border">
                <h4 className="font-bold text-sm text-text mb-1">Flexible Payment Plans</h4>
                <p className="text-xs text-muted">Pay up to 12 months in installments or secure bank financing.</p>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-border">
                <h4 className="font-bold text-sm text-text mb-1">Direct Title Transfer</h4>
                <p className="text-xs text-muted">Prompt transfer of title deed into your name with legal assistance.</p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={`https://wa.me/${whatsappPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Hello, I would like to book a plot site visit.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Phone size={16} />
                <span>Book a Free Site Visit on WhatsApp</span>
              </a>
              <Link to="/contact" className="btn btn-outline">
                Contact Our Land Specialist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Plots;
