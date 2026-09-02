import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Building,
  Users,
  MessageCircle,
  Calendar,
  Heart,
  Eye,
  Megaphone,
  AlertCircle,
} from 'lucide-react';
import { analyticsAPI } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { LoadingSkeleton, EmptyState } from '@/components/Modal';
import { formatNumber } from '@/utils';

const AdminDashboard = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const businessName = settings.business_name || 'Prime Realty Kenya';

  const [activeTab, setActiveTab] = useState('30d');

  useEffect(() => {
    document.title = `Admin Dashboard | ${businessName}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Admin dashboard for the real estate platform. View statistics, analytics, and recent activity.'
      );
    }
  }, [businessName]);

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['admin.dashboard.stats'],
    queryFn: () => analyticsAPI.getStats(),
    staleTime: 60000,
  });

  const {
    data: chartsData,
    isLoading: chartsLoading,
    error: chartsError,
  } = useQuery({
    queryKey: ['admin.analytics.charts', activeTab],
    queryFn: () =>
      analyticsAPI.getCharts({
        range: activeTab,
        field: 'created_at',
      }),
    staleTime: 60000,
  });

  const stats = statsData?.success ? statsData.data : null;
  const charts = chartsData?.success ? chartsData.data : null;

  const statCards = stats
    ? [
        {
          name: 'Total Properties',
          value: stats.total_properties,
          icon: Building,
          to: '/admin/properties',
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          name: 'Available',
          value: stats.available_properties,
          icon: Building,
          to: '/admin/properties?status=Available',
          color: 'text-success',
          bg: 'bg-success/10',
        },
        {
          name: 'Reserved',
          value: stats.reserved_properties,
          icon: Building,
          to: '/admin/properties?status=Reserved',
          color: 'text-warning',
          bg: 'bg-warning/10',
        },
        {
          name: 'Sold',
          value: stats.sold_properties,
          icon: Building,
          to: '/admin/properties?status=Sold',
          color: 'text-error',
          bg: 'bg-error/10',
        },
        {
          name: 'Customers',
          value: stats.total_customers,
          icon: Users,
          to: '/admin/customers',
          color: 'text-secondary',
          bg: 'bg-secondary/10',
        },
        {
          name: 'Inquiries',
          value: stats.total_inquiries,
          icon: MessageCircle,
          to: '/admin/messages',
          color: 'text-accent',
          bg: 'bg-accent/10',
        },
        {
          name: 'Unread Messages',
          value: stats.unread_messages,
          icon: MessageCircle,
          to: '/admin/messages?status=Unread',
          color: 'text-error',
          bg: 'bg-error/10',
        },
        {
          name: 'Viewing Requests',
          value: stats.viewing_requests,
          icon: Calendar,
          to: '/admin/viewing-requests',
          color: 'text-warning',
          bg: 'bg-warning/10',
        },
        {
          name: 'Favorites',
          value: stats.total_favorites,
          icon: Heart,
          to: '/admin/analytics',
          color: 'text-error',
          bg: 'bg-error/10',
        },
        {
          name: 'Property Views',
          value: stats.total_property_views,
          icon: Eye,
          to: '/admin/analytics',
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          name: 'Promotions',
          value: stats.total_promotions,
          icon: Megaphone,
          to: '/admin/promotions',
          color: 'text-secondary',
          bg: 'bg-secondary/10',
        },
      ]
  : [];

  const tabs = [
    { value: 'today', label: 'Today' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'custom', label: 'Custom' },
  ];

  const renderChart = (data, title, color) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-40 text-muted">
          No data available
        </div>
      );
    }

    const maxCount = Math.max(...data.map((d) => d.count), 1);

    return (
      <div className="h-56">
        <div className="flex items-end justify-between h-44 gap-1">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center flex-1 h-full justify-end"
            >
              <div
                className="w-full max-w-[30px] rounded-t-sm transition-all"
                style={{
                  height: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: color,
                  minHeight: '2px',
                }}
                title={`${item.day}: ${item.count}`}
              />
              <span className="text-xs text-muted mt-1 rotate-[-45deg] origin-top-left">
                {item.day ? new Date(item.day).getDate() : index + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (statsLoading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-muted/20 rounded w-3/4 mb-2" />
              <div className="h-8 bg-muted/20 rounded w-1/2" />
            </div>
          ))}
        </div>
        <LoadingSkeleton count={3} type="card" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error mb-4">Failed to load dashboard stats.</p>
        <button onClick={() => refetchStats()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text">
          Admin Dashboard
        </h1>
        <p className="text-muted mt-1">
          Overview of your real estate platform performance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.name}
              to={card.to}
              className="card p-4 hover:shadow-card transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted truncate">{card.name}</p>
                  <p className="text-2xl font-bold text-text">
                    {formatNumber(card.value)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text">Analytics Overview</h2>
          <div className="flex items-center gap-2 bg-surface-hover rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                  ${activeTab === tab.value
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-text hover:bg-surface'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {chartsLoading ? (
          <div className="space-y-6">
            <div className="h-56 bg-muted/20 rounded animate-pulse" />
            <div className="h-56 bg-muted/20 rounded animate-pulse" />
            <div className="h-56 bg-muted/20 rounded animate-pulse" />
          </div>
        ) : chartsError ? (
          <div className="text-center py-8 text-muted">
            Failed to load chart data
          </div>
        ) : charts ? (
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-medium text-muted mb-3">
                Property Views
              </h3>
              {renderChart(charts.property_views_chart, 'Property Views', '#2563eb')}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted mb-3">
                Inquiries
              </h3>
              {renderChart(charts.inquiries_chart, 'Inquiries', '#ea580c')}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted mb-3">
                Customers
              </h3>
              {renderChart(charts.customers_chart, 'Customers', '#7c3aed')}
            </div>
          </div>
        ) : (
          <EmptyState message="No chart data available." />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text mb-4">
            Property Status Distribution
          </h3>
          {charts?.property_status_distribution &&
          charts.property_status_distribution.length > 0 ? (
            <div className="space-y-3">
              {charts.property_status_distribution.map((item) => {
                const status = item.s || 'Unknown';
                const count = item.count;
                const total = stats.total_properties || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-text">
                      {status}
                    </div>
                    <div className="flex-1 h-6 bg-surface-hover rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-lg transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm font-medium text-text">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState message="No status data available." type="default" />
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text mb-4">
            Top Properties
          </h3>
          {!charts ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {charts.top_properties &&
              charts.top_properties.length > 0 ? (
                charts.top_properties.map((property, index) => (
                  <div
                    key={property.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover/50"
                  >
                    <span className="w-6 text-center font-bold text-muted">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-text line-clamp-1">
                        {property.name}
                      </p>
                      <p className="text-xs text-muted">
                        {property.views} views
                      </p>
                    </div>
                    <Link
                      to={`/admin/properties/edit/${property.id}`}
                      className="text-primary hover:text-primary-hover text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                ))
              ) : (
                <EmptyState message="No property data available." type="default" />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Most Favorited Properties
        </h3>
        {charts?.top_favorites && charts.top_favorites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                    Rank
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                    Property
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                    Favorites
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {charts.top_favorites.map((property, index) => (
                  <tr
                    key={property.id}
                    className="hover:bg-surface-hover/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-muted">{index + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-text line-clamp-1">
                        {property.name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-text">
                        {formatNumber(property.favorites)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No favorites data available." type="default" />
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Recent Activity
        </h3>
        {!charts ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
            ))}
          </div>
        ) : charts.top_inquired && charts.top_inquired.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                    Property
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                    Inquiries
                  </th>
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted uppercase">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {charts.top_inquired.map((property) => (
                  <tr
                    key={property.id}
                    className="hover:bg-surface-hover/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-text line-clamp-1">
                        {property.name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-text">
                        {formatNumber(property.inquiries)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {new Date().toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No recent activity available." type="default" />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
