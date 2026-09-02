import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pagesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { FileText, Calendar } from 'lucide-react';

const Terms = () => {
  const { settings } = useSettings();

  const businessName = settings.business_name || 'Prime Realty Kenya';
  const description = settings.description || 'Your trusted partner in Kenyan real estate.';

  const { data, isLoading, error } = useQuery({
    queryKey: ['page.terms'],
    queryFn: () => pagesAPI.getBySlug('terms'),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const pageContent = data?.success ? data.data : null;

  useEffect(() => {
    document.title = `Terms of Service | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Terms and conditions of use for our real estate platform.');
    }
  }, [businessName]);

  const defaultContent = `
    <h2>Terms of Use</h2>
    <p>These Terms of Service govern your access to and use of the services provided by ${businessName}. By accessing our website or using our services, you agree to be bound by these terms.</p>
    
    <h2>Use of Our Services</h2>
    <p>You may use our services to browse property listings, contact agents, and submit inquiries. You agree to use our services only for lawful purposes and in accordance with these Terms.</p>
    
    <h2>Property Listings</h2>
    <p>All property information, including prices, availability, and details, is provided by property owners or listing agents. While we strive for accuracy, we do not warrant the completeness or accuracy of any listing information.</p>
    
    <h2>User Accounts</h2>
    <p>To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
    
    <h2>Intellectual Property</h2>
    <p>All content on this website, including text, graphics, logos, images, and software, is the property of ${businessName} and protected by Kenyan and international copyright laws.</p>
    
    <h2>Limitation of Liability</h2>
    <p>To the fullest extent permitted by law, ${businessName} shall not be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of our services.</p>
    
    <h2>Indemnification</h2>
    <p>You agree to indemnify and hold harmless ${businessName} and its affiliates from and against any claims, liabilities, damages, losses, or expenses arising out of your violation of these Terms.</p>
    
    <h2>Governing Law</h2>
    <p>These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.</p>
    
    <h2>Contact Us</h2>
    <p>If you have any questions about these Terms, please contact us at ${settings.contact_email || 'info@realestate.co.ke'}.</p>
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
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl lg:text-4xl font-bold text-text">Terms of Service</h1>
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

export default Terms;
