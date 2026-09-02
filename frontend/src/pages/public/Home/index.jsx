import { useQuery } from '@tanstack/react-query';
import { propertiesAPI, settingsAPI, pagesAPI } from '@/services/api';
import { Link } from 'react-router-dom';
import PropertyCard from '@/components/PropertyCard';
import PropertySearch from '@/components/PropertySearch';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useSettings } from '@/context/SettingsContext';
import PromotionCard from '@/components/PromotionCard';

const Home = () => {
  const { settings } = useSettings();

  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['properties.featured'],
    queryFn: () => propertiesAPI.getFeatured({ limit: 6 }),
  });

  const { data: latestData, isLoading: latestLoading } = useQuery({
    queryKey: ['properties.latest'],
    queryFn: () => propertiesAPI.getLatest({ limit: 6 }),
  });

  const featuredProperties = featuredData?.success ? featuredData.data : [];
  const latestProperties = latestData?.success ? latestData.data : [];

  return (
    <>
      <PromotionCard />

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

      <section className="py-8 bg-surface">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-text mb-6">Featured Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProperties.slice(0, 4).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/properties?sort=featured" className="btn btn-outline">
              View All Featured
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text">Latest Properties</h2>
            <Link to="/properties" className="text-primary hover:text-primary-hover font-medium">
              View all properties
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latestProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
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
