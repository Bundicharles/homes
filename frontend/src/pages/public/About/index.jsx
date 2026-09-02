import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pagesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { Award, Users, Home, TrendingUp, Shield, MapPin } from 'lucide-react';

const About = () => {
  const { settings } = useSettings();

  const businessName = settings.business_name || 'Prime Realty Kenya';
  const description = settings.description || 'Your trusted partner in Kenyan real estate.';

  const { data, isLoading, error } = useQuery({
    queryKey: ['page.about'],
    queryFn: () => pagesAPI.getBySlug('about'),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const pageContent = data?.success ? data.data : null;

  useEffect(() => {
    document.title = `About Us | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [businessName, description]);

  const stats = [
    { icon: Home, label: 'Listings', value: settings.total_properties || '500+' },
    { icon: Users, label: 'Happy Clients', value: settings.happy_clients || '1,000+' },
    { icon: Award, label: 'Years Experience', value: settings.years_experience || '15+' },
    { icon: MapPin, label: 'Coverage', value: 'Nairobi & Kenya' },
  ];

  const values = [
    { icon: Shield, title: 'Trusted & Verified', description: 'All our listings are verified and we stand by every property we represent.' },
    { icon: TrendingUp, title: 'Market Expertise', description: 'Deep local knowledge of Nairobi and Kenyan property markets.' },
    { icon: Users, title: 'Client First', description: 'We prioritize your needs and provide personalized service.' },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6 animate-pulse">
          <div className="h-12 bg-muted/20 rounded w-3/4" />
          <div className="h-4 bg-muted/20 rounded w-1/2" />
          <div className="h-4 bg-muted/20 rounded w-full" />
          <div className="h-4 bg-muted/20 rounded w-full" />
          <div className="h-4 bg-muted/20 rounded w-3/4" />
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
              About {businessName}
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {pageContent?.excerpt || description}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <div key={stat.label} className="card p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="card p-8 mb-12">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html:
                  pageContent?.content ||
                  `<p>${businessName} is a full-service real estate company based in Nairobi, Kenya. We specialize in residential and commercial property sales, rentals, and investment advisory services. With over 15 years of experience in the Kenyan real estate market, we have built a reputation for integrity, professionalism, and exceptional client service.</p><p>Our team of licensed real estate agents provides personalized attention to every client, whether you are buying your first home, selling a property, or expanding your investment portfolio. We serve clients across Nairobi and surrounding areas including Westlands, Karen, Kilimani, Muthaiga, and other premium locations.</p>`,
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((item) => (
              <div key={item.title} className="card p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-text mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
