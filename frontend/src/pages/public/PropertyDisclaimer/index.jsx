import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pagesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { AlertTriangle, Calendar } from 'lucide-react';

const PropertyDisclaimer = () => {
  const { settings } = useSettings();

  const businessName = settings.business_name || 'Prime Realty Kenya';
  const description = settings.description || 'Your trusted partner in Kenyan real estate.';

  const { data, isLoading, error } = useQuery({
    queryKey: ['page.property-disclaimer'],
    queryFn: () => pagesAPI.getBySlug('property-disclaimer'),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const pageContent = data?.success ? data.data : null;

  useEffect(() => {
    document.title = `Property Disclaimer | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Official property disclaimer for ${businessName} listings.');
    }
  }, [businessName]);

  const defaultContent = `
    <h2>Property Information Disclaimer</h2>
    <p>The property listings and information provided on this website are for general informational purposes only. While we endeavor to ensure accuracy, ${businessName} makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the properties listed.</p>
    
    <h2>No Guarantee of Accuracy</h2>
    <p>All property details, including but not limited to prices, dimensions, availability, photographs, floor plans, and descriptions, are provided by the listing agent or property owner. We do not independently verify this information and disclaim all liability for any errors, omissions, or inaccuracies.</p>
    
    <h2>Third-Party Content</h2>
    <p>This website may contain links to third-party websites or services that are not owned or controlled by ${businessName}. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites.</p>
    
    <h2>Professional Advice</h2>
    <p>We strongly recommend that you independently verify all property information, including price, availability, and legal status, and seek independent legal, financial, and taxation advice before entering into any transaction.</p>
    
    <h2>Limitation of Liability</h2>
    <p>To the fullest extent permitted by law, ${businessName} shall not be liable for any direct, indirect, incidental, consequential, or exemplary damages arising out of or in connection with your use of this website or reliance on any property information provided herein.</p>
    
    <h2>Changes to This Disclaimer</h2>
    <p>We may update this disclaimer from time to time. The latest version will always be posted on this page with an updated "Last modified" date.</p>
  `;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-muted/20 rounded w-1/3" />
          <div className="h-4 bg-muted/20 rounded w-full" />
          <div className="h-4 bg-muted/20 rounded w-full" />
          <div className="h-4 bg-muted/20 rounded w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 lg:py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-8 h-8 text-warning" />
          <h1 className="text-3xl lg:text-4xl font-bold text-text">Property Disclaimer</h1>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted mb-8">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        <div className="card p-6 lg:p-8">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: pageContent?.content || defaultContent,
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default PropertyDisclaimer;
