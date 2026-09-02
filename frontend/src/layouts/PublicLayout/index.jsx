import { Outlet } from 'react-router-dom';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingSocialButtons from '@/components/SocialFloatingButtons';
import { useSettings } from '@/context/SettingsContext';

const PublicLayout = () => {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <FloatingSocialButtons />
    </>
  );
};

export default PublicLayout;
