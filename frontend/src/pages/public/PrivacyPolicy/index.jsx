import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pagesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { Shield, Calendar } from 'lucide-react';

const PrivacyPolicy = () => {
  const { settings } = useSettings();

  const businessName = settings.business_name || 'Hemaprin Homes';
  const description = settings.description || 'Your trusted partner in Kenyan real estate.';

  const { data, isLoading, error } = useQuery({
    queryKey: ['page.privacy-policy'],
    queryFn: () => pagesAPI.getBySlug('privacy-policy'),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const pageContent = data?.success ? data.data : null;

  useEffect(() => {
    document.title = `Privacy Policy | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Our commitment to protecting your personal data and privacy.');
    }
  }, [businessName]);

  const defaultContent = `
    <h2>Your Privacy</h2>
    <p>We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website or use our services.</p>
    
    <h2>Information We Collect</h2>
    <ul>
      <li><strong>Personal Information:</strong> Name, email address, phone number, and mailing address when you contact us or create an account.</li>
      <li><strong>Usage Data:</strong> IP address, browser type, pages visited, and session information.</li>
      <li><strong>Property Preferences:</strong> Properties you view, save as favorites, or express interest in.</li>
    </ul>
    
    <h2>How We Use Your Information</h2>
    <ul>
      <li>To provide and maintain our services</li>
      <li>To notify you of property listings and market updates (you may opt out at any time)</li>
      <li>To provide customer support and respond to your inquiries</li>
      <li>To improve our website and user experience</li>
    </ul>
    
    <h2>Legal Compliance</h2>
    <p>We comply with Kenya's Data Protection Act (2019) and other applicable data protection laws. Your data will not be sold, traded, or transferred to third parties without your consent, except as required by law.</p>
    
    <h2>Cookies</h2>
    <p>We use cookies to enhance your browsing experience and analyze website traffic. You can disable cookies through your browser settings, though this may affect functionality.</p>
    
    <h2>Data Security</h2>
    <p>We implement reasonable security measures including SSL encryption, secure servers, and access controls to protect your personal data.</p>
    
    <h2>Your Rights</h2>
    <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at the details below.</p>
    
    <h2>Changes to This Policy</h2>
    <p>We may update this Privacy Policy from time to time. Changes are effective immediately upon posting to this page.</p>
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
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl lg:text-4xl font-bold text-text">Privacy Policy</h1>
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

export default PrivacyPolicy;
