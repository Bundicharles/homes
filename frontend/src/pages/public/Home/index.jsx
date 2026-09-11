import { useQuery } from '@tanstack/react-query';
import { propertiesAPI, settingsAPI, pagesAPI } from '@/services/api';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, CheckCircle2, Sparkles, Trees } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import PropertySearch from '@/components/PropertySearch';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useSettings } from '@/context/SettingsContext';

const Home = () => {
  const { settings } = useSettings();

  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ['properties.latest'],
    queryFn: () => propertiesAPI.getLatest({ limit: 8 }),
  });

  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['properties.featured'],
    queryFn: () => propertiesAPI.getFeatured({ limit: 4 }),
  });

  const { data: plotsData, isLoading: plotsLoading } = useQuery({
    queryKey: ['properties.plots.home'],
    queryFn: () => propertiesAPI.getAll({ type: 'plot', limit: 4 }),
  });

  const { data: landData, isLoading: landLoading } = useQuery({
    queryKey: ['properties.land.home'],
    queryFn: () => propertiesAPI.getAll({ type: 'land', limit: 4 }),
  });

  const featuredProperties = featuredData?.success ? featuredData.data : [];
  const latestProperties = latestData?.success ? latestData.data : [];
  const plotProperties = Array.isArray(plotsData?.data?.data)
    ? plotsData.data.data
    : Array.isArray(plotsData?.data)
    ? plotsData.data
    : [];
  const landProperties = Array.isArray(landData?.data?.data)
    ? landData.data.data
    : Array.isArray(landData?.data)
    ? landData.data
    : [];

  return (
    <>
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-text mb-4">
              Find Your Perfect Home
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {settings.description || 'Discover professionally presented properties across Kenya.'}
            </p>
          </div>

          <PropertySearch />
        </div>
      </section>

      {/* Latest Properties Section (Top Priority) */}
      <section className="py-10 bg-surface/60 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                <Sparkles size={14} />
                <span>Newly Added</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text">Latest Properties</h2>
              <p className="text-sm text-muted mt-0.5">Explore our most recent property listings on the market</p>
            </div>
            <Link to="/properties" className="btn btn-outline text-xs sm:text-sm">
              View All
            </Link>
          </div>
          {latestLoading ? (
            <div className="text-center py-12">
              <p className="text-muted text-sm">Loading latest properties...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {latestProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text">Featured Properties</h2>
              <p className="text-sm text-muted mt-0.5">Handpicked premium properties selected for you</p>
            </div>
            <Link to="/properties?sort=featured" className="text-primary hover:text-primary-hover font-semibold text-sm">
              View All Featured
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProperties.slice(0, 4).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* Prime Plots Showcase Section */}
      <section className="py-12 bg-gradient-to-b from-surface/50 to-background border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold mb-2">
                <Compass size={14} />
                <span>Hot Plot Opportunities</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text">
                Prime Plots for Sale
              </h2>
              <p className="text-sm text-muted mt-1 max-w-xl">
                Ready-to-build residential 50×100 plots and commercial parcels with verified title deeds across Kenya.
              </p>
            </div>

            <Link
              to="/plots"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold text-sm group"
            >
              <span>Explore All Plots</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {plotProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plotProperties.slice(0, 4).map((plot) => (
                <PropertyCard key={plot.id} property={plot} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-surface rounded-xl border border-border">
              <p className="text-muted text-sm">Loading prime plot listings...</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-500" /> Freehold Title Deeds
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-500" /> Electricity & Water On-Site
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-emerald-500" /> Beacons Identified & Marked
              </span>
            </div>

            <Link
              to="/plots"
              className="btn btn-outline text-xs px-4 py-2"
            >
              View Full Plot Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Prime Land & Acreage Showcase Section */}
      <section className="py-12 bg-surface/40 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold mb-2">
                <Trees size={14} />
                <span>Acreage & Strategic Parcels</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text">
                Prime Land for Sale
              </h2>
              <p className="text-sm text-muted mt-1 max-w-xl">
                Expansive agricultural tracts, development parcels, and strategic land investments with verified registry records.
              </p>
            </div>

            <Link
              to="/properties?type=land"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold text-sm group"
            >
              <span>Explore All Land</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {landProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {landProperties.slice(0, 4).map((land) => (
                <PropertyCard key={land.id} property={land} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-surface rounded-xl border border-border">
              <p className="text-muted text-sm">Loading prime land listings...</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-amber-500" /> Agricultural & Commercial Zoning
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-amber-500" /> Verified Registry Records
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={14} className="text-amber-500" /> Flexible Acreage & Subdivision
              </span>
            </div>

            <Link
              to="/properties?type=land"
              className="btn btn-outline text-xs px-4 py-2"
            >
              View Full Land Catalog
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text text-center mb-8">Property Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {settings.property_types?.slice(0, 8).map((type) => (
              <Link
                key={type.slug}
                to={`/properties?type=${type.slug}`}
                className="card p-6 text-center hover:shadow-card transition-shadow group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-bold text-xl">{type.icon || type.name[0]}</span>
                </div>
                <h3 className="font-semibold text-text group-hover:text-primary transition-smooth">{type.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-text mb-4">
            Experience the Difference
          </h2>
          <p className="text-muted max-w-2xl mx-auto mb-8">
            With over 15 years in the Kenyan real estate market, we provide trusted, professional services for all your property needs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-2xl">15+</span>
              </div>
              <p className="font-semibold">Years Experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-2xl">500+</span>
              </div>
              <p className="font-semibold">Properties Sold</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-2xl">1000+</span>
              </div>
              <p className="font-semibold">Happy Clients</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text text-center mb-2">What Our Clients Say</h2>
          <p className="text-muted text-center mb-8">Real experiences from real people</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.testimonials?.slice(0, 3).map((testimonial, i) => (
              <div key={i} className="card p-6">
                <div className="flex text-accent mb-3">
                  {[...Array(testimonial.rating || 5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L20 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 4 9.27l4.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm italic mb-3">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted/20 rounded-full flex items-center justify-center">
                    {testimonial.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-surface">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-text mb-4">
                Ready to Find Your Dream Property?
              </h2>
              <p className="text-muted mb-6">
                Contact us today for a free consultation and start your journey to homeownership.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <WhatsAppButton message="Hello, I would like to inquire about properties." className="w-full sm:w-auto" />
                <Link to="/contact" className="btn btn-outline w-full sm:w-auto">
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <p className="text-sm text-muted">Support</p>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-primary">4.9</div>
                <p className="text-sm text-muted">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
