import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pagesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { Link } from 'react-router-dom';
import {
  Home,
  Search,
  TrendingUp,
  Shield,
  FileText,
  Users,
  MapPin,
  Calendar,
  Key,
  BarChart3,
} from 'lucide-react';

const Services = () => {
  const { settings } = useSettings();

  const businessName = settings.business_name || 'Prime Realty Kenya';
  const description = settings.description || 'Your trusted partner in Kenyan real estate.';

  const { data, isLoading, error } = useQuery({
    queryKey: ['page.services'],
    queryFn: () => pagesAPI.getBySlug('services'),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const pageContent = data?.success ? data.data : null;

  useEffect(() => {
    document.title = `Our Services | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [businessName, description]);

  const defaultServices = [
    {
      icon: Home,
      title: 'Property Sales',
      description: 'We help you buy or sell residential and commercial properties across Nairobi and Kenya.',
    },
    {
      icon: Search,
      title: 'Property Rentals',
      description: 'Find the perfect rental property or list your property for rent with our expert assistance.',
    },
    {
      icon: TrendingUp,
      title: 'Investment Advisory',
      description: 'Data-driven investment advice and portfolio management for real estate investors.',
    },
    {
      icon: Shield,
      title: 'Property Valuation',
      description: 'Accurate and comprehensive property valuations using the latest market data.',
    },
    {
      icon: FileText,
      title: 'Legal Documentation',
      description: 'End-to-end support for all legal documentation and conveyancing processes.',
    },
    {
      icon: Users,
      title: 'Property Management',
      description: 'Professional property management services for landlords and property owners.',
    },
    {
      icon: MapPin,
      title: 'Market Research',
      description: 'In-depth market research and reports to guide your real estate decisions.',
    },
    {
      icon: Key,
      title: 'Tenant Screening',
      description: 'Comprehensive tenant screening and background verification services.',
    },
  ];

  const services = pageContent?.services || defaultServices;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6 animate-pulse">
          <div className="h-12 bg-muted/20 rounded w-3/4" />
          <div className="h-4 bg-muted/20 rounded w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-muted/20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-text mb-4">
              Our Services
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {pageContent?.excerpt || description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon || Home;
              return (
                <div key={service.title} className="card p-6 hover:shadow-card transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-text mb-2">{service.title}</h3>
                  <p className="text-sm text-muted mb-4">{service.description}</p>
                  {service.link && (
                    <Link
                      to={service.link}
                      className="text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      Learn more
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 card p-8 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text mb-4">Ready to Get Started?</h2>
              <p className="text-muted mb-6 max-w-2xl mx-auto">
                Contact us today for a free consultation and let our experts help you achieve your real estate goals.
              </p>
              <Link to="/contact" className="btn btn-primary">
                Contact Us Today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
