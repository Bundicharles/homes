import { Routes, Route } from 'react-router-dom';
import { useSettings } from '@/context/SettingsContext';
import PublicLayout from '@/layouts/PublicLayout';
import AdminLayout from '@/layouts/AdminLayout';
import CustomerLayout from '@/layouts/CustomerLayout';
import Home from '@/pages/public/Home';
import Properties from '@/pages/public/Properties';
import PropertyDetails from '@/pages/public/PropertyDetails';
import About from '@/pages/public/About';
import Services from '@/pages/public/Services';
import Contact from '@/pages/public/Contact';
import Gallery from '@/pages/public/Gallery';
import Favorites from '@/pages/public/Favorites';
import InterestedProperties from '@/pages/public/InterestedProperties';
import Login from '@/pages/public/Login';
import Register from '@/pages/public/Register';
import ForgotPassword from '@/pages/public/ForgotPassword';
import ResetPassword from '@/pages/public/ResetPassword';
import VerifyEmail from '@/pages/public/VerifyEmail';
import PrivacyPolicy from '@/pages/public/PrivacyPolicy';
import Terms from '@/pages/public/Terms';
import PropertyDisclaimer from '@/pages/public/PropertyDisclaimer';
import Unauthorized from '@/pages/public/Unauthorized';
import DynamicPage from '@/pages/public/DynamicPage';
import NotFound from '@/pages/public/NotFound';
import Plots from '@/pages/public/Plots';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminProperties from '@/pages/admin/Properties';
import AdminPlots from '@/pages/admin/Plots';
import AddProperty from '@/pages/admin/AddProperty';
import EditProperty from '@/pages/admin/EditProperty';
import AdminMessages from '@/pages/admin/Messages';
import MessageView from '@/pages/admin/MessageView';
import AdminCustomers from '@/pages/admin/Customers';
import CustomerView from '@/pages/admin/CustomerView';
import AdminAgents from '@/pages/admin/Agents';
import ViewingRequests from '@/pages/admin/ViewingRequests';
import PromotionManager from '@/pages/admin/PromotionManager';
import MediaLibrary from '@/pages/admin/MediaLibrary';
import AdminPages from '@/pages/admin/Pages';
import PageBuilder from '@/pages/admin/PageBuilder';
import Menus from '@/pages/admin/Menus';
import Testimonials from '@/pages/admin/Testimonials';
import FAQs from '@/pages/admin/FAQs';
import BrandingSettings from '@/pages/admin/BrandingSettings';
import FontSettings from '@/pages/admin/FontSettings';
import ColorSettings from '@/pages/admin/ColorSettings';
import ContactSettings from '@/pages/admin/ContactSettings';
import SocialSettings from '@/pages/admin/SocialSettings';
import SEOSettings from '@/pages/admin/SEOSettings';
import SecuritySettings from '@/pages/admin/SecuritySettings';
import UserManagement from '@/pages/admin/UserManagement';
import Roles from '@/pages/admin/Roles';
import AuditLogs from '@/pages/admin/AuditLogs';
import Analytics from '@/pages/admin/Analytics';
import Settings from '@/pages/admin/Settings';
import Documents from '@/pages/admin/Documents';
import EarbInfo from '@/pages/admin/EarbInfo';
import PropertyType from '@/pages/admin/PropertyType';
import PropertyValue from '@/pages/admin/PropertyValue';
import Verification from '@/pages/admin/Verification';
import AdminNotifications from '@/pages/admin/Notifications';
import AdminProfile from '@/pages/admin/Profile';
import CustomerDashboard from '@/pages/customer/Dashboard';
import CustomerProfile from '@/pages/customer/Profile';
import CustomerFavorites from '@/pages/customer/MyFavorites';
import CustomerInterested from '@/pages/customer/MyInterested';
import CustomerInquiries from '@/pages/customer/MyInquiries';
import CustomerViewings from '@/pages/customer/MyViewings';
import CustomerNotifications from '@/pages/customer/Notifications';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

function App() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      <Routes>
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="plots" element={<AdminPlots />} />
            <Route path="properties/add" element={<AddProperty />} />
            <Route path="properties/edit/:id" element={<EditProperty />} />
            <Route path="properties/types" element={<PropertyType />} />
            <Route path="properties/features" element={<PropertyValue />} />
            <Route path="properties/documents" element={<Documents />} />
            <Route path="properties/verification" element={<Verification />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="messages/:id" element={<MessageView />} />
            <Route path="viewing-requests" element={<ViewingRequests />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id" element={<CustomerView />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="promotions" element={<PromotionManager />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="pages/add" element={<PageBuilder />} />
            <Route path="pages/new" element={<PageBuilder />} />
            <Route path="pages/builder/:id" element={<PageBuilder />} />
            <Route path="menus" element={<Menus />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="faqs" element={<FAQs />} />
            <Route path="branding" element={<BrandingSettings />} />
            <Route path="fonts" element={<FontSettings />} />
            <Route path="colors" element={<ColorSettings />} />
            <Route path="contact" element={<ContactSettings />} />
            <Route path="social" element={<SocialSettings />} />
            <Route path="seo" element={<SEOSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="roles" element={<Roles />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
            <Route path="earb" element={<EarbInfo />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<CustomerLayout />}>
            <Route index element={<CustomerDashboard />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="favorites" element={<CustomerFavorites />} />
            <Route path="interested" element={<CustomerInterested />} />
            <Route path="inquiries" element={<CustomerInquiries />} />
            <Route path="viewings" element={<CustomerViewings />} />
            <Route path="notifications" element={<CustomerNotifications />} />
          </Route>
        </Route>

        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="properties" element={<Properties />} />
          <Route path="plots" element={<Plots />} />
          <Route path="properties/:slug" element={<PropertyDetails />} />
          <Route path="about" element={<About />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="interested-properties" element={<InterestedProperties />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="disclaimer" element={<PropertyDisclaimer />} />
          <Route path=":pageSlug" element={<DynamicPage />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
