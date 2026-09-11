import { Outlet } from 'react-router-dom';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingSocialButtons from '@/components/SocialFloatingButtons';
import PromotionCard from '@/components/PromotionCard';
import { PWAInstallModal, PWAUpdateNotification, PWAOfflineBanner } from '@/components/PWAInstallPrompt';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <PWAOfflineBanner />
      <AnnouncementBar />
      <Header />
      <PromotionCard />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
      <FloatingSocialButtons />
      <PWAInstallModal />
      <PWAUpdateNotification />
    </div>
  );
};

export default PublicLayout;
