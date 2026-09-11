import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pagesAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton } from '@/components/Modal';

const DynamicPage = () => {
  const { pageSlug } = useParams();
  const { settings } = useSettings();
  const businessName = settings.business_name || 'Hemaprin Homes';

  const { data, isLoading, error } = useQuery({
    queryKey: ['page', pageSlug],
    queryFn: () => pagesAPI.getBySlug(pageSlug),
    retry: false,
  });

  const page = data?.success ? data.data : null;

  useEffect(() => {
    if (page) {
      document.title = `${page.title} | ${businessName}`;
    }
  }, [page, businessName]);

  if (isLoading) return <LoadingSkeleton count={3} type="card" />;

  if (error || !page) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-muted">Page not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl lg:text-4xl font-bold text-text mb-6">{page.title}</h1>
      <div
        className="prose max-w-none text-text"
        dangerouslySetInnerHTML={{ __html: page.content || '' }}
      />
    </div>
  );
};

export default DynamicPage;
